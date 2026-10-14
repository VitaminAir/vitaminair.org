# Content guide

Everything below needs a rebuild to show on the site: run `npm run build` and upload `dist/`. Use `npm run dev` to preview while editing.

## Change a fact
Edit `src/data/site.ts`: `facts` (land figures, pilot size), `status` and `labels` (label wording), `site` (email, map link, socials, partners, nav). SmallWorld (parent) and KOOMPI, StadiumX (sister companies) are `site.parent` / `site.sisters`, plain names; add a `url` to link one. `{{facts.partners}}` prints the "Working with ..." line with links, and the footer shows it on every page. The land size appears once, in the Rewilding "At a glance" list, and should stay out of headings, descriptions and social previews. Tone for all copy is in `proposal/VOICE.md`. In Markdown, write `{{facts.landArea}}` (or `{{facts.landArea|lower}}` for "around 80 hectares") and the value is filled in at build time. Fact text written in plain prose is not updated automatically, so use the placeholder wherever a figure appears.

## Edit a page
- Home: `src/content/pages/home.md`. The front matter holds the headings, captions and items for each section: `hero.scenes` (five entries, each `name`, `caption`, `status` of today | planned | vision: the text and honest label shown on the animated hero), `hero.animate` (`false` turns the animation off and leaves a static picture), `hero.primary` (the one primary button) and `hero.link`, `approach.items` (two visible items, each with `status`), `learn.items` (visible term + sentence), `contact.subject` (email subject). Put `*asterisks*` round the one accent word in a statement.
- Rewilding, Village, Contact: the front matter holds the eyebrow, statement and (rewilding) photo; the body is ordinary Markdown. Rewilding also has `glance` (the "Trial at a glance" rows; values come from `facts`).
- Status label after a heading: `## What is happening now {status=today}`. Values: `today`, `planned`, `vision`, `story`, `archive`.
- Expandable rows: wrap `### Title` + text sections in `::: rows` ... `:::`.
- Visible items (hairline, no toggle, 2 columns on desktop): `::: items` ... `:::` with `### Term` + sentence.
- Note box: `::: note` ... `:::` (may contain a heading and text).
- Named figure (journal posts): `::: figure miyawaki-steps` ... `:::` inserts a static diagram built at build time from `src/templates/figures.ts` (add new ones to `FIGURES` there). Any text inside the container becomes its caption. An unknown name fails the build and lists the known names.
- Primary button, once per page: `[Email us](mailto:info@vitaminair.org?subject=Hello%20from%20the%20website){.btn-primary}`. Every other link stays a plain link. Mailto links should always carry a `?subject=` (spaces as `%20`).
- Facts used by the Rewilding "at a glance" list: `pilotArea`, `pilotSaplings`, `pilotMethod`, `pilotFunding` in `site.ts`.
- If there are no published posts, the journal page shows "No entries yet. New notes will appear here when we publish them." and the homepage journal section is hidden.

## Choose a page's stage scene
Detail pages open with a stage. In the page front matter: `stage: {scene: planting, seed: 3, label: true}`. `scene` is land, recovery, planting, canopy or village; `seed` changes the landscape; `label: true` shows the scene caption and its status label (taken from `hero.scenes` in `home.md`). `closing: true` (rewilding) turns everything after the last `---` into the sand closing block. Journal and 404 use Land (set in `src/templates/pages.ts`); articles use Land with a seed from the slug. Long article titles (over 50 characters) automatically step down in size.

## Add a post
1. Copy `src/content/journal/_template.md` to `src/content/journal/YYYY-MM-DD-your-slug.md`. The URL becomes `/blog/YYYY/MM/your-slug/`.
2. Fill in the front matter and write the post in Markdown (headings, lists, links, images, quotes, rules, code, tables).
3. Keep `status: "draft"` while writing; the build excludes it everywhere.
4. Set `status: "published"` and run `npm run build`. The post gets its page, appears first in the journal (sorted by date), and joins the sitemap and RSS.

