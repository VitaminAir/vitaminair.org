# Flow pass: carry the hero's design language through the whole site

The owner wants the whole site to feel fluid and connected, using the hero's language: live, natural line art. The "Living landscape" hero (HERO_SPEC.md) is the source of the visual DNA:
- thin organic contour line art on forest-deep, in the moss `#3F6E55` and sage `#6F9478` two-tone
- laterite accents used sparingly
- warm paper and sand surfaces
- Fraunces statements with the field-marked accent
- honest status labels
- responsive to mouse and touch

Keep every existing token, font, label, copy and route. The colour preference stands: green headings, warm earth surfaces, and laterite for the primary button.

## 1. Shared building blocks (make these reusable)

1. **Contour generator, one source.** Extract the hero's contour field into a shared module, `src/art/contours.ts`, used by both the build-time SVG renderer (templates) and the client canvas. It is seeded, so a given seed and size always give the same lines. Remove the older separate `src/templates/contours.ts` once its uses are migrated.
2. **Page stage** (a smaller sibling of the hero) for the detail pages:
   - **Height:** `min(62svh, 640px)`, at least 420px. On mobile, `min(56svh, 520px)`. The transparent header sits inside it, as on the homepage.
   - **Scene:** one scene per page, which does not cycle:
     - Rewilding: **Planting**, showing laterite saplings over contours, with the `PLANNED TRIAL` label
     - Village: **Village**, with the `LONG-TERM VISION` label
     - Journal: **Land**
     - Contact: **Land**, with a different seed
     - 404: **Land**, faint
   - **Contents:** the eyebrow and statement h1 sit inside the stage, bottom-left, over the same scrim as the homepage.
   - **Interaction:** the same pointer and touch interaction as that scene on the homepage.
   - **Motion:** a draw-in on load. There are no scene dots. Keep the pause button only if there is continuous motion; if the stage is still after draw-in and idle, no pause is needed.
   - **Fallbacks:** reduced motion and no-JS show the static SVG version.
   - **Loading:** load the same hero module, code-split so each page loads only what its scene needs if that's cheap; otherwise one shared module is fine. Report the sizes.
3. **Article pages stay script-free.** Their header is paper with a faint static contour watermark: moss at about 12% opacity, top-right, fading out toward the text and never behind body text. Then the existing article layout.
4. **Organic band edges.** Where a forest-deep band meets paper (the approach band, the footer, the bottom of page stages), replace the straight cut with a gentle contour-shaped edge: an inline SVG path generated from the same contour field, 24–48px tall, filled with the band colour. Keep it subtle, and keep it static.
5. **Contour dividers.** Replace the plain 1px rules *between major sections on paper* with a thin single contour line (a static SVG stroke in `--rule`, about 1px, gently undulating, full container width). Keep straight hairlines inside lists and rows, where they aid scanning.
6. **Spacing rhythm.** One section padding token, `--section-y: clamp(64px, 10vw, 140px)`, and one heading-to-content gap token, used by every section on every page, so the vertical rhythm flows.

## 2. Liveness beyond the hero (gentle, natural)

1. **Section reveal.**
   - **What:** as each section enters the viewport, its eyebrow, heading and first block fade up 12px over 600ms, staggered 80ms.
   - **Accent underline:** the field-marked accent underline draws from left to right over 700ms.
   - **Contour dividers:** they draw along their length over 1.2s.
   - **Trigger:** IntersectionObserver with a 15% threshold, running once per element.
   - **Progressive enhancement:** content is fully visible without JS. Add a `js` class on `<html>` before first paint (a tiny inline script in the head is acceptable) and apply the hidden start state only under `.js`.
   - **Reduced motion:** everything is visible immediately.
   - **Scope:** homepage and detail pages; not articles.
2. **Hover and focus micro-interactions.** These are CSS only and disabled under reduced motion.
   - Text links: the underline thickens and shifts slightly, like a contour line tightening.
   - Journal rows: a thin contour line draws under the row and the `→` moves 4px.
   - Primary button: the arrow moves 3px.
   - Row summaries (where any remain): the `+` rotates as now.
