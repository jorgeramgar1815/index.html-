import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type Crumb = { href?: string; label: string };

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/** Portadilla de páginas secundarias: folio, titular gigante e intro. */
export function PageHeader({
  crumbs,
  eyebrow,
  title,
  accent,
  intro,
  children,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  /** Palabra final en cursiva jade. */
  accent?: string;
  intro: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="bg-cream pt-24 sm:pt-28">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <nav aria-label="Ruta de navegación" className="rise border-b border-ink/15 pb-3" style={d(0)}>
          <ol className="flex items-center gap-3 text-stone">
            {crumbs.map((c, i) => (
              <li key={c.label} className="eyebrow flex items-center gap-3">
                {i > 0 && <span aria-hidden>/</span>}
                {c.href ? (
                  <Link href={c.href} className="link-draw hover:text-ink">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="grid gap-8 pb-16 pt-12 lg:grid-cols-12 lg:items-end lg:pb-20 lg:pt-16">
          <div className="lg:col-span-8">
            <p className="rise eyebrow text-jade-ink" style={d(0.1)}>
              — {eyebrow}
            </p>
            <h1 className="display mt-5 text-[3.4rem] sm:text-7xl xl:text-[7.5rem]">
              <span className="line">
                <span style={d(0.15)}>{title}</span>
              </span>
              {accent && (
                <span className="line">
                  <span style={d(0.25)}>
                    <em className="text-jade-ink">{accent}</em>
                  </span>
                </span>
              )}
            </h1>
          </div>
          <div className="rise lg:col-span-4 lg:pb-4" style={d(0.4)}>
            <p className="max-w-sm text-lg leading-relaxed text-stone">{intro}</p>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
