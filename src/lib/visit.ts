/**
 * Visit pings: a phone notification when someone opens the site or downloads
 * the CV. The endpoint lives with the AI Receptionist on Vercel
 * (github.com/mgndxb/ai-receptionist, api/visit.ts) and stores nothing.
 */

export const VISIT_ENDPOINT = "https://ai-receptionist-omega-hazel.vercel.app/api/visit";

/** localStorage key set by opening the site with `?me`, so Magnus's own browsers stay quiet. */
export const ME_KEY = "mk-me";

/** The site that linked here, as a bare host. "" for direct visits and for links within the site. */
export function referrerHost(referrer: string, ownHost: string): string {
  if (!referrer) return "";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host === ownHost.replace(/^www\./, "") ? "" : host;
  } catch {
    return "";
  }
}
