# UI enhancement pass (ui-design review, 2026-10-11)

This pass follows the existing design system in BUILD_SPEC.md (tokens, Fraunces + Public Sans, labels, field-marked accent, NOTE eyebrows, contour band). The goal is to make each page's purpose and next step clear at a glance. Copy stays as it is; new words are limited to button verbs and short labels.

## Global

1. **One colour means "act".** `--forest` is reserved for interactive things: links, the primary button, the current nav item and the accent word. Section and page headings (h2/h3) and the land-section heading move to `--ink`. The field-marked accent word stays forest with its laterite underline. The `TODAY` label keeps forest text: it is a labelled chip, so colour is not the only signal.
2. **Primary button.** Add one component, `.btn-primary`: a solid `--forest-deep` background with `--paper` text, Public Sans 600 at 16px, padding 14px 20px, radius 2px, min-height 48px, and an arrow `→` after the text. Hover goes to `--forest` and focus uses the existing outline. Use it **once per page**, for that page's primary action. Every other link stays a text link.
3. **Mailto links with a subject.** CTAs open the mail app with a specific subject, for example `mailto:info@vitaminair.org?subject=Planting%20trial`. Keep the visible address too, so people without a mail app can copy it.
4. **Tap targets.** Nav links, footer links and row summaries must be at least 44px tall: add padding, not visual weight. Gaps between footer links should be at least 8px.
5. **Labels legend moves one tap away.** Remove the "How to read this site" legend from the homepage hero and from the top of the journal page. Replace it with a small `<details class="legend">` whose summary reads "What the labels mean". Place it **below** the journal list, and in the footer's second row on every page as a compact inline item. The labels already read on their own (TODAY, PLANNED TRIAL…).
6. **Khmer.** Add `@fontsource-variable/noto-sans-khmer@5.3.0` (pin exact; its unicode-range means it only downloads when Khmer text appears). Put it in both font stacks after the Latin face: body `"Public Sans Variable", "Noto Sans Khmer Variable", system-ui, sans-serif`; display `"Fraunces Variable", "Noto Sans Khmer Variable", Georgia, serif`. Add `:lang(km)` with line-height 1.9 and no negative letter-spacing. Verify with a temporary Khmer test string, e.g. `ព្រៃឈើ និង ភូមិ`, in the styleguide or a scratch page (remove it afterwards). Check that the glyphs render with no clipped subscripts in headings or labels.
7. **Large text.** At 390px wide with the root font-size at 150% (simulate with `html{font-size:150%}` via Playwright `addStyleTag`), nothing may clip or overflow. Labels in rows and on the journal list wrap below the title instead of squeezing it. Fix the row flex layout so the title can wrap, and the label + date drop to a second line when space runs out.
8. **External links** (map, socials) keep the `↗` and get `rel="noopener"`. Add visually hidden text "(opens in a new tab)" if they open a new tab. Otherwise, do not use `target=_blank` at all. Preferred: open in the same tab and drop the hidden text.
9. **States.** These are static pages, so the states to cover are:
   - **404:** the statement "This page has *moved* or never existed.", a link to the journal, and the primary button "Go to the homepage".
   - **Empty journal:** if no published posts exist, the journal page shows "No entries yet." and the homepage journal section is hidden entirely.
   - **Missing image:** keep width/height and the `--paper-2` background on `<img>` so a failed image leaves a calm block with the alt text, not a collapse.
   - **Current page:** `aria-current` plus underline (already done).
   - **Visited links:** no change.

## Homepage, primary action: "Explore the rewilding plan"

