const express = require('express');
const router  = express.Router();
const { STATE_DATA, STATE_COORDS } = require('../data');

// GET /api/search?q=delhi  — autocomplete for the navbar search bar
// returns max 5 matching states
router.get('/', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json({ success: true, data: [] });

  const data = STATE_DATA
    .filter(s => s.state.toLowerCase().includes(q))
    .slice(0, 5)
    .map(s => ({ state: s.state, coords: STATE_COORDS[s.state] || null }));

  res.json({ success: true, data });
});

module.exports = router;
