export type ProjectStatus = "Live" | "In development" | "Not launched" | "Public code" | "Private";

export interface ShowroomProject {
  slug: string;
  name: string;
  kind: string;
  tagline: string;
  points: string[];
  stack: string[];
  status: ProjectStatus;
  url: string;
  urlLabel: string;
  extra?: { label: string; href: string };
  images: {
    /** Full-page capture, 1200px wide (plus a 640px version for phones). */
    full: string;
    fullHeight: number;
    mobile: string;
  };
  /** Scene colours, taken from each product's own brand. */
  theme: { bg: string; accent: string };
}

export const showroom: ShowroomProject[] = [
  {
    slug: "defined-pmu",
    name: "Defined PMU",
    kind: "Booking platform + studio app",
    tagline: "A permanent makeup studio in Helsinki runs its whole business on this. It takes real payments.",
    points: [
      "Live availability, deposits through Stripe and a studio admin app",
      "Double bookings blocked by PostgreSQL itself, not app checks",
      "1,568 automated checks across ten suites",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "Stripe", "Resend", "Vercel"],
    status: "Live",
    url: "https://definedpmu.com",
    urlLabel: "definedpmu.com",
    extra: { label: "Engineering case study", href: "https://github.com/mgndxb/defined-pmu-case-study" },
    images: {
      full: "/work/definedpmu-full.webp",
      fullHeight: 6000,
      mobile: "/work/definedpmu-book-treatment.webp",
    },
    theme: { bg: "#1a110e", accent: "#f0a493" },
  },
  {
    slug: "coded-for-beauty",
    name: "Coded for Beauty",
    kind: "Product for beauty studios",
    tagline: "Website, online booking and a studio app for beauty studios, sold as one monthly product.",
    points: [
      "Clients book and pay their deposit themselves, at any hour",
      "The Defined PMU booking stack, packaged for other studios",
      "£99 a month, live within a week",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "Stripe"],
    status: "Live",
    url: "https://codedforbeauty.com",
    urlLabel: "codedforbeauty.com",
    images: {
      full: "/work/codedforbeauty-full.webp",
      fullHeight: 6000,
      mobile: "/work/codedforbeauty-mobile.webp",
    },
    theme: { bg: "#16060d", accent: "#f39bc2" },
  },
  {
    slug: "brow-ink",
    name: "Brow Ink",
    kind: "Studio site + booking",
    tagline: "Website and online booking for a brow and lip artist in Nottingham, UK.",
    points: [
      "Ombré brows, lip blush and fine line, booked online in about a minute",
      "Runs on Coded for Beauty, with the same deposit flow as Defined",
      "Editorial design built around the artist's own work",
    ],
    stack: ["Next.js", "TypeScript", "Supabase", "Stripe"],
    status: "Live",
    url: "https://browink.co.uk",
    urlLabel: "browink.co.uk",
    images: {
      full: "/work/browink-full.webp",
      fullHeight: 6000,
      mobile: "/work/browink-mobile.webp",
    },
    theme: { bg: "#17110e", accent: "#e9b49b" },
  },
  {
    slug: "creatormission",
    name: "CreatorMission",
    kind: "Browser video editor",
    tagline: "A clip editor that keeps the campaign brief beside the edit and checks the clip before export.",
    points: [
      "Local-first: the video never leaves the creator's device",
      "Checks duration, captions, mentions and CTA against the brief",
      "OAuth with PKCE, signed sessions and paid-plan checks",
    ],
    stack: ["Next.js", "TypeScript", "Vercel"],
    status: "Live",
    url: "https://creatormission.com",
    urlLabel: "creatormission.com",
    images: {
      full: "/work/creatormission-full.webp",
      fullHeight: 6000,
      mobile: "/work/creatormission-mobile.webp",
    },
    theme: { bg: "#0b0a0c", accent: "#ff6a2c" },
  },
  {
    slug: "ateliva",
    name: "Ateliva",
    kind: "Team performance software",
    tagline: "Results, targets, rankings and competitions for teams whose work can be measured.",
    points: [
      "Public site plus partner and admin portals behind sign-in",
      "Database-backed state transitions with invitation tokens",
      "Transactional email, deployed and tested in production",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Supabase"],
    status: "Live",
    url: "https://ateliva.com",
    urlLabel: "ateliva.com",
    images: {
      full: "/work/ateliva-full.webp",
      fullHeight: 6000,
      mobile: "/work/ateliva-mobile.webp",
    },
    theme: { bg: "#111214", accent: "#ff7a4d" },
  },
  {
    slug: "lumos-energia",
    name: "Lumos Energia",
    kind: "Booking + scheduling",
    tagline: "Customer booking and an internal scheduling calendar for a solar and energy installer.",
    points: [
      "Customers book online; the team works from a shared calendar",
      "Booking validation and overlap prevention on every slot",
      "Finnish-language site for homes and businesses",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Supabase"],
    status: "Live",
    url: "https://lumosenergia.fi",
    urlLabel: "lumosenergia.fi",
    images: {
      full: "/work/lumos-full.webp",
      fullHeight: 6000,
      mobile: "/work/lumos-mobile.webp",
    },
    theme: { bg: "#0c1a30", accent: "#46c986" },
  },
  {
    slug: "flagsales",
    name: "FlagSales",
    kind: "Field-sales operations",
    tagline: "Internal tools a Finnish field-sales team of about 20 people works in, now being rebuilt from scratch.",
    points: [
      "I audited the legacy app, found security and correctness problems, and started over",
      "Auth, shifts, sales logging and role-based access, enforced in the database",
      "707 tests that run the real SQL migrations against Postgres",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Supabase"],
    status: "In development",
    url: "https://flagsales.fi",
    urlLabel: "flagsales.fi",
    images: {
      full: "/work/flagsales-full.webp",
      fullHeight: 4990,
      mobile: "/work/flagsales-mobile.webp",
    },
    theme: { bg: "#0b1116", accent: "#3a9be0" },
  },
];

export interface SideProject {
  name: string;
  kind: string;
  text: string;
  stack: string[];
  status: ProjectStatus;
  href?: string;
}

export const alsoBuilt: SideProject[] = [
  {
    name: "Booking Conflict Engine",
    kind: "Open-source code sample",
    text: "A small Next.js app where PostgreSQL guarantees two bookings can never overlap, with tests that reproduce the race itself.",
    stack: ["Next.js", "TypeScript", "PostgreSQL", "PGlite", "Vitest", "Zod"],
    status: "Public code",
    href: "https://github.com/mgndxb/booking-conflict-engine",
  },
  {
    name: "First Builder",
    kind: "Design system first",
    text: "A product built on my own design tokens, a reusable component library and custom lint rules.",
    stack: ["Next.js", "React", "TypeScript"],
    status: "Not launched",
  },
];
