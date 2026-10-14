// Named figures for journal posts: `::: figure <name>` in Markdown. Static inline SVG / HTML, built with the site.
// Numbers about our pilot come from src/data/pilot.ts, so the post stays in step with the pilot page.
import { treeD } from '../art/trees.ts';
import { esc } from '../lib/html.ts';
import { plots, plotsM2, totalSaplings, n0 } from '../data/pilot.ts';

const f = (n: number) => String(Math.round(n * 10) / 10);
const svgOpen = (vb: string, title: string, cls = '') =>
  `<svg class="mfig-svg ${cls}" viewBox="${vb}" role="img" aria-label="${esc(title)}" xmlns="http://www.w3.org/2000/svg"><title>${esc(title)}</title>`;
const tree = (ty: number, x: number, y: number, h: number, seed = 1, cls = 'mfig-tree') => `<path class="${cls}" d="${treeD(ty, x, y, h, seed, 0, 1)}"/>`;
const round = (n: number, step: number) => Math.round(n / step) * step;

/* ---------- 1. six steps ---------- */

const STEP_ICONS: string[] = [
  // survey: hill, two trees, dashed circle
  `<circle class="mfig-dash" cx="24" cy="24" r="20"/><path d="M5 38Q18 20 30 30T44 34"/>${tree(0, 16, 29, 14, 3)}${tree(9, 33, 33, 12, 5)}`,
  // choose: four silhouettes of different heights
  `${tree(9, 8, 45, 40, 2)}${tree(0, 19, 45, 30, 4)}${tree(7, 31, 45, 22, 6)}${tree(3, 41, 45, 14, 8)}`,
  // soil: a spade over soil lines
  `<path d="M24 3v22M18 3h12M18 25h12v7q-6 6-12 0z"/><path d="M3 40h42M8 45h32"/>`,
  // plant: dots in a square
  `<rect x="5" y="5" width="38" height="38" rx="2"/>${[[12, 13], [24, 13], [36, 13], [18, 24], [30, 24], [12, 35], [24, 35], [36, 35]].map(([x, y]) => `<circle class="mfig-fill" cx="${x}" cy="${y}" r="2.6"/>`).join('')}`,
  // stake and mulch
  `<path d="M3 36h42"/>${tree(0, 20, 36, 26, 7)}<path d="M31 42V12M31 20l-5 1"/><path d="M5 40l3-2M12 41l3-2M19 40l3-2M26 41l3-2M35 40l3-2M41 41l3-2"/>`,
  // care: three bars shrinking
  `<rect x="5" y="9" width="38" height="7" rx="1"/><rect x="5" y="21" width="24" height="7" rx="1"/><rect x="5" y="33" width="9" height="7" rx="1"/>`,
];
const STEPS: [string, string][] = [
  ['Survey', 'Find what grows wild within about 20 km.'],
  ['Choose', '20 to 40 native species, four layers.'],
  ['Soil', 'Loosen 60–100 cm deep and feed it.'],
  ['Plant', 'About 3 per m², mixed, never two alike side by side.'],
  ['Stake and mulch', 'A stake for each sapling, straw over the ground.'],
  ['Care, then let go', 'Water for three years, then leave it.'],
];
function steps(): string {
  return `<ol class="mfig-steps">${STEPS.map(([t, b], i) => `<li><span class="mfig-n">${i + 1}</span><svg class="mfig-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${STEP_ICONS[i]}</svg><strong>${esc(t)}</strong><span>${esc(b)}</span></li>`).join('')}</ol>`;
}

/* ---------- 2. four layers ---------- */

