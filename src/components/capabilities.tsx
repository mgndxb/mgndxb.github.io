"use client";

/* eslint-disable @next/next/no-img-element -- static export serves these images as-is */

import { useRef, useState } from "react";

import { capabilities } from "@/content/skills";
import { gsap, isFinePointer, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { sound } from "@/lib/sound";

import { Eyebrow } from "./motion/eyebrow";
import { SplitReveal } from "./motion/split-reveal";

/** What I can build, as big rows. On desktop a preview of related work follows the cursor. */
export function Capabilities() {
  const root = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useGSAP(
    () => {
      const preview = previewRef.current!;
      if (!prefersReducedMotion()) {
        gsap.from("[data-cap-row]", {
          y: 50,
          opacity: 0,
          duration: 1.2,
          stagger: 0.07,
          scrollTrigger: { trigger: "[data-cap-list]", start: "top 80%" },
        });
      }
      if (!isFinePointer()) return;

      const x = gsap.quickTo(preview, "x", { duration: 0.7, ease: "power3" });
      const y = gsap.quickTo(preview, "y", { duration: 0.7, ease: "power3" });
      const list = root.current!.querySelector<HTMLElement>("[data-cap-list]")!;
      const onMove = (event: PointerEvent) => {
        x(event.clientX);
        y(event.clientY);
      };
      list.addEventListener("pointermove", onMove);
      return () => list.removeEventListener("pointermove", onMove);
    },
    { scope: root },
  );

  return (
    <section ref={root} id="skills" className="gutter relative py-[clamp(6rem,14vh,10rem)]">
      <Eyebrow>What I can do</Eyebrow>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <SplitReveal className="display max-w-[12ch] text-[clamp(2.8rem,7.5vw,7.5rem)] font-bold">
          Things I build well
        </SplitReveal>
        <p className="max-w-[38ch] text-[17px] text-ash">
          Each one is backed by something I&apos;ve shipped. Hover a row to see where.
        </p>
      </div>

      <ol data-cap-list className="mt-16 border-b border-line" onPointerLeave={() => setHovered(null)}>
        {capabilities.map((capability, index) => (
          <li
            key={capability.title}
            data-cap-row
            onPointerEnter={() => {
              // Moving down the list plays the scale upwards.
              setHovered(index);
              sound.note(index);
            }}
            className="group grid gap-x-8 gap-y-3 border-t border-line py-8 md:grid-cols-[4rem_minmax(0,1.1fr)_minmax(0,1fr)] md:py-10"
          >
            <span className="font-mono text-[12px] text-dim transition-colors duration-500 group-hover:text-mint md:pt-3">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="display text-[clamp(1.7rem,3.4vw,3.2rem)] font-semibold text-bone/90 transition-[color,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 group-hover:text-bone">
              {capability.title}
            </h3>
            <div className="md:pt-2">
              <p className="text-[16px] text-bone/75">{capability.text}</p>
              <p className="mt-3 font-mono text-[12px] text-ash">Shipped in: {capability.proof}</p>
            </div>
          </li>
        ))}
      </ol>

      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40 hidden md:block"
        style={{ transform: "translate(-9999px, -9999px)" }}
      >
        <div
          className="relative -mt-[150px] -ml-[100px] h-[300px] w-[200px] overflow-hidden rounded-[22px] shadow-[0_40px_80px_-20px_rgb(0_0_0/0.9)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: hovered === null ? 0 : 1,
            transform: hovered === null ? "scale(0.6) rotate(-8deg)" : "scale(1) rotate(-4deg)",
          }}
        >
          {capabilities.map((capability, index) => (
            <img
              key={capability.title}
              src={capability.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-top transition-[opacity,transform] duration-500"
              style={{
                opacity: hovered === index ? 1 : 0,
                transform: hovered === index ? "scale(1)" : "scale(1.15)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
