import type { ReactNode } from "react";
import { GrowLine, WordsReveal } from "./Effects";
import { Reveal } from "./Motion";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  /** Frase manuscrita opcional (máx. una por sección). */
  script?: string;
  intro?: ReactNode;
  align?: "center" | "left";
  dark?: boolean;
  id?: string;
};

export function SectionHeading({ eyebrow, title, script, intro, align = "center", dark = false, id }: SectionHeadingProps) {
  const center = align === "center";
  const line = dark ? "bg-gold/60" : "bg-gold";
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-2xl`}>
      <Reveal>
        <p className={`eyebrow flex items-center gap-3 ${center ? "justify-center" : ""} ${dark ? "text-gold" : "text-gold-ink"}`}>
          <GrowLine className={`w-8 ${line}`} origin="right" />
          {eyebrow}
          {center && <GrowLine className={`w-8 ${line}`} />}
        </p>
      </Reveal>
      {script && (
        <Reveal delay={0.1}>
          <p className={`script mt-4 text-[2.6rem] sm:text-5xl ${dark ? "text-gold" : "text-jade-ink"}`} aria-hidden>
            {script}
          </p>
        </Reveal>
      )}
      <h2
        id={id}
        className={`${script ? "mt-1" : "mt-4"} text-[2.35rem] leading-[1.08] sm:text-5xl ${dark ? "text-cream" : "text-navy"}`}
      >
        {typeof title === "string" ? <WordsReveal text={title} delay={0.1} /> : title}
      </h2>
      {intro && (
        <Reveal delay={0.25}>
          <p className={`mt-5 text-[1.05rem] leading-relaxed ${dark ? "text-cream/80" : "text-stone"}`}>{intro}</p>
        </Reveal>
      )}
    </div>
  );
}

/** Destellos dorados decorativos que titilan suavemente. */
export function Sparkles({ className = "" }: { className?: string }) {
  const points = [
    { x: "8%", y: "18%", s: 14, d: "0s" },
    { x: "92%", y: "12%", s: 10, d: "1.2s" },
    { x: "85%", y: "78%", s: 16, d: "2.1s" },
    { x: "4%", y: "82%", s: 9, d: "0.6s" },
  ];
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {points.map((p, i) => (
        <svg
          key={i}
          className="absolute animate-twinkle text-gold"
          style={{ left: p.x, top: p.y, width: p.s, height: p.s, animationDelay: p.d }}
          viewBox="-10 -10 20 20"
        >
          <path d="M0-10c1 7 3 9 10 10-7 1-9 3-10 10-1-7-3-9-10-10 7-1 9-3 10-10Z" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}

/** Rama ilustrada para esquinas (elemento recurrente de la marca). */
export function Branch({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden>
      <path d="M8 192C60 150 110 96 190 10" />
      {[
        [40, 160, -30], [62, 138, 10], [84, 114, -40], [104, 92, 5], [126, 68, -45], [146, 46, 0], [166, 28, -50],
      ].map(([x, y, r], i) => (
        <path
          key={i}
          transform={`translate(${x} ${y}) rotate(${r})`}
          d={i % 2 ? "M0 0c10-14 26-16 34-10-8 12-22 16-34 10Z" : "M0 0c-14-10-16-26-10-34 12 8 16 22 10 34Z"}
        />
      ))}
    </svg>
  );
}
