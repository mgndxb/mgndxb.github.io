"use client";

import { useRef } from "react";

import { site } from "@/content/site";
import { stats } from "@/content/skills";
import { gsap, prefersReducedMotion, ScrollTrigger, SplitText, useGSAP } from "@/lib/motion";
import { sound } from "@/lib/sound";

import { Eyebrow } from "./motion/eyebrow";

/** Stable pseudo-random numbers, so the scatter looks the same on every visit. */
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const status = [
  { label: "Now", text: site.now, swatch: "amber" },
  { label: "Shipped", text: "6 products live in production", swatch: "mint" },
  { label: "Next", text: "A junior role on your team", swatch: "outline" },
] as const;

/**
 * The answer to "but you're a junior": a hollow line that says so, and a solid
 * line that says what I actually do. Letters fly in from scattered, blurred
 * positions and lock into place as you scroll.
 */
export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current!;
      // Reduced motion: the heading, copy and final numbers are already in the markup.
      if (prefersReducedMotion()) return;

      const lines = gsap.utils.toArray<HTMLElement>("[data-line]", section);
      // The heading carries the accessible name, so the split letters stay out of the way.
      const splits = lines.map((line) => SplitText.create(line, { type: "words,chars", aria: "none" }));

      const scatter = () =>
        splits.forEach((split, lineIndex) => {
          split.chars.forEach((char, index) => {
            const i = index + lineIndex * 100;
            gsap.set(char, {
              xPercent: (seeded(i, 1) - 0.5) * 520,
              yPercent: (seeded(i, 2) - 0.5) * 420,
              rotate: (seeded(i, 3) - 0.5) * 120,
              scale: 0.4 + seeded(i, 4) * 1.4,
              // A faint cloud of letters, so the section never looks empty before it assembles.
              opacity: 0.14,
              filter: "blur(10px)",
            });
          });
        });

      const assemble = {
        xPercent: 0,
        yPercent: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        ease: "power3.out",
        stagger: { each: 0.025, from: "random" as const },
      };

      // matchMedia only runs when a listed condition matches, so phones need their own entry.
      // The queries use rem, like Tailwind's lg breakpoint, so CSS and JS always switch together.
      const mm = gsap.matchMedia();
      mm.add(
        { desktop: "(width >= 64rem)", mobile: "(width < 64rem)" },
        (context) => {
          const { desktop } = context.conditions as { desktop: boolean };
          scatter();
          const timeline = gsap.timeline({
            scrollTrigger: desktop
              ? {
                  trigger: "[data-stage]",
                  start: "top top",
                  end: "+=110%",
                  pin: true,
                  scrub: 0.9,
                  anticipatePin: 1,
                  refreshPriority: 2,
                }
              : { trigger: "[data-statement]", start: "top 92%", end: "top 35%", scrub: 0.6 },
          });

          timeline
            .to(splits[0].chars, { ...assemble, duration: 1 })
            .to(splits[1].chars, { ...assemble, duration: 1 }, 0.55)
            .fromTo(
              "[data-dot]",
              { scale: 0, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(3)" },
              ">-0.05",
            )
            .call(() => sound.swell(), undefined, "<")
            .from("[data-after]", { y: 50, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }, "<");

          // Pins re-created after a breakpoint change land at the end of ScrollTrigger's list;
          // sorting puts them back in page order so everything below accounts for them.
          ScrollTrigger.sort();
        },
      );

      // Created after the pin, so these positions include the space the pin adds.
      section.querySelectorAll<HTMLElement>("[data-count-to]").forEach((element) => {
        const end = Number(element.dataset.countTo);
        const value = { v: 0 };
        gsap.to(value, {
          v: end,
          duration: 2.2,
          ease: "expo.out",
          scrollTrigger: { trigger: element, start: "top 90%", once: true },
          onUpdate: () => {
            element.textContent = Math.round(value.v).toLocaleString("en-US");
          },
        });
      });

      gsap.from("[data-stat]", {
        y: 60,
        opacity: 0,
        duration: 1.4,
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-stats]", start: "top 85%" },
      });

      return () => splits.forEach((split) => split.revert());
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" className="relative">
      <div
        data-stage
        className="gutter relative flex flex-col justify-center py-[clamp(6rem,14vh,10rem)] lg:min-h-[100svh]"
      >
        <Eyebrow>About</Eyebrow>

        <h2
          data-statement
          aria-label="Junior on paper. Production in practice."
          className="display mt-10 text-[clamp(2.3rem,6.1vw,7rem)] leading-[1.02] font-bold"
        >
          <span
            data-line
            aria-hidden
            className="block text-transparent [-webkit-text-stroke:1.5px_rgb(239_237_232/0.5)]"
          >
            Junior on paper.
          </span>
          <span className="block" aria-hidden>
            <span data-line>Production in practice</span>
            <span
              data-dot
              className="ml-[0.06em] inline-block size-[0.17em] rounded-full bg-mint align-baseline shadow-[0_0_34px_rgb(70_227_155/0.9)]"
            />
          </span>
        </h2>

        <div className="mt-[clamp(2.5rem,6vh,4.5rem)] grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <p data-after className="max-w-[54ch] text-[clamp(1.08rem,1.45vw,1.3rem)] leading-relaxed text-bone/80">
            I&apos;m {site.firstName}, a developer in {site.city}. I build booking, payment and back-office systems for
            real businesses. Six are live, and three take real card payments. I put the rules in the
            database, test them against the real thing and check them in production. Now I want a team that pushes me
            harder than my clients can.
          </p>

          <dl data-after className="rounded-[24px] border border-line bg-surface/70 p-2 backdrop-blur-xl">
            {status.map((item) => (
              <div key={item.label} className="flex items-center gap-4 rounded-[18px] px-4 py-3.5 odd:bg-white/[0.025]">
                <span
                  aria-hidden
                  className={`size-2.5 shrink-0 rounded-[3px] ${
                    item.swatch === "mint"
                      ? "bg-mint shadow-[0_0_14px_rgb(70_227_155/0.8)]"
                      : item.swatch === "amber"
                        ? "bg-amber shadow-[0_0_14px_rgb(255_190_85/0.8)]"
                        : "border border-ash"
                  }`}
                />
                <dt className="w-16 shrink-0 font-mono text-[12px] text-ash">{item.label}</dt>
                <dd className="text-[15px]">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="gutter pb-[clamp(6rem,14vh,10rem)]">
        <dl data-stats className="grid grid-cols-2 gap-x-6 gap-y-12 border-t border-line pt-10 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} data-stat>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="display block text-[clamp(2.6rem,4.8vw,5.25rem)] font-semibold tabular-nums">
                  {stat.prefix}
                  <span data-count-to={stat.value}>{stat.value.toLocaleString("en-US")}</span>
                </span>
                <span aria-hidden className="mt-4 block max-w-[22ch] text-[15px] text-ash">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
