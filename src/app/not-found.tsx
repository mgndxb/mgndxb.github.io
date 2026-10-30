import type { Metadata } from "next";
import Link from "next/link";

import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Not found, ${site.name}`,
};

/** A 404 in the site's own language: a request the database refused. */
export default function NotFound() {
  return (
    <main className="gutter grid min-h-[100svh] place-items-center py-24">
      <div className="w-full max-w-4xl">
        <p className="eyebrow flex items-center gap-3">
          <span className="h-px w-8 bg-ash" aria-hidden />
          404
        </p>
        <h1 className="display mt-8 text-[clamp(3.4rem,12vw,10rem)] font-bold">Refused.</h1>
        <p className="mt-6 max-w-[46ch] text-[clamp(1.05rem,1.5vw,1.3rem)] text-bone/80">
          Nothing is booked at this address. The page may have moved, or the link has a typo.
        </p>

        <div aria-hidden className="board mt-12 rounded-[24px] p-4 sm:p-6">
          <div className="lane">
            <div
              className="booking"
              data-status="confirmed"
              style={{ left: "6%", width: "30%", top: "4px", height: "calc(100% - 8px)" }}
            >
              Home
            </div>
            <div
              className="booking"
              data-status="refused-static"
              style={{ left: "44%", width: "34%", top: "4px", height: "calc(100% - 8px)" }}
            >
              This page
            </div>
          </div>
          <p className="mt-4 flex items-baseline gap-2.5 text-[14px] text-ash">
            <span className="relative top-px size-2.5 shrink-0 rounded-[3px] bg-red" />
            Refused: no page at this address. Error 404.
          </p>
        </div>

        <Link href="/" className="pill pill-solid mt-12">
          Back to the showroom
        </Link>
      </div>
    </main>
  );
}
