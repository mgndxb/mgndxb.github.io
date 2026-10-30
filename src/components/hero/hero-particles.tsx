"use client";

import { useEffect, useRef } from "react";

import { gsap, onIntro, prefersReducedMotion, ScrollTrigger } from "@/lib/motion";
import { ParticleField } from "@/lib/particles";
import { sound } from "@/lib/sound";

const LINES = ["MAGNUS", "KAUR"];

/** The name, made of particles that assemble on load, dodge the cursor and blow apart on scroll. */
export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const probe = probeRef.current;
    if (!canvas || !probe) return;

    let field: ParticleField;
    try {
      field = new ParticleField(canvas);
    } catch {
      // No WebGL2: show the name as plain type instead.
      wrapRef.current?.setAttribute("data-fallback", "true");
      return;
    }

    const reduce = prefersReducedMotion();
    const fontFamily = getComputedStyle(probe).fontFamily;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let disposed = false;

    function layout() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      const width = Math.round(rect.width * dpr);
      const height = Math.round(rect.height * dpr);
      // Re-sampling reshuffles every particle, so only do it when the canvas really changed
      // (not, say, when a phone's address bar slides away).
      if (field.particleCount > 0 && width === canvas!.width && height === canvas!.height) return;
      canvas!.width = width;
      canvas!.height = height;
      field.layout({ lines: LINES, fontFamily, fontWeight: 800 }, dpr);
    }

    // If the GPU drops the context (a phone backgrounding the tab, a driver reset), show plain type.
    const onContextLost = (event: Event) => {
      event.preventDefault();
      wrapRef.current?.setAttribute("data-fallback", "true");
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    document.fonts.load(`800 100px ${fontFamily}`).finally(() => {
      if (!disposed) layout();
    });

    field.intro = reduce ? 1 : 0;
    const offIntro = onIntro(() => {
      if (!reduce) gsap.to(field, { intro: 1, duration: 2.8, ease: "none" });
    });

    // Pointer: eased toward the real position so the push feels fluid. Moving through the
    // name quickly plays glassy sparkles, panned to where the pointer is.
    const target = { x: -9999, y: -9999 };
    let strengthTarget = 0;
    let seen = false;
    function onPointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const speed = Math.hypot(x - target.x, y - target.y);
      target.x = x;
      target.y = y;
      strengthTarget = 1;
      if (!seen) {
        field.pointer.x = x;
        field.pointer.y = y;
        seen = true;
      }
      if (visible && speed > 14 && speed < 400 && y > 0 && y < rect.height) sound.sparkle(x / rect.width);
    }
    // Touch has no hover: let the name heal as soon as the finger lifts.
    const onPointerRelease = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") strengthTarget = 0;
    };
    const onPointerLeave = () => (strengthTarget = 0);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerRelease, { passive: true });
    window.addEventListener("pointercancel", onPointerRelease, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    const scatter = ScrollTrigger.create({
      trigger: canvas.closest("section"),
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => (field.scatter = self.progress),
    });

    let visible = true;
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    observer.observe(canvas);

    const tick = (time: number) => {
      if (!visible) return;
      field.pointer.x += (target.x - field.pointer.x) * 0.14;
      field.pointer.y += (target.y - field.pointer.y) * 0.14;
      field.pointerStrength += (strengthTarget - field.pointerStrength) * 0.06;
      field.render(time, dpr);
    };
    gsap.ticker.add(tick);

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(layout, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      offIntro();
      scatter.kill();
      observer.disconnect();
      gsap.ticker.remove(tick);
      gsap.killTweensOf(field);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerRelease);
      window.removeEventListener("pointercancel", onPointerRelease);
      document.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      field.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="group/particles absolute inset-0">
      <span ref={probeRef} aria-hidden className="pointer-events-none absolute font-display opacity-0">
        M
      </span>
      <p
        aria-hidden
        className="display absolute top-[22%] left-[clamp(1rem,4vw,3.5rem)] hidden text-[clamp(4rem,17vw,16rem)] font-extrabold group-data-[fallback=true]/particles:block"
      >
        MAGNUS
        <br />
        KAUR
      </p>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full group-data-[fallback=true]/particles:hidden"
      />
    </div>
  );
}
