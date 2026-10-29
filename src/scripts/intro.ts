import gsap from 'gsap';
import { markIntroDone } from './intro-state';
import { getLenis } from './scroll';

// The intro "samples" the first portrait the way a diffusion model would:
// x_t = sqrt(abar_t) * x0 + sqrt(1 - abar_t) * eps, walking t from 1000 down to 0.
// It isn't a model, just the forward-process formula run backwards on a known image.
const W = 120;
const H = 150;
const STEPS = 50;
const T = 1000;
const STEP_MS = 36; // ~1.8s for the full walk
const GATE_STEP = 35; // hold here (t≈300) until fonts and the photo are ready
const MAX_WAIT_MS = 4000;

// Cosine schedule (Nichol & Dhariwal), abar(0) = 1, abar(T) ≈ 0.
const abar = (t: number) => {
  const s = 0.008;
  const f = (x: number) => Math.cos(((x / T + s) / (1 + s)) * (Math.PI / 2)) ** 2;
  return f(t) / f(0);
};

// Seeded so the noise field is the same on every load.
function gaussian(seed: number) {
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());
}

// RGB pixels in [-1, 1], cropped like object-fit: cover.
async function loadPixels(src: string): Promise<Float32Array | null> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  try {
    await img.decode();
  } catch {
    return null;
  }
  const iw = img.naturalWidth || W;
  const ih = img.naturalHeight || H;
  const scale = Math.max(W / iw, H / ih);
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  const c = off.getContext('2d', { willReadFrequently: true })!;
  c.drawImage(img, (W - iw * scale) / 2, (H - ih * scale) / 2, iw * scale, ih * scale);
  const data = c.getImageData(0, 0, W, H).data;
  const out = new Float32Array(W * H * 3);
  for (let i = 0; i < W * H; i++) {
    for (let ch = 0; ch < 3; ch++) out[i * 3 + ch] = (data[i * 4 + ch] / 255) * 2 - 1;
  }
  return out;
}

export function initIntro() {
  const el = document.querySelector<HTMLElement>('.intro');
  if (!el || document.documentElement.dataset.intro === 'skip') {
    el?.remove();
    markIntroDone();
    return;
  }

  const lenis = getLenis();
  lenis?.stop();

  const frame = el.querySelector<HTMLElement>('[data-intro-frame]')!;
  const canvas = el.querySelector<HTMLCanvasElement>('[data-intro-canvas]')!;
  const tOut = el.querySelector<HTMLElement>('[data-intro-t]')!;
  const stepOut = el.querySelector<HTMLElement>('[data-intro-step]')!;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(W, H);
  const px = image.data;

  const accent = (getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || '79 140 255')
    .split(/\s+/)
    .map(Number);

  const normal = gaussian(0x5eed);
  const eps = new Float32Array(W * H).map(() => normal());
  let x0: Float32Array = new Float32Array(W * H * 3).fill(-1);
  let ready = false;
  let forced = false;

  Promise.all([
    document.fonts.ready,
    loadPixels(canvas.dataset.src!).then((p) => {
      if (p) x0 = p;
    }),
  ]).finally(() => (ready = true));

  // Draw step k of STEPS. Blocks shrink from 8px to 1px as the image clears.
  const draw = (k: number) => {
    const t = Math.round(T * (1 - k / STEPS));
    const a = abar(t);
    const sa = Math.sqrt(a);
    const sn = Math.sqrt(1 - a);
    const block = Math.max(1, Math.round(8 * (1 - k / STEPS) ** 1.6));
    const jitter = sn * 0.35; // a little fresh noise each step so it shimmers like sampling
    for (let by = 0; by < H; by += block) {
      for (let bx = 0; bx < W; bx += block) {
        const i = by * W + bx;
        const n = eps[i] * (1 - jitter) + normal() * jitter;
        const ch = (c: number) => Math.min(1, Math.max(0, (sa * x0[i * 3 + c] + sn * n + 1) / 2));
        const vr = ch(0), vg = ch(1), vb = ch(2);
        const v = (vr + vg + vb) / 3;
        // Noise reads blue; the clean image comes through in full colour.
        const tint = sn * 0.7;
        const r = vr * 255 * (1 - tint) + v * accent[0] * 1.2 * tint;
        const g = vg * 255 * (1 - tint) + v * accent[1] * 1.2 * tint;
        const b = vb * 255 * (1 - tint) + v * accent[2] * tint;
        for (let y = by; y < Math.min(by + block, H); y++) {
          for (let x = bx; x < Math.min(bx + block, W); x++) {
            const j = (y * W + x) * 4;
            px[j] = r;
            px[j + 1] = g;
            px[j + 2] = b;
            px[j + 3] = 255;
          }
        }
      }
    }
    ctx.putImageData(image, 0, 0);
    tOut.textContent = String(t).padStart(4, '0');
    stepOut.textContent = String(k).padStart(2, '0');
  };

  const start = performance.now();
  let clock = 0; // ms of sampling time, paused while gated
  let last = start;
  let k = -1;
  let finished = false;

  const tick = () => {
    const now = performance.now();
    const gated = !ready && !forced && now - start < MAX_WAIT_MS && Math.floor(clock / STEP_MS) >= GATE_STEP;
    if (!gated) clock += now - last;
    last = now;
    const next = forced ? STEPS : Math.min(STEPS, Math.floor(clock / STEP_MS));
    if (next !== k) {
      k = next;
      draw(k);
    }
    if (k >= STEPS && !finished) {
      finished = true;
      gsap.ticker.remove(tick);
      exit();
    }
  };
  gsap.ticker.add(tick);

  const skip = () => {
    forced = true;
  };
  window.addEventListener('keydown', skip, { once: true });
  el.addEventListener('click', skip, { once: true });

  function exit() {
    window.removeEventListener('keydown', skip);
    const target = document.querySelector<HTMLElement>('[data-stack-top]');
    const tl = gsap.timeline({
      onComplete: () => {
        el!.remove();
        lenis?.start();
      },
    });

    tl.to(el!.querySelectorAll('.intro-row, [data-intro-readout]'), { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0.15);

    if (target && target.offsetWidth) {
      // FLIP the canvas onto the top photo card. Rotation is about the centre,
      // so the bounding-box centre is still the card's centre.
      const from = frame.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const rot = Number(target.dataset.rot || 0);
      tl.to(
        frame,
        {
          x: to.left + to.width / 2 - (from.left + from.width / 2),
          y: to.top + to.height / 2 - (from.top + from.height / 2),
          scale: target.offsetWidth / frame.offsetWidth,
          rotation: rot,
          duration: 0.95,
          ease: 'expo.inOut',
        },
        0.25,
      )
        .to(el!, { backgroundColor: 'rgba(7, 8, 10, 0)', duration: 0.6, ease: 'power2.out' }, 0.6)
        .set(el!, { pointerEvents: 'none' }, 0.6)
        .call(markIntroDone, [], 1.0)
        .to(frame, { opacity: 0, duration: 0.35, ease: 'power1.out' }, 1.25);
    } else {
      tl.to(el!, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.3).call(markIntroDone, [], 0.5);
    }
  }
}
