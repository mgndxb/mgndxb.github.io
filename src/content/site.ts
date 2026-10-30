/**
 * Everything personal on the site lives here, so updating a detail
 * (email, availability, links) never means touching a component.
 */
export const site = {
  /** Where the site lives. Change this to the .is-a.dev address once it's approved. */
  url: "https://mgndxb.github.io",
  name: "Magnus Kaur",
  firstName: "Magnus",
  role: "Full-stack developer",
  city: "Helsinki",
  country: "Finland",
  timeZone: "Europe/Helsinki",
  email: "magnuskaur.dev@gmail.com",
  github: "https://github.com/mgndxb",
  githubHandle: "mgndxb",
  availability: "Open to junior developer roles",
  workModes: "On-site, hybrid or remote",
  languages: "English, Finnish",
  now: "Rebuilding FlagSales from scratch",
  sourceRepo: "https://github.com/mgndxb/mgndxb.github.io",
  caseStudy: "https://github.com/mgndxb/defined-pmu-case-study",
  productionLessons:
    "https://github.com/mgndxb/defined-pmu-case-study/blob/main/docs/production-lessons.md",
} as const;
