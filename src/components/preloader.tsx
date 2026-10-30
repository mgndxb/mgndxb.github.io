"use client";

import { useRef, useState } from "react";

import { site } from "@/content/site";
import { finishIntro, gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { sound } from "@/lib/sound";

import { Magnetic } from "./motion/magnetic";

/**
 * A short count to 100 that turns into an Enter button. That click is the gesture browsers
 * require before audio can play, so entering starts the ambient sound as the curtain lifts.
 * Someone reloading in the same visit skips straight to the curtain.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);
  const leaving = useRef(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        finishIntro();
        setDone(true);
        return;
      }

      let seen = false;
      try {
        seen = sessionStorage.getItem("mk-intro") === "1";
      } catch {
        // Storage can be blocked; the full intro still works.
      }
      if (seen) {
        leaving.current = true;
        gsap.set("[data-pre-line], [data-count], [data-pre-bar]", { autoAlpha: 0 });
        gsap
          .timeline({ onComplete: () => setDone(true) })
          .add(finishIntro, 0.05)
          .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" }, 0);
        return;
      }

      const counter = root.current!.querySelector<HTMLElement>("[data-count]")!;
      const progress = { value: 0 };
      gsap.set("[data-enter]", { autoAlpha: 0, y: 40 });

      gsap
        .timeline()
        .from("[data-pre-line]", { yPercent: 110, duration: 0.9, stagger: 0.06 })
        .to(
          progress,
          {
            value: 100,
            duration: 1.15,
            ease: "power2.inOut",
            onUpdate: () => {
              counter.textContent = String(Math.round(progress.value)).padStart(3, "0");
            },
          },
          0.1,
        )
        .to("[data-pre-bar]", { scaleX: 1, duration: 1.15, ease: "power2.inOut" }, 0.1)
        .to("[data-count]", { yPercent: -110, duration: 0.55, ease: "power3.in" })
        .to("[data-enter]", { autoAlpha: 1, y: 0, duration: 1.1 }, "-=0.1")
        .add(() => {
          setReady(true);
          enterRef.current?.focus({ preventScroll: true });
        }, "<0.2");
    },
    { scope: root },
  );

  // Runs in the click handler. The preloader unmounts right after, so this exit animation
  // deliberately lives outside the hook's context: nothing needs reverting.
  function enter(withSound: boolean) {
    if (leaving.current) return;
    leaving.current = true;

    // Must run inside the click: this is what lets the browser start audio.
    if (withSound) void sound.enable({ bloom: true });
    else sound.decline();
    try {
      sessionStorage.setItem("mk-intro", "1");
    } catch {
      // Without storage the next reload just shows the intro again.
    }

    gsap
      .timeline({ onComplete: () => setDone(true) })
      .to("[data-enter]", { autoAlpha: 0, scale: 0.94, duration: 0.45, ease: "power3.in" })
      .to("[data-pre-line]", { yPercent: -110, duration: 0.55, ease: "power3.in", stagger: 0.03 }, "<")
      .add(finishIntro, "-=0.1")
      .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.05, ease: "expo.inOut" }, "<");
  }

  if (done) return null;

  return (
    <div
      ref={root}
      data-preloader
      role="dialog"
      aria-label={`${site.name}, portfolio`}
      className="fixed inset-0 z-[200] flex flex-col justify-between bg-void p-[clamp(1rem,4vw,3.5rem)]"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <div aria-hidden className="flex justify-between overflow-hidden font-mono text-[12px] text-ash">
        <span data-pre-line className="block">
          {site.name}
        </span>
        <span data-pre-line className="block">
          Portfolio, 2026
        </span>
      </div>

      <div data-enter className="absolute inset-0 grid place-items-center" style={{ visibility: "hidden" }}>
        <div className="flex flex-col items-center gap-7 px-6 text-center">
          <Magnetic strength={0.4}>
            <button
              ref={enterRef}
              type="button"
              disabled={!ready}
              onClick={() => enter(true)}
              className="display relative grid size-[clamp(9rem,17vw,12.5rem)] place-items-center rounded-full bg-bone text-[clamp(1.05rem,1.6vw,1.3rem)] font-semibold text-void transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 active:scale-[0.97]"
            >
              <span aria-hidden className="absolute inset-0 animate-[ping_2.6s_cubic-bezier(0.23,1,0.32,1)_infinite] rounded-full border border-bone/60" />
              Enter
            </button>
          </Magnetic>
          <p className="flex items-center gap-2.5 font-mono text-[12px] text-ash">
            <span aria-hidden className="flex h-3 items-end gap-[2px]">
              {[0, 1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  className="h-full w-[2px] origin-bottom rounded-full bg-mint"
                  style={{ animation: `eq ${0.9 + bar * 0.23}s ease-in-out ${bar * -0.31}s infinite alternate` }}
                />
              ))}
            </span>
            Best with sound on
          </p>
          <button
            type="button"
            disabled={!ready}
            onClick={() => enter(false)}
            className="underline-grow text-[13px] text-ash transition-colors hover:text-bone"
          >
            Enter without sound
          </button>
        </div>
      </div>

      <div aria-hidden>
        {/* Phones stack the counter above the words so it never gets clipped. */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="overflow-hidden">
            <p data-pre-line className="display max-w-[14ch] text-[clamp(1.6rem,3.4vw,3rem)] font-semibold">
              Opening the showroom
            </p>
          </div>
          <div className="self-end overflow-hidden sm:self-auto">
            <span data-count className="display block text-[clamp(6.5rem,29vw,13rem)] leading-none tabular-nums">
              000
            </span>
          </div>
        </div>
        <div className="mt-6 h-px bg-line">
          <div data-pre-bar className="h-full origin-left scale-x-0 bg-bone" />
        </div>
      </div>
    </div>
  );
}
