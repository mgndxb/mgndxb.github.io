import type { MetadataRoute } from "next";

import { site } from "@/content/site";

// Rendered once at build time: the site is a static export.
export const dynamic = "force-static";

/**
 * Pages stay crawlable so search engines can read their noindex tag (set in the layout).
 * The CV PDFs can't carry that tag, so they're blocked here instead.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: [site.cv.en, site.cv.fi] },
  };
}
