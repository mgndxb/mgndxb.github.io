"use client";

import { useState } from "react";

import { faq } from "@/content/skills";
import { sound } from "@/lib/sound";

import { Eyebrow } from "./motion/eyebrow";
import { SplitReveal } from "./motion/split-reveal";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="gutter py-[clamp(6rem,14vh,10rem)]">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div>
          <Eyebrow>For hiring teams</Eyebrow>
          <SplitReveal className="display mt-6 text-[clamp(2.6rem,6vw,6rem)] font-bold">Straight answers</SplitReveal>
          <p className="mt-6 max-w-[38ch] text-[17px] text-ash">
            The questions I&apos;d ask if I were hiring me. Anything else, just email.
          </p>
        </div>

        <ul className="border-b border-line">
          {faq.map((item, index) => {
            const isOpen = open === index;
            return (
              <li key={item.q} className="border-t border-line">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${index}`}
                    onClick={() => {
                      sound.pop(!isOpen);
                      setOpen(isOpen ? null : index);
                    }}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left text-[clamp(1.1rem,1.6vw,1.35rem)] font-medium transition-colors duration-300 hover:text-white"
                  >
                    {item.q}
                    <span className="accordion-icon grid size-9 shrink-0 place-items-center rounded-full border border-line" aria-hidden>
                      <svg viewBox="0 0 16 16" className="size-3.5">
                        <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div id={`faq-${index}`} className="accordion-panel" data-open={isOpen} inert={!isOpen}>
                  <div>
                    <p className="max-w-[60ch] pb-7 text-[16px] text-ash">{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
