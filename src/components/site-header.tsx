"use client";

import { useEffect, useRef, useState } from "react";

import { site } from "@/content/site";
import { gsap, motionState, onIntro, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/motion";
import { sound } from "@/lib/sound";

import { SoundToggle } from "./sound";

const links = [
  { href: "#work", label: "Work" },
  { href: "#lab", label: "Lab" },
  { href: "#skills", label: "Skills" },
  { href: "#stack", label: "Stack" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const root = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(
    () => {
      const header = root.current!;
      const reduce = prefersReducedMotion();

      let offIntro = () => {};
      if (!reduce) {
        gsap.set(header, { yPercent: -100 });
        offIntro = onIntro(() => gsap.to(header, { yPercent: 0, duration: 1.2, delay: 0.5 }));
      }

      // Hide while scrolling down, come back on the way up, and whenever keyboard focus arrives.
      const show = gsap.quickTo(header, "yPercent", { duration: 0.6, ease: "expo.out" });
      const reveal = () => show(0);
      header.addEventListener("focusin", reveal);
      ScrollTrigger.create({
        start: "top top",
        end: "max",
        onUpdate: (self) => {
          header.dataset.scrolled = String(self.scroll() > 40);
          gsap.set("[data-progress]", { scaleX: self.progress });
          if (reduce || header.dataset.menu === "true") return;
          if (self.direction === 1 && self.scroll() > 400) show(-100);
          else if (self.direction === -1) show(0);
        },
      });

      return () => {
        offIntro();
        header.removeEventListener("focusin", reveal);
      };
    },
    { scope: root },
  );

  // While the menu is open: the page underneath can't scroll or take focus, Escape closes it,
  // and so does growing past the mobile layout (rotating a phone), where the menu doesn't exist.
  useEffect(() => {
    if (!menuOpen) return;
    const html = document.documentElement;
    const main = document.getElementById("main");
    html.style.overflow = "hidden";
    main?.setAttribute("inert", "");
    motionState.lenis?.stop();
    firstLink.current?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const wide = window.matchMedia("(width >= 48rem)");
    const onWide = () => wide.matches && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    const button = menuButton.current;
    return () => {
      html.style.overflow = "";
      main?.removeAttribute("inert");
      motionState.lenis?.start();
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
      button?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  function go(href: string) {
    setMenuOpen(false);
    // Let the menu release scrolling before travelling to the section.
    window.setTimeout(() => {
      const target = document.querySelector(href);
      if (!target) return;
      if (motionState.lenis) motionState.lenis.scrollTo(target as HTMLElement, { duration: 1.4 });
      else target.scrollIntoView();
    }, 60);
  }

  return (
    <>
      <header
        ref={root}
        data-scrolled="false"
        data-menu={menuOpen}
        className="fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-500 data-[menu=true]:bg-transparent data-[menu=true]:backdrop-blur-none data-[scrolled=true]:bg-void/55 data-[scrolled=true]:backdrop-blur-xl"
      >
        <div className="gutter relative z-10 flex h-[68px] items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3" aria-label={`${site.name}, back to top`}>
            <span className="display grid size-9 place-items-center rounded-full bg-bone text-[12px] font-bold tracking-[-0.04em] text-void">
              MK
            </span>
            <span className="text-[15px] font-medium whitespace-nowrap">{site.name}</span>
          </a>

          <nav aria-label="Sections" className="hidden md:block">
            <ul className="flex items-center gap-1 rounded-full border border-line bg-surface/60 p-1 backdrop-blur-xl">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="roll-host block rounded-full px-4 py-2 text-[14px] text-ash transition-colors duration-300 hover:bg-white/[0.06] hover:text-bone"
                  >
                    <span className="roll">
                      <span>{link.label}</span>
                      <span aria-hidden>{link.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <SoundToggle />
            <a
              href={site.cv.en}
              download="Magnus-Kaur-CV.pdf"
              className="hidden h-11 items-center gap-2 rounded-full border border-line bg-surface/60 px-4 text-[13px] whitespace-nowrap backdrop-blur-xl transition-colors duration-300 hover:border-white/30 lg:flex"
            >
              CV <span aria-hidden>↓</span>
            </a>
            <a
              href="#contact"
              className="hidden h-11 items-center gap-2.5 rounded-full border border-line bg-surface/60 px-4 text-[13px] whitespace-nowrap backdrop-blur-xl lg:flex"
            >
              <span className="status-dot text-mint" aria-hidden />
              {site.availability}
            </a>
            <button
              ref={menuButton}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => {
                sound.swoosh(!menuOpen);
                setMenuOpen(!menuOpen);
              }}
              className="relative grid size-11 place-items-center rounded-full border border-line bg-surface/60 backdrop-blur-xl md:hidden"
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              <span aria-hidden className="relative block h-3 w-[18px]">
                <span
                  className="absolute inset-x-0 top-0 h-px bg-bone transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]"
                  style={{ transform: menuOpen ? "translateY(5.5px) rotate(45deg)" : "none" }}
                />
                <span
                  className="absolute inset-x-0 bottom-0 h-px bg-bone transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]"
                  style={{ transform: menuOpen ? "translateY(-5.5px) rotate(-45deg)" : "none" }}
                />
              </span>
            </button>
          </div>
        </div>
        <div className="relative z-10 h-px bg-transparent">
          <div data-progress className="h-full origin-left scale-x-0 bg-bone/60" />
        </div>
      </header>

      {/* Outside the header: its transform would otherwise trap this fixed overlay inside it. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!menuOpen}
        aria-hidden={!menuOpen}
        className="fixed inset-0 z-40 flex flex-col justify-between bg-void px-[clamp(1rem,4vw,3.5rem)] pt-28 pb-10 transition-[clip-path] duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] md:hidden"
        style={{ clipPath: menuOpen ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
      >
        <nav aria-label="Menu">
          <ol>
            {links.map((link, index) => (
              <li key={link.href} className="overflow-hidden border-b border-line">
                <a
                  ref={index === 0 ? firstLink : undefined}
                  href={link.href}
                  onClick={(event) => {
                    event.preventDefault();
                    go(link.href);
                  }}
                  className="flex items-baseline justify-between py-4 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: menuOpen ? "none" : "translateY(110%)",
                    transitionDelay: menuOpen ? `${180 + index * 60}ms` : "0ms",
                  }}
                >
                  <span className="display text-[clamp(2.4rem,11vw,3.4rem)] font-bold">{link.label}</span>
                  <span className="font-mono text-[12px] text-ash">{String(index + 1).padStart(2, "0")}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div
          className="space-y-3 transition-opacity duration-500"
          style={{ opacity: menuOpen ? 1 : 0, transitionDelay: menuOpen ? "500ms" : "0ms" }}
        >
          <p className="flex items-center gap-2.5 text-[14px]">
            <span className="status-dot text-mint" aria-hidden />
            {site.availability}
          </p>
          <a href={`mailto:${site.email}`} className="block text-[18px] font-medium">
            {site.email}
          </a>
          <p className="flex gap-4 text-[14px] text-ash">
            <a href={site.cv.en} download="Magnus-Kaur-CV.pdf" className="underline-grow">
              Download CV
            </a>
            <a href={site.cv.fi} download="Magnus-Kaur-CV-suomi.pdf" lang="fi" className="underline-grow">
              CV suomeksi
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
