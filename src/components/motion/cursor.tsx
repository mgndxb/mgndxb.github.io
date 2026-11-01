"use client";

import { useEffect, useRef } from "react";

import { gsap, isFinePointer } from "@/lib/motion";

const INTERACTIVE = "a, button, select, summary, label, [role='tab'], [data-cursor-link]";

/**
 * A dot that tracks the pointer exactly and a ring that follows with lag.
 * Elements with `data-cursor="Label"` turn the ring into a labelled disc.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isFinePointer()) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");

    // The dot is the real pointer; the ring trails just enough to feel alive, not sluggish.
    const dotX = gsap.quickTo(dot, "x", { duration: 0.04, ease: "none" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.04, ease: "none" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.2, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.2, ease: "power3" });

    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      root.classList.add("cursor-visible");
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);

      const target = event.target as Element | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      const state = labelled ? "label" : target?.closest(INTERACTIVE) ? "link" : null;
      if (labelled) label!.textContent = labelled.dataset.cursor ?? "";
      if (state) {
        ring!.dataset.state = state;
        root.dataset.cursorState = state;
      } else {
        delete ring!.dataset.state;
        delete root.dataset.cursorState;
      }
    }

    const hide = () => root.classList.remove("cursor-visible");
    const press = () => gsap.to(ring, { scale: 0.82, duration: 0.15, ease: "power2.out" });
    const release = () => gsap.to(ring, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    document.addEventListener("pointerleave", hide);

    return () => {
      root.classList.remove("has-cursor", "cursor-visible");
      delete root.dataset.cursorState;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      document.removeEventListener("pointerleave", hide);
    };
  }, []);

  return (
    <div aria-hidden>
      <div ref={ringRef} className="cursor-ring">
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
