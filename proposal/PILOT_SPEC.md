# Planting pilot page: build spec

Owner request (2026-10-14): a separate page that works as a field guide for the planting pilot. Then: "follow the current VitaminAir design system". So the brief's sage palette is **not** used as given. Use the site tokens in `src/styles/main.css` (warm paper, forest headings, laterite as the one accent, Fraunces + Public Sans, thin `--rule` borders, 2px radii, labels, rows, contour dividers, page stage). The three plots get three green tints mixed from `--forest` on paper so the diagram stays in the family.

## Route and wiring

- URL: `/rewilding/pilot/`. Not in the main nav. Nav highlights Rewilding (`nav: '/rewilding/'`, `navExact: false`).
- Data: `src/data/pilot.ts`. All numbers are computed from a few constants, never typed twice.
- Template: `src/templates/pilot.ts` exports `pilotPage(build, scenes)`. Uses `layout`, `pageStage`, `divider`, `edge`, `label`, `esc`.
- `scripts/generate.ts`: add the route and push `{ path: '/rewilding/pilot/', title: 'Planting pilot' }` to `pages` (sitemap picks it up).
- Styles: a new `/* planting pilot */` block in `main.css`, all selectors prefixed `.pilot-`. Plus a `@media print` block.
- Runtime: none needed beyond what exists, except opening all `<details>` on `beforeprint` (add 2 lines to `src/hero/main.ts`, guarded by `document.querySelector('.pilot')`).
- Rewilding page: link to the pilot page and update the pilot facts (see "Rewilding changes").

## Numbers (`src/data/pilot.ts`)

```
SITE_HA = 1, SITE_SIDE_M = 100            // conceptual 100 m × 100 m
PLANTED_HA = 0.5                          // three plots together
PRICE_USD = 1                             // planning assumption
plots: A 10,000/ha, B 20,000/ha, C 30,000/ha
plotM2 = PLANTED_HA*10000/3 = 1666.67 m²  → "1,667 m²", "0.1667 ha"
side   = sqrt(plotM2) = 40.82 m           → "40.8 m × 40.8 m"
perM2  = density/10000 → 1, 2, 3
spacing= sqrt(1/perM2) → 1.00, 0.71, 0.58 m
saplings = round(plotM2*perM2) → 1,667 · 3,333 · 5,000 (sum 10,000)
cost = saplings*PRICE → $1,667 · $3,333 · $5,000 (sum $10,000)
remaining = SITE − planted = 0.5 ha = 5,000 m²
```

Add a build-time assertion in `pilot.ts` that throws if the sapling sum ≠ 10,000 or cost sum ≠ 10,000.

## Page outline and copy

Use this copy. It is checked against `proposal/VOICE.md`; don't add adjectives, exclamation marks or hero language.

### 1. Stage (h1)
`pageStage({ eyebrow: 'Rewilding · Planting pilot', statement: 'VitaminAir Forest Restoration *Pilot*', cfg: { scene: 'planting', seed: 7, label: true }, scenes })`. The h1 text must read "VitaminAir Forest Restoration Pilot".

### 2. Intro (`section.pilot-intro.container`)
- Lead (serif italic-free, larger, `.pilot-sub`): "Testing planting density to understand forest growth, survival, and fire resilience."
- Paragraph: "VitaminAir is testing three planting densities on approximately one hectare of land. The goal is to understand how different densities affect tree survival, growth, canopy development, ground vegetation, and the long-term cost of restoring a diverse native forest."
- The experiment line, big and immediate: three items in a row (wrap on mobile), separated by thin rules: **10,000** trees/ha · **20,000** trees/ha · **30,000** trees/ha, each with its plot letter (A/B/C) and a small swatch of the plot tint. Numbers in Fraunces, tabular.
- Headline figures as a `dl.facts.facts--grid` (existing component): Pilot land — approximately 1 hectare; Saplings — 10,000; Assumed sapling price — US$1 each; Initial sapling budget — US$10,000 (sapling purchase only). The "(sapling purchase only)" note must be visible next to the figure.
- Status line: existing `label('planned')` chip + "This is a plan. Nothing on this page has been planted yet."

