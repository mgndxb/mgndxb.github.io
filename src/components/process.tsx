"use client";

import { useRef } from "react";

import { process } from "@/content/skills";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/motion";

import { Eyebrow } from "./motion/eyebrow";
import { SplitReveal } from "./motion/split-reveal";

/** How a project goes, from first conversation to production. A line draws down the steps as you read. */
export function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
      if (!prefersReducedMotion()) {
        gsap.fromTo(
          "[data-process-line]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-process-list]", start: "top 60%", end: "bottom 60%", scrub: true },
          },
        );
      }
      steps.forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 60%",
          onEnter: () => (step.dataset.reached = "true"),
          onLeaveBack: () => (step.dataset.reached = "false"),
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="gutter py-[clamp(6rem,14vh,10rem)]">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Process</Eyebrow>
          <SplitReveal className="display mt-6 text-[clamp(2.6rem,6vw,6rem)] font-bold">How I work with AI</SplitReveal>
          <p className="mt-6 max-w-[42ch] text-[17px] text-ash">
            I build with coding agents and I&apos;m open about it. They write a lot of the code. Deciding what the
            system must do, and proving it does, stays with me.
          </p>
        </div>

        <ol data-process-list className="relative">
          <span aria-hidden className="absolute top-2 bottom-2 left-[19px] w-px bg-line" />
          <span
            data-process-line
            aria-hidden
            className="absolute top-2 bottom-2 left-[19px] w-px origin-top bg-mint shadow-[0_0_12px_rgb(70_227_155/0.8)]"
          />
          {process.map((step, index) => (
            <li key={step.title} data-step data-reached="false" className="group relative pb-14 pl-16 last:pb-0">
              <span className="absolute top-0 left-0 grid size-10 place-items-center rounded-full border border-line bg-void font-mono text-[12px] text-ash transition-[border-color,color,box-shadow] duration-500 group-data-[reached=true]:border-mint group-data-[reached=true]:text-mint group-data-[reached=true]:shadow-[0_0_20px_rgb(70_227_155/0.35)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="pt-1.5 text-[clamp(1.3rem,2vw,1.7rem)] font-semibold text-bone/50 transition-colors duration-500 group-data-[reached=true]:text-bone">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[48ch] text-[16px] text-ash">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
