import { EnvioEvidenciaPayload } from './evidencias';

export interface ItemFilaOffline {
  id: string; // UUID ou timestamp
  criadoEm: string;
  tentativas: number;
  erroUltimaTentativa?: string;
  payload: EnvioEvidenciaPayload;
}

export interface StatusSincronizacaoOffline {
  itensPendentes: number;
  sincronizando: boolean;
  ultimoErro?: string;
}