const LAYERS = [
  { name: 'Canopy', range: '12–20 m+', share: 0.4, note: 'the top of the forest' },
  { name: 'Sub-canopy', range: '6–12 m', share: 0.3, note: 'shade under the top' },
  { name: 'Understorey', range: '3–6 m', share: 0.2, note: 'flowers, fruit, birds' },
  { name: 'Shrubs', range: '1–3 m', share: 0.1, note: 'cover near the ground' },
];
const layerCounts = LAYERS.map((l) => Math.round(totalSaplings * l.share));
if (Math.abs(LAYERS.reduce((s, l) => s + l.share, 0) - 1) > 1e-9 || layerCounts.reduce((s, n) => s + n, 0) !== totalSaplings)
  throw new Error('figures.ts: layer shares must sum to 100% and the layer counts to the pilot sapling total.');

function layers(): string {
  const PX = 26, AX = 60, G = 20 * PX + 10; // px per metre, axis x, ground line
  const y = (m: number) => G - m * PX;
  const ticks: [number, string][] = [[0, '0'], [3, '3 m'], [6, '6 m'], [12, '12 m'], [20, '20 m+']];
  const tops = [20, 12, 6, 3];
  const trees = [
    tree(1, 150, G, 15 * PX, 11), // canopy
    tree(7, 96, G, 10 * PX, 4), // sub-canopy
    tree(7, 200, G, 8.2 * PX, 6),
    tree(6, 122, G, 4.6 * PX, 9), // understorey
    tree(5, 178, G, 3.4 * PX, 12),
    tree(0, 80, G, 1.9 * PX, 14), // shrubs
    tree(4, 140, G, 1.4 * PX, 15),
    tree(0, 160, G, 1.8 * PX, 17),
    tree(5, 208, G, 1.5 * PX, 19),
  ].join('');
  const label = (i: number) => {
    const t = y(tops[i]) + 20;
    const sh = LAYERS[i];
    return `<text class="mfig-t mfig-tb" x="230" y="${f(t)}">${sh.name} · ${Math.round(sh.share * 100)}%</text><text class="mfig-t" x="230" y="${f(t + 20)}">${sh.range}</text><text class="mfig-t mfig-ts" x="230" y="${f(t + 40)}">${sh.note}</text>`;
  };
  const bands = tops.map((m) => `<line class="mfig-band" x1="${AX}" y1="${y(m)}" x2="400" y2="${y(m)}"/>`).join('');
  const bar = `<div class="mfig-bar" role="img" aria-label="Share of saplings by layer: ${LAYERS.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}">${LAYERS.map((l, i) => `<span class="mfig-l${i + 1}" style="flex-basis:${l.share * 100}%"></span>`).join('')}</div>`;
  return `${svgOpen(`0 0 400 ${G + 20}`, 'Side view of a forest in four layers: canopy, sub-canopy, understorey and shrubs, with their heights.', 'mfig-svg--layers')}
<line class="mfig-axis" x1="${AX}" y1="${y(20)}" x2="${AX}" y2="${G}"/>
${ticks.map(([m, t]) => `<line class="mfig-axis" x1="${AX - 6}" y1="${y(m)}" x2="${AX}" y2="${y(m)}"/><text class="mfig-t mfig-ts" x="${AX - 9}" y="${y(m) + 5}" text-anchor="end">${t}</text>`).join('')}
${bands}<line class="mfig-ground" x1="${AX}" y1="${G}" x2="400" y2="${G}"/>
${trees}
${LAYERS.map((_, i) => label(i)).join('')}
</svg>
<div class="mfig-legend">${bar}<ul>${LAYERS.map((l, i) => `<li><i class="mfig-sw mfig-l${i + 1}"></i><span>${l.name}</span><b>${Math.round(l.share * 100)}%</b></li>`).join('')}</ul><p class="mfig-line">In our pilot: <b>${layerCounts.map(n0).join(' · ')}</b></p></div>`;
}

/* ---------- 3. soil cross-section ---------- */

