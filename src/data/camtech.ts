// CamTech University "Going Green" mini forest (report dated 9 Dec 2022, table to Mar 2024).
// Figures as given in the report. Photos are CamTech's and are not used.

export interface CamtechRow { date: string; iso: string; trees: number | null; flowering: number | null }

export const CAMTECH_ROWS: CamtechRow[] = [
  { date: '22 Apr 2022', iso: '2022-04-22', trees: 479, flowering: 200 },
  { date: '9 Jul 2022', iso: '2022-07-09', trees: 305, flowering: null },
  { date: '27 Aug 2022', iso: '2022-08-27', trees: 290, flowering: null },
  { date: '24 Jun 2023', iso: '2023-06-24', trees: null, flowering: null },
  { date: '30 Sep 2023', iso: '2023-09-30', trees: 250, flowering: 150 },
  { date: '9 Dec 2023', iso: '2023-12-09', trees: null, flowering: null },
  { date: '23 Mar 2024', iso: '2024-03-23', trees: null, flowering: null },
];

export const camtechTrees = CAMTECH_ROWS.reduce((s, r) => s + (r.trees ?? 0), 0);
export const camtechFlowering = CAMTECH_ROWS.reduce((s, r) => s + (r.flowering ?? 0), 0);
export const camtechTotal = camtechTrees + camtechFlowering;

// First three planting dates (April to August 2022): the trees the 9 December 2022 count refers to.
export const camtechFirstTrees = CAMTECH_ROWS.filter((r) => r.iso < '2022-09').reduce((s, r) => s + (r.trees ?? 0), 0);
export const CAMTECH_ALIVE_DEC22 = 864;
export const camtechSurvivalPct = (CAMTECH_ALIVE_DEC22 / camtechFirstTrees) * 100; // 80.4
export const CAMTECH_FLOWERING_FIRST_BATCH = CAMTECH_ROWS[0].flowering ?? 0; // 200, all died

if (camtechTrees !== 1324 || camtechFlowering !== 350 || camtechTotal !== 1674)
  throw new Error(`camtech.ts: totals ${camtechTrees} + ${camtechFlowering} = ${camtechTotal}, expected 1,324 + 350 = 1,674.`);
if (camtechFirstTrees !== 1074 || Math.abs(camtechSurvivalPct - 80.4) > 0.05)
  throw new Error(`camtech.ts: first-batch trees ${camtechFirstTrees} (survival ${camtechSurvivalPct.toFixed(1)}%), expected 1,074 and 80.4%.`);
