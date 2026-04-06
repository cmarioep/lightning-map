# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server (Vite HMR)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

No test suite is configured.

## Architecture

This is a React + Vite app for visualizing lightning strike density (DDT/Ng — rayos/km²/año) across Colombia, based on NASA LIS/OTD satellite data.

### Data Flow

1. `App.jsx` fetches `/public/data/colombia_lightning.json` on mount — a 38×32 grid covering Colombia at 0.5° resolution (NASA LIS/OTD HRFC V2.3 2015).
2. The grid data is passed to `LightningMap.jsx`, which generates a bilinear-interpolated canvas image rendered as a Leaflet `ImageOverlay`.
3. When a user clicks the map or enters coordinates manually, `utils/ng.js` does a grid-based lookup to return the Ng value for that point. `getNg` returns a **string** (already formatted with `.toFixed(2)`).

### Key Files

- [src/App.jsx](src/App.jsx) — root component; layout (sidebar + map), state management, coordinate input, result card, floating legend
- [src/components/LightningMap.jsx](src/components/LightningMap.jsx) — Leaflet map with bilinear-interpolated heatmap `ImageOverlay`; `BoundsController` fits and locks the view to the dataset bounds on mount
- [src/utils/ng.js](src/utils/ng.js) — coordinate-to-Ng lookup; returns a string via `.toFixed(2)`
- [public/data/colombia_lightning.json](public/data/colombia_lightning.json) — dataset: bounds lat [-5.25, 13.75], lon [-81.25, -65.25], 38×32 grid at 0.5°, k=0.25 factor applied

### Styling

SCSS with BEM methodology. Entry point: `src/styles/main.scss`.

| Partial | Block |
|---|---|
| `_variables.scss` | design tokens (colors, spacing, layout sizes) |
| `_base.scss` | reset + Leaflet overrides |
| `_lightning-app.scss` | `.lightning-app` — card layout (862×680px, centered) |
| `_app-header.scss` | `.app-header` — branding + badge |
| `_control-panel.scss` | `.control-panel` — coordinate inputs + button |
| `_result-card.scss` | `.result-card` — Ng value, classification badge, coords |
| `_map-legend.scss` | `.map-legend` — floating card on map (bottom-left) |

### Layout

Fixed-size card centered on page: sidebar `280px` + map `568px` = `848px` wide × `680px` tall.
Map width derived from Mercator aspect ratio of dataset bounds (lon_span / lat_mercator_span ≈ 0.856).

### Map Behavior

- `BoundsController` inside `MapContainer`: calls `invalidateSize()` + `fitBounds(bounds, { padding: [0,0] })` + `setMaxBounds` + `setMinZoom` on mount.
- `zoomSnap={0}` for fractional zoom so `fitBounds` fills the container edge-to-edge.
- `maxBoundsViscosity={1.0}` prevents panning outside the dataset bounds.
- Map cursor: `default` (arrow) normally, `grabbing` only while dragging.

### Color Scale Convention

Heatmap interpolates continuously between stops:
- `0` → cyan `#00ffcc` (Muy Bajo)
- `2` → green `#00ff00` (Bajo)
- `5` → yellow `#ffff00` (Moderado)
- `10` → orange `#ff9900` (Alto)
- `20` → red `#ff0000` (Muy Alto)
- `≥ 50` → dark red `#990000` (Extremo)