Every page and post needs a `<meta description>` of 120-160 characters, and the build fails with the page name if it is outside that range. For posts it uses `description`; if that is longer or shorter (older migrated posts), add `metaDescription: "..."` (120-160 characters) and `description` stays as the journal summary. The default social image is `site.ogImage` in `src/data/site.ts` (with `site.ogImageAlt`).

Front matter: `title`, `date`, `description`, `type` (article | update | story | reflection), `status` (published | draft) are required. Optional: `archive: true`, `note`, `tags`, `author` (only confirmed bylines), `image` + `imageAlt` (+ `imageCaption`), `featured: true` (homepage list shows the 5 most recent featured), `metaDescription`, `canonical` (keep an existing URL). A wrong value fails the build with a message naming the file.

## Replace an image
Put the optimised file in `public/images/` (keep the name to replace it, or use a new name and update the reference). Always give alt text. Photos on the homepage and Rewilding page are set in the front matter of `home.md` / `rewilding.md`. Images in use (all in `public/images/`, jpg + webp, 800px wide, from the owner's public Telegram channel unless noted):
- `land-nov-2023.jpg`: Home "The land today" and the default social image (`site.ogImage`).
- `dry-season-2020.jpg`: Rewilding top photo (April 2020).
- `hill-2020-2024.jpg`: Rewilding, "What is happening now" (the 2020 and 2024 composite).
- `reclaimed-2023-a.jpg`, `reclaimed-2023-b.jpg`: Rewilding, shown as a pair with `::: pair` (two image lines and a caption line).
- `stream-nov-2023.jpg`: optimised but not used yet.
- `camp-2020-*`, `stream-2020-*`, `hill-2020-*`, `road-2020`, `valley-2020-*`: the three February 2020 stories (base camp, the stream, the hill and the valley). Photos by Charles DiBella (mentor), from his channel https://t.me/tour2020 (posts 614-695).
- `trail-2020`, `fire-2021-*`, `planting-2021-*`, `water-2020-*`, `garden-2020-raised-bed`, `dew-2020-sensor`, `aland-2021-*`: the 2020-21 stories (water experiments, planting and the fire, the A-land homestead design), from https://t.me/vitaminair. Every story ends with links to its original Telegram posts; keep them as backlinks.
- `mountain.jpg`, `sunset-strip.jpg`: archive photos, used only on journal articles, captioned "Archive photo, not the trial plot".
Do not display more than the image's own width (800px). `tag:` in front matter is optional; leave it empty for a real photo of the land, and keep "not the trial plot" wherever a reader could mistake a photo for the trial plot.

## Change status
- Draft to published or back: edit `status` in the post.
- Mark an older piece as archive: `archive: true` (adds the ARCHIVE label; add a `note` for context).
- `src/content/drafts/` is never published. A draft left in `journal/` is also excluded.
- `on-leadership-and-team-building` is a draft pending the owner's decision (the live URL returns 404).

## Generate the static output
`npm run build` produces `dist/`. See README.md for hosting.

## Tree art (src/art/trees.ts)
One seeded, DOM-free library draws every tree on the site (hero Recovery, Planting and Village scenes, the no-JS Rewilding stage, the village band art, the "Survival" glyph). Reference sheet: `proposal/screenshots/trees-library.png`.
- Species (keys are indices into `TREES`): Koki, Chheuteal, Thbeng, Phchek, Beng, Thnong, Neang nuon, Sralao, Chrey, Spung, plus Thnot (sugar palm) and Russey (bamboo) as landscape extras. **Species list to confirm with the nursery/owner.** Names and Latin binomials only; no growth, carbon or use claims.
- Picking a type: dry or recovering ground, use Phchek, Thbeng, Sralao, Thnong, with young Koki and Chheuteal. Planting rows, mix Koki, Chheuteal, Beng, Thnong, Neang nuon at seedling size. Village, Chrey and Thnot near clearings. Never use colour to tell types apart; the silhouette does it.
- Sizes: `TREE_H[type] * STAGE[0|1|2]` (seedling, sapling, young). Canvas: `drawTree(ctx, type, x, y, h, lean, seed, growth, bend)` between `beginPath()` and `stroke()`. Templates: `treeD(type, x, y, h, seed)` returns SVG path data.