export const ADDITIVES = [
  { name: 'Husk or straw', lo: 4, hi: 5, why: 'keeps air in the soil' },
  { name: 'Coco peat or biochar', lo: 4, hi: 5, why: 'holds water' },
  { name: 'Compost or old manure', lo: 3, hi: 5, why: 'slow food' },
  { name: 'Leaf mould or neem cake', lo: 0.5, hi: 1, why: 'keeps pests down' },
];
const addLo = ADDITIVES.reduce((s, a) => s + a.lo, 0); // 11.5 kg per m²
const addHi = ADDITIVES.reduce((s, a) => s + a.hi, 0); // 16
const range = (lo: number, hi: number) => (lo === hi ? String(lo) : `${lo}–${hi}`);

function soil(): string {
  const GY = 165, CM = 1.5; // old ground level y, px per cm
  const x0 = 192, x1 = 396, mid = (x0 + x1) / 2;
  const mound = 22; // 15 cm
  const top = GY - mound; // soil surface at the top of the mound
  const mt = top - 20; // top of the mulch
  const surf = `M${x0} ${GY}C${x0 + 40} ${GY} ${mid - 50} ${top} ${mid} ${top}S${x1 - 40} ${GY} ${x1} ${GY}`;
  const deep = GY + 100 * CM, sub = deep + 62;
  const xs = [x0 + 50, mid, x1 - 50];
  const roots = xs.map((x) => `<path class="mfig-root" d="M${x} ${top - 6}V${GY + 82}M${x} ${GY + 22}l-9 12M${x} ${GY + 44}l9 12"/>`).join('');
  const trees = xs.map((x, i) => tree(i == 1 ? 0 : 7, x, top - 4, 34, 20 + i)).join('');
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const stipple = Array.from({ length: 90 }, () => `M${f(x0 + 8 + rnd() * (x1 - x0 - 16))} ${f(GY + 10 + rnd() * (deep - GY - 20))}h.1`).join('');
  const mulch = Array.from({ length: 14 }, (_, i) => {
    const px = x0 + 12 + i * 14;
    const u = px < mid ? (mid - px) / (mid - x0) : (px - mid) / (x1 - mid);
    const sy = top + (GY - top) * Math.pow(u, 2) - 1;
    return `M${f(px)} ${f(sy)}l5 -${f(18 - 6 * u)}`;
  }).join('');
  const br = (a: number, b: number) => `M164 ${a}H170V${b}H164`;
  return `${svgOpen('0 0 400 400', 'Cross-section of the planting bed: mulch, a low mound, loosened soil 60 to 100 cm deep with roots going down, and hard subsoil below.', 'mfig-svg--soil')}
<rect class="mfig-sub" x="${x0}" y="${deep}" width="${x1 - x0}" height="${sub - deep}"/>
<path class="mfig-soil" d="${surf}V${deep}H${x0}Z"/>
<path class="mfig-stip" d="${stipple}"/>
<line class="mfig-ground mfig-old" x1="${x0}" y1="${GY}" x2="${x1}" y2="${GY}"/>
<line class="mfig-ground" x1="${x0}" y1="${deep}" x2="${x1}" y2="${deep}"/>
<path class="mfig-line-d" d="${mulch}"/>
${roots}${trees}
<g class="mfig-br"><path d="${br(mt, top)}M164 ${top}H170V${GY}H164M164 ${GY}H170V${deep}H164M164 ${deep}H170V${sub}H164"/></g>
<text class="mfig-t mfig-tb" x="158" y="${mt - 24}" text-anchor="end">Mulch</text><text class="mfig-t" x="158" y="${mt - 5}" text-anchor="end">10–15 cm</text>
<text class="mfig-t mfig-tb" x="158" y="${top + 6}" text-anchor="end">Low mound</text><text class="mfig-t" x="158" y="${top + 25}" text-anchor="end">15 cm high</text>
<text class="mfig-t mfig-ts" x="158" y="${GY + 26}" text-anchor="end">old ground level</text>
<text class="mfig-t mfig-tb" x="158" y="${f(GY + 66)}" text-anchor="end">Loosened,</text><text class="mfig-t mfig-tb" x="158" y="${f(GY + 86)}" text-anchor="end">enriched soil</text><text class="mfig-t" x="158" y="${f(GY + 106)}" text-anchor="end">60–100 cm</text>
<text class="mfig-t mfig-tb" x="158" y="${f(deep + 36)}" text-anchor="end">Hard subsoil</text>
</svg>
<div class="mfig-key"><p class="mfig-keyh">Mixed in, per m²</p><ul>${ADDITIVES.map((a) => `<li><span class="mfig-k1">${a.name}</span><b>${range(a.lo, a.hi)} kg</b><span class="mfig-k3">${a.why}</span></li>`).join('')}</ul></div>`;
}

