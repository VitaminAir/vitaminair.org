// Static line art for the templates, drawn from the same noise field and contour tracer as the canvas
// (src/art/contours.ts). Everything here is deterministic: same seed and size, same lines.
import { treeD, patch, TREE_H } from '../art/trees.ts';
import { field, contourLines, spotHeights, simplify, pathD, fbm, noise, rng, clamp } from '../art/contours.ts';

const cache = new Map<string, { p: number[]; li: number }[]>();
function lines(w: number, h: number, seed: number, st: number, L: number, tol: number) {
  const k = [w, h, seed, st, L, tol].join();
  if (!cache.has(k)) cache.set(k, contourLines(field(w, h, { seed, st }), L).map((l) => ({ p: simplify(l.p, tol), li: l.li })));
  return cache.get(k)!;
}

/** The no-JS / reduced-motion twin of a canvas stage: the Land scene, two-tone, drawn from the shared field. */
export function stageSvg(cls: string, w: number, h: number, seed: number, scene = 'land'): string {
  const ls = lines(w, h, seed, 10, 17, 1.6);
  const thin = ls.filter((l) => l.li % 4 != 2).map((l) => pathD(l.p)).join('');
  const idx = ls.filter((l) => l.li % 4 == 2).map((l) => pathD(l.p)).join('');
  const marks = spotHeights(field(w, h, { seed }), w, h, rng(20261011 + seed))
    .map((q) => `M${Math.round(q[1] - 5)} ${Math.round(q[2])}h10M${Math.round(q[1])} ${Math.round(q[2] - 5)}v10`)
    .join('');
  return `<svg class="${cls}" aria-hidden="true" focusable="false" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="#3F6E55" stroke-width="1" stroke-opacity=".9" d="${thin}"/><path stroke="#6F9478" stroke-width="1.6" stroke-opacity=".8" d="${idx}"/><path stroke="#6F9478" stroke-width="1.2" stroke-opacity=".85" d="${marks}"/></svg>${scene == 'planting' ? plantingPatch() : ''}`;
}

/** Static Planting patch for the no-JS twin: its own small SVG (so it never gets cropped by the stage's slice), built from the same patch() layout as the canvas. CSS positions it like the canvas does. */
function plantingPatch(): string {
  const { p, b } = patch(0, 0, 128, 92, 1, rng(7), noise);
  const d = p.map((q) => treeD(q.ty, q.x, q.y, q.h, q.sd, q.l, 0)).join('');
  const xs = b.filter((_, i) => !(i & 1)), ys = b.filter((_, i) => i & 1);
  const x0 = Math.floor(Math.min(...xs)) - 3, y0 = Math.floor(Math.min(...ys)) - 3, W = Math.ceil(Math.max(...xs)) + 3 - x0, H = Math.ceil(Math.max(...ys)) + 3 - y0;
  return `<svg class="stage-patch" aria-hidden="true" focusable="false" viewBox="${x0} ${y0} ${W} ${H}" style="--w:${W}px;--dx:${x0}px;--dy:${y0}px" fill="#D98A62" fill-opacity=".12" stroke="#D98A62" stroke-linecap="round" stroke-linejoin="round"><path stroke-width="1.05" stroke-opacity=".95" d="${d}"/><path fill="none" stroke-width="1.2" stroke-opacity=".8" stroke-dasharray="4 6" d="${pathD(b, 0)}Z"/></svg>`;
}

/** Single-colour contour field (band background, footer, watermarks). Colour and opacity come from CSS vars or args. */
export function fieldSvg(cls: string, w: number, h: number, seed: number, stroke: string, opacity: number, st = 14, L = 12): string {
  const d = lines(w, h, seed, st, L, 2.2).map((l) => pathD(l.p)).join('');
  return `<svg class="${cls}" aria-hidden="true" focusable="false" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path vector-effect="non-scaling-stroke" d="${d}"/></svg>`;
}

/** Wavy y values along a line, from the same noise (n points over `w` units). */
function ridge(w: number, n: number, seed: number, lo: number, hi: number, scale = 260): number[] {
  const p: number[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (w * i) / n;
    p.push(x, lo + (hi - lo) * clamp((fbm(x / scale + seed * 3.1, seed * 1.7 + 4) - 0.25) / 0.5, 0, 1));
  }
  return simplify(p, 0.35);
}

/** A thin undulating contour line between major sections on paper (draws in via CSS clip). */
export function divider(seed: number): string {
  const d = pathD(ridge(1200, 80, seed, 2, 12, 190), 1);
  return `<div class="divider" aria-hidden="true"><svg viewBox="0 0 1200 14" preserveAspectRatio="none" focusable="false"><path vector-effect="non-scaling-stroke" d="${d}"/></svg></div>`;
}

