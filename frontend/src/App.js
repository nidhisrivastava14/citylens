import React, { useState, useCallback, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

import Navbar        from './components/Navbar';
import Sidebar       from './components/Sidebar';
import ComparePanel  from './components/ComparePanel';
import MapView       from './components/MapView';
import ScatterPlot   from './components/ScatterPlot';
import ReportCards   from './components/ReportCards';
import SafeCityFinder from './components/SafeCityFinder';
import Sparkline     from './components/Sparkline';

import { useStatesData }          from './hooks/useStatesData';
import { fmt, getAQIColor, getGrade, INDICATORS } from './utils/helpers';

// ── DEEP DIVE MODAL ───────────────────────────────────────────────────────────
function DeepDiveModal({ data, states, onClose }) {
  const [tab, setTab] = useState('overview');
  if (!data) return null;

  const maxRate   = Math.max(...data.rates);
  const isUp      = data.crimeChange > 0;
  const gradeInfo = getGrade(data);
  const cities    = data.cities || [];

  const tabs = [
    { id: 'overview', label: '📋 Overview'         },
    { id: 'scatter',  label: '📈 Crime vs Literacy' },
    { id: 'grades',   label: '🏆 Report Cards'      },
    { id: 'finder',   label: '🔍 Safe State Finder' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'var(--bg)', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>
              🔍 Deep Dive — <span style={{ color: 'var(--accent)' }}>{data.state}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>Full analytics view</div>
          </div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '2rem', color: gradeInfo.color, background: `${gradeInfo.color}15`, border: `1px solid ${gradeInfo.color}30`, borderRadius: 10, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {gradeInfo.grade}
          </div>
        </div>
        <button onClick={onClose} style={{ padding: '0.4rem 1rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--muted2)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
          ✕ Close
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', padding: '0.6rem 1.5rem', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: '0.8rem', fontWeight: tab === t.id ? 600 : 400, background: tab === t.id ? 'var(--accent)' : 'var(--card)', color: tab === t.id ? '#fff' : 'var(--muted)', transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ background: isUp ? 'rgba(232,76,30,0.08)' : 'rgba(0,201,167,0.08)', border: `1px solid ${isUp ? 'rgba(232,76,30,0.25)' : 'rgba(0,201,167,0.25)'}`, borderRadius: 12, padding: '0.9rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: isUp ? 'var(--accent)' : 'var(--teal)' }}>
              <span style={{ fontSize: '1.1rem' }}>{isUp ? '📈' : '📉'}</span>
              Crime {isUp ? 'increased' : 'decreased'} by {Math.abs(data.crimeChange)}% from 2021 to 2023 •
              <span style={{ color: 'var(--muted2)', fontWeight: 400 }}>Grade: <strong style={{ color: gradeInfo.color }}>{gradeInfo.grade} — {gradeInfo.label}</strong></span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Crime Rate 2023', val: data.rates[2],             unit: '/lakh', color: 'var(--accent)',  spark: data.rates },
                { label: 'Crime Rate 2021', val: data.rates[0],             unit: '/lakh', color: 'var(--muted2)'  },
                { label: 'Literacy Rate',   val: data.literacy + '%',                      color: 'var(--teal)'    },
                { label: 'Avg AQI',         val: data.avgAQI || 'N/A',                     color: 'var(--accent2)' },
                { label: 'Population',      val: fmt(data.pop),                            color: 'var(--blue)'    },
                { label: 'Crimes 2023',     val: data.crimes[2].toLocaleString(),          color: 'var(--purple)'  },
              ].map(k => (
                <div key={k.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>{k.label}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: k.color }}>
                    {k.val}{k.unit && <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: 2 }}>{k.unit}</span>}
                  </div>
                  {k.spark && <Sparkline data={k.spark} color={k.color} width={120} height={22} />}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '1rem' }}>Crime Rate Trend</div>
                {['2021', '2022', '2023'].map((yr, i) => (
                  <div key={yr} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', width: 32 }}>{yr}</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 4, width: (data.rates[i] / maxRate * 100) + '%', background: i === 2 ? 'linear-gradient(90deg,var(--accent),var(--accent2))' : 'var(--border2)', transition: 'width 0.8s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: i === 2 ? 'var(--accent)' : 'var(--muted2)', width: 40, textAlign: 'right' }}>{data.rates[i]}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '1rem' }}>Cities by AQI</div>
                {cities.length === 0 ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center', paddingTop: '1rem' }}>No city AQI data</div>
                ) : cities.slice(0, 8).map((c, i) => (
                  <div key={c.city} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--muted)', width: 14 }}>{i + 1}</span>
                    <span style={{ fontSize: '0.78rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.city}</span>
                    <div style={{ width: 60, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 2, width: (c.aqi / cities[0].aqi * 100) + '%', background: getAQIColor(c.aqi) }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getAQIColor(c.aqi), minWidth: 36, textAlign: 'right' }}>{c.aqi}</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--muted)', width: 36 }}>{c.pollutant}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'scatter' && (
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <ScatterPlot states={states} />
            <div style={{ marginTop: '1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted2)', marginBottom: '0.4rem' }}>What This Shows</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                The blue dashed trend line shows a <strong style={{ color: 'var(--teal)' }}>negative correlation</strong> — as literacy increases, crime rate tends to decrease.
                States like Kerala (93.7% literacy, 30.7 crime) support this. However Delhi (86.5% literacy, 65.9 crime) shows urbanization can override this effect.
              </div>
            </div>
          </div>
        )}
        {tab === 'grades' && (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <ReportCards states={states} />
          </div>
        )}
        {tab === 'finder' && (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <SafeCityFinder states={states} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── TABLEAU MODAL ─────────────────────────────────────────────────────────────
function TableauModal({ onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // create the viz container div
    const div = document.createElement('div');
    div.id = 'tableauVizContainer';
    div.style.cssText = 'position:relative;width:100%;height:100%;';

    const obj = document.createElement('object');
    obj.className = 'tableauViz';
    obj.style.cssText = 'display:none;';

    const params = [
      ['host_url',             'https%3A%2F%2Fpublic.tableau.com%2F'],
      ['embed_code_version',   '3'],
      ['site_root',            ''],
      ['name',                 'citylens_1/CityLensDashboard'],
      ['tabs',                 'no'],
      ['toolbar',              'yes'],
      ['static_image',         'https://public.tableau.com/static/images/ci/citylens_1/CityLensDashboard/1.png'],
      ['animate_transition',   'yes'],
      ['display_static_image', 'yes'],
      ['display_spinner',      'yes'],
      ['display_overlay',      'yes'],
      ['display_count',        'yes'],
      ['language',             'en-US'],
      ['filter',               'publish=yes'],
    ];

    params.forEach(([name, value]) => {
      const p = document.createElement('param');
      p.name  = name;
      p.value = value;
      obj.appendChild(p);
    });

    div.appendChild(obj);
    containerRef.current.appendChild(div);

    // inject Tableau script
    const script = document.createElement('script');
    script.src   = 'https://public.tableau.com/javascripts/api/viz_v1.js';
    obj.parentNode.insertBefore(script, obj);

    return () => {
      // cleanup on unmount
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', flexDirection: 'column', background: 'rgba(5,7,12,0.97)', animation: 'fadeIn 0.25s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'blink 2s infinite' }} />
          <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '0.95rem' }}>CityLens — Tableau Dashboard</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>
            Interactive • Click states to filter
          </span>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--muted2)', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted2)'; }}>
          ✕
        </button>
      </div>
      <div ref={containerRef} style={{ flex: 1, overflow: 'auto', background: '#fff' }} />
      <div style={{ display: 'flex', gap: '1.5rem', padding: '0.6rem 1.5rem', borderTop: '1px solid var(--border)', flexShrink: 0, flexWrap: 'wrap' }}>
        {[['🖱️','Click a state to filter'],['🔄','Use dropdown to switch indicators'],['↩️','Click empty space to reset'],['📜','Scroll inside for more charts']].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--muted)' }}>
            <span>{icon}</span><span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LEGEND ────────────────────────────────────────────────────────────────────
