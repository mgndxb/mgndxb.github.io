"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { sound } from "@/lib/sound";

interface HighlightedSample {
  id: string;
  title: string;
  path: string;
  explanation: string;
  href: string;
  html: string;
}

export function CodeTabs({ samples }: { samples: HighlightedSample[] }) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + samples.length) % samples.length;
    sound.select();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-6 lg:mt-16 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-10">
      <div
        role="tablist"
        aria-label="Code excerpts"
        aria-orientation="vertical"
        className="flex min-w-0 flex-col gap-1"
        onKeyDown={onKeyDown}
      >
        {samples.map((sample, index) => {
          const selected = index === active;
          return (
            <button
              key={sample.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`code-tab-${sample.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`code-panel-${sample.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                if (index !== active) sound.select();
                setActive(index);
              }}
              className={`rounded-[10px] px-4 py-3 text-left transition-[background-color,transform] duration-200 active:scale-[0.98] ${
                selected ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
              }`}
            >
              <span className={`block font-semibold ${selected ? "text-white" : "text-bone"}`}>{sample.title}</span>
              <span className="mt-0.5 block truncate font-mono text-[12px] text-ash">{sample.path}</span>
            </button>
          );
        })}
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)]">
        {samples.map((sample, index) => {
          const selected = index === active;
          return (
            <div
              key={sample.id}
              id={`code-panel-${sample.id}`}
              role="tabpanel"
              aria-labelledby={`code-tab-${sample.id}`}
              aria-hidden={!selected}
              inert={!selected}
              data-active={selected}
              className="code-panel [grid-area:1/1] min-w-0"
            >
              <p className="max-w-[64ch] text-[17px] text-bone">{sample.explanation}</p>
              <div className="mt-5 overflow-hidden rounded-[20px] bg-surface ring-1 ring-white/[0.07]">
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-3">
                  <span className="truncate font-mono text-[12px] text-ash">{sample.path}</span>
                  <a
                    href={sample.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-grow shrink-0 text-[13px] font-medium text-bone"
                  >
                    View on GitHub
                  </a>
                </div>
                <div dangerouslySetInnerHTML={{ __html: sample.html }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
