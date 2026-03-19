const express = require('express');
const router  = express.Router();
const { CITY_AQI } = require('../data');

// GET /api/cities  — all cities, optionally filtered by state
// example: /api/cities?state=Kerala
router.get('/', (req, res) => {
  const { state } = req.query;
  let data = state
    ? CITY_AQI.filter(c => c.state.toLowerCase() === state.toLowerCase())
    : CITY_AQI;

  data = data.sort((a, b) => b.aqi - a.aqi);
  res.json({ success: true, count: data.length, data });
});

// GET /api/cities/worst  — top 10 most polluted cities nationally
router.get('/worst', (req, res) => {
  const data = [...CITY_AQI].sort((a, b) => b.aqi - a.aqi).slice(0, 10);
  res.json({ success: true, data });
});

// GET /api/cities/best  — top 10 cleanest cities nationally
router.get('/best', (req, res) => {
  const data = [...CITY_AQI].sort((a, b) => a.aqi - b.aqi).slice(0, 10);
  res.json({ success: true, data });
});

module.exports = router;