3. **Forest band liveness.** On the homepage approach band, run the faint contour background as a *very slow* living field: contours drift by changing the noise offset, about 1 cycle per 60s, and react softly to the pointer (a bulge, like hero scene 1). It stops off-screen, follows the hero's pause state (one shared pause preference), and is static under reduced motion.
4. **Footer.** The contours stay static. No motion in the footer.

## 3. Homepage sections, applying the system

- **Below the hero:** the intro paragraph goes on paper, with a contour divider after it.
- **NOTE 01, land today.**
  - Keep the half-bleed photo.
  - Overlay a thin contour-line frame that bleeds off the photo's inner edge onto the paper. It's static SVG in moss at about 35% and ties the photo to the line art.
  - The caption bar stays.
  - The fact rows keep straight hairlines.
- **NOTE 02, approach band.** Organic top and bottom edges, the slow living contour field, and two visible items.
- **NOTE 03, learn.** On paper, with the 2×2 items. Above each item's term, add a tiny line-art glyph drawn in the same hand. Each glyph is 28px, a 1.25px stroke in forest, a static inline SVG and `aria-hidden`:
  - Cost: a coin-like tree ring
  - Care: a watering drop
  - Survival: a sun over a sapling, for the dry season
  - Changes in the land: contour rings
- **NOTE 04, village.**
  - **Background:** a sand band with a faint static village-scene line art (path and clearings) at the right edge, at about 15% opacity, so it never touches the text column.
  - **Edges:** organic top and bottom.
- **NOTE 05, journal.** Hover micro-interactions on the rows.
- **Contact band.**
  - **Background:** paper, with a faint Land contour watermark behind the statement. It must stay at least 4.5:1 for all text, so keep it at ≤ 10% opacity and measure.
  - **Statement:** "Get in touch." with the field-marked accent.

## 4. Detail pages

- **All:** the page stage replaces the current statement header. After that, the reading column, the same section rhythm, and contour dividers between major h2 sections where a page has 4 or more.
- **Rewilding:** the "Trial at a glance" block follows directly after the stage, and the banner photo moves just below it as a figure inside the reading column, captioned. Status chips stay next to the h2s. The closing CTA block gets the organic edge and a sand background.
- **Village:** the "What this isn't (yet)" note box comes right after the stage and intro. The explore items get small line-art glyphs in the same hand: home, food, water, energy, connectivity, community, learning. Keep these simple and consistent: 28px, 1.25px stroke, forest.
- **Journal:** the Land stage, then the year groups and the labels details below.
- **Contact:** the Land stage. The primary button and the mailto list follow.
- **404:** a faint Land stage containing the statement, then the button.
- **Articles:** a paper header with the static contour watermark, the existing layout, and "More from the journal" with the row hover.

## 5. Constraints and checks
- No new npm dependencies. Runtime JS loads only on pages with a stage, plus the tiny head script on those pages; articles have none.
- **Budgets:** the hero plus stage module stays ≤ 12 KB gzip total, and the reveal code ≤ 1.5 KB gzip.
- **Accessibility:**
  - one h1 per page
  - visible focus everywhere, including over dark
  - tap targets ≥ 44px
  - all text ≥ 4.5:1, measured including watermarks and scrims
  - with reduced motion everything is static and visible
  - with no JS everything is visible
- **Responsive:** no horizontal overflow at 320, 390, 768, 1280, 1440 and 1920. Page stages work in landscape on phones.
- **Build:** `npm run check` and `npm run build` pass. There are 9 articles at legacy paths, the sitemap has 14 entries and the feed 9 items, and the Markdown workflow still works: re-run the add-post demo quickly, then delete it.
- **Screenshots:** `flow-<page>-<desktop|mobile>.png` for home (full page), rewilding, village, journal, contact, one article and 404. Look at them and fix anything that breaks the flow: abrupt edges, inconsistent spacing, or a glyph style that doesn't match the hero's line art.
- **Docs:** update README, CONTENT_GUIDE (where scene and stage choices live per page, front matter `stage: {scene, seed}`) and BUILD_SPEC (a short note on the shared art module).
