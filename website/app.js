/* No Pinhole Proxies — page interactions. Original code.
   Every figure here is either a schematic or a live evaluation of the equations printed next to it;
   none loads, simulates or implies measured results. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const NS = 'http://www.w3.org/2000/svg';
const deg = Math.PI / 180;
function el(tag, attrs = {}, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function text(parent, x, y, str, cls = 't-label', attrs = {}) { const t = el('text', {x, y, class: cls, ...attrs}, parent); t.textContent = str; return t; }
function sub(parent, x, y, base, subscript, cls = 't-label', attrs = {}) { const t = el('text', {x, y, class: cls, ...attrs}, parent); t.append(base); const s = el('tspan', {'baseline-shift': 'sub', 'font-size': '75%'}, t); s.textContent = subscript; return t; }
const fmt = (v, n = 2) => (Math.abs(v) < 5e-4 ? 0 : v).toFixed(n);
const signed = (v, n = 0) => { const r = Number(fmt(v, n)); return (r > 0 ? '+' : r < 0 ? '−' : '±') + Math.abs(r).toFixed(n); };

/* ------------------------------------------------------------ theme, menu, progress, nav */
const theme = $('#theme');
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
const labelTheme = () => theme.setAttribute('aria-label', `Switch to ${currentTheme() === 'dark' ? 'light' : 'dark'} theme`);
theme.addEventListener('click', () => { const t = currentTheme() === 'dark' ? 'light' : 'dark'; root.dataset.theme = t; try { localStorage.setItem('chuan-theme', t); } catch (e) {} labelTheme(); });
darkQuery.addEventListener('change', labelTheme); labelTheme();
const menu = $('#menu'), nav = $('#navigation');
const closeMenu = () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); };
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); } });
const links = $$('a', nav);
let tick = false;
function scrollState() {
  const max = root.scrollHeight - window.innerHeight;
  $('#progress').style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
  let selected = null;
  for (const a of links) { const s = $(a.getAttribute('href')); if (s && s.getBoundingClientRect().top <= 150) selected = a; }
  links.forEach(a => a === selected ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
  tick = false;
}
window.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(scrollState); } }, {passive: true});
window.addEventListener('resize', scrollState); scrollState();

/* ------------------------------------------------------------ math */
const macros = {'\\bo': '\\mathbf{o}', '\\bd': '\\mathbf{d}', '\\bmu': '\\boldsymbol{\\mu}', '\\bn': '\\mathbf{n}'};
if (window.katex) {
  for (const node of $$('.tex')) {
    const src = node.textContent;
    try { window.katex.render(src, node, {displayMode: node.classList.contains('tex-d'), throwOnError: false, macros, output: 'htmlAndMathml'}); }
    catch (e) { node.textContent = src; }
    node.classList.add('katex-done');
  }
} else root.classList.add('no-katex');

for (const sx of $$('.scroll-x')) { const h = document.createElement('p'); h.className = 'scroll-hint'; h.textContent = 'Scroll sideways to see the whole figure →'; sx.after(h); }

/* ------------------------------------------------------------ tooltips for [data-tip] */
const tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; tip.setAttribute('role', 'tooltip'); document.body.append(tip);
function showTip(target, x, y) { tip.textContent = target.dataset.tip; tip.hidden = false; const r = tip.getBoundingClientRect(); tip.style.left = Math.min(window.innerWidth - r.width - 8, Math.max(8, x + 12)) + 'px'; tip.style.top = Math.max(8, y - r.height - 12) + 'px'; }
for (const t of $$('[data-tip]')) {
  t.tabIndex = 0;
  t.addEventListener('pointermove', (e) => showTip(t, e.clientX, e.clientY));
  t.addEventListener('pointerleave', () => { tip.hidden = true; });
  t.addEventListener('focus', () => { const r = t.getBoundingClientRect(); showTip(t, r.left + r.width / 2, r.top); });
  t.addEventListener('blur', () => { tip.hidden = true; });
}

