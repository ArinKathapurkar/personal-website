// The intro overlay and everything that animates after it agree on one signal.
const DONE_CLASS = 'intro-done';

export function markIntroDone() {
  document.documentElement.classList.add(DONE_CLASS);
  window.dispatchEvent(new Event('intro:done'));
}

export function onIntroDone(cb: () => void) {
  if (document.documentElement.classList.contains(DONE_CLASS)) cb();
  else window.addEventListener('intro:done', cb, { once: true });
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
