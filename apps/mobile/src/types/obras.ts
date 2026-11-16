export type StatusEmpreendimento = 'PLANEJADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'INATIVO';
export type TipoLocal = 'TORRE' | 'BLOCO' | 'PAVIMENTO' | 'UNIDADE';
export type StatusMarco = 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'CONCLUIDO';
export type StatusContrato = 'RASCUNHO' | 'ATIVO' | 'SUSPENSO' | 'CONCLUIDO' | 'CANCELADO';

export interface Empreendimento {
  id: number;
  nome: string;
  descricao: string | null;
  endereco: string | null;
  status: StatusEmpreendimento;
  criado_em: string;
  atualizado_em: string;
}

export interface EmpreendimentoCriarPayload {
  nome: string;
  descricao?: string | null;
  endereco?: string | null;
  status?: StatusEmpreendimento;
}

export interface LocalObra {
  id: number;
  empreendimento_id: number;
  parent_id: number | null;
  nome: string;
  tipo: TipoLocal;
  ordem: number;
}

export interface LocalHierarquia extends LocalObra {
  filhos: LocalHierarquia[];
}

export interface Taxonomia {
  id: number;
  empreendimento_id: number | null;
  origem_taxonomia_id: number | null;
  nome: string;
  descricao: string | null;
  is_padrao: boolean;
}

export interface Etapa {
  id: number;
  taxonomia_id: number;
  parent_id: number | null;
  nome: string;
  descricao_tecnica: string | null;
  descricao_cliente: string | null;
  ordem: number;
}

export interface Marco {
  id: number;
  etapa_id: number;
  nome: string;
  descricao_tecnica: string | null;
  descricao_cliente: string | null;
  ordem: number;
  status?: StatusMarco;
}

export interface ProgressoEtapaItem {
  etapa_id: number;
  nome: string;
  percentual: number;
  ordem?: number;
  total?: number;
  concluidos?: number;
  em_andamento?: number;
  nao_iniciados?: number;
  status?: StatusMarco;
}

export interface ProgressoEmpreendimento {
  empreendimento_id: number;
  percentual: number;
  total?: number;
  concluidos?: number;
  em_andamento?: number;
  nao_iniciados?: number;
  status?: StatusMarco;
  etapas: ProgressoEtapaItem[];
  macroetapas?: ProgressoEtapaItem[];
}

export interface ContratoObra {
  id: string;
  empreendimento_id: number;
  numero_contrato: string;
  objeto: string;
  fornecedor_nome: string;
  fornecedor_cnpj: string;
  valor_total: number;
  status: StatusContrato;
  data_inicio: string;
  data_fim_prevista: string;
  percentual_medido: number;
}
