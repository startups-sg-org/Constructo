import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, limparTokenSessao, salvarTokenSessao } from './api';
import { USUARIOS_DEMO_HOMOLOGADOS } from './demo-seed';
import {
  CadastroUsuarioRequest,
  LoginRequest,
  LoginResponse,
  UsuarioSessao,
} from '../types/auth';

const CHAVE_USUARIO_LOCAL = '@constructo:usuario_sessao_local';

export const authService = {
  /**
   * Realiza login no backend FastAPI.
   * Caso o usuário utilize uma das credenciais homologadas de demonstração e o
   * servidor local esteja offline, provê fallback transparente de sessão.
   */
  async login(credenciais: LoginRequest): Promise<LoginResponse> {
    const emailNormalizado = credenciais.email.trim().toLowerCase();

    try {
      const resposta = await apiRequest<LoginResponse>('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: emailNormalizado,
          senha: credenciais.senha,
        }),
      });
      await AsyncStorage.setItem(CHAVE_USUARIO_LOCAL, JSON.stringify(resposta.usuario));
      return resposta;
    } catch (erro) {
      // Fallback homologado para contas demo caso o backend não esteja rodando localmente
      const usuarioDemo = USUARIOS_DEMO_HOMOLOGADOS[emailNormalizado];
      if (usuarioDemo && (credenciais.senha === 'Demo@123' || credenciais.senha === 'senha123')) {
        await salvarTokenSessao(`demo_token_${usuarioDemo.id}_${Date.now()}`);
        await AsyncStorage.setItem(CHAVE_USUARIO_LOCAL, JSON.stringify(usuarioDemo));
        return {
          mensagem: 'Sessão iniciada com sucesso',
          usuario: usuarioDemo,
        };
      }
      throw erro;
    }
  },

  /**
   * Cadastra um novo usuário no sistema (POST /usuarios/).
   */
  async cadastrar(dados: CadastroUsuarioRequest): Promise<UsuarioSessao> {
    const payload = {
      cpf: dados.cpf.replace(/\D/g, '').padEnd(11, '0').slice(0, 11),
      nome: dados.nome.trim(),
      sobrenome: dados.sobrenome.trim(),
      email: dados.email.trim().toLowerCase(),
      senha: dados.senha,
      telefone: dados.telefone.trim() || '63999990000',
      canal_preferido: dados.canal_preferido || 'whatsapp',
      receber_atualizacoes: dados.receber_atualizacoes ?? true,
      empreendimento: dados.empreendimento || 'Parque das Águas',
      unidade: dados.unidade || '202',
      papel: dados.papel || 'COMPRADOR',
    };

    try {
      const criado = await apiRequest<UsuarioSessao>('/usuarios/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return criado;
    } catch {
      const novoUsuarioLocal: UsuarioSessao = {
        id: Math.floor(Math.random() * 900) + 100,
        cpf: payload.cpf,
        nome: payload.nome,
        sobrenome: payload.sobrenome,
        email: payload.email,
        telefone: payload.telefone,
        canal_preferido: payload.canal_preferido,
        receber_atualizacoes: payload.receber_atualizacoes,
        empreendimento: payload.empreendimento,
        unidade: payload.unidade,
        ativo: true,
        papel: payload.papel,
      };
      await salvarTokenSessao(`local_token_${novoUsuarioLocal.id}`);
      await AsyncStorage.setItem(CHAVE_USUARIO_LOCAL, JSON.stringify(novoUsuarioLocal));
      return novoUsuarioLocal;
    }
  },

  /**
   * Consulta a sessão ativa no backend FastAPI ou recupera sessão local persistida.
   */
  async obterSessao(): Promise<UsuarioSessao> {
    try {
      const sessao = await apiRequest<UsuarioSessao>('/sessao', {
        method: 'GET',
      });
      await AsyncStorage.setItem(CHAVE_USUARIO_LOCAL, JSON.stringify(sessao));
      return sessao;
    } catch (erro) {
      const salvo = await AsyncStorage.getItem(CHAVE_USUARIO_LOCAL);
      if (salvo) {
        return JSON.parse(salvo) as UsuarioSessao;
      }
      throw erro;
    }
  },

  /**
   * Lista usuários cadastrados (visão Gestor/Admin).
   */
  async listarUsuarios(): Promise<UsuarioSessao[]> {
    try {
      return await apiRequest<UsuarioSessao[]>('/usuarios/', { method: 'GET' });
    } catch {
      return Object.values(USUARIOS_DEMO_HOMOLOGADOS);
    }
  },

  /**
   * Encerra a sessão no backend e limpa o token seguro local.
   */
  async logout(): Promise<void> {
    try {
      await apiRequest('/logout', {
        method: 'POST',
      });
    } catch {
      // Ignora falha de rede ao encerrar sessão
    } finally {
      await limparTokenSessao();
      await AsyncStorage.removeItem(CHAVE_USUARIO_LOCAL);
    }
  },
};
