// Young native-tree library: side-view line art in the hero's hand, DOM-free (canvas and build-time SVG share it).
// Ten Cambodian forest hardwoods plus two landscape extras, each with its own silhouette at 14-44px.
// SPECIES LIST TO CONFIRM WITH THE NURSERY / OWNER (names and Latin binomials only; no claims about growth, carbon or uses).
// Stages are just size: seedling ~ 0.35, sapling ~ 0.65, young tree 1 x TREE_H[type]; each type keeps a hint of its character
// (leaf size, stem habit) even as a seedling. drawTree only adds sub-paths to a path builder (a canvas context or svgPath());
// the caller strokes, and may tint-fill. Deterministic per seed. g = growth 0..1: the stem draws first, then leaves or crown
// appear. bend = sideways px at the top (wind).
import { rng, ss } from './contours.ts';
const TAU = Math.PI * 2;
export const TREES = [
  { key: 'koki', name: 'Koki', latin: 'Hopea odorata' },
  { key: 'chheuteal', name: 'Chheuteal', latin: 'Dipterocarpus alatus' },
  { key: 'thbeng', name: 'Thbeng', latin: 'Dipterocarpus tuberculatus' },
  { key: 'phchek', name: 'Phchek', latin: 'Shorea obtusa' },
  { key: 'beng', name: 'Beng', latin: 'Afzelia xylocarpa' },
  { key: 'thnong', name: 'Thnong', latin: 'Pterocarpus macrocarpus' },
  { key: 'neangnuon', name: 'Neang nuon', latin: 'Dalbergia cochinchinensis' },
  { key: 'sralao', name: 'Sralao', latin: 'Lagerstroemia calyculata' },
  { key: 'chrey', name: 'Chrey (strangler fig)', latin: 'Ficus sp.' },
  { key: 'spung', name: 'Spung', latin: 'Tetrameles nudiflora' },
  { key: 'thnot', name: 'Thnot (sugar palm)', latin: 'Borassus flabellifer' },
  { key: 'russey', name: 'Russey (bamboo)', latin: 'Bambuseae' },
] as const;
/** Typical full height in px for each type (a young tree). */
export const TREE_H = [30, 44, 28, 26, 26, 30, 28, 40, 34, 44, 34, 36];
export const NT = TREE_H.length;
/** Height multiplier per growth stage: 0 seedling, 1 sapling, 2 young tree. */
export const STAGE = [0.35, 0.65, 1];
export interface PB { moveTo(x: number, y: number): void; lineTo(x: number, y: number): void; quadraticCurveTo(a: number, b: number, x: number, y: number): void }
/** A path builder that writes a compact SVG path string (for build-time templates): relative commands, tracking the rounded point so nothing drifts. */
export function svgPath(dec = 1) {
  const f = 10 ** dec, r = (v: number) => Math.round(v * f) / f;
  let d = '', px = 0, py = 0;
  const n = (v: number, first = false) => (v < 0 || first ? '' : ' ') + v;
  const mv = (c: string, x: number, y: number) => { const dx = r(x - px), dy = r(y - py); px += dx; py += dy; return c + n(dx, true) + n(dy); };
  return {
    moveTo: (x: number, y: number) => { if (d) d += mv('m', x, y); else { px = r(x); py = r(y); d = `M${px} ${py}`; } },
    lineTo: (x: number, y: number) => { d += mv('l', x, y); },
    quadraticCurveTo: (a: number, b: number, x: number, y: number) => { const ax = r(a - px), ay = r(b - py); d += 'q' + n(ax, true) + n(ay) + n(r(x - px)) + n(r(y - py)); px += r(x - px); py += r(y - py); },
    get d() { return d; },
  };
}
/** SVG path data for one fully grown tree: type, base x/y, height, seed. */
export function treeD(ty: number, x: number, y: number, h: number, seed = 1, lean = 0, dec = 1) { const p = svgPath(dec); drawTree(p, ty, x, y, h, lean, seed, 1); return p.d; }

