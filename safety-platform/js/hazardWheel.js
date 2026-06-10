// hazardWheel.js — a self-contained SVG rendering of the Schindler Hazard
// Wheel (the 10 high-energy hazard types arranged around a wheel). Generated
// from the energy taxonomy so it always matches the EBS module.

import { ENERGY_TYPES } from './checklists.js';

// Clockwise order starting at the top, matching the Schindler Hazard Wheel.
const WHEEL_ORDER = ['gravity', 'biological', 'mechanical', 'sound', 'pressure', 'electrical', 'temperature', 'motion', 'radiation', 'chemical'];

export function hazardWheelSVG(size = 300) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 10, rIn = size * 0.19;
  const seg = (Math.PI * 2) / 10;
  const items = WHEEL_ORDER.map((id) => ENERGY_TYPES.find((e) => e.id === id)).filter(Boolean);
  let paths = '', icons = '', labels = '';

  items.forEach((e, i) => {
    const a0 = -Math.PI / 2 + i * seg, a1 = a0 + seg, mid = a0 + seg / 2;
    const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const [x0, y0] = p(R, a0), [x1, y1] = p(R, a1);
    const [xi0, yi0] = p(rIn, a0), [xi1, yi1] = p(rIn, a1);
    const fill = i % 2 ? '#f0f0f2' : '#fafafa';
    paths += `<path d="M${xi0.toFixed(1)},${yi0.toFixed(1)} L${x0.toFixed(1)},${y0.toFixed(1)} A${R},${R} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)} L${xi1.toFixed(1)},${yi1.toFixed(1)} A${rIn},${rIn} 0 0 0 ${xi0.toFixed(1)},${yi0.toFixed(1)} Z" fill="${fill}" stroke="#e3e3e6"/>`;
    const [ex, ey] = p((R + rIn) / 2, mid);
    icons += `<text x="${ex.toFixed(1)}" y="${ey.toFixed(1)}" font-size="${size * 0.06}" text-anchor="middle" dominant-baseline="central">${e.icon}</text>`;
    const [lx, ly] = p(R - size * 0.055, mid);
    let deg = (mid * 180) / Math.PI + 90;
    if (deg > 90 && deg < 270) deg -= 180; // keep labels upright
    labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-size="${size * 0.032}" fill="#E2001A" font-weight="700" text-anchor="middle" dominant-baseline="central" transform="rotate(${deg.toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})">${e.label}</text>`;
  });

  return `<svg viewBox="0 0 ${size} ${size}" class="hazard-wheel" role="img" aria-label="Schindler Hazard Wheel">
    <circle cx="${cx}" cy="${cy}" r="${R + 5}" fill="none" stroke="#b9bec5" stroke-width="7"/>
    <circle cx="${cx}" cy="${cy}" r="${R + 5}" fill="none" stroke="#e6e6e9" stroke-width="2"/>
    ${paths}${icons}${labels}
    <circle cx="${cx}" cy="${cy}" r="${rIn - 1}" fill="#fff" stroke="#d7d7da"/>
    <text x="${cx}" y="${cy}" font-size="${size * 0.05}" fill="#E2001A" font-weight="800" text-anchor="middle" dominant-baseline="central">Schindler</text>
  </svg>`;
}
