import { latLngBounds } from 'leaflet'
import { useEffect, useId, useMemo, useState } from 'react'
import { LayersControl, MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet'
import { obrasMock } from '../mocks/obras'
import type { Obra } from '../types/obra'
import { PainelInfoObra } from './PainelInfoObra'
import './MapComponent.css'

interface MapComponentProps {
  obras?: Obra[]
  obraSelecionadaId?: string | null
  onSelectObra?: (obra: Obra | null) => void
  showDetailsPanel?: boolean
}

function ObrasNoMapa({
  obras,
  obraSelecionadaId,
  onSelectObra,
}: {
  obras: Obra[]
  obraSelecionadaId: string | null
  onSelectObra: (obra: Obra) => void
}) {
  const map = useMap()

  useEffect(() => {
    map.fitBounds(latLngBounds(obras.flatMap((obra) => obra.coordenadas)), {
      padding: [24, 24],
    })
  }, [map, obras])

  return (
    <LayersControl position='topright'>
      {obras.map((obra) => (
        <LayersControl.Overlay key={obra.id} checked name={obra.local}>
          <Polygon
            positions={[obra.coordenadas, ...(obra.aneisInternos ?? [])]}
            pathOptions={{
              color: obraSelecionadaId === obra.id ? 'green' : 'white',
              weight: 3,
              fillOpacity: 0.2,
            }}
            eventHandlers={{
              click() {
                onSelectObra(obra)
                map.fitBounds(obra.coordenadas, { padding: [24, 24] })
              },
            }}
          />
        </LayersControl.Overlay>
      ))}
    </LayersControl>
  )
}

export function MapComponent({
  obras = obrasMock,
  obraSelecionadaId: propObraSelecionadaId,
  onSelectObra,
  showDetailsPanel = true,
}: MapComponentProps) {
  const tituloId = useId()
  const [internalObraSelecionadaId, setInternalObraSelecionadaId] = useState<string | null>(null)

  const activeObraSelecionadaId = propObraSelecionadaId !== undefined
    ? propObraSelecionadaId
    : internalObraSelecionadaId

  const obraSelecionada = useMemo(
    () => obras.find((o) => o.id === activeObraSelecionadaId) ?? null,
    [obras, activeObraSelecionadaId],
  )

  const handleSelectObra = (obra: Obra | null) => {
    if (propObraSelecionadaId === undefined) {
      setInternalObraSelecionadaId(obra ? obra.id : null)
    }
    onSelectObra?.(obra)
  }

  const limites = useMemo(
    () => obras.length > 0 ? latLngBounds(obras.flatMap((obra) => obra.coordenadas)) : null,
    [obras],
  )

  return (
    <section aria-labelledby={tituloId}>
      <h1 id={tituloId}>Mapa de Obras</h1>
      <p>{obras.length} {obras.length === 1 ? 'obra cadastrada' : 'obras cadastradas'}</p>
      {limites ? (
        <div className='map-wrapper'>
          <MapContainer
            className='map-container'
            bounds={limites}
            boundsOptions={{ padding: [24, 24] }}
            scrollWheelZoom={false}
            attributionControl={false}
          >
            <TileLayer
              url='https://tiles.stadiamaps.com/tiles/stamen_toner_dark/{z}/{x}/{y}{r}.png'
            />
            <ObrasNoMapa
              obras={obras}
              obraSelecionadaId={activeObraSelecionadaId}
              onSelectObra={handleSelectObra}
            />
          </MapContainer>
          {showDetailsPanel && (
            <PainelInfoObra
              obra={obraSelecionada}
              onClose={() => handleSelectObra(null)}
            />
          )}
        </div>
      ) : <p role='status'>Nenhuma obra cadastrada para exibir no mapa.</p>}
    </section>
  )
}

