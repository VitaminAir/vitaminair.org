import { labels, legendOrder, type StatusKey } from '../data/site.ts';
import { esc, label, displayDate, statement } from '../lib/html.ts';
import type { Article } from '../lib/content.ts';
import { glyphFor } from './art.ts';

export function eyebrow(text: string, noteNo?: string): string {
  return `<p class="eyebrow" data-rv>${noteNo ? `<span class="note-no">${esc(noteNo)}</span> · ` : ''}${esc(text)}</p>`;
}

export function legendDl(): string {
  return `<dl>${legendOrder
    .map((k) => `<div><dt>${label(k)}</dt><dd>${esc(labels[k].meaning)}</dd></div>`)
    .join('')}</dl>`;
}

/** Labels shown for a journal entry (type + archive). */
export function articleLabelKeys(a: Pick<Article, 'type' | 'archive'>): StatusKey[] {
  const out: StatusKey[] = [];
  if (a.archive) out.push('archive');
  if (a.type === 'story') out.push('story');
  if (a.type === 'reflection') out.push('reflection');
  return out;
}

export function articleLabels(a: Pick<Article, 'type' | 'archive'>): string {
  return articleLabelKeys(a).map((k) => label(k)).join('');
}

/** The labels legend, one tap away. */
export function legendDetails(cls = ''): string {
  return `<details class="legend${cls ? ' ' + cls : ''}"><summary>What the labels mean</summary>${legendDl()}</details>`;
}

export function entryRow(a: Article): string {
  const dt = a.date.slice(0, 10);
  const lab = articleLabels(a);
  return `<li class="row"><a href="${a.path}"><span class="row-title">${esc(a.title)}</span><span class="row-meta">${lab ? `<span class="row-label">${lab}</span>` : ''}<time class="date" datetime="${dt}">${displayDate(a.date)}</time></span><span class="arrow" aria-hidden="true">→</span></a></li>`;
}

/** Visible term + sentence items (no toggles). */
export function termItems(items: { title: string; body: string }[]): string {
  return `<div class="items">${items.map((r) => `<div class="item">${glyphFor(r.title)}<h3 class="term">${esc(r.title)}</h3>${r.body}</div>`).join('')}</div>`;
}

export function heroStatement(text: string, level: 'h1' | 'h2', cls: string): string {
  return `<${level} class="${cls}">${statement(text)}</${level}>`;
}

export function figureWithBar(src: string, imgHtml: string, tag: string, caption: string): string {
  return `<figure class="photo">${imgHtml}<figcaption>${tag ? `<span class="cap-tag">${esc(tag)}</span>` : ''}<span class="cap-text">${esc(caption)}</span></figcaption></figure>`;
}
