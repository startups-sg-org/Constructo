import { latLngBounds, type FitBoundsOptions, type Map as LeafletMap } from 'leaflet'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { LayersControl, MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet'
import type { Obra } from '../types/obra'
import './MapComponent.css'

interface MapComponentProps {
  obras: Obra[]
  obraSelecionadaId?: string | null
  onSelecionarObra?: (obra: Obra | null) => void
}

type ObrasNoMapaProps = Pick<MapComponentProps, 'obras' | 'obraSelecionadaId' | 'onSelecionarObra'>

const OPCOES_ENQUADRAMENTO: FitBoundsOptions = { padding: [24, 24] }

/** Ritmo do enquadramento animado; pareado com --sidebar-duracao. */
const OPCOES_VOO: FitBoundsOptions = {
  ...OPCOES_ENQUADRAMENTO,
  duration: 1.4,
  // Abaixo do padrão (0.25): alonga a desaceleração final, acompanhando a
  // curva de entrada do painel em vez de chegar antes dele.
  easeLinearity: 0.15,
}

/** Espelha --sidebar-duracao: o voo espera o painel terminar de abrir. */
const ABERTURA_PAINEL_MS = 900

function limitesDe(obras: Obra[]) {
  return latLngBounds(obras.flatMap((obra) => obra.coordenadas))
}

function ObrasNoMapa({ obras, obraSelecionadaId, onSelecionarObra }: ObrasNoMapaProps) {
  const map = useMap()
  const idAnterior = useRef(obraSelecionadaId)

  useEffect(() => {
    map.fitBounds(limitesDe(obras), OPCOES_ENQUADRAMENTO)
  }, [map, obras])

  // O painel vizinho anima a própria largura, então o container encolhe quadro a
  // quadro. O Leaflet só escuta resize de janela, não do próprio container.
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      return
    }
    const observador = new ResizeObserver(() => map.invalidateSize({ animate: false, pan: false }))
    observador.observe(map.getContainer())
    return () => observador.disconnect()
  }, [map])

  // Só reage a mudanças reais de seleção: comparar com o id anterior evita
  // reenquadrar na montagem e sobrevive à dupla execução de efeitos do StrictMode.
  useEffect(() => {
    if (idAnterior.current === obraSelecionadaId) {
      return
    }
    idAnterior.current = obraSelecionadaId

    const selecionada = obras.find((obra) => obra.id === obraSelecionadaId)
    if (!selecionada) {
      // Fechar o painel devolve a largura de uma vez; nada a esperar.
      map.flyToBounds(limitesDe(obras), OPCOES_VOO)
      return
    }

    // Enquadrar agora usaria uma largura que o container ainda vai perder para o
    // painel, e a obra terminaria cortada. O voo entra quando a abertura acaba.
    const temporizador = setTimeout(
      () => map.flyToBounds(latLngBounds(selecionada.coordenadas), OPCOES_VOO),
      ABERTURA_PAINEL_MS,
    )
    return () => clearTimeout(temporizador)
  }, [map, obras, obraSelecionadaId])

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
                onSelecionarObra?.(obra)
              },
            }}
          />
        </LayersControl.Overlay>
      ))}
    </LayersControl>
  )
}

export function MapComponent({ obras, obraSelecionadaId, onSelecionarObra }: MapComponentProps) {
  const tituloId = useId()
  const [mapa, setMapa] = useState<LeafletMap | null>(null)
  const limites = useMemo(() => obras.length > 0 ? limitesDe(obras) : null, [obras])

  function voltarParaVisaoGeral() {
    onSelecionarObra?.(null)
    // O voo também sai daqui porque, sem obra selecionada, limpar a seleção não muda
    // estado nenhum — e o mapa ainda pode ter sido deslocado ou ampliado à mão.
    if (limites) {
      mapa?.flyToBounds(limites, OPCOES_VOO)
    }
  }

  return (
    <section className='map-section' aria-labelledby={tituloId}>
      <h1 id={tituloId}>Mapa de Obras</h1>
      <p>{obras.length} {obras.length === 1 ? 'obra cadastrada' : 'obras cadastradas'}</p>
      {limites ? (
        <>
          <button type='button' className='map-visao-geral' onClick={voltarParaVisaoGeral}>
            Ver todas as obras
          </button>
          <MapContainer
            ref={setMapa}
            className='map-container'
            bounds={limites}
            boundsOptions={OPCOES_ENQUADRAMENTO}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://tiles.stadiamaps.com/tiles/stamen_toner_dark/{z}/{x}/{y}{r}.png'
            />
            <ObrasNoMapa
              obras={obras}
              obraSelecionadaId={obraSelecionadaId}
              onSelecionarObra={onSelecionarObra}
            />
          </MapContainer>
        </>
      ) : <p role='status'>Nenhuma obra cadastrada para exibir no mapa.</p>}
    </section>
  )
}
