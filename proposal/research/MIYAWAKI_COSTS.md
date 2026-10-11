# Miyawaki costs and density: verified notes and working model

> **Internal. Never publish on the website.** Prices, margins and partner terms stay out of the site (see VOICE.md and OPEN_QUESTIONS.md). This file sits in `proposal/`, which is not deployed.

- **Source:** a research note prepared on 11 October 2026 for partner discussions.
- **Checked:** 12 October 2026. Every figure was re-opened at its source and all of the note's arithmetic was recomputed.
- **Status:** all figures are provisional. There are no Cambodian quotes, no signed obligations and no funded batch.

## 1. What changed on the site

These are the only parts of the research that reach public pages:

- **Density.** Most Miyawaki plantings use 2 to 5 saplings per m², usually about 3. The first batch is around 30,000 saplings at about 3 per m², which plants roughly 1 ha of the 1 to 2 ha pilot.
- **Thinning.** A dense planting is meant to thin itself. Natural thinning is counted separately from early losses to drought, weeds or fire, and only the early losses are replaced.
- **What we record.** We record cost per sapling planted and cost per tree still alive, separately.
- **Care period.** We plan for five years of care.
- **Still to work out.** This list now includes soil and dry-season water.

No prices, benchmarks, margins or partner names appear on the site.

## 2. Verification of the international benchmarks

| # | Benchmark | Verdict | Notes from checking |
|---|---|---|---|
| S2, S10 | Chinju-no-Mori, Japan: about ¥1,000 or more per tree, covering soil, seedlings, materials and 3 years of weeding | Verified | "1本およそ1000円〜". The page does not say whether event costs and the 17% platform fee are included. The donation page says "1,000円で苗木1本". |
| S3 | Backyard Botanist, India: ₹1,800–3,200 per m², 3-year care; irrigation, land, fencing and signage billed separately | Verified, with a caveat | The page says "3–5 saplings" in the body and "3–5 species" in the FAQ, which contradict each other. |
| S4 | Tree Council, UK: mean £10.20 and median £7.99 per planted tree; mean £16.97 and median £9.66 per surviving tree | Verified | 7,579 stems and £75,196.59 are sums of Table 3, not quoted totals. The 2,972 m² area was **not found** in the report, so the pooled density (25,501/ha) and the £/ha figure are unconfirmed. |
| S5 | Maidstone, UK: £7,680 for 117 m² (£3,830 delivery plus £3,850 for 3 years of maintenance); officer time excluded | Verified | Maintenance includes about £2,000 for watering. |
| S6, S7 | IVN Tiny Forest, Netherlands: €34,000 in 2026–27 (€17,900 contractor and materials, €16,100 education and process); 600 saplings on 200 m² | Verified | — |
| S8 | East Fremantle, Australia: council contribution of $17,700; about 300 plants on 100 m² | Verified | This is a contribution, not the full project cost. |
| S9 | SECL Gevra, India: ₹4 crore estimate, about 20,000 saplings on 2 ha, 2 years | Verified via search | The PIB page itself returned 403. That density is 1 per m², far below a typical Miyawaki planting. A later press report gives about 70% survival. |
| S11 | Kyushu Electric, Japan: 2–3 saplings per m², about 3 years of care | Verified | Care is usually done by the local government, so the company's role is limited. |
| S12 | Morales et al. 2026 review: India $32,416/ha, "Sri Lanka" $22,542/ha, Indonesia $14,997/ha, Thailand $12,842/ha; UK $287,711–$1.3M/ha | Verified via search summary | The original text was not seen (Wiley returned 403). These are literature estimates with mixed scopes; only 21 of 51 documents in the review were quantitative. |
| S13 | Bintulu, Sarawak comparator at $15,329/ha | **Partly verified** | The source gives **US$15,329/ha/year** (Miyawaki 1993), and the note dropped "per year". The citation "Dilhan et al." looks wrong; recheck the paper before quoting it. |
| S1 | ECB rates for 9 Oct 2026 (USD 1.1206, JPY 177.34, GBP 0.84763, INR 108.3965, AUD 1.6052) | Verified | — |

**Corrections to the original note:**
1. The comparator in S13 is a cost per hectare per year.
2. The UK pooled density and hectare figure depend on an area that was not found in the report.
3. The sources mostly budget **2–3 years** of active care. Our five years is a deliberate choice, longer than these benchmarks, and not an industry norm.
4. Density across the sources is 2–5 per m², centred on 3. The SECL pilot (1 per m²) is the outlier.

