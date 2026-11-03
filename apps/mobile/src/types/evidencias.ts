import { TipoLocal } from './obras';

export type StatusValidacaoEvidencia = 'PENDENTE' | 'VALIDA' | 'INVALIDA';

export interface LocalObraResumoBackend {
  id: number;
  nome: string;
  tipo: TipoLocal;
  parent_id: number | null;
}

export interface MarcoResumoBackend {
  id: number;
  nome: string;
  descricao_tecnica: string | null;
}

export interface UsuarioResumoBackend {
  id: number;
  nome: string;
  email: string;
  papel: string;
}

export interface EvidenciaBackend {
  id: number;
  empreendimento_id?: number;
  local_obra_id: number;
  marco_id: number;
  item_protocolo_id: number | null;
  arquivo_evidencia_id?: number | null;
  arquivo_url: string;
  descricao_tecnica: string | null;
  capturado_em: string;
  capturado_por: number;
  criado_em: string;
  atualizado_em: string;
  // Objetos aninhados retornados pelo backend FastAPI (schemas.py -> EvidenciaResponse)
  local_obra?: LocalObraResumoBackend;
  marco?: MarcoResumoBackend;
  responsavel?: UsuarioResumoBackend;
  // Campos de ciclo de auditoria e qualidade (#227)
  status_validacao?: StatusValidacaoEvidencia;
  motivo_invalidacao?: string | null;
  validado_em?: string | null;
  validado_por_nome?: string | null;
}

export interface ItemProtocoloEvidencia {
  id: number;
  protocolo_id: number;
  nome: string;
  descricao: string | null;
  obrigatorio: boolean;
  ordem: number;
}

export interface ProtocoloEvidencia {
  id: number;
  marco_id: number;
  nome: string;
  descricao: string | null;
  quantidade_minima: number;
  itens: ItemProtocoloEvidencia[];
}

export interface EnvioEvidenciaPayload {
  arquivoUri: string;
  arquivoNome: string;
  arquivoTipo: string;
  empreendimentoId: number;
  localObraId: number;
  marcoId: number;
  descricaoTecnica?: string;
  capturadoEm?: string;
  itemProtocoloId?: number;
  deltaEstimado?: number;
}

export interface FormularioEnvioRapidoState {
  fotoUri: string | null;
  empreendimentoId: number | null;
  etapaIdSelecionada: number | null;
  marcoIdResolvido: number | null;
  localObraIdResolvido: number | null;
  deltaEstimado: number;
  legenda: string;
  salvando: boolean;
  offline: boolean;
}
