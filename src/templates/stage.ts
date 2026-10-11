import { labels, type StatusKey } from '../data/site.ts';
import { esc, label, statement } from '../lib/html.ts';
import { eyebrow } from './parts.ts';
import { stageSvg, edge } from './art.ts';

export interface HeroScene { name: string; caption: string; status: StatusKey }
/** Front matter `stage:` (pages) or a default in the template (journal, 404). */
export interface StageCfg { scene: string; seed?: number; label?: boolean; faint?: number }

export const SCENES = ['land', 'recovery', 'planting', 'canopy', 'village'];

/** The page stage: a smaller sibling of the hero. One scene, draw-in, no dots. Static SVG without JS or with reduced motion. */
export function pageStage(o: { eyebrow: string; statement: string; cfg: StageCfg; scenes: HeroScene[]; chips?: string; plainTitle?: boolean; titleClass?: string }): string {
  const { cfg } = o;
  const idx = SCENES.indexOf(String(cfg.scene).toLowerCase());
  if (idx < 0) throw new Error(`Unknown stage scene "${cfg.scene}". Use one of: ${SCENES.join(', ')}`);
  const seed = cfg.seed ?? 0;
  const sc = o.scenes[idx];
  const lab = labels[sc.status];
  const json = JSON.stringify({
    scenes: [{ name: sc.name, caption: sc.caption, cls: lab.cls, text: lab.text }],
    page: { scene: idx, seed, ...(cfg.faint ? { faint: cfg.faint } : {}) },
  }).replace(/</g, '\\u003c');
  const pause = idx > 0
    ? `\n<div class="stage-ctl" hidden><button type="button" class="stage-pause" aria-pressed="false" aria-label="Pause animation"><span aria-hidden="true"></span></button></div>`
    : '';
  const bar = cfg.label
    ? `<div class="stage-bar">
<p class="stage-cap"><span class="stage-cap-t">${esc(sc.caption)}</span> ${label(sc.status, 'stage-chip')}</p>${pause}
</div>`
    : '';
  return `<section class="stage stage--page${cfg.faint ? ' stage--faint' : ''}" aria-labelledby="stage-h">
${stageSvg('stage-svg', 1440, 640, seed, String(cfg.scene).toLowerCase())}
<canvas class="stage-canvas" aria-hidden="true"></canvas>
<div class="stage-scrim" aria-hidden="true"></div>
<div class="stage-inner container">
<div class="stage-text">
${eyebrow(o.eyebrow)}
<h1 id="stage-h" class="statement statement--page${o.titleClass ? ' ' + o.titleClass : ''}">${o.plainTitle ? esc(o.statement) : statement(o.statement)}</h1>${o.chips ? `\n<p class="stage-chips">${o.chips}</p>` : ''}
</div>
${bar}
</div>
</section>
${edge('down', 20 + seed)}
<script type="application/json" id="stage-data">${json}</script>`;
}
