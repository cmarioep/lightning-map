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

This is a React + Vite app for visualizing lightning strike density (Ng — flashes/km²/year) across Colombia, based on NASA LIS/OTD satellite data.

### Data Flow

1. `App.jsx` fetches `/public/data/colombia_lightning.json` on mount — a 38×32 grid covering Colombia at 0.5° resolution (NASA LIS/OTD HRFC V2.3 2015).
2. The grid data is passed to `LightningMap.jsx`, which renders color-coded rectangle overlays on a Leaflet map.
3. When a user clicks the map or enters coordinates manually, `utils/ng.js` does a grid-based lookup to return the Ng value for that point.

### Key Files

- [src/App.jsx](src/App.jsx) — root component; manages state (grid data, selected coordinates, Ng value), fetches data, handles coordinate input
- [src/components/LightningMap.jsx](src/components/LightningMap.jsx) — Leaflet map with heatmap grid overlay (react-leaflet + leaflet.heat); color scale from cyan (<2) to dark red (≥50)
- [src/utils/ng.js](src/utils/ng.js) — coordinate-to-Ng lookup; maps lat/lon to the nearest grid cell
- [public/data/colombia_lightning.json](public/data/colombia_lightning.json) — lightning density dataset with metadata (bounds, resolution, units)

### Stack

- React 19 + Vite 8 (Oxc compiler via `@vitejs/plugin-react`)
- Leaflet 1.9 + react-leaflet 5 for mapping
- leaflet.heat for heatmap rendering
- ESLint 9 flat config (`eslint.config.js`)
- Plain JavaScript/JSX (no TypeScript)

### Color Scale Convention

Grid cells are colored by Ng value:
- `< 2` → cyan `#00ffcc`
- `< 5` → green `#00ff00`
- `< 10` → yellow `#ffff00`
- `< 20` → orange `#ff9900`
- `< 50` → red `#ff0000`
- `≥ 50` → dark red `#990000`
