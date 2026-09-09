import { useEffect } from 'react'
import type { Obra } from '../types/obra'
import './PainelInfoObra.css'

export interface PainelInfoObraProps {
  obra: Obra | null
  onClose?: () => void
  onVerDetalhes?: (obra: Obra) => void
  onVerDocumentos?: (obra: Obra) => void
}

function formatarDataDisplay(dataStr?: string): string {
  if (!dataStr) return 'Não informada'
  if (dataStr.includes('/')) return dataStr
  const partes = dataStr.split('-')
  if (partes.length === 3) {
    const [ano, mes, dia] = partes
    return `${dia}/${mes}/${ano}`
  }
  return dataStr
}

export function PainelInfoObra({
  obra,
  onClose,
  onVerDetalhes,
  onVerDocumentos,
}: PainelInfoObraProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!obra) {
    return null
  }

  const progressoFisico = obra.progressoFisico ?? obra.progresso ?? 0
  const progressoPlanejado = obra.progressoPlanejado ?? Math.min(100, progressoFisico + 5)
  const etapaAtual = obra.etapaAtual ?? 'Não informada'
  const ultimaAtualizacao = formatarDataDisplay(obra.ultimaAtualizacao ?? obra.dataInicio)

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Em andamento':
        return 'status-badge--em-andamento'
      case 'Paralisada':
        return 'status-badge--paralisada'
      case 'Concluída':
        return 'status-badge--concluida'
      default:
        return ''
    }
  }

  return (
    <aside className="painel-info-obra" aria-label="Informações da Obra Selecionada">
      <div className="painel-info-obra__header">
        <div className="painel-info-obra__header-title">
          <span className={`status-badge ${getStatusClass(obra.status)}`}>
            {obra.status}
          </span>
          <h2 className="painel-info-obra__nome">{obra.nome}</h2>
          <p className="painel-info-obra__local">
            {obra.local} • {obra.municipio}/{obra.uf}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            className="painel-info-obra__btn-close"
            onClick={onClose}
            aria-label="Fechar painel de informações"
          >
            &times;
          </button>
        )}
      </div>

      <div className="painel-info-obra__content">
        <section className="painel-info-obra__section">
          <h3 className="painel-info-obra__section-title">Resumo do Progresso</h3>
          
          <div className="progresso-metric">
            <div className="progresso-metric__header">
              <span className="progresso-metric__label">Progresso Físico</span>
              <span className="progresso-metric__value">{progressoFisico}%</span>
            </div>
            <div className="progresso-metric__bar-bg">
              <div
                className="progresso-metric__bar-fill progresso-metric__bar-fill--fisico"
                style={{ width: `${Math.min(100, Math.max(0, progressoFisico))}%` }}
              />
            </div>
          </div>

          <div className="progresso-metric">
            <div className="progresso-metric__header">
              <span className="progresso-metric__label">Progresso Planejado</span>
              <span className="progresso-metric__value">{progressoPlanejado}%</span>
            </div>
            <div className="progresso-metric__bar-bg">
              <div
                className="progresso-metric__bar-fill progresso-metric__bar-fill--planejado"
                style={{ width: `${Math.min(100, Math.max(0, progressoPlanejado))}%` }}
              />
            </div>
          </div>
        </section>

        <section className="painel-info-obra__section">
          <dl className="painel-info-obra__details-list">
            <div className="painel-info-obra__detail-item">
              <dt>Etapa atual</dt>
              <dd>{etapaAtual}</dd>
            </div>
            <div className="painel-info-obra__detail-item">
              <dt>Situação/Status</dt>
              <dd>{obra.status}</dd>
            </div>
            <div className="painel-info-obra__detail-item">
              <dt>Última atualização</dt>
              <dd>{ultimaAtualizacao}</dd>
            </div>
            <div className="painel-info-obra__detail-item">
              <dt>Tipo de obra</dt>
              <dd>{obra.tipo}</dd>
            </div>
            <div className="painel-info-obra__detail-item">
              <dt>Responsável</dt>
              <dd>{obra.responsavel}</dd>
            </div>
          </dl>
        </section>

        <footer className="painel-info-obra__actions">
          <button
            type="button"
            className="painel-info-obra__btn painel-info-obra__btn--primary"
            onClick={() => onVerDetalhes?.(obra)}
          >
            Ver detalhes
          </button>
          <button
            type="button"
            className="painel-info-obra__btn painel-info-obra__btn--secondary"
            onClick={() => onVerDocumentos?.(obra)}
          >
            Ver documentos
          </button>
        </footer>
      </div>
    </aside>
  )
}
