"use client";

import { useRef } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { sound } from "@/lib/sound";

/** A small section label that decodes itself, character by character, as it scrolls in. */
export function Eyebrow({ children, className = "" }: { children: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const element = ref.current!;
      const text = element.querySelector<HTMLElement>("[data-text]")!;
      gsap.set(text, { textContent: "" });
      gsap
        .timeline({ scrollTrigger: { trigger: element, start: "top 92%", once: true } })
        .from("[data-rule]", { scaleX: 0, transformOrigin: "left center", duration: 0.9, ease: "expo.out" })
        .call(() => sound.data(), undefined, 0.1)
        .to(
          text,
          {
            duration: 1.1,
            ease: "none",
            scrambleText: { text: children, chars: "01<>/_#*", speed: 0.7, revealDelay: 0.15 },
          },
          0.1,
        );
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={`eyebrow flex items-center gap-3 ${className}`}>
      <span data-rule className="h-px w-8 bg-ash" aria-hidden />
      <span className="sr-only">{children}</span>
      <span data-text aria-hidden>
        {children}
      </span>
    </p>
  );
}
