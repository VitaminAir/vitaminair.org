// Shared line-art geometry: a seeded noise height field, marching-squares contours and a few helpers.
// DOM-free on purpose: the build (static SVG for no-JS, article watermarks, dividers, edges) and the
// browser canvas (hero, page stages, band) draw the same lines from the same field.
export type R = () => number;
export type N2 = (x: number, y: number) => number;
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const ss = (x: number) => ((x = clamp(x, 0, 1)), x * x * (3 - 2 * x));
export const rng = (s: number): R => () => {
  s |= 0; s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const hash = (x: number, y: number) => {
  let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ 0x5eed;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
export const noise: N2 = (x, y) => {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
export const fbm: N2 = (x, y) => 0.55 * noise(x, y) + 0.3 * noise(2 * x + 5, 2 * y + 3) + 0.15 * noise(4 * x + 9, 4 * y + 1);

export interface Field { F: Float32Array; nx: number; ny: number; st: number; lo: number; hi: number }
export interface FieldOpts { seed?: number; st?: number; off?: [number, number] }

/** Height field over a w x h box. Seed 0 with no offset is the hero's "Land" terrain. */
export function field(w: number, h: number, o: FieldOpts = {}): Field {
  const st = o.st ?? 10, nx = Math.ceil(w / st) + 3, ny = Math.ceil(h / st) + 3;
  const sc0 = Math.max(190, Math.min(w, 1300) * 0.24);
  const sx = (o.seed ?? 0) * 7.31 + (o.off?.[0] ?? 0), sy = (o.seed ?? 0) * 3.17 + (o.off?.[1] ?? 0);
  const F = new Float32Array(nx * ny);
  let lo = 9, hi = -9;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = (i - 1) * st, y = (j - 1) * st, v = fbm(x / sc0 + sx, y / sc0 + sy) + (x / w) * 0.2;
    F[j * nx + i] = v; lo = Math.min(lo, v); hi = Math.max(hi, v);
  }
  return { F, nx, ny, st, lo, hi };
}

const EDGES = [[], [[3, 0]], [[0, 1]], [[3, 1]], [[1, 2]], [[3, 0], [1, 2]], [[0, 2]], [[3, 2]], [[2, 3]], [[0, 2]], [[0, 1], [2, 3]], [[1, 2]], [[1, 3]], [[0, 1]], [[0, 3]], []];
export interface Line { p: number[]; li: number }

/** Marching squares at L evenly spread levels, chained into polylines (flat x,y arrays). */
export function contourLines(f: Field, L = 17, minLen = 16): Line[] {
  const { F, nx, ny, st, lo, hi } = f;
  const out: Line[] = [];
  for (let li = 0; li < L; li++) {
    const lv = lo + (hi - lo) * (0.06 + 0.88 * (li + 0.5) / L);
    const adj = new Map<number, number[]>();
    const add = (a: number, b: number) => { (adj.get(a) || adj.set(a, []).get(a)!).push(b); (adj.get(b) || adj.set(b, []).get(b)!).push(a); };
    const ek = (t: number, i: number, j: number) => (t == 0 ? (j * nx + i) * 2 : t == 2 ? ((j + 1) * nx + i) * 2 : t == 3 ? (j * nx + i) * 2 + 1 : (j * nx + i + 1) * 2 + 1);
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const k = j * nx + i;
      const cs = (F[k] > lv ? 1 : 0) | (F[k + 1] > lv ? 2 : 0) | (F[k + nx + 1] > lv ? 4 : 0) | (F[k + nx] > lv ? 8 : 0);
      for (const e of EDGES[cs]) add(ek(e[0], i, j), ek(e[1], i, j));
    }
    const pt = (k: number): number[] => {
      const a = k >> 1, b = a + (k & 1 ? nx : 1), t = (lv - F[a]) / (F[b] - F[a]);
      const ax = (a % nx) - 1, ay = ((a / nx) | 0) - 1, bx = (b % nx) - 1, by = ((b / nx) | 0) - 1;
      return [(ax + (bx - ax) * t) * st, (ay + (by - ay) * t) * st];
    };
    const seen = new Set<number>();
    const trace = (k0: number) => {
      const p: number[] = []; let k = k0, pv = -1;
      for (;;) {
        seen.add(k); p.push(...pt(k));
        const n = adj.get(k)!.find((q) => q !== pv && !seen.has(q));
        if (n === undefined) break;
        pv = k; k = n;
      }
      if (p.length > 8 && adj.get(k)!.includes(k0)) p.push(p[0], p[1]);
      return p;
    };
    const keys = [...adj.keys()];
    const lines: number[][] = [];
    for (const k of keys) if (!seen.has(k) && adj.get(k)!.length == 1) lines.push(trace(k));
    for (const k of keys) if (!seen.has(k)) lines.push(trace(k));
    for (const p of lines) if (p.length >= minLen) out.push({ p, li });
  }
  return out;
}

/** Survey crosses on the highest ground (positions only; the caller draws them). */
export function spotHeights(f: Field, w: number, h: number, R: R, n = 6): number[][] {
  const { F, nx, ny, st } = f;
  const hs: number[][] = [];
  for (let k = 0; k < 500; k++) { const i = 1 + ((R() * (nx - 2)) | 0), j = 1 + ((R() * (ny - 2)) | 0); hs.push([F[j * nx + i], (i - 1) * st, (j - 1) * st]); }
  hs.sort((a, b) => b[0] - a[0]);
  const cr: number[][] = [];
  for (const q of hs) { if (cr.length < n && q[1] > 20 && q[1] < w - 20 && q[2] > 70 && q[2] < h * 0.6 && cr.every((o) => Math.hypot(o[1] - q[1], o[2] - q[2]) > 150)) cr.push(q); }
  return cr;
}

// ---- build-time helpers (used by the SVG renderers; tree-shaken out of the browser bundle) ----------------
/** Douglas-Peucker on a flat x,y array. */
export function simplify(p: number[], tol: number): number[] {
  const n = p.length / 2;
  if (n < 3) return p;
  const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1;
  const stack: number[][] = [[0, n - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const ax = p[2 * a], ay = p[2 * a + 1], dx = p[2 * b] - ax, dy = p[2 * b + 1] - ay, L = Math.hypot(dx, dy) || 1e-9;
    let m = -1, md = tol;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((p[2 * i] - ax) * dy - (p[2 * i + 1] - ay) * dx) / L; if (d > md) { md = d; m = i; } }
    if (m > 0) { keep[m] = 1; stack.push([a, m], [m, b]); }
  }
  const o: number[] = [];
  for (let i = 0; i < n; i++) if (keep[i]) o.push(p[2 * i], p[2 * i + 1]);
  return o;
}

/** Compact SVG path: absolute integer start, then relative integer steps. */
export function pathD(p: number[], dec = 0): string {
  const f = 10 ** dec, r = (v: number) => Math.round(v * f) / f;
  let x = r(p[0]), y = r(p[1]), s = `M${x} ${y}`, first = true;
  for (let i = 2; i < p.length; i += 2) {
    const nx = r(p[i]), ny = r(p[i + 1]), dx = r(nx - x), dy = r(ny - y);
    x = nx; y = ny;
    if (!dx && !dy) continue;
    s += (first ? 'l' : ' ') + `${dx} ${dy}`;
    first = false;
  }
  return s;
}
