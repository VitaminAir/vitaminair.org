# Open questions and the defaults used

Each item below is still an owner decision. The site uses the conservative default shown. If you decide otherwise, the change listed is what needs to happen.

| # | Question | Default used now | If the owner decides otherwise |
|---|---|---|---|
| 1 | **Location.** | **Decided:** "Kampong Seila, Cambodia" (hero eyebrow, Note 01 "Where" row, Contact, footer, descriptions). The map link stays. | Change `facts.location` in `src/data/site.ts`; the hero eyebrow is in `home.md`. |
| 2 | **Byline.** Keep "CD Bella" on migrated posts? | Kept, as on the live site. | Remove or change `author:` in each post's front matter. |
| 3 | **On Leadership and Team Building.** Publish? | Stays a draft (404 on the live site, not in the feed). | Set `status: "published"` in the post. It then joins the journal, sitemap and feed (sitemap 15, feed 10). Add a `note` and `metaDescription` first. |
| 4 | **Partners.** | **Decided:** "Working with KOOMPI, SmallWorld and StadiumX." as plain text on Contact and in the footer (`site.partners`). No logos, no descriptions. KOOMPI links to koompi.com and SmallWorld to smallworld.xyz. Balance.eco and ISI stay unnamed. | Edit `site.partners` in `site.ts`. Add a `url` or a description only when the owner confirms. |
| 5 | **Protected land (200-300 ha behind the property).** Mention it? | Omitted. The brief calls it optional background with no approval. | Add one plain sentence to Rewilding, labelled as background and not as owned land. Keep it out of every headline figure. |
| 6 | **Children's photo (`va-1207`).** Show it more widely? | Not used anywhere. | Add an optimised copy to `public/images/` with owner consent and alt text. |
| 7 | **Socials.** LinkedIn? | Not listed. Telegram, Facebook, Instagram and YouTube are listed. | Add `{ name, url }` to `site.socials` once there is a real page. |
| 8 | **Email.** Is info@vitaminair.org still monitored? | Kept as the one contact. | Change `site.email` and the `mailto:` links in the page Markdown. |
| 9 | **Species list.** Final native species for the trial. | Species names appear only in the tree art (`src/art/trees.ts`), as a list to confirm. No page copy names species. | Name them in Rewilding once the nursery confirms. Keep the names the same as in `trees.ts`. |
| 10 | **Archive photos.** Real photos of the trial site? | The two archive photos are captioned "not the trial plot". | Replace them with real photos and edit the caption. |
| 11 | **Land size and ownership wording.** | **Decided:** no "bought" or "own". The text says "the land we look after". "Almost 100 hectares" appears once, in the Rewilding "At a glance" list (`facts.landArea`), with the cleared 30-40 hectares beside it as context. It is out of the hero, headings, descriptions and social previews. The archived carbon article body is unchanged. | Edit `facts.landArea` and `facts.cleared`, or remove the two rows from `glance` in `rewilding.md`. |
| 12 | **StadiumX URL.** | StadiumX is listed without a link. | Add `url` to its entry in `site.partners`. |
