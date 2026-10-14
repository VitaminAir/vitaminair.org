import { esc, label } from '../lib/html.ts';
import { layout, type BuildInfo } from './layout.ts';
import { pageStage, type HeroScene } from './stage.ts';
import { divider } from './art.ts';
import {
  plots, plotW, plotL, accessY, accessH, plotM2, plotHa, totalSaplings, totalCost, remainingHa, fieldTrees, BOXES, PATCH_W, PATCH_H, wholeTotal, wholeExtraPct, diagonalM,
  SITE_SIDE_M, BUFFER_M, TRACK_M, DOT_R_M, PLANTED_HA, PRICE_USD, n0, dp, type Plot,
} from '../data/pilot.ts';

const f = (n: number) => String(Math.round(n * 100) / 100);
const wTxt = dp(plotW, 1);
const lTxt = dp(plotL, 1);
const usd = (n: number) => `$${n0(n)}`;
const sw = (k: string) => `<span class="pilot-sw pilot-sw--${k}" aria-hidden="true"></span>`;

/* ---------- section 3: the planting layout (SVG, metres) ---------- */

function plotG(p: Plot): string {
  const plateW = 25.4, plateH = 25;
  const ox = p.x + (plotW - plateW) / 2, oy = p.y + (plotL - plateH) / 2;
  const cx = p.x + plotW / 2;
  const box = `x="${f(p.x)}" y="${f(p.y)}" width="${f(plotW)}" height="${f(plotL)}"`;
  return `<g class="pilot-plot pilot-plot-${p.key}">
<rect class="pilot-fill" ${box}/>
<rect fill="url(#pilot-dots-${p.key})" ${box}/>
<rect class="pilot-edge" ${box}/>
<rect class="pilot-plate" x="${f(ox)}" y="${f(oy)}" width="${plateW}" height="${plateH}" rx="0.6"/>
<text class="pilot-t-letter" x="${f(cx)}" y="${f(oy + 9.6)}" text-anchor="middle">${p.letter}</text>
<text class="pilot-t-line pilot-t-strong" x="${f(cx)}" y="${f(oy + 16.4)}" text-anchor="middle">${n0(p.perHa)}/ha</text>
<text class="pilot-t-line" x="${f(cx)}" y="${f(oy + 22.2)}" text-anchor="middle">${n0(p.saplings)}</text>
</g>`;
}

