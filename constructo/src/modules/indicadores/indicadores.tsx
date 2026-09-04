import './indicadores.css'
import IndicatorCard from './IndicatorCard'
import type { DataState, ObraIndicadores } from './types'

interface IndicadoresProps {
	data?: ObraIndicadores
	state?: DataState
	errorMessage?: string
}

function Indicadores({ data, state = 'ready', errorMessage }: IndicadoresProps) {
	if (state === 'loading') {
		return <p className="indicadores-state">Carregando indicadores...</p>
	}

	if (state === 'error') {
		return <p className="indicadores-state indicadores-state--error">{errorMessage ?? 'Não foi possível carregar os indicadores.'}</p>
	}

	if (state === 'empty' || !data) {
		return <p className="indicadores-state">Nenhum indicador disponível.</p>
	}

	const metrics = [
		data.progressoFisico,
		data.progressoPlanejado,
		data.etapaAtual,
		data.situacaoObra,
                
	]

	return (
		<main className="indicadores-page">
			<header className="indicadores-page__header">
				<div>
					<p className="indicadores-page__eyebrow">Acompanhamento da obra</p>
					<h1>{data.obraNome}</h1>
				</div>
				<p className="indicadores-page__updated">Atualizado em {data.atualizacaoEm}</p>
			</header>

			<section className="indicadores-grid" aria-label="Indicadores principais">
				{metrics.map((metric) => (
					<IndicatorCard key={metric.label} metric={metric} />
				))}
			</section>
		</main>
	)
}

export default Indicadores