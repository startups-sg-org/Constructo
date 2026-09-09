import type { Obra } from '@features/map'
import type { IndicatorStatus, WorkIndicators } from './types'

function formatDate(date: string) {
  const [year, month, day] = date.split('-')
  return day && month && year ? `${day}/${month}/${year}` : date
}

function getIndicatorStatus(status: Obra['status']): IndicatorStatus {
  if (status === 'Concluída') return 'positive'
  if (status === 'Paralisada') return 'critical'
  return 'neutral'
}

export function createIndicatorsFromWork(obra: Obra): WorkIndicators {
  const physicalProgress = obra.progresso 
  const plannedProgress = obra.progressoPlanejado ?? physicalProgress
  const difference = physicalProgress - plannedProgress
  const scheduleStatus: IndicatorStatus = difference >= 0 ? 'positive' : 'attention'
  const differenceLabel = difference === 0
    ? 'Em linha com o planejado'
    : `${difference > 0 ? '+' : ''}${difference.toLocaleString('pt-BR')} p.p. do planejado`

  return {
    workId: obra.id,
    workName: obra.nome,
    updatedAt: formatDate(obra.ultimaAtualizacao ?? obra.dataInicio),
    physicalProgress: {
      label: 'Progresso',
      value: physicalProgress,
      unit: '%',
      description: 'Avanço atual da obra',
      status: physicalProgress >= plannedProgress ? 'positive' : 'attention',
    },
    plannedProgress: {
      label: 'Planejado',
      value: plannedProgress,
      unit: '%',
      description: 'Avanço previsto até a atualização',
      status: scheduleStatus,
      trend: differenceLabel,
    },
    currentStage: {
      label: 'Etapa atual',
      value: obra.etapaAtual ?? 'Não informada',
      description: obra.tipo,
      status: 'neutral',
    },
    workStatus: {
      label: 'Situação',
      value: obra.status,
      description: 'Condição atual da obra',
      status: getIndicatorStatus(obra.status),
    },
  }
}