All conversions to US dollars and all model figures in the note were recomputed, and they match to the cent.

## 3. Density model (owner's scenarios)

The model assumes a straight-line fall from the starting count to 20,000 stems per hectare at year 5. This is arithmetic, not an ecological forecast.

| Start per ha | Per m² | Spacing | Year-5 count | Five-year average | Reduction |
|---|---|---|---|---|---|
| 20,000 | 2 | 0.71 m | 20,000 | 20,000 | 0% |
| 30,000 | 3 | 0.58 m | 20,000 | 25,000 | 33% |
| 40,000 | 4 | 0.50 m | 20,000 | 30,000 | 50% |
| 50,000 | 5 | 0.45 m | 20,000 | 35,000 | 60% |

- **Formula:** N(t) = start − (start − 20,000) × t / 5.
- **The pilot:** 30,000 saplings at 3 per m² is about 1.0 ha net. The same batch at 2 per m² covers about 1.5 ha. Planting a full 2 ha with 30,000 saplings means 1.5 per m², which is below the usual Miyawaki range.

## 4. Working cost model, rescaled to the pilot (30,000 saplings, about 1 ha)

The original note modelled a 10,000-sapling batch on 0.33 ha. The owner has set the first batch at around 30,000 saplings, so the model is rescaled below.

- **Area-based items** (soil, irrigation, care) are tripled in a straight line.
- **Fixed items** (site planning, records) are unchanged.
- **Replacement** stays at 20% of the batch, at $2 each.

Every figure is an assumption until local quotes arrive.

| Component | 10,000 (note) | 30,000 (rescaled) |
|---|---|---|
| Seedlings at $1 | $10,000 | $30,000 |
| Site assessment and species planning | $1,000 | $1,000 |
| Soil preparation and mulch | $5,000 | $15,000 |
| Transport and planting ($0.25 each) | $2,500 | $7,500 |
| Basic irrigation setup | $3,000 | $9,000 (needs a quote; may scale less) |
| Active care, years 1–3 | $9,000 | $27,000 |
| Active care, years 4–5 | $2,000 | $6,000 |
| Replacement (20% at $2) | $4,000 | $12,000 |
| Records, reporting and coordination, 5 years | $2,500 | $2,500 |
| **Five-year subtotal, today's dollars** | **$39,000** | **$110,000** |
| Nominal at 3% a year | $39,893 | $112,369 |

**Long-term sensitivity.** The model assumes 25 years of protection and reporting (years 6–30) with these settings:
- costs rise 3% a year
- 20% contingency
- 15% margin on price
- no investment return

| Annual allowance, years 6–30 | Price per sapling, 10,000 batch | Price per sapling, 30,000 batch |
|---|---|---|
| $1,000 | $11.60 | $7.28 |
| $2,000 | $17.57 | $9.27 |
| $3,000 | — | $11.25 |

**Formula:** price = (nominal five-year cost + reserve for years 6–30) × 1.20 ÷ 0.85 ÷ saplings.

**What this means:**
- Fixed costs spread over more trees, so a 30,000 batch costs less per sapling.
- Protecting 1 ha probably costs more each year than protecting 0.33 ha, so compare the 30,000 batch at $2,000–3,000 a year, not $1,000. That gives roughly **$9–11 per initially planted sapling** in this scenario.
- If the seedlings are donated, the $2,000-a-year case falls to about $7.85.
- None of this is a quote. Do not send a firm price until section 5 is priced.

## 5. Must be priced locally before any firm offer

1. Nursery quotes: by species, size, provenance and delivery date, including replacement stock.
2. Planting area and design: net planting area, density, and the mix of species and layers.
3. Soil: the condition, plus a measured specification for preparation and mulch.
4. Dry-season water: source, flow, storage, pump, energy and staff time. A borehole or a tanker is not covered by the allowance.
5. Labour: a real schedule for planting and five years of care.
6. Loss rules: what is replaced in the first five years and what counts as natural thinning, how repeated failures are handled, and what happens after a major incident such as fire.
7. Reporting: what the annual biodiversity report requires, and what arranged visits require.
8. Fire and encroachment: the protected-area boundaries and the measures to keep fire and encroachers out, given that fire has burned the 12 ha planted since 2020 several times.
9. Everything else: fencing, tools, access works, insurance, overheads and tax.

**Scope note:** the quote covers planting and protection only. It must not include more land or the village.
