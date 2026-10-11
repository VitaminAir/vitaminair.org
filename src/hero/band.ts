// The approach band's faint contour field: a very slow living drift (about one cycle per 60 s) of the shared noise
// field, with a soft bulge under the pointer. Pauses off-screen and with the hero's pause preference; static under reduced motion.
import { field, contourLines } from '../art/contours.ts';

const root = document.querySelector<HTMLElement>('.band');
const cv = root?.querySelector<HTMLCanvasElement>('.band-canvas');
if (root && cv) {
  const c = cv.getContext('2d')!;
  const rmq = matchMedia('(prefers-reduced-motion: reduce)');
  const isPaused = () => { try { return sessionStorage.getItem('va-paused') === '1'; } catch { return false; } };
  let w = 0, h = 0, dpr = 1, inView = false, raf = 0, last = 0, px = -1e4, py = -1e4, bt = 0, ba = 0;
  const TAU = Math.PI * 2;

  function draw(ts: number) {
    const a = (ts / 60000) * TAU, f = field(w, h, { seed: 11, st: 16, off: [Math.cos(a) * 0.9, Math.sin(a) * 0.9] });
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    c.strokeStyle = '#F6F1E6'; c.globalAlpha = 0.07; c.lineWidth = 1.2; c.lineCap = c.lineJoin = 'round';
    c.beginPath();
    for (const { p } of contourLines(f, 13)) {
      for (let i = 0; i < p.length; i += 2) {
        let x = p[i], y = p[i + 1];
        if (ba > 0.01) { const dx = x - px, dy = y - py, dd = Math.hypot(dx, dy); if (dd < 170 && dd > 0.1) { const k = (9 * ba * (1 - dd / 170) ** 2) / dd; x += dx * k; y += dy * k; } }
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
    }
    c.stroke();
    root!.classList.add('is-live');
  }
  const still = () => rmq.matches || isPaused();
  function tick(ts: number) {
    raf = 0;
    if (!inView || document.hidden || still()) return;
    ba += (bt - ba) * 0.2;
    if (ts - last >= (bt || ba > 0.01 ? 50 : 110)) { last = ts; draw(ts); }
    raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf && inView && !document.hidden && !still()) raf = requestAnimationFrame(tick); };
  function size() {
    const nw = root!.clientWidth, nh = root!.clientHeight;
    if (nw == w && nh == h) return;
    w = nw; h = nh; dpr = Math.min(devicePixelRatio || 1, 1.5);
    cv!.width = Math.round(w * dpr); cv!.height = Math.round(h * dpr);
    draw(performance.now());
  }
  size();
  root.addEventListener('pointermove', (e) => {
    if (e.pointerType != 'mouse' || still()) return;
    const r = root.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; bt = 1; kick();
  });
  root.addEventListener('pointerleave', () => { bt = 0; kick(); });
  new IntersectionObserver((en) => { inView = en[en.length - 1].isIntersecting; kick(); }).observe(root);
  document.addEventListener('visibilitychange', kick);
  let rt = 0;
  new ResizeObserver(() => { clearTimeout(rt); rt = window.setTimeout(() => { size(); kick(); }, 150); }).observe(root);
  rmq.addEventListener('change', () => { draw(performance.now()); kick(); });
  // follow the hero's pause button (same session preference)
  document.addEventListener('click', (e) => { if ((e.target as Element).closest?.('.stage-pause')) setTimeout(() => { if (!still()) kick(); }, 0); });
}
