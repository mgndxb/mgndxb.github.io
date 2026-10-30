import { codeRepo, codeSamples } from "@/content/code-samples";
import { highlight } from "@/lib/highlight";

import { CodeTabs } from "./code-tabs";
import { Eyebrow } from "./motion/eyebrow";
import { Magnetic } from "./motion/magnetic";
import { SplitReveal } from "./motion/split-reveal";
import { ScheduleBoard } from "./schedule-board";

/**
 * The idea behind all the booking work, as something to play with, then the
 * real code it comes from. Highlighting runs at build time, so visitors get plain HTML.
 */
export async function Engine() {
  const samples = await Promise.all(
    codeSamples.map(async (sample) => ({
      id: sample.id,
      title: sample.title,
      path: sample.path,
      explanation: sample.explanation,
      href: `${codeRepo}/blob/main/${sample.path}`,
      html: await highlight(sample.code, sample.lang, sample.highlight),
    })),
  );

  return (
    <section id="code" className="relative overflow-hidden py-[clamp(6rem,14vh,10rem)]">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[10%] left-1/2 size-[80vw] -translate-x-1/2 rounded-full bg-mint/10 blur-[160px]"
      />
      <div className="gutter relative">
        <Eyebrow>The engine</Eyebrow>
        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SplitReveal className="display text-[clamp(2.6rem,7vw,7rem)] font-bold">
            Try to
            <br />
            double&#8209;book
          </SplitReveal>
          <p className="max-w-[44ch] text-[18px] text-bone/80 lg:pb-3">
            Every booking system I build rests on one rule: two bookings can&apos;t overlap, and the database refuses an
            overlap at the moment it&apos;s written, not after a check that can go stale. Drag across a row, or race two
            requests, and watch it hold.
          </p>
        </div>

        <div className="mt-14">
          <ScheduleBoard />
        </div>

        <div className="mt-[clamp(5rem,12vh,8rem)] flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[44rem]">
            <h3 className="display text-[clamp(1.8rem,3.6vw,3.2rem)] font-semibold">The real code</h3>
            <p className="mt-4 text-[17px] text-ash">
              Client code is private, so here&apos;s a public sample: a small Next.js app where PostgreSQL, not app code,
              guarantees bookings never overlap. Its tests reproduce the race itself.
            </p>
          </div>
          <Magnetic>
            <a href={codeRepo} target="_blank" rel="noreferrer" className="pill pill-ghost">
              Open the repository <span aria-hidden>↗</span>
            </a>
          </Magnetic>
        </div>

        <CodeTabs samples={samples} />
      </div>
    </section>
  );
}
