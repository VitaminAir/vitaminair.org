# VitaminAir build spec (v1: design and build first, content pass afterwards)

> Note numbering: number the `NOTE nn` eyebrows automatically, in section order, from the template. The homepage order follows the brief: land today 01, approach (forest band) 02, learn 03, village 04, journal 05.

The user asked to design and build the site first and refine the content afterwards. They also pointed to **itonami.studio** as a reference. This spec keeps the "Field notes" structure and borrows the *principles* behind itonami (confident statements, one dramatic section, photo beside text), redrawn in VitaminAir's own visual language. Draft copy from `PROPOSAL.md` is used as working content and will be revised later.

## Design: "Field notes" (learning from itonami, not copying it)

### What we learn from itonami.studio (inspected 2026-10-11) and how we make it our own
The user wants the *idea*, not a copy: VitaminAir must look like itself. We borrow principles, and every visual device below is reinterpreted around land, forest and field documentation.

| itonami principle | itonami's version (do NOT reproduce) | VitaminAir's own version |
|---|---|---|
| Confident editorial statements | ~105px Libre Baskerville H1, a coloured *italic* word | Big Fraunces statements (soft serif, upright). The single accent word is **"field-marked"**: upright, forest green, with a hand-drawn laterite underline stroke (inline SVG/CSS `text-decoration` 0.12em, offset 0.14em, `--laterite`), like a word underlined in a notebook. No coloured italics. |
| Small uppercase eyebrows | Plain tracked labels ("MISSION", "VISION") | **Field-note entry eyebrows**: `NOTE 01 · THE LAND TODAY`, `NOTE 02 · OUR APPROACH` …, with a tabular-nums number. This ties into the "documentation" identity. |
| One dramatic dark section | Charcoal band, giant italic *question* | A **forest-deep band** with a faint **topographic contour-line pattern** (static inline SVG, `--paper` at 7% opacity, aria-hidden, generic contours, not a real map). It holds an upright statement, "Leave what is recovering. Help what is not.", plus short line-broken lines and the two approach rows. |
| Text beside a large photo | Half-bleed photo plus statement | The half-bleed photo stays (a common pattern), but it is framed like a field record. Under the photo, a **caption bar** in small tabular type: `ARCHIVE PHOTO · NOT THE TRIAL PLOT`. |
| One organic line motif | Freehand looping green line | No squiggle. The contour lines (above) are our only motif, also used very faintly in the footer. |
| Footer signature line | `ITONAMI · A CULTURAL STUDIO / SEE HOW WE EXPLORE. / PHNOM PENH / EVERYWHERE` | Our own: `VITAMINAIR · REWILDING IN CAMBODIA` | `info@vitaminair.org` | **`SITE UPDATED 11 OCT 2026`** (build date, generated automatically, as a documentation habit). |
| Short rhythmic copy lines | Their sentences | Our own lines in our voice, written in the content pass. Never reuse their wording. |

What we do not take at all: the full-screen pattern carousel (the brief forbids carousels), scroll-reveal animation (the brief rules out heavy scroll effects, and content must be visible without JS), the 8-item nav, their fonts and their colours.

