export const caseChapters = [
  {
    id: "booking",
    label: "Booking",
    title: "A booking flow that can't double-book",
    text: "Customers pick a treatment, then a day and time. Only times that fit the whole appointment are shown, read live from PostgreSQL. Two exclusion constraints decide whether a slot is free, so two people tapping the same time can't both win.",
    facts: ["Live availability per request", "Buffers and minimum notice", "Short server-side checkout holds"],
  },
  {
    id: "payments",
    label: "Payments",
    title: "The server owns the money",
    text: "The browser asks for a booking; it never names a price. The server creates the Stripe payment from its own snapshot, and the booking only becomes real when a signed webhook says the deposit arrived. If the slot was lost mid-payment, the money goes back automatically.",
    facts: ["Signed, verified webhooks", "Idempotent payment intents", "Automatic refunds on lost slots"],
  },
  {
    id: "testing",
    label: "Testing",
    title: "1,568 checks before anything ships",
    text: "Ten suites run against a local PostgreSQL stack and Stripe's sandbox, alongside typecheck, lint and a production build. The payment suite makes real charges and refunds, and refuses to start against a live key.",
    facts: ["Real Postgres, not mocks", "Real Stripe sandbox charges", "Typecheck, lint and build gate"],
  },
] as const;

/** Suite sizes from the Defined PMU case study, run on 18 August 2026. */
export const testSuites = [
  { name: "Lifecycle", checks: 278 },
  { name: "Admin", checks: 246 },
  { name: "Email", checks: 224 },
  { name: "Client card & referrals", checks: 191 },
  { name: "Payments", checks: 134 },
  { name: "Questionnaire", checks: 127 },
  { name: "Scheduling rules", checks: 112 },
  { name: "Booking engine", checks: 94 },
  { name: "Defined Credit", checks: 90 },
  { name: "Consent", checks: 72 },
];

export const underneath = [
  {
    title: "Health data kept apart",
    text: "Questionnaire answers live in their own table, read by exactly one database function, opened through revocable 256-bit links. No customer account needed.",
  },
  {
    title: "Emails that send once",
    text: "Eight lifecycle emails come from a database outbox with deterministic keys, so retries and duplicate webhooks can't send twice.",
  },
  {
    title: "Credit as a ledger",
    text: "Referral credit is an append-only ledger behind a per-customer lock, so two browser tabs can't spend the same €25.",
  },
];
