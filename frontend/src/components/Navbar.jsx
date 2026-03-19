import React, { useState, useEffect } from 'react';
import { INDICATORS } from '../utils/helpers';

function Navbar({ indicator, onIndicatorChange, onSearch, onTableauOpen }) {
  const [searchQ,   setSearchQ]   = useState('');
  const [searchRes, setSearchRes] = useState([]);

  useEffect(() => {
    if (!searchQ.trim()) { setSearchRes([]); return; }
    const timer = setTimeout(async () => {
      const results = await onSearch(searchQ);
      setSearchRes(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ, onSearch]);

  const handleSelect = state => {
    setSearchQ('');
    setSearchRes([]);
    // bubble up to App so it can flyTo and fetch
    onSearch(state, true);
  };

  return (
    <nav style={{
      height: 52, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1rem',
      background: 'rgba(9,9,15,0.95)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)', zIndex: 1000,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '0.75rem', color: '#fff' }}>
          CL
        </div>
        <div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            City<span style={{ color: 'var(--accent)' }}>Lens</span>
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--muted)', lineHeight: 1 }}>India Safety Explorer</div>
        </div>
      </div>

      {/* Indicator switcher */}
      <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--surface)', borderRadius: 10, padding: '0.2rem', border: '1px solid var(--border)' }}>
        {INDICATORS.map(ind => (
          <button
            key={ind.key}
            onClick={() => onIndicatorChange(ind.key)}
            style={{
              padding: '0.3rem 0.75rem', borderRadius: 8, border: 'none',
              background: indicator === ind.key ? 'var(--card)' : 'transparent',
              color: indicator === ind.key ? ind.color : 'var(--muted)',
              fontSize: '0.75rem', fontWeight: indicator === ind.key ? 600 : 400,
              cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all 0.15s',
              boxShadow: indicator === ind.key ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {ind.icon} {ind.label}
          </button>
        ))}
      </div>

      {/* Right side — search + tableau btn + live badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search state..."
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '0.3rem 0.75rem', fontSize: '0.75rem', outline: 'none', fontFamily: 'DM Sans,sans-serif', width: 150 }}
          />
          {searchRes.length > 0 && (
            <div style={{ position: 'absolute', top: '110%', left: 0, width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, zIndex: 999, overflow: 'hidden' }}>
              {searchRes.map(r => (
                <div
                  key={r.state}
                  onClick={() => handleSelect(r.state)}
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {r.state}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onTableauOpen}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.9rem', borderRadius: 8, border: '1px solid rgba(232,76,30,0.3)', background: 'rgba(232,76,30,0.1)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,76,30,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(232,76,30,0.1)')}
        >
          📊 View Tableau Dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.7rem', borderRadius: 999, background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.2)', fontSize: '0.68rem', fontWeight: 600, color: 'var(--teal)' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--teal)', animation: 'blink 2s infinite' }} />
          36 States
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
