"use client";

import { useRef, type CSSProperties } from "react";

import { showroom } from "@/content/projects";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion";
import { sound } from "@/lib/sound";

import { Eyebrow } from "../motion/eyebrow";
import { Magnetic } from "../motion/magnetic";
import { SplitReveal } from "../motion/split-reveal";
import { BrowserFrame, PhoneFrame } from "./devices";

const VOID = "#060607";
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Every live product as a full-screen scene. On desktop the scenes sit side by
 * side in a pinned track that scrolls sideways; the room's light changes to each
 * product's brand colour as it comes into view.
 */
export function Showroom() {
  const root = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = root.current!;
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", section);
      const hudIndex = section.querySelector<HTMLElement>("[data-hud-index]");
      const hudName = section.querySelector<HTMLElement>("[data-hud-name]");
      let current = -1;

      // Scenes on the pinned track sit off to the side, where native lazy loading starts
      // too late. Start every image about a screen and a half before the showroom arrives.
      ScrollTrigger.create({
        trigger: section,
        start: () => `top bottom+=${window.innerHeight * 1.5}`,
        once: true,
        onEnter: () => section.querySelectorAll("img").forEach((img) => (img.loading = "eager")),
      });

      function light(index: number) {
        if (index === current) return;
        current = index;
        const bg = index < 0 ? VOID : showroom[index].theme.bg;
        gsap.to(section, { backgroundColor: bg, duration: 1.2, ease: "power2.out", overwrite: "auto" });
        if (index < 0) return;
        sound.chime(index);
        if (!hudIndex || !hudName) return;
        gsap
          .timeline()
          .to([hudIndex, hudName], { yPercent: -100, opacity: 0, duration: 0.25, ease: "power2.in" })
          .add(() => {
            hudIndex.textContent = pad(index + 1);
            hudName.textContent = showroom[index].name;
          })
          .fromTo([hudIndex, hudName], { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5 });
      }

      const mm = gsap.matchMedia();
      mm.add(
        {
          // matchMedia only runs when a listed condition matches, so phones need their own entry.
          // rem, like Tailwind's lg breakpoint, so the CSS layout and this code always agree.
          desktop: "(width >= 64rem)",
          mobile: "(width < 64rem)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduce } = context.conditions as { desktop: boolean; reduce: boolean };
          // Every breakpoint change starts fresh, so the first scene in view always gets its light.
          current = -1;

          if (desktop && !reduce) {
            const track = trackRef.current!;
            const distance = () => track.scrollWidth - window.innerWidth;

            const scroll = gsap.to(track, {
              x: () => -distance(),
              ease: "none",
              scrollTrigger: {
                trigger: pinRef.current,
                start: "top top",
                end: () => `+=${distance()}`,
                pin: true,
                refreshPriority: 1,
                scrub: 0.8,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => gsap.set("[data-hud-fill]", { scaleX: self.progress }),
                onLeave: () => light(-1),
                onEnterBack: () => light(panels.length - 1),
                onLeaveBack: () => light(-1),
              },
            });

            // Keyboard users tabbing into a scene that is off to the side get scrolled to it.
            const st = scroll.scrollTrigger!;
            const onFocus = (event: FocusEvent) => {
              // The browser may also scroll the clipped container sideways to reveal focus; undo that.
              pinRef.current!.scrollLeft = 0;
              const panel = (event.target as HTMLElement).closest<HTMLElement>("[data-panel]");
              if (!panel) return;
              const ratio = Math.min(1, panel.offsetLeft / Math.max(1, distance()));
              window.scrollTo({ top: st.start + (st.end - st.start) * ratio });
            };
            track.addEventListener("focusin", onFocus);

            panels.forEach((panel, index) => {
              const along = { trigger: panel, containerAnimation: scroll, scrub: true } as const;
              const img = panel.querySelector<HTMLElement>("[data-scroll-img]")!;
              const viewport = panel.querySelector<HTMLElement>("[data-viewport]")!;

              ScrollTrigger.create({
                trigger: panel,
                containerAnimation: scroll,
                start: "left 55%",
                end: "right 55%",
                onToggle: (self) => self.isActive && light(index),
              });

              gsap.fromTo(
                panel.querySelector("[data-device]"),
                { rotateY: -26, rotateX: 8, xPercent: 24, scale: 0.86 },
                { rotateY: 10, rotateX: -3, xPercent: -12, scale: 1, ease: "none", scrollTrigger: { ...along, start: "left right", end: "right left" } },
              );
              gsap.fromTo(
                panel.querySelector("[data-phone]"),
                { yPercent: 55, rotate: -6 },
                { yPercent: -25, rotate: 3, ease: "none", scrollTrigger: { ...along, start: "left right", end: "right left" } },
              );
              gsap.to(img, {
                y: () => -(img.offsetHeight - viewport.offsetHeight),
                ease: "none",
                scrollTrigger: { ...along, start: "left 75%", end: "right 25%", invalidateOnRefresh: true },
              });
              gsap.fromTo(
                panel.querySelector("[data-ghost]"),
                { xPercent: 25 },
                { xPercent: -35, ease: "none", scrollTrigger: { ...along, start: "left right", end: "right left" } },
              );
              gsap.from(panel.querySelectorAll("[data-copy] > *"), {
                x: 140,
                opacity: 0,
                stagger: 0.08,
                ease: "power3.out",
                scrollTrigger: { ...along, start: "left 95%", end: "left 35%" },
              });
            });

            // The devices lean toward the pointer, on top of the scroll-driven rotation.
            const cleanups = panels.map((panel) => {
              const tilt = panel.querySelector<HTMLElement>("[data-tilt]")!;
              const rotateX = gsap.quickTo(tilt, "rotateX", { duration: 0.9, ease: "power3" });
              const rotateY = gsap.quickTo(tilt, "rotateY", { duration: 0.9, ease: "power3" });
              const onMove = (event: PointerEvent) => {
                const rect = panel.getBoundingClientRect();
                rotateY(((event.clientX - rect.left) / rect.width - 0.5) * 12);
                rotateX(-((event.clientY - rect.top) / rect.height - 0.5) * 9);
              };
              const onLeave = () => {
                rotateX(0);
                rotateY(0);
              };
              panel.addEventListener("pointermove", onMove);
              panel.addEventListener("pointerleave", onLeave);
              return () => {
                panel.removeEventListener("pointermove", onMove);
                panel.removeEventListener("pointerleave", onLeave);
              };
            });

            // Pins re-created after a breakpoint change land at the end of ScrollTrigger's list;
            // sorting puts them back in page order so everything below accounts for them.
            ScrollTrigger.sort();

            return () => {
              track.removeEventListener("focusin", onFocus);
              cleanups.forEach((cleanup) => cleanup());
            };
          }

          // Stacked scenes on smaller screens (and for reduced motion).
          panels.forEach((panel, index) => {
            ScrollTrigger.create({
              trigger: panel,
              start: "top 55%",
              end: "bottom 55%",
              onToggle: (self) => self.isActive && light(index),
              onLeaveBack: () => index === 0 && light(-1),
              onLeave: () => index === panels.length - 1 && light(-1),
            });
            if (reduce) return;

            const img = panel.querySelector<HTMLElement>("[data-scroll-img]")!;
            const viewport = panel.querySelector<HTMLElement>("[data-viewport]")!;
            gsap.to(img, {
              y: () => -(img.offsetHeight - viewport.offsetHeight),
              ease: "none",
              scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
            });
            gsap.from(panel.querySelectorAll("[data-copy] > *"), {
              y: 50,
              opacity: 0,
              duration: 1.2,
              stagger: 0.07,
              scrollTrigger: { trigger: panel, start: "top 78%" },
            });
            gsap.fromTo(
              panel.querySelector("[data-device]"),
              { rotateX: 18, y: 80, scale: 0.92 },
              { rotateX: 0, y: 0, scale: 1, ease: "none", scrollTrigger: { trigger: panel, start: "top bottom", end: "center center", scrub: true } },
            );
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" className="relative" style={{ backgroundColor: VOID }}>
      <div className="gutter pt-[clamp(6rem,14vh,10rem)] pb-[clamp(3rem,8vh,6rem)]">
        <Eyebrow>Selected work</Eyebrow>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <SplitReveal by="chars" className="display text-[clamp(3.6rem,13.5vw,14rem)] font-bold">
            Showroom
          </SplitReveal>
          <div className="max-w-[34ch] pb-[1.2vw]">
            <p className="font-mono text-[12px] text-ash">({pad(showroom.length)}) live products</p>
            <p className="mt-3 text-[17px] text-bone/80">
              Five run real businesses, one I built to practise. Keep scrolling to walk through each one, live pages included.
            </p>
          </div>
        </div>
      </div>

      <div ref={pinRef} className="relative motion-safe:lg:h-screen motion-safe:lg:overflow-clip">
        <div ref={trackRef} className="flex flex-col motion-safe:lg:h-full motion-safe:lg:w-max motion-safe:lg:flex-row">
          {showroom.map((project, index) => (
            <article
              key={project.slug}
              data-panel
              aria-label={project.name}
              className="relative flex w-full shrink-0 items-center overflow-hidden motion-safe:lg:h-full motion-safe:lg:w-screen"
              style={{ "--accent": project.theme.accent } as CSSProperties}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-[5%] size-[min(70vw,900px)] -translate-y-1/2 rounded-full opacity-35 blur-[110px]"
                style={{ background: `radial-gradient(circle, ${project.theme.accent} 0%, transparent 62%)` }}
              />
              <span
                data-ghost
                aria-hidden
                className="display pointer-events-none absolute bottom-[-0.18em] left-0 text-[24vw] whitespace-nowrap text-white/[0.035] select-none"
              >
                {project.name}
              </span>

              <div className="gutter relative grid w-full grid-cols-12 items-center gap-x-8 gap-y-14 py-20 motion-safe:lg:py-0">
                <div data-copy className="col-span-12 lg:col-span-5 lg:pt-10">
                  <div className="flex items-center gap-4 font-mono text-[12px]">
                    <span style={{ color: project.theme.accent }}>{pad(index + 1)}</span>
                    <span className="h-px w-10 bg-white/20" aria-hidden />
                    <span className="text-ash">{project.kind}</span>
                  </div>
                  <h3 className="display mt-6 text-[clamp(2.6rem,5.4vw,5.8rem)] font-bold">{project.name}</h3>
                  <p className="mt-6 max-w-[40ch] text-[clamp(1.05rem,1.3vw,1.2rem)] leading-relaxed text-bone/85">
                    {project.tagline}
                  </p>
                  <ul className="mt-7 space-y-2.5">
                    {project.points.map((point) => (
                      <li key={point} className="flex gap-3 text-[15px] text-ash">
                        <span
                          aria-hidden
                          className="mt-[0.6em] size-1.5 shrink-0 rounded-full"
                          style={{ background: project.theme.accent }}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-7 flex flex-wrap gap-1.5" aria-label="Built with">
                    {project.stack.map((tool) => (
                      <li key={tool} className="chip">
                        {tool}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <Magnetic>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="pill pill-solid"
                        style={{ "--pill-fill": project.theme.accent } as CSSProperties}
                      >
                        Visit {project.urlLabel}
                        <span aria-hidden>↗</span>
                      </a>
                    </Magnetic>
                    {project.extra && (
                      <a href={project.extra.href} target="_blank" rel="noreferrer" className="underline-grow text-[15px]">
                        {project.extra.label}
                      </a>
                    )}
                    <span className="flex items-center gap-2 font-mono text-[12px] text-ash">
                      <span
                        className="status-dot"
                        style={{ color: project.status === "Live" ? "var(--color-mint)" : "var(--color-amber)" }}
                        aria-hidden
                      />
                      {project.status}
                    </span>
                  </div>
                </div>

                <div className="relative col-span-12 [perspective:1800px] lg:col-span-7">
                  <div data-tilt className="[transform-style:preserve-3d]">
                    <div data-device className="relative [transform-style:preserve-3d]">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        tabIndex={-1}
                        aria-hidden
                        data-cursor="Open site"
                        className="block"
                      >
                        <BrowserFrame src={project.images.full} height={project.images.fullHeight} url={project.urlLabel} alt="" />
                      </a>
                      <div
                        data-phone
                        className="absolute -bottom-[10%] -left-[3%] w-[26%] min-w-[96px] [transform:translateZ(90px)] lg:-left-[7%]"
                      >
                        <PhoneFrame src={project.images.mobile} alt={`${project.name} on a phone`} sizes="(min-width: 1024px) 14vw, 26vw" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="gutter pointer-events-none absolute inset-x-0 bottom-7 hidden items-center gap-6 font-mono text-[12px] motion-safe:lg:flex">
          <span className="flex overflow-hidden tabular-nums">
            <span data-hud-index className="block">
              01
            </span>
            <span className="text-ash">&nbsp;/ {pad(showroom.length)}</span>
          </span>
          <span className="relative h-px flex-1 bg-white/15">
            <span data-hud-fill className="absolute inset-0 origin-left scale-x-0 bg-bone" />
          </span>
          <span className="flex min-w-[12ch] justify-end overflow-hidden">
            <span data-hud-name className="block">
              {showroom[0].name}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
