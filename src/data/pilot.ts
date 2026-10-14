// Planting pilot: every number on /rewilding/pilot/ is computed from the constants below, never typed twice.
// Conceptual layout: a square 100 m x 100 m site, three equal strip plots side by side on two thirds of it.

export const SITE_HA = 1;
export const SITE_SIDE_M = 100;
export const TOTAL_SAPLINGS = 20000;
export const PRICE_USD = 1; // planning assumption, not a quotation
export const BUFFER_M = 5; // perimeter firebreak / buffer, inside the boundary
export const TRACK_M = 5; // access tracks between the plots
export const DOT_R_M = 0.16;
const EPS = 1e-6;

const DENSITIES = [
  { key: 'a', letter: 'A', perM2: 2 },
  { key: 'b', letter: 'B', perM2: 3 },
  { key: 'c', letter: 'C', perM2: 4 },
] as const;

export const n0 = (n: number) => Math.round(n).toLocaleString('en-US');
export const dp = (n: number, d: number) => n.toFixed(d);

const sumPerM2 = DENSITIES.reduce((s, d) => s + d.perM2, 0); // 9
export const plotM2 = TOTAL_SAPLINGS / sumPerM2; // 2222.2 m² each
export const plotHa = plotM2 / 10000; // 0.2222
export const plotsM2 = plotM2 * DENSITIES.length; // 6666.7
export const PLANTED_HA = plotsM2 / 10000; // 0.6667
export const plotW = (SITE_SIDE_M - 2 * BUFFER_M - (DENSITIES.length - 1) * TRACK_M) / DENSITIES.length; // 26.67 across
export const plotL = plotM2 / plotW; // 83.33 long
export const accessY = BUFFER_M + plotL; // 88.33: the access strip starts here
export const accessH = SITE_SIDE_M - BUFFER_M - accessY; // 6.67
export const diagonalM = Math.hypot(plotW, plotL); // 87.5
export const remainingM2 = SITE_HA * 10000 - plotsM2; // 3333
export const remainingHa = remainingM2 / 10000;

// Build-time assertion on the geometry: plots + everything else must fill the hectare.
if (Math.abs(plotW * plotL - plotM2) > 1e-6 || Math.abs(plotsM2 + remainingM2 - 10000) > 1e-6 || accessH < 0)
  throw new Error(`pilot.ts: site areas do not add up (plots ${plotsM2}, rest ${remainingM2}, access ${accessH}).`);

export interface Whole { rows: number; perRowUnshifted: number; perRowShifted: number; total: number }

export interface Plot {
  key: 'a' | 'b' | 'c';
  letter: string;
  perM2: number;
  perHa: number;
  spacing: number; // m, square-equivalent
  saplings: number;
  cost: number;
  share: number; // of the saplings and of the budget, 0..1
  x: number; // plot corner on the site plan (m)
  y: number;
  rowM: number; // distance between rows
  inRowM: number; // distance between trees along a row
  shiftM: number; // every second row starts this far along (0 = none)
  nearestM: number;
  whole: Whole;
}

/** The field layout per plot: rows run across the plot width. First row on the plot edge, first tree on the corner. */
const FIELD = {
  a: { rowM: 0.5, inRowM: 1, shiftM: 0.5 },
  b: { rowM: 0.5, inRowM: 2 / 3, shiftM: 1 / 3 },
  c: { rowM: 0.5, inRowM: 0.5, shiftM: 0 },
} as const;

type F = { rowM: number; inRowM: number; shiftM: number };

/** Tree positions (m) in the corner patch [0,w] x [0,h]. */
export function fieldTrees(f: F, w: number, h: number): [number, number][] {
  const out: [number, number][] = [];
  for (let r = 0; r * f.rowM <= h + EPS; r++) {
    const x0 = r % 2 ? f.shiftM : 0;
    for (let k = 0; x0 + k * f.inRowM <= w + EPS; k++) out.push([x0 + k * f.inRowM, r * f.rowM]);
  }
  return out;
}

