// Section reveal: eyebrow, heading and first block fade up as a section enters view; accent underlines and
// contour dividers draw in. Hidden start states exist only under html.js (see main.css); reduced motion and no-JS show everything.
const d = document.documentElement;
d.dataset.rv = '1';
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((en) => en.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const g = (e.target as any)._g as Element[] | undefined;
    (g || [e.target]).forEach((x) => x.classList.add('in'));
  }), { threshold: 0.15 });
  const group = (els: Element[]) => {
    els.forEach((x, i) => (x as HTMLElement).style.setProperty('--i', String(i)));
    (els[0] as any)._g = els;
    io.observe(els[0]);
  };
  document.querySelectorAll('.rv').forEach((s) => {
    if (s.classList.contains('reading')) {
      // long-form pages: each h2 and the block after it, only below the fold (nothing visible is ever hidden)
      s.querySelectorAll<HTMLElement>(':scope > h2').forEach((h) => {
        if (h.getBoundingClientRect().top < innerHeight) return;
        const els = [h, h.nextElementSibling].filter(Boolean) as HTMLElement[];
        els.forEach((x) => x.setAttribute('data-rv', ''));
        group(els);
      });
    } else {
      const els = [...s.querySelectorAll('[data-rv]')];
      if (els.length) group(els);
    }
  });
  document.querySelectorAll('em.mark, .divider').forEach((x) => io.observe(x));
}
