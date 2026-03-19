import React, { useState } from 'react';
import { getGrade } from '../utils/helpers';

function ReportCards({ states }) {
  const [sort, setSort] = useState('grade');

  const graded = states
    .filter(s => s.rates[2] < 200)
    .map(s => ({ ...s, gradeInfo: getGrade(s) }));

  const sorted = [...graded].sort((a, b) => {
    if (sort === 'grade')    return a.gradeInfo.grade.localeCompare(b.gradeInfo.grade);
    if (sort === 'crime')    return a.rates[2] - b.rates[2];
    if (sort === 'literacy') return b.literacy - a.literacy;
    return 0;
  });

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            State Report Cards
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Graded A–F based on Crime, Literacy & AQI</div>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {['grade', 'crime', 'literacy'].map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              style={{
                padding: '0.25rem 0.6rem', borderRadius: 6,
                border: '1px solid var(--border)',
                background: sort === s ? 'var(--accent)' : 'var(--surface)',
                color: sort === s ? '#fff' : 'var(--muted)',
                fontSize: '0.68rem', cursor: 'pointer',
                fontFamily: 'DM Sans,sans-serif', textTransform: 'capitalize',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '0.5rem', maxHeight: 320, overflowY: 'auto' }}>
        {sorted.map(s => (
          <div
            key={s.state}
            style={{
              background: 'var(--surface)',
              border: `1px solid ${s.gradeInfo.color}30`,
              borderRadius: 10, padding: '0.75rem',
              transition: 'transform 0.15s,border-color 0.15s', cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = s.gradeInfo.color; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.borderColor = `${s.gradeInfo.color}30`; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.6rem', color: s.gradeInfo.color, lineHeight: 1 }}>
                {s.gradeInfo.grade}
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 600, color: s.gradeInfo.color, background: `${s.gradeInfo.color}18`, padding: '0.15rem 0.4rem', borderRadius: 4 }}>
                {s.gradeInfo.label}
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.3rem', lineHeight: 1.2 }}>{s.state}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>Crime: {s.rates[2]} | Lit: {s.literacy}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportCards;