/** A band edge, 24-48px tall. 'up': the band rises from below the wave (sits above a band). 'down': the band hangs from above (sits below it). */
export function edge(kind: 'up' | 'down', seed: number, cls = ''): string {
  const r = ridge(1200, 70, seed, 4, 34, 230);
  const d = pathD(r, 1);
  const fill = `${d}V${kind === 'up' ? 40 : 0}H0Z`;
  return `<svg class="edge edge--${kind}${cls ? ' ' + cls : ''}" aria-hidden="true" focusable="false" viewBox="0 0 1200 40" preserveAspectRatio="none"><path d="${fill}"/></svg>`;
}

/** Contour lines that straddle the photo's inner edge (NOTE 01): vertical beside the photo, horizontal under it. */
export function frameLines(seed: number, horiz = false): string {
  const paths: string[] = [];
  for (let k = 0; k < 5; k++) {
    const p: number[] = [];
    for (let j = 0; j <= 40; j++) {
      const a = (600 * j) / 40, b = 34 + k * 11 + (fbm(a / 150 + seed * 2, k * 0.35 + seed) - 0.5) * 40;
      p.push(...(horiz ? [a, b] : [b, a]));
    }
    paths.push(pathD(simplify(p, 0.4)));
  }
  return `<svg class="land-frame land-frame--${horiz ? 'h' : 'v'}" aria-hidden="true" focusable="false" viewBox="0 0 ${horiz ? '600 96' : '96 600'}" preserveAspectRatio="none" fill="none"><path vector-effect="non-scaling-stroke" d="${paths.join('')}"/></svg>`;
}

/** A sparse row of young native trees standing along the approach band's bottom edge (the "natural recovery" idea). Decorative, never under the text. */
export function bandTrees(): string {
  const R = rng(515), d = [0, 2, 7, 4, 1, 6, 5, 0, 3, 4].map((t, i) => treeD(t, 70 + i * 118 + R() * 50, 60, TREE_H[t] * (0.85 + 0.25 * R()), (R() * 1e6) | 0, (R() - 0.5) * 0.1, 0)).join('');
  return `<svg class="band-trees" aria-hidden="true" focusable="false" viewBox="0 0 1200 62" fill="#6F9478" fill-opacity=".08" stroke="#6F9478" stroke-opacity=".7" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
}

/** Faint village scene (path, clearings) for the sand band. */
export function villageArt(): string {
  const R = rng(4242);
  const path: number[] = [];
  for (let i = 0; i <= 50; i++) { const t = i / 50; path.push(-10 + 520 * t, 380 - 250 * t * t * (3 - 2 * t) + (noise(t * 4, 3) - 0.5) * 70); }
  const branch: number[] = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; branch.push(250 + 180 * t, 270 + 120 * t * t + (noise(t * 3, 9) - 0.5) * 30); }
  const rings = [[110, 300, 46], [300, 150, 40], [430, 420, 52], [470, 110, 34]].map(([cx, cy, r], n) => {
    const q: number[] = [];
    for (let k = 0; k <= 36; k++) { const a = (k / 36) * Math.PI * 2, rr = r * (1 + 0.2 * (2 * noise(Math.cos(a) * 1.5 + n * 7, Math.sin(a) * 1.5) - 1)); q.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    return pathD(simplify(q, 0.5));
  });
  const houses = [[110, 300], [300, 150], [430, 420]].flatMap(([cx, cy]) => Array.from({ length: 6 }, () => { const x = Math.round(cx + (R() - 0.5) * 50), y = Math.round(cy + (R() - 0.5) * 40); return `M${x} ${y}h5v5h-5z`; }));
  const trees = [[40, 250, 8, 32], [175, 350, 10, 28], [235, 205, 0, 28], [372, 120, 10, 34], [395, 250, 5, 28], [330, 345, 1, 36], [250, 440, 8, 30], [480, 310, 4, 22], [190, 90, 3, 24], [60, 420, 10, 30], [345, 55, 7, 34]]
    .map(([x, y, t, h]) => treeD(t, x, y, h, x + y, 0, 0)).join('');
  return `<svg class="village-art" aria-hidden="true" focusable="false" viewBox="0 0 500 500" preserveAspectRatio="xMaxYMid meet" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${pathD(simplify(path, 0.6))}" stroke-width="5"/><path d="${pathD(simplify(branch, 0.6))}" stroke-width="3"/><path d="${rings.join('')}" stroke-width="1.5" stroke-dasharray="4 6"/><path d="${houses.join('')}" stroke-width="1.5"/><path d="${trees}" stroke-width="1.2"/></svg>`;
}

