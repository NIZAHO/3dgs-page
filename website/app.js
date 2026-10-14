/* No Pinhole Proxies — page interactions (English / 中文). Original code.
   Every figure is either a schematic or a live evaluation of the equations printed next to it;
   none loads, simulates or implies measured results. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const NS = 'http://www.w3.org/2000/svg';
const deg = Math.PI / 180;
let lang = root.dataset.lang === 'zh' ? 'zh' : 'en';
const T = (en, zh) => (lang === 'zh' ? zh : en);
function el(tag, attrs = {}, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function text(parent, x, y, str, cls = 't-label', attrs = {}) { const t = el('text', {x, y, class: cls, ...attrs}, parent); t.textContent = str; return t; }
function sub(parent, x, y, base, subscript, cls = 't-label', attrs = {}) { const t = el('text', {x, y, class: cls, ...attrs}, parent); t.append(base); const s = el('tspan', {'baseline-shift': 'sub', 'font-size': '75%'}, t); s.textContent = subscript; return t; }
const fmt = (v, n = 2) => (Math.abs(v) < 5e-4 ? 0 : v).toFixed(n);
const signed = (v, n = 0) => { const r = Number(fmt(v, n)); return (r > 0 ? '+' : r < 0 ? '−' : '±') + Math.abs(r).toFixed(n); };
const subTerm = (s) => s.replaceAll('τ_term', 'τ<sub>term</sub>').replaceAll('σ_ρ', 'σ<sub>ρ</sub>');
const renderers = [];   // figures re-render when the language changes

/* ------------------------------------------------------------ theme, menu, progress, nav */
const theme = $('#theme');
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
const labelTheme = () => theme.setAttribute('aria-label', currentTheme() === 'dark' ? T('Switch to light theme', '切换到浅色') : T('Switch to dark theme', '切换到深色'));
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

/* ------------------------------------------------------------ language switch */
function setLang(next) {
  lang = next;
  root.dataset.lang = next; root.lang = next === 'zh' ? 'zh-CN' : 'en';
  document.title = T('No Pinhole Proxies — fisheye + LiDAR Gaussian splatting', '不用针孔替身 — 鱼眼 + 激光雷达高斯泼溅');
  try { localStorage.setItem('chuan-lang', next); } catch (e) {}
  try { const u = new URL(location.href); if (u.searchParams.has('lang')) { u.searchParams.set('lang', next); history.replaceState(null, '', u); } } catch (e) {}
  labelTheme();
  for (const h of $$('.scroll-hint')) h.textContent = T('Scroll sideways to see the whole figure →', '左右滑动查看完整图 →');
  renderers.forEach(r => r());
  scrollState();
}
$('#lang').addEventListener('click', () => setLang(lang === 'zh' ? 'en' : 'zh'));

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

for (const sx of $$('.scroll-x')) { const h = document.createElement('p'); h.className = 'scroll-hint'; h.textContent = T('Scroll sideways to see the whole figure →', '左右滑动查看完整图 →'); sx.after(h); }

