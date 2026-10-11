import { site, facts } from '../data/site.ts';
import { esc, mailto } from '../lib/html.ts';
import { legendDetails } from './parts.ts';
import { fieldSvg, edge } from './art.ts';

const BURGER = '<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true" focusable="false"><path d="M4 8.5c4-1 8 .8 12 0s5-.8 8 0M4 14c4-.8 7 .9 10.5 0s6-.9 9.5 0M4 19.5c3.5-.9 7 .8 11 0s5.5-.6 9 0"/></svg>';
const CROSS = '<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true" focusable="false"><path d="M6.5 6.5c5 4.5 10 9.5 15 15M21.5 6.5c-5 4.5-10 9.5-15 15"/></svg>';

export interface PageMeta {
  title: string; // full <title>
  description: string;
  path: string; // e.g. /rewilding/
  ogType?: 'website' | 'article';
  noindex?: boolean;
  nav?: string; // nav path considered current
  navExact?: boolean; // aria-current="page" vs "true"
  banner?: string;
  /** Page has a canvas stage (or the homepage hero): transparent header over it, and the runtime module. */
  stage?: boolean;
  /** The last block before the footer is a sand band (the footer edge sits on sand, not paper). */
  footOnSand?: boolean;
}

export interface BuildInfo {
  buildDate: string; // "11 OCT 2026"
}

export function layout(meta: PageMeta, main: string, build: BuildInfo, bodyClass = ''): string {
  bodyClass = [bodyClass, meta.stage ? 'has-stage' : ''].filter(Boolean).join(' ');
  if (!meta.banner && (meta.description.length < 120 || meta.description.length > 160))
    throw new Error(`\n  Meta description for ${meta.path} is ${meta.description.length} characters; it must be 120-160.\n  ${meta.description}\n`);
  const canonical = site.url + meta.path;
  const ogImage = site.url + site.ogImage;
  const navHtml = site.nav
    .map((n) => {
      const cur = meta.nav === n.path ? (meta.navExact === false ? ' aria-current="true"' : ' aria-current="page"') : '';
      return `<a href="${n.path}"${cur}>${esc(n.name)}</a>`;
    })
    .join('');
  const cur = (p: string) => (meta.path === p ? ' aria-current="page"' : meta.nav === p ? (meta.navExact === false ? ' aria-current="true"' : ' aria-current="page"') : '');
  const menuLinks = [{ name: 'Home', path: '/' }, ...site.nav].map((n) => `<a href="${n.path}"${cur(n.path)}>${esc(n.name)}</a>`).join('');
  const names = site.partners.map((x) => (x.url ? `<a href="${esc(x.url)}" rel="noopener">${esc(x.name)}</a>` : esc(x.name)));
  const partnersHtml = `Working with ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}.`;
  const socials = site.socials
    .map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.name)}</a></li>`)
    .join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<link rel="canonical" href="${esc(canonical)}">
${meta.noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:type" content="${meta.ogType ?? 'website'}">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:alt" content="${esc(site.ogImageAlt)}">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(meta.title)}">
<meta name="twitter:description" content="${esc(meta.description)}">
<meta name="twitter:image" content="${esc(ogImage)}">
<meta name="twitter:image:alt" content="${esc(site.ogImageAlt)}">
<meta name="theme-color" content="#F4EDDF">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="VitaminAir journal" href="/blog/feed.xml">
<link rel="stylesheet" href="/main.css">
${meta.stage ? '<script>(function(d){d.classList.add("js","has-menu");setTimeout(function(){d.dataset.menu||d.classList.remove("has-menu")},4e3)})(document.documentElement)</script>\n' : ''}</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">Skip to content</a>
${meta.banner ? `<p class="draft-banner">${esc(meta.banner)}</p>\n` : ''}<header class="site-header">
<a class="wordmark" href="/">VitaminAir</a>
<nav class="site-nav" aria-label="Main">${navHtml}</nav>${meta.stage ? `\n<button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu">${BURGER}</button>` : ''}
</header>
<main id="main">
${main}
</main>
${edge('up', 7, meta.footOnSand ? 'edge--on-sand' : '')}
<footer class="site-footer">
${fieldSvg('contours contours--foot', 1440, 360, 5, '#F6F1E6', 0.06, 16, 10)}
<div class="container foot-inner">
<p class="foot-line"><span>VITAMINAIR · ${esc(facts.location.replace(', ', ' · ').toUpperCase())}</span><a href="${esc(mailto('Hello from the website'))}">${esc(site.email)}</a><span>SITE UPDATED ${esc(build.buildDate)}</span></p>
<ul class="foot-links" aria-label="Elsewhere">${socials}<li><a href="/blog/feed.xml">Journal RSS</a></li><li><a href="${esc(site.mapUrl)}" rel="noopener">Map ↗</a></li><li class="foot-legend">${legendDetails('legend--foot')}</li></ul>
<p class="foot-partners">${partnersHtml}</p>
<p class="foot-partners foot-credit">Design inspired by <a href="https://itonami.studio/" rel="noopener">Itonami Studio</a>.</p>
</div>
</footer>${meta.stage ? `
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Main menu">
<canvas class="menu-canvas" aria-hidden="true"></canvas>
<div class="menu-scrim" aria-hidden="true"></div>
<div class="menu-inner">
<div class="menu-head"><a class="wordmark" href="/">VitaminAir</a><button class="menu-close" type="button" aria-label="Close menu">${CROSS}</button></div>
<nav class="menu-nav" aria-label="Menu">${menuLinks}</nav>
<p class="menu-foot"><a href="${esc(mailto('Hello from the website'))}">${esc(site.email)}</a><span>${esc(facts.location.replace(', ', ' · '))}</span></p>
</div>
</div>` : ''}${meta.stage ? '\n<script type="module" src="/hero/main.ts"></script>' : ''}
</body>
</html>
`;
}
