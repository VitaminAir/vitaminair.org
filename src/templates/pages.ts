import { esc, statement, plain, imgTag, label, displayDate, mailto, btnPrimary } from '../lib/html.ts';
import type { StatusKey } from '../data/site.ts';
import type { Article } from '../lib/content.ts';
import { layout, type BuildInfo } from './layout.ts';
import { legendDetails, entryRow, articleLabels, figureWithBar } from './parts.ts';
import { pageStage, type HeroScene } from './stage.ts';
import { divider, edge } from './art.ts';
import { site } from '../data/site.ts';

/** Put a contour divider before each h2 after the first, when the reading column has 4 or more top-level h2s. */
function withDividers(html: string): string {
  const re = /<aside[\s\S]*?<\/aside>|<h2\b/g;
  const hits = [...html.matchAll(re)].filter((m) => m[0] === '<h2');
  if (hits.length < 4) return html;
  let k = 0;
  return html.replace(re, (m) => (m === '<h2' && ++k > 1 ? `${divider(30 + k)}<h2` : m));
}

/** Rewilding, Village and Contact: page stage + (optional photo and glance) + reading column. */
export function detailPage(path: string, d: Record<string, any>, html: string, build: BuildInfo, scenes: HeroScene[]): string {
  const stage = pageStage({ eyebrow: d.eyebrow, statement: d.statement, cfg: d.stage ?? { scene: 'land' }, scenes });
  const photo = d.image ? figureWithBar(d.image, imgTag(d.image, d.imageAlt, { eager: true }), d.tag, d.caption) : '';
  const g = d.glance;
  const glance = g
    ? `<section class="glance container rv" aria-labelledby="glance-h"><h2 id="glance-h" class="glance-h" data-rv>${esc(g.heading)}</h2><dl class="facts facts--grid" data-rv>${g.rows
        .map((r: any) => `<div><dt>${esc(r.label)}</dt><dd>${r.status ? `${label(r.status as StatusKey)} · ` : ''}${esc(r.value)}</dd></div>`)
        .join('')}</dl></section>`
    : '';
  // a closing call to action (front matter `closing: true`) is everything after the last horizontal rule
  const cut = d.closing ? html.lastIndexOf('<hr>') : -1;
  const body = cut >= 0 ? html.slice(0, cut) : html;
  const closing = cut >= 0 ? html.slice(cut).replace(/^<hr>\s*/, '') : '';
  const main = `${stage}
${glance}
<div class="reading rv${closing ? ' has-closing' : ''}">${photo ? `<div class="reading-photo">${photo}</div>` : ''}${withDividers(body)}</div>${
    closing ? `\n${edge('up', 40, 'edge--sand')}\n<section class="closing"><div class="reading">${closing}</div></section>` : ''
  }`;
  return layout({ title: `${plain(d.title)} · VitaminAir`, description: d.description, path, nav: path, stage: true, footOnSand: !!closing }, main, build);
}

export function journalPage(journal: Article[], build: BuildInfo, showDrafts: boolean, scenes: HeroScene[]): string {
  const years = [...new Set(journal.map((a) => a.date.slice(0, 4)))].sort().reverse();
  const groups = years
    .map((y) => {
      const items = journal.filter((a) => a.date.startsWith(y));
      return `<section aria-labelledby="y${y}"><h2 class="year" id="y${y}">${y}</h2><ul class="rows rows--links">${items.map(entryRow).join('')}</ul></section>`;
    })
    .join('\n');
  const main = `${pageStage({ eyebrow: 'Journal', statement: 'Notes from the land. *Older* stories too.', cfg: { scene: 'land', seed: 1 }, scenes })}
<div class="container journal-wrap">
${groups || '<p class="empty">No entries yet. New notes will appear here when we publish them.</p>'}
${legendDetails('legend--journal')}
</div>`;
  return layout(
    { title: 'Journal · VitaminAir', description: 'Notes, stories and older pieces from VitaminAir: archive articles, short stories and reflections, newest first. Project updates will appear here.', path: '/blog/', nav: '/blog/', stage: true },
    main,
    build,
  );
}

