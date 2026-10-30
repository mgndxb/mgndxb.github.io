"use client";

import { useRef, type PointerEvent } from "react";

import { alsoBuilt } from "@/content/projects";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

import { SplitReveal } from "./motion/split-reveal";

const statusColor = {
  "Public code": "var(--color-mint)",
  Private: "var(--color-ash)",
  "Not launched": "var(--color-amber)",
  Live: "var(--color-mint)",
  "In development": "var(--color-amber)",
} as const;

function trackSpotlight(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

export function AlsoBuilt() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-card]", {
        y: 80,
        opacity: 0,
        rotateX: -12,
        duration: 1.4,
        stagger: 0.12,
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="gutter py-[clamp(5rem,12vh,9rem)]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SplitReveal className="display text-[clamp(2.2rem,5vw,4.5rem)] font-semibold">Also built</SplitReveal>
        <p className="max-w-[40ch] text-ash">
          Not in the showroom, but real: a code sample anyone can read, and a product built design system first.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 [perspective:1400px] md:grid-cols-2">
        {alsoBuilt.map((project) => {
          const body = (
            <>
              <div className="flex items-center justify-between font-mono text-[12px] text-ash">
                <span>{project.kind}</span>
                <span className="flex items-center gap-2">
                  <span className="status-dot" style={{ color: statusColor[project.status] }} aria-hidden />
                  {project.status}
                </span>
              </div>
              <h3 className="display mt-16 text-[clamp(1.6rem,2.4vw,2.2rem)] font-semibold">{project.name}</h3>
              <p className="mt-4 text-[15px] text-ash">{project.text}</p>
              <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Built with">
                {project.stack.map((tool) => (
                  <li key={tool} className="chip">
                    {tool}
                  </li>
                ))}
              </ul>
              {project.href && (
                <span className="mt-8 inline-flex items-center gap-2 text-[15px] font-medium">
                  Read the code <span aria-hidden>↗</span>
                </span>
              )}
            </>
          );

          return (
            <li key={project.name} data-card className="h-full">
              {project.href ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  onPointerMove={trackSpotlight}
                  data-cursor="Code"
                  className="spotlight block h-full rounded-[22px] border border-line bg-surface p-7 transition-colors duration-500 hover:border-white/25"
                >
                  {body}
                </a>
              ) : (
                <div
                  onPointerMove={trackSpotlight}
                  className="spotlight h-full rounded-[22px] border border-line bg-surface p-7"
                >
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
