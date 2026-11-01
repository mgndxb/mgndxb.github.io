import {
  siAnthropic,
  siGithub,
  siMaplibre,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siReact,
  siResend,
  siStripe,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVitest,
  siZod,
  type SimpleIcon,
} from "simple-icons";

export const stats = [
  { value: 7, suffix: "", label: "products and platforms I've built" },
  { value: 6, suffix: "", label: "of them live, three taking real card payments" },
  { value: 2275, suffix: "", label: "automated tests and checks across two codebases" },
  { value: 20, suffix: "", prefix: "~", label: "sellers log every sale in my system daily" },
];

export interface Capability {
  title: string;
  text: string;
  proof: string;
  image: string;
}

export const capabilities: Capability[] = [
  {
    title: "Booking & scheduling",
    text: "Live availability, buffers between appointments, checkout holds, and slots that can't be double-booked even when two people click at once.",
    proof: "Defined PMU, Lumos Energia, Booking Conflict Engine",
    image: "/work/definedpmu-book-time-400.webp",
  },
  {
    title: "Payments",
    text: "Stripe deposits, signed webhooks, idempotent payment intents, automatic refunds and paid-plan checks. The server sets every price.",
    proof: "Defined PMU, Coded for Beauty, Brow Ink",
    image: "/work/codedforbeauty-mobile-400.webp",
  },
  {
    title: "Auth & roles",
    text: "Sign-in, sessions, role-based access, PIN sign-in for shared phones, OAuth with PKCE and revocable links that need no account.",
    proof: "FlagSales, CreatorMission, Defined PMU",
    image: "/work/creatormission-mobile-400.webp",
  },
  {
    title: "Admin & internal tools",
    text: "Back-office apps the people running the business use every day: calendars, queues, client records, operations dashboards.",
    proof: "Defined studio app, FlagSales, Lumos calendar",
    image: "/work/flagsales-mobile-400.webp",
  },
  {
    title: "Databases that enforce the rules",
    text: "PostgreSQL schemas, migrations, exclusion constraints, append-only ledgers and functions, so bad data can't get in at all.",
    proof: "Defined PMU, FlagSales, Booking Conflict Engine",
    image: "/work/lumos-mobile-400.webp",
  },
  {
    title: "AI features with guardrails",
    text: "Agents that call tools against real data, with the rules that matter enforced in code and evals that test how the model behaves.",
    proof: "AI Receptionist",
    image: "/work/ai-receptionist-mobile-400.webp",
  },
  {
    title: "Real-time data",
    text: "Live feeds streamed into the browser, my own MQTT client, and hundreds of moving points kept smooth on a WebGL map.",
    proof: "Helsinki Live",
    image: "/work/helsinki-live-mobile-400.webp",
  },
  {
    title: "Sites people remember",
    text: "Designed, fast marketing sites with booking built in, and motion that serves the content. Like this one.",
    proof: "Defined PMU, Brow Ink, Coded for Beauty",
    image: "/work/browink-mobile-400.webp",
  },
];

export interface Tool {
  name: string;
  icon?: SimpleIcon;
  note: string;
}

export interface ToolTier {
  label: string;
  caption: string;
  tools: Tool[];
}

export const toolbox: ToolTier[] = [
  {
    label: "Every day",
    caption: "What every project I've shipped is built on.",
    tools: [
      { name: "TypeScript", icon: siTypescript, note: "Strict mode, end to end" },
      { name: "Next.js", icon: siNextdotjs, note: "App Router, server actions" },
      { name: "React", icon: siReact, note: "Server and client components" },
      { name: "PostgreSQL", icon: siPostgresql, note: "Constraints, functions, migrations" },
      { name: "Supabase", icon: siSupabase, note: "Hosted Postgres, auth, storage" },
      { name: "Tailwind CSS", icon: siTailwindcss, note: "With design tokens" },
      { name: "Git & GitHub", icon: siGithub, note: "Branches, PRs, Actions" },
      { name: "Claude Code", icon: siAnthropic, note: "Directed, reviewed, tested" },
    ],
  },
  {
    label: "Most projects",
    caption: "Reached for whenever the product needs it.",
    tools: [
      { name: "Stripe", icon: siStripe, note: "PaymentIntents, webhooks, refunds" },
      { name: "Vercel", icon: siVercel, note: "Deploys, cron, previews" },
      { name: "Node.js", icon: siNodedotjs, note: "Scripts and server code" },
      { name: "Zod", icon: siZod, note: "Validation at the boundary" },
      { name: "Resend", icon: siResend, note: "Transactional email" },
    ],
  },
  {
    label: "When needed",
    caption: "Used for real, in specific places.",
    tools: [
      { name: "Vitest", icon: siVitest, note: "Unit and integration tests" },
      { name: "PGlite", note: "Real Postgres in tests" },
      { name: "MapLibre", icon: siMaplibre, note: "Self-hosted maps" },
      { name: "AI SDK", note: "Agents, tools and streaming" },
      { name: "GSAP", note: "The motion on this site" },
    ],
  },
];

