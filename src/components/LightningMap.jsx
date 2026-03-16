import { MapContainer, TileLayer, Rectangle, useMapEvents, Marker, Popup } from "react-leaflet"
import { getNg } from "../utils/ng"


function colorScale(ng) {

    if (ng == null) return "#cccccc"

    if (ng < 2) return "#00ffcc"
    if (ng < 5) return "#00ff00"
    if (ng < 10) return "#ffff00"
    if (ng < 20) return "#ff9900"
    if (ng < 50) return "#ff0000"

    return "#990000"
}

function ClickHandler({ dataset, setValue }) {

    useMapEvents({
        click(e) {

            const lat = e.latlng.lat
            const lon = e.latlng.lng

            const ng = getNg(lat, lon, dataset)

            setValue({ lat, lon, ng })
        }
    })

    return null
}

export default function LightningMap({ dataset, setValue, marker }) {

    const { meta, data } = dataset

    const cells = []

    for (let i = 0; i < meta.shape[0]; i++) {

        for (let j = 0; j < meta.shape[1]; j++) {

            const ng = data[i][j]

            const lat0 = meta.lat_range[0] + i * meta.lat_step
            const lon0 = meta.lon_range[0] + j * meta.lon_step

            const bounds = [
                [lat0, lon0],
                [lat0 + meta.lat_step, lon0 + meta.lon_step]
            ]

            cells.push(
                <Rectangle
                    key={`${i}-${j}`}
                    bounds={bounds}
                    pathOptions={{
                        fillColor: colorScale(ng),
                        fillOpacity: 0.6,
                        weight: 0
                    }}
                />
            )
        }
    }

    return (

        <MapContainer
            center={[4.5, -74]}
            zoom={6}
            style={{ height: "600px" }}
        >

            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {cells}

            <ClickHandler dataset={dataset} setValue={setValue} />

            {marker && (

                <Marker position={[marker.lat, marker.lon]}>

                    <Popup>
                        <b>Lat:</b> {marker.lat.toFixed(4)} <br />
                        <b>Lon:</b> {marker.lon.toFixed(4)} <br />
                        <b>Ng:</b> {marker.ng ?? "Sin datos"}
                    </Popup>

                </Marker>

            )}

        </MapContainer>
    )
}