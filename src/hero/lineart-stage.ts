// Live twin of the grass / terraces page-stage art (lazy chunk): drifting strokes, a hill under the pointer. The static SVG stays for reduced motion or pause.
import { lineStrokes, type LineKind, type Press } from '../art/lineart.ts';

const BG = '#123B2C', THIN = '#3F6E55', BOLD = '#6F9478', FRAME = 1000 / 24;

export function start(root: HTMLElement, canvas: HTMLCanvasElement, kind: LineKind, seed: number) {
  const c = canvas.getContext('2d');
  let paused = false;
  try { paused = sessionStorage.getItem('va-paused') === '1'; } catch { /* storage blocked */ }
  const rmq = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 759px), (max-height: 480px) and (max-width: 960px)');
  if (!c || paused || rmq.matches) return;

  let w = 0, h = 0, raf = 0, last = 0, inView = false, settle = 0;
  const t0 = performance.now();
  const target = { x: 0, y: 0, in: false };
  const press: Press = { x: 0, y: 0, s: 0 };

  function frame(now: number) {
    raf = 0;
    if (!inView || document.hidden || !w) return;
    if (now - last >= FRAME) {
      last = now;
      // the press eases in and out, so the hill grows and settles
      press.s += ((target.in ? 1 : 0) - press.s) * 0.08;
      press.x += (target.x - press.x) * 0.25;
      press.y += (target.y - press.y) * 0.25;
      const strokes = lineStrokes(kind, w, h, seed, (now - t0) / 1000, press.s > 0.01 ? press : undefined);
      c!.fillStyle = BG; c!.fillRect(0, 0, w, h);
      c!.lineCap = c!.lineJoin = 'round';
      for (const bold of [false, true]) {
        c!.strokeStyle = bold ? BOLD : THIN; c!.lineWidth = bold ? 1.6 : 1; c!.beginPath();
        for (const s of strokes) {
          if (s.bold !== bold) continue;
          c!.moveTo(s.p[0], s.p[1]);
          for (let i = 2; i < s.p.length; i += 2) c!.lineTo(s.p[i], s.p[i + 1]);
        }
        c!.stroke();
      }
      root.classList.add('is-live');
      if (small.matches && ++settle > 1) return; // small screens: one calm frame, no loop
    }
    raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && !rmq.matches) raf = requestAnimationFrame(frame); };

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = root.clientWidth; h = root.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    c!.setTransform(dpr, 0, 0, dpr, 0, 0);
    settle = 0; last = 0; kick();
  }

  new ResizeObserver(size).observe(root);
  new IntersectionObserver((en) => { inView = en[en.length - 1].isIntersecting; kick(); }).observe(root);
  document.addEventListener('visibilitychange', kick);
  addEventListener('pointermove', (e) => {
    if (small.matches) return;
    const r = root.getBoundingClientRect();
    target.x = e.clientX - r.left; target.y = e.clientY - r.top;
    target.in = target.x > 0 && target.y > 0 && target.x < r.width && target.y < r.height;
    if (target.in && press.s < 0.01) { press.x = target.x; press.y = target.y; }
    if (target.in) kick();
  }, { passive: true });
  root.addEventListener('pointerleave', () => { target.in = false; kick(); });
  rmq.addEventListener('change', () => { if (rmq.matches) { root.classList.remove('is-live'); cancelAnimationFrame(raf); raf = 0; } else kick(); });
  size();
}
