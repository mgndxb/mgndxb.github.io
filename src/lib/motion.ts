"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type Lenis from "lenis";

// Registered at import time so every component's effects can rely on the plugins,
// whatever order React runs those effects in.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 1 });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const motionState: { lenis: Lenis | null; introDone: boolean } = {
  lenis: null,
  introDone: false,
};

const introListeners = new Set<() => void>();

/** Runs `callback` once the preloader hands over to the page (immediately if it already has). */
export function onIntro(callback: () => void): () => void {
  if (motionState.introDone) {
    callback();
    return () => {};
  }
  introListeners.add(callback);
  return () => introListeners.delete(callback);
}

export function finishIntro() {
  if (motionState.introDone) return;
  motionState.introDone = true;

  // GSAP runs timeline callbacks inside the context that created the timeline. Deferring
  // gets the listeners out of the preloader's context, so their animations aren't
  // reverted when the preloader unmounts.
  window.setTimeout(() => {
    introListeners.forEach((callback) => {
      // One failing listener must not leave the rest of the page hidden.
      try {
        callback();
      } catch (error) {
        console.error("Intro animation failed", error);
      }
    });
    introListeners.clear();
  }, 0);
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isFinePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
