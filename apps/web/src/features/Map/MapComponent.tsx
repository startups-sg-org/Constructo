import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

function MapComponent () {

    return(
        <div>
            <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy ; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[51.505, -0.09]}>
                    <Popup>
                        Deu certo!
                    </Popup>
                </Marker>
            </MapContainer>

        </div>
    )
    
}

export default MapComponent