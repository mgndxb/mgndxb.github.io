import { showroom } from "@/content/projects";
import { quotes } from "@/content/quotes";

import { Eyebrow } from "./motion/eyebrow";

/** What clients say, each quote lit in its project's own accent. Renders nothing until there's a quote. */
export function Quotes() {
  if (!quotes.length) return null;

  return (
    <section aria-labelledby="quotes-title" className="gutter py-[clamp(5rem,12vh,9rem)]">
      <Eyebrow>From the people I built for</Eyebrow>
      <h2 id="quotes-title" className="sr-only">
        What clients say
      </h2>
      <ul className={`mt-10 grid gap-4 ${quotes.length > 1 ? "lg:grid-cols-2" : ""}`}>
        {quotes.map((quote) => {
          const project = showroom.find((p) => p.slug === quote.project);
          const accent = project?.theme.accent ?? "var(--color-mint)";
          return (
            <li
              key={quote.name}
              className="flex flex-col justify-between gap-10 rounded-[28px] border border-line bg-surface p-[clamp(1.5rem,3.4vw,3rem)]"
            >
              <blockquote
                className={`display font-semibold text-pretty ${
                  quotes.length > 1 ? "text-[clamp(1.3rem,2.2vw,1.9rem)]" : "max-w-[30ch] text-[clamp(1.6rem,3.6vw,3.2rem)]"
                }`}
              >
                <span aria-hidden style={{ color: accent }}>
                  &ldquo;
                </span>
                {quote.text}
                <span aria-hidden style={{ color: accent }}>
                  &rdquo;
                </span>
              </blockquote>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
                <span className="font-semibold">{quote.name}</span>
                <span className="text-ash">{quote.role}</span>
                {project && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-grow font-mono text-[12.5px]"
                    style={{ color: accent }}
                  >
                    {project.urlLabel}
                  </a>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
