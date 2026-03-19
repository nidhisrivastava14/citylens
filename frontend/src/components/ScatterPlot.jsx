import React, { useState } from 'react';

// SVG scatter plot — crime rate vs literacy rate
// I built this manually instead of using a chart lib so I could control the tooltip styling
const W = 480, H = 260, PL = 48, PR = 20, PT = 16, PB = 40;

function ScatterPlot({ states }) {
  const [hov, setHov] = useState(null);

  // filter out Manipur 2023 (conflict spike — not meaningful for this analysis)
  const filtered = states.filter(s => s.rates[2] < 200);

  const xs   = filtered.map(s => s.literacy);
  const ys   = filtered.map(s => s.rates[2]);
  const xmin = Math.min(...xs) - 2, xmax = Math.max(...xs) + 2;
  const ymin = 0,                   ymax = Math.max(...ys) + 5;

  const toX = v => PL + (v - xmin) / (xmax - xmin) * (W - PL - PR);
  const toY = v => PT + (1 - (v - ymin) / (ymax - ymin)) * (H - PT - PB);

  // linear regression to draw trend line
  const n      = filtered.length;
  const sx     = xs.reduce((a, b) => a + b, 0);
  const sy     = ys.reduce((a, b) => a + b, 0);
  const sxy    = filtered.reduce((a, s) => a + s.literacy * s.rates[2], 0);
  const sx2    = xs.reduce((a, b) => a + b * b, 0);
  const slope  = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  const intercept = (sy - slope * sx) / n;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.25rem' }}>
        Crime Rate vs Literacy Rate
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>
        Each dot = one state • Trend line shows negative correlation
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Grid */}
        {[20, 40, 60, 80].map(v => (
          <line key={v} x1={PL} x2={W - PR} y1={toY(v)} y2={toY(v)} stroke="var(--border)" strokeWidth="1" />
        ))}

        {/* Trend line */}
        <line
          x1={toX(xmin)} y1={toY(slope * xmin + intercept)}
          x2={toX(xmax)} y2={toY(slope * xmax + intercept)}
          stroke="#4f8ef7" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6"
        />

        {/* Dots */}
        {filtered.map((s, i) => (
          <circle
            key={s.state}
            cx={toX(s.literacy)} cy={toY(s.rates[2])}
            r={hov === i ? 7 : 5}
            fill={s.rates[2] > 60 ? '#e84c1e' : s.rates[2] > 35 ? '#f5a623' : '#00c9a7'}
            stroke={hov === i ? '#fff' : 'transparent'} strokeWidth="1.5"
            style={{ cursor: 'pointer', transition: 'r 0.15s' }}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            opacity="0.85"
          />
        ))}

        {/* Hover tooltip */}
        {hov !== null && (() => {
          const s  = filtered[hov];
          const cx = toX(s.literacy), cy = toY(s.rates[2]);
          const tx = cx > W - 140 ? cx - 130 : cx + 10;
          const ty = cy < 40 ? cy + 10 : cy - 42;
          return (
            <g>
              <rect x={tx} y={ty} width={120} height={36} rx="6" fill="rgba(12,15,24,0.97)" stroke="var(--border2)" />
              <text x={tx + 8} y={ty + 14} fontSize="9" fill="white" fontWeight="700">{s.state}</text>
              <text x={tx + 8} y={ty + 26} fontSize="8" fill="var(--muted2)">
                Literacy: {s.literacy}% | Crime: {s.rates[2]}
              </text>
            </g>
          );
        })()}

        {/* Axes */}
        <line x1={PL} y1={PT} x2={PL} y2={H - PB} stroke="var(--border2)" strokeWidth="1" />
        <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="var(--border2)" strokeWidth="1" />

        {[0, 20, 40, 60, 80].map(v => (
          <text key={v} x={PL - 6} y={toY(v) + 3} fontSize="8" fill="var(--muted)" textAnchor="end">{v}</text>
        ))}
        {[60, 70, 80, 90].map(v => (
          <text key={v} x={toX(v)} y={H - PB + 12} fontSize="8" fill="var(--muted)" textAnchor="middle">{v}%</text>
        ))}

        <text x={W / 2} y={H - 2}   fontSize="8" fill="var(--muted)" textAnchor="middle">Literacy Rate (%)</text>
        <text x={10} y={H / 2} fontSize="8" fill="var(--muted)" textAnchor="middle" transform={`rotate(-90,10,${H / 2})`}>
          Crime Rate / Lakh
        </text>
      </svg>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        {[['#00c964', 'Low Crime (<35)'], ['#f5a623', 'Medium Crime (35-60)'], ['#e84c1e', 'High Crime (>60)']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: 'var(--muted)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScatterPlot;
