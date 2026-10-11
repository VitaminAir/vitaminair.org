// Single source of truth for navigation, contact details, project facts and labels.
// Page Markdown can use {{facts.landArea}} (or {{facts.landArea|lower}}); templates read from here too.

export type StatusKey = 'today' | 'planned' | 'vision' | 'story' | 'archive' | 'reflection';

export const site = {
  name: 'VitaminAir',
  url: 'https://vitaminair.org',
  description:
    'Land in Kampong Seila, Cambodia, mostly left to recover. A small native tree planting trial is planned. A village is a long-term hope, not an offer.',
  email: 'info@vitaminair.org',
  mapUrl: 'https://maps.app.goo.gl/gitGrar6EdW5U5cu5',
  ogImage: '/images/land-nov-2023.jpg',
  ogImageAlt: 'Green grass and scattered trees with a forested hill behind them, on the land in Kampong Seila, November 2023.',
  socials: [
    { name: 'Telegram', url: 'https://t.me/vitaminair' },
    { name: 'Facebook', url: 'https://www.facebook.com/VitaminAirHome' },
    { name: 'Instagram', url: 'https://www.instagram.com/vitaminairorg' },
    { name: 'YouTube', url: 'https://www.youtube.com/@vitaminair3611' },
  ],
  // Plain names only. Add a url when the owner confirms the link; no logos or descriptions.
  partners: [
    { name: 'KOOMPI', url: 'https://koompi.com/' },
    { name: 'SmallWorld', url: 'https://smallworld.xyz/' },
    { name: 'StadiumX', url: 'https://stadiumx.asia/' },
  ] as { name: string; url?: string }[],
  nav: [
    { name: 'Rewilding', path: '/rewilding/' },
    { name: 'Village vision', path: '/village/' },
    { name: 'Journal', path: '/blog/' },
    { name: 'Contact', path: '/contact/' },
  ],
};

const partnerList = (md: boolean) => {
  const p = site.partners.map((x) => (md && x.url ? `[${x.name}](${x.url})` : x.name));
  return `Working with ${p.slice(0, -1).join(', ')} and ${p[p.length - 1]}.`;
};

export const facts = {
  landArea: 'Around 80 hectares',
  cleared: 'Around 30–40 hectares',
  clearedWhen: '20–30 years ago',
  pilotArea: '1–2 hectares',
  pilotSaplings: 'around 10,000',
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
