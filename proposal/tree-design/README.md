# "Plant a tree, one day": design package

Design only. Nothing here is wired into the site. Implements TREE_SPEC §1-§3 visually and sketches §5 as a concept.

## Files
- `icons/chheuteal.svg`, `koki.svg`, `beng.svg`, `thnong.svg`: the four species, drawn by seed or fruit.
- `icons/sapling.svg`: dot, stem, two leaves (the hero's Planting mark).
- `icons/plant-a-tree.svg`: small sapling on a ground line with a plus, for the scene-bar button and CTAs.
- `mockup.html`: self-contained static page (inline CSS, site tokens copied read-only from `src/styles/main.css`, fonts from `../../node_modules/@fontsource-variable/...` with system fallbacks). Sections: icon sheet, hero picker (phone and desktop, picker open and species chosen), interest dialog (default and error, phone and desktop), no-JS Rewilding CTA, future paid concept.
- Screenshots in `proposal/screenshots/`: `tree-design-icons|picker-mobile|picker-desktop|dialog-mobile|dialog-desktop|future|cta.png`.
- The mockup is generated markup; icons are inlined copies of the SVG files. Edit the SVGs as the source of truth.

## Icon mapping to the spec (§1)
| key | motif in the icon |
|---|---|
| chheuteal | ribbed nut with two long wings splayed in a V |
| koki | small nut with two broad wings spinning out opposite ways (a helicopter seed) |
| beng | broad woody pod with a row of seeds, one under a seed cap |
| thnong | round flat pod with a ruffled wing and a central seed bulge |

Koki's spec motif says "plus a leaf". The leaf was dropped because it made the icon read as a seedling next to the sapling icon; the spinning wing pair is distinctive on its own. Revisit if the owner wants the leaf.

All icons: viewBox 0 0 28 28, 1.25px stroke, round caps and joins, `currentColor`, no fills, and `vector-effect: non-scaling-stroke` applied by CSS (see below). One accent stroke per icon uses `style="stroke:var(--tree-accent,currentColor)"`: set `--tree-accent` to `--on-dark-mark` on dark and to laterite on paper; if unset it falls back to `currentColor`. Paper: forest stroke. Dark: `--on-dark` stroke.

## Design decisions
- Same hand as the hero: thin, slightly irregular closed forms, nothing filled. Laterite is the accent everywhere, matching the planted saplings.
- Picker: 4 diagonal 44px circular buttons around the tap point, each with a visible species label, dashed ring, 200ms pop (off under reduced motion). Chosen species is planted as its icon in `--on-dark-mark`.
- Card "Plant a real one, one day? →": paper card with a 44px dismiss, near the scene bar (above it on desktop, bottom of the stage on phone).
- Scene-bar "Plant a tree" text button: underlined text link style, 44px tall; icon glyph on desktop only, text only on phone for space.
- Dialog: paper surface, Fraunces forest title, PLANNED chip (laterite outline, same `.label--trial`), laterite-deep primary "Prepare email". The tree radio group uses 2-column tiles (icon, name, Latin name) with a custom radio mark; "No preference" is a tile too. Errors sit under the field with an "!" mark and laterite-deep text; typed input is kept. Phone: full-height scrolling sheet.
- Inputs use a darker edge (`--field-edge #7A6D55`) because `--rule` is too faint for a 3:1 field boundary. This is a mockup-only token; add it to main.css if adopted.
- Future concept: dashed "Concept — not for now" container; price shown only as "— per tree"; tracker uses done (solid), current (laterite), not yet (dashed) chips; sample email uses placeholders and the spec's honest-promise wording.
- Checks run in the browser on the mockup: all paper-surface text is at least 4.5:1, all interactive targets at least 44px. Dark-surface text uses site tokens already used by the hero.

## For the implementer later
- **Icons into `src/art/`:** add the six SVGs there (`src/art/` currently holds only `contours.ts`). Inline them from a small TS map `treeIcons[key]` so the template and the dialog can render them without runtime fetches. Add one CSS rule `.tree-icon * { vector-effect: non-scaling-stroke; }` and set `--tree-accent` per context. For the canvas, draw from the same paths with `Path2D` (stroke in `--on-dark-mark`, line width 1.25 at 28px scale).
- **Hook into `src/hero/stage.ts`:** in the Planting scene's tap handler (not swipe or drag), plant the sapling as now and open the picker at that point (clamp inside the stage, avoid the h1 and CTA rects). Picker buttons are real `<button>` elements in a `role="group"`, arrow-key navigation, Esc or outside tap closes, focus returns to the trigger. On choice: draw the species icon at the spot, show the card, and open the dialog with the species preselected. Opening counts as interaction for the 4s autoplay hold. The scene-bar button works on every scene and is the keyboard route. Budget: extra JS at most 3 KB gzip.
- **Data in `src/data/site.ts`:** `trees: [{ key, name, latin, line, khmer: "" }]` (Khmer left empty, owner to fill), plus `interest = { method: "mailto" }`. Mark the species list "to confirm with the nursery" in a code comment and add it to the content open questions. Mailto goes to `site.email` with subject "Plant a tree" and a body listing the fields.
- **No-JS:** the CTA block (mockup section 4) is plain HTML for the Rewilding closing CTA; Contact gains the "Planting a tree, one day" reason row.

## Open questions
- Draft microcopy beyond TREE_SPEC: the two error messages, "Or write to <email>", "required", "1 to 20", and the species line "A tall native dipterocarp of lowland forest." (only given for Chheuteal in the spec; the other three need neutral lines).
- Koki icon leaf (above); owner may prefer it.
- Whether the phone dialog should be a sheet or an inset card.
- The hero background in the mockup is an SVG approximation, not the real canvas.
