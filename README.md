# Magnus Kaur, portfolio

My personal site: every product I've shipped, what I'm good at, what I'm still learning, and the code behind the booking systems I build.

## What's in it

- **Hero.** My name drawn by thousands of WebGL particles that assemble on load, get pushed by the cursor and blow apart on scroll. The shader lives in [`src/lib/particles.ts`](src/lib/particles.ts).
- **Showroom.** A pinned, sideways-scrolling gallery of six live products. Each one gets a 3D browser window that scrolls through the real site, a phone mockup, and a background lit in that product's brand colour.
- **Case study.** Defined PMU in depth, with a sticky stage that swaps between the booking flow, an animated payment diagram and the real test-suite numbers.
- **Try to double-book.** An interactive schedule where overlapping requests are refused at the moment they're written, the same rule as the PostgreSQL exclusion constraint in my booking systems. The rule is in [`src/lib/schedule.ts`](src/lib/schedule.ts), with tests in [`src/lib/schedule.test.ts`](src/lib/schedule.test.ts).
- **Sound.** A generative ambient score and interface sounds, all synthesised live with the Web Audio API (no audio files), all in one key. It's on by default and starts on the visitor's first click, tap or key press, since browsers allow no audio before that; the sound button in the header mutes it any time. See [`src/lib/sound.ts`](src/lib/sound.ts).
- **Skills, stack, strengths, still learning, process, FAQ and contact.**

## Stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS
- GSAP (ScrollTrigger, SplitText, ScrambleText) and Lenis for motion and smooth scrolling
- Web Audio API for the sound
- Raw WebGL2 for the particle hero
- Shiki for code highlighting at build time
- Vitest
- Static export, hosted on GitHub Pages

## Run it locally

Needs Node.js 22 or newer.

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run verify   # lint, typecheck, tests, production build
npm test         # tests only
npm run build    # static site in out/
npm start        # serve out/ locally
```

## Where things live

```
src/content/          All text on the site: profile, projects, skills, FAQ, code excerpts
src/components/       One file per section
src/components/motion Smooth scroll, cursor, magnetic buttons, text reveals
src/lib/motion.ts     GSAP setup and the opening handover
src/lib/particles.ts  The WebGL particle field
src/lib/sound.ts      The sound engine: ambient score and interface sounds
src/lib/schedule.ts   The booking rule behind the schedule board
public/work/          Screenshots of each product
cv/                   The CV in English and Finnish, printed to PDF with `npm run cv`
```

To change any text, edit the files in [`src/content/`](src/content/). Your email and links are in [`src/content/site.ts`](src/content/site.ts).

To update the CV, edit [`cv/cv.en.html`](cv/cv.en.html) and [`cv/cv.fi.html`](cv/cv.fi.html), put your phone number in `cv/phone.txt` (never committed), run `npm run cv`, then copy the two files from `cv/out/public/` into `public/`. The copies with your phone number land in `cv/out/` for sending to employers.

Everything respects `prefers-reduced-motion`: smooth scrolling, the intro and movement switch off, and the page stays fully readable. Lighthouse: 100 for accessibility and best practices.

The site is deliberately kept out of search engines: every page carries `noindex`, and `robots.txt` blocks the CV files. Search engines still need to crawl the pages to see the `noindex`, so don't block them in `robots.txt`.

## Deploying

See [DEPLOY.md](DEPLOY.md).
