import { latLngBounds, type FitBoundsOptions, type Map as LeafletMap } from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LayersControl, MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet'
import type { Obra } from '../types/obra'
import './MapComponent.css'

interface MapComponentProps {
  obras: Obra[]
  /** Nome acessível da região do mapa. Quem o compõe decide o texto — o
      componente não presume que existe um título de página ao redor. */
  rotulo: string
  obraSelecionadaId?: string | null
  /** Notifica o id da obra clicada, ou null ao limpar a seleção; quem compõe
      o mapa já tem a coleção e resolve o id em dados completos se precisar. */
  onSelecionarObra?: (id: string | null) => void
  /** Atraso antes de reenquadrar numa obra recém-selecionada — dá tempo para
      quem compõe o mapa terminar de mudar o espaço disponível ao redor dele
      (por exemplo, abrir um painel lateral). Não afeta o retorno à visão
      geral, que reenquadra de imediato. Padrão: 0. */
  atrasoEnquadramentoMs?: number
}

type ObrasNoMapaProps = Pick<
  MapComponentProps,
  'obras' | 'obraSelecionadaId' | 'onSelecionarObra' | 'atrasoEnquadramentoMs'
>

const OPCOES_ENQUADRAMENTO: FitBoundsOptions = { padding: [24, 24] }

const OPCOES_VOO: FitBoundsOptions = {
  ...OPCOES_ENQUADRAMENTO,
  duration: 1.4,
  // Abaixo do padrão (0.25): alonga a desaceleração final, para o voo
  // terminar suave mesmo quando o espaço ao redor do mapa muda de forma
  // gradual e animada (por exemplo, um painel lateral abrindo).
  easeLinearity: 0.15,
}

function limitesDe(obras: Obra[]) {
  return latLngBounds(obras.flatMap((obra) => obra.coordenadas))
}

function ObrasNoMapa({ obras, obraSelecionadaId, onSelecionarObra, atrasoEnquadramentoMs = 0 }: ObrasNoMapaProps) {
  const map = useMap()
  const idAnterior = useRef(obraSelecionadaId)

  useEffect(() => {
    map.fitBounds(limitesDe(obras), OPCOES_ENQUADRAMENTO)
  }, [map, obras])

  // O espaço disponível para o mapa pode mudar por decisão de quem o compõe
  // (por exemplo, um painel lateral abrindo), quadro a quadro. O Leaflet só
  // escuta resize de janela, não do próprio container.
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
      // Ao limpar a seleção, o voo é imediato: atrasoEnquadramentoMs existe
      // para dar espaço a uma obra específica, não para este caso.
      map.flyToBounds(limitesDe(obras), OPCOES_VOO)
      return
    }

    // Enquadrar agora poderia usar uma largura que o container ainda vai
    // perder para quem o compõe, cortando a obra. atrasoEnquadramentoMs dá
    // tempo para essa mudança de espaço terminar antes do voo.
    const temporizador = setTimeout(
      () => map.flyToBounds(latLngBounds(selecionada.coordenadas), OPCOES_VOO),
      atrasoEnquadramentoMs,
    )
    return () => clearTimeout(temporizador)
  }, [map, obras, obraSelecionadaId, atrasoEnquadramentoMs])

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
                onSelecionarObra?.(obra.id)
              },
            }}
          />
        </LayersControl.Overlay>
      ))}
    </LayersControl>
  )
}

export function MapComponent({ obras, rotulo, obraSelecionadaId, onSelecionarObra, atrasoEnquadramentoMs }: MapComponentProps) {
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
    <section className='map-section' aria-label={rotulo}>
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
              atrasoEnquadramentoMs={atrasoEnquadramentoMs}
            />
          </MapContainer>
        </>
      ) : <p role='status'>Nenhuma obra cadastrada para exibir no mapa.</p>}
    </section>
  )
}
