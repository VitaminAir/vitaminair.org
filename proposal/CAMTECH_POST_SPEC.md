# Journal post: "Learning from CamTech's mini forest" (draft)

Source (owner, 2026-10-17): CamTech "Going Green" report (docx, dated 9 Dec 2022, table runs to Mar 2024) and a one-page "mini forest" layout sketch (1 m squares, 4 planting holes each = 4 per m², 0.5 m apart). Copy is written: `src/content/journal/2026-10-17-learning-from-camtech.md` (status draft). Do not edit the copy. Report photos are CamTech's and are NOT used (no permission yet).

Data (from the report):
| Date | Trees | Flowering plants |
|---|---|---|
| 22 Apr 2022 | 479 | 200 |
| 9 Jul 2022 | 305 | – |
| 27 Aug 2022 | 290 | – |
| 24 Jun 2023 | no figure | no figure |
| 30 Sep 2023 | 250 | 150 |
| 9 Dec 2023 | no figure | no figure |
| 23 Mar 2024 | no figure | no figure |
Totals 1,324 trees + 350 flowering = 1,674 (assert). Survival: 864 of 1,074 trees (Apr–Aug 2022 trees: 479+305+290 = 1,074, assert) growing on 9 Dec 2022 = 80.4%. All flowering plants died.

Put the data in `src/data/camtech.ts`. Add three figures to `src/templates/figures.ts` (same style as the miyawaki-* figures):
- **camtech-grid**: top view of 2 × 2 one-metre squares (solid thin rule lines), each with 4 saplings at 0.25 and 0.75 m (0.5 m apart, 0.25 m from the square edges). Dimension lines: "1 m" on two sides, "0.5 m" between two saplings, "0.25 m" from edge to first sapling. Label "4 per m² · 40,000 per ha". Saplings as small dots or tiny trees.svg seedlings (dots are fine). Note under it: "Same spacing as Plot C in our pilot."
- **camtech-phases**: horizontal timeline / bar chart by date. One row per date (7 rows); stacked bar trees (forest tint) + flowering plants (sand/laterite-light, hatched), value labels; rows with no figure show a dashed empty bar and "no figure". Scale shared. Legend. Total line: "1,674 plants: 1,324 trees, 350 flowering".
- **camtech-survival**: a 1,074-unit bar (or a 10×N waffle of ~108 squares, each ≈10 trees) with 864 filled in forest and 210 in pale outline; big Fraunces "864 of 1,074" and "about 80%". Below, smaller: "Flowering plants: 0 of 200 alive" (the April 2022 batch; the report says all flowering plants died — label "all died" to avoid implying a count for the 2023 batch).
All text ≥ 12px at 360, no horizontal scroll, prints cleanly, `role="img"` + title on SVGs.

Verify with the draft visible: `VA_SHOW_DRAFTS=1 npm run build` then preview `/blog/2026/10/learning-from-camtech/`. Screenshots: proposal/screenshots/camtech-post-desktop.png, camtech-post-mobile.png. Then run a normal `npm run build` so dist/ has no drafts.