/* ------------------------------------------------------------ tooltips */
const tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; tip.setAttribute('role', 'tooltip'); document.body.append(tip);
const tipText = (t) => (lang === 'zh' ? t.dataset.tipZh || t.dataset.tipEn : t.dataset.tipEn || t.dataset.tipZh);
function showTip(target, x, y) { tip.textContent = tipText(target); tip.hidden = false; const r = tip.getBoundingClientRect(); tip.style.left = Math.min(window.innerWidth - r.width - 8, Math.max(8, x + 12)) + 'px'; tip.style.top = Math.max(8, y - r.height - 12) + 'px'; }
for (const t of $$('[data-tip-en],[data-tip-zh]')) {
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
  const oc = [128, 236], ol = [128, 262], W0 = [700, 40], W1 = [960, 440];
  const e = [W1[0] - W0[0], W1[1] - W0[1]], eLen = Math.hypot(...e), wallAng = Math.atan2(e[1], e[0]) / deg;
  const add = (p, d, s) => [p[0] + d[0] * s, p[1] + d[1] * s];
  const dir = (a) => [Math.cos(a * deg), Math.sin(a * deg)];
  function hitWall(o, d) { const w = [W0[0] - o[0], W0[1] - o[1]]; const det = -d[0] * e[1] + e[0] * d[1]; const t = (-w[0] * e[1] + e[0] * w[1]) / det; return add(o, d, t); }
  let mode = 'proxy';
  function build() {
    svg.replaceChildren();
    arrowDefs(svg, 'ta');
    const g = (attrs) => el('g', attrs, svg);
    const base = g({});
    el('line', {x1: W0[0], y1: W0[1], x2: W1[0], y2: W1[1], style: 'stroke:var(--line-strong);stroke-width:2'}, base);
    text(base, 958, 466, T('wall', '墙面'), 't-small', {'text-anchor': 'end'});
    const R = 64, a0 = -100 * deg, a1 = 100 * deg;
    el('path', {d: `M${oc[0] + R * Math.cos(a0)} ${oc[1] + R * Math.sin(a0)} A${R} ${R} 0 1 1 ${oc[0] + R * Math.cos(a1)} ${oc[1] + R * Math.sin(a1)}`, style: 'fill:none;stroke:var(--blue);stroke-width:1.4;opacity:.55'}, base);
    text(base, oc[0] - 4, oc[1] - 72, T('fisheye field of view', '鱼眼视场'), 't-small', {'text-anchor': 'middle'});
    const proxy = g({'data-in': 'proxy'});
    const wedge = (o, h, r) => { const p1 = add(o, dir(-h), r), p2 = add(o, dir(h), r); return `M${o[0]} ${o[1]}L${p1[0]} ${p1[1]}A${r} ${r} 0 0 1 ${p2[0]} ${p2[1]}Z`; };
    el('path', {d: wedge(oc, 45, 470), style: 'fill:var(--blue);fill-opacity:.07;stroke:var(--blue);stroke-opacity:.45;stroke-dasharray:5 4'}, proxy);
    text(proxy, 372, 108, T('perspective crop · 90°', '透视裁切 · 90°'), 't-small', {style: 'fill:var(--blue)'});
    el('path', {d: wedge(ol, 60, 330), style: 'fill:none;stroke:var(--orange);stroke-opacity:.75;stroke-dasharray:2 4;stroke-width:1.4'}, proxy);
    text(proxy, 300, 452, T('virtual depth camera', '虚拟深度相机'), 't-small', {style: 'fill:var(--orange)'});
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
    text(neutral, F[0], F[1] - 26, T('faint floater', '淡淡的漂浮物'), 't-small', {'text-anchor': 'middle'});
    el('ellipse', {cx: F[0], cy: F[1], rx: 30, ry: 19, style: 'fill:var(--bad);fill-opacity:.1;stroke:var(--bad);stroke-dasharray:4 3'}, gated);
    el('path', {d: `M${F[0] - 8} ${F[1] - 8}l16 16M${F[0] + 8} ${F[1] - 8}l-16 16`, style: 'stroke:var(--bad);stroke-width:2.4;stroke-linecap:round'}, gated);
    text(gated, F[0], F[1] - 28, T('blocking → removed', '挡路 → 删除'), 't-small', {'text-anchor': 'middle', style: 'fill:var(--bad);font-weight:600'});
    text(gated, P[0] + 30, P[1] + 26, T('unseen by the LiDAR → free', '激光未测到 → 照常优化'), 't-small');
    const camD = dir(-14), camHit = hitWall(oc, camD);
    const lidHit = hitWall(ol, [1, 0]);
    const offD = [P[0] - oc[0], P[1] - oc[1]], offLen = Math.hypot(...offD), offU = [offD[0] / offLen, offD[1] / offLen], offEnd = add(oc, offU, offLen - 14);
    const rays = g({});
    el('line', {x1: oc[0], y1: oc[1], x2: camHit[0], y2: camHit[1], style: 'stroke:var(--blue);stroke-width:2'}, rays);
    el('line', {x1: ol[0], y1: ol[1], x2: lidHit[0], y2: lidHit[1], style: 'stroke:var(--orange);stroke-width:2'}, rays);
    text(rays, 300, 218, T('camera pixel ray', '相机像素射线'), 't-small', {style: 'fill:var(--blue)', transform: 'rotate(-14 300 218)'});
    text(rays, 236, 278, T('LiDAR beam', '激光束'), 't-small', {style: 'fill:var(--orange)'});
    const offProxy = g({'data-in': 'proxy'}), offRay = g({'data-in': 'ray gate'});
    el('line', {x1: oc[0], y1: oc[1], x2: offEnd[0], y2: offEnd[1], style: 'stroke:var(--muted);stroke-width:1.6;stroke-dasharray:4 4'}, offProxy);
    text(offProxy, 206, 330, T('✕ off-axis pixel: outside the crop,', '✕ 边缘像素：在裁切之外，'), 't-small', {style: 'fill:var(--bad)'});
    text(offProxy, 220, 346, T('never supervised', '从未被监督'), 't-small', {style: 'fill:var(--bad)'});
    el('line', {x1: oc[0], y1: oc[1], x2: offEnd[0], y2: offEnd[1], style: 'stroke:var(--blue);stroke-width:2'}, offRay);
    text(offRay, 18, 392, T('off-axis pixel,', '边缘像素，'), 't-small', {style: 'fill:var(--blue)'});
    text(offRay, 18, 407, T('native resolution', '原生分辨率'), 't-small', {style: 'fill:var(--blue)'});
    const rig = g({});
    el('rect', {x: 98, y: 220, width: 44, height: 58, rx: 9, style: 'fill:var(--bg);stroke:var(--ink);stroke-width:1.5'}, rig);
    el('circle', {cx: oc[0], cy: oc[1], r: 7, style: 'fill:var(--blue)'}, rig);
    el('circle', {cx: ol[0], cy: ol[1], r: 7, style: 'fill:var(--orange)'}, rig);
    text(rig, 120, 300, T('rig', '设备'), 't-small', {'text-anchor': 'middle'});
    const marks = g({'data-in': 'proxy'});
    const y = ol[1];
    for (const [x, label] of [[700, '①'], [lidHit[0] - 52, '②'], [lidHit[0] - 26, '③']]) { el('path', {d: `M${x} ${y - 9}v18`, style: 'stroke:var(--text);stroke-width:2'}, marks); text(marks, x, y - 16, label, 't-label', {'text-anchor': 'middle', style: 'font-size:14px'}); }
    el('circle', {cx: lidHit[0], cy: y, r: 6, style: 'fill:var(--orange);stroke:var(--bg);stroke-width:2'}, marks);
    text(marks, lidHit[0] - 14, y + 28, T('measured return ρ', '实测回波 ρ'), 't-small', {'text-anchor': 'end', style: 'fill:var(--orange);font-weight:600'});
    const term = g({'data-in': 'ray gate'});
    el('rect', {x: ol[0] + 12, y: y - 5, width: lidHit[0] - ol[0] - 28, height: 10, rx: 3, style: 'fill:var(--orange);fill-opacity:.16'}, term);
    text(term, 560, y + 26, T('empty space: the laser flew through here', '空域：激光从这里飞过'), 't-small', {style: 'fill:var(--orange)'});
    const dot = (p) => { el('circle', {cx: p[0], cy: p[1], r: 7.5, style: 'fill:var(--violet);stroke:var(--bg);stroke-width:2.5'}, term); };
    dot(camHit); dot(offEnd);
    el('circle', {cx: lidHit[0], cy: y, r: 10, style: 'fill:none;stroke:var(--violet);stroke-width:2.5'}, term);
    el('circle', {cx: lidHit[0], cy: y, r: 4.5, style: 'fill:var(--orange)'}, term);
    sub(term, camHit[0] - 18, camHit[1] - 14, 'τ', 'term', 't-strong', {'text-anchor': 'end', style: 'fill:var(--violet)'});
    sub(term, offEnd[0] - 16, offEnd[1] + 4, 'τ', 'term', 't-strong', {'text-anchor': 'end', style: 'fill:var(--violet)'});
    const lt = sub(term, lidHit[0] - 18, y + 46, 'τ', 'term', 't-strong', {'text-anchor': 'middle', style: 'fill:var(--violet)'}); lt.append(' = ρ');
    const gate = g({'data-in': 'gate'});
    const ue = [e[0] / eLen, e[1] / eLen], near = wallG.reduce((a, b) => Math.hypot(b[0] - lidHit[0], b[1] - lidHit[1]) < Math.hypot(a[0] - lidHit[0], a[1] - lidHit[1]) ? b : a);
    const pA = add(near, ue, -60), pB = add(near, ue, 60);
    el('line', {x1: pA[0] - 18, y1: pA[1], x2: pB[0] - 18, y2: pB[1], style: 'stroke:var(--violet);stroke-width:1.8', 'marker-start': 'url(#ta-violet)', 'marker-end': 'url(#ta-violet)'}, gate);
    text(gate, 905, 150, T('anchored:', '锚定：'), 't-small', {'text-anchor': 'middle', style: 'fill:var(--violet);font-weight:600'});
    text(gate, 905, 165, T('may slide along,', '可以沿墙滑动，'), 't-small', {'text-anchor': 'middle', style: 'fill:var(--violet)'});
    text(gate, 905, 180, T('not lift off', '不能被拉离'), 't-small', {'text-anchor': 'middle', style: 'fill:var(--violet)'});
  }
  const copy = {
    proxy: {k: ['Common practice', '常见做法'], t: ['Two sensors, two stand-ins, three depths.', '两个传感器，两个替身，三种深度。'],
      p: ['The fisheye is cut into a perspective crop, so off-axis pixels are never supervised. The LiDAR becomes a virtual pinhole depth camera. On one beam, ① the LiDAR loss sees a weighted average of centre depths, ② the camera branch is pulled toward a median, and ③ evaluation takes yet another first surface. None of them is the measured distance ρ.',
          '鱼眼图被切成透视小图，边缘像素根本没被监督；激光雷达被换成一台虚拟针孔深度相机。同一条光束上，① 激光损失看到的是中心深度的加权平均，② 相机分支被拉向一个中位深度，③ 评估时又取了另一个“第一表面”。没有一个等于激光实际量到的距离 ρ。'],
      l: [['var(--blue)', 'camera pixel ray', '相机像素射线'], ['var(--orange)', 'LiDAR beam and its measured return ρ', '激光束及其实测回波 ρ'], ['color-mix(in srgb,var(--blue) 20%,transparent)', 'perspective crop used for training', '训练用的透视裁切'], ['transparent;border:1.5px dashed var(--orange)', 'virtual pinhole depth camera', '虚拟针孔深度相机']]},
    ray: {k: ['Contribution 1', '贡献 1'], t: ['One ray model, one stopping depth.', '一种射线，一个停止深度。'],
      p: ['Every fisheye pixel, including the off-axis ones, and every laser beam is a ray (o, d), handled by one exact formula. Both stop at τ_term, where less than half of the light is left. The beam’s τ_term is compared with its own distance ρ, and the space before the return must be empty, which penalises the floater.',
          '每个鱼眼像素（包括边缘的）和每条激光束都是一条射线 (o, d)，用同一个精确公式处理。两者都停在 τ_term：剩余光量第一次少于一半的地方。光束的 τ_term 直接和它自己的测距 ρ 比；回波之前的空间必须是空的，于是那团漂浮物会被惩罚。'],
      l: [['var(--violet)', 'τ_term: where a ray stops, one rule for both sensors', 'τ_term：射线停下的地方，两种传感器同一规则'], ['color-mix(in srgb,var(--orange) 30%,transparent)', 'empty-space term before the return', '回波之前的空域项']]},
    gate: {k: ['Contributions 1 + 2', '贡献 1 + 2'], t: ['The laser decides what images may move.', '由激光决定图像能挪动什么。'],
      p: ['Along the same rays, count how often each Gaussian is hit, blocks a beam, or is seen. That gives it a label. Anchored: images may slide it along the wall but not lift it off. Blocking: it fades and is removed. Unseen: optimised as usual. Contribution 3 runs all of this inside the existing tile rasteriser.',
          '沿同一批射线，数一数每个高斯被命中、挡路、被照到各多少次，由此给它贴标签。锚定：图像可以让它沿墙滑动，但不能把它拉离墙面。挡路：逐渐变淡并被删除。未测到：照常优化。贡献 3 把这一切放进现有的 tile 光栅器里跑。'],
      l: [['var(--violet)', 'anchored: measured, and it is the surface', '锚定：被测到过，而且它就是表面'], ['color-mix(in srgb,var(--bad) 30%,transparent);border:1.5px solid var(--bad)', 'blocking: sits where the laser saw empty space', '挡路：待在激光证明为空的地方'], ['transparent;border:1.5px dashed var(--muted)', 'unseen: the laser is silent here', '未测到：激光在这里没有发言权']]}
  };
  function panel() {
    const c = copy[mode], i = lang === 'zh' ? 1 : 0;
    $('#teaser-kicker').textContent = c.k[i]; $('#teaser-title').textContent = c.t[i]; $('#teaser-copy').innerHTML = subTerm(c.p[i]);
    $('#teaser-legend').replaceChildren(...c.l.map((row) => { const li = document.createElement('li'); const sw = document.createElement('i'); sw.setAttribute('style', `background:${row[0]}`); li.append(sw); li.insertAdjacentHTML('beforeend', subTerm(row[1 + i])); return li; }));
  }
  segmented($('.seg', fig), 'mode', (m) => { mode = m; fig.dataset.mode = m; panel(); });
  const render = () => { build(); panel(); };
  renderers.push(render); render();
})();

