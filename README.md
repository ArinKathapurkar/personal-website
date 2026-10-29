# Personal website

Astro + vanilla TypeScript. No UI framework, no Tailwind — plain CSS with tokens.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # type-checks, then builds static files to dist/
npm run preview
```

## Pages

- `/`: intro, then the landing page (photos, name, headline, links)
- `/work`: all projects, plus the Now log
- `/work/<slug>`: one project's write-up, rendered from its Markdown file
- `/elsewhere`: personality page (placeholder)

## Editing content

| What | Where |
| --- | --- |
| Name, tagline, intro, email, GitHub, LinkedIn, school, location | `src/config/site.ts` |
| Photos (landing stack) | put 3 photos (4:5, ~1200px wide, metadata stripped) in `public/photos/`, then update `photos` in `site.ts`. The first one is what the intro "denoises", so keep it a local file |
| Résumé | `public/resume.pdf` |
| Projects | one Markdown file per project in `src/content/projects/` |
| "Currently working on" | one Markdown file per entry in `src/content/now/` (newest shows on the landing page; full log on /work) |
| Personality page | `src/pages/elsewhere.astro`; its nav label lives in `site.personal` |

**Projects:** frontmatter is validated by `src/content.config.ts`. `order` sets list position. `image` is the
hover preview / detail figure (4:3 works best). Any metric whose `value` is `TODO` renders as an em dash
until you fill it in. The body is regular Markdown; `##` headings become the mono section labels.

**Now entries:** `status` is one of `building`, `reading`, `exploring`. The newest `date` becomes the
section's "Updated" stamp.

## Where the motion lives

- `src/scripts/intro.ts` — the diffusion-style intro: the first photo is rendered from noise
  (cosine schedule, t = 1000 → 0), then flies into the photo stack. Plays on every fresh load or refresh,
  skipped when arriving from another page of the site or with `prefers-reduced-motion`. Any key skips it.
- `src/scripts/reveal.ts` — masked line reveals and fades on scroll (CSS does the animation).
- `src/scripts/scroll.ts` — Lenis smooth scrolling.
- `src/scripts/cursor.ts` — custom cursor (fine pointers only).
- `src/components/Landing.astro` — the one-screen landing page and the rolling link index.
- `src/components/Particles.astro` — the site-wide particle background (tsParticles). Count, speed, link
  distance and hover "grab" radius are all in its `options` object.
- `src/components/PhotoStack.astro` — the draggable photo stack (fans on hover, double-click to tidy).
- `src/components/ProjectIndex.astro` — the floating project preview.

## Deploy (Cloudflare Pages, free)

The site is fully static, so it's hosted on Cloudflare Pages straight from GitHub. Every push to `main`
goes live in about a minute, and other branches get their own preview URL.

**One-time setup**

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick this repo.
2. Build settings: framework preset **Astro**, build command `npm run build`, output directory `dist`,
   environment variable `NODE_VERSION=22`.
3. Custom domain: add the domain to Cloudflare (Free plan), set the registrar's nameservers to the two
   Cloudflare gives you, then add the apex and `www` under the Pages project's *Custom domains*.
   HTTPS is automatic.
4. Set `site` in `astro.config.mjs` to the final domain (it drives canonical links and the social card).

**Other files that matter for hosting**

- `public/_headers`: long-lived caching for hashed build assets.
- `public/og.png`: the preview card shown when the link is pasted into LinkedIn, Slack, iMessage, etc.
- `src/pages/404.astro`: served for unknown URLs.
- Photos in `public/photos/` are resized copies with location data stripped. Originals live in
  `photos-original/` (git-ignored). To swap a photo, export ~1200px wide with no metadata.
