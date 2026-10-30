"use client";

import { useRef, useState } from "react";

import { caseChapters, testSuites, underneath } from "@/content/case-study";
import { site } from "@/content/site";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/motion";
import { sound } from "@/lib/sound";

import { Eyebrow } from "./motion/eyebrow";
import { SplitReveal } from "./motion/split-reveal";
import { PhoneFrame } from "./showroom/devices";

const ACCENT = "#f0a493";
const maxChecks = Math.max(...testSuites.map((suite) => suite.checks));

/** Customer, server, Stripe and database, with a payment travelling the only path that confirms a booking. */
function PaymentFlow({ active }: { active: boolean }) {
  const nodes = [
    { x: 60, y: 70, label: "Customer", sub: "asks for a slot" },
    { x: 300, y: 70, label: "Server", sub: "sets the price" },
    { x: 300, y: 250, label: "Stripe", sub: "takes the deposit" },
    { x: 60, y: 250, label: "Postgres", sub: "confirms on webhook" },
  ];
  const path = "M60 70 H300 V250 H60 Z";

  return (
    <svg viewBox="0 0 360 320" className="w-full max-w-[460px]" role="img" aria-label="Payment flow: customer, server, Stripe, then Postgres confirms">
      <path d={path} fill="none" stroke="rgb(239 237 232 / 0.14)" strokeWidth="1.5" strokeDasharray="4 6" />
      <path
        d={path}
        fill="none"
        stroke={ACCENT}
        strokeWidth="2"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={active ? 0 : 1}
        style={{ transition: "stroke-dashoffset 2.4s cubic-bezier(0.77,0,0.175,1)" }}
      />
      {active && (
        <circle r="6" fill={ACCENT}>
          <animateMotion dur="3.2s" repeatCount="indefinite" path={path} />
        </circle>
      )}
      {nodes.map((node) => (
        <g key={node.label}>
          <circle cx={node.x} cy={node.y} r="26" fill="#17171b" stroke="rgb(239 237 232 / 0.25)" />
          <circle cx={node.x} cy={node.y} r="5" fill="#efede8" />
          <text x={node.x} y={node.y + 48} textAnchor="middle" fill="#efede8" fontSize="14" fontWeight="600">
            {node.label}
          </text>
          <text x={node.x} y={node.y + 66} textAnchor="middle" fill="#9d9b95" fontSize="11">
            {node.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

function SuiteChart({ active }: { active: boolean }) {
  return (
    <figure className="w-full max-w-[520px]">
      <figcaption className="mb-5 flex items-baseline justify-between">
        <span className="font-mono text-[12px] text-ash">Checks per suite</span>
        <span className="display text-[2.4rem] font-semibold tabular-nums">1,568</span>
      </figcaption>
      <ul className="space-y-2.5">
        {testSuites.map((suite, index) => (
          <li key={suite.name} className="grid grid-cols-[9.5rem_1fr_2.5rem] items-center gap-3 text-[13px]">
            <span className="truncate text-ash">{suite.name}</span>
            <span className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <span
                className="block h-full origin-left rounded-full"
                style={{
                  background: ACCENT,
                  width: `${(suite.checks / maxChecks) * 100}%`,
                  transform: active ? "scaleX(1)" : "scaleX(0)",
                  transition: `transform 1.4s cubic-bezier(0.16,1,0.3,1) ${index * 70}ms`,
                }}
              />
            </span>
            <span className="text-right tabular-nums">{suite.checks}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Defined PMU in depth: a sticky stage on one side, chapters scrolling past on the other. */
export function CaseStudy() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((chapter, index) => {
        ScrollTrigger.create({
          trigger: chapter,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (!self.isActive) return;
            setActive(index);
            sound.chime(index + 2);
          },
        });
      });
      if (prefersReducedMotion()) return;
      gsap.from("[data-under]", {
        y: 60,
        opacity: 0,
        duration: 1.3,
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-under-list]", start: "top 80%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="case-study" className="relative bg-[#120c0a] py-[clamp(6rem,14vh,10rem)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[40vh] bg-gradient-to-b from-void to-transparent"
      />
      <div className="gutter relative">
        <Eyebrow>Case study</Eyebrow>
        <SplitReveal className="display mt-6 max-w-[16ch] text-[clamp(2.6rem,6.5vw,6.5rem)] font-bold">
          Defined PMU, under the hood
        </SplitReveal>
        <p className="mt-6 max-w-[56ch] text-[18px] text-bone/80">
          The flagship. I was the sole developer: requirements, business rules, architecture, tests, deployment and
          production checks. It&apos;s the system the rest of the beauty work grew out of.
        </p>

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="top-0 hidden h-screen items-center justify-center lg:sticky lg:flex">
            <div className="relative grid h-[78vh] w-full place-items-center">
              <div
                aria-hidden
                className="absolute size-[70%] rounded-full opacity-30 blur-[100px]"
                style={{ background: `radial-gradient(circle, ${ACCENT}, transparent 65%)` }}
              />

              <div
                className="absolute inset-0 grid place-items-center transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  opacity: active === 0 ? 1 : 0,
                  transform: active === 0 ? "none" : "translateY(30px) scale(0.96)",
                  filter: active === 0 ? "none" : "blur(8px)",
                }}
              >
                <div className="flex items-center gap-6">
                  <PhoneFrame
                    src="/work/definedpmu-book-treatment.webp"
                    alt="Defined PMU booking, choosing a treatment"
                    className="w-[min(15vw,240px)] -rotate-6"
                  />
                  <PhoneFrame
                    src="/work/definedpmu-book-time.webp"
                    alt="Defined PMU booking, choosing a day and time"
                    className="w-[min(15vw,240px)] translate-y-10 rotate-3"
                  />
                </div>
              </div>

              <div
                className="absolute inset-0 grid place-items-center transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  opacity: active === 1 ? 1 : 0,
                  transform: active === 1 ? "none" : "translateY(30px) scale(0.96)",
                  filter: active === 1 ? "none" : "blur(8px)",
                }}
              >
                <PaymentFlow active={active === 1} />
              </div>

              <div
                className="absolute inset-0 grid place-items-center transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  opacity: active === 2 ? 1 : 0,
                  transform: active === 2 ? "none" : "translateY(30px) scale(0.96)",
                  filter: active === 2 ? "none" : "blur(8px)",
                }}
              >
                <SuiteChart active={active === 2} />
              </div>
            </div>
          </div>

          <ol>
            {caseChapters.map((chapter, index) => (
              <li
                key={chapter.id}
                data-chapter
                data-active={active === index}
                className="group flex min-h-[70vh] flex-col justify-center border-t border-white/10 py-14 lg:min-h-[85vh]"
              >
                <span className="font-mono text-[12px]" style={{ color: ACCENT }}>
                  {String(index + 1).padStart(2, "0")} {chapter.label}
                </span>
                {/* Only the title dims when a chapter is out of focus, so the text stays readable. */}
                <h3 className="display mt-5 text-[clamp(1.8rem,3.2vw,3rem)] font-semibold text-ash transition-colors duration-500 group-data-[active=true]:text-bone">
                  {chapter.title}
                </h3>
                <p className="mt-5 max-w-[52ch] text-[17px] text-bone/80">{chapter.text}</p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {chapter.facts.map((fact) => (
                    <li key={fact} className="chip">
                      {fact}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 lg:hidden">
                  {index === 0 && (
                    <div className="flex gap-4">
                      <PhoneFrame src="/work/definedpmu-book-treatment.webp" alt="Choosing a treatment" className="w-1/2 max-w-[220px]" />
                      <PhoneFrame src="/work/definedpmu-book-time.webp" alt="Choosing a day and time" className="w-1/2 max-w-[220px] translate-y-6" />
                    </div>
                  )}
                  {index === 1 && <PaymentFlow active />}
                  {index === 2 && <SuiteChart active />}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-20">
          <h3 className="font-mono text-[12px] text-ash">And underneath</h3>
          <ul data-under-list className="mt-6 grid gap-4 md:grid-cols-3">
            {underneath.map((item) => (
              <li key={item.title} data-under className="rounded-[20px] border border-white/10 bg-white/[0.025] p-7">
                <h4 className="text-[19px] font-semibold">{item.title}</h4>
                <p className="mt-3 text-[15px] text-ash">{item.text}</p>
              </li>
            ))}
          </ul>
          <a
            href={site.caseStudy}
            target="_blank"
            rel="noreferrer"
            className="pill pill-ghost mt-10"
          >
            Read the full engineering case study <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