function layoutSvg(): string {
  const S = SITE_SIDE_M, B = BUFFER_M, inner = S - 2 * B;
  // field layout, same as the marking-out drawings: tile = in-row spacing x row pair; dots at the corners (drawn four times so tile seams stay clean)
  const defs = plots
    .map((p) => {
      const w = p.inRowM, h = p.shiftM ? p.rowM * 2 : p.rowM;
      const pts: [number, number][] = [[0, 0], [w, 0], [0, h], [w, h]];
      if (p.shiftM) pts.push([p.shiftM, p.rowM]);
      const dots = pts.map(([x, y]) => `<circle class="pilot-dot" cx="${x}" cy="${y}" r="${DOT_R_M}"/>`).join('');
      return `<pattern id="pilot-dots-${p.key}" patternUnits="userSpaceOnUse" x="${f(p.x)}" y="${f(p.y)}" width="${w}" height="${h}">${dots}</pattern>`;
    })
    .join('\n');
  const last = plots[plots.length - 1];
  const right = last.x + plotW;
  const trackXs = plots.slice(0, -1).map((p) => p.x + plotW + TRACK_M / 2);
  return `<svg class="pilot-svg" viewBox="-12 -10 124 120" role="img" aria-labelledby="pilot-svg-t pilot-svg-d" xmlns="http://www.w3.org/2000/svg">
<title id="pilot-svg-t">Conceptual layout of the planting pilot</title>
<desc id="pilot-svg-d">A square site of about 100 m by 100 m. Three strip plots, A, B and C, each ${wTxt} m wide and ${lTxt} m long, stand side by side at ${plots.map((p) => n0(p.perHa)).join(', ')} saplings per hectare. A ${B} m firebreak and buffer runs round the edge, ${TRACK_M} m access tracks run between the plots, and an access strip runs along one end.</desc>
<defs>
<pattern id="pilot-hatch" patternUnits="userSpaceOnUse" width="2.4" height="2.4" patternTransform="rotate(45)"><rect width="2.4" height="2.4" fill="var(--paper-2)"/><line x1="0" y1="0" x2="0" y2="2.4" class="pilot-hatch-l"/></pattern>
${defs}
</defs>
<rect x="0" y="0" width="${S}" height="${S}" fill="url(#pilot-hatch)"/>
<rect x="${B}" y="${B}" width="${inner}" height="${inner}" class="pilot-sand"/>
${trackXs.map((x) => `<line class="pilot-centre" x1="${f(x)}" y1="${B}" x2="${f(x)}" y2="${S - B}"/>`).join('\n')}
<line class="pilot-centre" x1="${B}" y1="${f(accessY + accessH / 2)}" x2="${S - B}" y2="${f(accessY + accessH / 2)}"/>
${plots.map(plotG).join('\n')}
<rect class="pilot-site" x="0" y="0" width="${S}" height="${S}"/>
<text class="pilot-t-small" x="${S / 2}" y="${B / 2 + 1.1}" text-anchor="middle">${B} m buffer and firebreak</text>
<text class="pilot-t-small" x="${S / 2}" y="${f(accessY + accessH / 2 + 1.1)}" text-anchor="middle">Access strip</text>
<g class="pilot-dim">
<line x1="${B}" y1="-3.5" x2="${f(B + plotW)}" y2="-3.5"/><line x1="${B}" y1="-4.8" x2="${B}" y2="-2.2"/><line x1="${f(B + plotW)}" y1="-4.8" x2="${f(B + plotW)}" y2="-2.2"/>
<text x="${f(B + plotW / 2)}" y="-5.6" text-anchor="middle">${wTxt} m</text>
<line x1="${f(right + 4)}" y1="${B}" x2="${f(right + 4)}" y2="${f(B + plotL)}"/><line x1="${f(right + 2.7)}" y1="${B}" x2="${f(right + 5.3)}" y2="${B}"/><line x1="${f(right + 2.7)}" y1="${f(B + plotL)}" x2="${f(right + 5.3)}" y2="${f(B + plotL)}"/>
<text x="${f(right + 9.6)}" y="${f(B + plotL / 2)}" text-anchor="middle" transform="rotate(-90 ${f(right + 9.6)} ${f(B + plotL / 2)})">${lTxt} m</text>
<line x1="-3.5" y1="0" x2="-3.5" y2="${S}"/><line x1="-4.8" y1="0" x2="-2.2" y2="0"/><line x1="-4.8" y1="${S}" x2="-2.2" y2="${S}"/>
<text x="-6" y="${S / 2}" text-anchor="middle" transform="rotate(-90 -6 ${S / 2})">≈${S} m</text>
</g>
<text class="pilot-t-small pilot-t-note" x="${S / 2}" y="106.5" text-anchor="middle">No compass: the orientation is not known.</text>
</svg>`;
}

function keyItem(p: Plot): string {
  return `<li class="pilot-key-item pilot-key-${p.key}" tabindex="0">
<h3>${sw(p.key)}<span>Plot ${p.letter}</span></h3>
<dl>
<div><dt>Density</dt><dd>${n0(p.perHa)} trees/ha</dd></div>
<div><dt>Area</dt><dd>${dp(plotHa, 4)} ha · ${n0(plotM2)} m²</dd></div>
<div><dt>Size</dt><dd>${wTxt} m × ${lTxt} m</dd></div>
<div><dt>Saplings</dt><dd>${n0(p.saplings)}</dd></div>
<div><dt>Spacing</dt><dd>${dp(p.spacing, 2)} m</dd></div>
</dl>
</li>`;
}

/* ---------- section 4b: marking out the plots (SVG in centimetres, y runs down from the plot corner) ---------- */