export function articlePage(a: Article, all: Article[], build: BuildInfo, scenes: HeroScene[]): string {
  const i = all.findIndex((x) => x.path === a.path);
  const newer = i > 0 ? all[i - 1] : null;
  const older = i >= 0 && i < all.length - 1 ? all[i + 1] : null;
  const labels = articleLabels(a);
  const meta = [displayDate(a.date), a.author ? `By ${a.author}` : '', a.legacyCategory ?? ''].filter(Boolean);
  const metaHtml = meta.map((m, k) => (k === 0 ? `<time datetime="${a.date.slice(0, 10)}">${esc(m)}</time>` : esc(m))).join(' · ');
  const noteHtml = a.note ? `<aside class="note${a.type === 'story' ? ' fiction' : ''}" aria-label="Note on this piece"><p>${esc(a.note)}</p></aside>` : '';
  const img = a.image
    ? `<figure class="article-img">${imgTag(a.image, a.imageAlt ?? '', { eager: true })}${a.imageCaption ? `<figcaption>${esc(a.imageCaption)}</figcaption>` : ''}</figure>`
    : '';
  const nav = (x: Article, dir: string) => `<li><a href="${x.path}"><span class="pn-dir">${dir}</span><span class="pn-title">${esc(x.title)}</span></a></li>`;
  const more = newer || older
    ? `<nav class="more-journal" aria-label="More from the journal"><h2 class="legend-h">More from the journal</h2><ul>${older ? nav(older, '← Earlier') : ''}${newer ? nav(newer, 'Later →') : ''}</ul></nav>`
    : '';
  // the stage seed comes from the slug, so each post's landscape differs a little
  let seed = 0;
  for (const ch of a.path) seed = (seed * 31 + ch.charCodeAt(0)) % 997;
  const stage = pageStage({
    eyebrow: `${a.type} · ${displayDate(a.date)}`,
    statement: a.title,
    plainTitle: true,
    titleClass: a.title.length > 50 ? 'statement--long' : 'statement--article',
    chips: labels,
    cfg: { scene: 'land', seed: 10 + (seed % 60), art: ['contours', 'grass', 'terraces'][seed % 3] },
    scenes,
  });
  const main = `${stage}
<article class="reading article">
<p class="back"><a href="/blog/">← Journal</a></p>
${img}
<p class="meta">${metaHtml}</p>
${noteHtml}
<div class="article-body">${a.bodyHtml}</div>
</article>
<div class="reading reading--after">${more}</div>`;
  return layout(
    {
      title: `${a.title} · VitaminAir`,
      description: a.metaDescription ?? a.description,
      path: a.path,
      ogType: 'article',
      nav: '/blog/',
      navExact: false,
      stage: true,
      noindex: a.status === 'draft',
      banner: a.status === 'draft' ? 'DRAFT: not public' : undefined,
    },
    main,
    build,
  );
}

export function notFoundPage(build: BuildInfo, scenes: HeroScene[]): string {
  const main = `${pageStage({ eyebrow: '404', statement: 'This page has *moved* or never existed.', cfg: { scene: 'land', seed: 4, faint: 0.45 }, scenes })}
<div class="reading"><p>Try the <a href="/blog/">journal</a>, or email <a href="${esc(mailto('Hello from the website'))}">${esc(site.email)}</a>.</p>
<p class="actions">${btnPrimary('Go to the homepage', '/')}</p></div>`;
  return layout({ title: 'Page not found · VitaminAir', description: 'This page could not be found. It may have moved. Try the VitaminAir journal or email tree@vitaminair.org and we will point you to the right place.', path: '/404.html', noindex: true, stage: true }, main, build);
}
