"use client";

/* eslint-disable @next/next/no-img-element -- static export serves these images as-is */
import { useEffect, useRef, type CSSProperties } from "react";

import { lab, type LabProject } from "@/content/projects";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

import { Magnetic } from "./motion/magnetic";
import { SplitReveal } from "./motion/split-reveal";

/** A recorded loop of the real app. It only plays while on screen, and never for reduced motion. */
function LoopVideo({ video, className = "" }: { video: NonNullable<LabProject["video"]>; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    el.muted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={video.poster}
      aria-hidden
      className={className}
    >
      <source src={video.webm} type="video/webm" />
      <source src={video.mp4} type="video/mp4" />
    </video>
  );
}

function LabMedia({ project }: { project: LabProject }) {
  const { video, frame, image } = project;

  if (video && frame) {
    // Light apps float in a browser window on a coloured stage, so they read as
    // a product shot rather than a cut-off screenshot.
    return (
      <div className="lab-stage absolute inset-0" style={{ "--glow": frame.glow } as CSSProperties}>
        <div data-lab-shot className="absolute inset-x-[6%] top-1/2 -translate-y-1/2">
          <div className="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-2">
            <div className="browser">
              <div className="flex h-8 items-center gap-3 border-b border-white/[0.06] bg-[#141417] px-3.5">
                <span className="flex gap-1.5" aria-hidden>
                  <span className="size-2 rounded-full bg-white/15" />
                  <span className="size-2 rounded-full bg-white/15" />
                  <span className="size-2 rounded-full bg-white/15" />
                </span>
                <span className="flex h-5 items-center rounded-md bg-white/[0.06] px-3 font-mono text-[10.5px] text-ash">
                  {frame.url}
                </span>
              </div>
              <LoopVideo video={video} className="block aspect-[16/10] w-full bg-[#ecedf0] object-cover" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (video) {
    return (
      <div data-lab-shot className="absolute inset-0">
        <LoopVideo
          video={video}
          className="h-full w-full object-cover transition-[filter] duration-700 group-hover:brightness-110"
        />
      </div>
    );
  }

  return (
    <img
      data-lab-shot
      src={image.src}
      srcSet={`${image.small} 800w, ${image.src} 1600w`}
      sizes="(min-width: 1024px) 60vw, 100vw"
      width={1600}
      height={1000}
      alt={image.alt}
      loading="lazy"
      className="h-full w-full object-cover transition-[filter] duration-700 group-hover:brightness-110"
    />
  );
}

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
                    <a href={project.url} className="pill pill-solid">
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
                className={`relative block overflow-hidden border-t border-line lg:border-t-0 ${project.video ? "aspect-[16/10] lg:aspect-auto lg:min-h-[440px]" : "min-h-[260px]"} ${flipped ? "lg:order-1 lg:border-r" : "lg:border-l"}`}
                aria-label={`Open ${project.name}: ${project.image.alt}`}
                tabIndex={-1}
                data-cursor="Open live"
              >
                <LabMedia project={project} />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
