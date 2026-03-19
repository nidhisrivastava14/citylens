const express = require('express');
const router  = express.Router();
const { STATE_DATA, CITY_AQI, STATE_COORDS } = require('../data');

const getAvgAQI = stateName => {
  const cities = CITY_AQI.filter(c => c.state === stateName);
  if (!cities.length) return null;
  return parseFloat((cities.reduce((a, c) => a + c.aqi, 0) / cities.length).toFixed(1));
};

// GET /api/states
router.get('/', (req, res) => {
  const data = STATE_DATA.map(s => ({
    ...s,
    coords: STATE_COORDS[s.state] || null,
    avgAQI: getAvgAQI(s.state),
  }));
  res.json({ success: true, count: data.length, data });
});

// GET /api/states/summary
// note: /summary and /ranking must come BEFORE /:name
// otherwise Express treats "summary" as a state name param
router.get('/summary', (req, res) => {
  const avgCrime    = parseFloat((STATE_DATA.reduce((a, s) => a + s.rates[2], 0) / STATE_DATA.length).toFixed(2));
  const avgLiteracy = parseFloat((STATE_DATA.reduce((a, s) => a + s.literacy, 0) / STATE_DATA.length).toFixed(1));
  const totalPop    = STATE_DATA.reduce((a, s) => a + s.pop, 0);
  const avgAQI      = parseFloat((CITY_AQI.reduce((a, c) => a + c.aqi, 0) / CITY_AQI.length).toFixed(1));
  const totalCrimes = STATE_DATA.reduce((a, s) => a + s.crimes[2], 0);

  res.json({
    success: true,
    data: { avgCrime, avgLiteracy, totalPop, avgAQI, totalCrimes, stateCount: STATE_DATA.length, cityCount: CITY_AQI.length },
  });
});

// GET /api/states/ranking?indicator=crime|aqi|literacy|population
router.get('/ranking', (req, res) => {
  const { indicator = 'crime', limit = 36 } = req.query;
  let sorted;

  if (indicator === 'crime') {
    sorted = [...STATE_DATA].filter(s => s.rates[2] < 200).sort((a, b) => b.rates[2] - a.rates[2]);
  } else if (indicator === 'aqi') {
    sorted = [...STATE_DATA].map(s => ({ ...s, avgAQI: getAvgAQI(s.state) })).filter(s => s.avgAQI).sort((a, b) => b.avgAQI - a.avgAQI);
  } else if (indicator === 'literacy') {
    sorted = [...STATE_DATA].sort((a, b) => b.literacy - a.literacy);
  } else if (indicator === 'population') {
    sorted = [...STATE_DATA].sort((a, b) => b.pop - a.pop);
  } else {
    return res.status(400).json({ success: false, message: 'Invalid indicator. Use: crime, aqi, literacy, population' });
  }

  res.json({ success: true, indicator, data: sorted.slice(0, parseInt(limit)) });
});

// GET /api/states/:name — single state full detail
router.get('/:name', (req, res) => {
  const name  = decodeURIComponent(req.params.name);
  const state = STATE_DATA.find(s => s.state.toLowerCase() === name.toLowerCase());

  if (!state) return res.status(404).json({ success: false, message: 'State not found' });

  const cities      = CITY_AQI.filter(c => c.state === state.state).sort((a, b) => b.aqi - a.aqi);
  const crimeChange = parseFloat(((state.rates[2] - state.rates[0]) / state.rates[0] * 100).toFixed(1));

  res.json({
    success: true,
    data: { ...state, coords: STATE_COORDS[state.state] || null, avgAQI: getAvgAQI(state.state), cities, crimeChange },
  });
});

module.exports = router;
