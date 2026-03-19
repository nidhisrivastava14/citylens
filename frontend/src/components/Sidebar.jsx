import React from 'react';
import KPICard from './KPICard';
import Sparkline from './Sparkline';
import { fmt, getAQIColor } from '../utils/helpers';

function Sidebar({ loading, selected, summary, states, onClose, onStateDetail, onDeepDive }) {
  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ width: 28, height: 28, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Loading data...</span>
      </div>
    );
  }

  if (!selected) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: '0.75rem' }}>
          National Overview
        </div>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <KPICard label="Avg Crime Rate"   value={summary?.avgCrime}          unit="per lakh" color="var(--accent)"  sparkData={states.slice(0, 8).map(s => s.rates?.[2]).filter(Boolean)} />
          <KPICard label="Avg Literacy"     value={summary?.avgLiteracy}       unit="%"        color="var(--teal)"   sparkData={states.slice(0, 8).map(s => s.literacy)} />
          <KPICard label="Avg AQI"          value={summary?.avgAQI}                            color="var(--accent2)" sparkData={states.slice(0, 8).map(s => s.avgAQI).filter(Boolean)} />
          <KPICard label="Total Population" value={fmt(summary?.totalPop)}                     color="var(--blue)" />
        </div>
      </div>
    );
  }

  const maxR = Math.max(...(selected.rates || []));

  return (
    <div style={{ flex: 1, overflowY: 'auto', animation: 'slideLeft 0.3s ease' }}>
      {/* State header */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.1 }}>{selected.state}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>Pop: {fmt(selected.pop)}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', fontSize: '0.7rem', padding: '0.25rem 0.5rem', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>✕</button>
        </div>

        {/* Mini stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.75rem' }}>
          {[
            { label: 'Crime Rate', val: selected.rates?.[2], unit: '/lakh', color: 'var(--accent)', spark: selected.rates },
            { label: 'Literacy',   val: selected.literacy + '%',            color: 'var(--teal)'   },
            { label: 'Avg AQI',    val: selected.avgAQI || 'N/A',           color: 'var(--accent2)'},
            { label: 'Population', val: fmt(selected.pop),                  color: 'var(--blue)'   },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.6rem' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>{k.label}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1rem', color: k.color }}>
                {k.val}
                {k.unit && <span style={{ fontSize: '0.6rem', color: 'var(--muted)', marginLeft: 2 }}>{k.unit}</span>}
              </div>
              {k.spark && <Sparkline data={k.spark} color={k.color} width={80} height={18} />}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={onStateDetail} style={{ flex: 1, padding: '0.45rem', borderRadius: 8, background: 'linear-gradient(135deg,rgba(232,76,30,0.15),rgba(245,166,35,0.1))', border: '1px solid rgba(232,76,30,0.3)', color: 'var(--accent)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
            📋 State Detail
          </button>
          <button onClick={onDeepDive} style={{ flex: 1, padding: '0.45rem', borderRadius: 8, background: 'linear-gradient(135deg,rgba(79,142,247,0.15),rgba(0,201,167,0.1))', border: '1px solid rgba(79,142,247,0.3)', color: 'var(--blue)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
            🔍 Full Deep Dive
          </button>
        </div>
      </div>

      {/* Crime trend */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: '0.5rem' }}>
          Crime Rate Trend
        </div>
        {['2021', '2022', '2023'].map((yr, i) => (
          <div key={yr} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--muted)', width: 28 }}>{yr}</span>
            <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, width: (selected.rates[i] / maxR * 100) + '%', background: i === 2 ? 'linear-gradient(90deg,var(--accent),var(--accent2))' : 'var(--border2)', transition: 'width 0.8s ease' }} />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: i === 2 ? 'var(--accent)' : 'var(--muted2)', width: 35, textAlign: 'right' }}>{selected.rates[i]}</span>
          </div>
        ))}
      </div>

      {/* Cities AQI */}
      {selected.cities?.length > 0 && (
        <div style={{ padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: '0.5rem' }}>
            Cities by AQI
          </div>
          {selected.cities.slice(0, 7).map((c, i) => (
            <div key={c.city} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--muted)', width: 14 }}>{i + 1}</span>
              <span style={{ fontSize: '0.75rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.city}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: getAQIColor(c.aqi), background: `${getAQIColor(c.aqi)}18`, padding: '0.1rem 0.4rem', borderRadius: 4 }}>
                {c.aqi}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
