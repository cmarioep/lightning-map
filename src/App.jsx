import { useEffect, useState } from "react"
import LightningMap from "./components/LightningMap"
import { getNg } from "./utils/ng"

export default function App() {

  const [dataset, setDataset] = useState(null)
  const [result, setResult] = useState(null)

  const [lat, setLat] = useState("")
  const [lon, setLon] = useState("")
  const [marker, setMarker] = useState(null)

  useEffect(() => {

    fetch("/data/colombia_lightning.json")
      .then(r => r.json())
      .then(setDataset)

  }, [])

  function handleMapClick(value) {
    setResult(value)
    setMarker(value)
  }

  function calculate() {
    const ng = getNg(Number(lat), Number(lon), dataset)

    const value = {
      lat: Number(lat),
      lon: Number(lon),
      ng
    }

    setResult(value)
    setMarker(value)
  }

  if (!dataset) return <h2>Cargando dataset...</h2>

  return (

    <div style={{ padding: "20px" }}>

      <h1>Mapa de Densidad de Rayos (Ng)</h1>

      <div style={{ marginBottom: "20px" }}>

        <input
          placeholder="Latitud"
          value={lat}
          onChange={e => setLat(e.target.value)}
        />

        <input
          placeholder="Longitud"
          value={lon}
          onChange={e => setLon(e.target.value)}
        />

        <button onClick={calculate}>
          Calcular Ng
        </button>

      </div>

      {result && (

        <div>

          <b>Lat:</b> {result.lat}
          <b> Lon:</b> {result.lon}
          <b> Ng:</b> {result.ng} flashes/km²/año

        </div>

      )}

      <LightningMap
        dataset={dataset}
        setValue={handleMapClick}
        marker={marker}
      />

    </div>
  )
}