// Single source of truth for navigation, contact details, project facts and labels.
// Page Markdown can use {{facts.landArea}} (or {{facts.landArea|lower}}); templates read from here too.

export type StatusKey = 'today' | 'planned' | 'vision' | 'story' | 'archive' | 'reflection';

export const site = {
  name: 'VitaminAir',
  url: 'https://vitaminair.org',
  description:
    'Land in Kampong Seila, Cambodia, mostly left to recover. About 12 hectares planted by hand since 2020. A village is a long-term hope, not an offer.',
  email: 'tree@vitaminair.org',
  mapUrl: 'https://maps.app.goo.gl/gitGrar6EdW5U5cu5',
  ogImage: '/images/land-nov-2023.jpg',
  ogImageAlt: 'Green grass and scattered trees with a forested hill behind them, on the land in Kampong Seila, November 2023.',
  socials: [
    { name: 'Telegram', url: 'https://t.me/vitaminair' },
    { name: 'Facebook', url: 'https://www.facebook.com/VitaminAirHome' },
    { name: 'Instagram', url: 'https://www.instagram.com/vitaminairorg' },
    { name: 'YouTube', url: 'https://www.youtube.com/@vitaminair3611' },
  ],
  // VitaminAir is a SmallWorld company; KOOMPI and StadiumX are sister companies (owner, 2026-10-12).
  // Plain names only, no logos or descriptions.
  parent: { name: 'SmallWorld', url: 'https://smallworld.xyz/' },
  sisters: [
    { name: 'KOOMPI', url: 'https://koompi.com/' },
    { name: 'StadiumX', url: 'https://stadiumx.asia/' },
  ] as { name: string; url?: string }[],
  nav: [
    { name: 'Rewilding', path: '/rewilding/' },
    { name: 'Village vision', path: '/village/' },
    { name: 'Journal', path: '/blog/' },
    { name: 'Contact', path: '/contact/' },
  ],
};

/** "VitaminAir is part of SmallWorld, with its sister companies KOOMPI and StadiumX." */
export const familyLine = (link: (x: { name: string; url?: string }) => string) => {
  const s = site.sisters.map(link);
  return `VitaminAir is part of ${link(site.parent)}, with its sister companies ${s.slice(0, -1).join(', ')} and ${s[s.length - 1]}.`;
};
const partnerList = (md: boolean) => familyLine((x) => (md && x.url ? `[${x.name}](${x.url})` : x.name));

export const facts = {
  landArea: 'Around 80 hectares',
  landTitle: 'Freehold, on a hard title',
  cleared: 'Around 30–40 hectares',
  clearedWhen: '20–30 years ago',
  pilotArea: 'about 1 hectare',
  pilotSaplings: '20,000',
  pilotMethod: 'Miyawaki, diverse native species',
  planted: 'About 12 hectares, by hand',
  plantedWhen: 'since 2020',
  location: 'Kampong Seila, Cambodia',
  partners: partnerList(true), // Markdown line with links, for page bodies
};

// What state each part of the project is in. Change here and every label follows.
export const status = {
  naturalRecovery: 'today' as StatusKey,
  plantingTrial: 'planned' as StatusKey,
  village: 'vision' as StatusKey,
};

export interface LabelDef {
  text: string;
  cls: string;
  meaning: string;
}

export const labels: Record<StatusKey, LabelDef> = {
  today: { text: 'Today', cls: 'today', meaning: 'Happening on the land now.' },
  planned: { text: 'Planned trial', cls: 'trial', meaning: 'Something we intend to try. Not yet funded or done.' },
  vision: { text: 'Long-term vision', cls: 'vision', meaning: 'A hope for the future. Not built, not on offer.' },
  story: { text: 'Story', cls: 'story', meaning: 'Fiction. Imagined people and places.' },
  archive: { text: 'Archive', cls: 'archive', meaning: 'An older piece, kept as written, with context.' },
  reflection: { text: 'Reflection', cls: 'plain', meaning: 'A personal piece, written as it felt at the time.' },
};

export const legendOrder: StatusKey[] = ['today', 'planned', 'vision', 'story', 'archive'];

export const articleTypes = ['article', 'update', 'story', 'reflection'] as const;
export type ArticleType = (typeof articleTypes)[number];
