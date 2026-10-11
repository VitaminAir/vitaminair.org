# Migration manifest

Source: 11 HTMLy files in `source-archive/vitaminair/` (untouched). Converted by `npm run migrate` (`scripts/migrate-htmly.ts`). Dates keep the original time with offset -07:00 (as in the live RSS). Bylines: "CD Bella" on every published piece (verified on the live site); none on drafts.

| Source file | New file | URL | Status | Type / labels |
|---|---|---|---|---|
| 2024-07-27-16-46-20_posts,programs_leadership-and-growth-learning-and-playing-with-vitaminair.md | src/content/journal/2024-07-27-leadership-and-growth-learning-and-playing-with-vitaminair.md | /blog/2024/07/leadership-and-growth-learning-and-playing-with-vitaminair/ | published | article, ARCHIVE |
| 2024-07-27-17-10-18_posts,programs_building-a-strong-future-with-vitaminair.md | src/content/journal/2024-07-27-building-a-strong-future-with-vitaminair.md | /blog/2024/07/building-a-strong-future-with-vitaminair/ | published | article, ARCHIVE |
| 2024-07-27-17-28-58_posts,programs_growing-together-with-vitaminair.md | src/content/journal/2024-07-27-growing-together-with-vitaminair.md | /blog/2024/07/growing-together-with-vitaminair/ | published | article, ARCHIVE |
| 2024-07-29-13-33-18_posts_potential-titles-for-posts.md | src/content/drafts/2024-07-29-potential-titles-for-posts.md | none | draft (internal) | not output |
| 2024-07-30-19-19-14_posts,programs,personal-growth_personal-growth-finding-your-path-through-leadership.md | src/content/journal/2024-07-30-personal-growth-finding-your-path-through-leadership.md | /blog/2024/07/personal-growth-finding-your-path-through-leadership/ | published | article, ARCHIVE |
| 2024-08-04-10-31-21_posts,stories_the-dawn-of-red-moon-valley.md | src/content/journal/2024-08-04-the-dawn-of-red-moon-valley.md | /blog/2024/08/the-dawn-of-red-moon-valley/ | published | story, STORY, featured |
| 2024-08-06-23-22-04_posts_sacred-forest-journey-of-discovery-and-renewal.md | src/content/journal/2024-08-06-sacred-forest-journey-of-discovery-and-renewal.md | /blog/2024/08/sacred-forest-journey-of-discovery-and-renewal/ | published | story, STORY, featured |
| 2024-08-11-11-04-03_posts,personal-growth_on-leadership-and-team-building.md | src/content/journal/2024-08-11-on-leadership-and-team-building.md | would be /blog/2024/08/on-leadership-and-team-building/ | **draft** (live URL is 404, owner to decide) | article |
| 2024-08-13-10-01-48_posts,personal-growth_reconnecting-with-nature-finding-inspiration.md | src/content/journal/2024-08-13-reconnecting-with-nature-finding-inspiration.md | /blog/2024/08/reconnecting-with-nature-finding-inspiration/ | published | reflection, REFLECTION, featured |
| 2024-08-28-14-58-52_posts,projects_vitaminair-and-carbon-credits.md | src/content/journal/2024-08-28-vitaminair-and-carbon-credits.md | /blog/2024/08/vitaminair-and-carbon-credits/ | published | article, ARCHIVE, featured, carbon note |
| 2024-09-02-13-45-31_posts,personal-growth,stories_the-little-lizard-and-the-brave-traveler.md | src/content/journal/2024-09-02-the-little-lizard-and-the-brave-traveler.md | /blog/2024/09/the-little-lizard-and-the-brave-traveler/ | published | story, STORY, featured |

Each migrated file keeps `sourceFile`, original `tags`, `legacyCategory` and (where there was one) `legacyImage`. HTMLy comments are stripped, entities decoded, and the trailing `---` removed. Context notes are in each file's `note`.

## Images
| Original | Decision |
|---|---|
| mountain.jpg (photo) | Used: Red Moon Valley and Reconnecting articles only (Home now uses a real photo of the land). Captioned as archive photo, not the trial plot. |
| sunset-strip.jpg (photo) | Used: the articles that referenced it (Rewilding now uses a real photo of the land). Same caveat. |
| va-1207.jpg (photo of children) | Not used and deleted from `proposal/images/` (2026-10-11). The `legacyImage` line was removed from the carbon article. Still in `source-archive/`. |
| leaders.png (stock illustration) | Not used and not copied. The only article that referenced it is a draft. |
Optimised copies of the used images are in `public/images/` (jpg + webp). Originals: `source-archive/images-original/`.

## Legacy route map
Article URLs are identical to the live site (now with trailing slash; the no-slash form is served by the host).

| Old URL | New |
|---|---|
| /blog/home/ | / |
| /blog/about/ | /village/ |
| /blog/contact, /blog/contact/ | /contact/ |
| /blog/category/*, /blog/tag/*, /blog/archive/*, /blog/author/* | /blog/ |
| /blog/feed/rss | /blog/feed.xml |
| / (was a refresh to /blog) | now the homepage |

Implemented as 301 rules in `dist/_redirects` plus meta-refresh stubs for the known URLs (categories leadership-and-personal-growth, community-and-recreation, forestry-and-nature; tags posts, programs, personal-growth, projects, stories; archives 2024, 2024-07, 2024-08, 2024-09; author chas). Unknown sub-paths rely on `_redirects` wildcards.