const cm = (m: number) => f(m * 100);
const dim2 = (m: number) => dp(m, 2);

function plate(cx: number, cy: number, text: string, cls = '', anchor: 'middle' | 'start' = 'middle'): string {
  const w = text.length * 11.5 + 14;
  const x = anchor === 'middle' ? cx - w / 2 : cx - 7;
  return `<rect class="pilot-mo-plate" x="${f(x)}" y="${f(cy - 21)}" width="${f(w)}" height="30" rx="3"/><text class="pilot-mo-t ${cls}" x="${f(anchor === 'middle' ? cx : cx)}" y="${f(cy)}" text-anchor="${anchor}">${esc(text)}</text>`;
}

function markSvg(p: Plot): string {
  const W = PATCH_W * 100, H = PATCH_H * 100, row = p.rowM * 100, inRow = p.inRowM * 100, sh = p.shiftM * 100;
  const trees = fieldTrees(p, PATCH_W, PATCH_H);
  const rowsN = Math.floor(PATCH_H / p.rowM + 1e-9) + 1;
  const strings = Array.from({ length: rowsN }, (_, r) => `<line class="pilot-mo-string" x1="0" y1="${f(r * row)}" x2="${W}" y2="${f(r * row)}"/>`).join('');
  const dots = trees.map(([x, y]) => `<circle class="pilot-dot pilot-mo-dot" cx="${cm(x)}" cy="${cm(y)}" r="7"/>`).join('');
  const [bx0, bx1, by0, by1] = BOXES[p.key];
  const boxLabel = `1 m² = ${p.perM2} ${p.perM2 === 1 ? 'tree' : 'trees'}`;
  // nearest-neighbour pair, away from the corner dimensions
  const nn = p.key === 'a' ? [[2, 1], [2.5, 1.5]] : p.key === 'b' ? [[2, 1], [2 + 1 / 3, 1.5]] : null;
  const nnSvg = nn
    ? `<line class="pilot-mo-nn" x1="${cm(nn[0][0])}" y1="${cm(nn[0][1])}" x2="${cm(nn[1][0])}" y2="${cm(nn[1][1])}"/>${plate(nn[1][0] * 100 + 16, nn[1][1] * 100 - 14, `${dim2(p.nearestM)} m`, '', 'start')}`
    : '';
  const shiftSvg = sh
    ? `<line class="pilot-mo-ext" x1="${f(sh)}" y1="-35" x2="${f(sh)}" y2="${f(row - 7)}"/><line class="pilot-mo-ext" x1="0" y1="-35" x2="0" y2="-9"/>
<line class="pilot-mo-dim" x1="0" y1="-35" x2="${f(sh)}" y2="-35"/><line class="pilot-mo-dim" x1="0" y1="-41" x2="0" y2="-29"/><line class="pilot-mo-dim" x1="${f(sh)}" y1="-41" x2="${f(sh)}" y2="-29"/>
${plate(sh + 18, -28, `shift ${dim2(p.shiftM)} m`, '', 'start')}`
    : '';
  return `<svg class="pilot-mo-svg" viewBox="-130 -120 490 425" role="img" aria-labelledby="pilot-mo-${p.key}-t" xmlns="http://www.w3.org/2000/svg">
<title id="pilot-mo-${p.key}-t">Plot ${p.letter}: a 3 m by 2.5 m corner patch with rows every ${dim2(p.rowM)} m and trees every ${dim2(p.inRowM)} m in a row${sh ? `, every second row shifted ${dim2(p.shiftM)} m` : ''}. A 1 m² box holds ${p.perM2} ${p.perM2 === 1 ? 'tree' : 'trees'}.</title>
<rect class="pilot-mo-fill pilot-mo-fill-${p.key}" x="0" y="0" width="${W}" height="${H}"/>
${strings}
<line class="pilot-mo-fade" x1="0" y1="${H}" x2="${W}" y2="${H}"/><line class="pilot-mo-fade" x1="${W}" y1="0" x2="${W}" y2="${H}"/>
<rect class="pilot-mo-box" x="${cm(bx0)}" y="${cm(by0)}" width="${cm(bx1 - bx0)}" height="${cm(by1 - by0)}"/>
${dots}
<line class="pilot-mo-edge" x1="0" y1="0" x2="0" y2="${H}"/><line class="pilot-mo-edge" x1="0" y1="0" x2="${W}" y2="0"/>
<rect class="pilot-mo-peg" x="-8" y="-8" width="16" height="16"/>
<text class="pilot-mo-t pilot-mo-t--soft" x="-18" y="-16" text-anchor="end">Corner</text>
<text class="pilot-mo-t pilot-mo-t--soft" x="${W}" y="-12" text-anchor="end">Plot edge</text>
<text class="pilot-mo-t pilot-mo-t--soft" x="-14" y="${H - 15}" transform="rotate(-90 -14 ${H - 15})">Plot edge</text>
<line class="pilot-mo-ext" x1="0" y1="-85" x2="0" y2="-12"/><line class="pilot-mo-ext" x1="${f(inRow)}" y1="-85" x2="${f(inRow)}" y2="-9"/>
<line class="pilot-mo-dim" x1="0" y1="-85" x2="${f(inRow)}" y2="-85"/><line class="pilot-mo-dim" x1="0" y1="-91" x2="0" y2="-79"/><line class="pilot-mo-dim" x1="${f(inRow)}" y1="-91" x2="${f(inRow)}" y2="-79"/>
<text class="pilot-mo-t" x="${f(inRow / 2)}" y="-96" text-anchor="middle">${dim2(p.inRowM)} m</text>
<line class="pilot-mo-dim" x1="-25" y1="0" x2="-25" y2="${f(row)}"/><line class="pilot-mo-dim" x1="-31" y1="0" x2="-19" y2="0"/><line class="pilot-mo-dim" x1="-31" y1="${f(row)}" x2="-19" y2="${f(row)}"/>
<text class="pilot-mo-t" x="-38" y="${f(row / 2 + 7)}" text-anchor="end">${dim2(p.rowM)} m</text>
${shiftSvg}
${nnSvg}
<rect class="pilot-mo-key" x="0" y="268" width="16" height="16"/><text class="pilot-mo-t pilot-mo-t--box" x="26" y="283">${boxLabel}</text>
</svg>`;
}

