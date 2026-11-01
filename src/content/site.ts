/**
 * Everything personal on the site lives here, so updating a detail
 * (email, availability, links) never means touching a component.
 */
export const site = {
  /** Where the site lives: GitHub Pages with a custom domain (mgndxb.github.io redirects here). */
  url: "https://magnus.is-a.dev",
  name: "Magnus Kaur",
  firstName: "Magnus",
  role: "Full-stack developer",
  city: "Helsinki",
  country: "Finland",
  timeZone: "Europe/Helsinki",
  email: "magnuskaur.dev@gmail.com",
  github: "https://github.com/mgndxb",
  githubHandle: "mgndxb",
  availability: "Available now for junior roles",
  workModes: "On-site, hybrid or remote",
  languages: "English, Finnish",
  now: "Building Lab projects you can try",
  /** Printed from cv/ with `npm run cv` (the public copies, without a phone number). */
  cv: { en: "/magnus-kaur-cv.pdf", fi: "/magnus-kaur-cv-suomi.pdf" },
  sourceRepo: "https://github.com/mgndxb/mgndxb.github.io",
  caseStudy: "https://github.com/mgndxb/defined-pmu-case-study",
  productionLessons:
    "https://github.com/mgndxb/defined-pmu-case-study/blob/main/docs/production-lessons.md",
} as const;