/* ------------------------------------------------------------ Figure 3: where does depth land */
(function depth() {
  const svg = $('#depth-svg'); if (!svg) return;
  const X0 = 60, X1 = 690, M = 8, X = (t) => X0 + t * (X1 - X0) / M;
  const L1t = 56, L1b = 150, L2t = 172, L2b = 252, AX = 266;
  const erf = (x) => { const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)); };
  const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  const alpha = $('#depth-alpha'), tilt = $('#depth-tilt');
  function render() {
    svg.replaceChildren();
    const st = el('g', {}, svg);
    for (let t = 0; t <= M; t++) { el('line', {x1: X(t), x2: X(t), y1: L1t - 4, y2: L2b, class: 'w-grid'}, st); text(st, X(t), AX + 14, String(t), 'w-tick', {'text-anchor': 'middle'}); }
    el('line', {x1: X0, x2: X1, y1: L1b, y2: L1b, class: 'w-axis'}, st);
    el('line', {x1: X0, x2: X1, y1: L2b, y2: L2b, class: 'w-axis'}, st);
    el('line', {x1: X0, x2: X1, y1: (L2t + L2b) / 2, y2: (L2t + L2b) / 2, style: 'stroke:var(--muted);stroke-dasharray:3 4'}, st);
    text(st, X0 - 8, L1t + 10, T('opacity', '不透明度'), 'w-tick', {'text-anchor': 'end'});
    text(st, X0 - 8, L2t + 6, 'T = 1', 'w-tick', {'text-anchor': 'end'});
    text(st, X0 - 8, (L2t + L2b) / 2 + 4, '½', 'w-tick', {'text-anchor': 'end'});
    text(st, X0 - 8, L2b, '0', 'w-tick', {'text-anchor': 'end'});
    text(st, X1, AX + 30, T('distance along the beam (m)', '沿光束的距离（米）'), 'w-tick', {'text-anchor': 'end'});
    el('line', {x1: X(0), x2: X(0.25), y1: L1b - 1, y2: L1b - 1, style: 'stroke:var(--orange);stroke-width:5;stroke-linecap:round'}, st);
    text(st, X(0.32), L1b - 6, T('LiDAR', '激光'), 'w-tick');
    const af = Number(alpha.value), th = Number(tilt.value) * deg;
    const ell = 0.3, zc = 6.0, rho = zc + ell * Math.tan(th), aw = 0.9, sf = 0.1, sw = Math.min(0.35, 0.06 / Math.cos(th));
    $('#depth-alpha-v').value = af.toFixed(2); $('#depth-tilt-v').value = Math.round(th / deg) + '°';
    const E = (af * 3 + (1 - af) * aw * zc) / (af + (1 - af) * aw);
    const Med = af >= 0.5 ? 3 : zc;
    const term = af >= 0.5 ? 3 : rho;
    const Tt = (t) => (1 - af * Phi((t - 3) / sf)) * (1 - aw * Phi((t - rho) / sw));
    const dyn = el('g', {}, svg);
    let d1 = `M${X(0)} ${L1b}`, d2 = `M${X(0)} ${L1b}`, dT = '';
    for (let i = 0; i <= 400; i++) { const t = i * M / 400; const f = af * Math.exp(-0.5 * ((t - 3) / sf) ** 2), w = aw * Math.exp(-0.5 * ((t - rho) / sw) ** 2); d1 += `L${X(t)} ${L1b - f * (L1b - L1t)}`; d2 += `L${X(t)} ${L1b - w * (L1b - L1t)}`; dT += `${i ? 'L' : 'M'}${X(t)} ${L2b - Tt(t) * (L2b - L2t)}`; }
    el('path', {d: d1 + `L${X(M)} ${L1b}Z`, style: 'fill:var(--muted);fill-opacity:.35;stroke:var(--muted)'}, dyn);
    el('path', {d: d2 + `L${X(M)} ${L1b}Z`, style: 'fill:var(--muted);fill-opacity:.55;stroke:var(--text);stroke-opacity:.6'}, dyn);
    el('path', {d: dT, style: 'fill:none;stroke:var(--ink);stroke-width:1.8'}, dyn);
    text(dyn, X(3), L1b - Math.max(af, 0.05) * (L1b - L1t) - 6, T('floater', '漂浮物'), 'w-tick', {'text-anchor': 'middle'});
    const cy = L1b - 0.18 * (L1b - L1t);
    el('circle', {cx: X(zc), cy, r: 4.5, style: 'fill:var(--bg);stroke:var(--text);stroke-width:1.5'}, dyn);
    if (Math.abs(rho - zc) > 0.05) el('path', {d: `M${X(zc) + 5} ${cy}H${X(rho) - 3}`, style: 'stroke:var(--text);stroke-dasharray:2 3'}, dyn);
    text(dyn, X(zc) - 8, cy + 4, T('wall centre', '墙面高斯中心'), 'w-tick', {'text-anchor': 'end'});
    const ms = [
      {x: rho, label: T('ρ measured', 'ρ 实测'), style: 'stroke:var(--orange);stroke-width:2.2', fill: 'var(--orange)'},
      {x: E, label: T('stand-in average', '替身平均'), style: 'stroke:var(--text);stroke-width:1.6;stroke-dasharray:5 4', fill: 'var(--text)'},
      {x: Med, label: T('stand-in median', '替身中位'), style: 'stroke:var(--text);stroke-width:1.6;stroke-dasharray:1.5 3', fill: 'var(--text)'},
      {x: term, label: 'τ_term', style: 'stroke:var(--violet);stroke-width:2.6', fill: 'var(--violet)'}
    ].sort((a, b) => a.x - b.x);
    const rowsX = [-1e9, -1e9, -1e9];
    for (const m of ms) {
      const px = X(m.x); let row = rowsX.findIndex(v => px - v > 92); if (row < 0) row = 2; rowsX[row] = px;
      el('line', {x1: px, x2: px, y1: 20 + row * 13, y2: L2b, style: m.style}, dyn);
      const right = px > X1 - 70;
      const t = text(dyn, right ? px - 4 : px + 4, 16 + row * 13, '', 'w-lab-strong', {style: `fill:${m.fill}`, 'text-anchor': right ? 'end' : 'start'});
      if (m.label === 'τ_term') { t.append('τ'); const s = el('tspan', {'baseline-shift': 'sub', 'font-size': '75%'}, t); s.textContent = 'term'; } else t.textContent = m.label;
    }
    const rows = [
      ['var(--orange)', T('ρ, measured return', 'ρ，实测回波'), rho, null, false],
      ['var(--text)', T('stand-in: average of centre depths', '替身：中心深度加权平均'), E, E - rho, false],
      ['var(--text)', T('stand-in: median (a centre depth)', '替身：中位（也是中心深度）'), Med, Med - rho, false],
      ['var(--violet)', T('τ_term, ray model', 'τ_term，射线模型'), term, term - rho, true]
    ];
    const tb = $('#depth-readout'); tb.replaceChildren();
    for (const [c, name, v, dv, hl] of rows) {
      const tr = document.createElement('tr'); if (hl) tr.className = 'hl';
      tr.innerHTML = `<td><i style="background:${c}"></i>${subTerm(name)}</td><td>${fmt(v)}</td><td>${dv === null ? '—' : signed(dv * 100) + ' cm'}</td>`; tb.append(tr);
    }
    const fs = document.createElement('tr'); fs.innerHTML = `<td><i style="background:color-mix(in srgb,var(--orange) 35%,transparent)"></i>${T('empty-space penalty', '空域惩罚')}</td><td>${(1 - Tt(rho - 0.5)).toFixed(2)}</td><td>${af >= 0.5 ? T('floater wins', '漂浮物胜出') : ''}</td>`; tb.append(fs);
  }
  alpha.addEventListener('input', render); tilt.addEventListener('input', render);
  renderers.push(render); render();
})();