- **Hero.** Statement h1, then the intro paragraph (max 60ch), then a row with the **primary button "Explore the rewilding plan"** and a text link "Our village vision". Remove the legend (see Global 5). The hero becomes a single column, with nothing in the right half competing with it.
- **NOTE 01, land today.** The heading changes to ink. No other change.
- **NOTE 02, approach (forest band).** The core story must be visible, not collapsed. Replace the three lines and the two `<details>` rows with **two visible items** stacked on the right of the statement, separated by a hairline. Each item has its label chip (`TODAY` / `PLANNED TRIAL`), an h3 ("Natural recovery" / "Native planting trial") and the existing one-paragraph text from the row bodies. Drop the three paraphrased lines (they repeat the items).
- **NOTE 03, what we want to learn.** Four one-sentence items don't justify a tap each. Show them **visible** as a 2×2 grid on desktop (1 column on mobile). Each item has a hairline on top, a small Fraunces term ("Cost", "Care", "Survival", "Changes in the land") and its sentence. No boxes, no cards.
- **NOTE 04, village.** The heading changes to ink, and the accent word "one day" stays field-marked. No other change.
- **NOTE 05, journal.** No change apart from the large-text wrapping fix.
- **Contact band.** Keep the statement. Make the email address the large link: `mailto` with subject "Hello from the website". Add the small line "Visits by arrangement." This is not a second primary button, because the hero owns the page's primary action.

## Rewilding, primary action: "Email us about the trial"

- **At a glance.** Directly under the banner photo, before the intro, add a compact **"Trial at a glance"** fact list, using the homepage `<dl>` row style in a 2-column grid on desktop. Rows:
  - Pilot area: {{facts.pilotArea}}
  - Saplings: {{facts.pilotSaplings}}
  - Method: Miyawaki, diverse native species
  - Status: `PLANNED TRIAL` · Not yet funded

  Read the values from `facts` in site.ts. If a fact doesn't exist yet, add it there (e.g. `pilotMethod`, `pilotFunding: "Not yet funded"`) rather than hard-coding.
- **End of page.** After Questions, add a closing block with a hairline on top: the h2 "Want to help with the trial?", one line (reuse "Native-tree nurseries, restoration researchers, planting organisations, students…" by **moving** the "Who we'd like to hear from" paragraph here instead of duplicating it), and the **primary button "Email us about the trial"** (`mailto` subject "Planting trial").

## Village vision, primary action: "Tell us what draws you"

- **Things we want to explore.** Make these visible, not collapsed. Show the seven items as a 2-column list on desktop (1 column on mobile). Each item has the Fraunces term and its sentence, with a hairline on top. The `LONG-TERM VISION` label sits beside the h2.
- **"What this isn't (yet)."** These are the consequences that must stay visible. Render it as a note box (the article note style, `--paper-2` with a forest left rule) placed **directly under the intro**, before the explore list, so nobody reads the list as amenities.
- **End.** The primary button "Tell us what draws you" (`mailto` subject "Village idea"). Related reading stays below the button as text links.

## Contact, primary action: "Email us"

- Under the statement, show the **primary button "Email us"** (mailto, subject "Hello from the website"), with the address written out beside or under it.
- The reasons list becomes a list of specific mailto links, each with its own subject:
  - "Planting trial and research" → subject "Planting trial"
  - "Supporting the work" → "Supporting VitaminAir"
  - "The village idea" → "Village idea"
  - "Visiting" → "Visit request"

  The bold term is the link and the description stays as plain text after it.
- Location and Elsewhere stay as they are.

## Journal, primary action: read an entry

- Remove the legend from the top (Global 5). The h1 goes straight into the year groups. Put the "What the labels mean" details below the list.

## Article, primary action: read

- No layout change. Its section headings change to ink (Global 1). Check large text with the note box.

## Do not

- Do not add new sections, icons, emoji, shadows, rounded cards, gradients, animation or JS.
- Do not change the palette values, fonts, wordmark or footer line.
- Do not invent copy beyond the button verbs and labels listed here.

## Colour revision (owner feedback)

Owner feedback: "the greenish original and earth warm colours is better". This revision supersedes Global 1 and the button colour in Global 2 above.

- **Green = identity.** h2/h3 section headings, the land-section heading, item terms, journal year headings and article headings return to `--forest`. Statements (h1) keep ink with the green field-marked word. On the dark band, headings stay `--on-dark`. Links stay forest and underlined.
- **Laterite = the one action colour and status/marks.** `.btn-primary` is `--laterite-deep` #8A3C1E with `--paper` text (6.57:1), hover `--laterite` #A34A26 (5.06:1). Laterite also stays on the current-nav underline, accent-word underline, eyebrows and the planned-trial label.
- **Warmer paper and sand.** `--paper` #F4EDDF, `--paper-2` #EDE2CC (laterite text on it is 4.59:1), `--rule` #CBB894.