// ---- 28px glyphs, same hand as the hero: thin round strokes, slightly irregular -----------------------------
const G: Record<string, string> = {
  cost: 'M14 3.6c5.7 0 10.4 4.6 10.4 10.4S19.7 24.5 14 24.5 3.5 19.8 3.6 14 8.3 3.6 14 3.6zM14 8.2c3.3 0 5.9 2.6 5.9 5.8s-2.6 6-5.9 6-6.1-2.6-6-6 2.7-5.8 6-5.8zM14 11.6c1.4 0 2.4 1 2.4 2.4s-1 2.5-2.4 2.5-2.5-1.1-2.5-2.5 1.1-2.4 2.5-2.4zM14.4 13.8l9.6-2.4',
  care: 'M14 3.5c-3 4.4-7.2 8.2-7.2 12.5a7.2 7.2 0 0 0 14.4 0c0-4.3-4.2-8.1-7.2-12.5zM10.3 17.4a4 4 0 0 0 2.7 3.2',
  survival: 'M14 2.2v2.2M7.4 5l1.5 1.5M20.6 5l-1.5 1.5M5.6 10.6h2.1M20.3 10.6h2.1M14 13.8a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8zM4.5 25h19' + treeD(0, 19.5, 25, 12, 5, 0.03) + treeD(1, 8.5, 25, 11, 9),
  changes: 'M3.8 15.2c0-6 5-10.8 11-10.8s9.6 4.4 9.6 9.7-4.4 10-10 10S3.8 21.3 3.8 15.2zM8.4 14.8c0-3.7 3-6.3 6.8-6.3s5.8 2.7 5.8 5.8-2.6 6.2-6.1 6.2-6.5-2.3-6.5-5.7zM12.6 14.4c0-1.4 1-2.4 2.4-2.4s2.2 1 2.2 2.3-1 2.4-2.3 2.4-2.3-1-2.3-2.3z',
  homes: 'M3.5 14.2L14 4.8l10.5 9.4M6.8 12.2v11.3h14.4V12.2M12 23.5v-6.2h4v6.2',
  food: 'M14 8.6c-2-2.2-7.2-1.6-7.2 4.4 0 5.6 3.7 10.4 7.2 8.8 3.5 1.6 7.2-3.2 7.2-8.8 0-6-5.2-6.6-7.2-4.4zM14 8.6c0-2.2.9-3.7 2.6-4.6M14.6 6.4c1.2-1.6 3.2-1.9 4.6-1.4-.4 1.7-2.2 2.6-4.6 1.4z',
  water: 'M3.5 9.4c2.6-2.8 4.1 2.8 7 0s4.1 2.8 7 0 4.1 2.8 7 0M3.5 15.4c2.6-2.8 4.1 2.8 7 0s4.1 2.8 7 0 4.1 2.8 7 0M3.5 21.4c2.6-2.8 4.1 2.8 7 0s4.1 2.8 7 0 4.1 2.8 7 0',
  energy: 'M5.2 23l3.6-9.6h14.6L19.8 23zM6.6 18.8h14.4M13.6 13.4L12 23M17.8 13.4l1.2 9.6M7.4 9.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4zM7.4 1.4v.8M2.2 6.5h.8M12 6.5h.8M3.8 2.9l.6.6M11 2.9l-.6.6',
  connectivity: 'M8.6 16.6a7.8 7.8 0 0 1 10.8 0M4.8 12.8a13 13 0 0 1 18.4 0M11.4 19.4a3.8 3.8 0 0 1 5.2 0M14 23.2v.1',
  community: 'M3.5 25h21M5.8 24.8v-3M5.8 19.8a1.1 1.1 0 1 0 0-.1M22.2 24.8v-3M22.2 19.8a1.1 1.1 0 1 0 0-.1' + treeD(4, 14, 25, 18, 4),
  learning: 'M3.8 20.6c3-1.2 7-1.2 10.2.7 3.2-1.9 7.2-1.9 10.2-.7v5.4c-3-1.2-7-1.2-10.2.7-3.2-1.9-7.2-1.9-10.2-.7zM14 21.3v5.4' + treeD(0, 14, 21, 17, 6),
};
const GLYPH_BY_TERM: Record<string, string> = { cost: 'cost', care: 'care', survival: 'survival', 'changes in the land': 'changes', homes: 'homes', food: 'food', water: 'water', energy: 'energy', connectivity: 'connectivity', community: 'community', learning: 'learning' };

/** A 28px line glyph for a term (by its text), or '' if there is none. */
export function glyphFor(term: string): string {
  const k = GLYPH_BY_TERM[term.trim().toLowerCase()];
  return k ? `<svg class="glyph" viewBox="0 0 28 28" width="28" height="28" aria-hidden="true" focusable="false"><path d="${G[k]}"/></svg>` : '';
}
