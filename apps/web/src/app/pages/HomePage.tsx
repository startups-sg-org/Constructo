import { useMemo, useState } from 'react'
import { MapComponent, obrasMock, PainelInfoObra } from '@features/map'
import type { Obra } from '@features/map'
import { createIndicatorsFromWork, IndicatorsPanel } from '@features/indicators'
import './HomePage.css'

export function HomePage() {
  const [selectedWork, setSelectedWork] = useState<Obra | null>(obrasMock[0] ?? null)
  const indicators = useMemo(
    () => selectedWork ? createIndicatorsFromWork(selectedWork) : undefined,
    [selectedWork],
  )

  return (
    <section className='home-page' aria-labelledby='home-title'>
      <div className='home-page-header'>
        <h1 id='home-title'>Mapa de Obras</h1>
        <p>Visualize as obras em andamento e acompanhe seus principais dados.</p>
      </div>

      <div className='home-dashboard-grid'>
        <div className='integration-slot map-slot'>
          <MapComponent
            obraSelecionadaId={selectedWork?.id ?? null}
            onSelectObra={setSelectedWork}
            showDetailsPanel={false}
          />
        </div>

        <div className='details-slot'>
          {selectedWork ? (
            <PainelInfoObra
              obra={selectedWork}
              onClose={() => setSelectedWork(null)}
            />
          ) : (
            <div className='details-empty' role='status'>
              <span>Detalhes da obra</span>
              <strong>Selecione uma obra no mapa</strong>
              <p>As informações da obra escolhida serão exibidas neste painel.</p>
              <ol aria-label='Como consultar uma obra'>
                <li>Localize a obra no mapa</li>
                <li>Clique em seu perímetro</li>
                <li>Consulte os detalhes e indicadores</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      <IndicatorsPanel data={indicators} state={selectedWork ? 'ready' : 'empty'} />
    </section>
  )
}