export function drawTree(c: PB, ty: number, x0: number, y0: number, h: number, lean: number, seed: number, g: number, bend = 0, top = 0) {
  const R = rng(seed), gs = ss(g / 0.5), sz = h / TREE_H[ty], lo = sz < 0.5 || h < 14, mid = sz < 0.85;
  const w1 = R() * 6, w2 = 0.6 + R() * 0.8, sg = R() < 0.5 ? 1 : -1;
  const wob = [0.012, 0.01, 0.05, 0.07, 0.015, 0.02, 0.02, 0.008, 0.02, 0.008, 0.012, 0.01][ty];
  const ln = ty == 5 ? lean + sg * 0.1 : lean;
  const X = (f: number) => x0 + h * ln * f + bend * f * f + Math.sin(f * w2 * 3 + w1) * h * wob * (ty == 3 ? 1 + Math.sin(f * 11) : 1);
  const Y = (f: number) => y0 - h * f;
  const K = (a: number, b: number) => ss((g - a) / b);
  const stem = (top: number, o = 0) => {
    const n = lo ? 3 : Math.ceil(top * 8) + 1;
    c.moveTo(X(0) + o, Y(0));
    for (let i = 1; i <= n; i++) { const f = (top * i) / n; c.lineTo(X(f) + o, Y(f)); }
  };
  const dbl = (top: number, tw: number) => { if (tw >= 0.8) { stem(top, -tw); stem(top, tw); } else stem(top); };
  const seg = (a: number, b: number, e: number, f: number) => { c.moveTo(a, b); c.lineTo(e, f); };
  // a leaf or frond: lens from (x,y) along angle a (from vertical), length L, width ratio wd, droop dr, optional midrib
  const lens = (x: number, y: number, a: number, L: number, wd: number, dr = 0, rib = 0) => {
    if (L < 0.4) return;
    const dx = Math.sin(a), dy = -Math.cos(a), mx = x + dx * L * 0.5, my = y + dy * L * 0.5 + dr * L * 0.5, p = L * wd, tx = x + dx * L, ty_ = y + dy * L + dr * L;
    c.moveTo(x, y); c.quadraticCurveTo(mx - dy * p, my + dx * p, tx, ty_); c.quadraticCurveTo(mx + dy * p, my - dx * p, x, y);
    if (rib) seg(x, y, tx, ty_);
  };
  // scalloped crown outline: ellipse rx x ry with n lobes; tp narrows the top (cone), j = lobe roughness
  const crown = (cx: number, cy: number, rx: number, ry: number, n: number, tp = 0, j = 0.18) => {
    if (rx < 0.5) return;
    const a0 = R() * TAU, P: number[][] = [], tf = (a: number) => 1 + tp * Math.sin(a);
    for (let i = 0; i < n; i++) { const a = a0 + (i * TAU) / n, rr = 0.9 + j * R(); P.push([cx + Math.cos(a) * rx * rr * tf(a), cy + Math.sin(a) * ry * rr]); }
    c.moveTo(P[0][0], P[0][1]);
    for (let i = 0; i < n; i++) { const a = a0 + ((i + 0.5) * TAU) / n, rr = 1.22 + 0.16 * R(), q = P[(i + 1) % n]; c.quadraticCurveTo(cx + Math.cos(a) * rx * rr * tf(a), cy + Math.sin(a) * ry * rr, q[0], q[1]); }
  };
  // compound-leaf spray: curved rachis with paired leaflet ticks
  const spray = (x: number, y: number, a: number, L: number, dr = 0.3) => {
    if (L < 1) return;
    const dx = Math.sin(a), dy = -Math.cos(a), px = (t: number) => x + dx * L * t, py = (t: number) => y + dy * L * t + dr * L * t * t;
    c.moveTo(x, y); for (let s = 1; s <= 4; s++) c.lineTo(px(s / 4), py(s / 4));
    for (let t = 0.25; t < 1.01; t += 0.2) for (const s of [-1, 1]) { const q = a + s * 1.0, l = L * 0.2 * (1.1 - t); c.moveTo(px(t), py(t)); c.lineTo(px(t) + Math.sin(q) * l, py(t) - Math.cos(q) * l + dr * l * 0.4); }
  };
  const dome = (f: number, rx: number, ry: number, n: number) => crown(X(f), Y(f), rx * K(0.35, 0.65), ry * K(0.35, 0.65), n);
  if (top) { // seen from above (canopy scene): h is the crown radius; every species is a lumpy lobed crown, varied by size, lobes, irregularity and inner lobes
    const [N, jg, ry, inn, k] = [[16, 0.1, 1, 1, 1], [9, 0.2, 1, 2, 1.12], [7, 0.3, 0.85, 1, 1], [6, 0.3, 0.8, 1, 0.9], [11, 0.26, 0.75, 2, 1.05], [10, 0.26, 0.9, 1, 1], [13, 0.14, 1, 0, 0.85], [8, 0.12, 0.95, 1, 0.95], [12, 0.22, 1, 2, 1.05], [9, 0.2, 1, 1, 1.12], [14, 0.3, 0.9, 0, 0.8], [12, 0.3, 0.9, 0, 0.8]][ty];
    crown(x0, y0, h * k, h * k * ry, N, 0, jg);
    for (let i = 0, a = R() * TAU; i < inn; i++, a += 2.4) crown(x0 + Math.cos(a) * h * 0.3, y0 + Math.sin(a) * h * 0.25, h * (0.34 + 0.2 * R()), h * (0.3 + 0.15 * R()), 6 + ((R() * 3) | 0), 0, 0.2);
    return;
  }
  if (ty == 0) { // Koki: straight trunk, dense rounded-conical crown of small neat leaves
    if (lo) { stem(gs); for (let i = 0; i < 3; i++) for (const s of [-1, 1]) lens(X(0.35 + i * 0.22), Y(0.35 + i * 0.22), s * 1.1, h * 0.16 * K(0.3 + i * 0.15, 0.3), 0.55); }
    else {
      stem(gs * 0.4); const k = K(0.35, 0.65);
      crown(X(0.62), Y(0.62), h * 0.21 * k, h * 0.4 * k, 11 + ((R() * 3) | 0), 0.42, 0.12);
      if (!mid) for (let i = 0; i < 4; i++) { const f = 0.45 + i * 0.12; lens(X(f), Y(f), (i % 2 ? 1 : -1) * 0.9, h * 0.07 * k, 0.5); }
    }
  } else if (ty == 1) { // Chheuteal: very tall clean trunk, buttress hint, small domed crown high up; big leaves when young
    stem(gs);
    if (!lo) { const b = h * 0.06; for (const s of [-1, 1]) { c.moveTo(X(0.12), Y(0.12)); c.quadraticCurveTo(X(0.03) + s * b * 0.4, Y(0.03), x0 + s * b, y0); } }
    if (mid) { const n = lo ? 2 : 4; for (let i = 0; i < n; i++) { const f = 0.45 + 0.5 * (i / n); lens(X(f), Y(f), (i % 2 ? 1 : -1) * 0.95, h * 0.3 * K(0.3 + f * 0.4, 0.3), 0.6); } lens(X(1), Y(1), 0, h * 0.28 * K(0.7, 0.3), 0.6); }
    else { dome(0.88, h * 0.15, h * 0.1, 7); for (const s of [-1, 1]) { c.moveTo(X(0.78), Y(0.78)); c.lineTo(X(0.86) + s * h * 0.06, Y(0.86)); } }
  } else if (ty == 2) { // Thbeng: slightly crooked trunk, open crown of a few very large broad leaves
    stem(gs);
    const n = lo ? 2 : 4 + ((R() * 2) | 0);
    for (let i = 0; i < n; i++) {
      const f = 0.5 + (0.5 * i) / n, s = i % 2 ? 1 : -1, a = s * (0.7 + R() * 0.5), k = K(0.35 + f * 0.35, 0.3), bl = lo ? 0 : h * 0.1 * k;
      let ex = X(f), ey = Y(f);
      if (bl > 0.4) { ex += Math.sin(a) * bl; ey -= Math.cos(a) * bl; seg(X(f), Y(f), ex, ey); }
      lens(ex, ey, a, h * (lo ? 0.4 : 0.33) * (0.85 + 0.3 * R()) * k, 0.62, 0.1, 1);
    }
    lens(X(1), Y(1), (R() - 0.5) * 0.4, h * 0.3 * K(0.7, 0.3), 0.62, 0, 1);
  } else if (ty == 3) { // Phchek: gnarled crooked trunk, patchy clumped crown
    stem(gs * 0.8); const nc = lo ? 1 : 3 + ((R() * 2) | 0), k = K(0.4, 0.55);
    for (let i = 0; i < nc; i++) {
      const f = 0.45 + (0.35 * i) / Math.max(1, nc - 1) * (lo ? 0 : 1), s = i % 2 ? 1 : -1, ex = X(f) + (lo ? 0 : s * h * (0.16 + 0.1 * R())), ey = Y(f + (lo ? 0.3 : 0.1 + 0.06 * R()));
      if (!lo) { c.moveTo(X(f), Y(f)); c.quadraticCurveTo(X(f) + s * h * 0.06, Y(f + 0.1), ex, ey); }
      crown(ex, ey - h * 0.04 * k, h * (lo ? 0.2 : 0.14) * k, h * (lo ? 0.14 : 0.1) * k, lo ? 5 : 6, 0, 0.25);
    }
  } else if (ty == 4) { // Beng: short stout trunk, broad lumpy spreading crown with forking branches
    if (lo) { dbl(gs, h * 0.05); spray(X(1), Y(1), 0.3, h * 0.55 * K(0.4, 0.5), 0.35); spray(X(0.7), Y(0.7), -1, h * 0.4 * K(0.5, 0.4), 0.35); }
    else {
      dbl(gs * 0.46, h * 0.07); const k = K(0.4, 0.55), cx = X(0.68), cy = Y(0.68);
      crown(cx, cy, h * 0.4 * k, h * 0.27 * k, 11, 0, 0.26);
      if (k > 0.3) for (const s of [-0.6, 0, 0.6]) { c.moveTo(X(0.44), Y(0.44)); c.quadraticCurveTo(X(0.52) + s * h * 0.1, Y(0.56), cx + s * h * 0.26 * k, cy - h * 0.06 * k * (1 - Math.abs(s))); }
    }
  } else if (ty == 5) { // Thnong: leaning, forked trunk; wide lobed crown with drooping branch tips
    stem(gs * 0.5); const k = K(0.4, 0.55), hw = h * 0.36 * k, cx = X(0.76), cy = Y(0.74);
    if (lo) { lens(X(0.5), Y(0.5), -1.1, h * 0.42 * k, 0.4, 0.5, 1); lens(X(0.5), Y(0.5), 1.0, h * 0.42 * k, 0.4, 0.5, 1); lens(X(0.5), Y(0.5), 0, h * 0.3 * k, 0.4, 0, 1); }
    else if (hw > 0.5) {
      for (const s of [-1, 0, 1]) { c.moveTo(X(0.5), Y(0.5)); c.quadraticCurveTo(X(0.58) + s * h * 0.07, Y(0.64), cx + s * hw * 0.45, cy + hw * 0.1 * (1 - Math.abs(s))); }
      crown(cx, cy, hw, hw * 0.7, 10, 0, 0.26);
      for (const s of [-0.85, -0.35, 0.4, 0.9]) { const bx = cx + s * hw * 0.92, by = cy + hw * 0.5 * (1 - s * s * 0.5); c.moveTo(bx, by); c.quadraticCurveTo(bx + s * 1.5, by + h * 0.04 * k, bx + s * 1.2, by + h * 0.09 * k); }
    }
  } else if (ty == 6) { // Neang nuon: small slender tree, feathery compound-leaf sprays
    stem(gs); const ns = lo ? 1 : 3 + ((R() * 2) | 0), k = K(0.35, 0.55);
    for (let i = 0; i < ns; i++) { const f = ns == 1 ? 1 : 0.5 + (0.5 * i) / (ns - 1), s = i % 2 ? 1 : -1; spray(X(f), Y(f), ns == 1 ? 0.35 : s * (0.5 + 0.5 * R()) - (i == ns - 1 ? s * 0.5 : 0), h * (lo ? 0.55 : 0.4) * k, 0.3); }
  } else if (ty == 7) { // Sralao: tall smooth pale trunk (double line), narrow columnar crown
    dbl(gs * 0.8, h * 0.022);
    const k = K(0.35, 0.65);
    crown(X(0.76), Y(0.76), h * 0.12 * k, h * (lo ? 0.2 : 0.27) * k, lo ? 5 : 8, 0, 0.12);
    if (!lo) for (const s of [-0.5, 0.5]) { c.moveTo(X(0.55), Y(0.55)); c.quadraticCurveTo(X(0.62), Y(0.65), X(0.76) + s * h * 0.08 * k, Y(0.82)); }
  } else if (ty == 8) { // Chrey: strangler fig, braided trunk, broad dome crown, hanging aerial roots
    const k = K(0.35, 0.65), cx = X(0.7), cy = Y(0.7), rx = h * 0.36 * k;
    if (lo) { stem(gs); lens(X(1), Y(1), -0.9, h * 0.3 * K(0.4, 0.4), 0.55); lens(X(1), Y(1), 0.9, h * 0.3 * K(0.4, 0.4), 0.55); lens(X(0.6), Y(0.6), -1, h * 0.2 * K(0.3, 0.4), 0.55); }
    else {
      for (let i = -1; i <= 1; i++) { c.moveTo(X(0) + i * h * 0.04, y0); for (let f = 0.1; f <= gs * 0.5 + 0.01; f += 0.1) c.lineTo(X(f) + i * h * 0.03 * Math.cos(f * 12 + i * 2), Y(f)); }
      crown(cx, cy, rx, rx * 0.78, 10, 0, 0.22);
      for (let i = 0; i < (mid ? 3 : 5); i++) { const s = (i + 0.5) / (mid ? 3 : 5) * 2 - 1, rx_ = cx + s * rx * 0.8, ry_ = cy + rx * 0.5 * (1 - s * s * 0.5), L = (i % 3 == 1 ? 0.5 : 0.22 + 0.1 * R()) * h * K(0.6, 0.4); c.moveTo(rx_, ry_); c.quadraticCurveTo(rx_ + 1.5, ry_ + L * 0.5, rx_ - 0.5, Math.min(y0, ry_ + L)); }
    }
  } else if (ty == 9) { // Spung: huge flared buttress roots, tall pale trunk, sparse crown (the Ta Prohm tree)
    const w = h * 0.2;
    dbl(gs * 0.85, h * 0.025);
    for (const s of [-1, 1]) { c.moveTo(X(0.3) + s * h * 0.02, Y(0.3)); c.quadraticCurveTo(X(0.1) + s * h * 0.03, Y(0.12), x0 + s * w * (lo ? 0.5 : 1), y0); }
    if (!lo) { c.moveTo(X(0.26), Y(0.26)); c.quadraticCurveTo(X(0.12) - w * 0.2, Y(0.1), x0 - w * 0.45, y0); c.moveTo(X(0.26), Y(0.26)); c.quadraticCurveTo(X(0.12) + w * 0.3, Y(0.1), x0 + w * 0.5, y0); }
    const k = K(0.45, 0.5), n = lo ? 2 : 4;
    for (let i = 0; i < n; i++) { const f = 0.7 + 0.3 * (i / n), s = i % 2 ? 1 : -1, ex = X(f) + s * h * 0.12 * k, ey = Y(f + 0.06); if (!lo) seg(X(f), Y(f), ex, ey); lens(ex, ey, s * 0.8, h * 0.12 * k, 0.55); }
  } else if (ty == 10) { // Thnot (sugar palm): straight trunk, fan of radiating fronds
    const tw = h * 0.03; dbl(gs, tw);
    const nf = lo ? 6 : 9 + ((R() * 3) | 0), k = K(0.45, 0.5);
    for (let i = 0; i < nf; i++) { const a = -1.5 + (3 * (i + 0.5 * R())) / nf, ab = Math.abs(a); lens(X(1), Y(1), a, h * (0.22 + 0.1 * ab + 0.05 * R()) * k, 0.2, Math.max(0, ab - 0.2) * 0.8, 1); }
  } else { // Russey: bamboo clump, jointed culms with small leaf tufts
    const nc = lo ? 3 : 4 + ((R() * 3) | 0), k2 = K(0.5, 0.5);
    for (let i = 0; i < nc; i++) {
      const a = (i - (nc - 1) / 2) * 0.16 + (R() - 0.5) * 0.08, L = h * (0.75 + 0.25 * R()) * gs, bx = x0 + (i - (nc - 1) / 2) * h * 0.03;
      const ex = bx + Math.sin(a) * L + bend * ((L / h) ** 2), ey = y0 - Math.cos(a) * L;
      seg(bx, y0, ex, ey);
      if (!lo) for (let n = 1; n < 5; n++) { const f = n / 5, jx = bx + (ex - bx) * f, jy = y0 + (ey - y0) * f; seg(jx - 1.3, jy, jx + 1.3, jy); }
      for (const s of [-1, 1]) lens(ex, ey, a + s * 1.0, h * 0.2 * k2, 0.35, 0.25);
      lens(ex, ey, a, h * 0.14 * k2, 0.35);
    }
  }
}