/* ---------- 4. planting pattern: 4 m x 2 m patch, the pilot's 3 per m² field layout ---------- */

const PB = plots[1]; // 3 per m²: rows 0.5 m, trees 0.67 m, every second row shifted 0.33 m
const PW = 4, PH = 2; // m
const patchTrees: [number, number][] = [];
for (let r = 0; r < Math.round(PH / PB.rowM); r++) {
  const y = (r + 0.5) * PB.rowM;
  const x0 = PB.inRowM / 4 + (r % 2 ? 0 : PB.shiftM); // inset a quarter step so no tree sits on the patch edge
  for (let k = 0; x0 + k * PB.inRowM < PW - 1e-6; k++) patchTrees.push([x0 + k * PB.inRowM, y]);
}
if (patchTrees.length !== 24 || patchTrees.length !== Math.round(PW * PH * PB.perM2))
  throw new Error(`figures.ts: the pattern patch holds ${patchTrees.length} saplings, expected 24.`);
// Layer of each sapling (0 canopy, 1 sub-canopy, 2 understorey, 3 shrub), row by row. 10 / 7 / 5 / 2.
const PATTERN = [2, 0, 1, 2, 0, 0, 0, 1, 3, 0, 1, 1, 2, 0, 1, 3, 2, 0, 0, 1, 2, 0, 0, 1];
const PBOX = [0.1, 1.1, 0.5, 1.5]; // a 1 m² box holding exactly three trees
{
  const counts = [0, 0, 0, 0];
  PATTERN.forEach((l) => counts[l]++);
  if (PATTERN.length !== 24 || counts.join() !== '10,7,5,2') throw new Error(`figures.ts: pattern layer counts ${counts} must be 10,7,5,2.`);
  // no two nearest neighbours (the diagonal pairs, about 0.60 m) share a layer
  let same = 0, inRowSame = 0;
  for (let i = 0; i < 24; i++) for (let j = i + 1; j < 24; j++) {
    const d = Math.hypot(patchTrees[i][0] - patchTrees[j][0], patchTrees[i][1] - patchTrees[j][1]);
    if (PATTERN[i] === PATTERN[j]) { if (d < PB.nearestM + 0.01) same++; else if (d < 0.7) inRowSame++; }
  }
  if (same) throw new Error(`figures.ts: ${same} nearest-neighbour pairs share a layer in the pattern figure.`);
  void inRowSame; // the 0.67 m in-row pairs: 40% canopy cannot avoid a few; the nearest (0.60 m) pairs never match
  const [bx0, bx1, by0, by1] = PBOX;
  const inside = patchTrees.filter(([x, y]) => x > bx0 && x < bx1 && y > by0 && y < by1).length;
  const edge = patchTrees.filter(([x, y]) => x >= bx0 - 1e-6 && x <= bx1 + 1e-6 && y >= by0 - 1e-6 && y <= by1 + 1e-6).length;
  if (inside !== 3 || edge !== 3) throw new Error(`figures.ts: the 1 m² box holds ${inside} saplings (${edge} with border), expected 3.`);
}

