import { MapContainer, TileLayer, useMapEvents, useMap, CircleMarker, ImageOverlay } from "react-leaflet"
import { useMemo, useEffect } from "react"
import { getNg } from "../utils/ng"


const COLOR_STOPS = [
    { ng: 0,  hex: "#00ffcc" },
    { ng: 2,  hex: "#00ff00" },
    { ng: 5,  hex: "#ffff00" },
    { ng: 10, hex: "#ff9900" },
    { ng: 20, hex: "#ff0000" },
    { ng: 50, hex: "#990000" },
]

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function colorScaleRgb(ng) {
    if (ng == null) return [204, 204, 204]

    const stops = COLOR_STOPS
    if (ng <= stops[0].ng) return hexToRgb(stops[0].hex)
    if (ng >= stops[stops.length - 1].ng) return hexToRgb(stops[stops.length - 1].hex)

    const hi = stops.findIndex(s => s.ng > ng)
    const lo = hi - 1
    const t = (ng - stops[lo].ng) / (stops[hi].ng - stops[lo].ng)

    const [r0, g0, b0] = hexToRgb(stops[lo].hex)
    const [r1, g1, b1] = hexToRgb(stops[hi].hex)

    return [r0 + t * (r1 - r0), g0 + t * (g1 - g0), b0 + t * (b1 - b0)]
}

function generateHeatmapImage(dataset) {
    const { meta, data } = dataset
    const rows = meta.shape[0]
    const cols = meta.shape[1]
    const k = 0.25

    const scale = 20          // pixels per grid cell
    const width  = cols * scale
    const height = rows * scale

    const canvas = document.createElement("canvas")
    canvas.width  = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    const imageData = ctx.createImageData(width, height)

    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {

            // py=0 is the top of the image (north = high row index)
            const iFrac = (height - 1 - py) / scale
            const jFrac = px / scale

            const i0 = Math.min(Math.floor(iFrac), rows - 1)
            const j0 = Math.min(Math.floor(jFrac), cols - 1)
            const i1 = Math.min(i0 + 1, rows - 1)
            const j1 = Math.min(j0 + 1, cols - 1)
            const ti = iFrac - i0
            const tj = jFrac - j0

            // bilinear interpolation of raw data values
            const v = data[i0][j0] * (1 - ti) * (1 - tj)
                    + data[i0][j1] * (1 - ti) * tj
                    + data[i1][j0] * ti * (1 - tj)
                    + data[i1][j1] * ti * tj

            const ng = k * v
            const [r, g, b] = colorScaleRgb(ng)

            const idx = (py * width + px) * 4
            imageData.data[idx]     = Math.round(r)
            imageData.data[idx + 1] = Math.round(g)
            imageData.data[idx + 2] = Math.round(b)
            imageData.data[idx + 3] = 255
        }
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas.toDataURL()
}


function BoundsController({ bounds }) {
    const map = useMap()
    useEffect(() => {
        map.invalidateSize()
        map.fitBounds(bounds, { animate: false, padding: [0, 0] })
        map.setMaxBounds(bounds)
        map.setMinZoom(map.getZoom())
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    return null
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

    const { meta } = dataset
    const rows = meta.shape[0]
    const cols = meta.shape[1]

    const bounds = [
        [meta.lat_range[0], meta.lon_range[0]],
        [meta.lat_range[0] + rows * meta.lat_step, meta.lon_range[0] + cols * meta.lon_step]
    ]

    const imageUrl = useMemo(() => generateHeatmapImage(dataset), [dataset])

    return (
        <MapContainer
            center={[4.25, -73.25]}
            zoom={6}
            zoomSnap={0}
            maxBoundsViscosity={1.0}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ImageOverlay
                url={imageUrl}
                bounds={bounds}
                opacity={0.5}
            />

            <BoundsController bounds={bounds} />
            <ClickHandler dataset={dataset} setValue={setValue} />

            {marker && (
                <CircleMarker
                    center={[marker.lat, marker.lon]}
                    radius={8}
                    pathOptions={{
                        color: "white",
                        weight: 2,
                        fillColor: "red",
                        fillOpacity: 1
                    }}
                />
            )}
        </MapContainer>
    )
}
