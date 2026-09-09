import { latLngBounds, type FitBoundsOptions, type Polygon as LeafletPolygon } from 'leaflet'
import { useEffect, useMemo, useRef } from 'react'
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
  /** Mantém o movimento do mapa no mesmo ritmo das superfícies que o compõem. */
  duracaoMovimentoMs?: number
}

type ObrasNoMapaProps = Pick<
  MapComponentProps,
  'obras' | 'obraSelecionadaId' | 'onSelecionarObra' | 'duracaoMovimentoMs'
>

const OPCOES_ENQUADRAMENTO: FitBoundsOptions = { padding: [48, 48] }

const CLASSES_STATUS = {
  'Em andamento': 'map-poligono-em-andamento',
  Paralisada: 'map-poligono-paralisada',
  Concluída: 'map-poligono-concluida',
} as const

function limitesDe(obras: Obra[]) {
  return latLngBounds(obras.flatMap((obra) => obra.coordenadas))
}

function prefereMovimentoReduzido() {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function opcoesVoo(duracaoMovimentoMs: number): FitBoundsOptions {
  return {
    ...OPCOES_ENQUADRAMENTO,
    animate: !prefereMovimentoReduzido(),
    duration: duracaoMovimentoMs / 1000,
    easeLinearity: 0.2,
  }
}

function classeDaObra(obra: Obra, selecionada: boolean) {
  return [
    'map-poligono',
    CLASSES_STATUS[obra.status],
    selecionada ? 'map-poligono-selecionado' : '',
  ].filter(Boolean).join(' ')
}

interface PoligonoObraProps {
  obra: Obra
  selecionada: boolean
  onSelecionarObra?: (id: string | null) => void
}

function PoligonoObra({ obra, selecionada, onSelecionarObra }: PoligonoObraProps) {
  const poligono = useRef<LeafletPolygon | null>(null)

  // O Leaflet não atualiza className por setStyle. A classe dinâmica continua
  // sendo a fonte visual no CSS; a referência só espelha o estado no SVG.
  useEffect(() => {
    poligono.current?.getElement()?.classList.toggle('map-poligono-selecionado', selecionada)
  }, [selecionada])

  return (
    <Polygon
      ref={poligono}
      className={classeDaObra(obra, selecionada)}
      positions={[obra.coordenadas, ...(obra.aneisInternos ?? [])]}
      eventHandlers={{
        click() {
          onSelecionarObra?.(obra.id)
        },
      }}
    />
  )
}

function ObrasNoMapa({ obras, obraSelecionadaId, onSelecionarObra, duracaoMovimentoMs = 620 }: ObrasNoMapaProps) {
  const map = useMap()
  const idAnterior = useRef(obraSelecionadaId)

  useEffect(() => {
    map.fitBounds(limitesDe(obras), OPCOES_ENQUADRAMENTO)
  }, [map, obras])

  // O mapa é responsivo mesmo fora desta página: se qualquer container mudar
  // de tamanho, o Leaflet recalcula o próprio viewport.
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
    const destino = selecionada ? latLngBounds(selecionada.coordenadas) : limitesDe(obras)
    const opcoes = opcoesVoo(duracaoMovimentoMs)

    if (opcoes.animate) {
      map.flyToBounds(destino, opcoes)
    } else {
      map.fitBounds(destino, opcoes)
    }
  }, [map, obras, obraSelecionadaId, duracaoMovimentoMs])

  return (
    <LayersControl position='topright'>
      {obras.map((obra) => (
        <LayersControl.Overlay key={obra.id} checked name={obra.local}>
          <PoligonoObra
            obra={obra}
            selecionada={obraSelecionadaId === obra.id}
            onSelecionarObra={onSelecionarObra}
          />
        </LayersControl.Overlay>
      ))}
    </LayersControl>
  )
}

export function MapComponent({ obras, rotulo, obraSelecionadaId, onSelecionarObra, duracaoMovimentoMs }: MapComponentProps) {
  const limites = useMemo(() => obras.length > 0 ? limitesDe(obras) : null, [obras])

  return (
    <section className='map-section' aria-label={rotulo}>
      {limites ? (
        <MapContainer
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
            duracaoMovimentoMs={duracaoMovimentoMs}
          />
        </MapContainer>
      ) : <p className='map-estado-vazio' role='status'>Nenhuma obra cadastrada para exibir no mapa.</p>}
    </section>
  )
}
