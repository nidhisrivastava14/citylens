// number formatter - shows 1.2Cr / 45.6L / 3.2K
export const fmt = n =>
  n >= 1e7 ? (n / 1e7).toFixed(1) + 'Cr' :
  n >= 1e5 ? (n / 1e5).toFixed(1) + 'L'  :
  n >= 1e3 ? (n / 1e3).toFixed(1) + 'K'  :
  String(n);

// AQI color scale (based on India CPCB standard)
export const getAQIColor = aqi => {
  if (aqi <= 50)  return '#00c964';
  if (aqi <= 100) return '#a3c940';
  if (aqi <= 150) return '#f5a623';
  if (aqi <= 200) return '#e84c1e';
  if (aqi <= 300) return '#b40032';
  return '#7b0031';
};

export const getAQILabel = aqi => {
  if (aqi <= 50)  return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy (Sensitive)';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Severe';
};

// color for map markers based on indicator value
export const getMarkerColor = (val, min, max, indicator) => {
  if (val === null || val === undefined) return 'rgba(100,116,139,0.6)';
  const r = Math.min(1, Math.max(0, (val - min) / (max - min || 1)));

  if (indicator === 'literacy') {
    const g = Math.round(80 + (200 - 80) * r);
    const b = Math.round(40 + (100 - 40) * r);
    return `rgba(20,${g},${b},0.85)`;
  }
  if (indicator === 'population') {
    const alpha = (0.35 + 0.65 * r).toFixed(2);
    return `rgba(79,142,247,${alpha})`;
  }
  // crime / aqi — red scale
  const red = Math.round(20 + (232 - 20) * r);
  const g   = Math.round(80 + (30 - 80) * r);
  return `rgba(${red},${g},30,0.85)`;
};

// grade a state A-F based on crime, literacy, aqi
export const getGrade = state => {
  const crimeScore = state.rates[2] < 20 ? 4 : state.rates[2] < 35 ? 3 : state.rates[2] < 55 ? 2 : 1;
  const litScore   = state.literacy > 85 ? 4 : state.literacy > 75 ? 3 : state.literacy > 65 ? 2 : 1;
  const aqiScore   = !state.avgAQI ? 2 : state.avgAQI < 60 ? 4 : state.avgAQI < 100 ? 3 : state.avgAQI < 150 ? 2 : 1;
  const score = crimeScore + litScore + aqiScore;

  if (score >= 11) return { grade: 'A', color: '#00c964', label: 'Excellent' };
  if (score >= 9)  return { grade: 'B', color: '#a3c940', label: 'Good' };
  if (score >= 7)  return { grade: 'C', color: '#f5a623', label: 'Average' };
  if (score >= 5)  return { grade: 'D', color: '#e84c1e', label: 'Below Avg' };
  return { grade: 'F', color: '#b40032', label: 'Poor' };
};

export const INDICATORS = [
  { key: 'crime',      label: 'Crime Rate', icon: '🔴', color: '#e84c1e' },
  { key: 'aqi',        label: 'Avg AQI',    icon: '🌫️', color: '#f5a623' },
  { key: 'literacy',   label: 'Literacy',   icon: '📚', color: '#00c9a7' },
  { key: 'population', label: 'Population', icon: '👥', color: '#4f8ef7' },
];
