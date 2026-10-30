"use client";

import { useRef, type PointerEvent } from "react";

import { toolbox } from "@/content/skills";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { sound } from "@/lib/sound";

import { Eyebrow } from "./motion/eyebrow";
import { SplitReveal } from "./motion/split-reveal";

function trackSpotlight(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

// Tile size says how often I use something: the bigger, the more.
const tierStyles = [
  { grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4", tile: "min-h-[170px] p-6", icon: "size-9", name: "text-[19px]" },
  { grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5", tile: "min-h-[140px] p-5", icon: "size-7", name: "text-[17px]" },
  { grid: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5", tile: "min-h-[118px] p-5", icon: "size-6", name: "text-[16px]" },
];

export function Toolbox() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-tier]").forEach((tier) => {
        gsap.from(tier.querySelectorAll("[data-tool]"), {
          y: 40,
          opacity: 0,
          scale: 0.94,
          duration: 1.1,
          stagger: { each: 0.05, from: "start" },
          scrollTrigger: { trigger: tier, start: "top 82%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="stack" className="gutter py-[clamp(6rem,14vh,10rem)]">
      <Eyebrow>Stack</Eyebrow>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <SplitReveal className="display max-w-[13ch] text-[clamp(2.8rem,7.5vw,7.5rem)] font-bold">
          What I code with
        </SplitReveal>
        <p className="max-w-[38ch] text-[17px] text-ash">
          Sorted by how much I actually use it. TypeScript, Next.js and PostgreSQL are in everything I&apos;ve shipped.
        </p>
      </div>

      <div className="mt-16 space-y-14">
        {toolbox.map((tier, tierIndex) => {
          const style = tierStyles[tierIndex];
          return (
            <div key={tier.label} data-tier className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
              <div>
                <h3 className="text-[19px] font-semibold">{tier.label}</h3>
                <p className="mt-2 max-w-[24ch] text-[14px] text-ash">{tier.caption}</p>
              </div>
              <ul className={`grid gap-3 ${style.grid}`}>
                {tier.tools.map((tool, toolIndex) => (
                  <li
                    key={tool.name}
                    data-tool
                    onPointerMove={trackSpotlight}
                    onPointerEnter={(event) => event.pointerType === "mouse" && sound.note(toolIndex + tierIndex * 2)}
                    className={`spotlight group flex flex-col justify-between rounded-[20px] border border-line bg-surface transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-white/25 ${style.tile}`}
                  >
                    {tool.icon ? (
                      <svg
                        viewBox="0 0 24 24"
                        className={`${style.icon} fill-bone/70 transition-[fill,transform] duration-500 group-hover:scale-110 group-hover:fill-bone`}
                        aria-hidden
                      >
                        <path d={tool.icon.path} />
                      </svg>
                    ) : (
                      <span
                        aria-hidden
                        className={`${style.icon} grid place-items-center rounded-lg border border-white/20 font-mono text-[11px] text-bone/70`}
                      >
                        {tool.name.slice(0, 2)}
                      </span>
                    )}
                    <div className="mt-6">
                      <p className={`font-medium ${style.name}`}>{tool.name}</p>
                      <p className="mt-1 text-[13px] text-ash">{tool.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
