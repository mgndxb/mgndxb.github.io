"use client";

import { useEffect, useRef, useState } from "react";

import { site } from "@/content/site";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

import { CopyEmailButton } from "./copy-email-button";
import { Magnetic } from "./motion/magnetic";
import { SplitReveal } from "./motion/split-reveal";

function HelsinkiClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: site.timeZone,
    });
    const update = () => setTime(format.format(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {time ?? "--:--:--"}
    </span>
  );
}

export function Contact() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-contact-fade]", {
        y: 40,
        opacity: 0,
        duration: 1.3,
        stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: "top 60%" },
      });
      gsap.fromTo(
        "[data-contact-glow]",
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true } },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="contact" className="relative overflow-hidden pt-[clamp(6rem,16vh,12rem)]">
      <div
        data-contact-glow
        aria-hidden
        className="pointer-events-none absolute -bottom-[30vw] left-1/2 size-[110vw] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, rgb(70 227 155 / 0.22), rgb(255 106 44 / 0.12) 40%, transparent 65%)" }}
      />

      <div className="gutter relative">
        <p className="eyebrow flex items-center gap-3">
          <span className="status-dot text-mint" aria-hidden />
          {site.availability}
        </p>
        <SplitReveal by="chars" className="display mt-8 text-[clamp(3.6rem,15vw,15rem)] font-bold">
          Let&apos;s talk
        </SplitReveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
          <div data-contact-fade>
            <p className="max-w-[44ch] text-[clamp(1.1rem,1.6vw,1.35rem)] text-bone/85">
              Hiring a junior developer, or curious how something here was built? Email me.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="underline-grow mt-6 inline-block text-[clamp(1.3rem,3.4vw,3rem)] font-medium tracking-[-0.03em] break-all"
              data-cursor="Write"
            >
              {site.email}
            </a>
          </div>

          <div data-contact-fade className="flex flex-wrap items-center gap-4 lg:justify-end">
            <Magnetic strength={0.5}>
              <a
                href={`mailto:${site.email}`}
                className="display grid size-[clamp(8.5rem,13vw,11rem)] place-items-center rounded-full bg-bone text-center text-[15px] font-semibold text-void transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
              >
                Email
                <br />
                me
              </a>
            </Magnetic>
            <div className="flex flex-col gap-3">
              <CopyEmailButton email={site.email} />
              <a href={site.cv.en} download="Magnus-Kaur-CV.pdf" className="pill pill-ghost justify-center">
                Download CV <span aria-hidden>↓</span>
              </a>
              <a href={site.github} target="_blank" rel="noreferrer" className="pill pill-ghost justify-center">
                GitHub <span aria-hidden>↗</span>
              </a>
              <a
                href={site.cv.fi}
                download="Magnus-Kaur-CV-suomi.pdf"
                lang="fi"
                className="underline-grow self-center font-mono text-[12px] text-ash"
              >
                CV suomeksi
              </a>
            </div>
          </div>
        </div>

        <footer className="mt-[clamp(5rem,14vh,9rem)] grid gap-6 border-t border-line py-8 font-mono text-[12px] text-ash md:grid-cols-3">
          <p>
            {site.city}, {site.country} <span className="text-dim">/</span> <HelsinkiClock />
          </p>
          <p className="md:text-center">
            Next.js, TypeScript, GSAP, WebGL. Tested with Vitest.
          </p>
          <p className="md:text-right">
            <a href={site.sourceRepo} target="_blank" rel="noreferrer" className="underline-grow">
              Source on GitHub
            </a>
            <span className="text-dim"> / </span>© 2026 {site.name}
          </p>
        </footer>
      </div>
    </section>
  );
}
