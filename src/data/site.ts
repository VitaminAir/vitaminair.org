// Single source of truth for navigation, contact details, project facts and labels.
// Page Markdown can use {{facts.landOwned}} (or {{facts.landOwned|lower}}); templates read from here too.

export type StatusKey = 'today' | 'planned' | 'vision' | 'story' | 'archive' | 'reflection';

export const site = {
  name: 'VitaminAir',
  url: 'https://vitaminair.org',
  description:
    'Almost 100 hectares in Cambodia, mostly left to recover naturally, with a planned native tree planting trial and a long-term village vision.',
  email: 'info@vitaminair.org',
  mapUrl: 'https://maps.app.goo.gl/gitGrar6EdW5U5cu5',
  ogImage: '/images/mountain.jpg',
  socials: [
    { name: 'Telegram', url: 'https://t.me/vitaminair' },
    { name: 'Facebook', url: 'https://www.facebook.com/VitaminAirHome' },
    { name: 'Instagram', url: 'https://www.instagram.com/vitaminairorg' },
    { name: 'YouTube', url: 'https://www.youtube.com/@vitaminair3611' },
  ],
  nav: [
    { name: 'Rewilding', path: '/rewilding/' },
    { name: 'Village vision', path: '/village/' },
    { name: 'Journal', path: '/blog/' },
    { name: 'Contact', path: '/contact/' },
  ],
};

export const facts = {
  landOwned: 'Almost 100 hectares',
  cleared: 'Around 30–40 hectares',
  clearedWhen: '20–30 years ago',
  pilotArea: '0.25–0.5 hectare',
  pilotSaplings: 'around 10,000',
  pilotMethod: 'Miyawaki, diverse native species',
  pilotFunding: 'Not yet funded',
  location: 'Cambodia',
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
