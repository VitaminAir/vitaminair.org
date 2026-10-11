import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import { articleTypes, type ArticleType } from '../data/site.ts';
import { renderMarkdown, interpolate } from './markdown.ts';
import { dateParts, ROOT } from './html.ts';

export interface Article {
  file: string;
  title: string;
  date: string;
  time: number;
  description: string;
  type: ArticleType;
  status: 'published' | 'draft';
  archive: boolean;
  note?: string;
  tags: string[];
  legacyCategory?: string;
  author?: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  featured: boolean;
  path: string; // always with leading and trailing slash
  bodyHtml: string;
  sourceFile?: string;
}

const fail = (file: string, msg: string): never => {
  throw new Error(`\n  Content error in ${file}\n  ${msg}\n`);
};

export function parseFile(path: string): { data: Record<string, any>; content: string } {
  const raw = interpolate(readFileSync(path, 'utf8'));
  const { data, content } = matter(raw);
  return { data, content };
}

export function loadPage(name: string): { data: Record<string, any>; html: string } {
  const p = join(ROOT, 'src/content/pages', `${name}.md`);
  if (!existsSync(p)) throw new Error(`Missing page file: src/content/pages/${name}.md`);
  const { data, content } = parseFile(p);
  return { data, html: renderMarkdown(content) };
}

function isoOf(v: unknown, file: string): string {
  if (v instanceof Date) {
    if (isNaN(v.getTime())) fail(file, 'date is not a valid date');
    return v.toISOString();
  }
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(v))
    fail(file, `date must be an ISO string like "2026-10-11" or "2026-10-11T09:30:00+07:00" (got ${JSON.stringify(v)})`);
  return v as string;
}

export function loadJournal(showDrafts = false): Article[] {
  const dir = join(ROOT, 'src/content/journal');
  const files = readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const out: Article[] = [];
  const seen = new Map<string, string>();
  for (const f of files) {
    const file = `src/content/journal/${f}`;
    const { data, content } = parseFile(join(dir, f));
    if (!data.title || typeof data.title !== 'string') fail(file, 'missing "title"');
    const date = isoOf(data.date, file);
    const time = new Date(date.length === 10 ? date + 'T00:00:00Z' : date).getTime();
    if (isNaN(time)) fail(file, `date "${date}" is not a real date`);
    if (!articleTypes.includes(data.type)) fail(file, `type must be one of ${articleTypes.join(', ')} (got ${JSON.stringify(data.type)})`);
    if (data.status !== 'published' && data.status !== 'draft') fail(file, `status must be "published" or "draft" (got ${JSON.stringify(data.status)})`);
    if (!data.description || typeof data.description !== 'string') fail(file, 'missing "description"');
    if (data.image && !data.imageAlt) fail(file, 'an "image" needs an "imageAlt"');
    if (data.status === 'draft' && !showDrafts) continue;

    const { y, m } = dateParts(date);
    const slug = f.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    let path = typeof data.canonical === 'string' && data.canonical ? data.canonical : `/blog/${y}/${String(m).padStart(2, '0')}/${slug}`;
    if (!path.startsWith('/')) fail(file, `canonical must be a path starting with "/" (got ${path})`);
    path = path.replace(/\/+$/, '') + '/';
    if (seen.has(path)) fail(file, `duplicate URL ${path} (already used by ${seen.get(path)})`);
    seen.set(path, file);

    out.push({
      file,
      title: data.title,
      date,
      time,
      description: data.description,
      type: data.type,
      status: data.status,
      archive: data.archive === true,
      note: data.note || undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      legacyCategory: data.legacyCategory || undefined,
      author: data.author || undefined,
      image: data.image || undefined,
      imageAlt: data.imageAlt || undefined,
      imageCaption: data.imageCaption || undefined,
      featured: data.featured === true,
      path,
      bodyHtml: renderMarkdown(content),
      sourceFile: data.sourceFile || undefined,
    });
  }
  return out.sort((a, b) => b.time - a.time);
}
