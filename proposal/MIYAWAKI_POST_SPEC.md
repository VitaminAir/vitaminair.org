# Journal post: "Miyawaki guide to restoration" (visual)

Owner (2026-10-14): retitle the post to "Miyawaki guide to restoration"; read the SpiceTree Munnar guide too; make it visual and easy for people who don't like reading much. Replace `src/content/journal/2026-10-14-before-we-plant.md` (delete it) with `src/content/journal/2026-10-14-miyawaki-guide.md` → URL `/blog/2026/10/miyawaki-guide/`. Not deployed yet, so no redirect needed.

Sources: (1) a three-page "Miyawaki Method Mini-Forest Planting Guide" PDF shared with us (no author; don't link it); (2) https://spicetreemunnar.com/complete-guide-miyawaki-method/ (a resort/farm stay in Kerala that has planted with the method; credit and link it once).

## Mechanism: named figures in Markdown
- Add a container `::: figure <name>` … `:::` to `src/lib/markdown.ts` (extend the existing container regex; the body, if any, is a Markdown caption → `<figcaption>`). Output `<figure class="mfig mfig--<name>">…</figure>`.
- Registry in a new `src/templates/figures.ts`: `export const FIGURES: Record<string, () => string>`. Unknown name → throw with the list of known names (build fails loudly, like other content errors).
- Figures are static inline SVG/HTML generated at build time. No runtime JS. Each SVG has `role="img"` + `<title>` (and the text content of HTML figures is real text, readable by screen readers).
- Numbers in the "at our scale" figure are computed from `src/data/pilot.ts` (planted m² and total saplings), so the post stays in step with the pilot page. Ranges come from the per-m² figures below × planted area, rounded sensibly (tonnes to whole numbers, m³ to tens, litres to thousands).
- Reuse `src/art/trees.ts` (`treeD`, `TREES`, `TREE_H`) for any tree drawing so trees match the rest of the site.
- CSS: a `/* journal figures */` block in `main.css`, selectors `.mfig*`. Site tokens only (paper, paper-2, forest, forest-deep, laterite, rule, ink-soft; `--plot-a/b/c` tints are fine). Thin strokes, 2px radii, Fraunces for big numbers, Public Sans for labels, tabular numerals. Figures may be a little wider than the reading column on desktop if needed (max ~760px) but never cause horizontal page scroll. All text ≥ 12px rendered at a 360px viewport. Must print cleanly (no breaks inside a figure).
- Look and feel: calm field-notebook diagrams, like the pilot page. No emoji, no clip-art icons, no gradients. Simple line drawings are welcome where they explain something.

## Front matter
```
title: "Miyawaki guide to restoration"
date: "2026-10-14T09:00:00+07:00"
description: "A short, visual guide to the Miyawaki method: layers, soil, density and care, what it would take on our pilot, and where we will do things differently."
type: "update"
status: "published"
tags: ["Rewilding", "Planting"]
```
(Description must be 120–160 chars; adjust wording only if the build complains.)

## Body (copy verbatim; figures where marked)

The Miyawaki method grows a small native forest fast. You plant many native species close together on loose, well-fed soil, then look after them closely for about three years. This is our short guide to it, and what it would mean on our [planting pilot](/rewilding/pilot/).

::: figure miyawaki-steps
:::
**miyawaki-steps**: six numbered steps in a row (3×2 grid on tablet, 2×3 or a vertical list on phone). Each: Fraunces number, a small line drawing (simple, ~48px, forest stroke), a 2–4 word title and one short line:
1. Survey — Find what grows wild within about 20 km. (drawing: a small hill with trees and a dashed circle)
2. Choose — 20 to 40 native species, four layers. (four tree silhouettes of different heights, from trees.ts)
3. Soil — Loosen 60–100 cm deep and feed it. (a spade over soil lines)
4. Plant — About 3 per m², mixed, never two alike side by side. (dots in a square)
5. Stake and mulch — A stake for each sapling, straw over the ground. (sapling + stake + mulch line)
6. Care, then let go — Water for three years, then leave it. (a sun/drop simple line, or three short bars shrinking)

## Four layers

A natural forest grows in layers. The method plants all of them at once.

::: figure miyawaki-layers
Share of saplings in each layer, and how tall each grows.
:::
**miyawaki-layers**: side view. Height scale on the left (0, 3, 6, 12, 20 m+). Four horizontal bands with dashed tops, each with trees from trees.ts drawn to the right height: Canopy 12–20 m+ · 40% · "the top of the forest"; Sub-canopy 6–12 m · 30% · "shade under the top"; Understorey 3–6 m · 20% · "flowers, fruit, birds"; Shrubs 1–3 m · 10% · "cover near the ground". Next to it (below on phone) a single stacked bar 40/30/20/10 in the plot tints with labels. At 20,000 saplings that is 8,000 / 6,000 / 4,000 / 2,000 (computed) — show these numbers under the bar as "In our pilot: 8,000 · 6,000 · 4,000 · 2,000".

Use 20 to 40 species that grow wild nearby. The guides' examples, such as oak, ash and beech, come from cooler countries. Ours will be native trees of this part of Cambodia, chosen with nurseries.

## Soil first

Roots go down fast in loose soil and spread sideways in hard soil. So the ground is dug and loosened deep before anything is planted.

::: figure miyawaki-soil
:::
**miyawaki-soil**: a cross-section drawing. Top to bottom: mulch 10–15 cm (straw, dry grass; hatched short strokes); a low mound about 15 cm above the old ground line (dashed line marking "old ground level"); loosened, enriched soil to 60–100 cm (stippled, with 2–3 sapling roots going straight down); hard subsoil below (solid, darker). Labels with dimension brackets on the left. On the right (below on phone) a small "Mixed in, per m²" list:
- Husk or straw — 4–5 kg — keeps air in the soil
- Coco peat or biochar — 4–5 kg — holds water
- Compost or old manure — 3–5 kg — slow food
- Leaf mould or neem cake — 0.5–1 kg — keeps pests down
Draw the label column so it reads as a key, thin rules between items.

## Close and mixed

Planted close, young trees compete for light and grow up fast. The guides give about three per square metre, or 50 to 80 cm apart. Saplings go in at 60–80 cm tall, after a few months to a year in pots.

::: figure miyawaki-pattern
Never two of the same species, or the same layer, side by side.
:::
**miyawaki-pattern**: top-down 2 m × 2 m patch (the pilot's 3-per-m² field layout from pilot.ts: rows 0.5 m, trees 0.67 m, every second row shifted 0.33 m → 24 saplings, assert count). Each sapling is marked by a shape for its layer (not colour alone): canopy = large circle, sub-canopy = circle with dot, understorey = triangle, shrub = small square; filled with the four tints for redundancy. Assign layers by a fixed seeded shuffle respecting 40/30/20/10 as closely as 24 allows (10/7/5/2) and ensuring no two orthogonally/diagonally nearest neighbours share a layer where possible (it's fine to hand-place a valid pattern and assert it). Legend below. Dimension marks: "0.50 m" between rows, "0.67 m" in a row, and a "1 m²" dashed box with "3 per m²".

## Stake and mulch

Tie each sapling to a stake so the wind cannot rock its roots. Then cover all the ground with mulch. It keeps the soil damp, feeds it slowly and keeps weeds down.

## Care, then let go

::: figure miyawaki-care
:::
**miyawaki-care**: a horizontal timeline (vertical on phone) of four stages, with a watering bar whose thickness shrinks:
- Year 1 — Water every day, about 5 litres per m². Weed by hand. Keep the mulch on.
- Year 2 — Water 2–3 times a week in dry spells. Top up thin mulch.
- Year 3 — Water only in an emergency. Watch how it grows.
- After — Leave it. No water, no fertiliser, no pruning. Leaves stay where they fall.
Below, a separate row in laterite, labelled "On our land": "Every dry season: clear the firebreaks." spanning all stages (dashed), to show our addition.

The guides say the forest looks after itself after about three years. On our land the firebreaks will still need clearing every dry season.

## At our scale

The pilot plans about 6,700 m² of planted ground and 20,000 saplings. Here is roughly what the guides' numbers add up to.

::: figure miyawaki-scale
Rough figures from the guides' rates. They show the size of the work, not a price.
:::
**miyawaki-scale**: five big-number tiles (Fraunces numbers, small label below), in a grid (3+2 desktop, 2 columns phone):
- 20,000 · saplings
- 20,000 · stakes
- 77–107 · tonnes of soil additives (11.5–16 kg per m²)
- 670–1,000 · m³ of mulch (10–15 cm deep)
- 33,000 · litres of water a day, in the first year (5 L per m²)
All computed from pilot.ts planted area (6,666.7 m²) and saplings. Under the tiles, a thin line: "Our pilot budget covers saplings only."

The [pilot budget](/rewilding/pilot/) covers the saplings. Everything else in these tiles still has to be worked out. Water stands out: we do not yet know where 33,000 litres a day would come from in March and April.

## Where we will do things differently

::: figure miyawaki-differ
:::
**miyawaki-differ**: two-column comparison, header row "The guides" / "Our plan" (stacks per item on phone with small inline headers). Rows:
1. About 3 per m². → Test 2, 3 and 4 per m² side by side.
2. Example trees such as oak, ash and beech. → Native trees of this part of Cambodia.
3. 10–15 cm of dry mulch over everything. → Rethink it. Dry mulch can carry a fire. Ask about thinner layers, other materials and wider firebreaks.
4. After three years, leave it alone. Never prune. → Clear firebreaks every year. Maybe a small trial of moving young trees out of the densest plot.
5. Grows 10× faster, 30× denser, 100× more life. → Not measured here yet. We will publish our own numbers.
Our-plan column gets a thin laterite left rule.

Both guides agree that the method costs more at the start than ordinary planting and needs water that reaches every tree. One is a [guide from SpiceTree Munnar](https://spicetreemunnar.com/complete-guide-miyawaki-method/), a farm stay in Kerala that has planted with the method. The other is a short field guide shared with us.

The [pilot page](/rewilding/pilot/) has our plot layout, how to mark it out, and what we will measure. We will write again when the species list and the water plan are settled.