/* ------------------------------------------------------------ Figure 4: pipeline architecture */
(function pipeline() {
  const fig = $('#pipe-fig'), svg = $('#pipe-svg'); if (!fig || !svg) return;
  let mode = 'ours', active = null;
  const C = {cam: 'var(--blue)', lid: 'var(--orange)', shared: 'var(--violet)', neutral: 'var(--line-strong)'};
  // [id, x, y, w, h, path, badges]
  const geo = {
    in_cam: [16, 30, 160, 80, 'cam'], in_pose: [16, 150, 160, 70, 'neutral'], in_lid: [16, 260, 160, 80, 'lid'],
    ray_cam: [216, 30, 170, 80, 'cam', ['C1']], ray_lid: [216, 260, 170, 80, 'lid', ['C1']],
    render: [430, 95, 210, 180, 'shared', ['C1', 'C3']], gauss: [430, 330, 210, 70, 'shared'],
    loss_cam: [690, 30, 200, 80, 'cam'], loss_lid: [690, 260, 200, 80, 'lid', ['C1']],
    record: [690, 370, 200, 70, 'shared', ['C2']], update: [430, 450, 210, 70, 'shared', ['C2']],
    out: [936, 150, 170, 90, 'neutral']
  };
  // text: {ours:[en lines, zh lines], base:[...]} — first line is the title
  const L = {
    in_cam: {ours: [['Fisheye images', '3 cameras, full circle'], ['鱼眼图像', '3 台相机，完整成像圆']]},
    in_pose: {ours: [['Poses & calibration', 'given and fixed'], ['位姿与标定', '给定，保持不变']]},
    in_lid: {ours: [['LiDAR sweeps', 'one range per beam'], ['激光扫描', '每条光束一个测距']]},
    ray_cam: {ours: [['Pixel rays (o, d)', 'every pixel, no crop'], ['像素射线 (o, d)', '每个像素，不裁切']], base: [['Perspective crops', 'pinhole views of the fisheye', 'image rim is lost'], ['透视裁切', '鱼眼图切成针孔视图', '图像边缘丢失']]},
    ray_lid: {ours: [['Beam rays (oₖ, dₖ)', 'range ρₖ per beam', 'own origin per return'], ['光束射线 (oₖ, dₖ)', '每条光束的测距 ρₖ', '每个回波自己的原点']], base: [['Virtual depth camera', 'pinhole, at the LiDAR origin'], ['虚拟深度相机', '针孔，放在激光原点']]},
    render: {ours: [['One renderer', 'exact ray–Gaussian response', 'tile rasteriser, no BVH', 'outputs colour C and', 'stopping depth τ_term,', 'same rule for both sensors'], ['同一个渲染器', '精确的射线–高斯响应', 'tile 光栅，不建 BVH', '输出颜色 C', '和停止深度 τ_term，', '两种传感器同一规则']],
      base: [['Two sets of rules', 'EWA projection (approximate)', 'camera depth: a median', 'laser depth: a weighted', 'average of centre depths'], ['两套规则', 'EWA 投影（近似）', '相机深度：中位数', '激光深度：中心深度', '的加权平均']]},
    gauss: {ours: [['One set of 3D Gaussians', 'shared by both sensors'], ['同一套 3D 高斯', '两种传感器共用']], base: [['One set of 3D Gaussians', 'pulled by 3 different depths'], ['同一套 3D 高斯', '被 3 种深度来回拉扯']]},
    loss_cam: {ours: [['Image loss', 'rendered colour vs photo'], ['图像损失', '渲染颜色 vs 照片']], base: [['Image loss + depth pull', 'depth pulled to the median'], ['图像损失 + 深度牵引', '深度被拉向中位数']]},
    loss_lid: {ours: [['Laser loss', 'τ_term vs ρ, + empty space'], ['激光损失', 'τ_term vs ρ，+ 空域']], base: [['Laser loss', 'weighted centre depth vs z'], ['激光损失', '加权中心深度 vs z']]},
    record: {ours: [['Per-Gaussian record', 'hit · blocked · seen', '→ anchored · blocking · unseen'], ['逐高斯记账', '命中 · 挡路 · 照到', '→ 锚定 · 挡路 · 未测到']], base: [['No per-Gaussian record', 'nothing tracks what', 'the laser measured'], ['没有逐高斯记账', '没人记录激光', '测到了什么']]},
    update: {ours: [['Anchored update', 'anchored: slide, not lift off', 'blocking: removed · unseen: free'], ['锚定更新', '锚定：可滑动，不可拉离', '挡路：删除 · 未测到：照常']], base: [['Plain weighted update', 'images may move anything', 'corrections off the beam'], ['普通加权更新', '图像什么都能挪', '修正方向偏离光束']]},
    out: {ours: [['Output', 'the same Gaussians →', 'PLY → SOG → browser'], ['输出', '同一套高斯 →', 'PLY → SOG → 浏览器']]}
  };
  const N = {
    in_cam: {ours: ['Raw fisheye images from three cameras. Every pixel inside the image circle is used at its native resolution.', '三台相机的原始鱼眼图像。成像圆内的每个像素都以原生分辨率使用。'], base: ['Raw fisheye images from three cameras.', '三台相机的原始鱼眼图像。']},
    in_pose: {ours: ['Poses and calibration are given and kept fixed, so differences come from the model, not from re-fitting poses.', '位姿和标定都是给定且固定的，所以差异来自模型本身，而不是重新拟合位姿。']},
    in_lid: {ours: ['Each LiDAR return is one measured distance along one beam.', '每个激光回波都是沿一条光束量到的一个距离。']},
    ray_cam: {ours: ['C1 · Each pixel becomes a ray: it starts at the camera centre and points where the calibrated fisheye model says. No perspective crop.', 'C1 · 每个像素变成一条射线：从相机中心出发，方向由标定好的鱼眼模型给出。不做透视裁切。'], base: ['Stand-ins · Each fisheye image is cut into pinhole views. Pixels near the rim are lost, and projection uses the approximate EWA formula.', '替身做法 · 每张鱼眼图被切成针孔视图。边缘像素丢失，投影用近似的 EWA 公式。']},
    ray_lid: {ours: ['C1 · Each return becomes a ray with its own origin (taken at the return’s own timestamp), its direction and its measured distance ρ.', 'C1 · 每个回波变成一条射线：自己的原点（取该回波的时刻）、方向和实测距离 ρ。'], base: ['Stand-ins · The LiDAR is replaced by a virtual pinhole depth camera placed at its origin.', '替身做法 · 激光雷达被换成放在它原点的一台虚拟针孔深度相机。']},
    render: {ours: ['C1 + C3 · One exact formula turns each Gaussian into opacity along any ray. The same rule gives a pixel’s colour and the stopping depth τ_term of pixels and beams alike. It runs inside the existing tile rasteriser.', 'C1 + C3 · 同一个精确公式，把每个高斯沿任意射线变成不透明度。同一条规则给出像素的颜色，以及像素和光束共同的停止深度 τ_term。它跑在现有的 tile 光栅器里。'], base: ['Stand-ins · The camera side regularises toward a median depth, while the laser side uses a weighted average of Gaussian centre depths: two rules for one scene.', '替身做法 · 相机一侧向中位深度做正则，激光一侧用高斯中心深度的加权平均：同一个场景，两套规则。']},
    gauss: {ours: ['One set of 3D Gaussians shared by both sensors: no second set, no second opacity.', '两种传感器共用的一套 3D 高斯：没有第二套，也没有第二个不透明度。'], base: ['The same Gaussians are pulled by three different notions of depth, and appearance absorbs the conflict.', '同一批高斯被三种不同的“深度”来回拉扯，矛盾最后被外观吸收。']},
    loss_cam: {ours: ['The usual colour loss against the photo. No camera depth loss is needed: the laser already shapes the surface the camera sees.', '通常的颜色损失，对照照片。不需要相机深度损失：相机看到的表面已由激光塑造。'], base: ['A colour loss, plus a term pulling the camera’s expected depth toward the median depth.', '颜色损失，外加一项把相机的期望深度拉向中位深度。']},
    loss_lid: {ours: ['C1 · The beam should stop at its measured distance ρ, and the space before ρ should be empty.', 'C1 · 光束应当停在实测距离 ρ 处，ρ 之前的空间应当是空的。'], base: ['Stand-ins · Compares a weighted centre depth with the measured depth; corrections move centres along the camera axis, not along the beam.', '替身做法 · 用加权中心深度对照实测深度；修正沿相机光轴移动中心，而不是沿光束。']},
    record: {ours: ['C2 · In the same laser pass, each Gaussian counts how often it was hit, how often it blocked a beam and how often it was seen. The counts give it a label: anchored, blocking or unseen.', 'C2 · 在同一趟激光渲染里，每个高斯统计自己被命中、挡路、被照到的次数，由此得到标签：锚定、挡路或未测到。'], base: ['Stand-ins · Nothing records which Gaussians the laser actually measured.', '替身做法 · 没有任何东西记录激光真正测到了哪些高斯。']},
    update: {ours: ['C2 · Images may slide an anchored Gaussian along the surface but not lift it off; blocking Gaussians fade and are removed; unseen ones are optimised as usual.', 'C2 · 图像可以让锚定的高斯沿表面滑动，但不能把它拉离表面；挡路的高斯逐渐变淡并被删除；未测到的照常优化。'], base: ['Stand-ins · A plain weighted update: image fitting may move any Gaussian in any direction.', '替身做法 · 普通的加权更新：图像拟合可以把任何高斯往任何方向挪。']},
    out: {ours: ['After training, the same Gaussians are exported as PLY, compressed to SOG and viewed in the browser (§08).', '训练结束后，同一套高斯导出为 PLY，压缩为 SOG，在浏览器里查看（§08）。']}
  };
  const pick = (obj) => obj[mode] || obj.ours;
  function drawEdge(g, pts, color, opts = {}) {
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join('');
    const marker = opts.noArrow ? {} : {'marker-end': `url(#pa-${color})`};
    el('path', {d, class: 'pe', style: `stroke:var(--${color === 'muted' ? 'muted' : color});${opts.dash ? 'stroke-dasharray:5 4;' : ''}${opts.op ? `opacity:${opts.op};` : ''}`, ...marker}, g);
    if (opts.label) { const t = text(g, opts.label[0], opts.label[1], '', 'pe-l', {style: `fill:var(--${color === 'muted' ? 'muted' : color})`, 'text-anchor': opts.label[2] || 'start'}); t.innerHTML = opts.label[3]; }
  }
  function render() {
    svg.replaceChildren();
    arrowDefs(svg, 'pa');
    const edges = el('g', {}, svg), nodes = el('g', {}, svg);
    const ours = mode === 'ours';
    drawEdge(edges, [[176, 70], [214, 70]], 'blue');
    drawEdge(edges, [[176, 300], [214, 300]], 'orange');
    drawEdge(edges, [[176, 185], [196, 185], [196, 96], [214, 96]], 'muted', {dash: true});
    drawEdge(edges, [[196, 185], [196, 274], [214, 274]], 'muted', {dash: true});
    drawEdge(edges, [[386, 70], [408, 70], [408, 140], [428, 140]], 'blue');
    drawEdge(edges, [[386, 300], [408, 300], [408, 230], [428, 230]], 'orange');
    drawEdge(edges, [[535, 330], [535, 277]], 'violet', {label: [543, 310, 'start', T('reads', '读取')]});
    drawEdge(edges, [[640, 140], [665, 140], [665, 70], [688, 70]], 'blue', {label: [670, 130, 'start', ours ? T('colour C', '颜色 C') : T('colour + median', '颜色 + 中位')]});
    drawEdge(edges, [[640, 230], [665, 230], [665, 300], [688, 300]], 'orange', {label: [670, 250, 'start', ours ? 'τ<tspan baseline-shift="sub" font-size="75%">term</tspan>' : T('weighted centre depth', '加权中心深度')]});
    if (ours) {
      drawEdge(edges, [[790, 340], [790, 368]], 'violet', {label: [798, 360, 'start', T('same pass', '同一趟')]});
      drawEdge(edges, [[790, 440], [790, 485], [642, 485]], 'violet', {label: [700, 478, 'start', T('labels', '标签')]});
    }
    drawEdge(edges, [[890, 70], [912, 70], [912, 505], [642, 505]], 'muted', {dash: true, label: [906, 521, 'end', T('gradients from both losses', '两个损失回传的梯度')]});
    drawEdge(edges, [[890, 300], [912, 300]], 'muted', {dash: true, noArrow: true});
    drawEdge(edges, [[535, 450], [535, 402]], 'violet', {label: [543, 432, 'start', T('applies', '更新')]});
    for (const id of Object.keys(geo)) {
      const [x, y, w, h, path, badges] = geo[id];
      const lines = pick(L[id])[lang === 'zh' ? 1 : 0];
      const dim = !ours && id === 'record';
      const g = el('g', {class: 'pn' + (active === id ? ' on' : ''), tabindex: 0, role: 'button', 'data-id': id, 'aria-label': lines.join(', ')}, nodes);
      el('rect', {class: 'box', x, y, width: w, height: h, rx: 10, style: `stroke:${C[path]};${dim ? 'stroke-dasharray:5 4;opacity:.6;' : ''}${path === 'shared' && !dim ? 'fill:var(--violet-wash);' : ''}`}, g);
      const tt = text(g, x + 12, y + 24, '', 'pn-t'); tt.innerHTML = lines[0].replaceAll('τ_term', 'τ<tspan baseline-shift="sub" font-size="75%">term</tspan>');
      lines.slice(1).forEach((ln, i) => { const s = text(g, x + 12, y + 44 + i * 17, '', 'pn-s'); s.innerHTML = ln.replaceAll('τ_term', 'τ<tspan baseline-shift="sub" font-size="75%">term</tspan>'); });
      if (ours && badges) badges.slice().reverse().forEach((b, i) => { const bx = x + w - 36 - i * 32; el('rect', {x: bx, y: y + 9, width: 28, height: 17, rx: 8.5, style: 'fill:var(--ink)'}, g); text(g, bx + 14, y + 21, b, 'pn-badge', {'text-anchor': 'middle'}); });
      if (!ours && ['ray_cam', 'ray_lid', 'render', 'loss_lid'].includes(id)) { el('rect', {x: x + w - 66, y: y + h - 24, width: 58, height: 17, rx: 8.5, style: 'fill:var(--bg);stroke:var(--bad)'}, g); text(g, x + w - 37, y + h - 12, T('stand-in', '替身'), 'pn-badge', {'text-anchor': 'middle', style: 'fill:var(--bad)'}); }
      const show = () => { active = id; $$('.pn', svg).forEach(n => n.classList.toggle('on', n === g)); note(); };
      g.addEventListener('pointerenter', show); g.addEventListener('focus', show); g.addEventListener('click', show);
    }
    const band = el('g', {}, svg);
    el('rect', {x: 16, y: 536, width: 1090, height: 32, rx: 8, style: 'fill:var(--surface-2);stroke:var(--line)'}, band);
    if (ours) { el('rect', {x: 26, y: 543, width: 28, height: 17, rx: 8.5, style: 'fill:var(--ink)'}, band); text(band, 40, 555, 'C3', 'pn-badge', {'text-anchor': 'middle'}); }
    text(band, ours ? 64 : 28, 556, ours ? T('Everything above runs inside the existing tile rasteriser: binning · sorting · visible-only Adam · GPU-resident storage, all kept unchanged.', '以上全部跑在现有的 tile 光栅器里：分箱 · 排序 · 只更新可见高斯的 Adam · GPU 常驻存储，全部保留。') : T('A fast tile rasteriser: binning · sorting · visible-only Adam · GPU-resident storage.', '高速 tile 光栅器：分箱 · 排序 · 只更新可见高斯的 Adam · GPU 常驻存储。'), 'pn-s', {style: 'fill:var(--text)'});
    note();
  }
  function note() {
    const p = $('#pipe-note');
    if (!active) { p.innerHTML = T('<b>Hover or tap a box</b> to see what it does. Follow blue for the camera and orange for the LiDAR; both meet in the violet renderer.', '<b>悬停或点击任意一个框</b>，查看它做什么。蓝线是相机，橙线是激光，两者在紫色的渲染器里汇合。'); return; }
    const n = pick(N[active]); p.innerHTML = subTerm(n[lang === 'zh' ? 1 : 0]);
  }
  segmented($('.seg', fig), 'mode', (m) => { mode = m; fig.dataset.mode = m; render(); });
  renderers.push(render); render();
})();

