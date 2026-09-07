import { latLngBounds } from 'leaflet'
import {
  CircleMarker,
  FeatureGroup,
  GeoJSON,
  LayersControl,
  MapContainer,
  Popup,
  TileLayer,
} from 'react-leaflet'
import { obrasEmAndamento } from '../mocks/obrasEmAndamento'
import { obrasPlanejadas } from '../mocks/obrasPlanejadas'
import './MapComponent.css'

const camadas = [
  { nome: 'Em andamento (4 obras)', dados: obrasEmAndamento, cor: '#2563eb' },
  { nome: 'Planejadas (3 obras)', dados: obrasPlanejadas, cor: '#b45309' },
]

const limites = latLngBounds(
  camadas.flatMap(({ dados }) =>
    dados.features.flatMap(({ geometry }) =>
      geometry.coordinates[0].map(([longitude, latitude]) =>
        [latitude, longitude] as [number, number],
      ),
    ),
  ),
)

export default function MapComponent() {
  return (
    <section aria-labelledby='map-title'>
      <h1 id='map-title'>Mapa de Obras</h1>
      <p>7 obras fictícias no Tocantins. Localizações e perímetros aproximados.</p>

      <MapContainer className='map' bounds={limites} boundsOptions={{ padding: [24, 24] }}>
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/stamen_toner_dark/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <LayersControl position='topright'>
          {camadas.map(({ nome, dados, cor }) => (
            <LayersControl.Overlay key={nome} checked name={nome}>
              <FeatureGroup>
                <GeoJSON data={dados} style={{ color: cor, weight: 2, fillOpacity: 0.25 }} />
                {dados.features.map(({ geometry, properties: obra }) => {
                  const centro = latLngBounds(
                    geometry.coordinates[0].map(([longitude, latitude]) =>
                      [latitude, longitude] as [number, number],
                    ),
                  ).getCenter()

                  return (
                    <CircleMarker
                      key={obra.id}
                      center={centro}
                      radius={7}
                      pathOptions={{ color: cor, fillColor: cor, fillOpacity: 1, weight: 2 }}
                    >
                      <Popup>
                        <strong>{obra.nome}</strong>
                        <p>{obra.id} · {obra.municipio}, {obra.uf}</p>
                        <p>{obra.tipo} · {obra.status} · Progresso: {obra.progresso}%</p>
                        <p>{obra.descricao}</p>
                        <small>Obra fictícia para demonstração.</small>
                      </Popup>
                    </CircleMarker>
                  )
                })}
              </FeatureGroup>
            </LayersControl.Overlay>
          ))}
        </LayersControl>
      </MapContainer>
    </section>
  )
}