const MO_NOTE: Record<string, string> = { a: 'The same as a 1 m grid with one extra tree in the centre of every square.', b: '', c: 'A plain 0.5 m × 0.5 m grid.' };

function markFig(p: Plot): string {
  const w = p.whole;
  const perRow = w.perRowUnshifted === w.perRowShifted ? String(w.perRowUnshifted) : `${w.perRowUnshifted} and ${w.perRowShifted}`;
  return `<figure class="pilot-mo-fig">
${markSvg(p)}
<figcaption><strong>Plot ${p.letter} · ${p.perM2} per m²</strong>${MO_NOTE[p.key] ? `<span class="pilot-mo-extra">${MO_NOTE[p.key]}</span>` : ''}</figcaption>
<dl>
<div><dt>Rows every</dt><dd>${dim2(p.rowM)} m</dd></div>
<div><dt>Trees every</dt><dd>${dim2(p.inRowM)} m</dd></div>
<div><dt>Shift every 2nd row</dt><dd>${p.shiftM ? `${dim2(p.shiftM)} m` : 'none'}</dd></div>
<div><dt>Whole plot</dt><dd>${w.rows} rows × ${perRow} = ${n0(w.total)}, planned ${n0(p.saplings)}</dd></div>
</dl>
</figure>`;
}

/* ---------- small helpers ---------- */

const row = (head: string, cells: string[], th = true) => `<tr>${th ? `<th scope="row">${head}</th>` : `<td>${head}</td>`}${cells.map((c) => `<td class="num">${c}</td>`).join('')}</tr>`;

