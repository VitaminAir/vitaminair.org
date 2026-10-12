// Line art for article page stages, ported from SmallWorld: grass and terraces over one drifting height field. DOM-free.
import { clamp, fbm, hash, pathD, simplify } from './contours.ts';

export type LineKind = 'grass' | 'terraces';
export type Press = { x: number; y: number; s: number };
export type Stroke = { p: number[]; bold: boolean };

const RADIUS = 95;

/** Height of the land at (x, y) after t seconds: two drifting noise layers, plus a hill under the pointer. */
function heightAt(seed: number, t: number, press?: Press) {
  const sc = 260, ox = seed * 7.31, oy = seed * 3.17;
  return (x: number, y: number) => {
    const u = x / sc + ox, v = y / sc + oy;
    let z = 0.62 * fbm(u + t * 0.045, v - t * 0.03) + 0.38 * fbm(u * 1.4 - t * 0.035 + 11, v * 1.4 + t * 0.04 + 5);
    if (press && press.s > 0) {
      const dx = x - press.x, dy = y - press.y;
      z += press.s * 0.45 * Math.exp(-(dx * dx + dy * dy) / (2 * RADIUS * RADIUS));
    }
    return z;
  };
}

/** Stacked ridgelines, like terraced fields seen from the side. */
function terraces(w: number, h: number, z: (x: number, y: number) => number): Stroke[] {
  const gap = 9, out: Stroke[] = [];
  let k = 0;
  for (let y0 = -60; y0 < h + 60; y0 += gap) {
    const p: number[] = [];
    for (let x = -10; x <= w + 10; x += 10) p.push(x, y0 - (z(x, y0) - 0.5) * 140);
    out.push({ p, bold: k++ % 5 === 2 });
  }
  return out;
}

/** Short strokes, like rice in the wind: each leans with the land under it. */
function grass(w: number, h: number, z: (x: number, y: number) => number, seed: number): Stroke[] {
  const gap = 9, out: Stroke[] = []; // denser than SmallWorld (15): on dark green, sparse strokes read as rain
  for (let gy = 0; gy < h + gap; gy += gap) for (let gx = 0; gx < w + gap; gx += gap) {
    const r = hash(gx * 3 + seed, gy * 5);
    const x = gx + (r - 0.5) * gap, y = gy + (hash(gy * 7, gx + seed) - 0.5) * gap;
    const v = z(x, y), a = -Math.PI / 2 + (v - 0.5) * 3.2, len = 5 + 7 * clamp((v - 0.3) / 0.5, 0, 1);
    out.push({ p: [x, y, x + Math.cos(a) * len, y + Math.sin(a) * len], bold: r > 0.93 });
  }
  return out;
}

/** Every stroke over a w x h box, t seconds in, with an optional pointer press. */
export function lineStrokes(kind: LineKind, w: number, h: number, seed: number, t = 0, press?: Press): Stroke[] {
  const z = heightAt(seed, t, press);
  return kind === 'terraces' ? terraces(w, h, z) : grass(w, h, z, seed);
}

/** The still frame as two SVG path strings, thin and bold: the no-JS twin. */
export function linePaths(kind: LineKind, w: number, h: number, seed: number): { thin: string; bold: string } {
  const s = lineStrokes(kind, w, h, seed);
  const d = (bold: boolean) => s.filter((q) => q.bold === bold).map((q) => pathD(q.p.length > 4 ? simplify(q.p, 1.2) : q.p)).join('');
  return { thin: d(false), bold: d(true) };
}
