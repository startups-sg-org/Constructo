import { useMemo, useState } from 'react'
import { MapComponent, PainelInfoObra } from '@features/map'
import { createIndicatorsFromWork, IndicatorsPanel } from '@features/indicators'
import type { Obra } from '@shared/domain/obra'
import { obrasMock } from '@shared/mocks/obras'
import './HomePage.css'

export function HomePage() {
  const [selectedWork, setSelectedWork] = useState<Obra | null>(null)
  const indicators = useMemo(
    () => selectedWork ? createIndicatorsFromWork(selectedWork) : undefined,
    [selectedWork],
  )

  function selectWork(id: string | null) {
    setSelectedWork(id ? obrasMock.find((obra) => obra.id === id) ?? null : null)
  }

  return (
    <div className='home-page'>
      <div className='home-page-header'>
        <h1 id='home-title'>Mapa de Obras</h1>
        <p>Visualize as obras em andamento e acompanhe seus principais dados.</p>
      </div>

      <div className='integration-slot map-slot'>
        <MapComponent
          obras={obrasMock}
          rotulo='Mapa de Obras'
          obraSelecionadaId={selectedWork?.id ?? null}
          onSelecionarObra={selectWork}
        />
        {selectedWork && (
          <PainelInfoObra
            obra={selectedWork}
            onClose={() => setSelectedWork(null)}
          />
        )}
      </div>

      {indicators && <IndicatorsPanel data={indicators} />}
    </div>
  )
}
