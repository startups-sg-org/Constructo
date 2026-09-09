import { latLngBounds, type FitBoundsOptions, type Polygon as LeafletPolygon } from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LayersControl, MapContainer, Polygon, TileLayer, useMap } from 'react-leaflet'
import { obrasMock } from '@shared/mocks/obras'
import type { Obra } from '../types/obra'
import { PainelInfoObra } from './PainelInfoObra'
import './MapComponent.css'

interface MapComponentProps {
  obras?: Obra[]
  rotulo?: string
  obraSelecionadaId?: string | null
  onSelectObra?: (obra: Obra | null) => void
  onSelecionarObra?: (id: string | null) => void
  showDetailsPanel?: boolean
  duracaoMovimentoMs?: number
}

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
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function classeDaObra(obra: Obra, selecionada: boolean) {
  return ['map-poligono', CLASSES_STATUS[obra.status], selecionada ? 'map-poligono-selecionado' : '']
    .filter(Boolean).join(' ')
}

function PoligonoObra({ obra, selecionada, onSelecionar }: {
  obra: Obra
  selecionada: boolean
  onSelecionar: (obra: Obra) => void
}) {
  const poligono = useRef<LeafletPolygon | null>(null)

  useEffect(() => {
    poligono.current?.getElement()?.classList.toggle('map-poligono-selecionado', selecionada)
  }, [selecionada])

  return (
    <Polygon
      ref={poligono}
      className={classeDaObra(obra, selecionada)}
      positions={[obra.coordenadas, ...(obra.aneisInternos ?? [])]}
      eventHandlers={{ click: () => onSelecionar(obra) }}
    />
  )
}

function ObrasNoMapa({
  obras,
  obraSelecionadaId,
  onSelecionar,
  duracaoMovimentoMs,
}: {
  obras: Obra[]
  obraSelecionadaId: string | null
  onSelecionar: (obra: Obra) => void
  duracaoMovimentoMs: number
}) {
  const map = useMap()
  const idAnterior = useRef(obraSelecionadaId)

  useEffect(() => {
    map.fitBounds(limitesDe(obras), OPCOES_ENQUADRAMENTO)
  }, [map, obras])

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false, pan: false }))
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])

  useEffect(() => {
    if (idAnterior.current === obraSelecionadaId) return
    idAnterior.current = obraSelecionadaId
    const selecionada = obras.find((obra) => obra.id === obraSelecionadaId)
    const destino = selecionada ? latLngBounds(selecionada.coordenadas) : limitesDe(obras)
    const opcoes: FitBoundsOptions = {
      ...OPCOES_ENQUADRAMENTO,
      animate: !prefereMovimentoReduzido(),
      duration: duracaoMovimentoMs / 1000,
      easeLinearity: 0.2,
    }
    if (opcoes.animate) map.flyToBounds(destino, opcoes)
    else map.fitBounds(destino, opcoes)
  }, [map, obras, obraSelecionadaId, duracaoMovimentoMs])

  return (
    <LayersControl position='topright'>
      {obras.map((obra) => (
        <LayersControl.Overlay key={obra.id} checked name={obra.local}>
          <PoligonoObra
            obra={obra}
            selecionada={obraSelecionadaId === obra.id}
            onSelecionar={onSelecionar}
          />
        </LayersControl.Overlay>
      ))}
    </LayersControl>
  )
}

export function MapComponent({
  obras = obrasMock,
  rotulo = 'Mapa de Obras',
  obraSelecionadaId,
  onSelectObra,
  onSelecionarObra,
  showDetailsPanel = false,
  duracaoMovimentoMs = 620,
}: MapComponentProps) {
  const [internalId, setInternalId] = useState<string | null>(null)
  const activeId = obraSelecionadaId !== undefined ? obraSelecionadaId : internalId
  const obraSelecionada = useMemo(
    () => obras.find((obra) => obra.id === activeId) ?? null,
    [obras, activeId],
  )
  const limites = useMemo(() => obras.length > 0 ? limitesDe(obras) : null, [obras])

  function selecionarObra(obra: Obra) {
    if (obraSelecionadaId === undefined) setInternalId(obra.id)
    onSelecionarObra?.(obra.id)
    onSelectObra?.(obra)
  }

  function limparSelecao() {
    if (obraSelecionadaId === undefined) setInternalId(null)
    onSelecionarObra?.(null)
    onSelectObra?.(null)
  }

  return (
    <section className='map-section' aria-label={rotulo}>
      {limites ? (
        <div className='map-wrapper'>
          <MapContainer
            className='map-container'
            bounds={limites}
            boundsOptions={OPCOES_ENQUADRAMENTO}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://tiles.stadiamaps.com/tiles/stamen_toner_dark/{z}/{x}/{y}{r}.png'
            />
            <ObrasNoMapa
              obras={obras}
              obraSelecionadaId={activeId}
              onSelecionar={selecionarObra}
              duracaoMovimentoMs={duracaoMovimentoMs}
            />
          </MapContainer>
          {showDetailsPanel && <PainelInfoObra obra={obraSelecionada} onClose={limparSelecao} />}
        </div>
      ) : (
        <p className='map-estado-vazio' role='status'>Nenhuma obra cadastrada para exibir no mapa.</p>
      )}
    </section>
  )
}