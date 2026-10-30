"use client";

import { useEffect, useSyncExternalStore } from "react";

import { isFinePointer } from "@/lib/motion";
import { sound } from "@/lib/sound";

const INTERACTIVE = "a, button, select, summary, [role='tab'], [data-cursor]";

function useSoundEnabled() {
  return useSyncExternalStore(
    (onChange) => sound.subscribe(onChange),
    () => sound.enabled,
    () => false,
  );
}

/** Equaliser bars that dance while sound is on and lie flat while it's off. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const enabled = useSoundEnabled();

  return (
    <button
      type="button"
      data-sound-toggle
      aria-pressed={enabled}
      onClick={() => sound.toggle()}
      className={`group flex h-11 items-center gap-2.5 rounded-full border border-line bg-surface/60 px-3.5 backdrop-blur-xl transition-colors duration-300 hover:border-white/25 ${className}`}
    >
      <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
        {[0, 1, 2, 3].map((bar) => (
          <span
            key={bar}
            className="w-[2px] origin-bottom rounded-full bg-bone transition-transform duration-500"
            style={{
              height: "100%",
              transform: enabled ? undefined : "scaleY(0.22)",
              animation: enabled ? `eq ${0.9 + bar * 0.23}s ease-in-out ${bar * -0.31}s infinite alternate` : "none",
            }}
          />
        ))}
      </span>
      <span className="font-mono text-[11px] text-ash transition-colors group-hover:text-bone">
        <span className="sr-only">Sound </span>
        {enabled ? "On" : "Off"}
      </span>
    </button>
  );
}

/**
 * Wires the page to the sound engine: hover ticks and press sounds on anything interactive,
 * quiet while the tab is hidden, and back on after the first click for someone who left it on.
 */
export function SoundEffects() {
  useEffect(() => {
    let hovered: Element | null = null;

    function onOver(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const target = (event.target as Element | null)?.closest(INTERACTIVE) ?? null;
      if (target && target !== hovered) sound.tick();
      hovered = target;
    }

    function onDown(event: PointerEvent) {
      if ((event.target as Element | null)?.closest(INTERACTIVE)) sound.press();
    }

    function onVisibility() {
      sound.setVisible(document.visibilityState === "visible");
    }

    // Browsers need a gesture before audio can start, so a returning visitor who left sound
    // on hears it from their first click or key press (unless that click is the toggle itself).
    function resume(event: Event) {
      if ((event.target as Element | null)?.closest("[data-sound-toggle]")) return;
      window.removeEventListener("pointerdown", resume, true);
      window.removeEventListener("keydown", resume, true);
      if (sound.wanted) void sound.enable();
    }

    if (isFinePointer()) window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    if (sound.wanted) {
      window.addEventListener("pointerdown", resume, true);
      window.addEventListener("keydown", resume, true);
    }

    return () => {
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerdown", resume, true);
      window.removeEventListener("keydown", resume, true);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
