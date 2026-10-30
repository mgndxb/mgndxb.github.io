"use client";

import { useRef, type CSSProperties } from "react";

import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/motion";

/** A decorative band of words that runs forever and leans into the direction you scroll. */
export function Marquee({ words, reverse = false, outline = false }: { words: string[]; reverse?: boolean; outline?: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const skew = gsap.quickTo(root.current, "skewX", { duration: 0.6, ease: "power3" });
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => skew(gsap.utils.clamp(-8, 8, self.getVelocity() / -300)),
        onLeave: () => skew(0),
        onLeaveBack: () => skew(0),
      });
    },
    { scope: root },
  );

  const row = (
    <span className="flex shrink-0 items-center">
      {words.map((word) => (
        <span key={word} className="flex items-center">
          <span
            className="display px-[0.35em] text-[clamp(3rem,9vw,8.5rem)] font-bold whitespace-nowrap"
            style={outline ? { color: "transparent", WebkitTextStroke: "1px rgb(239 237 232 / 0.35)" } : undefined}
          >
            {word}
          </span>
          <span className="size-[0.6em] shrink-0 rounded-full bg-mint text-[clamp(1rem,2vw,1.6rem)]" aria-hidden />
        </span>
      ))}
    </span>
  );

  return (
    <div className="overflow-hidden py-6" aria-hidden>
      <div ref={root}>
        <div
          className="marquee"
          data-reverse={reverse || undefined}
          style={{ "--marquee-duration": `${words.length * 6}s` } as CSSProperties}
        >
          {row}
          {row}
        </div>
      </div>
    </div>
  );
}
