// Homepage hero and page stages: "Living landscape". Five procedurally drawn scenes on one canvas (Canvas 2D, seeded RNG,
// no dependencies, all artwork generated here). Content comes from the inline JSON in the page.
import { drawTree, TREE_H, patch, sapling } from '../art/trees.ts';
import { type R, type N2, clamp, ss, rng, noise, fbm, field, contourLines, spotHeights } from '../art/contours.ts';
interface Poly { p: number[]; c: string; w: number; a: number; s: number; d: number; z?: number[] }
interface Crown { x: number; y: number; r: number; ty: number; sd: number; f: string; k: string; ka: number; kw: number; s: number; d: number }
interface Tuft { x: number; y: number; b: number[][]; c: string; w: number; a: number; s: number; d: number; lx: number; lv: number }
interface Tr { x: number; y: number; h: number; ty: number; l: number; sd: number; c: string; a: number; w: number; s: number; d: number; lx: number; lv: number }
interface Sq { x: number; y: number; z: number; r: number; s: number; d: number }
interface Scene { u: Poly[]; t: Tuft[]; r: Tr[]; c: Crown[]; v: Crown[]; s: Tr[]; q: Sq[]; o: Poly[]; cm: number; cg: boolean }
interface Rip { x: number; y: number; t: number; m: number; R: number; f: number }
interface Leaf { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; z: number }
interface TP { x: number; y: number; t: number }

