import type { ObraIndicadores } from './types'

export const indicadoresMock: ObraIndicadores = {
  obraId: 'obra-001',
  obraNome: 'Residencial Comodoro',
  atualizacaoEm: '04/09/2026',
  progressoFisico: {
    label: 'Progresso físico',
    value: 68,
    unit: '%',
    description: 'Avanço executado da obra',
    status: 'positive',
    trend: '+4,2% no período',
  },
  progressoPlanejado: {
    label: 'Progresso planejado',
    value: 72,
    unit: '%',
    description: 'Avanço previsto até a data',
    status: 'attention',
    trend: '-4,0 p.p. do planejado',
  },
  etapaAtual: {
    label: 'Etapa atual',
    value: 'Estrutura',
    description: 'Execução de pilares e lajes',
    status: 'neutral',
  },
  situacaoObra: {
    label: 'Situação da obra',
    value: 'Em andamento',
    description: 'Sem impedimentos registrados',
    status: 'positive',
  },
}
