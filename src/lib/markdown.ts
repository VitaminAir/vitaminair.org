import { Marked, type Tokens } from 'marked';
import { facts } from '../data/site.ts';
import { esc, label, imgTag, detailsRow } from './html.ts';
import type { StatusKey } from '../data/site.ts';
import { glyphFor } from '../templates/art.ts';

/** Replace {{facts.key}} and {{facts.key|lower}} with the value from src/data/site.ts. */
export function interpolate(text: string): string {
  return text.replace(/\{\{\s*facts\.(\w+)(?:\s*\|\s*(lower))?\s*\}\}/g, (_m, key: string, filter?: string) => {
    const v = (facts as Record<string, string>)[key];
    if (v === undefined) throw new Error(`Unknown fact "{{facts.${key}}}". Known facts: ${Object.keys(facts).join(', ')}`);
    return filter === 'lower' ? v.charAt(0).toLowerCase() + v.slice(1) : v;
  });
}

const BTN_TITLE = 'btn-primary';
const STATUS_SUFFIX = /\s*\{status=(\w+)\}\s*$/;
const isExternal = (href: string) => /^https?:\/\//i.test(href) && !href.startsWith('https://vitaminair.org');

function makeMarked(): Marked {
  const m = new Marked({ gfm: true });
  m.use({
    renderer: {
      heading(this: any, { tokens, depth }: Tokens.Heading) {
        let inner: string = this.parser.parseInline(tokens);
        let chip = '';
        const mt = STATUS_SUFFIX.exec(inner);
        if (mt) {
          inner = inner.replace(STATUS_SUFFIX, '');
          chip = ' ' + label(mt[1] as StatusKey);
        }
        return `<h${depth}>${inner}${chip}</h${depth}>\n`;
      },
      paragraph(this: any, { tokens }: Tokens.Paragraph) {
        const nonSpace = tokens.filter((t) => !(t.type === 'text' && !t.raw.trim()));
        if (nonSpace.length === 1 && nonSpace[0].type === 'image') return this.parser.parseInline(nonSpace);
        return `<p>${this.parser.parseInline(tokens)}</p>\n`;
      },
      image({ href, title, text }: Tokens.Image) {
        const img = imgTag(href, text);
        return `<figure>${img}${title ? `<figcaption>${esc(title)}</figcaption>` : ''}</figure>\n`;
      },
      link(this: any, { href, title, tokens }: Tokens.Link) {
        const inner = this.parser.parseInline(tokens);
        const btn = title === BTN_TITLE;
        const ext = isExternal(href) ? ' rel="noopener"' : '';
        return `<a${btn ? ' class="btn-primary"' : ''} href="${esc(href)}"${title && !btn ? ` title="${esc(title)}"` : ''}${ext}>${inner}</a>`;
      },
    },
  });
  return m;
}

const marked = makeMarked();
let rowGroup = 0;

/** `::: rows` ... `:::` containers: each `### Title {status=..}` + content becomes a <details class="row">. */
function renderRows(inner: string): string {
  const group = `rows-${++rowGroup}`;
  const parts = inner.split(/^###\s+/m).slice(1);
  const rows = parts.map((p) => {
    const nl = p.indexOf('\n');
    let title = (nl === -1 ? p : p.slice(0, nl)).trim();
    const body = nl === -1 ? '' : p.slice(nl + 1).trim();
    let st: StatusKey | null = null;
    const mt = STATUS_SUFFIX.exec(title);
    if (mt) {
      title = title.replace(STATUS_SUFFIX, '');
      st = mt[1] as StatusKey;
    }
    return detailsRow(marked.parseInline(title) as string, st, marked.parse(body) as string, group);
  });
  return `<div class="rows">${rows.join('')}</div>\n`;
}

/** `::: items` ... `:::`: each `### Term` + text becomes a visible item (hairline on top, no toggle). */
function renderItems(inner: string): string {
  const parts = inner.split(/^###\s+/m).slice(1);
  const items = parts.map((p) => {
    const nl = p.indexOf('\n');
    const term = (nl === -1 ? p : p.slice(0, nl)).trim();
    const body = nl === -1 ? '' : p.slice(nl + 1).trim();
    return `<div class="item">${glyphFor(term)}<h3 class="term">${marked.parseInline(term) as string}</h3>${marked.parse(body) as string}</div>`;
  });
  return `<div class="items">${items.join('')}</div>\n`;
}

/** `::: note` ... `:::`: a note box (the same style as the article note). */
function renderNote(inner: string): string {
  return `<aside class="note note--block">${marked.parse(inner) as string}</aside>\n`;
}

export function renderMarkdown(src: string): string {
  // `[Text](url){.btn-primary}` marks the page's one primary button.
  const text = interpolate(src)
    .replace(/\r\n/g, '\n')
    .replace(/\]\(([^)\s]+)\)\{\.btn-primary\}/g, `](\$1 "${BTN_TITLE}")`);
  const out: string[] = [];
  const re = /^:::\s*(rows|items|note)\s*\n([\s\S]*?)^:::\s*$/gm;
  let last = 0;
  let mt: RegExpExecArray | null;
  while ((mt = re.exec(text))) {
    out.push(marked.parse(text.slice(last, mt.index)) as string);
    out.push(mt[1] === 'rows' ? renderRows(mt[2]) : mt[1] === 'items' ? renderItems(mt[2]) : renderNote(mt[2]));
    last = re.lastIndex;
  }
  out.push(marked.parse(text.slice(last)) as string);
  return out.join('').replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
}

export function renderInline(src: string): string {
  return marked.parseInline(interpolate(src)) as string;
}
