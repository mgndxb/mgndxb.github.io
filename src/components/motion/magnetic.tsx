"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/motion";

/** Pulls its child toward the pointer while hovered, then springs back. */
export function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !isFinePointer() || prefersReducedMotion()) return;

    const x = gsap.quickTo(element, "x", { duration: 0.6, ease: "power3" });
    const y = gsap.quickTo(element, "y", { duration: 0.6, ease: "power3" });

    function onMove(event: PointerEvent) {
      const rect = element!.getBoundingClientRect();
      x((event.clientX - (rect.left + rect.width / 2)) * strength);
      y((event.clientY - (rect.top + rect.height / 2)) * strength);
    }

    function onLeave() {
      gsap.to(element, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
    }

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}
