import React from 'react';
import Sparkline from './Sparkline';

function KPICard({ label, value, unit, color, sparkData, change }) {
  const isUp = change > 0;

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1rem',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {label}
        </div>
        {change !== undefined && (
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: isUp ? 'var(--accent)' : 'var(--teal)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
            <span style={{ fontSize: '0.55rem' }}>{isUp ? '△' : '▽'}</span>
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>

      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.4rem', color, lineHeight: 1, marginBottom: '0.4rem' }}>
        {value}
        {unit && <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: 3 }}>{unit}</span>}
      </div>

      {sparkData && <Sparkline data={sparkData} color={color} width={120} height={24} />}
    </div>
  );
}

export default KPICard;