/* ------------------------------------------------------------ Figure 5: whitened view of the ray response */
(function whitening() {
  const svg = $('#white-svg'); if (!svg) return;
  const W = 640, H = 360, k = 90, cx = 382, cy = 180;
  const S = (p) => [cx + p[0] * k, cy - p[1] * k];
  const s1 = 1.0, s2 = 0.22, kap = Math.sqrt(s1 * s2);
  const off = $('#w-offset'), rot = $('#w-rot'), morph = $('#w-morph');
  function render() {
    svg.replaceChildren();
    const clip = el('clipPath', {id: 'wclip'}, el('defs', {}, svg)); el('rect', {x: 0, y: 0, width: W, height: H}, clip);
    arrowDefs(svg, 'wa');
    const grid = el('g', {}, svg);
    for (let x = -5; x <= 3; x++) el('line', {x1: cx + x * k, x2: cx + x * k, y1: 0, y2: H, class: 'w-grid'}, grid);
    for (let y = -2; y <= 2; y++) el('line', {x1: 0, x2: W, y1: cy - y * k, y2: cy - y * k, class: 'w-grid'}, grid);
    const dyn = el('g', {'clip-path': 'url(#wclip)'}, svg);
    const h = Number(off.value), phi = Number(rot.value) * deg, t = Number(morph.value);
    $('#w-offset-v').value = `${h.toFixed(2)} m`; $('#w-rot-v').value = `${Math.round(phi / deg)}°`; $('#w-morph-v').value = `${Math.round(t * 100)}%`;
    const c = Math.cos(phi), s = Math.sin(phi);
    const i1 = 1 / (s1 * s1), i2 = 1 / (s2 * s2);
    const A = [[c * c * i1 + s * s * i2, c * s * (i1 - i2)], [c * s * (i1 - i2), s * s * i1 + c * c * i2]];
    const o = [-3.8, h], d = [1, 0], mo = [-o[0], -o[1]];
    const v = [A[0][0] * mo[0] + A[0][1] * mo[1], A[1][0] * mo[0] + A[1][1] * mo[1]];
    const q = d[0] * (A[0][0] * d[0] + A[0][1] * d[1]) + d[1] * (A[1][0] * d[0] + A[1][1] * d[1]);
    const b = d[0] * v[0] + d[1] * v[1];
    const tau = b / q, D2 = Math.max(0, (mo[0] * v[0] + mo[1] * v[1]) - b * b / q), Dm = Math.sqrt(D2), a = Math.exp(-0.5 * D2);
    const zc = mo[0] * d[0] + mo[1] * d[1];
    const Wm = [[c / s1, s / s1], [-s / s2, c / s2]];
    const Mx = [[(1 - t) + t * kap * Wm[0][0], t * kap * Wm[0][1]], [t * kap * Wm[1][0], (1 - t) + t * kap * Wm[1][1]]];
    const Tf = (p) => S([Mx[0][0] * p[0] + Mx[0][1] * p[1], Mx[1][0] * p[0] + Mx[1][1] * p[1]]);
    const ellipse = (r, style) => { let path = ''; for (let i = 0; i <= 72; i++) { const u = i / 72 * 2 * Math.PI; const lx = r * s1 * Math.cos(u), ly = r * s2 * Math.sin(u); const p = Tf([c * lx - s * ly, s * lx + c * ly]); path += `${i ? 'L' : 'M'}${p[0]} ${p[1]}`; } el('path', {d: path + 'Z', style}, dyn); };
    ellipse(2, 'fill:var(--muted);fill-opacity:.12;stroke:var(--muted);stroke-opacity:.5;stroke-dasharray:3 3');
    ellipse(1, 'fill:var(--muted);fill-opacity:.28;stroke:var(--text);stroke-opacity:.7');
    const r0 = Tf(o), r1 = Tf([o[0] + 9 * d[0], o[1] + 9 * d[1]]);
    el('line', {x1: r0[0], y1: r0[1], x2: r1[0], y2: r1[1], style: 'stroke:var(--blue);stroke-width:2', 'marker-end': 'url(#wa-blue)'}, dyn);
    el('circle', {cx: r0[0], cy: r0[1], r: 5, style: 'fill:var(--blue)'}, dyn);
    const mu = Tf([0, 0]), ps = Tf([o[0] + tau * d[0], o[1] + tau * d[1]]), pc = Tf([o[0] + zc * d[0], o[1] + zc * d[1]]);
    el('line', {x1: mu[0], y1: mu[1], x2: ps[0], y2: ps[1], style: 'stroke:var(--violet);stroke-width:1.6;stroke-dasharray:4 3'}, dyn);
    el('circle', {cx: mu[0], cy: mu[1], r: 3.5, style: 'fill:var(--ink)'}, dyn);
    text(dyn, mu[0] - 8, mu[1] + 16, 'μ', 'w-lab-strong', {'text-anchor': 'end', style: 'fill:var(--ink)'});
    el('rect', {x: pc[0] - 1.5, y: pc[1] - 10, width: 3, height: 20, style: 'fill:var(--text)', transform: `rotate(${Math.atan2(r1[1] - r0[1], r1[0] - r0[0]) / deg} ${pc[0]} ${pc[1]})`}, dyn);
    text(dyn, pc[0] - 6, pc[1] - 16, T('centre depth', '中心深度'), 'w-tick', {'text-anchor': 'end', style: 'fill:var(--text)'});
    el('circle', {cx: ps[0], cy: ps[1], r: 6.5, style: 'fill:var(--violet);stroke:var(--bg);stroke-width:2'}, dyn);
    text(dyn, ps[0] + 10, ps[1] - 12, 'τ*', 'w-lab-strong', {style: 'fill:var(--violet)'});
    const mid = [(mu[0] + ps[0]) / 2, (mu[1] + ps[1]) / 2];
    const sl = Math.hypot(ps[0] - mu[0], ps[1] - mu[1]) || 1, nx = -(ps[1] - mu[1]) / sl, ny = (ps[0] - mu[0]) / sl, sg = ny > 0 ? 1 : -1;
    if (sl > 14) text(dyn, mid[0] + nx * 12 * sg, mid[1] + ny * 12 * sg + 4, 'D', 'w-lab-strong', {'text-anchor': 'middle', style: 'fill:var(--violet);font-style:italic'});
    text(dyn, 12, 22, t < 0.02 ? T('world space', '世界空间') : t > 0.98 ? T('stretched space: the Gaussian is a ball, D ⟂ ray', '拉伸后的空间：高斯变成圆球，D ⟂ 射线') : T('stretching…', '拉伸中…'), 'w-lab');
    $('#white-readout').innerHTML = [
      [T('τ*, ray response', 'τ*，射线响应'), `${tau.toFixed(2)} m`, true], [T('centre depth (stand-in)', '中心深度（替身）'), `${zc.toFixed(2)} m`], [T('τ* − centre depth', 'τ* − 中心深度'), `${signed(tau - zc, 2)} m`], [T('D, distance in σ', 'D，以 σ 计的距离'), Dm.toFixed(2)], [T('opacity a = e<sup>−D²/2</sup>', '不透明度 a = e<sup>−D²/2</sup>'), a.toFixed(2)]
    ].map(([k2, v2, hl]) => `<tr${hl ? ' class="hl"' : ''}><td>${k2}</td><td>${v2}</td></tr>`).join('');
  }
  for (const i of [off, rot, morph]) i.addEventListener('input', render);
  renderers.push(render); render();
})();