const timeline = [
  ['Month 0', 'Record site conditions, species, initial seedling counts and planting costs.'],
  ['Month 3', 'Check establishment, early losses, and watering or maintenance needs.'],
  ['Month 6', 'Record survival, height, grass cover and maintenance effort.'],
  ['Month 12', 'First-year review of survival and growth.'],
  ['Month 24', 'Compare growth, canopy, ground cover and cumulative costs.'],
  ['Every year after', 'Keep monitoring and write down major changes.'],
];
const thinning = ['When thinning starts', 'Record how many trees were removed and their condition, transplant attempts, and transplant survival.'];

const learn = [
  ['Survival.', 'Which density keeps the most saplings alive?'],
  ['Growth.', 'How fast do trees grow in height and settle in?'],
  ['Canopy closure.', 'Which density makes useful shade soonest?'],
  ['Fire exposure.', 'How does dry grass and fine fuel change as the trees grow?'],
  ['Thinning.', 'Can healthy young trees be moved to other cleared areas and survive?'],
  ['Cost.', 'What does each surviving tree cost to establish and look after?'],
];

const considerations = [
  ['Same species mix in every plot', 'The three plots should use the same native species mixture in similar proportions, as far as nursery supply allows. Species follow local suitability, confirmed provenance and what nurseries can supply.'],
  ['Record site differences', 'Soil, slope, drainage, moisture, existing vegetation and sun exposure, for each plot, at the start.'],
  ['One plot per density is not a controlled trial', 'If plots sit on different parts of the land, site differences may affect the results. With a single plot per density, we cannot fully separate the effect of density from the effect of place. We will say so when we report.'],
  ['Long, narrow plots', 'Strips have more edge than squares. Trees on the edge get more light and more grass around them, so record the outer rows separately from the inside of each plot.'],
  ['Judge more than tree count', 'Compare survival, canopy growth, fire exposure and total cost, not how many trees went in.'],
  ['Fire', 'Keep access tracks and firebreaks clear, manage dry vegetation, and have a dry-season fire plan before planting.'],
  ['Transplanting', 'Only in suitable conditions, preferably early in the rainy season, and first as a small trial.'],
];

const hypotheses = [
  'Denser planting may push trees to compete and grow upward faster.',
  'Faster canopy may shade out grasses and other competing plants.',
  'Less dry grass may, in time, mean less fine fuel to carry a fire.',
  'Thinning may give us healthy young trees to move to other cleared areas.',
  'Higher density also means more competition for water, nutrients and space. More saplings may die, and each plot costs more to plant.',
];

/* ---------- the page ---------- */

