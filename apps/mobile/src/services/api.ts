import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CHAVE_COOKIE_SESSAO = 'constructo_session_token';

/**
 * Resolve dinamicamente a URL base do backend de acordo com a plataforma:
 * - Emulador Android: 10.0.2.2:8000
 * - Simulador iOS / Desktop / Web: localhost:8000
 * - Variável de ambiente configurada: EXPO_PUBLIC_API_URL
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }

  return 'http://localhost:8000';
}

export const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data: unknown;

  constructor(message: string, status: number, statusText: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Armazena o token da sessão no armazenamento seguro do dispositivo.
 */
export async function salvarTokenSessao(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(CHAVE_COOKIE_SESSAO, token);
      }
    } else {
      await SecureStore.setItemAsync(CHAVE_COOKIE_SESSAO, token);
    }
  } catch (erro) {
    console.warn('[Constructo API] Erro ao persistir token de sessão:', erro);
  }
}

/**
 * Recupera o token de sessão ativo.
 */
export async function obterTokenSessao(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? window.localStorage.getItem(CHAVE_COOKIE_SESSAO) : null;
    }
    return await SecureStore.getItemAsync(CHAVE_COOKIE_SESSAO);
  } catch (erro) {
    console.warn('[Constructo API] Erro ao carregar token de sessão:', erro);
    return null;
  }
}

/**
 * Remove o token de sessão (logout).
 */
export async function limparTokenSessao(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(CHAVE_COOKIE_SESSAO);
      }
    } else {
      await SecureStore.deleteItemAsync(CHAVE_COOKIE_SESSAO);
    }
  } catch (erro) {
    console.warn('[Constructo API] Erro ao remover token de sessão:', erro);
  }
}

/**
 * Extrai o valor do cookie session_token a partir dos headers de resposta Set-Cookie.
 */
export function extrairSessionTokenDeHeaders(headers: Headers): string | null {
  const setCookie = headers.get('set-cookie') || headers.get('Set-Cookie');
  if (!setCookie) return null;

  const match = setCookie.match(/session_token=([^;]+)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

function extrairMensagemErro(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.trim()) return data;

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === 'string' && obj.detail.trim()) return obj.detail;
    if (typeof obj.message === 'string' && obj.message.trim()) return obj.message;
    if (Array.isArray(obj.detail) && obj.detail.length > 0) {
      const primeiro = obj.detail[0] as Record<string, unknown>;
      if (typeof primeiro?.msg === 'string') return primeiro.msg;
    }
  }

  return fallback;
}

/**
 * Cliente HTTP unificado para chamadas REST ao backend FastAPI do Constructo.
 * Gerencia automaticamente cookies de autenticação (Nativo + Web) e FormData.
 */
export async function apiRequest<T>(
  caminho: string,
  init: RequestInit = {}
): Promise<T> {
  const urlCompleta = caminho.startsWith('http')
    ? caminho
    : `${API_BASE_URL}${caminho.startsWith('/') ? caminho : `/${caminho}`}`;

  const headers = new Headers(init.headers);

  // Injeta automaticamente o cookie session_token no ambiente nativo
  const token = await obterTokenSessao();
  if (token && Platform.OS !== 'web' && !headers.has('Cookie')) {
    headers.set('Cookie', `session_token=${token}`);
  }

  // Se não for multipart/form-data e tiver corpo, define Content-Type JSON
  const isFormData = init.body instanceof FormData;
  if (init.body !== undefined && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;

  try {
    response = await fetch(urlCompleta, {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch (erro) {
    throw new ApiError(
      'Não foi possível conectar ao servidor da obra. Verifique sua conexão.',
      0,
      'Network Error',
      erro
    );
  }

  // Se o servidor enviou um novo Set-Cookie, salva imediatamente
  const novoToken = extrairSessionTokenDeHeaders(response.headers);
  if (novoToken) {
    await salvarTokenSessao(novoToken);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  let data: unknown;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(
      extrairMensagemErro(data, `Falha na requisição (${response.status})`),
      response.status,
      response.statusText,
      data
    );
  }

  return data as T;
}