/* ------------------------------------------------------------ Figure 6: weighted sum vs constraint */
(function pareto() {
  const svg = $('#pareto-svg'); if (!svg) return;
  const x0 = 78, x1 = 612, y0 = 26, y1 = 326;
  const X = (u) => x0 + u * (x1 - x0), Y = (v) => y1 - v * (y1 - y0);
  const N = 320, sA = 0.03, sB = 0.97, slope = (s) => 1.7 * (1 - s) ** 1.5 + 1.25 * Math.exp(-(((s - 0.5) / 0.065) ** 2));
  const raw = [0]; for (let i = 1; i <= N; i++) { const s0 = sA + (sB - sA) * (i - 1) / N, s1 = sA + (sB - sA) * i / N; raw.push(raw[i - 1] - 0.5 * (slope(s0) + slope(s1)) * (s1 - s0)); }
  const gLo = 0.07, gHi = 0.93, rMin = raw[N];
  const pts = raw.map((r, i) => [sA + (sB - sA) * i / N, gLo + (gHi - gLo) * (r - rMin) / (0 - rMin)]);
  const gfun = (s) => { const f = (Math.min(sB, Math.max(sA, s)) - sA) / (sB - sA) * N, i = Math.min(N - 1, Math.floor(f)), w = f - i; return pts[i][1] * (1 - w) + pts[i + 1][1] * w; };
  const hull = []; for (const p of pts) { while (hull.length >= 2) { const [a, b] = [hull[hull.length - 2], hull[hull.length - 1]]; if ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) <= 0) hull.pop(); else break; } hull.push(p); }
  const hullAt = (s) => { for (let i = 1; i < hull.length; i++) if (s <= hull[i][0]) { const [a, b] = [hull[i - 1], hull[i]]; return a[1] + (b[1] - a[1]) * (s - a[0]) / (b[0] - a[0]); } return hull[hull.length - 1][1]; };
  const unreachable = pts.filter(p => p[1] - hullAt(p[0]) > 1e-4);
  const uLo = unreachable.length ? unreachable[0][0] : null, uHi = unreachable.length ? unreachable[unreachable.length - 1][0] : null;
  const lam = $('#p-lambda'), eps = $('#p-eps');
  function render() {
    svg.replaceChildren();
    const defs = el('defs', {}, svg);
    const pat = el('pattern', {id: 'hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)'}, defs);
    el('line', {x1: 0, y1: 0, x2: 0, y2: 6, style: 'stroke:var(--muted);stroke-width:2'}, pat);
    const clip = el('clipPath', {id: 'pclip'}, defs); el('rect', {x: x0, y: y0, width: x1 - x0, height: y1 - y0}, clip);
    const st = el('g', {}, svg);
    for (let i = 0; i <= 4; i++) { el('line', {x1: X(i / 4), x2: X(i / 4), y1: y0, y2: y1, class: 'w-grid'}, st); el('line', {x1: x0, x2: x1, y1: Y(i / 4), y2: Y(i / 4), class: 'w-grid'}, st); }
    el('line', {x1: x0, x2: x1, y1: y1, y2: y1, class: 'w-axis'}, st); el('line', {x1: x0, x2: x0, y1: y0, y2: y1, class: 'w-axis'}, st);
    text(st, x1, y1 + 30, T('geometric error →', '几何误差 →'), 'w-lab', {'text-anchor': 'end'});
    text(st, x0 - 16, y0 + 4, T('image error →', '画面误差 →'), 'w-lab', {'text-anchor': 'end', transform: `rotate(-90 ${x0 - 16} ${y0 + 4})`});
    text(st, x0 + 8, y1 - 10, T('↙ better', '↙ 更好'), 'w-tick');
    let area = `M${X(pts[0][0])} ${Y(1.05)}`; for (const p of pts) area += `L${X(p[0])} ${Y(p[1])}`; area += `L${X(pts[N][0])} ${Y(1.05)}Z`;
    el('path', {d: area, style: 'fill:var(--muted);fill-opacity:.05'}, st);
    text(st, X(0.8), Y(0.5), T('achievable models', '可达到的模型'), 'w-tick', {'text-anchor': 'middle'});
    if (uLo !== null) {
      let band = `M${X(uLo)} ${Y(hullAt(uLo))}`; for (const p of unreachable) band += `L${X(p[0])} ${Y(p[1])}`; for (let s = uHi; s >= uLo; s -= 0.005) band += `L${X(s)} ${Y(hullAt(s))}`; band += 'Z';
      el('path', {d: band, style: 'fill:url(#hatch);opacity:.7'}, st);
      el('line', {x1: X(uLo), y1: Y(hullAt(uLo)), x2: X(uHi), y2: Y(hullAt(uHi)), style: 'stroke:var(--muted);stroke-dasharray:3 3'}, st);
      text(st, X(uHi) + 12, Y(gfun(uHi)) - 26, T('no λ ever', '任何 λ 都'), 'w-tick'); text(st, X(uHi) + 12, Y(gfun(uHi)) - 12, T('picks this stretch', '选不到这一段'), 'w-tick');
    }
    let front = ''; pts.forEach((p, i) => { front += `${i ? 'L' : 'M'}${X(p[0])} ${Y(p[1])}`; });
    el('path', {d: front, style: 'fill:none;stroke:var(--ink);stroke-width:2'}, st);
    text(st, X(0.08), Y(gfun(0.08)) - 10, T('best achievable front', '最优前沿'), 'w-lab');
    const L = 10 ** Number(lam.value), E = Number(eps.value);
    $('#p-lambda-v').value = L.toFixed(2); $('#p-eps-v').value = E.toFixed(2);
    let best = pts[0], bv = Infinity; for (const p of pts) { const v = p[1] + L * p[0]; if (v < bv) { bv = v; best = p; } }
    const dyn = el('g', {}, svg);
    const lineG = el('g', {'clip-path': 'url(#pclip)'}, dyn);
    el('line', {x1: X(0), y1: Y(best[1] + L * best[0]), x2: X(1), y2: Y(best[1] - L * (1 - best[0])), style: 'stroke:var(--blue);stroke-width:1.5;stroke-dasharray:6 4'}, lineG);
    const es = Math.min(0.97, Math.max(0.03, E));
    el('line', {x1: X(es), x2: X(es), y1: y0, y2: y1, style: 'stroke:var(--violet);stroke-width:1.2;stroke-dasharray:2 4'}, dyn);
    text(dyn, X(es) + 5, y0 + 12, T('geometric error ≤ ε', '几何误差 ≤ ε'), 'w-tick', {style: 'fill:var(--violet)'});
    el('circle', {cx: X(es), cy: Y(gfun(es)), r: 7, style: 'fill:var(--violet);stroke:var(--bg);stroke-width:2'}, dyn);
    el('circle', {cx: X(best[0]), cy: Y(best[1]), r: 7, style: 'fill:var(--blue);stroke:var(--bg);stroke-width:2'}, dyn);
    const lg = el('g', {}, dyn); el('rect', {x: x1 - 196, y: y0 + 8, width: 188, height: 46, rx: 6, style: 'fill:var(--bg);stroke:var(--line)'}, lg);
    el('circle', {cx: x1 - 182, cy: y0 + 24, r: 5, style: 'fill:var(--blue)'}, lg); text(lg, x1 - 172, y0 + 28, `${T('weighted loss, λ', '加权损失，λ')} = ${L.toFixed(2)}`, 'w-lab', {style: 'fill:var(--text)'});
    el('circle', {cx: x1 - 182, cy: y0 + 42, r: 5, style: 'fill:var(--violet)'}, lg); text(lg, x1 - 172, y0 + 46, `${T('constraint, ε', '约束，ε')} = ${E.toFixed(2)}`, 'w-lab', {style: 'fill:var(--text)'});
    const inDent = uLo !== null && es > uLo && es < uHi;
    $('#pareto-note').textContent = inDent
      ? T('The constraint lands inside the stretch that no weight picks. Drag λ across its whole range: the blue point jumps over it.', '约束落在了任何权重都选不到的那一段里。把 λ 从头拖到尾：蓝点会直接跳过这一段。')
      : T('Both can reach this part of the front. Move ε into the hatched stretch to see the difference.', '这一段两者都能到达。把 ε 移进斜线区，就能看到区别。');
  }
  lam.addEventListener('input', render); eps.addEventListener('input', render);
  renderers.push(render); render();
})();

