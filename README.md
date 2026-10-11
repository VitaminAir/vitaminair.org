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

## Hosting (static, no backend)
Upload `dist/`. Every page is a directory with an `index.html` (`/rewilding/index.html`, `/blog/2024/08/slug/index.html`), so deep links work on any static host that serves directory indexes.

- **Trailing slashes.** The canonical URLs end in `/`. A request without the slash (the live site's old style, `/blog/2024/08/vitaminair-and-carbon-credits`) must be redirected or served from the directory:
  - **Netlify / Cloudflare Pages:** serve it automatically (Netlify "pretty URLs" on; Cloudflare Pages does by default).
  - **GitHub Pages:** redirects `/dir` to `/dir/` automatically. No `_redirects` support there; the stub pages carry the legacy redirects.
  - **nginx:** `location / { try_files $uri $uri/ =404; }` (nginx 301s `/dir` to `/dir/`). Use `error_page 404 /404.html;`.
  - `vite preview` does not add the slash redirect; use the slash form when previewing.
- **Legacy redirects.** `dist/_redirects` (Netlify syntax) gives real 301s. The same old URLs also exist as small meta-refresh + canonical stub pages, so hosts without `_redirects` (GitHub Pages, plain nginx or S3) still forward visitors.
  - **Why the rules are forced.** Netlify serves an existing file before a normal redirect rule, so a stub at `/blog/about/index.html` would win over `/blog/about/ /village/ 301`. Every generated rule therefore uses `301!` (force), which makes Netlify send a real 301 and ignore the stub. The stubs stay as the fallback for other hosts.
  - **Cloudflare Pages.** Redirects already take priority over static files there, and its parser does not document the `!` flag. If it rejects the lines, delete the `!` from `301!` in `scripts/postbuild.ts` and rebuild.
  - Feed readers do not follow meta refresh, so `/blog/feed/rss` only redirects properly where `_redirects` is supported.
- The site needs no server code, database or API.
