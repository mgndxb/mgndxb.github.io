"use client";

/* eslint-disable @next/next/no-img-element -- static export serves these images as-is */
import { useRef } from "react";

import { lab } from "@/content/projects";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

import { Magnetic } from "./motion/magnetic";
import { SplitReveal } from "./motion/split-reveal";

/**
 * Projects built to show range beyond client work. Each one is live,
 * so the call to action is to open it, not to read about it.
 */
export function Lab() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-lab-card]", {
        y: 90,
        opacity: 0,
        duration: 1.4,
        stagger: 0.15,
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
      gsap.fromTo(
        "[data-lab-shot]",
        { scale: 1.12 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="lab" className="gutter py-[clamp(5rem,12vh,9rem)]">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SplitReveal className="display text-[clamp(2.6rem,7vw,6.5rem)] font-bold">
          Lab
        </SplitReveal>
        <p className="max-w-[42ch] text-ash">
          Built to show range beyond client work. Each one is live: open it and
          use it.
        </p>
      </div>

      <ul className="mt-12 space-y-6">
        {lab.map((project, index) => {
          // Alternate sides on wide screens so a stack of cards has rhythm.
          const flipped = index % 2 === 1;
          return (
            <li
              key={project.name}
              data-lab-card
              className={`group grid overflow-hidden rounded-[28px] border border-line bg-surface/70 ${flipped ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]" : "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"}`}
            >
              <div
                className={`flex flex-col p-[clamp(1.5rem,3vw,2.75rem)] ${flipped ? "lg:order-2" : ""}`}
              >
                <div className="flex items-center justify-between gap-4 font-mono text-[12px] text-ash">
                  <span>{project.kind}</span>
                  <span className="flex items-center gap-2 text-mint">
                    <span className="status-dot" aria-hidden />
                    {project.badge}
                  </span>
                </div>
                <h3 className="display mt-10 text-[clamp(2rem,3.6vw,3.4rem)] font-bold">
                  {project.name}
                </h3>
                <p className="mt-4 max-w-[46ch] text-[17px] text-bone/85">
                  {project.tagline}
                </p>
                <ul className="mt-6 space-y-2.5 text-[15px] text-ash">
                  {project.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span
                        className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-mint"
                        aria-hidden
                      />
                      {point}
                    </li>
                  ))}
                </ul>
                <ul
                  className="mt-7 flex flex-wrap gap-1.5"
                  aria-label="Built with"
                >
                  {project.stack.map((tool) => (
                    <li key={tool} className="chip">
                      {tool}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-center gap-5 pt-10">
                  <Magnetic strength={0.35}>
                    <a
                      href={project.url}
                      className="pill pill-solid"
                      data-cursor="Open"
                    >
                      Open it live <span aria-hidden>↗</span>
                    </a>
                  </Magnetic>
                  <a
                    href={project.source}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-grow text-[15px]"
                  >
                    Source on GitHub
                  </a>
                </div>
              </div>

              <a
                href={project.url}
                className={`relative block min-h-[260px] overflow-hidden border-t border-line lg:border-t-0 ${flipped ? "lg:order-1 lg:border-r" : "lg:border-l"}`}
                aria-label={`Open ${project.name}`}
                tabIndex={-1}
              >
                <img
                  data-lab-shot
                  src={project.image.src}
                  srcSet={`${project.image.small} 800w, ${project.image.src} 1600w`}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  width={1600}
                  height={1000}
                  alt={project.image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-[filter] duration-700 group-hover:brightness-110"
                />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
