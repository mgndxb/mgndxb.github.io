"use client";

import { useEffect } from "react";

import { finishIntro } from "@/lib/motion";

/**
 * No curtain and no Enter button: the hero plays its opening as soon as the page is ready, so
 * someone arriving from an application sees who this is straight away. Sound starts on the
 * visitor's first click, tap or key press (see SoundEffects).
 */
export function Intro() {
  useEffect(() => finishIntro(), []);
  return null;
}