/* shared helpers */
function arrowDefs(svg, id) {
  const defs = el('defs', {}, svg);
  for (const [name, color] of [['blue', 'var(--blue)'], ['orange', 'var(--orange)'], ['violet', 'var(--violet)'], ['muted', 'var(--muted)'], ['ink', 'var(--text)']]) {
    const m = el('marker', {id: `${id}-${name}`, viewBox: '0 0 10 10', refX: '8.5', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto-start-reverse'}, defs);
    el('path', {d: 'M0 0 10 5 0 10z', style: `fill:${color}`}, m);
  }
  return defs;
}
function segmented(container, attr, onSelect) {
  const buttons = $$('button', container);
  buttons.forEach(b => b.addEventListener('click', () => { buttons.forEach(o => o.setAttribute('aria-pressed', String(o === b))); onSelect(b.dataset[attr]); }));
}

/* ------------------------------------------------------------ Figure 1: teaser */
(function teaser() {
  const fig = $('#teaser'), svg = $('#teaser-svg');
  if (!fig || !svg) return;
  arrowDefs(svg, 'ta');
  const oc = [128, 236], ol = [128, 262], W0 = [700, 40], W1 = [960, 440];
  const e = [W1[0] - W0[0], W1[1] - W0[1]], eLen = Math.hypot(...e), wallAng = Math.atan2(e[1], e[0]) / deg;
  const add = (p, d, s) => [p[0] + d[0] * s, p[1] + d[1] * s];
  const dir = (a) => [Math.cos(a * deg), Math.sin(a * deg)];
  function hitWall(o, d) { const w = [W0[0] - o[0], W0[1] - o[1]]; const det = -d[0] * e[1] + e[0] * d[1]; const t = (-w[0] * e[1] + e[0] * w[1]) / det; return add(o, d, t); }
  const g = (attrs) => el('g', attrs, svg);
  // static scene
  const base = g({});
  el('line', {x1: W0[0], y1: W0[1], x2: W1[0], y2: W1[1], style: 'stroke:var(--line-strong);stroke-width:2'}, base);
  text(base, 958, 466, 'wall', 't-small', {'text-anchor': 'end'});
  // fisheye field of view arc (always) — the full image circle
  const R = 64, a0 = -100 * deg, a1 = 100 * deg;
  el('path', {d: `M${oc[0] + R * Math.cos(a0)} ${oc[1] + R * Math.sin(a0)} A${R} ${R} 0 1 1 ${oc[0] + R * Math.cos(a1)} ${oc[1] + R * Math.sin(a1)}`, style: 'fill:none;stroke:var(--blue);stroke-width:1.4;opacity:.55'}, base);
  text(base, oc[0] - 4, oc[1] - 72, 'fisheye field of view', 't-small', {'text-anchor': 'middle'});
  // proxy-only frustums
  const proxy = g({'data-in': 'proxy'});
  const wedge = (o, h, r) => { const p1 = add(o, dir(-h), r), p2 = add(o, dir(h), r); return `M${o[0]} ${o[1]}L${p1[0]} ${p1[1]}A${r} ${r} 0 0 1 ${p2[0]} ${p2[1]}Z`; };
  el('path', {d: wedge(oc, 45, 470), style: 'fill:var(--blue);fill-opacity:.07;stroke:var(--blue);stroke-opacity:.45;stroke-dasharray:5 4'}, proxy);
  text(proxy, 372, 108, 'perspective crop · 90°', 't-small', {style: 'fill:var(--blue)'});
  el('path', {d: wedge(ol, 60, 330), style: 'fill:none;stroke:var(--orange);stroke-opacity:.75;stroke-dasharray:2 4;stroke-width:1.4'}, proxy);
  text(proxy, 300, 452, 'virtual depth camera · 120°, 256²', 't-small', {style: 'fill:var(--orange)'});
  // Gaussians: wall, floater, off-axis detail
  const wallG = [];
  for (let i = 0; i < 7; i++) { const s = 0.06 + i * 0.147; wallG.push([W0[0] + e[0] * s, W0[1] + e[1] * s]); }
  const F = [500, 257], P = [262, 418];
  const detail = [[248, 412], [272, 422], [262, 402]];
  const neutral = g({'data-in': 'proxy ray'}), gated = g({'data-in': 'gate'});
  for (const c of wallG) {
    el('ellipse', {cx: c[0], cy: c[1], rx: 40, ry: 8, transform: `rotate(${wallAng} ${c[0]} ${c[1]})`, style: 'fill:var(--muted);fill-opacity:.26;stroke:var(--muted);stroke-opacity:.6'}, neutral);
    el('ellipse', {cx: c[0], cy: c[1], rx: 40, ry: 8, transform: `rotate(${wallAng} ${c[0]} ${c[1]})`, style: 'fill:var(--violet);fill-opacity:.38;stroke:var(--violet)'}, gated);
  }
  for (const c of detail) {
    el('ellipse', {cx: c[0], cy: c[1], rx: 15, ry: 8, transform: `rotate(20 ${c[0]} ${c[1]})`, style: 'fill:var(--muted);fill-opacity:.26;stroke:var(--muted);stroke-opacity:.6'}, neutral);
    el('ellipse', {cx: c[0], cy: c[1], rx: 15, ry: 8, transform: `rotate(20 ${c[0]} ${c[1]})`, style: 'fill:none;stroke:var(--muted);stroke-dasharray:3 3'}, gated);
  }
  el('ellipse', {cx: F[0], cy: F[1], rx: 30, ry: 19, style: 'fill:var(--muted);fill-opacity:.16;stroke:var(--muted);stroke-dasharray:4 3'}, neutral);
  text(neutral, F[0], F[1] - 26, 'faint floater', 't-small', {'text-anchor': 'middle'});
  el('ellipse', {cx: F[0], cy: F[1], rx: 30, ry: 19, style: 'fill:var(--bad);fill-opacity:.1;stroke:var(--bad);stroke-dasharray:4 3'}, gated);
  el('path', {d: `M${F[0] - 8} ${F[1] - 8}l16 16M${F[0] + 8} ${F[1] - 8}l-16 16`, style: 'stroke:var(--bad);stroke-width:2.4;stroke-linecap:round'}, gated);
  text(gated, F[0], F[1] - 28, 'contradicted → pruned', 't-small', {'text-anchor': 'middle', style: 'fill:var(--bad);font-weight:600'});
  text(gated, P[0] + 30, P[1] + 26, 'unobserved by the LiDAR → free', 't-small');
  // rays
  const camD = dir(-14), camHit = hitWall(oc, camD);
  const lidD = [1, 0], lidHit = hitWall(ol, lidD);
  const offD = [P[0] - oc[0], P[1] - oc[1]], offLen = Math.hypot(...offD), offU = [offD[0] / offLen, offD[1] / offLen], offEnd = add(oc, offU, offLen - 14);
  const rays = g({});
  el('line', {x1: oc[0], y1: oc[1], x2: camHit[0], y2: camHit[1], style: 'stroke:var(--blue);stroke-width:2'}, rays);
  el('line', {x1: ol[0], y1: ol[1], x2: lidHit[0], y2: lidHit[1], style: 'stroke:var(--orange);stroke-width:2'}, rays);
  text(rays, 300, 218, 'camera pixel ray', 't-small', {style: 'fill:var(--blue)', transform: 'rotate(-14 300 218)'});
  text(rays, 236, 278, 'LiDAR beam', 't-small', {style: 'fill:var(--orange)'});
  const offProxy = g({'data-in': 'proxy'}), offRay = g({'data-in': 'ray gate'});
  el('line', {x1: oc[0], y1: oc[1], x2: offEnd[0], y2: offEnd[1], style: 'stroke:var(--muted);stroke-width:1.6;stroke-dasharray:4 4'}, offProxy);
  text(offProxy, 206, 330, '✕ off-axis pixel: outside the crop,', 't-small', {style: 'fill:var(--bad)'});
  text(offProxy, 220, 346, 'never supervised', 't-small', {style: 'fill:var(--bad)'});
  el('line', {x1: oc[0], y1: oc[1], x2: offEnd[0], y2: offEnd[1], style: 'stroke:var(--blue);stroke-width:2'}, offRay);
  text(offRay, 18, 392, 'off-axis pixel,', 't-small', {style: 'fill:var(--blue)'}); text(offRay, 18, 407, 'native resolution', 't-small', {style: 'fill:var(--blue)'});
  // rig
  const rig = g({});
  el('rect', {x: 98, y: 220, width: 44, height: 58, rx: 9, style: 'fill:var(--bg);stroke:var(--ink);stroke-width:1.5'}, rig);
  el('circle', {cx: oc[0], cy: oc[1], r: 7, style: 'fill:var(--blue)'}, rig);
  el('circle', {cx: ol[0], cy: ol[1], r: 7, style: 'fill:var(--orange)'}, rig);
  text(rig, 120, 300, 'rig', 't-small', {'text-anchor': 'middle'});
  // proxy depth markers on the LiDAR beam
  const marks = g({'data-in': 'proxy'});
  const y = ol[1];
  const pm = [[700, '①', 'muted'], [lidHit[0] - 52, '②', 'muted'], [lidHit[0] - 26, '③', 'muted']];
  for (const [x, label] of pm) { el('path', {d: `M${x} ${y - 9}v18`, style: 'stroke:var(--text);stroke-width:2'}, marks); text(marks, x, y - 16, label, 't-label', {'text-anchor': 'middle', style: 'font-size:14px'}); }
  el('circle', {cx: lidHit[0], cy: y, r: 6, style: 'fill:var(--orange);stroke:var(--bg);stroke-width:2'}, marks);
  text(marks, lidHit[0] - 14, y + 28, 'measured return ρ', 't-small', {'text-anchor': 'end', style: 'fill:var(--orange);font-weight:600'});
  // ray-model markers
  const term = g({'data-in': 'ray gate'});
  el('rect', {x: ol[0] + 12, y: y - 5, width: lidHit[0] - ol[0] - 28, height: 10, rx: 3, style: 'fill:var(--orange);fill-opacity:.16'}, term);
  text(term, 560, y + 26, 'free space: the laser crossed here', 't-small', {style: 'fill:var(--orange)'});
  const dot = (p) => { el('circle', {cx: p[0], cy: p[1], r: 7.5, style: 'fill:var(--violet);stroke:var(--bg);stroke-width:2.5'}, term); };
  dot(camHit); dot(offEnd);
  el('circle', {cx: lidHit[0], cy: y, r: 10, style: 'fill:none;stroke:var(--violet);stroke-width:2.5'}, term);
  el('circle', {cx: lidHit[0], cy: y, r: 4.5, style: 'fill:var(--orange)'}, term);
  sub(term, camHit[0] - 18, camHit[1] - 14, 'τ', 'term', 't-strong', {'text-anchor': 'end', style: 'fill:var(--violet)'});
  sub(term, offEnd[0] - 16, offEnd[1] + 4, 'τ', 'term', 't-strong', {'text-anchor': 'end', style: 'fill:var(--violet)'});
  const lt = sub(term, lidHit[0] - 18, y + 46, 'τ', 'term', 't-strong', {'text-anchor': 'middle', style: 'fill:var(--violet)'}); lt.append(' = ρ');
  // gate-only: tangent arrows on the anchored Gaussian nearest the LiDAR hit
  const gate = g({'data-in': 'gate'});
  const ue = [e[0] / eLen, e[1] / eLen], near = wallG.reduce((a, b) => Math.hypot(b[0] - lidHit[0], b[1] - lidHit[1]) < Math.hypot(a[0] - lidHit[0], a[1] - lidHit[1]) ? b : a);
  const pA = add(near, ue, -60), pB = add(near, ue, 60);
  el('line', {x1: pA[0] - 18, y1: pA[1], x2: pB[0] - 18, y2: pB[1], style: 'stroke:var(--violet);stroke-width:1.8', 'marker-start': 'url(#ta-violet)', 'marker-end': 'url(#ta-violet)'}, gate);
  text(gate, 905, 150, 'anchored:', 't-small', {'text-anchor': 'middle', style: 'fill:var(--violet);font-weight:600'});
  text(gate, 905, 165, 'may slide along,', 't-small', {'text-anchor': 'middle', style: 'fill:var(--violet)'});
  text(gate, 905, 180, 'not off', 't-small', {'text-anchor': 'middle', style: 'fill:var(--violet)'});

  const copy = {
    proxy: {k: 'Baseline R1', t: 'Two sensors, two proxies, three depths.', p: 'The fisheye is cut into a perspective crop, so off-axis pixels are never supervised. The LiDAR becomes a virtual pinhole depth camera. On one beam, ① the LiDAR loss sees an opacity-weighted average of centre depths, ② the camera branch is regularised toward a median, and ③ evaluation extracts yet another first surface. None of them is the measured range ρ.',
      l: [['var(--blue)', 'camera pixel ray'], ['var(--orange)', 'LiDAR beam and its measured return ρ'], ['color-mix(in srgb,var(--blue) 20%,transparent)', 'perspective crop used for training'], ['transparent;border:1.5px dashed var(--orange)', 'virtual pinhole depth camera']]},
    ray: {k: 'Contribution 1', t: 'One ray model, one termination depth.', p: 'Every fisheye pixel, including off-axis ones, and every LiDAR beam is a ray (o, d) evaluated with one exact ray–Gaussian response. Both stop at τ_term, where transmittance first falls to one half. The beam’s τ_term is compared with its own range ρ, and the space in front of the return must stay empty, which penalises the floater.',
      l: [['var(--violet)', 'τ_term: where a ray terminates, the same rule for both sensors'], ['color-mix(in srgb,var(--orange) 30%,transparent)', 'free-space term in front of the return']]},
    gate: {k: 'Contributions 1 + 2', t: 'Evidence decides what appearance may move.', p: 'Counting hits, violations and observations along the same rays labels each Gaussian. Anchored: the photometric loss may slide it along the wall but not pull it off. Contradicted: its opacity decays and it is pruned. Unobserved: optimised as usual. Contribution 3 runs all of this inside the existing tile rasteriser.',
      l: [['var(--violet)', 'anchored: measured, and it is the surface'], ['color-mix(in srgb,var(--bad) 30%,transparent);border:1.5px solid var(--bad)', 'contradicted: blocks space the laser crossed'], ['transparent;border:1.5px dashed var(--muted)', 'unobserved: the LiDAR is silent here']]}
  };
  function setMode(mode) {
    fig.dataset.mode = mode;
    const c = copy[mode];
    $('#teaser-kicker').textContent = c.k; $('#teaser-title').textContent = c.t; $('#teaser-copy').innerHTML = c.p.replaceAll('τ_term', 'τ<sub>term</sub>');
    const ul = $('#teaser-legend'); ul.replaceChildren(...c.l.map(([sw, label]) => { const li = document.createElement('li'); const i = document.createElement('i'); i.setAttribute('style', `background:${sw}`); li.append(i); li.insertAdjacentHTML('beforeend', label.replaceAll('τ_term', 'τ<sub>term</sub>')); return li; }));
  }
  segmented($('.seg', fig), 'mode', setMode);
  setMode('proxy');
})();

/* ------------------------------------------------------------ Figure 3: where does depth land */
(function depth() {
  const svg = $('#depth-svg'); if (!svg) return;
  const X0 = 60, X1 = 690, M = 8, X = (t) => X0 + t * (X1 - X0) / M;
  const L1t = 56, L1b = 150, L2t = 172, L2b = 252, AX = 266;
  const erf = (x) => { const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)); };
  const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  const static_ = el('g', {}, svg);
  for (let t = 0; t <= M; t++) { el('line', {x1: X(t), x2: X(t), y1: L1t - 4, y2: L2b, class: 'w-grid'}, static_); text(static_, X(t), AX + 14, String(t), 'w-tick', {'text-anchor': 'middle'}); }
  el('line', {x1: X0, x2: X1, y1: L1b, y2: L1b, class: 'w-axis'}, static_);
  el('line', {x1: X0, x2: X1, y1: L2b, y2: L2b, class: 'w-axis'}, static_);
  el('line', {x1: X0, x2: X1, y1: (L2t + L2b) / 2, y2: (L2t + L2b) / 2, style: 'stroke:var(--muted);stroke-dasharray:3 4'}, static_);
  text(static_, X0 - 8, L1t + 10, 'opacity', 'w-tick', {'text-anchor': 'end'});
  text(static_, X0 - 8, L2t + 6, 'T = 1', 'w-tick', {'text-anchor': 'end'});
  text(static_, X0 - 8, (L2t + L2b) / 2 + 4, '½', 'w-tick', {'text-anchor': 'end'});
  text(static_, X0 - 8, L2b, '0', 'w-tick', {'text-anchor': 'end'});
  text(static_, X1, AX + 30, 'distance along the beam (m)', 'w-tick', {'text-anchor': 'end'});
  el('line', {x1: X(0), x2: X(0.25), y1: L1b - 1, y2: L1b - 1, style: 'stroke:var(--orange);stroke-width:5;stroke-linecap:round'}, static_);
  text(static_, X(0.32), L1b - 6, 'LiDAR', 'w-tick');
  const dyn = el('g', {}, svg);
  const alpha = $('#depth-alpha'), tilt = $('#depth-tilt');
  function render() {
    const af = Number(alpha.value), th = Number(tilt.value) * deg;
    const ell = 0.3, zc = 6.0, rho = zc + ell * Math.tan(th), aw = 0.9, sf = 0.1, sw = Math.min(0.35, 0.06 / Math.cos(th));
    $('#depth-alpha-v').value = af.toFixed(2); $('#depth-tilt-v').value = Math.round(th / deg) + '°';
    const E = (af * 3 + (1 - af) * aw * zc) / (af + (1 - af) * aw);
    const Med = af >= 0.5 ? 3 : zc;
    const term = af >= 0.5 ? 3 : rho;
    const T = (t) => (1 - af * Phi((t - 3) / sf)) * (1 - aw * Phi((t - rho) / sw));
    dyn.replaceChildren();
    // opacity lane
    let d1 = `M${X(0)} ${L1b}`, d2 = `M${X(0)} ${L1b}`, dT = '';
    for (let i = 0; i <= 400; i++) { const t = i * M / 400; const f = af * Math.exp(-0.5 * ((t - 3) / sf) ** 2), w = aw * Math.exp(-0.5 * ((t - rho) / sw) ** 2); d1 += `L${X(t)} ${L1b - f * (L1b - L1t)}`; d2 += `L${X(t)} ${L1b - w * (L1b - L1t)}`; dT += `${i ? 'L' : 'M'}${X(t)} ${L2b - T(t) * (L2b - L2t)}`; }
    el('path', {d: d1 + `L${X(M)} ${L1b}Z`, style: 'fill:var(--muted);fill-opacity:.35;stroke:var(--muted)'}, dyn);
    el('path', {d: d2 + `L${X(M)} ${L1b}Z`, style: 'fill:var(--muted);fill-opacity:.55;stroke:var(--text);stroke-opacity:.6'}, dyn);
    el('path', {d: dT, style: 'fill:none;stroke:var(--ink);stroke-width:1.8'}, dyn);
    text(dyn, X(3), L1b - Math.max(af, 0.05) * (L1b - L1t) - 6, 'floater', 'w-tick', {'text-anchor': 'middle'});
    // centre of the wall Gaussian (what a proxy reports)
    el('circle', {cx: X(zc), cy: L1b - 0.18 * (L1b - L1t), r: 4.5, style: 'fill:var(--bg);stroke:var(--text);stroke-width:1.5'}, dyn);
    if (Math.abs(rho - zc) > 0.05) el('path', {d: `M${X(zc) + 5} ${L1b - 0.18 * (L1b - L1t)}H${X(rho) - 3}`, style: 'stroke:var(--text);stroke-dasharray:2 3'}, dyn);
    text(dyn, X(zc) - 8, L1b - 0.18 * (L1b - L1t) + 4, 'wall centre', 'w-tick', {'text-anchor': 'end'});
    // markers
    const ms = [
      {x: rho, label: 'ρ measured', style: 'stroke:var(--orange);stroke-width:2.2', fill: 'var(--orange)'},
      {x: E, label: 'R1 expected', style: 'stroke:var(--text);stroke-width:1.6;stroke-dasharray:5 4', fill: 'var(--text)'},
      {x: Med, label: 'R1 median', style: 'stroke:var(--text);stroke-width:1.6;stroke-dasharray:1.5 3', fill: 'var(--text)'},
      {x: term, label: 'τ_term', style: 'stroke:var(--violet);stroke-width:2.6', fill: 'var(--violet)'}
    ].sort((a, b) => a.x - b.x);
    const rowsX = [-1e9, -1e9, -1e9];
    for (const m of ms) {
      const px = X(m.x); let row = rowsX.findIndex(v => px - v > 92); if (row < 0) row = 2; rowsX[row] = px;
      el('line', {x1: px, x2: px, y1: 20 + row * 13, y2: L2b, style: m.style}, dyn);
      const right = px > X1 - 70; const t = text(dyn, right ? px - 4 : px + 4, 16 + row * 13, '', 'w-lab-strong', {style: `fill:${m.fill}`, 'text-anchor': right ? 'end' : 'start'});
      if (m.label === 'τ_term') { t.append('τ'); const s = el('tspan', {'baseline-shift': 'sub', 'font-size': '75%'}, t); s.textContent = 'term'; } else t.textContent = m.label;
    }
    const rows = [
      ['var(--orange)', 'ρ, measured return', rho, null, false],
      ['var(--text)', 'R1 expected centre depth', E, E - rho, false],
      ['var(--text)', 'R1 median (a centre depth)', Med, Med - rho, false],
      ['var(--violet)', 'τ<sub>term</sub>, ray model', term, term - rho, true]
    ];
    const tb = $('#depth-readout'); tb.replaceChildren();
    for (const [c, name, v, dv, hl] of rows) {
      const tr = document.createElement('tr'); if (hl) tr.className = 'hl';
      tr.innerHTML = `<td><i style="background:${c}"></i>${name}</td><td>${fmt(v)}</td><td>${dv === null ? '—' : signed(dv * 100) + ' cm'}</td>`; tb.append(tr);
    }
    const fs = document.createElement('tr'); fs.innerHTML = `<td><i style="background:color-mix(in srgb,var(--orange) 35%,transparent)"></i>free-space penalty</td><td>${(1 - T(rho - 0.5)).toFixed(2)}</td><td>${af >= 0.5 ? 'floater wins' : ''}</td>`; tb.append(fs);
  }
  alpha.addEventListener('input', render); tilt.addEventListener('input', render); render();
})();