function MapLegend({ indicator }) {
  return (
    <div style={{ position: 'absolute', bottom: '1rem', left: '0.75rem', zIndex: 500, background: 'rgba(12,15,24,0.92)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.6rem 0.9rem', backdropFilter: 'blur(12px)' }}>
      <div style={{ fontSize: '0.62rem', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: '0.35rem' }}>
        {INDICATORS.find(i => i.key === indicator)?.label}
      </div>
      <div style={{ display: 'flex', gap: '3px', marginBottom: '0.2rem' }}>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map(t => (
          <div key={t} style={{ width: 18, height: 6, borderRadius: 2, background: indicator === 'literacy' ? `rgba(20,${Math.round(80+(200-80)*t)},${Math.round(40+(100-40)*t)},0.85)` : indicator === 'population' ? `rgba(79,142,247,${(0.35+0.65*t).toFixed(2)})` : `rgba(${Math.round(20+(232-20)*t)},${Math.round(80+(30-80)*t)},30,0.85)` }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--muted)' }}>
        <span>Low</span><span>High</span>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { states, summary, loading, fetchState, searchStates } = useStatesData();
  const [selected,      setSelected]      = useState(null);
  const [compareState,  setCompareState]  = useState(null);
  const [deepDiveModal, setDeepDiveModal] = useState(false);
  const [showTableau,   setShowTableau]   = useState(false);
  const [indicator,     setIndicator]     = useState('crime');

  const selectState = useCallback(async stateName => {
    if (!selected) {
      const data = await fetchState(stateName);
      if (data) setSelected(data);
      return;
    }
    if (selected.state === stateName) {
      setSelected(compareState);
      setCompareState(null);
      return;
    }
    if (compareState?.state === stateName) {
      setCompareState(null);
      return;
    }
    const data = await fetchState(stateName);
    if (data) setCompareState(data);
  }, [selected, compareState, fetchState]);

  const handleReset = useCallback(() => {
    setSelected(null);
    setCompareState(null);
  }, []);

  const handleSearch = useCallback(async (q, isSelect = false) => {
    if (isSelect) { selectState(q); return []; }
    return searchStates(q);
  }, [selectState, searchStates]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar
        indicator={indicator}
        onIndicatorChange={setIndicator}
        onSearch={handleSearch}
        onTableauOpen={() => setShowTableau(true)}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: 300, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {compareState ? (
            <ComparePanel stateA={selected} stateB={compareState} onClose={handleReset} onClearB={() => setCompareState(null)} />
          ) : (
            <Sidebar loading={loading} selected={selected} summary={summary} states={states} onClose={handleReset} onStateDetail={() => {}} onDeepDive={() => setDeepDiveModal(true)} />
          )}
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <MapView states={states} indicator={indicator} selected={selected} compareState={compareState} onStateClick={selectState} onReset={handleReset} />

          {!selected && summary && (
            <div style={{ position: 'absolute', top: '0.75rem', left: '50%', transform: 'translateX(-50%)', zIndex: 500, display: 'flex', gap: '0.4rem', pointerEvents: 'none' }}>
              {[
                { val: summary.avgCrime,          label: 'Avg Crime',    color: 'var(--accent)'  },
                { val: summary.avgLiteracy + '%',  label: 'Avg Literacy', color: 'var(--teal)'    },
                { val: summary.avgAQI,             label: 'Avg AQI',      color: 'var(--accent2)' },
              ].map(c => (
                <div key={c.label} style={{ background: 'rgba(12,15,24,0.92)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.35rem 0.7rem', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem' }}>
                  <strong style={{ color: c.color }}>{c.val}</strong>
                  <span style={{ color: 'var(--muted)' }}>{c.label}</span>
                </div>
              ))}
            </div>
          )}

          {selected && !compareState && (
            <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 500, background: 'rgba(12,15,24,0.92)', border: '1px solid rgba(79,142,247,0.3)', borderRadius: 8, padding: '0.4rem 0.75rem', backdropFilter: 'blur(12px)', fontSize: '0.7rem', color: 'var(--blue)', pointerEvents: 'none' }}>
              ⚖️ Click another state to compare
            </div>
          )}

          <MapLegend indicator={indicator} />

          {selected && (
            <button onClick={handleReset} style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 500, padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--muted2)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', backdropFilter: 'blur(12px)' }}>
              ↩ Reset View
            </button>
          )}
        </div>
      </div>

      {deepDiveModal && selected && (
        <DeepDiveModal data={selected} states={states} onClose={() => setDeepDiveModal(false)} />
      )}

      {showTableau && <TableauModal onClose={() => setShowTableau(false)} />}
    </div>
  );
}