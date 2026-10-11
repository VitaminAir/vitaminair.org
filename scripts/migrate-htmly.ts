// One-off converter: HTMLy Markdown files in source-archive/vitaminair/ -> src/content/journal/*.md
// Run with `npm run migrate`. Safe to re-run (it overwrites the files it generates). Never touches source-archive/.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'source-archive/vitaminair');
const TZ = '-07:00'; // matches the live RSS feed

const NOTE_P = 'Written in 2024 about learning activities we hoped to offer young people. It is not a description of a current programme or schedule.';
const NOTE_P2 = NOTE_P + ' Mentors and workshops mentioned here are not current offers.';
const NOTE_C =
  'Archived discussion from August 2024. VitaminAir has not obtained carbon verification. The figures in this article are exploratory estimates, not measured project results or an offer of carbon credits.';
const CAP = 'Photo from VitaminAir’s archive.';

interface Rule {
  type?: 'article' | 'story' | 'reflection';
  archive?: boolean;
  status: 'published' | 'draft';
  folder?: 'journal' | 'drafts';
  category?: string;
  note?: string;
  image?: { src: string; alt: string };
  featured?: boolean;
  author?: boolean;
}
const SUNSET = { src: '/images/sunset-strip.jpg', alt: 'Grassland and scattered trees at sunset, with a hill in the distance' };
const MOUNTAIN = { src: '/images/mountain.jpg', alt: 'Two people walking through tall grass toward a forested hill' };

const rules: Record<string, Rule> = {
  'leadership-and-growth-learning-and-playing-with-vitaminair': { type: 'article', archive: true, status: 'published', category: 'Leadership and Personal Growth', note: NOTE_P, image: SUNSET },
  'building-a-strong-future-with-vitaminair': { type: 'article', archive: true, status: 'published', category: 'Community and Recreation', note: NOTE_P, image: SUNSET },
  'growing-together-with-vitaminair': { type: 'article', archive: true, status: 'published', category: 'Community and Recreation', note: NOTE_P, image: SUNSET },
  'potential-titles-for-posts': { type: 'article', status: 'draft', folder: 'drafts', author: false },
  'personal-growth-finding-your-path-through-leadership': { type: 'article', archive: true, status: 'published', category: 'Leadership and Personal Growth', note: NOTE_P2, image: SUNSET },
  'the-dawn-of-red-moon-valley': { type: 'story', status: 'published', category: 'Community and Recreation', note: 'Fiction. Red Moon Valley and its characters are imagined, not part of VitaminAir’s history.', image: MOUNTAIN, featured: true },
  'sacred-forest-journey-of-discovery-and-renewal': { type: 'story', status: 'published', category: 'Leadership and Personal Growth', note: 'Fiction. The school, farm, solar power and internet in this story are imagined. They are not facilities on our land.', image: SUNSET, featured: true },
  'on-leadership-and-team-building': { type: 'article', archive: true, status: 'draft', author: false },
  'reconnecting-with-nature-finding-inspiration': { type: 'reflection', status: 'published', category: 'Community and Recreation', note: 'A personal reflection from 2024.', image: MOUNTAIN, featured: true },
  'vitaminair-and-carbon-credits': { type: 'article', archive: true, status: 'published', category: 'Forestry and Nature', note: NOTE_C, featured: true },
  'the-little-lizard-and-the-brave-traveler': { type: 'story', status: 'published', category: 'Leadership and Personal Growth', image: SUNSET, featured: true },
};

const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return entities[e.toLowerCase()] ?? m;
  });
}
const q = (s: string) => JSON.stringify(s); // JSON strings are valid YAML double-quoted scalars

function comment(raw: string, key: string): string | undefined {
  const m = new RegExp(`<!--${key}\\s([\\s\\S]*?)\\s${key}-->`).exec(raw);
  return m ? m[1].trim() : undefined;
}

mkdirSync(join(ROOT, 'src/content/journal'), { recursive: true });
mkdirSync(join(ROOT, 'src/content/drafts'), { recursive: true });

const manifest: string[] = [];
for (const f of readdirSync(SRC).filter((x) => x.endsWith('.md')).sort()) {
  const m = /^(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})_([^_]*)_(.+)\.md$/.exec(f);
  if (!m) throw new Error(`Unexpected filename: ${f}`);
  const [, Y, M, D, h, mi, s, tagStr, slug] = m;
  const rule = rules[slug];
  if (!rule) throw new Error(`No migration rule for slug "${slug}". Add one in scripts/migrate-htmly.ts`);
  const raw = readFileSync(join(SRC, f), 'utf8');
  const title = decode(comment(raw, 't') ?? slug);
  const description = decode(comment(raw, 'd') ?? '');
  const tags = (comment(raw, 'tag') ?? tagStr).split(',').map((t) => decode(t.trim())).filter(Boolean);
  const legacyImage = comment(raw, 'image');

  let body = raw.replace(/<!--(t|d|tag|image)\s[\s\S]*?\s\1-->\s*/g, '');
  body = decode(body).replace(/\r\n/g, '\n').trim().replace(/\n-{3,}\s*$/, '').trim() + '\n';

  const path = `/blog/${Y}/${M}/${slug}`;
  const fm: string[] = [
    `title: ${q(title)}`,
    `date: ${q(`${Y}-${M}-${D}T${h}:${mi}:${s}${TZ}`)}`,
    `description: ${q(description)}`,
    `type: ${q(rule.type ?? 'article')}`,
    `status: ${q(rule.status)}`,
  ];
  if (rule.archive) fm.push('archive: true');
  if (rule.note) fm.push(`note: ${q(rule.note)}`);
  fm.push(`tags: [${tags.map(q).join(', ')}]`);
  if (rule.category) fm.push(`legacyCategory: ${q(rule.category)}`);
  if (rule.author !== false) fm.push(`author: "CD Bella"`);
  if (rule.image) {
    fm.push(`image: ${q(rule.image.src)}`, `imageAlt: ${q(rule.image.alt)}`, `imageCaption: ${q(CAP)}`);
  }
  if (rule.featured) fm.push('featured: true');
  fm.push(`canonical: ${q(path)}`, `sourceFile: ${q(f)}`);
  if (legacyImage) fm.push(`legacyImage: ${q(legacyImage)}`);

  const folder = rule.folder ?? 'journal';
  const outName = `${Y}-${M}-${D}-${slug}.md`;
  const outPath = join(ROOT, 'src/content', folder, outName);
  // drafts that are unpublished material carry no author/URL claims
  const content = `---\n${fm.join('\n')}\n---\n\n${body}`;
  writeFileSync(outPath, content);
  manifest.push(`${f} -> src/content/${folder}/${outName} (${rule.status})`);
}
console.log(manifest.join('\n'));
