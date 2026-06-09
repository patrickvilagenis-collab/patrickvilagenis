// charts.js — dependency-free SVG charts (works offline).
// Each function returns an SVG string.

const PALETTE = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

function svg(w, h, inner) {
  return `<svg viewBox="0 0 ${w} ${h}" class="chart" preserveAspectRatio="xMidYMid meet" role="img">${inner}</svg>`;
}

export function barChart(data, { w = 520, h = 220, color = '#2563eb', valueFmt = (v) => v } = {}) {
  if (!data.length) return emptyChart(w, h);
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d[1]), 1);
  const bw = cw / data.length;
  let bars = '';
  data.forEach((d, i) => {
    const bh = (d[1] / max) * ch;
    const x = pad.l + i * bw + bw * 0.15;
    const y = pad.t + ch - bh;
    const ww = bw * 0.7;
    bars += `<rect x="${x}" y="${y}" width="${ww}" height="${bh}" rx="3" fill="${color}"><title>${d[0]}: ${d[1]}</title></rect>`;
    bars += `<text x="${x + ww / 2}" y="${pad.t + ch + 18}" text-anchor="middle" class="ax">${shorten(d[0])}</text>`;
    if (d[1] > 0) bars += `<text x="${x + ww / 2}" y="${y - 4}" text-anchor="middle" class="val">${valueFmt(d[1])}</text>`;
  });
  const grid = gridLines(pad, cw, ch, max);
  return svg(w, h, grid + bars);
}

export function lineChart(data, { w = 520, h = 220, color = '#2563eb' } = {}) {
  if (data.length < 1) return emptyChart(w, h);
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d[1]), 1);
  const step = data.length > 1 ? cw / (data.length - 1) : 0;
  const pts = data.map((d, i) => [pad.l + i * step, pad.t + ch - (d[1] / max) * ch]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${path} L${pts[pts.length - 1][0]},${pad.t + ch} L${pts[0][0]},${pad.t + ch} Z`;
  let dots = '';
  pts.forEach((p, i) => {
    dots += `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${color}"><title>${data[i][0]}: ${data[i][1]}</title></circle>`;
    dots += `<text x="${p[0]}" y="${pad.t + ch + 18}" text-anchor="middle" class="ax">${shorten(data[i][0])}</text>`;
  });
  const grid = gridLines(pad, cw, ch, max);
  return svg(w, h,
    grid +
    `<path d="${area}" fill="${color}" opacity="0.12"/>` +
    `<path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>` +
    dots);
}

export function donutChart(entries, { w = 220, h = 220, thickness = 34, colors = PALETTE } = {}) {
  const total = entries.reduce((a, e) => a + e[1], 0);
  if (!total) return emptyChart(w, h);
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 8;
  let a0 = -Math.PI / 2, arcs = '';
  entries.forEach((e, i) => {
    const frac = e[1] / total;
    const a1 = a0 + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    arcs += `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="${thickness}"><title>${e[0]}: ${e[1]} (${Math.round(frac * 100)}%)</title></path>`;
    a0 = a1;
  });
  const inner = `<text x="${cx}" y="${cy - 2}" text-anchor="middle" class="donut-num">${total}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-lbl">total</text>`;
  return svg(w, h, arcs + inner);
}

export function legend(entries, { colors = PALETTE } = {}) {
  return `<div class="legend">${entries.map((e, i) =>
    `<span class="leg"><i style="background:${colors[i % colors.length]}"></i>${escTxt(e[0])} <b>${e[1]}</b></span>`).join('')}</div>`;
}

export function gauge(value, { w = 200, h = 130, label = '' } = {}) {
  if (value == null) return emptyChart(w, h, 'No data');
  const cx = w / 2, cy = h - 16, r = 78;
  const a = Math.PI * (1 - value / 100);
  const x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
  const col = value >= 90 ? '#10b981' : value >= 75 ? '#f59e0b' : '#ef4444';
  return svg(w, h,
    `<path d="M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}" fill="none" stroke="#e5e7eb" stroke-width="14" stroke-linecap="round"/>` +
    `<path d="M${cx - r},${cy} A${r},${r} 0 0 1 ${x.toFixed(1)},${y.toFixed(1)}" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round"/>` +
    `<text x="${cx}" y="${cy - 6}" text-anchor="middle" class="gauge-num">${value}%</text>` +
    `<text x="${cx}" y="${cy + 12}" text-anchor="middle" class="gauge-lbl">${escTxt(label)}</text>`);
}

export function stackedBar(parts, { w = 520, h = 22, colors = PALETTE } = {}) {
  const total = parts.reduce((a, p) => a + p[1], 0);
  if (!total) return `<div class="sbar empty"></div>`;
  let x = 0, segs = '';
  parts.forEach((p, i) => {
    const ww = (p[1] / total) * w;
    segs += `<rect x="${x}" y="0" width="${ww}" height="${h}" fill="${colors[i % colors.length]}"><title>${p[0]}: ${p[1]}</title></rect>`;
    x += ww;
  });
  return svg(w, h, segs);
}

function gridLines(pad, cw, ch, max) {
  let g = '';
  const lines = 4;
  for (let i = 0; i <= lines; i++) {
    const y = pad.t + (ch / lines) * i;
    const val = Math.round(max - (max / lines) * i);
    g += `<line x1="${pad.l}" y1="${y}" x2="${pad.l + cw}" y2="${y}" class="grid"/>`;
    g += `<text x="${pad.l - 6}" y="${y + 4}" text-anchor="end" class="ax">${val}</text>`;
  }
  return g;
}

function emptyChart(w, h, msg = 'No data yet') {
  return svg(w, h, `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" class="empty-txt">${msg}</text>`);
}

function shorten(s, n = 10) {
  s = String(s);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
function escTxt(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

export { PALETTE };
