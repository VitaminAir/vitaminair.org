# Homepage hero: "Living landscape" (concept learned from itonami.studio)

## What itonami does (studied 2026-10-11, from their page and home.js behaviour)
- A full-viewport "living stage": one `<canvas>` that cycles through **five named brand patterns** (Curiosity, Memory, Relationships, Becoming, Meandering).
- Each pattern arrives with its **own generative transition**: a mask reveal, threads that meander and draw themselves, elements "becoming". It holds, then hands over to the next.
- **Scene dots** (buttons labelled "Pattern 2: Memory", `aria-pressed`) show progress and let you jump between scenes.
- The wordmark and nav sit over the stage, with one short tagline at the bottom right. Pointer movement adds a little life.

**The concept we adopt:** a living, generative, two-tone pattern stage whose scenes each mean something, with named scene controls.
**What we do not copy:** their pattern artwork, image assets, code, colours, tagline or layout details. Every VitaminAir scene is drawn procedurally from forest and landscape forms (contours, grass, saplings, canopy, paths), in our palette, and each scene carries an **honest status label** from our field-notes system. That makes it ours.

## Our version: five scenes that tell the land story in order
Each scene has a name, a one-line caption and a status label. The captions use only facts from `site.ts` and existing copy.

| # | Scene | What's drawn (procedural, top-down landscape) | Colour | Caption | Label |
|---|---|---|---|---|---|
| 1 | **Land** | Topographic contour lines draw themselves along their length (dash-offset style), like a survey of the hills. | moss lines | "Almost 100 hectares in Cambodia." (`facts.landOwned`) | TODAY |
| 2 | **Recovery** | Grass strokes, then irregular clusters of small rounded shrub and leaf tufts that grow in (scale 0→1, staggered by cluster). Patchy and uneven, like natural regrowth: no grid. | moss / sage | "Much of it is being left to recover." | TODAY |
| 3 | **Planting** | Dense, slightly jittered rows of sapling marks in one compact patch: a dot that sprouts a short stem and two leaves. Miyawaki density, a small pilot area, not the whole screen. The rest stays faint contours. | **laterite** saplings on faint moss contours | "A small native planting trial." | PLANNED TRIAL |
| 4 | **Canopy** | Overlapping tree crowns seen from above (Poisson-disc circles of varied radius, each with 1–3 inner rings or lobes) filling the stage, growing outward. | moss / sage two-tone | "What we hope will grow, in time." | LONG-TERM VISION |
| 5 | **Village** | The canopy stays (dimmed). A meandering path thread draws through it, with a few small clearings, each holding a handful of tiny squares (homes, abstract). | laterite thread on dimmed canopy | "A village, one day." | LONG-TERM VISION |

These are abstract patterns, not photos or renderings of the site, so they don't claim achieved forest or buildings. The labels make the status explicit.

## Layout
- **Stage.** Full-bleed, directly under the header. Height `min(86svh, 880px)` on desktop and `min(70svh, 620px)` on mobile, with a minimum of 420px. Background `--forest-deep`. Patterns use a moss tone `#3F6E55` and a sage tone `#6F9478`. These are decorative, low contrast against the background on purpose, so text stays readable. Accent strokes use `--on-dark-mark` `#D98A62` (laterite tint suited to dark).
- **Header over the stage.** On the homepage only, the header sits on the stage: transparent background, paper-coloured wordmark and nav, with focus outlines in paper. Other pages keep the normal header. It is not sticky.
- **Text over the stage.**
  - Bottom left: the eyebrow `CAMBODIA · FOREST FIRST` (paper at 80%) and the h1 statement "*Rewilding* land in Cambodia." in `--on-dark`, with the field-marked underline in `--on-dark-mark`. Max width about 12ch per line.
  - Behind the text block, draw a soft **forest-deep scrim** (a radial or linear fade from `--forest-deep` at 85% to 0) so pattern strokes never reduce text contrast. Text contrast is measured against `--forest-deep`.
- **Scene bar** (bottom right on desktop; a full-width row under the h1 on mobile):
  - Current scene number and name, e.g. `03 · PLANTING`.
  - The caption and its status chip, in the dark-band chip styles.
  - Five dot buttons (44×44 hit area, 10px visible mark).
  - A pause/play button (44×44, labelled).
- **Below the stage**, on `--paper`: the intro paragraph and the CTA row (the primary laterite button "Explore the rewilding plan" plus the text link "Our village vision"), exactly as now. The rest of the homepage is unchanged.

