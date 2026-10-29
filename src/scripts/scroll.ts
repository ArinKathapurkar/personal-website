import Lenis from 'lenis';
import { prefersReducedMotion } from './intro-state';

let lenis: Lenis | null = null;

export function initScroll() {
  if (prefersReducedMotion()) return null;
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) });
  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // In-page anchors go through Lenis so they glide instead of jump.
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || !lenis) return;
    const id = a.getAttribute('href')!;
    const target = id === '#top' ? 0 : document.querySelector<HTMLElement>(id);
    if (target === null) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: id === '#top' ? 0 : -8 });
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });
  return lenis;
}

export const getLenis = () => lenis;
