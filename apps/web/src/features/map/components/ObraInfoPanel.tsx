import type { ObraProperties } from '../types/obra'
import './ObraInfoPanel.css'

export interface ObraInfoPanelProps {
  obra: ObraProperties | null
  onClose: () => void
  onViewDetails?: (obra: ObraProperties) => void
  onViewDocuments?: (obra: ObraProperties) => void
}

export default function ObraInfoPanel({
  obra,
  onClose,
  onViewDetails,
  onViewDocuments,
}: ObraInfoPanelProps) {
  if (!obra) return null

  const isEmAndamento = obra.status === 'Em andamento'
  const badgeClass = isEmAndamento ? 'obra-badge-status-andamento' : 'obra-badge-status-planejada'

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(obra)
    } else {
      alert(`[Ação Demonstrativa] Ver detalhes da obra: ${obra.nome} (${obra.id})`)
    }
  }

  const handleViewDocuments = () => {
    if (onViewDocuments) {
      onViewDocuments(obra)
    } else {
      alert(`[Ação Demonstrativa] Ver documentos da obra: ${obra.nome} (${obra.id})`)
    }
  }

  return (
    <aside className="obra-info-panel" aria-label="Painel de informações da obra">
      <div className="obra-panel-header">
        <div className="obra-panel-title-container">
          <span className="obra-panel-id">{obra.id}</span>
          <h2 className="obra-panel-title">{obra.nome}</h2>
        </div>
        <button
          type="button"
          className="obra-panel-close-btn"
          onClick={onClose}
          aria-label="Fechar painel de informações"
        >
          &times;
        </button>
      </div>

      <div className="obra-panel-meta">
        <span className={`obra-badge ${badgeClass}`}>{obra.status}</span>
        <span className="obra-badge obra-badge-type">{obra.tipo}</span>
        <span className="obra-location">{obra.municipio}, {obra.uf}</span>
      </div>

      <div className="obra-panel-section">
        <h3 className="obra-section-title">Progresso da Obra</h3>

        <div className="obra-progress-item">
          <div className="obra-progress-label">
            <span>Progresso Físico</span>
            <strong>{obra.progressoFisico}%</strong>
          </div>
          <div className="obra-progress-bar-bg" role="progressbar" aria-valuenow={obra.progressoFisico} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso Físico">
            <div
              className="obra-progress-bar-fill obra-progress-bar-fisico"
              style={{ width: `${Math.min(Math.max(obra.progressoFisico, 0), 100)}%` }}
            />
          </div>
        </div>

        <div className="obra-progress-item">
          <div className="obra-progress-label">
            <span>Progresso Planejado</span>
            <strong>{obra.progressoPlanejado}%</strong>
          </div>
          <div className="obra-progress-bar-bg" role="progressbar" aria-valuenow={obra.progressoPlanejado} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso Planejado">
            <div
              className="obra-progress-bar-fill obra-progress-bar-planejado"
              style={{ width: `${Math.min(Math.max(obra.progressoPlanejado, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="obra-panel-grid">
        <div className="obra-info-card">
          <span className="obra-info-card-label">Etapa Atual</span>
          <strong className="obra-info-card-value">{obra.etapaAtual}</strong>
        </div>

        <div className="obra-info-card">
          <span className="obra-info-card-label">Última Atualização</span>
          <strong className="obra-info-card-value">{obra.ultimaAtualizacao}</strong>
        </div>
      </div>

      {obra.descricao && (
        <div className="obra-panel-description">
          <h4>Descrição</h4>
          <p>{obra.descricao}</p>
        </div>
      )}

      <div className="obra-panel-actions">
        <button
          type="button"
          className="obra-btn obra-btn-primary"
          onClick={handleViewDetails}
        >
          Ver detalhes
        </button>
        <button
          type="button"
          className="obra-btn obra-btn-secondary"
          onClick={handleViewDocuments}
        >
          Ver documentos
        </button>
      </div>
    </aside>
  )
}
