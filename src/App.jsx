import { useEffect, useState } from "react"
import LightningMap from "./components/LightningMap"
import { getNg } from "./utils/ng"

const LEGEND_ITEMS = [
  { color: "#990000", range: "≥ 50",   name: "Extremo"  },
  { color: "#ff0000", range: "20 – 50", name: "Muy Alto" },
  { color: "#ff9900", range: "10 – 20", name: "Alto"     },
  { color: "#ffff00", range: "5 – 10",  name: "Moderado" },
  { color: "#00ff00", range: "2 – 5",   name: "Bajo"     },
  { color: "#00ffcc", range: "< 2",     name: "Muy Bajo" },
]

const NG_LEVELS = [
  { label: "Muy Bajo", level: 0 },
  { label: "Bajo",     level: 1 },
  { label: "Moderado", level: 2 },
  { label: "Alto",     level: 3 },
  { label: "Muy Alto", level: 4 },
  { label: "Extremo",  level: 5 },
]

function classifyNg(ng) {
  if (ng == null) return null
  if (ng < 2)  return NG_LEVELS[0]
  if (ng < 5)  return NG_LEVELS[1]
  if (ng < 10) return NG_LEVELS[2]
  if (ng < 20) return NG_LEVELS[3]
  if (ng < 50) return NG_LEVELS[4]
  return NG_LEVELS[5]
}

function LightningIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}

export default function App() {
  const [dataset, setDataset] = useState(null)
  const [result, setResult]   = useState(null)
  const [lat, setLat]         = useState("")
  const [lon, setLon]         = useState("")
  const [marker, setMarker]   = useState(null)

  useEffect(() => {
    fetch("/data/colombia_lightning.json")
      .then(r => r.json())
      .then(setDataset)
  }, [])

  function handleMapClick(value) {
    setResult(value)
    setMarker(value)
    setLat(value.lat.toFixed(4))
    setLon(value.lon.toFixed(4))
  }

  function calculate() {
    const ng = getNg(Number(lat), Number(lon), dataset)
    const value = { lat: Number(lat), lon: Number(lon), ng }
    setResult(value)
    setMarker(value)
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") calculate()
  }

  if (!dataset) return (
    <div className="lightning-app lightning-app--loading">
      <div className="loading-screen">
        <div className="loading-screen__icon">⚡</div>
        <p className="loading-screen__text">Cargando dataset…</p>
      </div>
    </div>
  )

  const classification = result ? classifyNg(result.ng) : null

  return (
    <div className="lightning-app">
      <div className="lightning-app__body">

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="lightning-app__sidebar">

          {/* Header / branding */}
          <header className="app-header">
            <div className="app-header__brand">
              <div className="app-header__icon">
                <LightningIcon />
              </div>
              <h1 className="app-header__title">Densidad de Rayos</h1>
            </div>
            <p className="app-header__subtitle">
              Colombia — DDT/Ng (rayos/km²/año)
            </p>
            <span className="app-header__badge">
              NASA LIS/OTD · HRFC V2.3 · 2015
            </span>
          </header>

          {/* Coordinate input */}
          <section className="control-panel">
            <div className="control-panel__heading">
              <span>Consultar coordenada</span>
            </div>
            <p className="control-panel__hint">
              Ingresa las coordenadas o haz clic directamente en el mapa.
            </p>
            <div className="control-panel__fields">
              <div className="control-panel__field">
                <label className="control-panel__label">Latitud</label>
                <input
                  className="control-panel__input"
                  type="number"
                  placeholder="ej. 4.7109"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="control-panel__field">
                <label className="control-panel__label">Longitud</label>
                <input
                  className="control-panel__input"
                  type="number"
                  placeholder="ej. -74.0721"
                  value={lon}
                  onChange={e => setLon(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
            <button className="control-panel__submit" onClick={calculate}>
              Calcular DDT/Ng
            </button>
          </section>

          {/* Result card */}
          {result && (
            <div className="result-card">
              <div className="result-card__header">
                <span className="result-card__title">Resultado</span>
              </div>
              <div className="result-card__ng-value">
                <span className="value">{result.ng != null ? result.ng : "—"}</span>
                <span className="unit">fl/km²/año</span>
              </div>
              {classification && (
                <span className={`result-card__badge result-card__badge--${classification.level}`}>
                  {classification.label}
                </span>
              )}
              <div className="result-card__coords">
                <div className="result-card__coord-row">
                  <span className="result-card__coord-label">Lat</span>
                  <span className="result-card__coord-value">{result.lat.toFixed(4)}°</span>
                </div>
                <div className="result-card__coord-row">
                  <span className="result-card__coord-label">Lon</span>
                  <span className="result-card__coord-value">{result.lon.toFixed(4)}°</span>
                </div>
              </div>
            </div>
          )}

        </aside>

        {/* ── Map ──────────────────────────────────────────────────────── */}
        <main className="lightning-app__map">
          <LightningMap
            dataset={dataset}
            setValue={handleMapClick}
            marker={marker}
          />

          {/* Leyenda flotante */}
          <div className="map-legend">
            <p className="map-legend__title">Escala Ng</p>
            <div className="map-legend__gradient" />
            <div className="map-legend__gradient-labels">
              <span>0</span>
              <span>50+</span>
            </div>
            <div className="map-legend__list">
              {LEGEND_ITEMS.map(item => (
                <div key={item.range} className="map-legend__item">
                  <div
                    className="map-legend__swatch"
                    style={{ background: item.color }}
                  />
                  <span className="map-legend__range">{item.range}</span>
                  <span className="map-legend__name">{item.name}</span>
                </div>
              ))}
            </div>
            <p className="map-legend__unit">rayos / km² / año</p>
          </div>
        </main>

      </div>
    </div>
  )
}
