"use client";

import { useRef, type ElementType, type ReactNode } from "react";

import { gsap, onIntro, prefersReducedMotion, SplitText, useGSAP } from "@/lib/motion";

/**
 * Text that rises line by line out of a mask, either when it scrolls into view
 * or (with `onIntro`) when the page starts its opening.
 */
export function SplitReveal({
  as: Tag = "h2",
  children,
  className = "",
  delay = 0,
  stagger = 0.09,
  intro = false,
  by = "lines",
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  intro?: boolean;
  by?: "lines" | "chars";
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || prefersReducedMotion()) return;

      let off: (() => void) | undefined;
      SplitText.create(element, {
        type: by === "chars" ? "lines,chars" : "lines",
        mask: "lines",
        autoSplit: true,
        // Whole lines read fine as they are. Single letters would be spelled out, so char
        // splits label the element instead (always a heading here, where a label is valid).
        aria: by === "chars" ? "auto" : "none",
        onSplit(self) {
          const targets = by === "chars" ? self.chars : self.lines;
          const animation = gsap.from(targets, {
            yPercent: 115,
            rotate: by === "chars" ? 0 : 2.5,
            duration: by === "chars" ? 1.2 : 1.25,
            ease: "expo.out",
            stagger: by === "chars" ? 0.025 : stagger,
            delay,
            paused: intro,
            scrollTrigger: intro ? undefined : { trigger: element, start: "top 88%", once: true },
          });
          if (intro) {
            off?.();
            off = onIntro(() => animation.play());
          }
          return animation;
        },
      });

      return () => off?.();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