function pattern(): string {
  const S = 70, ox = 106, oy = 52; // px per metre, patch origin
  const px = (m: number) => f(ox + m * S), py = (m: number) => f(oy + m * S);
  const shape = (l: number, x: number, y: number) => {
    const cx = ox + x * S, cy = oy + y * S;
    if (l === 0) return `<circle class="mfig-m mfig-l1" cx="${f(cx)}" cy="${f(cy)}" r="11.5"/>`;
    if (l === 1) return `<circle class="mfig-m mfig-l2" cx="${f(cx)}" cy="${f(cy)}" r="9.5"/><circle class="mfig-dotc" cx="${f(cx)}" cy="${f(cy)}" r="2.6"/>`;
    if (l === 2) return `<path class="mfig-m mfig-l3" d="M${f(cx)} ${f(cy - 10)}L${f(cx + 9.5)} ${f(cy + 7)}H${f(cx - 9.5)}Z"/>`;
    return `<rect class="mfig-m mfig-l4" x="${f(cx - 6)}" y="${f(cy - 6)}" width="12" height="12"/>`;
  };
  const [bx0, bx1, by0, by1] = PBOX;
  const t0 = patchTrees[0], t1 = patchTrees[1];
  const legendShape = (l: number) =>
    `<svg viewBox="-12 -12 24 24" aria-hidden="true" focusable="false">${
      [
        '<circle class="mfig-m mfig-l1" r="10"/>',
        '<circle class="mfig-m mfig-l2" r="10"/><circle class="mfig-dotc" r="2.6"/>',
        '<path class="mfig-m mfig-l3" d="M0 -10L10 8H-10Z"/>',
        '<rect class="mfig-m mfig-l4" x="-7" y="-7" width="14" height="14"/>',
      ][l]
    }</svg>`;
  return `${svgOpen(`0 0 400 ${oy + PH * S + 66}`, 'Top view of a 4 m by 2 m patch with 24 saplings in four layers, rows 0.50 m apart and trees 0.67 m apart in a row.', 'mfig-svg--pattern')}
<rect class="mfig-patch" x="${ox}" y="${oy}" width="${PW * S}" height="${PH * S}"/>
${Array.from({ length: Math.round(PH / PB.rowM) }, (_, r) => `<line class="mfig-string" x1="${ox}" y1="${py((r + 0.5) * PB.rowM)}" x2="${ox + PW * S}" y2="${py((r + 0.5) * PB.rowM)}"/>`).join('')}
<rect class="mfig-box" x="${px(bx0)}" y="${py(by0)}" width="${f((bx1 - bx0) * S)}" height="${f((by1 - by0) * S)}"/>
${patchTrees.map(([x, y], i) => shape(PATTERN[i], x, y)).join('')}
<g class="mfig-dim"><line x1="${px(t0[0])}" y1="30" x2="${px(t1[0])}" y2="30"/><line x1="${px(t0[0])}" y1="24" x2="${px(t0[0])}" y2="36"/><line x1="${px(t1[0])}" y1="24" x2="${px(t1[0])}" y2="36"/></g>
<text class="mfig-t mfig-tb" x="${f((ox + t0[0] * S + ox + t1[0] * S) / 2)}" y="19" text-anchor="middle">0.67 m</text>
<g class="mfig-dim"><line x1="${ox - 30}" y1="${py(0.25)}" x2="${ox - 30}" y2="${py(0.75)}"/><line x1="${ox - 36}" y1="${py(0.25)}" x2="${ox - 24}" y2="${py(0.25)}"/><line x1="${ox - 36}" y1="${py(0.75)}" x2="${ox - 24}" y2="${py(0.75)}"/></g>
<text class="mfig-t mfig-tb" x="${ox - 42}" y="${f(oy + 0.5 * S + 5)}" text-anchor="end">0.50 m</text>
<rect class="mfig-key-box" x="${ox}" y="${oy + PH * S + 22}" width="16" height="16"/><text class="mfig-t mfig-tl" x="${ox + 26}" y="${oy + PH * S + 36}">1 m² box · 3 per m²</text>
</svg>
<ul class="mfig-shapes">${['Canopy', 'Sub-canopy', 'Understorey', 'Shrub'].map((n, i) => `<li>${legendShape(i)}<span>${n}</span><b>${PATTERN.filter((l) => l === i).length}</b></li>`).join('')}</ul>`;
}

