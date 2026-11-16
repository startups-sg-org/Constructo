import { StatusValidacaoEvidencia } from './evidencias';

export interface ContextoEtapaFeed {
  id: number;
  nome: string;
  icone: 'foundation' | 'structure' | 'masonry' | 'finishing' | 'default';
}

export interface ImpactoProgressoFeed {
  deltaPercentual: number; // Ex: 4.5 (+4.5% no progresso total)
  progressoAnterior: number; // Ex: 34.0
  progressoAcumuladoAteAqui: number; // Ex: 38.5 (38.5% no momento deste post)
}

export interface BadgeSocialFeed {
  texto: string; // Ex: "+4.5% no Progresso Total"
  variante: 'destaque' | 'primaria';
}

export interface PostagemFeedSocial {
  id: number;
  evidenciaId: number;
  imagemUrl: string;
  dataExibicao: string; // Ex: "Hoje às 15:30" ou "14 Out 2026"
  timestampCaptura: number;
  legenda: string;
  autorNome: string;
  autorCargo: string;
  autorCrea: string;
  localNome: string;
  marcoId: number;
  marcoNome: string;
  proximoPasso: string;
  statusValidacao: StatusValidacaoEvidencia;
  etapa: ContextoEtapaFeed;
  impactoProgresso: ImpactoProgressoFeed;
  badge: BadgeSocialFeed;
}

export interface ResumoObraCliente {
  empreendimentoId: number;
  nomeEmpreendimento: string;
  progressoGlobalAtual: number;
  totalEvidencias: number;
  ultimaAtualizacaoEm: string;
}
