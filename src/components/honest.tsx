"use client";

import { useRef } from "react";

import { learning, strengths } from "@/content/skills";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

import { Eyebrow } from "./motion/eyebrow";
import { SplitReveal } from "./motion/split-reveal";

/**
 * Strong at / still learning. Same colours as the booking board:
 * mint is confirmed, amber is still in flight.
 */
export function Honest() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-honest-col]").forEach((column) => {
        gsap.from(column.querySelectorAll("[data-trait]"), {
          y: 40,
          opacity: 0,
          duration: 1.1,
          stagger: 0.08,
          scrollTrigger: { trigger: column, start: "top 80%" },
        });
        gsap.from(column.querySelector("[data-meter]"), {
          scaleX: 0,
          duration: 1.8,
          ease: "expo.inOut",
          scrollTrigger: { trigger: column, start: "top 80%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="gutter py-[clamp(6rem,14vh,10rem)]">
      <Eyebrow>Honestly</Eyebrow>
      <SplitReveal className="display mt-6 max-w-[14ch] text-[clamp(2.8rem,7.5vw,7.5rem)] font-bold">
        Good at. Getting better at.
      </SplitReveal>
      <p className="mt-6 max-w-[56ch] text-[17px] text-ash">
        You&apos;ll find out anyway, so here it is up front. The left column is where I can carry real weight on day
        one. The right is what I want a team to help me grow into.
      </p>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        <div data-honest-col className="rounded-[28px] border border-line bg-surface p-[clamp(1.5rem,3vw,2.75rem)]">
          <div className="flex items-center justify-between">
            <h3 className="display text-[clamp(1.6rem,2.6vw,2.4rem)] font-semibold">Strong</h3>
            <span className="flex items-center gap-2 font-mono text-[12px] text-mint">
              <span className="size-2.5 rounded-[3px] bg-mint" aria-hidden />
              Confirmed
            </span>
          </div>
          <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
            <div data-meter className="h-full w-full origin-left rounded-full bg-mint shadow-[0_0_20px_rgb(70_227_155/0.6)]" />
          </div>
          <ul className="mt-8 divide-y divide-line">
            {strengths.map((trait) => (
              <li key={trait.title} data-trait className="py-5">
                <h4 className="text-[18px] font-semibold">{trait.title}</h4>
                <p className="mt-1.5 text-[15px] text-ash">{trait.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div data-honest-col className="rounded-[28px] border border-line bg-surface p-[clamp(1.5rem,3vw,2.75rem)]">
          <div className="flex items-center justify-between">
            <h3 className="display text-[clamp(1.6rem,2.6vw,2.4rem)] font-semibold">Still learning</h3>
            <span className="flex items-center gap-2 font-mono text-[12px] text-amber">
              <span className="size-2.5 rounded-[3px] bg-amber" aria-hidden />
              In progress
            </span>
          </div>
          <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
            <div
              data-meter
              className="h-full w-[45%] origin-left rounded-full bg-amber shadow-[0_0_20px_rgb(255_190_85/0.6)]"
              style={{
                backgroundImage: "repeating-linear-gradient(-45deg, rgb(0 0 0 / 0.18) 0 5px, transparent 5px 10px)",
              }}
            />
          </div>
          <ul className="mt-8 divide-y divide-line">
            {learning.map((trait) => (
              <li key={trait.title} data-trait className="py-5">
                <h4 className="text-[18px] font-semibold">{trait.title}</h4>
                <p className="mt-1.5 text-[15px] text-ash">{trait.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
