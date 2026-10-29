// Everything personal lives here. Edit this file, not the components.
export const site = {
  name: { first: 'Arin', last: 'Kathapurkar' },
  // One word of the tagline is set in italic accent — wrap it in *asterisks*.
  tagline: 'Builds models that know how *sure* they are.',
  intro:
    'I work on machine learning where the output is a probability someone has to act on — live sports, portfolio risk, protein binding. I care about whether the number is right, not just whether it looks right.',
  eyebrow: ['Computer Science', 'Duke University'], // TODO: confirm school / class year
  location: 'Durham, NC', // TODO
  timezone: 'America/New_York',
  email: 'arin.kathapurkar26@gmail.com',
  links: {
    github: 'https://github.com/ArinKathapurkar',
    linkedin: 'https://www.linkedin.com/in/arin-kathapurkar',
    resume: '/ArinKathapurkar.pdf',
  },
  // The personality page. Rename freely; the file is src/pages/elsewhere.astro.
  personal: { label: 'Elsewhere', href: '/elsewhere' },
  // Landing photo stack, top card first. The intro "denoises" photos[0], so keep it a local file.
  // TODO: replace with real photos (4:5 works best), e.g. /me-1.jpg
  photos: [
    { src: '/photos/headshot.jpg', alt: 'Portrait of Arin Kathapurkar', caption: 'Me' },
    { src: '/photos/bigsur.jpg', alt: '⚲ Bixby Creek Bridge' },
    { src: '/photos/santacruz.jpg', alt: '⚲ Wilder Ranch State Park' },
  ],
} as const;
