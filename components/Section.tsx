import type { ReactNode } from "react";
import { Rule, WordsReveal } from "./Effects";
import { Reveal } from "./Motion";

type SectionHeadProps = {
  /** Número de sección tipo folio: "02". */
  number: string;
  label: string;
  title: string;
  intro?: ReactNode;
  dark?: boolean;
  id?: string;
  /** Contenido a la derecha del titular (p. ej. un enlace). */
  aside?: ReactNode;
  /** Sobre bloque turquesa: folio en marino. */
  tone?: "jade";
};

/** Encabezado editorial: folio + filete + titular grande alineado a la izquierda. */
export function SectionHead({ number, label, title, intro, dark = false, id, aside, tone }: SectionHeadProps) {
  return (
    <header>
      <div className={`flex items-center gap-4 ${dark ? "text-gold-pale" : tone === "jade" ? "text-ink" : "text-gold-ink"}`}>
        <span className="eyebrow">{number}</span>
        <Rule dark={dark} className="flex-1" />
        <span className="eyebrow">{label}</span>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-12 lg:items-end">
        <h2
          id={id}
          className={`display text-[2.3rem] sm:text-5xl lg:col-span-8 lg:text-[4.2rem] ${dark ? "!text-cream" : ""}`}
        >
          <WordsReveal text={title} />
        </h2>
        {(intro || aside) && (
          <Reveal delay={0.2} className="lg:col-span-4 lg:pb-3">
            {intro && <p className={`max-w-sm text-base leading-relaxed ${dark ? "text-cream/75" : "text-stone"}`}>{intro}</p>}
            {aside}
          </Reveal>
        )}
      </div>
    </header>
  );
}
