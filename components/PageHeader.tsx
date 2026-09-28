import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronIcon } from "./Icons";
import { Branch, Sparkles } from "./Section";
import { SectionDivider } from "./SectionDivider";

type Crumb = { href?: string; label: string };

/** Encabezado de páginas secundarias con breadcrumb. */
export function PageHeader({
  crumbs,
  eyebrow,
  script,
  title,
  intro,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  script: string;
  title: ReactNode;
  intro: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-cream pt-28 sm:pt-36">
      <Branch className="pointer-events-none absolute -right-8 top-16 w-44 text-jade-ink/20 sm:w-64" />
      <Sparkles />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-6">
        <nav aria-label="Ruta de navegación">
          <ol className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-stone">
            {crumbs.map((c, i) => (
              <li key={c.label} className="flex items-center gap-2">
                {i > 0 && <ChevronIcon size={14} className="text-gold-ink" />}
                {c.href ? (
                  <Link href={c.href} className="underline-offset-4 hover:text-navy hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-navy">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="rise">
          <p className="eyebrow mt-8 text-gold-ink">{eyebrow}</p>
          <p className="script mt-4 text-5xl text-jade-ink sm:text-6xl" aria-hidden>
            {script}
          </p>
          <h1 className="mt-1 text-[2.6rem] leading-[1.05] text-navy sm:text-6xl">{title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-stone">{intro}</p>
        </div>
      </div>
      <SectionDivider fill="var(--color-cream-50)" accent="rgba(201,162,75,.18)" animated className="mt-12" />
    </section>
  );
}