export function pilotPage(build: BuildInfo, scenes: HeroScene[]): string {
  const stage = pageStage({
    eyebrow: 'Rewilding · Planting pilot',
    statement: 'VitaminAir Forest Restoration *Pilot*',
    cfg: { scene: 'planting', seed: 7 },
    scenes,
  });
  const heads = plots.map((p) => `Plot ${p.letter} · ${n0(p.perHa)}/ha`);
  const pctTxt = (p: Plot) => `${dp(p.share * 100, p.share * 100 % 1 === 0 ? 0 : 1)}%`;

  const main = `${stage}
<div class="pilot">

<section class="pilot-intro container rv" aria-label="About the pilot">
<p class="pilot-sub" data-rv>Testing planting density to understand forest growth, survival, and fire resilience.</p>
<p class="pilot-prose" data-rv>VitaminAir is testing three planting densities on approximately one hectare of land. The goal is to understand how different densities affect tree survival, growth, canopy development, ground vegetation, and the long-term cost of restoring a diverse native forest.</p>
<ol class="pilot-exp" aria-label="The three planting densities" data-rv>
${plots.map((p) => `<li>${sw(p.key)}<span class="pilot-exp-l">Plot ${p.letter}</span><span class="pilot-exp-n">${n0(p.perHa)}</span><span class="pilot-exp-u">trees/ha</span></li>`).join('\n')}
</ol>
<dl class="facts facts--grid" data-rv>
<div><dt>Pilot land</dt><dd>approximately 1 hectare</dd></div>
<div><dt>Saplings</dt><dd>${n0(totalSaplings)}</dd></div>
<div><dt>Assumed sapling price</dt><dd>US$${PRICE_USD} each <span class="pilot-fnote">(saplings may be free)</span></dd></div>
<div><dt>Initial sapling budget</dt><dd>US$${n0(totalCost)} <span class="pilot-fnote">(sapling purchase only)</span></dd></div>
</dl>
<p class="pilot-status" data-rv>${label('planned')} <span>This is a plan. Nothing on this page has been planted yet.</span></p>
</section>

${divider(41)}

<section class="pilot-layout container rv" id="layout" aria-labelledby="layout-h">
<h2 id="layout-h" class="section-h pilot-h" data-rv>The planting layout</h2>
<p class="pilot-lede" data-rv>A conceptual way to divide about one hectare: three equal strips on two thirds of it, and the rest kept for firebreaks, tracks and access.</p>
<div class="pilot-grid">
<figure class="pilot-fig">
${layoutSvg()}
<figcaption>Conceptual drawing, not a surveyed site plan. It assumes a square 100 m × 100 m site. The real boundary, slope, drainage, access and fire risk will set the final layout. Each dot in a plot stands for one sapling, in the row layout shown under “Marking out the plots”.</figcaption>
</figure>
<div class="pilot-keywrap">
<ol class="pilot-key" aria-label="Key to the layout">
${plots.map(keyItem).join('\n')}
<li class="pilot-key-item pilot-key-r" tabindex="0">
<h3>${sw('r')}<span>Remaining land</span></h3>
<p>About ${dp(remainingHa, 2)} ha: a ${BUFFER_M} m firebreak and buffer around the edge, ${TRACK_M} m tracks between the plots, and an access strip along one end. Not counted as planting land. A reference area left to regenerate on its own would need to sit outside this hectare.</p>
</li>
</ol>
<p class="pilot-total">Three plots · about ${dp(PLANTED_HA, 2)} ha · ${n0(totalSaplings)} saplings</p>
</div>
</div>
</section>

${divider(42)}

<section class="pilot-compare container rv" aria-labelledby="compare-h">
<h2 id="compare-h" class="section-h pilot-h" data-rv>Three densities, side by side</h2>
<p class="pilot-prose" data-rv>Most dense native plantings use two to five saplings per square metre. We want to see, on our own soil and through our own dry seasons, what changes between two, three and four.</p>
<div class="table-wrap pilot-table-wrap" tabindex="0" role="region" aria-label="Density comparison table">
<table class="pilot-table">
<thead><tr><th scope="col"><span class="sr-only">Measure</span></th>${heads.map((h) => `<th scope="col" class="num">${h}</th>`).join('')}</tr></thead>
<tbody>
${row('Trees per m²', plots.map((p) => String(p.perM2)))}
${row('Approximate square spacing', plots.map((p) => `${dp(p.spacing, 2)} m`))}
${row('Field layout', plots.map((p) => (p.shiftM ? `Rows ${dim2(p.rowM)} m, trees ${dim2(p.inRowM)} m, shifted` : `Grid ${dim2(p.rowM)} m × ${dim2(p.inRowM)} m`)))}
${row('Pilot plot area', plots.map(() => `${n0(plotM2)} m² (${dp(plotHa, 4)} ha)`))}
${row('Saplings allocated', plots.map((p) => n0(p.saplings)))}
${row('Sapling purchase cost', plots.map((p) => usd(p.cost)))}
</tbody>
</table>
</div>
<div class="pilot-prose">
<h3>What we think may happen</h3>
<p>These are ideas to test, not results.</p>
<ul class="pilot-hyp">
${hypotheses.map((h) => `<li>${esc(h)}</li>`).join('\n')}
</ul>
<aside class="note"><p>Dense planting does not stop fire on its own, least of all in the first years while the trees are small. Fire planning comes first on every plot.</p></aside>
</div>
</section>

${divider(48)}

<section class="pilot-mark container rv" id="marking-out" aria-labelledby="mark-h">
<h2 id="mark-h" class="section-h pilot-h" data-rv>Marking out the plots</h2>
<p class="pilot-prose" data-rv>Trees per square metre is an average across the plot, not a number of trees around each square. A tree standing on a corner is shared by the four squares that meet there. The drawings show a corner of each plot, to scale, with every distance the team needs.</p>
<div class="pilot-mo-row">
${plots.map(markFig).join('\n')}
</div>
<div class="table-wrap pilot-table-wrap" tabindex="0" role="region" aria-label="Whole-plot count table">
<table class="pilot-table">
<thead><tr><th scope="col"><span class="sr-only">Whole plot</span></th>${heads.map((h) => `<th scope="col" class="num">${h}</th>`).join('')}</tr></thead>
<tbody>
${row('Rows', plots.map((p) => String(p.whole.rows)))}
${row('Trees per row', plots.map((p) => (p.whole.perRowUnshifted === p.whole.perRowShifted ? String(p.whole.perRowUnshifted) : `${p.whole.perRowUnshifted} / ${p.whole.perRowShifted}`)))}
${row('Trees if the whole plot is filled', plots.map((p) => n0(p.whole.total)))}
${row('Planned', plots.map((p) => n0(p.saplings)))}
</tbody>
</table>
</div>
<p class="pilot-prose pilot-qual">Filling each whole plot this way takes about ${dp(wholeExtraPct, 1)}% more trees than planned (${n0(wholeTotal)} instead of ${n0(totalSaplings)}), because the first row and first tree sit on the edge. Either order about ${dp(wholeExtraPct, 1)}% more, or leave the last row of each plot short. Decide before ordering. Count each row as it is planted and write down the real number.</p>
<h3>Step by step</h3>
<ol class="pilot-learn pilot-steps">
<li>Peg the four corners of each ${wTxt} m × ${lTxt} m plot. Check it is square: both diagonals should measure ${dp(diagonalM, 1)} m.</li>
<li>Along both long edges, put a peg every ${dim2(plots[0].rowM)} m. Each peg pair is one row.</li>
<li>Stretch a string across the plot between the first pair of pegs. Mark it at the tree spacing: every ${dim2(plots[0].inRowM)} m in Plot A, ${dim2(plots[1].inRowM)} m in Plot B, ${dim2(plots[2].inRowM)} m in Plot C.</li>
<li>Plant at each mark, starting on the corner.</li>
<li>Move the string to the next pair of pegs. In Plots A and B, start every second row shifted: ${dim2(plots[0].shiftM)} m in A, ${dim2(plots[1].shiftM)} m in B. Plot C is not shifted.</li>
<li>Count the trees in each row as they go in, and write the number down.</li>
</ol>
<p class="pilot-prose"><strong>Tools:</strong> a 100 m tape (or a 50 m tape used twice), string, pegs, and sticks cut to ${dim2(plots[0].inRowM)} m, ${dim2(plots[1].inRowM)} m, ${dim2(plots[0].rowM)} m and ${dim2(plots[1].shiftM)} m.</p>
</section>

${divider(43)}

<section class="pilot-budget container rv" aria-labelledby="budget-h">
<h2 id="budget-h" class="section-h pilot-h" data-rv>The starting budget</h2>
<p class="pilot-big" data-rv>${n0(totalSaplings)} saplings · US$${n0(totalCost)} estimated purchase cost</p>
<div class="pilot-bar" role="img" aria-label="Share of the sapling budget: ${plots.map((p) => `Plot ${p.letter} ${pctTxt(p)}`).join(', ')}">
${plots.map((p) => `<span class="pilot-bar-seg pilot-fill-${p.key}" style="flex-basis:${f(p.share * 100)}%"></span>`).join('')}
</div>
<ul class="pilot-bar-key">
${plots.map((p) => `<li>${sw(p.key)}<span>Plot ${p.letter}</span><span class="num">${usd(p.cost)}</span><span class="pilot-pct num">${pctTxt(p)}</span></li>`).join('\n')}
</ul>
<div class="table-wrap pilot-table-wrap" tabindex="0" role="region" aria-label="Budget table">
<table class="pilot-table pilot-table--budget">
<thead><tr><th scope="col">Item</th><th scope="col" class="num">Quantity</th><th scope="col" class="num">Estimated cost</th></tr></thead>
<tbody>
${plots.map((p) => `<tr><th scope="row">Plot ${p.letter} seedlings</th><td class="num">~${n0(p.saplings)}</td><td class="num">~${usd(p.cost)}</td></tr>`).join('\n')}
<tr class="pilot-total-row"><th scope="row">Total</th><td class="num">${n0(totalSaplings)}</td><td class="num">${usd(totalCost)}</td></tr>
</tbody>
</table>
</div>
<p class="pilot-prose pilot-qual">US$1 per sapling is a planning assumption, not a confirmed supplier quotation. We may be able to get the saplings at no cost. Nothing is confirmed, so the plan keeps the full purchase cost until it is. If the saplings do come free, this part of the budget falls away and every other cost stays. This budget covers sapling purchases only. Transport, site preparation, planting labour, maintenance, fire management, replacements, monitoring, and long-term protection are additional costs to be estimated.</p>
</section>

${divider(44)}

<section class="pilot-learnsec container rv" aria-labelledby="learn-h">
<h2 id="learn-h" class="section-h pilot-h" data-rv>What we are trying to learn</h2>
<p class="pilot-prose" data-rv>The pilot is for gathering real evidence before deciding whether to plant more of the cleared land, and how.</p>
<ol class="pilot-learn">
${learn.map(([t, b]) => `<li><strong>${esc(t)}</strong> ${esc(b)}</li>`).join('\n')}
</ol>
</section>

${divider(45)}

<section class="pilot-monitor container rv" aria-labelledby="monitor-h">
<h2 id="monitor-h" class="section-h pilot-h" data-rv>Monitoring schedule ${label('planned')}</h2>
<p class="pilot-prose" data-rv>Proposed. None of this has happened yet.</p>
<ol class="pilot-timeline">
${timeline.map(([t, b]) => `<li><h3>${esc(t)}</h3><p>${esc(b)}</p></li>`).join('\n')}
<li class="pilot-tl-open"><h3>${esc(thinning[0])}</h3><p class="pilot-nodate">No fixed date</p><p>${esc(thinning[1])}</p></li>
</ol>
</section>

${divider(46)}

<section class="pilot-thin container rv" aria-labelledby="thin-h">
<h2 id="thin-h" class="section-h pilot-h" data-rv>Thinning and transplanting</h2>
<div class="pilot-prose">
<p>As the dense plots grow, some trees will probably need thinning. We want to find out whether some of the healthy young trees can be moved to other cleared areas instead of being thrown away.</p>
<p>That depends on the species, the size of the tree, the season, how much the roots are disturbed, and whether moved trees survive. We will thin when growth and competition in the plots show it is time, not on a fixed year. The first moves would be a small trial, timed to the rainy season.</p>
</div>
</section>

${divider(47)}

<section class="pilot-consider container rv" aria-labelledby="consider-h">
<h2 id="consider-h" class="section-h pilot-h" data-rv>Important considerations</h2>
<div class="rows pilot-rows">
${considerations.map(([t, b]) => `<details class="row"><summary><span class="row-title">${esc(t)}</span><span class="sign" aria-hidden="true"></span></summary><div class="det-body"><p>${esc(b)}</p></div></details>`).join('\n')}
</div>
<div class="pilot-prose pilot-close">
<p>This plan will change as we learn the land. Results, including what doesn't work, will go in the <a href="/blog/">journal</a>.</p>
<p class="back"><a href="/rewilding/">← How we rewild</a></p>
</div>
</section>

</div>`;

  return layout(
    {
      title: 'Planting pilot · VitaminAir',
      description: "VitaminAir's planned planting pilot: three plots at 20,000, 30,000 and 40,000 trees per hectare, the sapling budget, and what we will measure.",
      path: '/rewilding/pilot/',
      nav: '/rewilding/',
      navExact: false,
      stage: true,
    },
    main,
    build,
  );
}
