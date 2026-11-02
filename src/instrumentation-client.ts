// Runs once per page load, before the app is interactive (Next.js
// instrumentation-client). Sends one visit ping per browser session and one
// per CV download, only on the live site, never from Magnus's own browsers
// (open the site once with ?me to opt one out) or automated ones.

import { site } from "./content/site";
import { ME_KEY, VISIT_ENDPOINT, referrerHost } from "./lib/visit";

function ping(kind: "visit" | "cv", path: string) {
  const ref = referrerHost(document.referrer, location.hostname);
  navigator.sendBeacon(VISIT_ENDPOINT, JSON.stringify({ kind, path, ref }));
}

try {
  if (new URLSearchParams(location.search).has("me")) localStorage.setItem(ME_KEY, "1");
  const quiet = location.origin !== site.url || localStorage.getItem(ME_KEY) === "1" || navigator.webdriver;

  if (!quiet) {
    if (!sessionStorage.getItem("mk-visit")) {
      sessionStorage.setItem("mk-visit", "1");
      ping("visit", location.pathname);
    }
    document.addEventListener(
      "click",
      (event) => {
        const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href$='.pdf']");
        if (!link) return;
        const path = new URL(link.href).pathname;
        if (sessionStorage.getItem(`mk-cv:${path}`)) return;
        sessionStorage.setItem(`mk-cv:${path}`, "1");
        ping("cv", path);
      },
      { capture: true },
    );
  }
} catch {
  // Storage blocked (some private modes): skip the pings rather than risk the page.
}
