# VitaminAir redesign: design proposal (review stage)

Status: **for your decision**. Nothing has been deployed. The prototype in this folder is static HTML/CSS you can open locally.

---

## 1. What I looked at

### SmallWorld (smallworld.xyz), inspected at 1440px and 390px wide

- **Layout.** Desktop has two columns. The left third holds the identity: a small caps kicker, the wordmark, a one-line positioning statement, then plain paragraphs. The right two-thirds hold the sections, each on a full-width band (bands alternate between `#FFF8E8` and `#FFEEC8`) with a 1px dark rule between them. Each section has a large display heading, a one-line description, and a compact list.
- **Lists.** Each row is a `<details>`: bold name on the left, a tiny uppercase letter-spaced category on the right, and a `+` that turns into `×` when open. The rows use `name="home-row"`, so only one is open at a time. The writing list uses the same rows, with a date and a `→`.
- **Navigation.** There is no menu at all. The page *is* the site. It ends with one CTA: "Build with us." plus an email button.
- **Type.** Baloo 2 for body (16px/1.7, ink `#34233F`). Bagel Fat One is used only for section headings. Labels are 12px, weight 800, 0.06em tracking, green `#0B6B4C`.
- **Mobile.** Everything stacks into a single column in the same order. Rows keep the title, label and sign on one line. There is no hamburger.
- **Motion.** None beyond the details toggle. It honours `prefers-reduced-motion`.

**What to borrow:** the left-identity/right-sections split, the compact labelled rows, the expandable secondary detail, the dated writing list, and the single closing invitation.
**What not to copy:** the fonts, the cream/purple palette, the fat display face, and the no-navigation approach. VitaminAir needs a compact nav because it has detail pages.

### Mobbin references (Mobbin MCP worked; 7 searches)

Most Mobbin results were SaaS dashboards or product UI, which I discarded. These five solve real problems for this site:

