// The one runtime entry for every page with a stage: hero / page stage canvas, section reveal, the homepage band
// (lazy) and the small-screen menu (lazy, loaded on first use).
import './stage.ts';
import './reveal.ts';
document.documentElement.dataset.menu = '1';
if (document.querySelector('.band-canvas')) import('./band.ts');
const mb = document.querySelector<HTMLButtonElement>('.menu-btn');
if (mb) {
  let m: Promise<typeof import('./menu.ts')> | undefined;
  const load = () => (m ||= import('./menu.ts'));
  mb.addEventListener('pointerdown', load);
  mb.addEventListener('focus', load);
  mb.addEventListener('click', () => load().then((x) => x.openMenu(mb)));
}
// the planting pilot page prints with every section open
if (document.querySelector('.pilot'))
  addEventListener('beforeprint', () => document.querySelectorAll<HTMLDetailsElement>('.pilot details').forEach((d) => (d.open = true)));