/* ------------------------------------------------------------ Figure 4: whitened view of the ray response */
(function whitening() {
  const svg = $('#white-svg'); if (!svg) return;
  const W = 640, H = 360, k = 90, cx = 382, cy = 180;
  const S = (p) => [cx + p[0] * k, cy - p[1] * k];
  const clip = el('clipPath', {id: 'wclip'}, el('defs', {}, svg)); el('rect', {x: 0, y: 0, width: W, height: H}, clip);
  arrowDefs(svg, 'wa');
  const grid = el('g', {}, svg);
  for (let x = -5; x <= 3; x++) el('line', {x1: cx + x * k, x2: cx + x * k, y1: 0, y2: H, class: 'w-grid'}, grid);
  for (let y = -2; y <= 2; y++) el('line', {x1: 0, x2: W, y1: cy - y * k, y2: cy - y * k, class: 'w-grid'}, grid);
  const dyn = el('g', {'clip-path': 'url(#wclip)'}, svg);
  const s1 = 1.0, s2 = 0.22, kap = Math.sqrt(s1 * s2);
  const off = $('#w-offset'), rot = $('#w-rot'), morph = $('#w-morph');
  function render() {
    const h = Number(off.value), phi = Number(rot.value) * deg, t = Number(morph.value);
    $('#w-offset-v').value = `${h.toFixed(2)} m`; $('#w-rot-v').value = `${Math.round(phi / deg)}°`; $('#w-morph-v').value = `${Math.round(t * 100)}%`;
    const c = Math.cos(phi), s = Math.sin(phi);
    // Σ^{-1} = R diag(1/s1², 1/s2²) Rᵀ
    const i1 = 1 / (s1 * s1), i2 = 1 / (s2 * s2);
    const A = [[c * c * i1 + s * s * i2, c * s * (i1 - i2)], [c * s * (i1 - i2), s * s * i1 + c * c * i2]];
    const o = [-3.8, h], d = [1, 0], mo = [-o[0], -o[1]];
    const v = [A[0][0] * mo[0] + A[0][1] * mo[1], A[1][0] * mo[0] + A[1][1] * mo[1]];
    const q = d[0] * (A[0][0] * d[0] + A[0][1] * d[1]) + d[1] * (A[1][0] * d[0] + A[1][1] * d[1]);
    const b = d[0] * v[0] + d[1] * v[1];
    const tau = b / q, D2 = Math.max(0, (mo[0] * v[0] + mo[1] * v[1]) - b * b / q), Dm = Math.sqrt(D2), a = Math.exp(-0.5 * D2);
    const zc = mo[0] * d[0] + mo[1] * d[1];
    // morph matrix M(t) = (1-t) I + t κ S⁻¹ Rᵀ
    const Wm = [[c / s1, s / s1], [-s / s2, c / s2]];
    const Mx = [[(1 - t) + t * kap * Wm[0][0], t * kap * Wm[0][1]], [t * kap * Wm[1][0], (1 - t) + t * kap * Wm[1][1]]];
    const T = (p) => S([Mx[0][0] * p[0] + Mx[0][1] * p[1], Mx[1][0] * p[0] + Mx[1][1] * p[1]]);
    dyn.replaceChildren();
    const ellipse = (r, style) => { let path = ''; for (let i = 0; i <= 72; i++) { const u = i / 72 * 2 * Math.PI; const lx = r * s1 * Math.cos(u), ly = r * s2 * Math.sin(u); const p = T([c * lx - s * ly, s * lx + c * ly]); path += `${i ? 'L' : 'M'}${p[0]} ${p[1]}`; } el('path', {d: path + 'Z', style}, dyn); };
    ellipse(2, 'fill:var(--muted);fill-opacity:.12;stroke:var(--muted);stroke-opacity:.5;stroke-dasharray:3 3');
    ellipse(1, 'fill:var(--muted);fill-opacity:.28;stroke:var(--text);stroke-opacity:.7');
    const r0 = T(o), r1 = T([o[0] + 9 * d[0], o[1] + 9 * d[1]]);
    el('line', {x1: r0[0], y1: r0[1], x2: r1[0], y2: r1[1], style: 'stroke:var(--blue);stroke-width:2', 'marker-end': 'url(#wa-blue)'}, dyn);
    el('circle', {cx: r0[0], cy: r0[1], r: 5, style: 'fill:var(--blue)'}, dyn);
    const mu = T([0, 0]), ps = T([o[0] + tau * d[0], o[1] + tau * d[1]]), pc = T([o[0] + zc * d[0], o[1] + zc * d[1]]);
    el('line', {x1: mu[0], y1: mu[1], x2: ps[0], y2: ps[1], style: 'stroke:var(--violet);stroke-width:1.6;stroke-dasharray:4 3'}, dyn);
    el('circle', {cx: mu[0], cy: mu[1], r: 3.5, style: 'fill:var(--ink)'}, dyn);
    text(dyn, mu[0] - 8, mu[1] + 16, 'μ', 'w-lab-strong', {'text-anchor': 'end', style: 'fill:var(--ink)'});
    el('rect', {x: pc[0] - 1.5, y: pc[1] - 10, width: 3, height: 20, style: 'fill:var(--text)', transform: `rotate(${Math.atan2(r1[1] - r0[1], r1[0] - r0[0]) / deg} ${pc[0]} ${pc[1]})`}, dyn);
    text(dyn, pc[0] - 6, pc[1] - 16, 'centre depth', 'w-tick', {'text-anchor': 'end', style: 'fill:var(--text)'});
    el('circle', {cx: ps[0], cy: ps[1], r: 6.5, style: 'fill:var(--violet);stroke:var(--bg);stroke-width:2'}, dyn);
    const lab = text(dyn, ps[0] + 10, ps[1] - 12, '', 'w-lab-strong', {style: 'fill:var(--violet)'}); lab.append('τ*');
    const mid = [(mu[0] + ps[0]) / 2, (mu[1] + ps[1]) / 2];
    const sl = Math.hypot(ps[0] - mu[0], ps[1] - mu[1]) || 1, nx = -(ps[1] - mu[1]) / sl, ny = (ps[0] - mu[0]) / sl, sg = ny > 0 ? 1 : -1;
    if (sl > 14) text(dyn, mid[0] + nx * 12 * sg, mid[1] + ny * 12 * sg + 4, 'D', 'w-lab-strong', {'text-anchor': 'middle', style: 'fill:var(--violet);font-style:italic'});
    text(dyn, 12, 22, t < 0.02 ? 'world space' : t > 0.98 ? 'whitened space: Gaussian is a ball, D ⟂ ray' : 'morphing…', 'w-lab');
    $('#white-readout').innerHTML = [
      ['τ*, ray response', `${tau.toFixed(2)} m`, true], ['centre depth (proxy)', `${zc.toFixed(2)} m`], ['τ* − centre depth', `${signed(tau - zc, 2)} m`], ['D, Mahalanobis', Dm.toFixed(2)], ['response a = e<sup>−D²/2</sup>', a.toFixed(2)]
    ].map(([k2, v2, hl]) => `<tr${hl ? ' class="hl"' : ''}><td>${k2}</td><td>${v2}</td></tr>`).join('');
  }
  for (const i of [off, rot, morph]) i.addEventListener('input', render);
  render();
})();