| # | Reference | Pattern I'd adopt | Where on VitaminAir |
|---|---|---|---|
| 1 | [Savor: header and nav](https://mobbin.com/sites/sections/f6870d1a-3708-4347-92c6-048af2b0d73f) | A five-item text nav (Process · Foods · Mission · Journal · Contact) beside a serif wordmark, with no buttons or dropdowns. It's an environmental brand that still reads as a small, quiet company. | Site header: `VitaminAir`, then Rewilding · Village vision · Journal · Contact. (I'm **not** taking its full-bleed photo hero.) |
| 2 | [Apple: Restore Fund story section](https://mobbin.com/sites/sections/abed257b-0fe4-49d5-823e-c0dd73290581) | One genuine photograph of the land next to a short text block, with a small category tag above. | Homepage "The land today" block and the Rewilding page opener. The tag becomes our status label (`TODAY`). |
| 3 | [Proton Foundation: intro](https://mobbin.com/sites/sections/956e25ca-0763-4b15-9ff1-8300cd706f4c) | One wide image, then a narrow centred reading column with a plain intro paragraph. It explains an organisation's purpose without marketing devices. | Rewilding, Village vision and article pages: the photo (optional) sits above a ~66ch column. |
| 4 | [Stripe Climate: explanation plus citations](https://mobbin.com/sites/sections/2380f099-4b25-4b58-abd7-6c888578e8bd) | A climate topic handled with plain text and a visible sources list underneath, with no animated stats. | The Rewilding page's "What we don't know yet" list, the "Where these numbers come from" note, and the archive note on the carbon article. |
| 5 | [Trawelt: contact](https://mobbin.com/sites/sections/4892cb32-2f51-4f26-af9f-0d6fd3c809fa), with [Vucko](https://mobbin.com/sites/sections/b72d0e0b-a36b-4cfe-b0b1-27d1b3e3b8b5) | A short heading on the left and a paragraph with an inline email link on the right. Vucko adds a single-line "Work with us / email" between hairlines. | The homepage contact band and the footer. A mail link, no fake form. |

---

## 2. Recommended direction: "Field notes"

**The idea.** The site reads like a well-kept field notebook: dated, labelled, honest about what's done and what isn't. It takes SmallWorld's structure (identity column plus banded sections of compact rows) and gives it VitaminAir's own material: forest green, paper, and the red laterite soil of Cambodia as the one accent. Status labels appear throughout and do real work. Every claim on the page is tagged **Today**, **Planned trial** or **Long-term vision**. That *is* the technology identity: clear documentation instead of futuristic visuals.

### Palette

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F6F1E6` | page background (warm off-white) |
| `--paper-2` | `#EDE6D6` | alternate section bands |
| `--ink` | `#1D2420` | body text (≈14:1 on paper) |
| `--ink-soft` | `#4F5A54` | secondary text, captions (≈6.4:1) |
| `--forest` | `#1E5A43` | headings, links, `Today` label (≈7.2:1) |
| `--forest-deep` | `#123B2C` | hover, footer |
| `--laterite` | `#A34A26` | the single accent: `Planned trial` label, small marks (≈5:1) |
| `--rule` | `#CDBFA6` | hairline separators |

### Typography

- **Fraunces** (variable; opsz, SOFT 50, weight 560–640) for the wordmark and headings. The soft serif gives warmth and some character without being cute.
- **Public Sans** (400/600) for body, labels and UI. It's plain, civic and very readable.
- Body 17px/1.65 with ~66ch measure. Labels 11.5px, weight 600, +0.08em, uppercase.
- Both are self-hosted (woff2, latin subset) in the real build.

### Status labels (one visual language everywhere)

- `TODAY`: forest green text, solid hairline border
- `PLANNED TRIAL`: laterite text, solid border
- `LONG-TERM VISION`: ink-soft text, **dashed** border (it isn't solid yet)
- `STORY`: ink-soft, dotted border
- `ARCHIVE`: ink-soft on `--paper-2` fill

### Navigation and sitemap

Header: `VitaminAir` wordmark · **Rewilding · Village vision · Journal · Contact** (the wordmark goes Home). On mobile the links wrap onto one line under the wordmark. There's no hamburger and no JS.

```
/                     Home
/rewilding/           Rewilding plan (detail page)
/village/             Village vision (detail page)
/blog/                Journal (kept at /blog/ so every old article URL keeps working)
/blog/YYYY/MM/slug    Articles (identical to current live URLs)
/contact/             Contact
```

### Homepage section order

Desktop: identity column on the left, sections on the right. Mobile: everything stacks in this order.

1. **Intro** (left column): kicker, heading, intro, two links, and a small "How to read this site" legend of the status labels
2. **The land today** `TODAY`: photo plus a 4-row fact list
3. **Our approach**: two expandable rows, Natural recovery `TODAY` and Native planting trial `PLANNED TRIAL`
4. **What we want to learn** `PLANNED TRIAL`: four expandable rows (cost, care, survival, changes in the land)
5. **The village** `LONG-TERM VISION`: a paragraph and a link
6. **Journal**: five rows with title, type label and date `→`, plus "All entries"
7. **Get in touch**: an invitation, the email, and "visits by arrangement"

### Draft copy

**Homepage**

> **CAMBODIA · FOREST FIRST**
> # Rewilding land in Cambodia.
> We bought almost 100 hectares of land in Cambodia. Much of it is being left to recover naturally. On areas cleared decades ago, we want to trial native tree planting and share what we learn. Over time, we hope to build a village where people can live and work closer to nature.
> → Explore the rewilding plan · Our village vision

*The land today* `TODAY`

| | |
|---|---|
| Land we own | Almost 100 hectares |
| Cleared 20–30 years ago | Around 30–40 hectares |
| Most of the land | Left undisturbed to recover |
| Where | Cambodia · Open the map ↗ |

Caption: *"Grassland and forest near VitaminAir. Photo from our archive. It is not the planned trial plot."*

*Our approach*
- **Natural recovery** `TODAY`: Some areas are already recovering. What we saw on the land in 2020 and 2021 convinced us to leave those areas undisturbed and let them keep going.
- **Native planting trial** `PLANNED TRIAL`: On selected cleared patches, we want to try Miyawaki-style planting with diverse native species. We'll start small, understand the care involved, and learn what survives before expanding.

*What we want to learn* `PLANNED TRIAL`
- **Cost.** What a small, dense native planting really costs, including the work after planting day.
- **Care.** How much watering, weeding and replacing it takes, and for how long.
- **Survival.** Which species make it through the first dry season, and which don't.
- **Changes in the land.** Shade, soil, birds and insects, recorded the same way each time so we can compare.

*The village* `LONG-TERM VISION`
> One day, we want VitaminAir to become a place where people can live, work, grow food and care for the surrounding forest. We are still exploring what that village should look like. The forest recovery comes first.
> → Read the village vision

*Get in touch*
> Interested in the planting trial, research or the village idea? Get in touch.
> **info@vitaminair.org** · Visits by arrangement.

**Rewilding page** (`/rewilding/`)

> # The rewilding plan
> We own almost 100 hectares of land in Cambodia. Around 30 to 40 hectares were cleared 20 to 30 years ago. Much of the rest, and some of the cleared land, is coming back on its own. Our plan is to protect that, and to test whether careful native planting can help the patches that aren't recovering.
>
> ## What is happening now `TODAY`
> Most of the land is being left alone. When we watched the land around 2020 and 2021, we saw parts of it recovering without any planting. That shaped our approach: where nature is already doing the work, we stay out of the way. That won't be true of every cleared patch, which is why we want to test planting as well.
>
> ## The trial we're planning `PLANNED TRIAL`
> We are planning an initial trial of around 10,000 native saplings using the Miyawaki method: many species, planted close together, on a pilot area of roughly a quarter to half a hectare. The species, planting layout and costs are still being worked out. The trial is not yet funded.
>
> **Still to work out**
> - Which native species, and where the saplings come from
> - Exactly where the pilot goes, and how dense the planting should be
> - Who looks after it, especially through the first dry season
> - What it all costs
>
> ## What we'll record
> We want this to become an example others can learn from, so we'll write down what happens: the real cost, the hours of care, which trees survive the dry season, and how the patch changes compared with land left to recover on its own. We'll publish it in the journal, including what doesn't work.
>
> ## After the pilot
> If the pilot teaches us enough, we'll consider expanding planting across more of the cleared areas. That's a decision for later, based on what we learn, not a promise.
>
> ## Who we'd like to hear from
> Native-tree nurseries, restoration researchers, planting organisations, students, and anyone with local knowledge of the species that belong here.
>
> **Questions** (expandable)
> - *Is the trial funded?* Not yet. We are talking to possible collaborators, but nothing is confirmed.
> - *Are you selling carbon credits?* No. VitaminAir has not obtained carbon verification and has no credits to sell. An exploratory article from 2024 is kept in the journal archive, clearly marked as such.
> - *Can I visit?* Visits are possible by arrangement. Email us first.

**Village vision page** (`/village/`), labelled `LONG-TERM VISION` at the top

> # A village, one day
> One day, we want VitaminAir to become a place where people can live, work, grow food and care for the surrounding forest. We are still exploring what that village should look like. The forest recovery comes first.
>
> Some of us already spend time on the land and keep working with colleagues in the city. That mix of quiet days, real work and a good connection is the seed of the idea. A village would make it possible for more people.
>
> ## Things we want to explore
> (expandable rows, each starting with "We want to explore…")
> - **Homes.** Simple, durable buildings that suit the climate and sit lightly on the land.
> - **Food.** Growing some of our own food alongside the forest rather than instead of it.
> - **Water.** Collecting and managing water through the wet and dry seasons.
> - **Energy.** Solar and other ways of powering daily life and work.
> - **Connectivity.** A connection reliable enough to do real work from the forest.
> - **Community.** Who lives here, how decisions are made, and how we work with our neighbours.
> - **Learning.** Sharing what we learn about the land, and learning from people who know it.
>
> ## What this isn't (yet)
> This is not a residential development. There are no homes or plots for sale and no bookings. None of the things listed above are built. If the idea interests you, we'd like to hear from you anyway.
>
> **Related reading:** *Reconnecting With Nature* (Reflection, 2024) · *The Dawn of Red Moon Valley* (Story, 2024)

**Contact page** (`/contact/`)

> # Get in touch
> We're a small team. Email is the best way to reach us: **info@vitaminair.org**
> - **Planting trial and research.** Tell us what you do and what you'd like to try or study.
> - **Supporting the work.** We're glad to talk about how you could help.
> - **The village idea.** Tell us what draws you to it.
> - **Visiting.** Visits are by arrangement only. Email us before you come.
>
> **Location.** Cambodia · [Open in Google Maps ↗](https://maps.app.goo.gl/gitGrar6EdW5U5cu5)
> **Elsewhere.** Telegram · Facebook · Instagram · YouTube

---

## 3. Modest alternative: "Letter"

The same palette and fonts in a **single centred column** (~680px), like a long letter from the team. Wordmark and nav sit centred at the top. Sections are numbered `01–07` and separated by hairlines. Expandable rows are used only for "What we want to learn". Photos sit inline at column width.

It's calmer and even simpler to maintain. The trade-off is that it loses SmallWorld's distinctive two-column structure and feels less like a venture building something. Pick it if you prefer a quieter, more personal tone. The prototype includes its homepage at `alternative.html`.

---

## 4. Content migration summary

Source: 11 HTMLy Markdown files. I checked them against the live site (RSS, the author page, and direct URL fetches on 2026-10-11).

| Date | Title | Live? | Verified byline | Proposed type / label | Context note |
|---|---|---|---|---|---|
| 2024-07-27 | Leadership and Growth at VitaminAir | ✅ | CD Bella | Article · `ARCHIVE` | Written in 2024 about the learning activities we hoped to offer young people. Not a current programme or schedule. |
| 2024-07-27 | Building a Strong Future with VitaminAir | ✅ | CD Bella | Article · `ARCHIVE` | same |
| 2024-07-27 | Growing Together with VitaminAir | ✅ | CD Bella | Article · `ARCHIVE` | same |
| 2024-07-29 | Potential Titles for Posts | ❌ (internal) | – | **Draft** (excluded from output) | – |
| 2024-07-30 | Personal Growth: Finding Your Path Through Leadership | ✅ | CD Bella | Article · `ARCHIVE` | same (mentions workshops and mentors) |
| 2024-08-04 | The Dawn of Red Moon Valley | ✅ | CD Bella | `STORY` | Fiction. Red Moon Valley and its characters are imagined. |
| 2024-08-06 | Sacred Forest Journey of Discovery | ✅ | CD Bella | `STORY` | Fiction. The school, farm, solar power and internet in this story are imagined, not facilities on our land. |
| 2024-08-11 | On Leadership and Team Building | ⚠️ **404 live, not in RSS or author list** | unknown → omit | **Draft until you confirm** | – |
| 2024-08-13 | Reconnecting With Nature: Finding Inspiration | ✅ | CD Bella | Reflection | A personal reflection from 2024. |
| 2024-08-28 | VitaminAir and Carbon Credits | ✅ | CD Bella | Article · `ARCHIVE` | The note you supplied (no verification; figures are exploratory estimates, not results or an offer). |
| 2024-09-02 | The Little Lizard and the Brave Traveler | ✅ | CD Bella | `STORY` | – |

- **Routes.** Every live article URL (`/blog/YYYY/MM/slug`) is reproduced exactly, so no redirects are needed for articles. Old non-article pages are redirected: `/blog/home/` → `/`, `/blog/about/` → `/village/`, `/blog/contact` → `/contact/`, and `/blog/category/*`, `/blog/tag/*`, `/blog/archive/*`, `/blog/author/*` → `/blog/`. `/blog/feed/rss` is regenerated at the same path. The root `/` currently meta-refreshes to `/blog`; it becomes the real homepage.
- **Metadata kept:** original date and time, title, description (HTML entities decoded), original tags, the live category (e.g. "Community and Recreation") as `legacyCategory`, the image, and the source filename.
- **Archive:** the original files are kept untouched in `source-archive/`.

### Images (all four retrieved; originals in `source-archive/images-original/`)

| File | What it is | Proposed use |
|---|---|---|
| `mountain.jpg` (634×300) | **Genuine photo.** Two people walking through tall grass toward a forested hill. | Homepage "land today" image, captioned as an archive photo, *not the trial plot* |
| `sunset-strip.jpg` (652×133) | **Genuine photo.** Grassland and scattered trees at sunset, with a hill. | Rewilding page banner, same caveat |
| `va-1207.jpg` (634×300) | **Genuine photo.** Children playing a game outside a small building. | **Only on its own article** until you confirm consent to show identifiable children |
| `leaders.png` (534×300) | **Stock-style silhouette illustration.** Not VitaminAir. | Only on "On Leadership…", labelled as an illustration |

They're all low resolution. **Photos we need** (5–6 is plenty):
1. A wide view of a naturally recovering area
2. A cleared patch that could become the trial site
3. Close-ups of young native regrowth
4. People working on the land, with consent
5. The approach or a landmark that identifies the place
6. Optionally, the same spot photographed again later (a fixed-point series for the journal)

---

## 5. How updates will work (after implementation)

- **Facts** (land figures, trial status, contact, map, socials) live in **one file**, `src/data/site.ts`. Changing "Planned trial" to "In progress" there updates every page.
- **Pages** are Markdown files in `src/content/pages/` (home sections, rewilding, village, contact). Edit the text and rebuild.
- **Posts:** drop a `.md` file into `src/content/journal/`, fill in the front matter (title, date, description, type, status, tags, optional image, alt text, author and archive note), then preview locally. Set `status: "published"` and rebuild. The post gets its own page and appears in the journal and RSS automatically. Drafts never reach the output, wherever they sit.
- **Images:** put an optimised file in `public/images/` and reference it from front matter or Markdown, with alt text.
- **Publishing:** run `npm run build`. The `dist/` folder is plain static HTML that can go on any static host. Every content change needs a rebuild.

Planned stack: Vite + TypeScript, a small prerender script, `marked` for Markdown, and `gray-matter` for front matter. No React, no CMS, no backend.

---

## 6. Decisions I need from you

1. **Direction.** Field notes (recommended) or Letter?
2. **Location.** The map pin (11.152° N, 104.038° E) falls in **Kampong Seila district, Preah Sihanouk province** according to OpenStreetMap. It sits near the district boundary. Should the copy name it, or stay with "Cambodia"?
3. **"On Leadership and Team Building."** It returns 404 live and isn't in the RSS feed. Should it stay a draft, or be published as an Archive article without a byline?
4. **Byline.** All nine live posts show **"CD Bella"**. Should that byline be kept?
5. **Partners.** I've left Balance.eco and ISI **unnamed** in public copy ("talking to possible collaborators"). Is that right, or do you want either mentioned as "in early discussion"?
6. **Protected land.** Should the 200–300 ha behind the property be mentioned at all? It's currently omitted.
7. **Children's photo.** Can `va-1207.jpg` be shown more widely, and do you have newer, higher-resolution photos?
8. **Socials.** Telegram, Facebook, Instagram and YouTube were verified. The LinkedIn link on the old site points only to linkedin.com, so I've dropped it. Is there a real page?
9. **Email.** Is `info@vitaminair.org` still monitored?
