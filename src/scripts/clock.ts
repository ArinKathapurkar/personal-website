import { site } from '../config/site';

export function initClocks() {
  const els = document.querySelectorAll<HTMLElement>('[data-clock]');
  if (!els.length) return;
  const fmt = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: site.timezone, timeZoneName: 'short',
  });
  const render = () => {
    const parts = fmt.formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const text = `${get('hour')}:${get('minute')}:${get('second')} ${get('timeZoneName')}`;
    els.forEach((el) => (el.textContent = text));
  };
  render();
  setInterval(render, 1000);
}
