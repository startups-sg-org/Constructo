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

export default IndicatorCard
