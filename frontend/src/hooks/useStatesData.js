import { useState, useEffect } from 'react';

// locally this hits localhost:5000
// in production REACT_APP_API_URL is set on Vercel to point to Render
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// custom hook — keeps all the fetch logic out of App.js
// returns states list, national summary, loading state, and a search function
export function useStatesData() {
  const [states,  setStates]  = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/states`).then(r => r.json()),
      fetch(`${API}/states/summary`).then(r => r.json()),
    ])
      .then(([sd, sum]) => {
        setStates(sd.data  || []);
        setSummary(sum.data || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setError('Could not connect to backend. Make sure the server is running on port 5000.');
        setLoading(false);
      });
  }, []);

  const fetchState = async stateName => {
    const res  = await fetch(`${API}/states/${encodeURIComponent(stateName)}`);
    const json = await res.json();
    return json.success ? json.data : null;
  };

  const searchStates = async q => {
    if (!q.trim()) return [];
    const res  = await fetch(`${API}/search?q=${q}`);
    const json = await res.json();
    return json.data || [];
  };

  return { states, summary, loading, error, fetchState, searchStates };
}
