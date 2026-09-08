import { latLngBounds } from 'leaflet'
import { useEffect, useId, useMemo, useState } from 'react'
import { LayersControl, MapContainer, Polygon, Popup, TileLayer, useMap } from 'react-leaflet'
import { obrasMock } from '../mocks/obras'
import type { Obra } from '../types/obra'
import { PainelInfoObra } from './PainelInfoObra'
import './MapComponent.css'

interface MapComponentProps {
  obras?: Obra[]
  obraSelecionadaId?: string | null
  onSelectObra?: (obra: Obra | null) => void
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
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
          >
            <Popup>
              <article className='obra-popup'>
                <h2>{obra.nome}</h2>
                <p>{obra.local} — {obra.municipio}/{obra.uf}</p>
                <p>{obra.descricao}</p>
                <dl>
                  <dt>Identificação</dt><dd>{obra.id}</dd>
                  <dt>Tipo</dt><dd>{obra.tipo}</dd>
                  <dt>Status</dt><dd>{obra.status}</dd>
                  <dt>Progresso físico</dt><dd>{obra.progressoFisico ?? obra.progresso}%</dd>
                  <dt>Responsável</dt><dd>{obra.responsavel}</dd>
                  <dt>Orçamento previsto</dt><dd>{moeda.format(obra.orcamento)}</dd>
                  <dt>Início</dt><dd>{formatarData(obra.dataInicio)}</dd>
                  <dt>Conclusão prevista</dt><dd>{formatarData(obra.previsaoConclusao)}</dd>
                </dl>
                <p>{obra.origemCoordenadas === 'Simulação'
                  ? 'Perímetro fictício para demonstração.'
                  : 'Contorno do local usado como referência; não delimita um canteiro real.'}</p>
                {obra.escopoCoordenadas && <p>{obra.escopoCoordenadas}</p>}
                {obra.fonteCoordenadas && (
                  <a href={obra.fonteCoordenadas} target='_blank' rel='noopener noreferrer'>
                    Fonte do contorno
                  </a>
                )}
                {obra.ficticia && <p>Obra e informações fictícias para demonstração.</p>}
              </article>
            </Popup>
          </Polygon>
        </LayersControl.Overlay>
      ))}
    </LayersControl>
  )
}

export function MapComponent({
  obras = obrasMock,
  obraSelecionadaId: propObraSelecionadaId,
  onSelectObra,
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
    setInternalObraSelecionadaId(obra ? obra.id : null)
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
          >
            <TileLayer
              attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://tiles.stadiamaps.com/tiles/stamen_toner_dark/{z}/{x}/{y}{r}.png'
            />
            <ObrasNoMapa
              obras={obras}
              obraSelecionadaId={activeObraSelecionadaId}
              onSelectObra={handleSelectObra}
            />
          </MapContainer>
          <PainelInfoObra
            obra={obraSelecionada}
            onClose={() => handleSelectObra(null)}
          />
        </div>
      ) : <p role='status'>Nenhuma obra cadastrada para exibir no mapa.</p>}
    </section>
  )
}

