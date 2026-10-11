> **Design now, build later (owner, 2026-10-11):** design mockups in proposal/tree-design/. Implement in the site only after the static site, brand and content are complete.

# "Plant a tree, one day": interest sign-up, tree icons, donation concept

Owner idea (2026-10-11): someone taps the hero, tree icons pop up, they fill in a short form and donate to plant trees, and their name and contact are recorded with the planting.

**For now we build the interest version only. No money changes hands.** The trial is not funded and the real cost per tree is unknown (finding it out is a goal of the trial). Every surface carries the `PLANNED` label and says plainly that donations are not open yet. The future paid version is described in §5 as a concept only. Do not build it.

## 1. Tree icons (native species, line art)

Show each species by its most recognisable seed or fruit, which is distinctive and honest:

| key | Name shown | Latin | Icon motif |
|---|---|---|---|
| chheuteal | Chheuteal | *Dipterocarpus alatus* | a nut with two long wings |
| koki | Koki | *Hopea odorata* | a small nut with a wing pair, plus a leaf |
| beng | Beng | *Afzelia xylocarpa* | a woody pod with seeds and a seed cap |
| thnong | Thnong | *Pterocarpus macrocarpus* | a round, flat winged pod |

- **Style:** the same hand as the hero and the FLOW_SPEC glyphs. A 28px base, scalable to 56px, 1.25px stroke (non-scaling), round caps, `currentColor`, no fills. On dark backgrounds, draw in `--on-dark` with a `--on-dark-mark` accent stroke. On paper, draw in forest.
- **Where the data lives:** `src/data/site.ts` holds `trees: [{ key, name, latin, line, khmer: "" }]`. Leave the Khmer names empty and do not guess Khmer spellings; the owner will fill them in.
- **Unconfirmed species:** the species list is "to confirm with the nursery". Mark it with a code comment and add it to the content open questions.
- **One-line descriptions:** keep them neutral and avoid unverified claims. For example, "A tall native dipterocarp of lowland forest." Avoid claims about growth rates or carbon.

## 2. Hero interaction

1. **Picker on the Planting scene.** A tap or click on the stage, when it isn't a swipe or drag, plants a sapling as now *and* opens a small radial picker of the 4 tree icons around the tap point. The picker is clamped inside the stage and never covers the h1 or CTA.
   - **Choosing a species:** that species' icon is planted at the spot (drawn on the canvas, laterite), and a compact, dismissible card appears near the scene bar: "Plant a real one, one day? →".
   - **Dismissing:** Esc or a tap outside closes the picker.
2. **Other scenes.** Their tap effects stay unchanged. The scene bar gains a small text button, "Plant a tree", on every scene, which opens the same card or dialog. This is the keyboard and screen-reader route, so the feature never depends on a canvas tap.
3. **Accessibility.**
   - The picker is a `role="group"` of real `<button>`s, each with an aria-label of the species name.
   - Arrow keys move between them, and focus returns to the trigger.
   - Targets are at least 44px.
4. **Motion.** Icons pop in with a 200ms scale. Under reduced motion they appear instantly, and the static picker still works.
5. **Autoplay.** The picker or dialog open counts as interaction, so autoplay holds until 4s after it closes.

## 3. Interest form (native `<dialog>`)

- **Title:** "Plant a tree, one day" with the `PLANNED` chip.
- **Honest line (draft copy, owner to confirm):** "We're not taking donations yet. Leave your details and we'll write once the planting trial is funded and we know what a tree really costs."
- **Fields:**
  - Name (required)
  - Email (required, type email)
  - Tree, a radio group of the 4 icons plus "No preference". It is preselected if the person came from the picker.
  - How many trees, a number from 1 to 20, default 1
  - "Show my name on a future planting list", a checkbox that is **off by default**
- **Privacy line:** "We use this only to contact you about planting. Nothing is stored on this website."
- **Submitting:** for now, open a `mailto:` to `site.email` with subject "Plant a tree" and a prefilled body listing the fields. The person sends it from their own mail app, so the site stores nothing and uses no third party.
  - The action is configurable as `site.interest = { method: "mailto" }`, so a form service can replace it later without template changes.
  - Show the address as text too.
  - Errors appear beside each field, the input is kept, and the button text is "Prepare email".
- **Fallback for no JS, or reaching it from inner pages:**
  - Add a "Plant a tree, one day" block with the tree icons to the Rewilding page's closing CTA area, linking to the same mailto with a subject and a simple body template.
  - Contact gains a reason row: "Planting a tree, one day" → subject "Plant a tree".

## 4. Constraints and checks

- **Code and budget:** no new dependencies and no backend. The extra hero JS stays ≤ 3 KB gzip; report the totals.
- **No donation wording:** no prices, no "donate", no "your tree" ownership wording, and no claim that trees are planted.
- **Accessibility:** the dialog traps focus, closes with Esc and returns focus. The form works at 320px and at 150% text size. All contrast is ≥ 4.5:1.
- **Screenshots** in `proposal/screenshots/`:
  - `tree-picker-desktop|mobile.png`
  - `tree-dialog-desktop|mobile.png`
  - `tree-icons.png` (all 4 at 28 and 56px, on paper and on dark)
  - `tree-rewilding-cta.png`
- **Docs:** update CONTENT_GUIDE (how to edit trees, the interest copy and the method) and README.

## 5. Future paid version: concept only, do not build

Flow: tap → choose a species → form → hosted payment page (the site never handles cards) → thank-you → a register entry moving through honest stages:

`PLEDGED → IN NURSERY → PLANTED → SURVIVED FIRST DRY SEASON`

Each stage change triggers an email update. Names appear on a public list or map only with the person's opt-in.

Prerequisites:
- **Legal entity.** It must be able to accept donations, either registered in Cambodia or through a foreign fiscal sponsor. This decides the payment provider (Stripe does not onboard Cambodian businesses).
- **Price per tree.** A real figure from the trial's cost data.
- **Planting register.** Who, which species, how many, which plot, the date, and survival.
- **Privacy notice.** Covers retention and consent.
- **Honest promise.** Trees go into a plot, not "this exact tree forever", and losses are replaced in year one. Miyawaki planting is usually 2–5 saplings per m² (we plan about 3). A dense planting is expected to thin itself over the first years: natural thinning is not replaced, but early losses to drought, weeds or fire are. The promise must say which is which.
