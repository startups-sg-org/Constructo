import { IndicatorCard } from './IndicatorCard'
import type { IndicatorDataState, WorkIndicators } from '../types'
import './IndicatorsPanel.css'

interface IndicatorsPanelProps {
  data?: WorkIndicators
  state?: IndicatorDataState
  errorMessage?: string
}

function normalizePercentage(value: number | string) {
  const parsedValue = typeof value === 'number' ? value : Number.parseFloat(value)
  if (Number.isNaN(parsedValue)) return 0
  return Math.min(100, Math.max(0, parsedValue))
}

export function IndicatorsPanel({ data, state = 'ready', errorMessage }: IndicatorsPanelProps) {
  if (state === 'loading') {
    return <p className='indicators-state'>Carregando indicadores...</p>
  }

  if (state === 'error') {
    return (
      <p className='indicators-state indicators-state--error'>
        {errorMessage ?? 'Não foi possível carregar os indicadores.'}
      </p>
    )
  }

  if (state === 'empty' || !data) {
    return <p className='indicators-state'>Nenhum indicador disponível.</p>
  }

  const metrics = [
    data.physicalProgress,
    data.plannedProgress,
    data.currentStage,
    data.workStatus,
  ]
  const progress = normalizePercentage(data.physicalProgress.value)

  return (
    <section className='indicators-panel' aria-label='Indicadores de acompanhamento'>
      <div className='indicators-panel__header'>
        <div>
          <span>Indicadores da obra selecionada</span>
          <h2>{data.workName}</h2>
        </div>
        <div className='indicators-panel__actions'>
          <small>Atualizado em {data.updatedAt}</small>
          <button
            type='button'
            aria-label='Atualizar indicadores'
            title='Atualização indisponível neste protótipo'
            disabled
          >
            <svg aria-hidden='true' viewBox='0 0 24 24' fill='none'>
              <path d='M20 6v5h-5M4 18v-5h5M6.1 9a7 7 0 0 1 11.5-2.4L20 9M4 15l2.4 2.4A7 7 0 0 0 17.9 15' />
            </svg>
          </button>
        </div>
      </div>

      <div className='indicators-grid'>
        {metrics.map((metric) => <IndicatorCard key={metric.label} metric={metric} />)}
      </div>

      <article className='indicator-progress'>
        <div>
          <span className='indicator-progress__eyebrow'>Etapa atual</span>
          <strong>{data.currentStage.value}</strong>
        </div>
        <span className='indicator-progress__value'>{progress}%</span>
        <div
          className='indicator-progress__track'
          role='progressbar'
          aria-label='Progresso físico da obra'
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </article>
    </section>
  )
}