/* ------------------------------------------------------------ Figure 5: weighted sum vs constraint */
(function pareto() {
  const svg = $('#pareto-svg'); if (!svg) return;
  const x0 = 78, x1 = 612, y0 = 26, y1 = 326;
  const X = (u) => x0 + u * (x1 - x0), Y = (v) => y1 - v * (y1 - y0);
  const N = 320, sA = 0.03, sB = 0.97, slope = (s) => 1.7 * (1 - s) ** 1.5 + 1.25 * Math.exp(-(((s - 0.5) / 0.065) ** 2));
  const raw = [0]; for (let i = 1; i <= N; i++) { const s0 = sA + (sB - sA) * (i - 1) / N, s1 = sA + (sB - sA) * i / N; raw.push(raw[i - 1] - 0.5 * (slope(s0) + slope(s1)) * (s1 - s0)); }
  const gLo = 0.07, gHi = 0.93, rMin = raw[N];
  const pts = raw.map((r, i) => [sA + (sB - sA) * i / N, gLo + (gHi - gLo) * (r - rMin) / (0 - rMin)]);
  const gfun = (s) => { const f = (Math.min(sB, Math.max(sA, s)) - sA) / (sB - sA) * N, i = Math.min(N - 1, Math.floor(f)), w = f - i; return pts[i][1] * (1 - w) + pts[i + 1][1] * w; };
  // lower convex hull (monotone chain)
  const hull = []; for (const p of pts) { while (hull.length >= 2) { const [a, b] = [hull[hull.length - 2], hull[hull.length - 1]]; if ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) <= 0) hull.pop(); else break; } hull.push(p); }
  const hullAt = (s) => { for (let i = 1; i < hull.length; i++) if (s <= hull[i][0]) { const [a, b] = [hull[i - 1], hull[i]]; return a[1] + (b[1] - a[1]) * (s - a[0]) / (b[0] - a[0]); } return hull[hull.length - 1][1]; };
  const unreachable = pts.filter(p => p[1] - hullAt(p[0]) > 1e-4);
  const uLo = unreachable.length ? unreachable[0][0] : null, uHi = unreachable.length ? unreachable[unreachable.length - 1][0] : null;
  const defs = el('defs', {}, svg);
  const pat = el('pattern', {id: 'hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)'}, defs);
  el('line', {x1: 0, y1: 0, x2: 0, y2: 6, style: 'stroke:var(--muted);stroke-width:2'}, pat);
  const clip = el('clipPath', {id: 'pclip'}, defs); el('rect', {x: x0, y: y0, width: x1 - x0, height: y1 - y0}, clip);
  const st = el('g', {}, svg);
  for (let i = 0; i <= 4; i++) { el('line', {x1: X(i / 4), x2: X(i / 4), y1: y0, y2: y1, class: 'w-grid'}, st); el('line', {x1: x0, x2: x1, y1: Y(i / 4), y2: Y(i / 4), class: 'w-grid'}, st); }
  el('line', {x1: x0, x2: x1, y1: y1, y2: y1, class: 'w-axis'}, st); el('line', {x1: x0, x2: x0, y1: y0, y2: y1, class: 'w-axis'}, st);
  text(st, x1, y1 + 30, 'geometric error  f_geo  →', 'w-lab', {'text-anchor': 'end'});
  text(st, x0 - 16, y0 + 4, 'photometric error  f_rgb  →', 'w-lab', {'text-anchor': 'end', transform: `rotate(-90 ${x0 - 16} ${y0 + 4})`});
  text(st, x0 + 8, y1 - 10, '↙ better', 'w-tick');
  // feasible region above the front
  let area = `M${X(pts[0][0])} ${Y(1.05)}`; for (const p of pts) area += `L${X(p[0])} ${Y(p[1])}`; area += `L${X(pts[N][0])} ${Y(1.05)}Z`;
  el('path', {d: area, style: 'fill:var(--muted);fill-opacity:.05'}, st);
  text(st, X(0.8), Y(0.5), 'achievable models', 'w-tick', {'text-anchor': 'middle'});
  if (uLo !== null) {
    let band = `M${X(uLo)} ${Y(hullAt(uLo))}`; for (const p of unreachable) band += `L${X(p[0])} ${Y(p[1])}`; for (let s = uHi; s >= uLo; s -= 0.005) band += `L${X(s)} ${Y(hullAt(s))}`; band += 'Z';
    el('path', {d: band, style: 'fill:url(#hatch);opacity:.7'}, st);
    el('line', {x1: X(uLo), y1: Y(hullAt(uLo)), x2: X(uHi), y2: Y(hullAt(uHi)), style: 'stroke:var(--muted);stroke-dasharray:3 3'}, st);
    text(st, X(uHi) + 12, Y(gfun(uHi)) - 26, 'no λ ever selects', 'w-tick'); text(st, X(uHi) + 12, Y(gfun(uHi)) - 12, 'this stretch', 'w-tick');
  }
  let front = ''; pts.forEach((p, i) => { front += `${i ? 'L' : 'M'}${X(p[0])} ${Y(p[1])}`; });
  el('path', {d: front, style: 'fill:none;stroke:var(--ink);stroke-width:2'}, st);
  text(st, X(0.08), Y(gfun(0.08)) - 10, 'Pareto front', 'w-lab');
  const dyn = el('g', {}, svg);
  const lam = $('#p-lambda'), eps = $('#p-eps');
  function render() {
    const L = 10 ** Number(lam.value), E = Number(eps.value);
    $('#p-lambda-v').value = L.toFixed(2); $('#p-eps-v').value = E.toFixed(2);
    let best = pts[0], bv = Infinity; for (const p of pts) { const v = p[1] + L * p[0]; if (v < bv) { bv = v; best = p; } }
    dyn.replaceChildren();
    const lineG = el('g', {'clip-path': 'url(#pclip)'}, dyn);
    el('line', {x1: X(0), y1: Y(best[1] + L * best[0]), x2: X(1), y2: Y(best[1] - L * (1 - best[0])), style: 'stroke:var(--blue);stroke-width:1.5;stroke-dasharray:6 4'}, lineG);
    const es = Math.min(0.97, Math.max(0.03, E));
    el('line', {x1: X(es), x2: X(es), y1: y0, y2: y1, style: 'stroke:var(--violet);stroke-width:1.2;stroke-dasharray:2 4'}, dyn);
    text(dyn, X(es) + 5, y0 + 12, 'f_geo ≤ ε', 'w-tick', {style: 'fill:var(--violet)'});
    el('circle', {cx: X(es), cy: Y(gfun(es)), r: 7, style: 'fill:var(--violet);stroke:var(--bg);stroke-width:2'}, dyn);
    el('circle', {cx: X(best[0]), cy: Y(best[1]), r: 7, style: 'fill:var(--blue);stroke:var(--bg);stroke-width:2'}, dyn);
    const lg = el('g', {}, dyn); el('rect', {x: x1 - 196, y: y0 + 8, width: 188, height: 46, rx: 6, style: 'fill:var(--bg);stroke:var(--line)'}, lg);
    el('circle', {cx: x1 - 182, cy: y0 + 24, r: 5, style: 'fill:var(--blue)'}, lg); text(lg, x1 - 172, y0 + 28, `weighted loss, λ = ${L.toFixed(2)}`, 'w-lab', {style: 'fill:var(--text)'});
    el('circle', {cx: x1 - 182, cy: y0 + 42, r: 5, style: 'fill:var(--violet)'}, lg); text(lg, x1 - 172, y0 + 46, `constraint, ε = ${E.toFixed(2)}`, 'w-lab', {style: 'fill:var(--text)'});
    const inDent = uLo !== null && es > uLo && es < uHi;
    $('#pareto-note').textContent = inDent
      ? 'The constraint lands inside the stretch that no weight selects. Drag λ across the whole range: the blue point jumps over it.'
      : 'Both can reach this part of the front. Move ε into the hatched stretch to see the difference.';
  }
  lam.addEventListener('input', render); eps.addEventListener('input', render); render();
})();

