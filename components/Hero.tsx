import Link from "next/link";
import type { CSSProperties } from "react";
import { categories } from "@/content/services";
import { site } from "@/content/site";
import { waMessages } from "@/lib/whatsapp";
import { ArtFrame } from "./ArtFrame";
import { ArrowIcon } from "./Icons";
import { Lotus } from "./Lotus";
import { WhatsAppButton } from "./WhatsAppButton";

// PLACEHOLDER: foto real de portada (retrato spa, luz cálida, formato vertical)
const HERO_IMAGE: string | null = null;

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/** Sello circular con texto que gira y loto que se dibuja. */
function Seal() {
  return (
    <div className="relative h-28 w-28 sm:h-36 sm:w-36" aria-hidden>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow text-ink">
        <defs>
          <path id="sello" d="M100 100m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0" />
        </defs>
        <text fontSize="14" fill="currentColor" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
          <textPath href="#sello" textLength="496" lengthAdjust="spacing">
            TE MERECES ESTE ESPACIO ✦ REDUZEN ✦
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[24%] flex items-center justify-center rounded-full bg-gold">
        <Lotus draw className="w-[64%] text-ink" accent="var(--color-cream-50)" strokeWidth={1.7} />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-titulo" className="relative overflow-hidden bg-cream pt-24 sm:pt-28">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        {/* Folio superior */}
        <div className="rise flex items-center justify-between border-b border-ink/15 pb-3 text-stone" style={d(0)}>
          <span className="eyebrow">Mesoterapia &amp; Spa</span>
          <span className="eyebrow hidden sm:block">{site.address.neighborhood}</span>
          <span className="eyebrow">{site.address.city}, Coah.</span>
        </div>

        <div className="grid gap-10 pb-12 pt-8 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-10">
          <div className="lg:col-span-7">
            <p className="rise eyebrow text-jade-ink" style={d(0.1)}>
              — Este es tu momento
            </p>
            <h1 id="hero-titulo" className="display mt-5 text-[5.3rem] sm:text-[8rem] lg:text-[8.5rem] xl:text-[9.5rem]">
              <span className="line">
                <span style={d(0.15)}>Florece</span>
              </span>
              <span className="line">
                <span style={d(0.25)} className="pl-[12%]">
                  desde
                </span>
              </span>
              <span className="line">
                <span style={d(0.35)}>
                  <em className="text-jade-ink">adentro.</em>
                </span>
              </span>
              <span className="sr-only"> Reduzen, mesoterapia y spa en Torreón</span>
            </h1>

            <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end lg:max-w-2xl">
              <p className="rise max-w-sm text-lg leading-relaxed text-stone" style={d(0.5)}>
                Faciales, corporales, uñas, pedicure y láser con la calma de un spa boutique.
              </p>
              <div className="rise hidden sm:block lg:hidden" style={d(0.6)}>
                <Seal />
              </div>
            </div>
            <div className="rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8" style={d(0.65)}>
              <WhatsAppButton message={waMessages.hero} size="lg">
                Agenda tu cita
              </WhatsAppButton>
              <Link href="#servicios" className="group inline-flex min-h-12 items-center gap-2 self-start text-sm font-medium tracking-wide text-ink sm:self-auto">
                <span className="link-draw">Ver servicios</span>
                <ArrowIcon size={18} className="rotate-90 transition-transform duration-500 group-hover:translate-y-1" />
              </Link>
            </div>
          </div>

          <figure className="relative lg:col-span-5 lg:pt-8">
            <div className="curtain relative" style={d(0.3)}>
              <ArtFrame
                variant="portrait"
                src={HERO_IMAGE}
                priority
                alt="Mujer relajada con piel luminosa durante un tratamiento facial en Reduzen"
                className="aspect-[4/5] w-full"
              />
              <span className="eyebrow absolute left-4 top-4 bg-cream-50 px-3 py-1.5 text-ink">Tratamiento estrella</span>
            </div>
            <figcaption className="rise mt-3 flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3" style={d(0.8)}>
              <span className="eyebrow shrink-0 text-gold-ink">Fig. 01</span>
              <span className="font-serif text-xl italic text-ink">Hydrafacial — piel luminosa en una sesión</span>
            </figcaption>
            <div className="absolute -left-16 top-1/2 hidden -translate-y-1/2 lg:block">
              <div className="rise" style={d(0.9)}>
                <Seal />
              </div>
            </div>
          </figure>
        </div>
      </div>

      {/* Índice: las 5 categorías como tabla de contenidos */}
      <nav aria-label="Categorías" className="rise border-y border-ink/15 bg-cream-50" style={d(0.9)}>
        <ol className="no-scrollbar mx-auto flex max-w-[88rem] overflow-x-auto sm:grid sm:grid-cols-5">
          {categories.map((c, i) => (
            <li key={c.slug} className="shrink-0 border-r border-ink/10 last:border-r-0">
              <Link
                href={`/servicios/#${c.slug}`}
                className="group flex min-h-20 items-center gap-4 px-5 py-4 transition-colors duration-500 hover:bg-ink sm:px-6"
              >
                <span className="eyebrow text-gold-ink group-hover:text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span className="whitespace-nowrap font-serif text-2xl text-ink transition-colors duration-500 group-hover:text-cream">
                  {c.short}
                </span>
                <ArrowIcon size={18} className="ml-auto -rotate-45 text-ink/40 transition-all duration-500 group-hover:rotate-0 group-hover:text-gold" />
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}
