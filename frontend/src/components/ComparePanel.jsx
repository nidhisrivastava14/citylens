import React from 'react';
import { fmt, getAQIColor, getGrade } from '../utils/helpers';
import Sparkline from './Sparkline';

// returns 'a', 'b', or 'tie' — used to highlight the winner per metric
// lowerBetter = true for crime and AQI, false for literacy and population
const winner = (a, b, lowerBetter) => {
  if (a === null || b === null) return 'tie';
  if (a === b) return 'tie';
  return lowerBetter ? (a < b ? 'a' : 'b') : (a > b ? 'a' : 'b');
};

const WIN_COLOR  = 'var(--teal)';
const LOSE_COLOR = 'var(--muted)';

function StatRow({ label, valA, valB, winSide, unit = '', formatFn }) {
  const displayA = formatFn ? formatFn(valA) : (valA ?? 'N/A');
  const displayB = formatFn ? formatFn(valB) : (valB ?? 'N/A');
  const aWins = winSide === 'a';
  const bWins = winSide === 'b';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
      {/* State A value */}
      <div style={{ textAlign: 'right' }}>
        <span style={{
          fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '0.95rem',
          color: aWins ? WIN_COLOR : bWins ? LOSE_COLOR : 'var(--text)',
        }}>
          {displayA}{unit && <span style={{ fontSize: '0.65rem', marginLeft: 2 }}>{unit}</span>}
        </span>
        {aWins && <span style={{ fontSize: '0.6rem', color: WIN_COLOR, marginLeft: 4 }}>✓</span>}
      </div>

      {/* Label in center */}
      <div style={{ fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center', minWidth: 70 }}>
        {label}
      </div>

      {/* State B value */}
      <div style={{ textAlign: 'left' }}>
        {bWins && <span style={{ fontSize: '0.6rem', color: WIN_COLOR, marginRight: 4 }}>✓</span>}
        <span style={{
          fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '0.95rem',
          color: bWins ? WIN_COLOR : aWins ? LOSE_COLOR : 'var(--text)',
        }}>
          {displayB}{unit && <span style={{ fontSize: '0.65rem', marginLeft: 2 }}>{unit}</span>}
        </span>
      </div>
    </div>
  );
}

function ComparePanel({ stateA, stateB, onClose, onClearB }) {
  if (!stateA || !stateB) return null;

  const gradeA = getGrade(stateA);
  const gradeB = getGrade(stateB);

  // overall winner — tally wins across the 4 metrics
  const metrics = [
    { a: stateA.rates?.[2], b: stateB.rates?.[2], lowerBetter: true  },
    { a: stateA.literacy,   b: stateB.literacy,   lowerBetter: false },
    { a: stateA.avgAQI,     b: stateB.avgAQI,     lowerBetter: true  },
    { a: stateA.pop,        b: stateB.pop,         lowerBetter: false },
  ];
  const winsA = metrics.filter(m => winner(m.a, m.b, m.lowerBetter) === 'a').length;
  const winsB = metrics.filter(m => winner(m.a, m.b, m.lowerBetter) === 'b').length;
  const overallWinner = winsA > winsB ? stateA.state : winsB > winsA ? stateB.state : null;

  return (
    <div style={{ flex: 1, overflowY: 'auto', animation: 'slideLeft 0.3s ease' }}>

      {/* Header */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            ⚖️ Comparing States
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={onClearB}
              style={{ fontSize: '0.65rem', color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '0.2rem 0.5rem', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}
            >
              Clear B
            </button>
            <button
              onClick={onClose}
              style={{ fontSize: '0.65rem', color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '0.2rem 0.5rem', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Two state name headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(232,76,30,0.08)', border: '1px solid rgba(232,76,30,0.2)', borderRadius: 10, padding: '0.6rem 0.75rem' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>State A</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>{stateA.state}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: gradeA.color, fontFamily: 'Syne,sans-serif' }}>{gradeA.grade}</div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>VS</div>

          <div style={{ background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 10, padding: '0.6rem 0.75rem' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>State B</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>{stateB.state}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: gradeB.color, fontFamily: 'Syne,sans-serif' }}>{gradeB.grade}</div>
          </div>
        </div>
      </div>

      {/* Overall winner banner */}
      {overallWinner && (
        <div style={{ margin: '0.75rem 1rem 0', background: 'rgba(0,201,167,0.08)', border: '1px solid rgba(0,201,167,0.25)', borderRadius: 10, padding: '0.6rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>🏆</span>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)' }}>{overallWinner} wins overall</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>{Math.max(winsA, winsB)} out of 4 metrics</div>
          </div>
        </div>
      )}
      {!overallWinner && (
        <div style={{ margin: '0.75rem 1rem 0', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 10, padding: '0.6rem 0.9rem', fontSize: '0.72rem', color: 'var(--muted2)' }}>
          🤝 It's a tie — 2 metrics each
        </div>
      )}

      {/* Stat comparison rows */}
      <div style={{ padding: '0.5rem 1rem' }}>
        <StatRow
          label="Crime Rate"
          valA={stateA.rates?.[2]}  valB={stateB.rates?.[2]}
          winSide={winner(stateA.rates?.[2], stateB.rates?.[2], true)}
          unit="/lakh"
        />
        <StatRow
          label="Literacy"
          valA={stateA.literacy}  valB={stateB.literacy}
          winSide={winner(stateA.literacy, stateB.literacy, false)}
          unit="%"
        />
        <StatRow
          label="Avg AQI"
          valA={stateA.avgAQI}  valB={stateB.avgAQI}
          winSide={winner(stateA.avgAQI, stateB.avgAQI, true)}
        />
        <StatRow
          label="Population"
          valA={stateA.pop}  valB={stateB.pop}
          winSide={winner(stateA.pop, stateB.pop, false)}
          formatFn={fmt}
        />
      </div>

      {/* Crime trend comparison */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, marginBottom: '0.6rem' }}>
          Crime Trend 2021 → 2023
        </div>
        {['2021', '2022', '2023'].map((yr, i) => {
          const maxRate = Math.max(...stateA.rates, ...stateB.rates);
          return (
            <div key={yr} style={{ marginBottom: '0.6rem' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>{yr}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {/* State A bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 28, fontSize: '0.58rem', color: 'var(--accent)', textAlign: 'right', flexShrink: 0 }}>A</div>
                  <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: (stateA.rates[i] / maxRate * 100) + '%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', width: 32, textAlign: 'right' }}>{stateA.rates[i]}</span>
                </div>
                {/* State B bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 28, fontSize: '0.58rem', color: 'var(--blue)', textAlign: 'right', flexShrink: 0 }}>B</div>
                  <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: (stateB.rates[i] / maxRate * 100) + '%', background: 'var(--blue)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--blue)', width: 32, textAlign: 'right' }}>{stateB.rates[i]}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sparkline comparison */}
      <div style={{ padding: '0 1rem 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {[stateA, stateB].map((s, idx) => (
          <div key={s.state} style={{ background: 'var(--card)', border: `1px solid ${idx === 0 ? 'rgba(232,76,30,0.2)' : 'rgba(79,142,247,0.2)'}`, borderRadius: 10, padding: '0.6rem' }}>
            <div style={{ fontSize: '0.6rem', color: idx === 0 ? 'var(--accent)' : 'var(--blue)', fontWeight: 700, marginBottom: '0.3rem' }}>{s.state.split(' ')[0]}</div>
            <Sparkline data={s.rates} color={idx === 0 ? '#e84c1e' : '#4f8ef7'} width={100} height={22} />
            <div style={{ fontSize: '0.58rem', color: 'var(--muted)', marginTop: '0.2rem' }}>crime trend</div>
          </div>
        ))}
      </div>

      {/* Hint to user */}
      <div style={{ margin: '0 1rem 1rem', padding: '0.6rem 0.9rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.68rem', color: 'var(--muted)' }}>
        💡 Click any state on the map to swap State B
      </div>
    </div>
  );
}

export default ComparePanel;