export interface Plant { x: number; y: number; h: number; ty: number; sd: number; l: number }
/** Species mix for planting: ten native hardwoods at sapling scale (indices into TREES). */
export const PLANT_MIX = [0, 1, 2, 3, 4, 5, 6, 7];
/** One planted sapling (mostly sapling stage, some seedlings) at (x, y); ps scales for small screens. */
export function sapling(R: () => number, x: number, y: number, ps = 1): Plant {
  const ty = PLANT_MIX[(R() * PLANT_MIX.length) | 0];
  return { x, y, h: TREE_H[ty] * STAGE[R() < 0.18 ? 0 : 1] * ps * (0.92 + 0.2 * R()), ty, sd: (R() * 1e9) | 0, l: (R() - 0.5) * 0.16 };
}
/** The pilot patch: staggered rows of saplings inside a dashed boundary, centred on (cx, cy). Returns plants (sorted back to front) and the boundary polyline. */
export function patch(cx: number, cy: number, hw: number, hh: number, ps: number, R: () => number, noise: (x: number, y: number) => number) {
  const sx = 27 * ps, sy = 20 * ps, ph = 26 * ps, rho = (u: number, v: number) => (Math.abs(u / hw) ** 3 + Math.abs(v / hh) ** 3) ** (1 / 3);
  const p: Plant[] = [], bn = (a: number) => noise(Math.cos(a) * 1.3 + 9, Math.sin(a) * 1.3 + 9);
  for (let j = 0, v = -hh; v <= hh; j++, v += sy) for (let u = -hw + (j & 1) * sx * 0.5; u <= hw; u += sx) {
    const uu = u + (R() - 0.5) * 4 * ps, vv = v + (R() - 0.5) * 3 * ps;
    if (rho(uu, vv) < 1) p.push(sapling(R, cx + uu, cy + vv, ps));
  }
  const b: number[] = [], rx = hw + 10 * ps, ry = hh + ph * 0.55 + 8 * ps, oy = cy - ph * 0.45;
  for (let k = 0; k <= 72; k++) {
    const a = (k / 72) * TAU, c = Math.cos(a), s = Math.sin(a), r = (1.03 + 0.05 * bn(a)) / (Math.abs(c / rx) ** 3 + Math.abs(s / ry) ** 3) ** (1 / 3);
    b.push(cx + c * r, oy + s * r);
  }
  return { p, b };
}
