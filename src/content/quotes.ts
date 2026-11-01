/**
 * Words from the people the work was built for, quoted exactly as they sent
 * them and shown with their permission. The section stays hidden while this
 * list is empty.
 */
export interface Quote {
  text: string;
  name: string;
  /** Their role and business, e.g. "Owner, Defined PMU". */
  role: string;
  /** Matches a showroom slug, so the quote can sit next to that project's colours. */
  project: "defined-pmu" | "coded-for-beauty" | "brow-ink" | "creatormission" | "lumos-energia" | "flagsales";
}

export const quotes: Quote[] = [];
