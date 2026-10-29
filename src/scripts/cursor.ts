import { hasFinePointer, prefersReducedMotion } from './intro-state';

// A small dot that tracks the pointer exactly, and a ring that trails it.
// The ring swells over anything interactive; [data-cursor="label"] shows text.
export function initCursor() {
  if (!hasFinePointer()) return;
  const root = document.querySelector<HTMLElement>('.cursor');
  if (!root) return;
  const dot = root.querySelector<HTMLElement>('.cursor-dot')!;
  const ring = root.querySelector<HTMLElement>('.cursor-ring')!;
  const label = root.querySelector<HTMLElement>('.cursor-label')!;
  document.documentElement.classList.add('has-cursor');

  let x = -100, y = -100, rx = x, ry = y;
  const k = prefersReducedMotion() ? 1 : 0.18;

  window.addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    root.classList.add('is-visible');
  }, { passive: true });
  document.addEventListener('pointerleave', () => root.classList.remove('is-visible'));
  window.addEventListener('pointerdown', () => root.classList.add('is-down'));
  window.addEventListener('pointerup', () => root.classList.remove('is-down'));

  document.addEventListener('pointerover', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor]');
    const text = t?.dataset.cursor ?? '';
    root.classList.toggle('is-hover', !!t);
    root.classList.toggle('has-label', !!text);
    label.textContent = text;
  });

  const tick = () => {
    rx += (x - rx) * k;
    ry += (y - ry) * k;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
