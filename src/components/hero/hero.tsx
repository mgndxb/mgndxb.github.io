"use client";

import { useRef } from "react";

import { site } from "@/content/site";
import { gsap, onIntro, prefersReducedMotion, useGSAP } from "@/lib/motion";

import { SplitReveal } from "../motion/split-reveal";
import { HeroParticles } from "./hero-particles";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.set("[data-hero-fade]", { autoAlpha: 0, y: 24 });
      const off = onIntro(() => {
        gsap.to("[data-hero-fade]", { autoAlpha: 1, y: 0, duration: 1.4, stagger: 0.1, delay: 0.7 });
      });

      // The copy drifts up and fades as the name blows apart.
      gsap.to("[data-hero-copy]", {
        yPercent: -40,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "60% top", scrub: true },
      });
      return off;
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative h-[100svh] min-h-[620px] overflow-hidden">
      <h1 className="sr-only">
        {site.name}, {site.role.toLowerCase()} in {site.city}
      </h1>
      <HeroParticles />

      <div
        data-hero-copy
        className="gutter absolute inset-x-0 bottom-0 grid grid-cols-12 items-end gap-x-6 gap-y-6 pb-[clamp(1.5rem,4vh,3rem)]"
      >
        <SplitReveal
          as="p"
          intro
          delay={0.55}
          className="col-span-12 max-w-[22ch] text-[clamp(1.35rem,2.6vw,2.4rem)] leading-[1.12] font-medium tracking-[-0.02em] lg:col-span-7"
        >
          I build the booking, payment and back-office systems real businesses run on.
        </SplitReveal>

        <dl data-hero-fade className="col-span-12 grid gap-1 font-mono text-[12px] sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1">
          <div className="flex gap-2">
            <dt className="text-dim">Role</dt>
            <dd>{site.role}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-dim">Based</dt>
            <dd>
              {site.city}, {site.country}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-dim">Mode</dt>
            <dd>{site.workModes}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-dim">Speaks</dt>
            <dd>{site.languages}</dd>
          </div>
        </dl>

        <div data-hero-fade className="hidden justify-end lg:col-span-2 lg:flex">
          <a href="#about" className="group flex items-center gap-3 font-mono text-[12px] text-ash" data-cursor-link>
            Scroll
            <span className="relative block h-10 w-px overflow-hidden bg-line">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_1.8s_var(--ease-in-out-strong)_infinite] bg-bone" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
