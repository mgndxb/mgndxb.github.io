"use client";

import Lenis from "lenis";
import { useEffect } from "react";

import { gsap, motionState, onIntro, prefersReducedMotion, ScrollTrigger } from "@/lib/motion";
import { sound } from "@/lib/sound";

/** Inertial scrolling, driven by GSAP's ticker so scroll and ScrollTrigger stay in the same frame. */
export function SmoothScroll() {
  useEffect(() => {
    document.documentElement.classList.add("js-motion");

    // ScrollTrigger re-measures on window load by itself. Fonts can still be swapping in
    // after that, and they change heading heights, so measure once more if they are.
    if (document.fonts && document.fonts.status !== "loaded") {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.085, anchors: true, wheelMultiplier: 0.95 });
    motionState.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    lenis.on("scroll", () => sound.setMotion(lenis.velocity));

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    if (!motionState.introDone) lenis.stop();
    const offIntro = onIntro(() => lenis.start());

    return () => {
      offIntro();
      gsap.ticker.remove(tick);
      lenis.destroy();
      motionState.lenis = null;
    };
  }, []);

  return null;
}
