## CityLens — Data-Driven Dashboard for Indian State Insights

CityLens is a full-stack interactive dashboard designed to explore key socio-economic indicators across Indian states, including crime rate, air quality (AQI), literacy, and population. The goal is to provide an intuitive alternative to static datasets by enabling visual, comparative, and interactive exploration.

---

### Features

* **Interactive Map (Leaflet.js)**
  Visualize India at the state level. Click on any state to view detailed statistics.

* **Multi-Indicator Analysis**
  Dynamically switch between Crime Rate, AQI, Literacy, and Population.

* **Safe State Finder**
  Apply custom thresholds using sliders to identify states matching specific criteria.

* **State Report Cards**
  Automated grading system (A–F) based on selected indicators.

* **Custom Data Visualizations**

  * Crime vs Literacy scatter plot with trend line (built using raw SVG)
  * KPI cards with sparkline trends

* **Tableau Integration**
  Embedded dashboard for deeper analytical insights.

---

### Tech Stack

**Frontend**
React 18, Leaflet.js, custom CSS (no UI libraries)

**Backend**
Node.js, Express.js (REST API with 6 endpoints)

**Data Layer**
Currently static (`data.js`), with plans to migrate to a database and integrate live APIs.

---

### Running Locally

```bash
# Backend
cd backend
npm install
npm run dev   # runs on :5000

# Frontend
cd frontend
npm install
npm start     # runs on :3000
```

---

### Project Structure

```bash
citylens/
├── backend/
│   ├── server.js
│   ├── data.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── components/
    │   ├── hooks/
    │   └── utils/
    └── package.json
```

---

### Data Sources

* NCRB (Crime Data, 2021–2023)
* CPCB (Air Quality Index)
* Census 2011 (Literacy & Population)

*Note: Outliers such as Manipur (2023 crime rate) are excluded from comparative analysis to maintain data consistency.*

---

### Roadmap

* [ ] Migrate to database (MongoDB/PostgreSQL)
* [ ] Integrate live AQI API
* [ ] Improve mobile responsiveness
* [ ] Add district-level granularity