/* ---------- 5. care timeline ---------- */

function care(): string {
  const stages: [string, string, number][] = [
    ['Year 1', 'Water every day, about 5 litres per m². Weed by hand. Keep the mulch on.', 18],
    ['Year 2', 'Water 2–3 times a week in dry spells. Top up thin mulch.', 11],
    ['Year 3', 'Water only in an emergency. Watch how it grows.', 5],
    ['After', 'Leave it. No water, no fertiliser, no pruning. Leaves stay where they fall.', 0],
  ];
  return `<ol class="mfig-care">${stages.map(([t, b, h]) => `<li><span class="mfig-water" style="--h:${h}px" aria-hidden="true"></span><strong>${t}</strong><span>${esc(b)}</span></li>`).join('')}</ol>
<p class="mfig-ours"><b>On our land</b><span>Every dry season: clear the firebreaks.</span></p>`;
}

/* ---------- 6. at our scale (all from the pilot's planted area and sapling count) ---------- */

function scale(): string {
  const tonnes = [round(plotsM2 * addLo / 1000, 1), round(plotsM2 * addHi / 1000, 1)];
  const mulch = [round(plotsM2 * 0.1, 10), round(plotsM2 * 0.15, 10)];
  const water = round(plotsM2 * 5, 1000);
  const tiles: [string, string][] = [
    [n0(totalSaplings), 'saplings'],
    [n0(totalSaplings), 'stakes'],
    [`${n0(tonnes[0])}–${n0(tonnes[1])}`, `tonnes of soil additives (${addLo}–${addHi} kg per m²)`],
    [`${n0(mulch[0])}–${n0(mulch[1])}`, 'm³ of mulch (10–15 cm deep)'],
    [n0(water), 'litres of water a day, in the first year (5 L per m²)'],
  ];
  return `<ul class="mfig-tiles">${tiles.map(([n, l]) => `<li><b>${n}</b><span>${esc(l)}</span></li>`).join('')}</ul>`;
}

/* ---------- 7. where we differ ---------- */

function differ(): string {
  const rows: [string, string][] = [
    ['About 3 per m².', 'Test 2, 3 and 4 per m² side by side.'],
    ['Example trees such as oak, ash and beech.', 'Native trees of this part of Cambodia.'],
    ['10–15 cm of dry mulch over everything.', 'Rethink it. Dry mulch can carry a fire. Ask about thinner layers, other materials and wider firebreaks.'],
    ['After three years, leave it alone. Never prune.', 'Clear firebreaks every year. Maybe a small trial of moving young trees out of the densest plot.'],
    ['Grows 10× faster, 30× denser, 100× more life.', 'Not measured here yet. We will publish our own numbers.'],
  ];
  return `<div class="mfig-cmp"><p class="mfig-cmph" aria-hidden="true"><span>The guides</span><span>Our plan</span></p>${rows.map(([g, o]) => `<div class="mfig-row"><p class="mfig-g"><span class="mfig-h">The guides</span>${esc(g)}</p><p class="mfig-o"><span class="mfig-h">Our plan</span>${esc(o)}</p></div>`).join('')}</div>`;
}

export const FIGURES: Record<string, () => string> = {
  'miyawaki-steps': steps,
  'miyawaki-layers': layers,
  'miyawaki-soil': soil,
  'miyawaki-pattern': pattern,
  'miyawaki-care': care,
  'miyawaki-scale': scale,
  'miyawaki-differ': differ,
};

export function renderFigure(name: string, captionHtml: string): string {
  const fn = FIGURES[name];
  if (!fn) throw new Error(`Unknown figure "${name}". Known figures: ${Object.keys(FIGURES).join(', ')}`);
  return `<figure class="mfig mfig--${name.replace(/^miyawaki-/, '')}">${fn()}${captionHtml ? `<figcaption>${captionHtml}</figcaption>` : ''}</figure>\n`;
}