### Tokens (unchanged from PROPOSAL.md; contrast verified)
`--paper #F4EDDF` · `--paper-2 #EDE2CC` · `--ink #1D2420` · `--ink-soft #4F5A54` · `--forest #1E5A43` · `--forest-deep #123B2C` · `--laterite #A34A26` · `--laterite-deep #8A3C1E` (primary button) · `--rule #CBB894`.
On the dark band (`--forest-deep` background), text is `--on-dark` (#F6F1E6), secondary text is `#C9D3CC`, and rules are `rgba(246,241,230,.22)`.

### Type
- **Fraunces Variable**, self-hosted via `@fontsource-variable/fraunces`, upright only (no italic file needed). Used for display, headings and the wordmark. Display weight is 560–600 with `"SOFT" 50` and `"opsz"` auto, letter-spacing −0.02em, line-height 1.02.
- **Public Sans Variable**, self-hosted via `@fontsource-variable/public-sans`. Used for body text, eyebrows and labels.
- **Scale.**
  - Hero statement: `clamp(2.6rem, 7vw, 6.2rem)`
  - Page statement: `clamp(2.4rem, 6vw, 5rem)`
  - Forest-band statement: `clamp(2.6rem, 6.5vw, 5.6rem)`, upright, weight 500
  - Section heading: `clamp(1.9rem, 3.4vw, 2.6rem)`
  - Body: 17px/1.65
  - Eyebrow: 12.5px, 600, +0.12em, uppercase
- **Accent word ("field-marked").** In statements, Markdown `*emphasis*` renders upright in `--forest` with a laterite underline (0.12em thick, 0.14em offset, `text-decoration-skip-ink: none`). On the dark band it renders `--paper` with a `#D98A62` underline. Use one per statement at most.

### Status labels
These are the same as in the prototype. `TODAY`, `PLANNED TRIAL`, `LONG-TERM VISION` (dashed), `STORY` (dotted), `ARCHIVE` (filled) and `REFLECTION` (plain text). Radius ≤ 2px.

### Layout
- Container max 1240px with a 20px side gutter, rising to 40px at ≥960px. Reading column ~66ch.
- **Header.** Wordmark `VitaminAir` (Fraunces 600) on the left. Nav on the right: Rewilding · Village vision · Journal · Contact. The current page is marked with a 1px underline and `aria-current="page"`. Below 720px, the nav wraps under the wordmark. No hamburger, no JS.
- **Footer.**
  - A hairline on top, then our three-part line: `VITAMINAIR · REWILDING IN CAMBODIA` | `info@vitaminair.org` | `SITE UPDATED {build date, e.g. 11 OCT 2026}`.
  - A second row: Telegram · Facebook · Instagram · YouTube · Journal RSS · Map ↗.
  - This stacks on mobile.

### Homepage, in order
1. **Hero.** Eyebrow `CAMBODIA · FOREST FIRST` (no note number). Statement h1 "*Rewilding* land in Cambodia." (max ~14ch per line). Below that, two columns at ≥960px: the intro paragraph on the left (max 52ch); the two arrow links and a compact status legend on the right. Stacks on mobile.
2. **Half-bleed "The land today"** (`NOTE 01`; the order of notes follows the page, so number them in DOM order: land 01, approach 02, learn 03, village 04, journal 05). On desktop, `mountain.jpg` sits on the left and bleeds to the viewport edge, around 50% wide, using object-fit cover with a min-height. On the right: eyebrow plus `TODAY` label, heading, the fact `<dl>` rows and the map link. The figcaption caveat stays visible under the photo. On mobile the photo goes full-width on top.
3. **Forest band, "Our approach"** (`NOTE 02`). It has the faint contour-line SVG background. Left: upright statement "Leave what is *recovering*. Help what is not." (dark-band size, upright, weight 500). Right: line-broken paragraphs (from `home.md`), then two expandable rows (Natural recovery `TODAY`, Native planting trial `PLANNED TRIAL`) styled light-on-dark.
4. **"What we want to learn"** `PLANNED TRIAL`. SmallWorld-style: eyebrow and heading on the left (~1/3), four expandable rows on the right.
5. **Village** (`NOTE 04`). `LONG-TERM VISION` label. Statement h2 "A village, *one day*.", a paragraph, and a link to `/village/`. No decorative line.
6. **Journal.** Heading on the left. On the right, the five most recent `featured: true` published entries (fall back to latest): title, label, date and `→`. Then "All entries →".
7. **Get in touch.** Statement "Get in *touch*." on the left. On the right: the paragraph, the email (large link) and "Visits by arrangement."

### Detail pages (statement + reading column)
- **Rewilding** (`/rewilding/`). Eyebrow `REWILDING`. Statement "Leave what's recovering. *Test* what isn't." Then the banner photo (`sunset-strip.jpg`, caption caveat), then the reading column of Markdown with `{status}` labels on h2s and the rows container for Questions.
- **Village** (`/village/`). Eyebrow `LONG-TERM VISION`. Statement "A village, *one day*." Reading column, with an explore-rows container and Related reading.
- **Contact** (`/contact/`). Eyebrow `CONTACT`. Statement "Get in *touch*." Reading column: the reasons list, the email, the map and the socials.
- **Journal** (`/blog/`). Eyebrow `JOURNAL`. Statement "Notes, stories and *older* pieces." Status legend, then entries grouped by year (newest first), each row showing title, labels and date.
- **Article** (`/blog/YYYY/MM/slug/`). "← Journal", a labels row, h1 (page-statement size, scaled down to `clamp(2.2rem,5vw,3.6rem)`), and a meta line (date · "By {author}" if set · legacyCategory if set). Then the note box if `note` is set, the optional image with alt and caption, and the Markdown body in the reading column. At the bottom: "More from the journal" with the previous and next entries.
- **404 page.**

### Motion
The flow pass (FLOW_SPEC.md) superseded the original "no motion, no scripts" rule. Motion is now: the `+`/`×` row sign, link/row/button hover micro-interactions (CSS only), the canvas stages, the section reveal (fade-up, accent underline and divider draw-in) and the slow living contour field in the homepage approach band. All of it is disabled or static under `prefers-reduced-motion`, and all content is visible without JS.

### Script policy (replaces "no scripts on any page")
- **Every page with a stage** (home, rewilding, village, journal, contact, 404 and the articles) carries exactly three script elements: the tiny inline head script (`document.documentElement.classList.add("js")`), the inline JSON data script (`application/json`, scene data for the stage) and one `<script type="module">` (the Vite-bundled `src/hero/main.ts`: hero or page stage, reveal, and on the homepage a lazily loaded band chunk).
- **No page ships any other script**, no third-party scripts, no analytics. Hero with `hero.animate: false` omits its JSON script only.
- Budgets: hero + stage module and shared art code <= 12 KB gzip; reveal <= 1.5 KB gzip.

### Shared art module
`src/art/contours.ts` (DOM-free) holds the seeded noise field, marching-squares contour tracer and path helpers. The browser canvas (`src/hero/*`) and the build-time SVG renderers (`src/templates/art.ts`: static stage SVG for no-JS/reduced motion, band background, footer, dividers, edges, glyphs) draw from the same field, so static and live art match. Stage scene and seed per page: front matter `stage: {scene, seed, label}`; articles derive the seed from the slug.

## Architecture

- Vite 8.3.1 + TypeScript. No UI framework. Pinned deps: `vite@8.3.1`, `typescript@7.0.2`, `tsx@4.23.15`, `marked@18.0.14`, `gray-matter@4.0.3`, `@fontsource-variable/fraunces@5.3.0`, `@fontsource-variable/public-sans@5.3.0`. Use exact versions in package.json.
- **Generate, then Vite MPA build.**
  - `scripts/generate.ts`, run with tsx, reads `src/content/**`, `src/data/site.ts` and templates in `src/templates/*.ts` (plain TS functions returning HTML strings, with escaping helpers). It writes one `index.html` per route into `.site/` (gitignored), plus `404.html`.
  - `vite.config.ts` sets `root: '.site'` and `publicDir: '../public'`, and globs every `.site/**/*.html` as rollup `input`, so Vite hashes and bundles the shared CSS (`src/styles/main.css`, referenced from each page as a module stylesheet) and fonts. `build.outDir: '../dist'`.
  - A small Vite plugin in dev re-runs the generator when `src/content`, `src/data`, `src/templates` or `src/styles` change, then triggers a full reload.
  - After the Vite build, `scripts/postbuild.ts` writes `dist/sitemap.xml`, `dist/blog/feed.xml` (RSS 2.0), `dist/robots.txt`, `dist/_redirects` (Netlify/Cloudflare Pages syntax), and **meta-refresh + canonical stub pages** for each legacy non-article URL, so redirects also work on hosts without `_redirects`.
- **npm scripts.**
  - `dev`: generate, then vite
  - `build`: `tsc --noEmit`, generate, `vite build`, postbuild
  - `preview`: `vite preview` on dist
  - `check`: `tsc --noEmit`
  - `migrate`: one-off HTMLy converter
- **Markdown.** Rendered by `marked` with GFM on, plus a few small extensions:
  - A heading suffix `{status=today|planned|vision|story|archive}` renders the label chip after the heading text.
  - A `::: rows` … `:::` container turns each `### Title` and its following content into a `<details class="row">` with `name` set to a shared group.
  - Images become `<figure>`, using the title text as `<figcaption>`, with `loading="lazy"` and `decoding="async"`.
  - External links get `rel="noopener"`.
  - Tables are wrapped in an `overflow-x:auto` div.
  - No raw-HTML sanitising is needed (the content is first-party), but front matter must never leak into output.
- **Facts in one place.** `src/data/site.ts` is typed and exports:
  - `site` (name, url `https://vitaminair.org`, description, email, mapUrl, socials[], nav[])
  - `facts` (landOwned "Almost 100 hectares", cleared "Around 30–40 hectares", clearedWhen "20–30 years ago", pilotArea "0.25–0.5 hectare", pilotSaplings "around 10,000", location "Cambodia")
  - `status` (naturalRecovery: 'today', plantingTrial: 'planned', village: 'vision')
  - the label definitions

  Templates read the label and fact values from here. Page Markdown can interpolate facts with `{{facts.landOwned}}` (a simple replace before rendering) so a figure is changed once.
- **Content folders.**
  ```
  src/content/pages/home.md        front matter: hero, approach (question, lines, rows[]), land (caption), learn (rows[]), village, journal heading, contact
  src/content/pages/rewilding.md   front matter: eyebrow, statement, image, imageAlt, caption; body Markdown
  src/content/pages/village.md
  src/content/pages/contact.md
  src/content/journal/*.md         articles (published + drafts; drafts excluded)
  src/content/drafts/*.md          unpublished material (never read by the generator for output)
  src/content/journal/_template.md copyable template (underscore files are ignored)
  public/images/                   optimised images (copy from proposal/images; jpg + webp)
  public/favicon.svg               simple leaf or "V" mark in forest green
  source-archive/                  original files (already present; do not modify)
  ```
- **Article front matter.**
  ```yaml
  title: "…"
  date: "2024-08-28T14:58:52-07:00"   # ISO; displayed as 28 Aug 2024
  description: "…"
  type: "article" | "update" | "story" | "reflection"
  status: "published" | "draft"
  archive: true                       # optional → ARCHIVE label
  note: "…"                           # optional context note box
  tags: ["Posts", "Projects"]
  legacyCategory: "Forestry and Nature"  # optional
  author: "CD Bella"                  # optional, verified only
  image: "/images/mountain.jpg"       # optional
  imageAlt: "…"
  featured: true                      # optional, homepage selection
  canonical: "/blog/2024/08/vitaminair-and-carbon-credits"  # optional; else derived
  sourceFile: "2024-08-28-14-58-52_posts,projects_vitaminair-and-carbon-credits.md"  # migrated only
  legacyImage: "https://vitaminair.org/blog/content/images/va-1207.jpg"  # migrated only, not displayed
  ```
  - **URL derivation.** If `canonical` is set, use it. Otherwise use `/blog/YYYY/MM/<slug>`, where slug is the filename minus a leading `YYYY-MM-DD-` and minus `.md`.
  - **Output path.** `dist/<path>/index.html`. Links in the site use a trailing slash.
  - **Validation.** The generator validates front matter and **fails the build with a clear message** on a missing title, a bad date, an unknown type/status, or a duplicate path.
  - **Drafts.** A file with `status: draft` anywhere is excluded from pages, listings, sitemap and RSS. The dev server shows drafts at their URL with a "DRAFT — not public" banner only when `VA_SHOW_DRAFTS=1`. The default is excluded in both dev and build, which keeps it simple.

## Migration (`scripts/migrate-htmly.ts`)
- Parse the 11 files in `source-archive/vitaminair/`.
  - Filename: `YYYY-MM-DD-HH-MM-SS_<tags>_<slug>.md`.
  - Comments: `<!--t … t-->` title, `<!--d … d-->` description, `<!--tag … tag-->`, `<!--image … image-->`.
  - Strip the comments, decode HTML entities, and drop the trailing `---` rule at the end of each body.
  - Time zone `-07:00`, matching the live RSS feed.
- Write to `src/content/journal/YYYY-MM-DD-<slug>.md` with an explicit `canonical: /blog/YYYY/MM/<slug>`.
- **Mapping.** All published files get `author: "CD Bella"` and their `legacyCategory`.

| slug | type | archive | status | legacyCategory | note | image | featured |
|---|---|---|---|---|---|---|---|
| leadership-and-growth-learning-and-playing-with-vitaminair | article | yes | published | Leadership and Personal Growth | P | /images/sunset-strip.jpg | – |
| building-a-strong-future-with-vitaminair | article | yes | published | Community and Recreation | P | /images/sunset-strip.jpg | – |
| growing-together-with-vitaminair | article | yes | published | Community and Recreation | P | /images/sunset-strip.jpg | – |
| potential-titles-for-posts | – | – | draft → **src/content/drafts/** | – | – | – | – |
| personal-growth-finding-your-path-through-leadership | article | yes | published | Leadership and Personal Growth | P2 | /images/sunset-strip.jpg | – |
| the-dawn-of-red-moon-valley | story | – | published | Community and Recreation | "Fiction. Red Moon Valley and its characters are imagined, not part of VitaminAir's history." | /images/mountain.jpg | yes |
| sacred-forest-journey-of-discovery-and-renewal | story | – | published | Leadership and Personal Growth | "Fiction. The school, farm, solar power and internet in this story are imagined. They are not facilities on our land." | /images/sunset-strip.jpg | yes |
| on-leadership-and-team-building | article | yes | **draft** (in journal folder; live 404, pending owner decision) | – | – | (legacyImage leaders.png only) | – |
| reconnecting-with-nature-finding-inspiration | reflection | – | published | Community and Recreation | "A personal reflection from 2024." | /images/mountain.jpg | yes |
| vitaminair-and-carbon-credits | article | yes | published | Forestry and Nature | C | none (legacyImage va-1207 kept, not shown) | yes |
| the-little-lizard-and-the-brave-traveler | story | – | published | Leadership and Personal Growth | – | /images/sunset-strip.jpg | yes |

- **P:** "Written in 2024 about learning activities we hoped to offer young people. It is not a description of a current programme or schedule."
- **P2:** the same as P, plus " Mentors and workshops mentioned here are not current offers."
- **C:** "Archived discussion from August 2024. VitaminAir has not obtained carbon verification. The figures in this article are exploratory estimates, not measured project results or an offer of carbon credits."
- **Captions** for reused images: mountain.jpg is "Photo from VitaminAir's archive." and sunset-strip.jpg is "Photo from VitaminAir's archive." Neither is presented as the trial plot.
- Also write `MIGRATION.md`: a manifest table of source file → new file → URL → status/type/labels, plus image decisions and the legacy route map.

## Legacy routes
Article URLs are identical; output goes to `/blog/2024/MM/slug/index.html`. The following redirect with 301 in `_redirects`, and also get stub HTML:
- `/blog/home/` → `/`
- `/blog/about/` → `/village/`
- `/blog/contact` and `/blog/contact/` → `/contact/`
- `/blog/category/*`, `/blog/tag/*`, `/blog/archive/*`, `/blog/author/*` → `/blog/` (stubs for the known ones: the categories leadership-and-personal-growth, community-and-recreation and forestry-and-nature; the tags posts, programs, personal-growth, projects and stories; the archives 2024, 2024-07, 2024-08 and 2024-09; the author chas)
- `/blog/feed/rss` → `/blog/feed.xml`

The root `/` is now the homepage.

## Docs to write
- **README.md.** Requirements, install, dev, build, preview; the folder map; static hosting notes. Cover deep links, trailing-slash behaviour on Netlify, Cloudflare Pages, GitHub Pages and plain nginx (`try_files $uri $uri/ =404`), `_redirects` versus stub pages, and a statement that serving needs no backend.
- **CONTENT_GUIDE.md.** How to change a fact, edit a page, add a post (template), replace an image, change status (draft → published, archive), and generate the static output. State plainly that every edit needs a rebuild.

## Verification (must run and report)
1. `npm run check` and `npm run build` succeed.
2. Output contains the 9 published articles at their exact legacy paths, plus /, /rewilding/, /village/, /contact/, /blog/ and 404.html. `grep -r` in dist for "Potential Titles" and "On Leadership and Team Building" returns nothing. The sitemap and RSS list exactly 9 articles plus the core pages.
3. Titles, dates and bylines match the migration table.
4. `vite preview`, then Playwright at 1440×900 and 390×844 for home, rewilding, village, contact, journal and two articles: screenshot each, confirm no horizontal overflow (scrollWidth ≤ clientWidth), tab through the homepage to confirm visible focus, and confirm details rows open with the keyboard. Also directly load `/blog/2024/08/vitaminair-and-carbon-credits` (no slash), `/blog/home/` and `/blog/feed/rss` stubs.
5. **Markdown workflow demo.** Add `src/content/journal/2026-10-11-workflow-test.md` (published, using headings, lists, a link, an image, a blockquote, an hr, a code block and a table). Build, then confirm the page exists at `/blog/2026/10/workflow-test/` and appears first in /blog/. Switch it to draft, rebuild, and confirm it is absent everywhere. **Delete it** and rebuild.
6. No invented facts: the copy comes only from PROPOSAL.md / home.md and the fact strings above.
