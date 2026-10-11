import { site, facts, labels, type StatusKey } from '../data/site.ts';
import { esc, label, statement, note, imgTag, mailto, btnPrimary } from '../lib/html.ts';
import { renderMarkdown, renderInline } from '../lib/markdown.ts';
import type { Article } from '../lib/content.ts';
import { layout, type BuildInfo } from './layout.ts';
import { stageSvg, fieldSvg, divider, edge, frameLines, villageArt, bandTrees } from './art.ts';
import { eyebrow, entryRow, figureWithBar, termItems } from './parts.ts';

export function homePage(d: Record<string, any>, journal: Article[], build: BuildInfo): string {
  let n = 0;
  const nextNote = () => note(++n);

  // featured entries (5 most recent), fall back to latest
  const featured = journal.filter((a) => a.featured);
  const picks = (featured.length ? featured : journal).slice(0, 5);

  const H = d.hero;
  const animate = H.animate !== false;
  const scenes: { name: string; caption: string; status: StatusKey }[] = H.scenes;
  const scene1 = scenes[0];
  const sceneJson = JSON.stringify({ scenes: scenes.map((s) => ({ name: s.name, caption: s.caption, cls: labels[s.status].cls, text: labels[s.status].text })) }).replace(/</g, '\\u003c');
  const ctl = `<p class="stage-hint" hidden></p>
<div class="stage-ctl" hidden>
<div class="stage-dots" role="group" aria-label="Choose a scene">${scenes
    .map((s, i) => `<button type="button" class="stage-dot" aria-label="Scene ${i + 1} of ${scenes.length}: ${esc(s.name)}" aria-pressed="${i === 0}"><span></span></button>`)
    .join('')}</div>
<button type="button" class="stage-pause" aria-pressed="false" aria-label="Pause animation"><span aria-hidden="true"></span></button>
</div>
`;
  const bar = `<div class="stage-bar">
<p class="stage-scene"><span class="stage-n">01</span> · <span class="stage-name">${esc(scene1.name)}</span></p>
<p class="stage-cap"><span class="stage-cap-t">${esc(scene1.caption)}</span> ${label(scene1.status, 'stage-chip')}</p>
${animate ? ctl : ''}</div>`;
  const cta = `${btnPrimary(H.primary.text, H.primary.href)}<a class="text-link" href="${esc(H.link.href)}">${esc(H.link.text)}</a>`;
  const hero = `<section class="stage" aria-labelledby="hero-h">
${stageSvg('stage-svg', 1440, 900, 0)}
${animate ? '<canvas class="stage-canvas" aria-hidden="true"></canvas>' : ''}
<div class="stage-scrim" aria-hidden="true"></div>
<div class="stage-inner container">
<div class="stage-text">
${eyebrow(H.eyebrow)}
<h1 id="hero-h" class="statement statement--hero">${statement(H.statement)}</h1>
<p class="actions actions--hero">${cta}</p>
</div>
${bar}
</div>
<a class="stage-cue" href="#intro" aria-label="Scroll to content"><svg viewBox="0 0 28 26" width="28" height="26" aria-hidden="true" focusable="false"><path d="M3 3l11 8 11-8"/><path d="M3 10l11 8 11-8"/><path d="M3 17l11 8 11-8"/></svg></a>
</section>
${edge('down', 30)}
<section id="intro" class="hero-after container rv">
<p class="intro" data-rv>${esc(H.intro)}</p>
<p class="actions actions--after">${cta}</p>
</section>
<div class="container">${divider(1)}</div>${animate ? `
<script type="application/json" id="stage-data">${sceneJson}</script>` : ''}`;

  const L = d.land;
  const land = `<section class="land rv" aria-labelledby="land-h">
<div class="land-media">${figureWithBar(L.image, imgTag(L.image, L.alt, { eager: true }), L.tag, L.caption)}${frameLines(1)}${frameLines(2, true)}</div>
<div class="land-text">
${eyebrow(L.eyebrow, nextNote())}
<h2 id="land-h" class="section-h" data-rv>${esc(L.heading)} ${label(L.status as StatusKey)}</h2>
<dl class="facts" data-rv>${L.facts.map((f: any) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}<div><dt>Where</dt><dd>${esc(facts.location)} · <a href="${esc(site.mapUrl)}" rel="noopener">Open the map ↗</a></dd></div></dl>
</div>
</section>
${edge('up', 11)}`;

  const A = d.approach;
  const approach = `<section class="band rv" aria-labelledby="approach-h">
${fieldSvg('contours', 1440, 800, 11, '#F6F1E6', 0.07, 16, 13)}
<canvas class="contours band-canvas" aria-hidden="true"></canvas>
${bandTrees()}
<div class="container band-grid">
<div class="band-lead">
${eyebrow(A.eyebrow, nextNote())}
<h2 id="approach-h" class="statement statement--band" data-rv>${statement(A.statement)}</h2>
</div>
<div class="band-body" data-rv>${A.items
    .map((r: any) => `<div class="approach-item"><p class="approach-meta">${label(r.status as StatusKey)}</p><h3>${esc(r.title)}</h3>${renderMarkdown(r.body)}</div>`)
    .join('')}
</div>
</div>
</section>
${edge('down', 12)}`;

  const W = d.learn;
  const learn = `<section class="learn container rv" aria-labelledby="learn-h">
<div class="split">
<div class="split-lead">
${eyebrow(W.eyebrow, nextNote())}
<h2 id="learn-h" class="section-h" data-rv>${esc(W.heading)}</h2>
<p class="desc" data-rv>${label(W.status as StatusKey)} ${esc(W.desc)}</p>
</div>
${termItems(W.items.map((r: any) => ({ title: r.title, body: renderMarkdown(r.body) })))}
</div>
</section>
${edge('up', 13, 'edge--sand')}`;

  const V = d.village;
  const village = `<section class="village rv" aria-labelledby="village-h">
${villageArt()}
<div class="container village-inner">
${eyebrow(V.eyebrow, nextNote())}
<h2 id="village-h" class="statement statement--page" data-rv>${statement(V.statement)} ${label(V.status as StatusKey)}</h2>
<p class="village-text" data-rv>${esc(V.text)}</p>
<p class="more"><a href="/village/">→ ${esc(V.linkText)}</a></p>
</div>
</section>
${edge('down', 14, 'edge--sand')}`;

  const J = d.journal;
  const jr = picks.length === 0 ? '' : `<section class="journal container rv" aria-labelledby="journal-h">
<div class="split">
<div class="split-lead">
${eyebrow(J.eyebrow, nextNote())}
<h2 id="journal-h" class="section-h" data-rv>${esc(J.heading)}</h2>
<p class="desc" data-rv>${esc(J.desc)}</p>
</div>
<div data-rv>
<ul class="rows rows--links">${picks.map(entryRow).join('')}</ul>
<p class="more"><a href="/blog/">All entries →</a></p>
</div>
</div>
</section>
<div class="container">${divider(2)}</div>`;

  const C = d.contact;
  const contact = `<section class="contact rv" aria-labelledby="contact-h">
${fieldSvg('contact-mark', 1200, 560, 3, '#3F6E55', 0.1, 14, 11)}
<div class="container">
<div class="split">
<div class="split-lead">
<h2 id="contact-h" class="statement statement--page statement--sm" data-rv>${statement(C.statement)}</h2>
</div>
<div class="contact-body" data-rv>
<p>${esc(C.text)}</p>
<p>${renderInline(C.org)}</p>
<p class="big"><a href="${esc(mailto(C.subject))}">${esc(site.email)}</a></p>
<p>${esc(C.note)}</p>
</div>
</div>
</div>
</section>`;

  return layout(
    { title: d.title, description: d.description, path: '/', nav: undefined, stage: true },
    [hero, land, approach, learn, village, jr, contact].join('\n'),
    build,
    'home',
  );
}