const BG = '#123B2C', MOSS = '#3F6E55', SAGE = '#6F9478', LAT = '#D98A62', SOFT = '#C9D3CC';
const RB = [18, 59, 44], RM = [63, 110, 85], RS = [111, 148, 120];
const TAU = Math.PI * 2;
const mixc = (a: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v * t + RB[i] * (1 - t)))})`;
const sc = (o: Partial<Scene>): Scene => ({ u: [], t: [], r: [], c: [], v: [], s: [], q: [], o: [], cm: 1, cg: false, ...o });
const pr = (i: { s: number; d: number }, t: number) => ss((t - i.s) / i.d);
const faint = (a: Poly[], k: number): Poly[] => a.filter((p) => p.p.length > 4).map((p) => ({ ...p, a: p.a * k, s: -1e9, d: 1 }));

// ---- geometry -------------------------------------------------------------------------------------------
// Topographic contours: marching squares over the shared noise height field (src/art/contours.ts).
function contours(w: number, h: number, R: R, seed: number): Poly[] {
  const f = field(w, h, { seed }), out: Poly[] = [];
  for (const { p, li } of contourLines(f)) {
    const idx = li % 4 == 2;
    out.push({ p, c: idx ? SAGE : MOSS, w: idx ? 1.5 + R() * 0.3 : 0.8 + R() * 0.35, a: idx ? 0.8 : 0.9, s: li * 55 + R() * 260, d: 800 + Math.min(1, p.length / 3600) * 800 });
  }
  // spot heights: small survey crosses on the highest ground
  spotHeights(f, w, h, R).forEach((q, n) => {
    const s = 1700 + n * 90;
    out.push({ p: [q[1] - 5, q[2], q[1] + 5, q[2]], c: SAGE, w: 1.2, a: 0.85, s, d: 400 }, { p: [q[1], q[2] - 5, q[1], q[2] + 5], c: SAGE, w: 1.2, a: 0.85, s, d: 400 });
  });
  return out;
}

const fan = (R: R, n: number, spread: number, len: number, bend: number, u: number) =>
  Array.from({ length: n }, () => [(R() - 0.5) * spread, len * (0.55 + R() * 0.7) * u, (R() - 0.5) * bend]);

// species mixes (indices into TREES): Recovery leans on hardy dry and semi-evergreen species; Planting is many species at seedling scale
const REC = [3, 3, 2, 2, 7, 7, 5, 5, 0, 0, 1, 1, 6, 4, 10, 11];
const pick = (R: R, a: number[]) => a[(R() * a.length) | 0];
const mkTree = (R: R, ty: number, x: number, y: number, hs: number, c: string, w: number, a: number, s: number, d: number): Tr =>
  ({ x, y, h: TREE_H[ty] * (0.75 + 0.5 * R()) * hs, ty, l: (R() - 0.5) * 0.14, sd: (R() * 1e9) | 0, c, a, w, s, d, lx: 0, lv: 0 });
const depth = (y: number, h: number, w: number) => clamp(Math.min(w, h) / 500, 0.9, 1.75) * (0.62 + 0.7 * clamp(y / h, 0, 1));

function recovery(w: number, h: number, u: number, ct: Poly[], R: R): Scene {
  const q: N2 = (x, y) => fbm(x / (240 * u) + 40, y / (240 * u) + 17);
  const t: Tuft[] = [], r: Tr[] = [];
  const tuft = (x: number, y: number, s: number) => t.push({ x, y, b: fan(R, 3 + ((R() * 2) | 0), 1.8, 3.5 + R() * 3.5, 0.3, u), c: SAGE, w: 0.9, a: 0.7, s, d: 700, lx: 0, lv: 0 });
  const cl: number[][] = [], sc_ = depth(h, h, w) / 1.32, wide = w > 700;
  for (let k = 0; k < 1200 && cl.length < (wide ? 13 : 8); k++) {
    const x = R() * w, y = h * (0.1 + R() * 0.85);
    if (q(x, y) < 0.34 || (wide ? (x < w * 0.52 && y > h * 0.55) || (x > w * 0.6 && y > h * 0.78) : y > h * 0.5) || cl.some((o) => Math.hypot(o[0] - x, (o[1] - y) * 1.5) < 150 * sc_)) continue;
    cl.push([x, y, 150 + R() * 750, pick(R, REC)]);
  }
  for (const [cx, cy, s0, dom] of cl) {
    const sx = (44 + R() * 40) * sc_;
    for (let k = 6 + ((R() * 6) | 0); k--;) {
      const x = cx + (R() - 0.5) * 2 * sx, y = cy + (R() - 0.5) * sx * 0.8, ty = R() < 0.45 ? dom : pick(R, REC), fr = clamp(y / h, 0, 1);
      r.push(mkTree(R, ty, x, y, depth(y, h, w), R() < 0.3 + 0.3 * (1 - fr) ? MOSS : SAGE, 1 + 0.25 * fr, 0.9, s0 + R() * 400, 1400));
      if (R() < 0.55) tuft(x + (R() - 0.5) * 9 * u, y + 1, s0 + 500 + R() * 400);
    }
  }
  for (let k = 0; k < (w > 700 ? 14 : 7); k++) tuft(R() * w, h * (0.15 + R() * 0.8), 300 + R() * 1500);
  r.sort((a, b) => a.y - b.y);
  return sc({ u: faint(ct, 0.4), t, r });
}

function planting(w: number, h: number, ct: Poly[], R: R, pg: boolean): Scene {
  const wide = w > 700, ps = wide ? 1 : 0.8;
  const hw = wide ? Math.min(w * 0.12, 170) : w * 0.36, hh = wide ? Math.min(h * 0.2, 125) : pg ? 46 : Math.min(h * 0.17, 100);
  const { p, b } = patch(w * (wide ? 0.64 : 0.52), (wide ? h * 0.4 : pg ? 112 : h * 0.33) + 12 * ps, hw, hh, ps, R, noise);
  const s = p.sort((a, c) => a.y - c.y).map((q, i): Tr => ({ ...q, c: LAT, a: 0.95, w: 1.05, s: 200 + (i / p.length) * 1500 + R() * 90, d: 700, lx: 0, lv: 0 }));
  return sc({ u: faint(ct, 0.4), s, o: [{ p: b, c: LAT, w: 1.2, a: 0.8, s: 1700, d: 1000, z: [4, 6] }] });
}

function canopyCrowns(w: number, h: number, u: number, R: R): Crown[] {
  const rmin = 13 * u, rmax = 50 * u, cell = rmax * 2, g = new Map<string, Crown[]>();
  const out: Crown[] = [];
  const ox_ = w * 0.62, oy_ = h * 0.4, md = Math.hypot(Math.max(ox_, w - ox_), Math.max(oy_, h - oy_));
  for (let n = 0; n < 9000; n++) {
    const x = -rmax * 0.3 + R() * (w + rmax * 0.6), y = -rmax * 0.3 + R() * (h + rmax * 0.6);
    const r = (rmin + (rmax - rmin) * Math.pow(R(), 1.6)) * (0.75 + 0.5 * noise(x / 300, y / 300));
    if (noise(x / 240 + 11, y / 240 + 5) < 0.4) continue;
    const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
    let ok = true;
    for (let a = -1; a <= 1 && ok; a++) for (let b = -1; b <= 1 && ok; b++) for (const o of g.get(gx + a + ',' + (gy + b)) || []) if (Math.hypot(o.x - x, o.y - y) < (r + o.r) * 0.78) { ok = false; break; }
    if (!ok) continue;
    const sg = (noise(x / 260 + 3, y / 260 + 7) > 0.52) !== (R() < 0.15), ty = R() < 0.3 ? (R() * 12) | 0 : Math.min(11, (noise(x / 150 + 2, y / 150 + 8) * 14) | 0);
    const cr: Crown = { x, y, r, ty, sd: (R() * 1e9) | 0, f: mixc(sg ? RS : RM, 0.08 + R() * 0.06), k: sg ? SAGE : MOSS, ka: sg ? 0.75 : 0.9, kw: r > 30 * u ? 1.2 : 0.9, s: (Math.hypot(x - ox_, y - oy_) / md) * 1700 + R() * 200, d: 700 };
    out.push(cr);
    const key = gx + ',' + gy;
    (g.get(key) || g.set(key, []).get(key)!).push(cr);
  }
  return out.sort((a, b) => a.y - b.y);
}

function village(w: number, h: number, u: number, ct: Poly[], cr: Crown[], R: R): Scene {
  const ph = R() * 6, f = w > 700 ? 13 : 8, A = h * 0.07;
  const py = (t: number) => h * ((w > 700 ? 0.5 : 0.42) - 0.25 * ss(t)) + A * Math.sin(t * f + ph) * (0.6 + 0.4 * Math.sin(t * 3.1)) + (noise(t * 5, 7) - 0.5) * h * 0.08;
  const px = (t: number) => -30 + (w + 60) * t;
  const p: number[] = [];
  const n = Math.ceil((w + 60) / 6);
  for (let k = 0; k <= n; k++) p.push(px(k / n), py(k / n));
  const t0 = 0.52, bx = px(t0), by = py(t0), ex = w * 0.84, ey = h * (w > 700 ? 0.68 : 0.6);
  const br: number[] = [];
  for (let k = 0; k <= 40; k++) { const t = k / 40, m = 1 - t; br.push(m * m * bx + 2 * m * t * (bx + (ex - bx) * 0.05) + t * t * ex, m * m * by + 2 * m * t * (by + (ey - by) * 0.8) + t * t * ey); }
  const v: Crown[] = [], q: Sq[] = [], o: Poly[] = [
    { p, c: BG, w: 9, a: 0.85, s: 500, d: 2000 }, { p: br, c: BG, w: 6, a: 0.85, s: 1900, d: 700 },
    { p, c: LAT, w: 2.8, a: 0.95, s: 500, d: 2000 }, { p: br, c: LAT, w: 1.5, a: 0.85, s: 1900, d: 700 },
  ];
  const ts = w > 700 ? [0.17, 0.38, 0.6, 0.8, 0.95, -1] : [0.25, 0.55, 0.85, -1];
  ts.forEach((t, n_) => {
    const r = (40 + R() * 28) * u, s = t < 0 ? 2300 : 500 + t * 1700 - 200;
    const cx = (t < 0 ? ex : px(t)) + (R() - 0.5) * r * 0.5, cy = (t < 0 ? ey : py(t)) + (R() - 0.5) * r * 0.8;
    v.push({ x: cx, y: cy, r, ty: 0, sd: 0, f: BG, k: BG, ka: 0, kw: 0, s, d: 500 });
    for (let k = 0; k < 2; k++) { const a = R() * TAU; v.push({ x: cx + Math.cos(a) * r * 0.5, y: cy + Math.sin(a) * r * 0.5, r: r * 0.62, ty: 0, sd: 0, f: BG, k: BG, ka: 0, kw: 0, s, d: 500 }); }
    const lp: number[] = [];
    for (let k = 0; k <= 48; k++) { const a = (k / 48) * TAU, rr = r * 1.12 * (1 + 0.18 * (2 * noise(Math.cos(a) * 1.5 + n_ * 7, Math.sin(a) * 1.5) - 1)); lp.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    o.push({ p: lp, c: LAT, w: 1, a: 0.45, s, d: 600, z: [2, 4] });
    const hs: number[][] = [];
    for (let k = 0, m = 7 + ((R() * 6) | 0); k < 120 && hs.length < m; k++) {
      const a = R() * TAU, rr = r * 0.66 * Math.sqrt(R()), x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      if (hs.every((o2) => Math.hypot(o2[0] - x, o2[1] - y) > 10 * u)) hs.push([x, y]);
    }
    hs.forEach((hp) => q.push({ x: hp[0], y: hp[1], z: (4.2 + R() * 3) * u, r: (R() - 0.5) * 0.9, s: s + 700 + n_ * 120 + R() * 400, d: 400 }));
  });
  const r: Tr[] = [], VM = [8, 10, 4, 5, 0, 1, 6, 7];
  v.forEach((cl, n_) => {
    if (cl.f != BG || n_ % 3) return;
    for (let k = 0; k < 4; k++) {
      const a = (k / 4 + R() * 0.2) * TAU + 0.6, x = cl.x + Math.cos(a) * cl.r * 1.15, y = cl.y + Math.sin(a) * cl.r * 0.8;
      r.push(mkTree(R, VM[(R() * 8) | 0], x, y, depth(y, h, w) * 1.1, SAGE, 1.1, 0.9, cl.s + 300 + k * 90, 1200));
    }
  });
  for (let k = 1; k < (w > 700 ? 9 : 5); k++) {
    const t = k / (w > 700 ? 9 : 5) + (R() - 0.5) * 0.05, x = px(t) + (R() - 0.5) * 20, y = py(t) + (R() < 0.5 ? -1 : 1) * (22 + R() * 14) * u;
    r.push(mkTree(R, VM[(R() * 8) | 0], x, y, depth(y, h, w) * 0.95, SAGE, 1.1, 0.9, 500 + t * 1700, 1200));
  }
  r.sort((a, b) => a.y - b.y);
  return sc({ u: faint(ct, 0.4), c: cr, cm: 0.5, cg: true, v, q, o, r });
}

// ---- runtime --------------------------------------------------------------------------------------------
interface Info { name: string; caption: string; cls: string; text: string }
interface PageCfg { scene: number; seed: number; faint?: number }
const root = document.querySelector<HTMLElement>('.stage');
const dataEl = document.getElementById('stage-data');
const canvas = root?.querySelector<HTMLCanvasElement>('canvas');
if (root && dataEl && canvas) {
  const cfg = JSON.parse(dataEl.textContent || '{}');
  const info: Info[] = cfg.scenes;
  const page: PageCfg | undefined = cfg.page;
  const seed = page?.seed ?? 0;
  const c = canvas.getContext('2d')!;
  const $ = <T extends HTMLElement>(s: string) => root.querySelector<T>(s) as T; // absent on bare page stages: call sites use ?.
  const dots = [...root.querySelectorAll<HTMLButtonElement>('.stage-dot')];
  const ctl = $('.stage-ctl'), pauseB = $<HTMLButtonElement>('.stage-pause'), hintEl = $('.stage-hint');
  const numEl = $('.stage-n'), nameEl = $('.stage-name'), capEl = $('.stage-cap-t'), chip = $('.stage-chip');
  const mq = (q: string) => matchMedia(q);
  const rmq = mq('(prefers-reduced-motion: reduce)');
  const store = (k: string, v?: string) => { try { if (v !== undefined) sessionStorage.setItem(k, v); return sessionStorage.getItem(k); } catch { return null; } };

  let cw = 0, ch = 0, dpr = 1, u = 1;
  let G: { ct?: Poly[]; cr?: Crown[] } = {};
  let scenes: Scene[] = [];
  let D = { rip: [] as Rip[], sp: [] as Tr[], sa: [] as Tr[], lv: [] as Leaf[], tr: [] as TP[], gl: [] as TP[] };
  const ri = rng(77);
  let cur = page ? page.scene : 0, prev = -1, t = -300, tr = 1e9, ck = 0, last = 0, raf = 0, inView = false, paused = store('va-paused') === '1';
  let ox = 0, oy = 0, mode = 0, ba = 0, bt = 0, str = 1, px = -1e4, py = -1e4, vx = 0, pa = false, fx = 0, fy = 0;
  let amb = false, ambAcc = 0, lastI = -1e9, growUntil = 0, wind = false, lastMove = 0;
  const reduced = () => rmq.matches;

  const build = (i: number): Scene => {
    if (scenes[i]) return scenes[i];
    const R = rng(20261011 + i * 1013);
    G.ct ||= contours(cw, ch, rng(20261011 + seed), seed);
    G.cr ||= canopyCrowns(cw, ch, clamp(cw / 1100, 0.7, 1), rng(20261011 + 3 * 1013));
    return (scenes[i] = [
      () => sc({ u: G.ct }), () => recovery(cw, ch, u, G.ct!, R), () => planting(cw, ch, G.ct!, R, !!page),
      () => sc({ u: faint(G.ct!, 0.4), c: G.cr }), () => village(cw, ch, u, G.ct!, G.cr!, R),
    ][i]());
  };

  // displacement: contour bulge and ripples (scene 1); everything else is drawn where it is generated
  const dp = (x: number, y: number) => {
    ox = x; oy = y;
    if (mode) return;
    if (ba > 0.01) {
      const dx = x - px, dy = y - py, d = Math.hypot(dx, dy);
      if (d < 150 && d > 0.1) { const f = (7 * ba * (1 - d / 150) ** 2) / d; ox += dx * f; oy += dy * f; }
    }
    for (const r of D.rip) {
      const dx = x - r.x, dy = y - r.y, d = Math.hypot(dx, dy), wv = Math.abs(d - r.R);
      if (wv < 50 && d > 1) { const f = (18 * r.f * r.m * (1 - wv / 50) ** 2) / d; ox += dx * f; oy += dy * f; }
    }
  };

  const dPoly = (p: Poly, tt: number, A: number) => {
    const g = pr(p, tt); if (g <= 0) return;
    const n = p.p.length / 2 - 1, e = n * g, k = e | 0, q = p.p;
    c.globalAlpha = A * p.a; c.strokeStyle = p.c; c.lineWidth = p.w; c.setLineDash(p.z || []);
    c.beginPath(); dp(q[0], q[1]); c.moveTo(ox, oy);
    for (let i = 1; i <= k; i++) { dp(q[2 * i], q[2 * i + 1]); c.lineTo(ox, oy); }
    if (k < n) { const f = e - k; dp(q[2 * k] + (q[2 * k + 2] - q[2 * k]) * f, q[2 * k + 1] + (q[2 * k + 3] - q[2 * k + 1]) * f); c.lineTo(ox, oy); }
    c.stroke();
  };
  const dTuft = (k: Tuft, tt: number, A: number) => {
    const g = pr(k, tt); if (g <= 0) return;
    c.globalAlpha = A * k.a; c.strokeStyle = k.c; c.lineWidth = k.w; c.beginPath();
    for (const [a, l, bd] of k.b) {
      const L = l * g, sa = Math.sin(a), ca = Math.cos(a), lean = (k.lx + (amb && mode == 1 ? Math.sin(ck / 900 + k.x * 0.02 + k.y * 0.013) * 1.6 : 0)) * (L / 20);
      const tx = k.x + sa * L + lean, ty = k.y - ca * L, mx = k.x + (sa * L) / 2 + ca * bd * L + lean * 0.4, my = k.y - (ca * L) / 2 + sa * bd * L;
      c.moveTo(k.x, k.y);
      c.quadraticCurveTo(mx, my, tx, ty);
    }
    c.stroke();
  };
  // top-down crown: a tinted disc plus the species' own outline from the shared tree library
  const dCrown = (k: Crown, tt: number, A: number) => {
    const g = pr(k, tt); if (g <= 0) return;
    const f = mode == 3 ? Math.max(0, 1 - Math.hypot(k.x - px, k.y - py) / 130) * ba : 0;
    const r = k.r * g, x = k.x + f * 3 * Math.sin(ck / 140 + k.x) + (amb ? Math.sin(ck / 2200 + k.x * 0.01) * 0.8 : 0);
    c.globalAlpha = A; c.fillStyle = k.f; c.beginPath(); c.arc(x, k.y, r * (k.ka ? 0.9 : 1), 0, TAU); c.fill();
    if (!k.ka) return;
    c.globalAlpha = A * k.ka; c.strokeStyle = k.k; c.lineWidth = k.kw; c.beginPath();
    drawTree(c, k.ty, x, k.y, r * 0.85, 0, k.sd, 1, 0, 1); c.stroke();
  };
  const sway = (x: number, y: number, m: number) => (amb ? Math.sin(ck / 900 + x * 0.02 + y * 0.013) * m : 0);
  const dTree = (k: Tr, tt: number, A: number) => {
    const g = pr(k, tt); if (g <= 0) return;
    c.globalAlpha = A * k.a; c.strokeStyle = c.fillStyle = k.c; c.lineWidth = k.w; c.beginPath();
    drawTree(c, k.ty, k.x, k.y, k.h, k.l, k.sd, g, clamp(k.lx + sway(k.x, k.y, 1.6), -16, 16) * (k.h / 22));
    c.stroke(); c.globalAlpha = A * k.a * 0.12; c.fill();
  };
  const dSq = (q: Sq, tt: number, A: number) => {
    const g = pr(q, tt); if (g <= 0) return;
    const z = q.z * g, co = Math.cos(q.r) * z, si = Math.sin(q.r) * z;
    c.globalAlpha = A * 0.9; c.fillStyle = LAT; c.beginPath();
    c.moveTo(q.x - co + si, q.y - si - co); c.lineTo(q.x + co + si, q.y + si - co); c.lineTo(q.x + co - si, q.y + si + co); c.lineTo(q.x - co - si, q.y - si + co); c.fill();
  };

  function drawScene(i: number, tt: number, A: number) {
    const S = build(i); mode = i;
    S.u.forEach((p) => dPoly(p, tt, A));
    if (i == 0) for (const r of D.rip) { c.globalAlpha = A * 0.6 * r.f; c.strokeStyle = SAGE; c.lineWidth = 2 * r.m; c.setLineDash([]); c.beginPath(); c.arc(r.x, r.y, r.R, 0, TAU); c.stroke(); }
    S.t.forEach((k) => dTuft(k, tt, A));
    S.c.forEach((k) => dCrown(k, S.cg ? 1e9 : tt, A * S.cm));
    S.v.forEach((k) => dCrown(k, tt, A));
    S.r.forEach((k) => dTree(k, tt, A));
    if (i == 1) D.sp.forEach((k) => dTree(k, ck, A));
    S.s.forEach((k) => dTree(k, tt, A));
    if (i == 2) D.sa.forEach((k) => dTree(k, ck, A));
    S.q.forEach((q) => dSq(q, tt, A));
    S.o.forEach((p) => dPoly(p, tt, A));
    if (i == 3) {
      c.fillStyle = SOFT;
      for (const l of D.lv) {
        const age = ck - l.s, z = l.z;
        c.globalAlpha = A * 0.85 * (1 - ss(age / 2500));
        c.save(); c.translate(l.x + (l.vx * age) / 1000 + Math.sin(age / 380 + l.r) * 9, l.y + (l.vy * age) / 1000); c.rotate(l.r + (l.vr * age) / 1000);
        c.beginPath(); c.moveTo(0, -z); c.quadraticCurveTo(z * 0.8, -z * 0.1, 0, z); c.quadraticCurveTo(-z * 0.8, -z * 0.1, 0, -z); c.fill(); c.restore();
      }
    }
    if (i == 4) {
      c.strokeStyle = LAT; c.setLineDash([]); c.lineWidth = 1;
      for (let k = 1; k < D.tr.length; k++) {
        const a = D.tr[k], b = D.tr[k - 1], f = 1 - (ck - a.t) / 2000;
        if (f <= 0) continue;
        c.globalAlpha = A * f; c.lineWidth = 1.5 + 2.5 * f; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(a.x, a.y); c.stroke();
      }
      for (const g of D.gl) {
        const p = (ck - g.t) / 1400, r = 6 + 26 * ss(p);
        c.globalAlpha = A * (1 - p) * 0.5; c.lineWidth = 1.4; c.beginPath(); c.arc(g.x, g.y, r, 0, TAU); c.stroke();
        c.beginPath(); c.arc(g.x, g.y, r * 0.55, 0, TAU); c.stroke();
        c.globalAlpha = A * (1 - p) * 0.14; c.fillStyle = LAT; c.beginPath(); c.arc(g.x, g.y, r, 0, TAU); c.fill();
      }
    }
  }

  function render() {
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.globalAlpha = 1; c.fillStyle = BG; c.fillRect(0, 0, cw, ch);
    c.lineCap = c.lineJoin = 'round';
    if (prev >= 0 && tr < 700) drawScene(prev, 1e9, 1 - ss(tr / 700));
    if (t >= 0) drawScene(cur, t, page?.faint ?? 1);
    c.globalAlpha = 1; c.setLineDash([]);
    root!.classList.add('is-live');
  }

  const fxAlive = () => ck < growUntil || wind || D.rip.length > 0 || D.lv.length > 0 || D.gl.length > 0 || D.tr.length > 0 || Math.abs(bt * str - ba) > 0.01;
  const moving = () => !reduced() && !paused && inView && !document.hidden && (!page || cur > 0 || t < 2800);
  const canRun = () => inView && !document.hidden;

  function setText() {
    const s = info[page ? 0 : cur];
    if (numEl) numEl.textContent = String(cur + 1).padStart(2, '0');
    if (nameEl) nameEl.textContent = s.name;
    if (capEl) capEl.textContent = s.caption;
    if (chip) { chip.className = 'stage-chip label label--' + s.cls; chip.textContent = s.text; }
    dots.forEach((d, i) => d.setAttribute('aria-pressed', String(i === cur)));
    hint();
  }
  function go(i: number, instant: boolean) {
    if (page) return;
    prev = cur; cur = (i + info.length) % info.length;
    if (instant) { t = tr = 1e9; prev = -1; } else { t = tr = 0; }
    setText(); render(); kick();
  }

  function tick(ts: number) {
    raf = 0;
    const dt = Math.min(ts - last, 100), s = dt / 1000; last = ts; ck += dt;
    const a0 = fxAlive(), anim = t < 2800 || tr < 760;
    if (moving()) {
      t += dt; tr += dt;
      if (!page && t >= 6400 && ck - lastI >= 4000) { go(cur + 1, false); return; }
    }
    ba += (bt * str - ba) * Math.min(1, dt / 130);
    vx *= Math.exp(-dt / 160);
    // wind (Recovery): tufts lean along the pointer's movement and spring back
    wind = false;
    const wk = (k: { x: number; y: number; lx: number; lv: number }) => {
      let f = 0;
      if (pa && cur == 1 && !reduced()) { const d = Math.hypot(k.x - px, k.y - py); if (d < 140) f = (1 - d / 140) ** 2 * 0.9 * str; }
      if (f || k.lx || k.lv) {
        k.lv += (vx * f - 60 * k.lx - 7 * k.lv) * s; k.lx = clamp(k.lx + k.lv * s, -16, 16);
        if (!f && Math.abs(k.lx) < 0.02 && Math.abs(k.lv) < 0.05) k.lx = k.lv = 0; else wind = true;
      }
    };
    if (scenes[1]) { scenes[1].t.forEach(wk); scenes[1].r.forEach(wk); D.sp.forEach(wk); }
    // Village trail: a smoothed follower leaves a meandering path that fades
    if (cur == 4 && pa && !reduced()) {
      const dx = px - fx, dy = py - fy, L = Math.hypot(dx, dy);
      fx += dx * (1 - Math.exp(-dt / 140)); fy += dy * (1 - Math.exp(-dt / 140));
      const o = L > 1 ? (Math.sin(ck / 200) * 6 * Math.min(1, L / 40)) / L : 0, lp = D.tr[D.tr.length - 1];
      if (!lp || Math.hypot(fx - lp.x, fy - lp.y) > 5) D.tr.push({ x: fx - dy * o, y: fy + dx * o, t: ck });
    }
    while (D.tr.length && ck - D.tr[0].t > 2000) D.tr.shift();
    D.rip = D.rip.filter((r) => { const p = (ck - r.t) / 3000; r.R = Math.hypot(cw, ch) * 0.4 * (1 - (1 - Math.min(p, 1)) ** 2); r.f = (1 - Math.min(p, 1)) ** 1.5; return p < 1; });
    D.lv = D.lv.filter((l) => ck - l.s < 2500);
    D.gl = D.gl.filter((g) => ck - g.t < 1400);
    amb = moving() && cur >= 1;
    ambAcc += dt;
    if (a0 || fxAlive() || anim || (amb && (cur < 3 || ambAcc >= 33))) { render(); ambAcc = 0; }
    if (moving() || fxAlive()) raf = requestAnimationFrame(tick);
  }
  function kick() {
    if (raf || !canRun() || !(moving() || fxAlive())) return;
    last = performance.now(); raf = requestAnimationFrame(tick);
  }
  const touchAct = () => { lastI = ck; hideHint(); };

  // ---- interaction ----
  const instant = () => reduced();
  const cap = <T,>(a: T[], n: number) => { while (a.length > n) a.shift(); };
  function plant(x: number, y: number) {
    D.sa.push({ ...sapling(ri, x, y, cw > 700 ? 1 : 0.8), c: LAT, a: 0.95, w: 1.05, s: instant() ? -1e9 : ck, d: 900, lx: 0, lv: 0 }); cap(D.sa, 120); if (!instant()) growUntil = Math.max(growUntil, ck + 900);
  }
  function tap(x: number, y0: number, m: number) {
    const y = y0;
    const i = cur, ins = instant();
    if (i == 0 && !ins) { D.rip.push({ x, y: y0, t: ck, m, R: 0, f: 1 }); cap(D.rip, 4); }
    else if (i == 1) {
      for (let k = 5 + ((ri() * 5) | 0); k--;) {
        const a = ri() * TAU, rr = ri() * 34, y = y0 + Math.sin(a) * rr * 0.6;
        D.sp.push(mkTree(ri, pick(ri, REC), x + Math.cos(a) * rr, y, depth(y, ch, cw) * 0.85, '#9FD3B8', 1.2, 1, ins ? -1e9 : ck + k * 90, 1500));
      }
      cap(D.sp, 60); if (!ins) growUntil = Math.max(growUntil, ck + 2500);
    } else if (i == 2) plant(x, y);
    else if (i == 3 && !ins) {
      for (let k = 8 + ((ri() * 7) | 0); k--;) D.lv.push({ x: x + (ri() - 0.5) * 24, y: y + (ri() - 0.5) * 24, vx: (ri() - 0.5) * 36, vy: 14 + ri() * 30, r: ri() * TAU, vr: (ri() - 0.5) * 4, s: ck, z: 5 + ri() * 5 });
    } else if (i == 4 && !ins) D.gl.push({ x, y, t: ck });
    if (ins) render(); else kick();
  }

  let down = false, ign = false, touch = false, sx = 0, sy = 0, st0 = 0, acc = 0, lx = 0, ly = 0, dragged = false, gp = 0;
  const pos = (e: PointerEvent) => { const r = root.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; };
  const blocked = (e: Event) => !!(e.target as Element).closest('a,button,.stage-bar');
  const fine = mq('(pointer: fine)');
  root.addEventListener('pointerdown', (e) => {
    if ((ign = blocked(e))) return;
    pos(e); touch = e.pointerType != 'mouse'; str = touch ? 2 : 1; down = true; dragged = false; gp = 0;
    sx = lx = px; sy = ly = py; st0 = e.timeStamp; acc = 0; pa = true; fx = px; fy = py; vx = 0;
    if (touch && !reduced()) bt = 1;
    touchAct(); kick();
  });
  root.addEventListener('pointermove', (e) => {
    if (ign && down) return;
    if (blocked(e)) { if (!touch) { bt = 0; pa = false; } return; }
    if (e.pointerType == 'mouse' && !fine.matches) return;
    const ox0 = px; pos(e); touch = e.pointerType != 'mouse'; str = touch ? 2 : 1;
    const dtm = Math.max(1, e.timeStamp - lastMove); lastMove = e.timeStamp;
    vx = vx * 0.6 + ((px - ox0) / dtm) * 1000 * 0.4;
    if (!touch || down) { pa = true; if (!reduced()) bt = 1; }
    if (down) {
      acc += Math.hypot(px - lx, py - ly); lx = px; ly = py;
      if (Math.hypot(px - sx, py - sy) > 10) dragged = true;
      if (cur == 2 && dragged && acc >= 20) { plant(px, py); gp++; acc = 0; if (instant()) render(); }
    }
    if (!instant()) { touchAct(); kick(); } else lastI = ck;
  });
  const up = (e: PointerEvent, cancel: boolean) => {
    if (ign) { ign = false; down = false; return; }
    if (!down) return;
    down = false;
    const dx = px - sx, dy = py - sy, dur = e.timeStamp - st0;
    if (touch) { bt = 0; pa = false; }
    if (!cancel) {
      if (!page && touch && dur < 900 && Math.abs(dx) >= Math.max(48, cw * 0.12) && Math.abs(dx) > 1.15 * Math.abs(dy)) {
        if (gp) D.sa.splice(-gp, gp);
        go(cur + (dx < 0 ? 1 : -1), instant() || paused); lastI = ck; return;
      }
      if (!dragged && dur < 600) tap(px, py, touch ? 2 : 1);
    }
    kick();
  };
  root.addEventListener('pointerup', (e) => up(e, false));
  root.addEventListener('pointercancel', (e) => up(e, true));
  root.addEventListener('pointerleave', (e) => { if (e.pointerType == 'mouse') { bt = 0; pa = false; kick(); } });

  // ---- hint ----
  let hintDone = false, hintT = 0;
  function hint() {
    if (hintDone || !inView || !hintEl) return;
    const r = reduced();
    if (r && cur != 2) return;
    if (store('va-hint')) { hintDone = true; return; }
    store('va-hint', '1'); hintDone = true;
    const coarse = mq('(pointer: coarse)').matches;
    hintEl.textContent = r ? 'Tap to plant' : coarse ? 'Tap to interact · swipe to change scene' : 'Move or tap to interact · swipe to change scene';
    hintEl.hidden = false; hintEl.classList.remove('is-gone'); hintT = window.setTimeout(hideHint, 6000);
  }
  function hideHint() {
    if (!hintEl || hintEl.hidden || hintEl.classList.contains('is-gone')) return;
    clearTimeout(hintT); hintEl.classList.add('is-gone'); setTimeout(() => (hintEl.hidden = true), 500);
  }

  // ---- sizing, controls, lifecycle ----
  function size() {
    const w = root!.clientWidth, h = root!.clientHeight;
    if (w == cw && h == ch && canvas!.width) return;
    cw = w; ch = h; dpr = Math.min(window.devicePixelRatio || 1, 2); u = clamp(cw / 1440, 0.6, 1);
    canvas!.width = Math.round(cw * dpr); canvas!.height = Math.round(ch * dpr);
    G = {}; scenes = []; D = { rip: [], sp: [], sa: [], lv: [], tr: [], gl: [] };
    render();
  }
  const setPause = () => {
    if (!pauseB) return;
    pauseB.setAttribute('aria-pressed', String(paused));
    pauseB.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
  };

  size();
  root.classList.add('js');
  if (ctl) ctl.hidden = false;
  if (pauseB) pauseB.hidden = reduced();
  setPause();
  if (reduced() || paused) { t = tr = 1e9; } else t = -300;
  setText(); render();
  dots.forEach((d, i) => d.addEventListener('click', () => { lastI = ck; hideHint(); go(i, instant() || paused); }));
  pauseB?.addEventListener('click', () => {
    paused = !paused; store('va-paused', paused ? '1' : '0'); setPause();
    if (!paused) { if (t >= 1e8) { t = 2800; tr = 1e9; } lastI = -1e9; }
    kick();
  });
  new IntersectionObserver((en) => {
    inView = en[en.length - 1].isIntersecting;
    if (inView) { hint(); kick(); }
  }).observe(root);
  document.addEventListener('visibilitychange', () => kick());
  let rt = 0;
  new ResizeObserver(() => { clearTimeout(rt); rt = window.setTimeout(() => { size(); kick(); }, 150); }).observe(root);
  rmq.addEventListener('change', () => { if (pauseB) pauseB.hidden = reduced(); if (reduced()) { t = tr = 1e9; prev = -1; } render(); kick(); });
}
