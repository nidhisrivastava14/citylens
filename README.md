# CityLens

A fullstack dashboard for exploring crime, air quality, literacy and population data across Indian states. Built this because my friend was doing data analytics research on state-level indicators and we wanted a better way to explore the data than reading through spreadsheets.

## What it does

- Interactive Leaflet map of India — click any state to see its stats
- Switch between 4 indicators: Crime Rate, AQI, Literacy, Population
- Safe State Finder — set your own thresholds with sliders and find states that match
- State report cards graded A–F
- Crime vs Literacy scatter plot with trend line (built manually in SVG, no chart lib)
- Tableau dashboard integration for deeper cuts

## Stack

**Frontend** — React 18, Leaflet.js for the map, CSS variables for theming. No UI lib, everything is custom.

**Backend** — Node.js + Express. 6 REST endpoints. Data lives in `data.js` for now — eventually want to move this to a proper DB and pull live data.

## Running locally

You need Node.js installed. Then open two terminals:

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev      # runs on :5000
```

```bash
# Terminal 2 — frontend
cd frontend
npm install
npm start        # runs on :3000
```

## Project structure

```
citylens/
├── backend/
│   ├── server.js          express API, 6 routes
│   ├── data.js            state + city dataset
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js                 root component + modals
    │   ├── components/
    │   │   ├── Navbar.jsx         top nav with indicator switcher + search
    │   │   ├── Sidebar.jsx        state detail panel
    │   │   ├── MapView.jsx        leaflet map wrapper
    │   │   ├── KPICard.jsx        stat card with sparkline
    │   │   ├── Sparkline.jsx      tiny SVG trend line
    │   │   ├── ScatterPlot.jsx    crime vs literacy chart (raw SVG)
    │   │   ├── ReportCards.jsx    A-F graded state cards
    │   │   └── SafeCityFinder.jsx slider-based state filter
    │   ├── hooks/
    │   │   └── useStatesData.js   data fetching hook
    │   └── utils/
    │       └── helpers.js         formatters, color fns, grading logic
    └── package.json
```

## Data

Crime data is from NCRB (National Crime Records Bureau) reports for 2021–2023.
AQI data is from CPCB (Central Pollution Control Board).
Literacy and population from Census 2011 (latest available at state level).

Note: Manipur 2023 crime rate (561/lakh) is excluded from comparisons — this is due to the ethnic conflict that year, not a regular law-and-order figure.

## TODO
- [ ] Add a database (currently all data is hardcoded)
- [ ] Live AQI feed from CPCB API
- [ ] Mobile responsive layout
- [ ] Add district-level data
