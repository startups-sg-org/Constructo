export type IndicatorStatus = 'positive' | 'neutral' | 'attention' | 'critical'

export type IndicatorDataState = 'loading' | 'error' | 'empty' | 'ready'

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

export interface WorkIndicators {
  workId: string
  workName: string
  updatedAt: string
  physicalProgress: IndicatorMetric
  plannedProgress: IndicatorMetric
  currentStage: IndicatorMetric
  workStatus: IndicatorMetric
}