/* ------------------------------------------------------------ Figure 7: the anchoring rule */
(function anchorFig() {
  const svg = $('#anchor-svg'), fig = $('#anchorfig'); if (!svg || !fig) return;
  const C = [300, 196], ang = -18 * deg, tv = [Math.cos(ang), Math.sin(ang)], nv = [Math.sin(ang), -Math.cos(ang)];
  const add = (p, d, s) => [p[0] + d[0] * s, p[1] + d[1] * s];
  const dirIn = $('#g-dir'); let state = 'anchored';
  function render() {
    svg.replaceChildren();
    arrowDefs(svg, 'ga');
    const st = el('g', {}, svg);
    const a = add(C, tv, -330), b = add(C, tv, 330), a2 = add(a, nv, -60), b2 = add(b, nv, -60);
    el('path', {d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${b2[0]} ${b2[1]}L${a2[0]} ${a2[1]}Z`, style: 'fill:var(--surface-2)'}, st);
    el('line', {x1: a[0], y1: a[1], x2: b[0], y2: b[1], style: 'stroke:var(--line-strong);stroke-width:2'}, st);
    const wl = add(add(C, tv, -200), nv, -26); text(st, wl[0], wl[1], T('measured surface', '实测表面'), 'w-tick', {'text-anchor': 'middle', transform: `rotate(${ang / deg} ${wl[0]} ${wl[1]})`});
    const dyn = el('g', {}, svg);
    const arrow = (p, q, color, dash, w = 2.4) => { el('line', {x1: p[0], y1: p[1], x2: q[0], y2: q[1], style: `stroke:var(--${color});stroke-width:${w};${dash ? 'stroke-dasharray:5 4;' : ''}`, 'marker-end': `url(#ga-${color})`}, dyn); };
    const psi = Number(dirIn.value) * deg; $('#g-dir-v').value = `${Math.round(psi / deg)}°`;
    const Lr = 120, dv = [Math.cos(psi) * Lr, -Math.sin(psi) * Lr];
    const dt = dv[0] * tv[0] + dv[1] * tv[1], dn = dv[0] * nv[0] + dv[1] * nv[1];
    const Pt = [tv[0] * dt, tv[1] * dt], Pn = [nv[0] * dn, nv[1] * dn];
    const G = state === 'contradicted' ? add(C, nv, 78) : C;
    const ellStyle = state === 'anchored' ? 'fill:var(--violet);fill-opacity:.35;stroke:var(--violet);stroke-width:1.5'
      : state === 'unobserved' ? 'fill:var(--muted);fill-opacity:.18;stroke:var(--muted);stroke-dasharray:4 3;stroke-width:1.5'
      : 'fill:var(--bad);fill-opacity:.1;stroke:var(--bad);stroke-dasharray:4 3;stroke-width:1.5';
    const e = el('ellipse', {cx: G[0], cy: G[1], rx: 70, ry: state === 'anchored' ? 8 : 12, transform: `rotate(${ang / deg} ${G[0]} ${G[1]})`, style: ellStyle}, dyn);
    const note = $('#anchor-note');
    if (state === 'contradicted') {
      const B = [70, 18], gb = [G[0] - B[0], G[1] - B[1]];
      const sHit = ((C[0] - B[0]) * nv[0] + (C[1] - B[1]) * nv[1]) / (gb[0] * nv[0] + gb[1] * nv[1]);
      const Hh = [B[0] + gb[0] * sHit, B[1] + gb[1] * sHit];
      el('line', {x1: B[0], y1: B[1], x2: Hh[0], y2: Hh[1], style: 'stroke:var(--orange);stroke-width:2'}, dyn);
      el('circle', {cx: Hh[0], cy: Hh[1], r: 5, style: 'fill:var(--orange);stroke:var(--bg);stroke-width:2'}, dyn);
      text(dyn, Hh[0] + 10, Hh[1] + 22, T('return ρ', '回波 ρ'), 'w-tick', {style: 'fill:var(--orange)'});
      text(dyn, 590, 22, T('a laser beam flew through this Gaussian', '一条激光束穿过了这个高斯'), 'w-tick', {'text-anchor': 'end', style: 'fill:var(--orange)'});
      text(dyn, 590, 37, T('and returned from the surface behind it', '并从它后面的表面返回'), 'w-tick', {'text-anchor': 'end', style: 'fill:var(--orange)'});
      el('path', {d: `M${G[0] - 7} ${G[1] - 7}l14 14M${G[0] + 7} ${G[1] - 7}l-14 14`, style: 'stroke:var(--bad);stroke-width:2.4;stroke-linecap:round'}, dyn);
      arrow(G, [G[0] + dv[0], G[1] + dv[1]], 'muted', true, 1.6);
      text(dyn, 586, 292, T('fades → removed below a threshold', '逐渐变淡 → 低于阈值即删除'), 'w-lab-strong', {'text-anchor': 'end', style: 'fill:var(--bad)'});
      text(dyn, 586, 308, T('never copied', '绝不复制'), 'w-lab-strong', {'text-anchor': 'end', style: 'fill:var(--bad)'});
      let o = 1; const fade = () => { o -= 0.03; if (o < 0.25 || !e.isConnected) return; e.style.opacity = o; requestAnimationFrame(fade); };
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(fade); else e.style.opacity = 0.35;
      note.textContent = T('Blocking: the beam proved this space empty. The Gaussian fades and is removed; the image-driven move no longer matters.', '挡路：光束证明这里是空的。这个高斯逐渐变淡并被删除，图像驱动的位移已无关紧要。');
      return;
    }
    if (state === 'anchored') {
      arrow(G, [G[0] + dv[0], G[1] + dv[1]], 'blue', true, 1.4);
      arrow([G[0] + Pt[0], G[1] + Pt[1]], [G[0] + Pt[0] + Pn[0], G[1] + Pt[1] + Pn[1]], 'muted', true, 1.6);
      const xm = [G[0] + Pt[0] + Pn[0] * 0.55, G[1] + Pt[1] + Pn[1] * 0.55];
      el('path', {d: `M${xm[0] - 6} ${xm[1] - 6}l12 12M${xm[0] + 6} ${xm[1] - 6}l-12 12`, style: 'stroke:var(--bad);stroke-width:2.2;stroke-linecap:round'}, dyn);
      if (Math.hypot(...Pt) > 6) arrow(G, [G[0] + Pt[0], G[1] + Pt[1]], 'blue', false, 3);
      const lb = add(G, tv, -95); arrow(lb, add(lb, nv, 44), 'orange', false, 2.2);
      const ll = add(lb, nv, 58); text(dyn, ll[0], ll[1], T('laser update: always kept', '激光更新：始终保留'), 'w-tick', {'text-anchor': 'middle', style: 'fill:var(--orange)'});
      const tl = add(add(G, tv, 150), nv, -40); text(dyn, tl[0], tl[1], T('(I − nnᵀ) Δμ: kept', '(I − nnᵀ) Δμ：保留'), 'w-lab-strong', {'text-anchor': 'middle', style: 'fill:var(--blue)', transform: `rotate(${ang / deg} ${tl[0]} ${tl[1]})`});
      const kt = Math.abs(dt) / Lr, kn = Math.abs(dn) / Lr;
      note.innerHTML = T(`Anchored: the part along the surface (${kt.toFixed(2)} × |Δμ|) is kept; the part through it (${kn.toFixed(2)} × |Δμ|) is dropped. Thickness stays at most σ<sub>ρ</sub>.`, `锚定：沿表面的分量（${kt.toFixed(2)} × |Δμ|）保留，穿过表面的分量（${kn.toFixed(2)} × |Δμ|）去掉。厚度不超过 σ<sub>ρ</sub>。`);
    } else {
      arrow(G, [G[0] + dv[0], G[1] + dv[1]], 'blue', false, 3);
      text(dyn, G[0] + dv[0] / 2 + 12, G[1] + dv[1] / 2 - 8, T('Δμ: kept in full', 'Δμ：全部保留'), 'w-lab-strong', {style: 'fill:var(--blue)'});
      note.textContent = T('Unseen: the laser has nothing to say here, so the image-driven move is kept unchanged and densification follows standard 3DGS.', '未测到：激光在这里没有发言权，所以图像驱动的位移原样保留，致密化按标准 3DGS 进行。');
    }
  }
  segmented($('.seg', fig), 'state', (s) => { state = s; render(); });
  dirIn.addEventListener('input', render);
  renderers.push(render); render();
})();

/* ------------------------------------------------------------ Figure 8: kernel change map */
(function kernels() {
  const fig = $('#kernel-fig'); if (!fig) return;
  segmented($('.seg', fig), 'k', (k) => { $('#kernel-map').dataset.k = k; });
})();

/* ------------------------------------------------------------ Figure 10: validation steps */
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
