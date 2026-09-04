export type IndicatorStatus = 'positive' | 'neutral' | 'attention' | 'critical'

export type DataState = 'loading' | 'error' | 'empty' | 'ready'

export interface IndicatorEvidence {
  label: string
  href: string
}

export interface IndicatorMetric {
  label: string
  value: number | string
  unit?: string
  description?: string
  status?: IndicatorStatus
  trend?: string
  evidence?: IndicatorEvidence
}

export interface ObraIndicadores {
  obraId: string
  obraNome: string
  atualizacaoEm: string
  progressoFisico: IndicatorMetric
  progressoPlanejado: IndicatorMetric
  etapaAtual: IndicatorMetric
  situacaoObra: IndicatorMetric
}
