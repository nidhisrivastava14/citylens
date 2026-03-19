import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { getMarkerColor, INDICATORS } from '../utils/helpers';

// wrapping Leaflet in a React component so the map lifecycle
// (init once, update markers on prop change) is cleanly separated from App
function MapView({ states, indicator, selected, compareState, onStateClick, onReset }) {
  const mapRef     = useRef(null);
  const leafletRef = useRef(null);
  const markersRef = useRef([]);

  // init map once
  useEffect(() => {
    if (leafletRef.current || !mapRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([22, 82], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(map);
    map.on('click', onReset);
    leafletRef.current = map;
  }, [onReset]);

  // fly to selected state
  useEffect(() => {
    if (leafletRef.current && selected?.coords) {
      leafletRef.current.flyTo(selected.coords, 6, { duration: 0.8 });
    }
    if (!selected && leafletRef.current) {
      leafletRef.current.flyTo([22, 82], 5, { duration: 0.8 });
    }
  }, [selected]);

  // redraw markers when states/indicator/selected changes
  useEffect(() => {
    if (!leafletRef.current || !states.length) return;
    const map = leafletRef.current;

    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const vals = states
      .map(s => {
        if (indicator === 'crime')      return s.rates?.[2] < 200 ? s.rates[2] : null;
        if (indicator === 'aqi')        return s.avgAQI;
        if (indicator === 'literacy')   return s.literacy;
        if (indicator === 'population') return s.pop;
        return null;
      })
      .filter(v => v !== null && v !== undefined);

    const min = Math.min(...vals);
    const max = Math.max(...vals);

    states.forEach(s => {
      if (!s.coords) return;

      let raw;
      if (indicator === 'crime')      raw = s.rates?.[2];
      else if (indicator === 'aqi')   raw = s.avgAQI;
      else if (indicator === 'literacy')   raw = s.literacy;
      else                            raw = s.pop;

      if (raw === null || raw === undefined) return;

      const valForColor = indicator === 'crime' && raw > 200 ? 200 : raw;
      const color = getMarkerColor(valForColor, min, max, indicator);
      const isSel     = selected?.state === s.state;
      const isCompare = compareState?.state === s.state;
      const size  = (isSel || isCompare) ? 24 : 16;

      // selected = white border, compare = blue border
      const borderStyle = isSel
        ? '3px solid #fff'
        : isCompare
          ? '3px solid #4f8ef7'
          : '2px solid rgba(255,255,255,0.25)';

      const glowColor = isCompare ? '#4f8ef7' : color;

      const icon = L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${borderStyle};box-shadow:0 0 ${(isSel||isCompare) ? 18 : 8}px ${(isSel||isCompare) ? 4 : 1}px ${glowColor};cursor:pointer;transition:all 0.2s;"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const { fmt } = require('../utils/helpers');
      const displayVal =
        indicator === 'population' ? fmt(raw) :
        indicator === 'literacy'   ? raw?.toFixed(1) + '%' :
        raw?.toFixed ? raw.toFixed(1) : raw;

      const indLabel = INDICATORS.find(i => i.key === indicator)?.label;

      const marker = L.marker(s.coords, { icon }).addTo(map);
      marker.bindTooltip(
        `<div style="font-family:'DM Sans',sans-serif;min-width:140px"><div style="font-weight:700;font-size:0.85rem;margin-bottom:3px">${s.state}</div><div style="color:#94a3b8;font-size:0.72rem">${indLabel}: <span style="color:#f0f2fa;font-weight:600">${displayVal}</span></div></div>`,
        { className: 'cl-tooltip', direction: 'top', offset: [0, -8] }
      );
      marker.on('click', e => { L.DomEvent.stopPropagation(e); onStateClick(s.state); });
      markersRef.current.push(marker);
    });
  }, [states, indicator, selected, compareState, onStateClick]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}

export default MapView;
