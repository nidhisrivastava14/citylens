import React, { useState } from 'react';
import { getGrade, getAQILabel, getAQIColor } from '../utils/helpers';

const PRESETS = [
  { label: '🏆 Best Overall',   maxCrime: 35, minLit: 75, maxAQI: 130, color: '#00c9a7' },
  { label: '🌿 Clean Air',      maxCrime: 80, minLit: 60, maxAQI: 100, color: '#a3c940' },
  { label: '📚 High Literacy',  maxCrime: 80, minLit: 82, maxAQI: 175, color: '#4f8ef7' },
  { label: '🔒 Low Crime',      maxCrime: 25, minLit: 60, maxAQI: 175, color: '#e84c1e' },
];

function SafeCityFinder({ states }) {
  const [maxCrime, setMaxCrime] = useState(60);
  const [minLit,   setMinLit]   = useState(65);
  const [maxAQI,   setMaxAQI]   = useState(175);
  const [preset,   setPreset]   = useState(null);

  // skip states without AQI data and the Manipur 2023 outlier
  const validStates = states.filter(s => s.avgAQI && s.rates[2] < 200);

  const applyPreset = p => {
    setMaxCrime(p.maxCrime);
    setMinLit(p.minLit);
    setMaxAQI(p.maxAQI);
    setPreset(p.label);
  };

  const reset = () => { setMaxCrime(60); setMinLit(65); setMaxAQI(175); setPreset(null); };

  const results = validStates
    .filter(s => s.rates[2] <= maxCrime && s.literacy >= minLit && s.avgAQI <= maxAQI)
    .sort((a, b) => {
      const scoreA = (100 - a.rates[2]) + a.literacy + (200 - a.avgAQI);
      const scoreB = (100 - b.rates[2]) + b.literacy + (200 - b.avgAQI);
      return scoreB - scoreA;
    });

  const sliders = [
    { label: 'Max Crime Rate',  desc: `Below ${maxCrime} per lakh`, val: maxCrime, set: setMaxCrime, min: 5,  max: 120, step: 5,  unit: '/lakh', color: 'var(--accent)' },
    { label: 'Min Literacy Rate', desc: `At least ${minLit}%`,      val: minLit,   set: setMinLit,   min: 50, max: 95,  step: 1,  unit: '%',     color: 'var(--teal)'   },
    { label: 'Max AQI',         desc: getAQILabel(maxAQI),          val: maxAQI,   set: setMaxAQI,   min: 50, max: 250, step: 10, unit: '',       color: getAQIColor(maxAQI) },
  ];

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Safe State Finder
        </div>
        <button onClick={reset} style={{ fontSize: '0.68rem', color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '0.2rem 0.5rem', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
          Reset
        </button>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.9rem' }}>
        Only showing states with available AQI data ({validStates.length} states)
      </div>

      {/* Presets */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.4rem' }}>Quick Presets</div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              style={{
                padding: '0.35rem 0.7rem', borderRadius: 8,
                border: `1px solid ${preset === p.label ? p.color : 'var(--border)'}`,
                background: preset === p.label ? `${p.color}18` : 'var(--surface)',
                color: preset === p.label ? p.color : 'var(--muted2)',
                fontSize: '0.72rem', fontWeight: preset === p.label ? 700 : 400,
                cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all 0.15s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
        {sliders.map(sl => (
          <div key={sl.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text)', fontWeight: 600 }}>{sl.label}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--muted)', marginLeft: '0.4rem' }}>{sl.desc}</span>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: sl.color, background: `${sl.color}15`, padding: '0.15rem 0.5rem', borderRadius: 5 }}>
                {sl.val}{sl.unit}
              </span>
            </div>
            <input
              type="range" min={sl.min} max={sl.max} step={sl.step} value={sl.val}
              onChange={e => { sl.set(Number(e.target.value)); setPreset(null); }}
              style={{ width: '100%', accentColor: sl.color, cursor: 'pointer', height: 4 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
              <span>{sl.min}{sl.unit}</span><span>{sl.max}{sl.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.8rem', color: results.length > 0 ? 'var(--teal)' : 'var(--accent)', lineHeight: 1 }}>
            {results.length}
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>
              {results.length === 0 ? 'No matching states' : 'States match your criteria'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>Sorted by best overall score</div>
          </div>
          {results.length > 0 && (
            <div style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.2rem 0.5rem' }}>
              #1 best: {results[0].state.split(' ')[0]}
            </div>
          )}
        </div>

        {results.length === 0 ? (
          <div style={{ background: 'rgba(232,76,30,0.06)', border: '1px dashed rgba(232,76,30,0.3)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🔍</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted2)', fontWeight: 600, marginBottom: '0.25rem' }}>No states found</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Try a preset or relax your sliders</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 320, overflowY: 'auto' }}>
            {results.map((s, i) => {
              const g     = getGrade(s);
              const isTop = i === 0;
              const bars  = [
                { label: 'Crime',   val: s.rates[2], max: 120, color: 'var(--accent)',        display: s.rates[2] + '/L',                          lowerBetter: true  },
                { label: 'Literacy',val: s.literacy,  max: 100, color: 'var(--teal)',          display: s.literacy + '%',                           lowerBetter: false },
                { label: 'AQI',     val: s.avgAQI,    max: 200, color: getAQIColor(s.avgAQI), display: s.avgAQI + ' — ' + getAQILabel(s.avgAQI),   lowerBetter: true  },
              ];
              return (
                <div key={s.state} style={{ background: isTop ? `${g.color}0d` : 'var(--surface)', border: `1px solid ${isTop ? g.color + '50' : 'var(--border)'}`, borderRadius: 10, padding: '0.75rem 0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)', flexShrink: 0 }}>#{i + 1}</span>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)', flex: 1 }}>{s.state}</span>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1rem', color: g.color, background: `${g.color}18`, border: `1px solid ${g.color}30`, borderRadius: 6, padding: '0.1rem 0.5rem', flexShrink: 0 }}>{g.grade}</span>
                    {isTop && <span style={{ background: g.color, fontSize: '0.55rem', fontWeight: 700, color: '#fff', padding: '0.15rem 0.5rem', borderRadius: 5, flexShrink: 0 }}>BEST</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {bars.map(bar => {
                      const pct = bar.lowerBetter ? (1 - Math.min(bar.val / bar.max, 1)) * 100 : Math.min(bar.val / bar.max, 1) * 100;
                      return (
                        <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.6rem', color: 'var(--muted)', width: 42, flexShrink: 0 }}>{bar.label}</span>
                          <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: pct + '%', background: bar.color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                          </div>
                          <span style={{ fontSize: '0.62rem', color: bar.color, fontWeight: 600, minWidth: 80, textAlign: 'right' }}>{bar.display}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SafeCityFinder;
