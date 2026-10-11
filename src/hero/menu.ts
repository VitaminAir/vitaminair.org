// Small-screen menu: a full-screen panel over the hero's Land contours (shared field), drifting slowly, with the same
// pointer bulge and tap ripple as hero scene 1. Runs only while open; honours the shared pause preference and reduced motion.
import { field, contourLines, ss } from '../art/contours.ts';

const root = document.querySelector<HTMLElement>('.menu')!;
const cv = root.querySelector<HTMLCanvasElement>('.menu-canvas')!;
const c = cv.getContext('2d')!;
const closeB = root.querySelector<HTMLButtonElement>('.menu-close')!;
const links = [...root.querySelectorAll<HTMLElement>('.menu-nav a')];
links.forEach((a, i) => a.style.setProperty('--i', String(i)));
const rmq = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 759px), (max-height: 480px) and (max-width: 960px)');
const still = () => rmq.matches || (() => { try { return sessionStorage.getItem('va-paused') === '1'; } catch { return false; } })();
const TAU = Math.PI * 2;

let opener: HTMLElement | null = null, isOpen = false, raf = 0, t0 = 0, w = 0, h = 0, dpr = 1, px = -1e4, py = -1e4, bt = 0, ba = 0, last = 0, hold = 0;
let rip: { x: number; y: number; t: number }[] = [];
const hidden: { el: HTMLElement; was: boolean }[] = [];

function frame(ts: number, staticDraw: boolean) {
  const age = staticDraw ? 1e9 : ts - t0;
  const a = (ts / 60000) * TAU;
  const f = field(w, h, { seed: 21, st: 12, off: staticDraw ? [0, 0] : [Math.cos(a) * 0.9, Math.sin(a) * 0.9] });
  c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
  c.lineCap = c.lineJoin = 'round';
  const disp = (x: number, y: number): [number, number] => {
    if (ba > 0.01) { const dx = x - px, dy = y - py, d = Math.hypot(dx, dy); if (d < 150 && d > 0.1) { const k = (7 * ba * (1 - d / 150) ** 2) / d; x += dx * k; y += dy * k; } }
    for (const r of rip) {
      const p = Math.min((ts - r.t) / 3000, 1), R = Math.hypot(w, h) * 0.4 * (1 - (1 - p) ** 2), dx = x - r.x, dy = y - r.y, d = Math.hypot(dx, dy), wv = Math.abs(d - R);
      if (wv < 50 && d > 1) { const k = (18 * (1 - p) ** 1.5 * (1 - wv / 50) ** 2) / d; x += dx * k; y += dy * k; }
    }
    return [x, y];
  };
  for (const pass of [0, 1]) {
    c.beginPath();
    for (const { p, li } of contourLines(f, 14)) {
      if ((li % 4 == 2 ? 1 : 0) !== pass) continue;
      const n = p.length / 2 - 1, g = ss((age - li * 28) / 480), e = n * g, k = e | 0;
      if (g <= 0) continue;
      for (let i = 0; i <= k; i++) { const [x, y] = disp(p[2 * i], p[2 * i + 1]); i ? c.lineTo(x, y) : c.moveTo(x, y); }
    }
    c.strokeStyle = pass ? '#6F9478' : '#3F6E55'; c.lineWidth = pass ? 1.5 : 1; c.globalAlpha = pass ? 0.8 : 0.9;
    c.stroke();
  }
  c.globalAlpha = 1;
}

function size() {
  w = innerWidth; h = innerHeight; dpr = Math.min(devicePixelRatio || 1, 1.5);
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
}
function tick(ts: number) {
  raf = 0;
  if (!isOpen) return;
  ba += (bt - ba) * 0.2;
  rip = rip.filter((r) => ts - r.t < 3000);
  if (ts - last >= 33) { last = ts; frame(ts, false); }
  raf = requestAnimationFrame(tick);
}
const kick = () => { if (!raf && isOpen && !still()) raf = requestAnimationFrame(tick); };

function focusables(): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('a[href],button')];
}
function onKey(e: KeyboardEvent) {
  if (!isOpen) return;
  if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
  if (e.key !== 'Tab') return;
  const f = focusables(), first = f[0], lastEl = f[f.length - 1], act = document.activeElement;
  if (!root.contains(act)) { e.preventDefault(); first.focus(); }
  else if (e.shiftKey && act === first) { e.preventDefault(); lastEl.focus(); }
  else if (!e.shiftKey && act === lastEl) { e.preventDefault(); first.focus(); }
}

export function openMenu(btn: HTMLElement) {
  if (isOpen) return;
  isOpen = true; opener = btn; btn.setAttribute('aria-expanded', 'true');
  size();
  [...document.body.children].forEach((el) => { if (el !== root && el.tagName !== 'SCRIPT') { const e = el as HTMLElement; hidden.push({ el: e, was: e.inert }); e.inert = true; } });
  document.documentElement.classList.add('menu-open');
  root.classList.add('is-open');
  t0 = performance.now(); last = 0;
  if (still()) frame(t0, true); else { frame(t0, false); kick(); }
  links[0].focus({ preventScroll: true });
}
export function closeMenu() {
  if (!isOpen) return;
  isOpen = false;
  root.classList.remove('is-open');
  document.documentElement.classList.remove('menu-open');
  hidden.splice(0).forEach((x) => (x.el.inert = x.was));
  opener?.setAttribute('aria-expanded', 'false');
  opener?.focus({ preventScroll: true });
  cancelAnimationFrame(raf); raf = 0; bt = 0; ba = 0; rip = [];
  clearTimeout(hold);
  hold = window.setTimeout(() => c.clearRect(0, 0, cv.width, cv.height), 300);
}

closeB.addEventListener('click', closeMenu);
links.forEach((a) => a.addEventListener('click', closeMenu));
root.querySelectorAll('.menu-head .wordmark, .menu-foot a').forEach((a) => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', onKey);
narrow.addEventListener('change', () => { if (!narrow.matches) closeMenu(); });
addEventListener('resize', () => { if (isOpen) { size(); frame(performance.now(), still()); } });
const blocked = (e: Event) => !!(e.target as Element).closest('a,button');
root.addEventListener('pointermove', (e) => {
  if (blocked(e)) { bt = 0; return; }
  if (still()) return;
  px = e.clientX; py = e.clientY; bt = 1; kick();
});
root.addEventListener('pointerdown', (e) => {
  if (blocked(e) || still()) return;
  px = e.clientX; py = e.clientY; bt = 1; rip.push({ x: px, y: py, t: performance.now() }); if (rip.length > 4) rip.shift(); kick();
});
root.addEventListener('pointerup', (e) => { if (e.pointerType != 'mouse') bt = 0; });
root.addEventListener('pointerleave', () => { bt = 0; });
root.addEventListener('pointercancel', () => { bt = 0; });
