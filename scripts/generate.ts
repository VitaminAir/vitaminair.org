// Reads src/content + src/data + src/templates and writes one index.html per route into .site/
// (the Vite root). Also writes .site/manifest.json for the postbuild step.
import { rmSync, mkdirSync, writeFileSync, copyFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadPage, loadJournal } from '../src/lib/content.ts';
import { buildDateLabel, ROOT } from '../src/lib/html.ts';
import { homePage } from '../src/templates/home.ts';
import type { HeroScene } from '../src/templates/stage.ts';
import { detailPage, journalPage, articlePage, notFoundPage } from '../src/templates/pages.ts';

export interface Manifest {
  buildDate: string;
  buildIso: string;
  pages: { path: string; title: string }[];
  articles: { path: string; title: string; description: string; date: string; time: number; author?: string }[];
}

export function generate(): Manifest {
  const out = join(ROOT, '.site');
  const showDrafts = process.env.VA_SHOW_DRAFTS === '1';
  const now = new Date();
  const build = { buildDate: buildDateLabel(now) };

  const journal = loadJournal(showDrafts);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  const files = new Map<string, string>();
  const pages: Manifest['pages'] = [];

  const home = loadPage('home');
  const scenes = home.data.hero.scenes as HeroScene[];
  files.set('/', homePage(home.data, journal, build));
  pages.push({ path: '/', title: 'Home' });

  for (const [name, path] of [['rewilding', '/rewilding/'], ['village', '/village/'], ['contact', '/contact/']] as const) {
    const p = loadPage(name);
    files.set(path, detailPage(path, p.data, p.html, build, scenes));
    pages.push({ path, title: String(p.data.title) });
  }
  files.set('/blog/', journalPage(journal, build, showDrafts, scenes));
  pages.push({ path: '/blog/', title: 'Journal' });

  for (const a of journal) {
    if (files.has(a.path)) throw new Error(`Article URL ${a.path} (${a.file}) collides with another page`);
    files.set(a.path, articlePage(a, journal, build, scenes));
  }

  for (const [route, html] of files) {
    const target = join(out, route, 'index.html');
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html);
  }
  writeFileSync(join(out, '404.html'), notFoundPage(build, scenes));
  copyFileSync(join(ROOT, 'src/styles/main.css'), join(out, 'main.css'));
  // the runtime module (hero, page stages, band, reveal) and the shared art code it imports; Vite bundles them
  // from here, for pages with a stage only (articles ship no script)
  cpSync(join(ROOT, 'src/hero'), join(out, 'hero'), { recursive: true });
  cpSync(join(ROOT, 'src/art'), join(out, 'art'), { recursive: true });

  const manifest: Manifest = {
    buildDate: build.buildDate,
    buildIso: now.toISOString(),
    pages,
    articles: journal
      .filter((a) => a.status === 'published')
      .map((a) => ({ path: a.path, title: a.title, description: a.description, date: a.date, time: a.time, author: a.author })),
  };
  writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 1));
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const m = generate();
    console.log(`generate: ${m.pages.length} pages + ${m.articles.length} articles + 404 -> .site/`);
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
}