## Motion and timing
- **Per scene:** the previous scene fades to the background over 700ms while the new one draws in over about 2600ms (eased with smoothstep). It holds for 3800ms, so each scene takes about 7s and the full loop about 35s. The loop repeats.
- **First load:** a short welcome. The stage starts empty `--forest-deep`, the h1 fades up over 600ms (opacity and an 8px translate; under reduced motion it is visible instantly), and scene 1's contours begin drawing 300ms later.
- **Pointer interaction:** see the addendum at the end of this file (this replaces the earlier "breeze" idea).
- **Scene dots:** jump to that scene, using a short transition (or an instant one under reduced motion).
- **Pause/play:** stops all motion, rAF included. Its label switches between "Pause animation" and "Play animation" and it has `aria-pressed`. The pause state persists in `sessionStorage` (wrapped in try/catch).
- **Performance:**
  - rAF runs only while the stage is visible (IntersectionObserver) and the tab is visible (`visibilitychange`).
  - Device pixel ratio is capped at 2.
  - Geometry is precomputed per scene on init and on resize (debounced at 150ms).
  - A seeded RNG makes the patterns stable across reloads; reseeding per day is fine.
  - Target: under 2ms of draw work per frame on a mid-range phone, and an 8KB gzipped budget for the module.

## Accessibility and fallbacks (required)
- **WCAG 2.2.2 (Pause, Stop, Hide):** the visible pause button handles it, and the animation stops automatically when off-screen or when the tab is hidden.
- **`prefers-reduced-motion: reduce`:** no cycling, no draw-in and no breeze. Render scene 1 fully drawn and static. The dots still work, swapping scenes instantly. The pause button is hidden because nothing moves.
- **No JS:** the stage server-renders a **static inline SVG of scene 1** (reuse the contour generator in `src/templates/contours.ts`, in moss on forest-deep), plus the scene-1 caption and label. The dots and pause button render with the `hidden` attribute and are revealed by the script. The h1 and CTA never depend on JS.
- **Semantics:** the canvas and SVG are `aria-hidden="true"`. The h1 is real text in the DOM. The scene bar's caption is plain text with no `aria-live`, to avoid chatter. Dot buttons have `aria-label="Scene 3 of 5: Planting"` and `aria-pressed`.
- **Focus:** a visible paper-coloured outline on dark. The tab order runs header, h1 area (no focusables), scene dots, pause, then the CTA below.
- **Content:** scene names, captions and labels live in `src/content/pages/home.md` front matter (`hero.scenes[]: {name, caption, status}`), with captions able to use `{{facts.*}}`. The drawing code lives in `src/hero/` (TypeScript), and the template only passes data through `data-` attributes or an inline JSON `<script type="application/json">`.

## Build notes
- This is the only runtime JS on the site: one module, `src/hero/stage.ts`, loaded only on the homepage with `<script type="module">`, which Vite bundles and hashes. Every other page stays script-free.
- Update the verification: "no `<script>`" applies to every page except the homepage, which has exactly one module script plus one JSON data script.
- Update README and CONTENT_GUIDE: where the scene text lives, and how to turn the animation off. Add a `hero.animate: true|false` front-matter flag; when false, only the static SVG renders.

## Addendum: interaction (owner request, 2026-10-11)
Moving the mouse or touching the screen should visibly animate the stage, with a different nature-themed response in each scene:

| Scene | Pointer move | Tap / click |
|---|---|---|
| Land | contours bulge away gently | a ripple ring runs through the contours |
| Recovery | grass and shrubs lean away like wind, then spring back | 6–12 new sprouts grow at that spot |
| Planting | (drag) plants a sapling every ~18px | plants a laterite sapling |
| Canopy | nearby crowns rustle | a burst of leaves drifts down |
| Village | a meandering path trail follows the pointer, then fades | a clearing glows briefly |

- **Touch:** `touch-action: pan-y` so the page still scrolls; a horizontal swipe changes scene; touch effects run at about 2× strength.
- **Autoplay:** the current scene holds while someone is interacting and resumes after 4s idle. Pausing stops autoplay but still allows user-triggered effects.
- **Reduced motion:** no ripple, wind, rustle or particles. Tapping in Recovery or Planting places the marks instantly, fully grown.
- **Hint:** "Move or tap to interact · swipe to change scene" is shown once per session.

The module budget is ≤ 11 KB gzip.

## Owner feedback (2026-10-11)
- The owner confirmed it's fine to override the original minimal-motion brief: "we want some liveness… natural pattern arts".
- They love the Land scene: thin, organic topographic contours on forest-deep, with nested rings, two line strengths and generous space. Its look is **locked**, and it sets the visual language for every other scene: thin line art, the same two-tone opacities, organic closed forms, nothing filled or noisy. The contours stay faintly beneath scenes 2–5, so the whole sequence reads as one landscape changing over time.
- **Full first screen (owner, 2026-10-11):** the hero fills exactly one screen on every device (`100svh`, with the header overlaid inside it). The h1 and the primary CTA sit inside the hero, and the intro paragraph follows below. There is a "Scroll" cue at the bottom, and it is tested at 8 viewport sizes from 320×568 to 2560×1440, including landscape phones.