/** Whole-plot count, edge-inclusive: rows stepped along the length, trees along the width. */
function wholePlot(f: F): Whole {
  const rows = Math.floor(plotL / f.rowM + EPS) + 1;
  const perRowUnshifted = Math.floor(plotW / f.inRowM + EPS) + 1;
  const perRowShifted = f.shiftM ? Math.floor((plotW - f.shiftM) / f.inRowM + EPS) + 1 : perRowUnshifted;
  const shiftedRows = f.shiftM ? Math.floor(rows / 2) : 0;
  return { rows, perRowUnshifted, perRowShifted, total: (rows - shiftedRows) * perRowUnshifted + shiftedRows * perRowShifted };
}

/** One 1 m² box per plot, placed so it holds exactly perM2 trees and none sit on its border: [x0, x1, y0, y1]. */
export const BOXES: Record<'a' | 'b' | 'c', [number, number, number, number]> = {
  a: [0.25, 1.25, 0.25, 1.25],
  b: [0.1, 1.1, 0.25, 1.25],
  c: [0.25, 1.25, 0.25, 1.25],
};
export const PATCH_W = 3;
export const PATCH_H = 2.5;

const xs = DENSITIES.map((_, i) => BUFFER_M + i * (plotW + TRACK_M));

const raw = DENSITIES.map((d, i) => {
  const saplings = Math.round(plotM2 * d.perM2);
  const fl = FIELD[d.key];
  const nearestM = fl.shiftM ? Math.hypot(fl.shiftM, fl.rowM) : Math.min(fl.rowM, fl.inRowM);
  return { ...d, perHa: d.perM2 * 10000, spacing: Math.sqrt(1 / d.perM2), saplings, cost: saplings * PRICE_USD, x: xs[i], y: BUFFER_M, ...fl, nearestM, whole: wholePlot(fl) };
});

// Build-time checks for the marking-out section.
for (const p of raw) {
  if (Math.abs(1 / (p.rowM * p.inRowM) - p.perM2) > 1e-9) throw new Error(`pilot.ts: plot ${p.letter} rows x spacing give ${1 / (p.rowM * p.inRowM)} per m², expected ${p.perM2}`);
  const [x0, x1, y0, y1] = BOXES[p.key];
  if (Math.abs((x1 - x0) * (y1 - y0) - 1) > 1e-9) throw new Error(`pilot.ts: box ${p.letter} is not 1 m²`);
  const ts = fieldTrees(p, PATCH_W, PATCH_H);
  const inside = ts.filter(([x, y]) => x > x0 && x < x1 && y > y0 && y < y1).length;
  const onEdge = ts.filter(([x, y]) => x >= x0 - EPS && x <= x1 + EPS && y >= y0 - EPS && y <= y1 + EPS).length;
  if (inside !== p.perM2 || onEdge !== inside) throw new Error(`pilot.ts: box ${p.letter} holds ${inside} trees (${onEdge} incl. border), expected ${p.perM2}`);
}
const EXPECT_WHOLE = [4509, 6764, 9018];
raw.forEach((p, i) => {
  if (p.whole.total !== EXPECT_WHOLE[i]) throw new Error(`pilot.ts: plot ${p.letter} whole-plot count ${p.whole.total}, expected ${EXPECT_WHOLE[i]}`);
});

export const totalSaplings = raw.reduce((s, p) => s + p.saplings, 0);
export const totalCost = raw.reduce((s, p) => s + p.cost, 0);

// Build-time assertion: the page must never show figures that do not add up.
if (totalSaplings !== TOTAL_SAPLINGS || totalCost !== TOTAL_SAPLINGS * PRICE_USD)
  throw new Error(`pilot.ts: saplings sum to ${totalSaplings} and cost to ${totalCost}; both must be ${TOTAL_SAPLINGS}.`);

export const plots: Plot[] = raw.map((p) => ({ ...p, share: p.saplings / totalSaplings }));

export const wholeTotal = raw.reduce((s, p) => s + p.whole.total, 0);
if (wholeTotal !== 20291) throw new Error(`pilot.ts: whole-plot total ${wholeTotal}, expected 20,291`);
export const wholeExtraPct = ((wholeTotal - totalSaplings) / totalSaplings) * 100; // about 1.5