export interface Trait {
  title: string;
  text: string;
}

export const strengths: Trait[] = [
  {
    title: "Shipping end to end",
    text: "From the first talk with a business owner to a live product with real payments. Six of my projects are in production.",
  },
  {
    title: "Rules that can't break",
    text: "I put the important rules in the database: no double bookings, no double spending, no duplicate emails. Then I test that they hold.",
  },
  {
    title: "Payments without surprises",
    text: "Server-side prices, signed webhooks, idempotency keys and refunds for the edge cases most people forget.",
  },
  {
    title: "Testing against the real thing",
    text: "Over 2,000 checks run against real Postgres and Stripe's sandbox, not mocks, because a mock can't prove a database rule.",
  },
  {
    title: "Design sense",
    text: "Clients get sites they're proud to send people to. I care how things look and move, not only whether they work.",
  },
  {
    title: "Production debugging",
    text: "I've traced failures that only happened in production, and I write down what broke and why.",
  },
];

export const learning: Trait[] = [
  {
    title: "Working in a team codebase",
    text: "I've mostly built alone, with clients. I want code review, shared conventions and people who'll tell me when my approach is wrong.",
  },
  {
    title: "Writing more by hand",
    text: "AI agents make me fast. I'm practising writing more without them, so I can explain every line, not just check that it works.",
  },
  {
    title: "CS fundamentals",
    text: "Algorithms and data structures beyond what my products have needed so far.",
  },
  {
    title: "Infrastructure beyond Vercel",
    text: "Docker, cloud providers and CI at scale. I've deployed plenty, but always on managed platforms.",
  },
  {
    title: "Native mobile",
    text: "Everything I've shipped runs on the web. Native iOS and Android are new to me.",
  },
];

export const process = [
  {
    title: "Understand the business",
    text: "Talk to the owner. Write down the rules that must never break, like one client per slot or a deposit before a booking is real.",
  },
  {
    title: "Model the data first",
    text: "Design the schema and its constraints before any screens, so the database refuses what shouldn't happen.",
  },
  {
    title: "Direct the agents",
    text: "Claude Code and ChatGPT write a lot of the code, from precise specs I write. They speed me up; they don't decide.",
  },
  {
    title: "Review everything",
    text: "Read every diff. Reject what doesn't satisfy the rules, however plausible it looks.",
  },
  {
    title: "Test against the real thing",
    text: "Run the real migrations on real Postgres, make real charges in Stripe's sandbox, and reproduce the race conditions.",
  },
  {
    title: "Ship and check it live",
    text: "Deploy, then check the real flows on the live domain. When something breaks, find out why and write it down.",
  },
];

export const faq = [
  {
    q: "What kind of role are you looking for?",
    a: "A junior developer role: full-stack, front-end or back-end. I'm in Helsinki, happy on-site, hybrid or remote, and I work in English and Finnish.",
  },
  {
    q: "When can you start?",
    a: "Right away. I'm in Helsinki and free now.",
  },
  {
    q: "What did you do before coding?",
    a: "Sales and operations. At a Helsinki field-sales company I went from seller to team lead to COO in six months, running a team of about 20: hiring, scheduling and day-to-day operations. The sales system I built for that team is still in use. Before that I trained and worked as a vehicle mechanic and drove delivery routes.",
  },
  {
    q: "You've shipped real products. Why junior?",
    a: "Because almost all of it was solo. I haven't had code review, senior engineers to learn from, or a big shared codebase. That's exactly what I'm after, and I'd rather be honest about it.",
  },
  {
    q: "Can I read your code?",
    a: "Yes. Booking Conflict Engine is public, the Defined PMU case study documents the architecture in depth, and this site's source is on GitHub. Client code is private, but I'm happy to walk you through it.",
  },
  {
    q: "How much of your code is written by AI?",
    a: "A lot of it is typed by agents. The requirements, the data model, the rules, the review, the tests and the production checks are mine. I'm upfront about it because it's how I work, and I'm building more hand-coding fluency too.",
  },
  {
    q: "What are you working on right now?",
    a: "Projects that show range beyond client work, each one live in the Lab above: every HSL vehicle on a 3D map straight from the raw feed, a rebuild of my FlagSales app where PostgreSQL enforces every rule, and an AI receptionist whose booking rules live in code and are tested with evals. And sending this site to teams I'd like to join.",
  },
  {
    q: "What are you best at?",
    a: "Systems where mistakes cost money: bookings, payments, credit and anything where two requests at once must not both win.",
  },
  {
    q: "What do you need to get better at?",
    a: "Working inside a team's codebase and process, CS fundamentals, and infrastructure beyond managed platforms. The full list is above.",
  },
];
