import type { IndicatorMetric } from './types'

interface IndicatorCardProps {
  metric: IndicatorMetric
}

function IndicatorCard({ metric }: IndicatorCardProps) {
  return (
    <article className={`indicator-card indicator-card--${metric.status ?? 'neutral'}`}>
      <div className="indicator-card__header">
        <span className="indicator-card__label">{metric.label}</span>
        {metric.trend && <span className="indicator-card__trend">{metric.trend}</span>}
      </div>
      <div className="indicator-card__value">
        {metric.value}
        {metric.unit && <span className="indicator-card__unit">{metric.unit}</span>}
      </div>
      {metric.description && <p className="indicator-card__description">{metric.description}</p>}
      {metric.evidence && (
        <a className="indicator-card__evidence" href={metric.evidence.href}>
          {metric.evidence.label}
        </a>
      )}
    </article>
  )
}

export function IndicatorCardLoad({ metric }: IndicatorCardProps) {
  let rawValue = typeof metric.value === 'number'
    ? metric.value
    : parseFloat(metric.value) || 0
  if (rawValue > 100) {
    rawValue /= 100
  }
  const progressPercent = rawValue
  return (    
    <article className={`indicator-card-load indicator-card-load--${metric.status ?? 'neutral'}`}>
      <div className = "indicador-card__header-load">
        <span className="indicador-card__label-load">{metric.label}</span>

        {/* Container da Barra + Porcentagem */}
        <div className="indicator-card-load__content">
          {/* Trilho da barra de progresso */}
          <div className="indicator-card-load__track">
            {/* Preenchimento dinâmico via atributo style */}
            <div 
              className="indicator-card-load__fill" 
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Texto do valor/porcentagem */}
          <span className="indicator-card-load__value">
            {progressPercent}{metric.value ?? '%'}
          </span>
        </div>
        
      </div>
    </article>
  )
}

export default IndicatorCard  
