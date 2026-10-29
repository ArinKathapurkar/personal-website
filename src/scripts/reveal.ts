import { onIntroDone } from './intro-state';

// Elements marked [data-reveal] (masked lines) or [data-fade] get .is-in once
// they enter the viewport. Anything inside [data-hero] waits for the intro.
export function initReveal() {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-fade]');
  const hero: HTMLElement[] = [];
  const rest: HTMLElement[] = [];
  targets.forEach((el) => (el.closest('[data-hero]') ? hero : rest).push(el));

  onIntroDone(() => {
    requestAnimationFrame(() => hero.forEach((el) => el.classList.add('is-in')));
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  rest.forEach((el) => io.observe(el));
}
