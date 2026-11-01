# VitaminAir website

Static information site for VitaminAir: rewilding land in Cambodia. Vite + TypeScript, no framework, no backend. Runtime JavaScript is one small module (`src/hero/main.ts`: hero or page stage canvas, section reveal, the homepage band; about 9.3 KB gzipped, plus a 1 KB band chunk on the homepage) plus a one-line inline head script and an inline JSON data script. Every page has a stage, so every page loads it; everything is visible and static without JS or with reduced motion. Content lives in Markdown; every content change needs a rebuild.

## Requirements
Node.js 22 or newer (developed on 24) and npm.

## Commands
| Command | What it does |
|---|---|
| `npm install` | Install the pinned dependencies |
| `npm run dev` | Generate pages, start Vite on http://localhost:5173. Editing anything in `src/content`, `src/data`, `src/templates`, `src/lib` or `src/styles` regenerates and reloads |
| `npm run build` | Type-check, generate HTML, Vite build, postbuild (sitemap, RSS, robots, redirects, legacy stubs). Output: `dist/` |
| `npm run preview` | Serve `dist/` at http://localhost:4173 |
| `npx wrangler dev` | Serve `dist/` the way Cloudflare does, at http://localhost:8787: with `_redirects`, `_headers`, the trailing-slash redirect and the 404 page. Run `npm run build` first |
| `npm run check` | `tsc --noEmit` |
| `npm run migrate` | One-off HTMLy converter (re-creates the migrated files from `source-archive/`) |

## How it works
`scripts/generate.ts` reads `src/content/**`, `src/data/site.ts` and `src/templates/*.ts` and writes one `index.html` per route into `.site/` (gitignored). Vite (root `.site/`) bundles the CSS and fonts into `dist/assets/`, and copies `public/`. `scripts/postbuild.ts` then writes `sitemap.xml`, `blog/feed.xml`, `robots.txt`, `_redirects` and meta-refresh stub pages for old URLs.

## Homepage hero ("Living landscape")
Five procedurally drawn scenes (Land, Recovery, Planting, Canopy, Village) on one canvas, with scene dots, a pause button and per-scene touch/pointer interaction. `scripts/generate.ts` copies `src/hero/` and `src/art/` into `.site/` and each page loads `main.ts` with one `<script type="module">` (Vite bundles and hashes it) plus one inline JSON data script.
- **Scene text** (name, caption, status label) lives in `src/content/pages/home.md` under `hero.scenes`. Status is one of `today`, `planned`, `vision` (the same labels as the rest of the site). Captions may use `{{facts.*}}`.
- **Turn the animation off:** set `hero.animate: false` in `home.md`. The page then renders only the static SVG contour stage with the caption; no hero data script is emitted.
- **Fallbacks:** without JavaScript the stage shows a static SVG (scene 1), the heading and the button. With `prefers-reduced-motion: reduce` the canvas draws scene 1 fully and stays still; dots still switch scenes, and tapping in Recovery and Planting still places marks.

## Page stages and shared art
Every other page opens with a smaller stage (`min(62svh, 640px)`, at least 420px; mobile `min(56svh, 520px)`; it grows if the text needs more) with one scene that draws in and does not cycle. A pause button appears only for scenes that keep moving (Planting, Village). Scene and seed per page: front matter `stage: {scene, seed, label}` in `rewilding.md` (Planting, `label: true` adds the caption and status chip), `village.md` (Village), `contact.md` (Land); the journal and 404 pages use Land in their templates; articles use Land with a seed derived from the slug. The static twin (no JS, reduced motion) is an SVG drawn from the same noise field (`src/art/contours.ts`, build-side renderers in `src/templates/art.ts`). Organic band edges, contour dividers, glyphs and the village line art are static inline SVG from the same code.

## Folder map
```
src/content/pages/      home.md, rewilding.md, village.md, contact.md
src/content/journal/    articles (published and draft); _template.md is ignored
src/content/drafts/     unpublished material, never read for output
src/data/site.ts        nav, contact, map, socials, project facts, label definitions
src/templates/          HTML templates (plain TypeScript functions)
src/hero/               runtime: stage.ts (hero + page stages), band.ts, reveal.ts, main.ts (entry)
src/art/contours.ts     shared seeded noise field + contour tracer (build and browser)
src/lib/                Markdown renderer, content loader, helpers
src/styles/main.css     all styling and design tokens
public/                 images/, favicon.svg (copied as is)
scripts/                generate, postbuild, migrate-htmly
source-archive/         original HTMLy files (do not edit)
proposal/               design proposal, build spec, prototype, screenshots
```

## Hosting (Cloudflare, static, no backend)
The site is a Cloudflare Worker with static assets only. There is no Worker script: `wrangler.jsonc` points Cloudflare at `dist/`. The Worker is connected to this GitHub repository (Workers Builds), and every push to `main` runs `npm run build` and then `npx wrangler deploy`. Pushing to `main` therefore publishes the site.

- **Deploy by hand** (only if the Git connection is broken): `npx wrangler login`, then `npm run build && npx wrangler deploy`.
- **Domain.** `vitaminair.org` is a Custom Domain on the Worker, added in the dashboard (Worker > Domains) and not in `wrangler.jsonc`. The domain's registration, its DNS and the email routing for `tree@vitaminair.org` are in the same Cloudflare account.
- **Trailing slashes.** The canonical URLs end in `/`. Cloudflare redirects a request without the slash (the live site's old style, `/blog/2024/08/vitaminair-and-carbon-credits`) to the slash form. It serves `404.html` with a 404 status for unknown paths. Both are set under `assets` in `wrangler.jsonc`.
- **Headers.** `public/_headers` lets browsers keep the hashed files in `/assets/` for a year, and it sends `Strict-Transport-Security` on every response.
- **Analytics.** There is no analytics code in the repository. With Cloudflare Web Analytics on (automatic setup, in the dashboard), Cloudflare adds its beacon to each page as it serves it.
- **Another host.** Upload `dist/`. Every page is a directory with an `index.html` (`/rewilding/index.html`, `/blog/2024/08/slug/index.html`), so deep links work on any static host that serves directory indexes. For nginx, use `location / { try_files $uri $uri/ =404; }` (nginx 301s `/dir` to `/dir/`) and `error_page 404 /404.html;`. `vite preview` doesn't add the slash redirect, so use the slash form when previewing with it.
- **Legacy redirects.** `dist/_redirects`, written by `scripts/postbuild.ts`, sends real 301s for the old HTMLy URLs. Cloudflare applies it before it looks for a file, so the rules win over the meta-refresh stub pages at the same paths. The stubs (meta refresh plus canonical) forward visitors on hosts without `_redirects`, such as GitHub Pages or plain nginx.
  - Cloudflare ignores Netlify's forced form `301!` (`wrangler dev` lists those lines as invalid), so the rules use plain `301`. On Netlify a stub would win over a plain rule, so add the `!` back there.
  - Feed readers do not follow meta refresh, so `/blog/feed/rss` only redirects properly where `_redirects` is supported.
- The site needs no server code, database or API.
