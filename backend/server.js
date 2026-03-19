const express = require('express');
const cors    = require('cors');

const stateRoutes  = require('./routes/stateRoutes');
const cityRoutes   = require('./routes/cityRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// mount routes — each file handles its own endpoints
app.use('/api/states',  stateRoutes);
app.use('/api/cities',  cityRoutes);
app.use('/api/search',  searchRoutes);

// health check — Render pings this to confirm server is alive
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`\nCityLens API running on http://localhost:${PORT}`);
  console.log('Routes: /api/states  /api/cities  /api/search  /health\n');
});
