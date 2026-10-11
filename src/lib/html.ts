import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { labels, site, type StatusKey } from '../data/site.ts';

export const ROOT = process.cwd();

export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape text, then turn *word* into the field-marked accent word. */
export function statement(text: string): string {
  return esc(text).replace(/\*([^*]+)\*([.,;:!?]?)/g, (_m, w: string, punct: string) =>
    punct ? `<span class="nw"><em class="mark">${w}</em>${punct}</span>` : `<em class="mark">${w}</em>`,
  ).replace(/\s*\n\s*/g, '<br>');
}

/** Plain-text version of a statement (for titles, descriptions). */
export function plain(text: string): string {
  return text.replace(/\*([^*]+)\*/g, '$1').replace(/\s*\n\s*/g, ' ');
}

export function label(key: StatusKey, extraClass = ''): string {
  const l = labels[key];
  if (!l) throw new Error(`Unknown status label "${key}". Use one of: ${Object.keys(labels).join(', ')}`);
  return `<span class="label label--${l.cls}${extraClass ? ' ' + extraClass : ''}">${esc(l.text)}</span>`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** The wall-clock date as written in the ISO string (no timezone shifting). */
export function dateParts(iso: string): { y: number; m: number; d: number } {
  const mt = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!mt) throw new Error(`Bad date "${iso}"`);
  return { y: +mt[1], m: +mt[2], d: +mt[3] };
}

export function displayDate(iso: string): string {
  const { y, m, d } = dateParts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function buildDateLabel(date = new Date()): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()].toUpperCase()} ${date.getFullYear()}`;
}

export function note(n: number): string {
  return `NOTE ${String(n).padStart(2, '0')}`;
}

/** Read width/height of a local image in /public (jpg, png, webp). */
const sizeCache = new Map<string, { width: number; height: number } | null>();
export function imageSize(src: string): { width: number; height: number } | null {
  if (!src.startsWith('/') || src.startsWith('//')) return null;
  if (sizeCache.has(src)) return sizeCache.get(src)!;
  let out: { width: number; height: number } | null = null;
  try {
    const b = readFileSync(join(ROOT, 'public', src));
    if (b.toString('ascii', 1, 4) === 'PNG') {
      out = { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    } else if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const mk = b[i + 1];
        if (mk >= 0xc0 && mk <= 0xcf && mk !== 0xc4 && mk !== 0xc8 && mk !== 0xcc) {
          out = { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
          break;
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    } else if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
      const t = b.toString('ascii', 12, 16);
      if (t === 'VP8 ') out = { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
      else if (t === 'VP8X') out = { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
      else if (t === 'VP8L') {
        const v = b.readUInt32LE(21);
        out = { width: (v & 0x3fff) + 1, height: ((v >> 14) & 0x3fff) + 1 };
      }
    }
  } catch {
    out = null;
  }
  sizeCache.set(src, out);
  return out;
}

export function imgTag(src: string, alt: string, opts: { cls?: string; eager?: boolean } = {}): string {
  const sz = imageSize(src);
  const dims = sz ? ` width="${sz.width}" height="${sz.height}"` : '';
  const load = opts.eager ? '' : ' loading="lazy" decoding="async"';
  return `<img${opts.cls ? ` class="${opts.cls}"` : ''} src="${esc(src)}" alt="${esc(alt)}"${dims}${load}>`;
}

/** mailto: URL with a subject line (the visible address is always shown next to it). */
export function mailto(subject?: string): string {
  return `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
}

/** The page's one primary action. */
export function btnPrimary(text: string, href: string): string {
  return `<a class="btn-primary" href="${esc(href)}">${esc(text)}</a>`;
}

export function detailsRow(titleHtml: string, status: StatusKey | null, bodyHtml: string, group: string): string {
  const chip = status ? `<span class="row-label">${label(status)}</span>` : '';
  return `<details class="row" name="${esc(group)}"><summary><span class="row-title">${titleHtml}</span>${chip}<span class="sign" aria-hidden="true"></span></summary><div class="det-body">${bodyHtml}</div></details>`;
}