### 3. The planting layout (main feature, `section.pilot-layout`, id `layout`)
h2 "The planting layout". One-line intro: "A conceptual way to divide about one hectare: three equal plots on half of it, and the other half kept for access, firebreaks and buffers."

**SVG** (`viewBox="-6 -6 112 118"` or similar, units = metres, 100 × 100 site). `role="img"`, `aria-labelledby` title + desc. Layout:
- Site boundary: 0,0 → 100,100, `--rule`-dark stroke, dashed (not surveyed).
- Perimeter firebreak/buffer: the 6 m band inside the boundary, fill sand (`--paper-2`) with a fine diagonal hatch pattern.
- Plot A at (6, 6), Plot B at (53.18, 6), Plot C at (6, 53.18). Each 40.82 × 40.82.
- Access track: the 6.36 m cross between plots (x 46.82–53.18 and y 46.82–53.18), sand, no hatch, with a dashed centre line.
- Bottom-right quadrant (53.18, 53.18, 40.82 × 40.82): "Reference area or natural regeneration (to be decided)". Fill paper, dashed outline, light hatch at a different angle.
- Inside each plot, a `<pattern>` with **true-scale** sapling spacing (tile 1.00 / 0.7071 / 0.5774 m, one dot r≈0.16 m, colour `--forest` at ~45% opacity). So the dots shown ≈ the sapling count. Plot fill tints: A `color-mix(in srgb, var(--forest) 12%, var(--paper))`, B 24%, C 38%. Define these as CSS vars `--plot-a/b/c` in `:root` and use them both in SVG (via `fill: var(--plot-a)` in CSS classes) and swatches. Check text contrast on C (use `--forest-deep` text; must be ≥ 4.5:1).
- Plot labels inside each plot, on a small paper-coloured label plate so the dots don't hurt legibility: big letter "A" + "10,000/ha", second line "1,667 saplings". Font sizes in metres so they scale; at 360px wide the big line must still be ≥ 12px rendered (so ≥ ~3.4 m font-size). Keep labels short; details go in the key.
- Dimension marks: one dimension line on Plot A top edge, "40.8 m"; one on the site's left edge, "≈100 m". Thin lines, ticks.
- Small north-agnostic note: no compass (we don't know orientation).

**Key** (beside the SVG on ≥ 900px, below it on mobile): an `ol.pilot-key` of four items: Plot A, Plot B, Plot C, Remaining land. Each: swatch, name, and a mini `dl` — Density, Area (0.1667 ha · 1,667 m²), Size (40.8 m × 40.8 m), Saplings, Spacing. Remaining land: "About 0.5 ha. Access tracks, firebreaks, protective buffers, and possibly a reference area left to regenerate on its own. Not counted as planting land."
- Hover/focus link (no JS): each key item has `tabindex="0"` and class `pilot-key-a` etc. Use `:has()` so hovering or focusing a key item highlights its plot (stroke `--laterite`, 0.5 m) and dims the others slightly. Hovering a plot in the SVG highlights itself. Must degrade gracefully without `:has()`.
- Totals row under the key: "Three plots · about 0.5 ha · 10,000 saplings".

**Caption** (`figcaption`): "Conceptual drawing, not a surveyed site plan. It assumes a square 100 m × 100 m site. The real boundary, slope, drainage, access and fire risk will set the final layout. Each dot in a plot stands for one sapling at the equivalent square spacing."

Mobile: the SVG is full width (square is fine), key stacks below as a vertical list; nothing scrolls sideways.

### 4. Density comparison (`section`, h2 "Three densities, side by side")
- Intro: "Most dense native plantings use two to five saplings per square metre. We want to see, on our own soil and through our own dry seasons, what changes between one, two and three."
- Visual: three "sample squares", each a 3 m × 3 m sample drawn in SVG at true spacing: 9, 18, 27 dots (B and C on rotated/offset grids are fine as long as the count is exact and they look even). Under each: "1 per m² · 1.00 m apart" etc. Same scale for all three. Caption "A 3 m × 3 m patch of each plot."
- The table (`.pilot-table`, inside an `overflow-x:auto` wrapper, numerals right-aligned, tabular): exactly the brief's rows: Trees per m², Approximate square spacing, Pilot plot area, Saplings allocated, Sapling purchase cost. Column heads "Plot A · 10,000/ha" etc.
- Hypotheses under h3 "What we think may happen": short intro "These are ideas to test, not results." then a list:
  - Denser planting may push trees to compete and grow upward faster.
  - Faster canopy may shade out grasses and other competing plants.
  - Less dry grass may, in time, mean less fine fuel to carry a fire.
  - Thinning may give us healthy young trees to move to other cleared areas.
  - Higher density also means more competition for water, nutrients and space. More saplings may die, and each plot costs more to plant.
- Then a `.note`-style aside (existing `note` styles if suitable, otherwise a left-rule block): "Dense planting does not stop fire on its own, least of all in the first years while the trees are small. Fire planning comes first on every plot." Do not say any density is best.

### 5. The starting budget (h2 "The starting budget")
- Headline line (Fraunces, large): "10,000 saplings · US$10,000 estimated purchase cost".
- A simple stacked CSS bar showing the three shares (16.7% / 33.3% / 50%) in the plot tints, labelled below with the dollar amounts. Not a chart library.
- Table: Item / Quantity / Estimated cost: Plot A seedlings ~1,667 ~$1,667; Plot B ~3,333 ~$3,333; Plot C 5,000 $5,000; **Total 10,000 $10,000** (bold total row with a top rule).
- Qualification paragraph (italic not required, muted, but full contrast ≥4.5:1): "US$1 per sapling is a planning assumption, not a confirmed supplier quotation. This budget covers sapling purchases only. Transport, site preparation, planting labour, maintenance, fire management, replacements, monitoring, and long-term protection are additional costs to be estimated." No replacement reserve anywhere.

### 6. What we are trying to learn (h2)
Intro: "The pilot is for gathering real evidence before deciding whether to plant more of the cleared land, and how." Then a numbered list (`ol.pilot-learn`, two columns on desktop, grid with thin rules, Fraunces numbers):
1. **Survival.** Which density keeps the most saplings alive?
2. **Growth.** How fast do trees grow in height and settle in?
3. **Canopy closure.** Which density makes useful shade soonest?
4. **Fire exposure.** How does dry grass and fine fuel change as the trees grow?
5. **Thinning.** Can healthy young trees be moved to other cleared areas and survive?
6. **Cost.** What does each surviving tree cost to establish and look after?

### 7. Monitoring timeline (h2 "Monitoring schedule", eyebrow-ish note "Proposed. None of this has happened yet." with `label('planned')`)
`ol.pilot-timeline`: horizontal on ≥ 900px (a thin line through dots, 7 steps; allow two rows or horizontal scroll inside its own container if too tight — prefer a 4+3 or a 7-column grid with small text), vertical on mobile (line on the left). Steps (title / body):
- Month 0 — Record site conditions, species, initial seedling counts and planting costs.
- Month 3 — Check establishment, early losses, and watering or maintenance needs.
- Month 6 — Record survival, height, grass cover and maintenance effort.
- Month 12 — First-year review of survival and growth.
- Month 24 — Compare growth, canopy, ground cover and cumulative costs.
- Every year after — Keep monitoring and write down major changes.
- When thinning starts — Record how many trees were removed and their condition, transplant attempts, and transplant survival. (Mark this one visually different: dashed dot, "No fixed date".)

### 8. Thinning and transplanting (h2 "Thinning and transplanting")
Two short paragraphs:
"As the dense plots grow, some trees will probably need thinning. We want to find out whether some of the healthy young trees can be moved to other cleared areas instead of being thrown away."
"That depends on the species, the size of the tree, the season, how much the roots are disturbed, and whether moved trees survive. We will thin when growth and competition in the plots show it is time, not on a fixed year. The first moves would be a small trial, timed to the rainy season."

### 9. Important considerations (h2 "Important considerations")
Use the existing `.rows` + `details` + `summary` + `.sign` + `.det-body` pattern (see `detailsRow` in `src/lib/html.ts`; no `name` grouping so several can be open). Items:
- **Same species mix in every plot** — The three plots should use the same native species mixture in similar proportions, as far as nursery supply allows. Species follow local suitability, confirmed provenance and what nurseries can supply.
- **Record site differences** — Soil, slope, drainage, moisture, existing vegetation and sun exposure, for each plot, at the start.
- **One plot per density is not a controlled trial** — If plots sit on different parts of the land, site differences may affect the results. With a single plot per density, we cannot fully separate the effect of density from the effect of place. We will say so when we report.
- **Judge more than tree count** — Compare survival, canopy growth, fire exposure and total cost, not how many trees went in.
- **Fire** — Keep access tracks and firebreaks clear, manage dry vegetation, and have a dry-season fire plan before planting.
- **Transplanting** — Only in suitable conditions, preferably early in the rainy season, and first as a small trial.

### 10. Closing (inside reading width)
Short line + link back: "This plan will change as we learn the land. Results, including what doesn't work, will go in the [journal](/blog/)." and "← [How we rewild](/rewilding/)". No CTA button, no donation.

## Page meta
- title: `Planting pilot · VitaminAir`
- description (must be 120–160 chars): "VitaminAir's planned planting pilot: three plots at 10,000, 20,000 and 30,000 trees per hectare, the sapling budget, and what we will measure."  (verify length; adjust words, not facts)

## Design rules
- Tokens only from `:root` (+ the three new `--plot-*`). No new fonts, no gradients, no blobs, no icons, no emoji, no images/photos.
- Section rhythm like the detail pages: `--section-y`, `--head-gap`, `.container` width for diagram/table/timeline; prose blocks capped at ~66ch.
- h2 use existing `.section-h` style or `.reading h2` style; headings stay forest green.
- Use `divider(seed)` between major sections (as `withDividers` does on Rewilding).
- Numbers: `font-variant-numeric: tabular-nums`; big figures in Fraunces.
- Focus: visible 3px forest outline (existing). Touch targets ≥ 44px for summaries.
- Reveal: put `rv` on sections and `data-rv` on their first elements if you want the existing fade-up; never hide the SVG under no-JS.
- Mobile at 360px and 390px: no horizontal page scroll; only the tables may scroll inside their own wrapper.
- Print (`@media print`): hide header nav, menu, stage canvas/svg art, footer art, edges, dividers; white background; `details` content visible (the beforeprint script opens them); avoid page breaks inside the SVG figure, table, timeline steps; links don't need URLs printed; plot tints must survive (`print-color-adjust: exact` on the figure and swatches).

## Rewilding changes
- `src/data/site.ts` facts: `pilotArea: 'about 1 hectare'`, `pilotSaplings: '10,000'`.
- `rewilding.md` glance: "Next planting" value stays "Miyawaki pilot, {{facts.pilotArea}}"; the next row becomes label "First batch" value "{{facts.pilotSaplings}} saplings, at 1, 2 and 3 per m²".
- "What we plan next" paragraph: replace the sentence "Our first batch, {{facts.pilotSaplings}} saplings at about three per square metre, would plant roughly one hectare." with "The pilot plans {{facts.pilotSaplings}} saplings in three equal plots, at one, two and three per square metre, on about half a hectare. The rest of the hectare is kept for access and firebreaks. [The planting pilot](/rewilding/pilot/) page has the layout, budget and what we will measure." In the "Still to work out" list change "Exactly where the pilot goes, and how dense the planting should be" to "Exactly where the pilot goes".
- "What we'll record": "The next planting starts with the 1–2 hectare pilot" → "The next planting starts with the pilot of about one hectare".

## Addendum (2026-10-14): "Marking out the plots", a field layout with clear measurements

Owner asked whether 1 tree per m² means 4 trees at the corners of every square. It doesn't: a tree on a grid corner is shared by 4 squares, so 4 × ¼ = 1. The page needs a section the planting team can follow on the ground, with every distance drawn and labelled.

### One method for all three plots: rows, in-row spacing, stagger

| Plot | Per m² | Row spacing | Tree spacing in a row | Every 2nd row shifted by | Nearest neighbour |
|---|---|---|---|---|---|
| A | 1 | 1.00 m | 1.00 m | 0 (no shift) | 1.00 m |
| B | 2 | 0.50 m | 1.00 m | 0.50 m | 0.71 m |
| C | 3 | 0.50 m | 0.67 m (2/3 m) | 0.33 m (1/3 m) | 0.60 m |

Density check: 1 / (row × in-row) = 1, 2, 3. Compute everything in `src/data/pilot.ts` from `rowM`, `inRowM`, `shiftM` per plot (add these to `Plot`), and assert `1/(rowM*inRowM)` ≈ perM2.

Plot B is the same as a 1 m grid with one extra tree in the centre of every square. Say this in its caption.

### Whole-plot counts (computed, not typed)
First row on the plot edge, first tree on the corner. Rows at y = 0, row, 2·row, … ≤ side (side = 40.82 m). Unshifted rows have trees at x = 0, inRow, … ≤ side; shifted rows start at x = shift. Expected: A 41 rows × 41 = 1,681; B 82 rows, 41 + 41 → 3,362; C 82 rows, 62 / 61 → 5,043; total 10,086. Show per plot: rows, trees per row, trees if the whole square is filled, vs planned. Note under it (copy):
"Filling the whole 40.8 m square this way takes about 1% more trees than planned (10,086 instead of 10,000), because the first row and first tree sit on the edge. Either order about 1% more, or leave the last row of each plot short. Decide before ordering. Count each row as it is planted and write down the real number."

### Diagrams (replace the old 3 m × 3 m sample squares in "Three densities, side by side")
Remove `sampleSvg`/`sampleDots` and the `.pilot-samples` figure there. Put a new section right after "Three densities, side by side": h2 **"Marking out the plots"**, intro "One tree per square metre does not mean four trees around every square. A tree on a corner is shared by the four squares that meet there, so each square gets a quarter of four trees: one. The drawings show a corner of each plot, to scale, with every distance the team needs."

Three SVG diagrams (one per plot), side by side ≥ 1000px, stacked below. Each shows a 3 m × 2.5 m corner patch of the plot, in metres, same scale for all three:
- Plot fill tint (`pilot-fill-a/b/c`), the two plot edges that meet at the corner drawn as solid darker lines labelled "Plot edge" and a "Corner" label + peg mark (small square) at (0,0). The other two sides fade/dashed (patch continues).
- Faint guide strings along each row (thin dashed lines), since the team will plant along strings.
- Trees as dots (r ≈ 0.07 m) at the exact field positions above. Shifted rows' dots identical, no colour coding needed.
- **Dimension lines** (thin, with end ticks, label on a paper plate, sans 600, tabular):
  - in-row spacing between the first two trees of row 1 (above the patch): "1.00 m" / "1.00 m" / "0.67 m"
  - row spacing between row 1 and row 2 (left of the patch): "1.00 m" / "0.50 m" / "0.50 m"
  - for B and C, the shift between row 1's first tree and row 2's first tree: "shift 0.50 m" / "shift 0.33 m"
  - nearest-neighbour for B and C as a thin dotted line between two closest trees with "0.71 m" / "0.60 m"
- **One 1 m² box**, dashed laterite outline, placed so it contains exactly 1 / 2 / 3 trees with none on its border: A box [0.5,1.5]×[0.5,1.5]; B box [0.25,1.25]×[0.25,1.25]; C box [0.1,1.1]×[0.25,1.25]. Label "1 m² = 1 tree" / "= 2 trees" / "= 3 trees". Add a build-time check counting the trees inside each box.
- Minimum rendered text 12px at 360px viewport. If labels collide at small widths, simplify (e.g. move nearest-neighbour to the caption on mobile is NOT possible in SVG, so pick sizes that work at 360).
- Under each diagram: "Plot A · 1 per m²" and a mini `dl`: Rows every / Trees every / Shift every 2nd row / Whole plot (rows × trees = total, planned N).

Then an `ol.pilot-steps` **"Step by step"** (numbered, Fraunces numbers like the learning list):
1. Peg the four corners of the 40.8 m square. Check it is square: both diagonals should measure 57.7 m.
2. Along the two side edges, put a peg at every row spacing: every 1.00 m for Plot A, every 0.50 m for Plots B and C.
3. Stretch a string between the first pair of pegs. Mark it at the tree spacing: every 1.00 m for A and B, every 0.67 m for C.
4. Plant at each mark, starting on the corner.
5. Move the string to the next pair of pegs. In Plots B and C, start every second row shifted: 0.50 m in B, 0.33 m in C.
6. Count the trees in each row as they go in, and write the number down.
Plus a short line "**Tools:** a 50 m tape, string, pegs, and sticks cut to 1.00 m, 0.67 m, 0.50 m and 0.33 m."
(57.7 = side × √2, compute it.)

### Keep everything consistent
- The big site plan's `<pattern>`s must use the same field layout: A tile 1×1 one dot at (0,0); B tile 1 × 1 dots at (0,0) and (0.5,0.5); C tile 0.6667 × 1 dots at (0,0) and (0.3333,0.5). Pattern origin at the plot corner.
- The comparison table row "Approximate square spacing" stays (it describes density). Add one row after it: "Field layout" → "Rows 1.00 m, trees 1.00 m" / "Rows 0.50 m, trees 1.00 m, shifted" / "Rows 0.50 m, trees 0.67 m, shifted".
- The hero, budget and planned counts stay 1,667 / 3,333 / 5,000 (the plan). The 10,086 only appears in the marking-out section with the note above.
- Print: the diagrams and steps must print; avoid breaks inside each diagram.

## Addendum 2 (2026-10-14): new densities 20k / 30k / 40k and 20,000 saplings

Owner: "1 sapling per metre is too far apart. 0.5 m is better for the smallest. Push from 10k to 20k." Chosen plan: **20,000 / 30,000 / 40,000 trees per ha, 20,000 saplings in total, US$20,000 sapling budget.** This supersedes every density, count and cost above. Everything stays computed in `src/data/pilot.ts`; update the build assertions to 20,000.

### Numbers
- Total saplings `TOTAL = 20000`, price US$1 → US$20,000 (sapling purchase only, same qualification text).
- Densities 2, 3, 4 per m² → equal plot area `TOTAL / (2+3+4)` = 2,222.2 m² = 0.2222 ha each; planted 0.6667 ha; remaining 0.3333 ha (3,333 m²).
- Saplings: 4,444 · 6,667 · 8,889 = 20,000 (round each; assert the sum). Costs the same in dollars.
- Square-equivalent spacing: 0.71 · 0.58 · 0.50 m.

### Site plan (100 m × 100 m conceptual) — new geometry, squares no longer fit
Three equal **strip plots side by side**:
- 5 m firebreak/buffer inside the boundary all round (inner area 90 × 90 m).
- Plots **26.67 m wide × 83.33 m long** (= 2,222.2 m²), x positions 5, 36.67, 68.33 (5 m tracks between them), y from 5 to 88.33.
- A 6.67 m access strip across the far end (y 88.33–95), then the 5 m buffer.
- Check: plots 3 × 2,222.2 = 6,666.7 m²; everything else = 3,333 m². Compute these from constants (BUFFER_M = 5, TRACK_M = 5), assert the areas sum to 10,000 m².
- No separate reference area fits any more. Remove that zone from the plan.
- Plot labels in three short lines on the paper plate: "A" / "20,000/ha" / "4,444" (word "saplings" goes in the key). They must fit inside 26.67 m width and stay ≥ 12px at 360.
- Dimension marks: plot A width "26.7 m" and length "83.3 m"; site edge "≈100 m".
- Dots use the field layout below, pattern origin at each plot corner.

Key "Remaining land" copy: "About 0.33 ha: a 5 m firebreak and buffer around the edge, 5 m tracks between the plots, and an access strip along one end. Not counted as planting land. A reference area left to regenerate on its own would need to sit outside this hectare." Totals line: "Three plots · about 0.67 ha · 20,000 saplings". Plot key rows: Area "0.2222 ha · 2,222 m²", Size "26.7 m × 83.3 m".
Layout intro: "A conceptual way to divide about one hectare: three equal strips on two thirds of it, and the rest kept for firebreaks, tracks and access."
Caption: keep, but "It assumes a square 100 m × 100 m site" stays and the last sentence stays as it is now.

### Field layout (rows run across the 26.67 m width; strings are 26.7 m long)
| Plot | Per m² | Rows every | Trees every | Every 2nd row shifted | Nearest |
|---|---|---|---|---|---|
| A | 2 | 0.50 m | 1.00 m | 0.50 m | 0.71 m |
| B | 3 | 0.50 m | 0.67 m | 0.33 m | 0.60 m |
| C | 4 | 0.50 m | 0.50 m | none (0.5 m square grid) | 0.50 m |
1 m² boxes: A [0.25,1.25]² → 2 trees; B [0.1,1.1]×[0.25,1.25] → 3; C [0.25,1.25]² → 4 (verify none on the border; adjust if needed). Labels "1 m² = 2 trees" etc.

Whole-plot counts, edge-inclusive (first row on the edge, first tree on the corner), rows stepped along the 83.33 m length, trees along the 26.67 m width. **Use an epsilon (1e-6) in the ≤ comparisons** — 26.667/0.6667 lands exactly on an integer. Expected: 167 rows each; A 27 per row → 4,509; B 41/40 → 6,764; C 54 → 9,018; total 20,291 (+1.5%). Compute, don't hard-code; the note text must interpolate the computed total and percentage: "Filling each whole plot this way takes about 1.5% more trees than planned (20,291 instead of 20,000), because the first row and first tree sit on the edge. Either order about 1.5% more, or leave the last row of each plot short. Decide before ordering. Count each row as it is planted and write down the real number."

Steps (replace):
1. Peg the four corners of each 26.7 m × 83.3 m plot. Check it is square: both diagonals should measure 87.5 m. (compute √(w²+l²))
2. Along both long edges, put a peg every 0.50 m. Each peg pair is one row.
3. Stretch a string across the plot between the first pair of pegs. Mark it at the tree spacing: every 1.00 m in Plot A, 0.67 m in Plot B, 0.50 m in Plot C.
4. Plant at each mark, starting on the corner.
5. Move the string to the next pair of pegs. In Plots A and B, start every second row shifted: 0.50 m in A, 0.33 m in B. Plot C is not shifted.
6. Count the trees in each row as they go in, and write the number down.
Tools: "a 100 m tape (or a 50 m tape used twice), string, pegs, and sticks cut to 1.00 m, 0.67 m, 0.50 m and 0.33 m."

Marking-out intro (replace): "Trees per square metre is an average across the plot, not a number of trees around each square. A tree standing on a corner is shared by the four squares that meet there. The drawings show a corner of each plot, to scale, with every distance the team needs." Remove the "Plot B is the same as a 1 m grid…" note; instead under Plot A: "The same as a 1 m grid with one extra tree in the centre of every square." Under Plot C: "A plain 0.5 m × 0.5 m grid."

### Copy elsewhere
- Hero experiment line: 20,000 · 30,000 · 40,000 trees/ha. Figures: Saplings 20,000; Initial sapling budget US$20,000 (sapling purchase only).
- Budget headline: "20,000 saplings · US$20,000 estimated purchase cost"; table ~4,444 / ~6,667 / ~8,889 / 20,000 / $20,000.
- Comparison intro: "…what changes between two, three and four." Table: Trees per m² 2/3/4; square spacing 0.71/0.58/0.50 m; plot area 0.2222 ha; saplings; cost; Field layout row per the table above ("Grid 0.50 m × 0.50 m" for C).
- Column heads "Plot A · 20,000/ha" etc. everywhere.
- Considerations: add one row **"Long, narrow plots"** — "Strips have more edge than squares. Trees on the edge get more light and more grass around them, so record the outer rows separately from the inside of each plot."
- Meta description: update densities (still 120–160 chars).
- `site.ts`: `pilotSaplings: '20,000'`. `rewilding.md`: glance "at 2, 3 and 4 per m²"; paragraph sentence → "The pilot plans {{facts.pilotSaplings}} saplings in three equal plots, at two, three and four per square metre, on about two thirds of a hectare. The rest of the hectare is kept for firebreaks and access. [The planting pilot](/rewilding/pilot/) page has the layout, budget and what we will measure."