/* ------------------------------------------------------------ Figure 6: the gate */
(function gateFig() {
  const svg = $('#gate-svg'), fig = $('#gatefig'); if (!svg || !fig) return;
  arrowDefs(svg, 'ga');
  const C = [300, 196], ang = -18 * deg, tv = [Math.cos(ang), Math.sin(ang)], nv = [Math.sin(ang), -Math.cos(ang)];
  const add = (p, d, s) => [p[0] + d[0] * s, p[1] + d[1] * s];
  const st = el('g', {}, svg);
  const a = add(C, tv, -330), b = add(C, tv, 330), a2 = add(a, nv, -60), b2 = add(b, nv, -60);
  el('path', {d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${b2[0]} ${b2[1]}L${a2[0]} ${a2[1]}Z`, style: 'fill:var(--surface-2)'}, st);
  el('line', {x1: a[0], y1: a[1], x2: b[0], y2: b[1], style: 'stroke:var(--line-strong);stroke-width:2'}, st);
  const wl = add(add(C, tv, -200), nv, -26); text(st, wl[0], wl[1], 'measured surface', 'w-tick', {'text-anchor': 'middle', transform: `rotate(${ang / deg} ${wl[0]} ${wl[1]})`});
  const dyn = el('g', {}, svg);
  const dirIn = $('#g-dir'); let state = 'anchored';
  function arrow(p, q, color, dash, w = 2.4) { el('line', {x1: p[0], y1: p[1], x2: q[0], y2: q[1], style: `stroke:var(--${color});stroke-width:${w};${dash ? 'stroke-dasharray:5 4;' : ''}`, 'marker-end': `url(#ga-${color})`}, dyn); }
  function render() {
    const psi = Number(dirIn.value) * deg; $('#g-dir-v').value = `${Math.round(psi / deg)}°`;
    const L = 120, dv = [Math.cos(psi) * L, -Math.sin(psi) * L];
    const dt = dv[0] * tv[0] + dv[1] * tv[1], dn = dv[0] * nv[0] + dv[1] * nv[1];
    const Pt = [tv[0] * dt, tv[1] * dt], Pn = [nv[0] * dn, nv[1] * dn];
    dyn.replaceChildren();
    const G = state === 'contradicted' ? add(C, nv, 78) : C;
    const ellStyle = state === 'anchored' ? 'fill:var(--violet);fill-opacity:.35;stroke:var(--violet);stroke-width:1.5'
      : state === 'unobserved' ? 'fill:var(--muted);fill-opacity:.18;stroke:var(--muted);stroke-dasharray:4 3;stroke-width:1.5'
      : 'fill:var(--bad);fill-opacity:.1;stroke:var(--bad);stroke-dasharray:4 3;stroke-width:1.5';
    const e = el('ellipse', {cx: G[0], cy: G[1], rx: 70, ry: state === 'anchored' ? 8 : 12, transform: `rotate(${ang / deg} ${G[0]} ${G[1]})`, style: ellStyle, class: state === 'contradicted' ? 'fading' : ''}, dyn);
    if (state === 'contradicted') {
      const B = [70, 18], gb = [G[0] - B[0], G[1] - B[1]];
      const sHit = ((C[0] - B[0]) * nv[0] + (C[1] - B[1]) * nv[1]) / (gb[0] * nv[0] + gb[1] * nv[1]);
      const H = [B[0] + gb[0] * sHit, B[1] + gb[1] * sHit];
      el('line', {x1: B[0], y1: B[1], x2: H[0], y2: H[1], style: 'stroke:var(--orange);stroke-width:2'}, dyn);
      el('circle', {cx: H[0], cy: H[1], r: 5, style: 'fill:var(--orange);stroke:var(--bg);stroke-width:2'}, dyn);
      text(dyn, H[0] + 10, H[1] + 22, 'return ρ', 'w-tick', {style: 'fill:var(--orange)'});
      text(dyn, 590, 22, 'a LiDAR beam crossed this Gaussian', 'w-tick', {'text-anchor': 'end', style: 'fill:var(--orange)'});
      text(dyn, 590, 37, 'and returned from the surface behind it', 'w-tick', {'text-anchor': 'end', style: 'fill:var(--orange)'});
      el('path', {d: `M${G[0] - 7} ${G[1] - 7}l14 14M${G[0] + 7} ${G[1] - 7}l-14 14`, style: 'stroke:var(--bad);stroke-width:2.4;stroke-linecap:round'}, dyn);
      arrow(G, [G[0] + dv[0], G[1] + dv[1]], 'muted', true, 1.6);
      text(dyn, 586, 292, 'opacity decays → pruned below a threshold', 'w-lab-strong', {'text-anchor': 'end', style: 'fill:var(--bad)'}); text(dyn, 586, 308, 'never cloned', 'w-lab-strong', {'text-anchor': 'end', style: 'fill:var(--bad)'});
      let o = 1; e.style.opacity = 1; const fade = () => { o -= 0.03; if (o < 0.25 || !e.isConnected) return; e.style.opacity = o; requestAnimationFrame(fade); };
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(fade); else e.style.opacity = 0.35;
      $('#gate-note').textContent = 'Contradicted: the beam proved this space empty. The Gaussian loses opacity and is removed; the photometric update no longer matters.';
      return;
    }
    if (state === 'anchored') {
      arrow(G, [G[0] + dv[0], G[1] + dv[1]], 'blue', true, 1.4);
      arrow([G[0] + Pt[0], G[1] + Pt[1]], [G[0] + Pt[0] + Pn[0], G[1] + Pt[1] + Pn[1]], 'muted', true, 1.6);
      const xm = [G[0] + Pt[0] + Pn[0] * 0.55, G[1] + Pt[1] + Pn[1] * 0.55];
      el('path', {d: `M${xm[0] - 6} ${xm[1] - 6}l12 12M${xm[0] + 6} ${xm[1] - 6}l-12 12`, style: 'stroke:var(--bad);stroke-width:2.2;stroke-linecap:round'}, dyn);
      if (Math.hypot(...Pt) > 6) arrow(G, [G[0] + Pt[0], G[1] + Pt[1]], 'blue', false, 3);
      const lb = add(G, tv, -95); arrow(lb, add(lb, nv, 44), 'orange', false, 2.2);
      const ll = add(lb, nv, 58); text(dyn, ll[0], ll[1], 'LiDAR update: never gated', 'w-tick', {'text-anchor': 'middle', style: 'fill:var(--orange)'});
      const tl = add(add(G, tv, 150), nv, -40); text(dyn, tl[0], tl[1], '(I − nnᵀ) Δμ: applied', 'w-lab-strong', {'text-anchor': 'middle', style: 'fill:var(--blue)', transform: `rotate(${ang / deg} ${tl[0]} ${tl[1]})`});
      const kt = Math.abs(dt) / L * 100, kn = Math.abs(dn) / L * 100;
      $('#gate-note').innerHTML = `Anchored: the component along the surface (${(kt / 100).toFixed(2)} × |Δμ|) is applied; the component through it (${(kn / 100).toFixed(2)} × |Δμ|) is removed. The normal scale stays at most σ<sub>ρ</sub>.`;
    } else {
      arrow(G, [G[0] + dv[0], G[1] + dv[1]], 'blue', false, 3);
      text(dyn, G[0] + dv[0] / 2 + 12, G[1] + dv[1] / 2 - 8, 'Δμ: applied in full', 'w-lab-strong', {style: 'fill:var(--blue)'});
      $('#gate-note').textContent = 'Unobserved: no LiDAR evidence here, so the photometric update is applied unchanged and densification follows standard 3DGS.';
    }
  }
  segmented($('.seg', fig), 'state', (s) => { state = s; render(); });
  dirIn.addEventListener('input', render); render();
})();

/* ------------------------------------------------------------ Figure 7: kernel change map */
(function kernels() {
  const fig = $('#kernel-fig'); if (!fig) return;
  segmented($('.seg', fig), 'k', (k) => { $('#kernel-map').dataset.k = k; });
})();

/* ------------------------------------------------------------ Figure 8: validation steps */
(function plan() {
  const tabs = $$('.plan-tabs [role=tab]'); if (!tabs.length) return;
  function select(tab, focus) {
    tabs.forEach(t => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; $('#' + t.getAttribute('aria-controls')).classList.toggle('is-active', on); });
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => { let n; if (e.key === 'ArrowRight') n = (i + 1) % tabs.length; else if (e.key === 'ArrowLeft') n = (i + tabs.length - 1) % tabs.length; else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = tabs.length - 1; else return; e.preventDefault(); select(tabs[n], true); });
  });
  select(tabs[0]);
})();
})();
