# Anomaly Detection

FinOps anomaly detection dashboard prototype, styled to match OPulse. Detects two anomaly types:

- **Budget-based** — cost that has exceeded a configured budget.
- **Pattern-based** — an unusual spike detected against a 30-day cost baseline.

Built with React + TypeScript + Vite, using Chart.js (via `react-chartjs-2`) for the timeline and distribution charts.

## Features

- 30-day anomaly timeline with per-day cost-impact tooltips
- Distribution donut chart, toggle between "By Provider" and "By Service"
- Sortable, filterable, searchable tables for both anomaly types
- "Save for later review" marker per anomaly, persisted in `localStorage`
- Fluid layout that scales proportionally from laptop to large monitors

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build locally
