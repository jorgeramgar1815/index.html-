import Link from "next/link";
import type { CSSProperties } from "react";
import { categories } from "@/content/services";
import { waMessages } from "@/lib/whatsapp";
import { ArtFrame } from "./ArtFrame";
import { Bubbles } from "./Decor";
import { ArrowIcon } from "./Icons";
import { Lotus } from "./Lotus";
import { WhatsAppButton } from "./WhatsAppButton";

// PLACEHOLDER: fotos reales para los marcos laterales del inicio (retrato spa / tratamiento)
const HERO_LEFT: string | null = null;
const HERO_RIGHT: string | null = null;

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/** Marco lateral con pie de foto (solo desktop). */
function SideFrame({ side, src, fig, caption }: { side: "left" | "right"; src: string | null; fig: string; caption: string }) {
  return (
    <figure
      className={`absolute top-1/2 hidden w-[15vw] max-w-60 -translate-y-1/2 xl:block ${side === "left" ? "left-8 2xl:left-16" : "right-8 2xl:right-16"}`}
    >
      <div className="curtain" style={d(side === "left" ? 0.5 : 0.65)}>
        <ArtFrame variant={side === "left" ? "facial" : "portrait"} src={src} alt={caption} className="aspect-[3/4] w-full" />
      </div>
      <figcaption className="rise mt-2 flex justify-between border-b border-ink/15 pb-2" style={d(0.9)}>
        <span className="eyebrow text-gold-ink">{fig}</span>
        <span className="eyebrow text-stone">{caption}</span>
      </figcaption>
    </figure>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-titulo" className="relative isolate overflow-hidden bg-cream">
      <div className="relative flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center px-5 pb-16 pt-28 text-center">
        <Bubbles count={9} />

        {/* Anillos dorados detrás del nombre */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="rise h-[34rem] w-[34rem] rounded-full border border-gold/30 sm:h-[44rem] sm:w-[44rem]" style={d(0.2)} />
          <div className="rise absolute inset-12 rounded-full border border-jade/25 sm:inset-16" style={d(0.3)} />
        </div>

        <SideFrame side="left" src={HERO_LEFT} fig="Fig. 01" caption="Faciales" />
        <SideFrame side="right" src={HERO_RIGHT} fig="Fig. 02" caption="Bienestar" />

        <p className="rise eyebrow text-jade-ink" style={d(0)}>
          Mesoterapia &amp; Spa · Torreón
        </p>
        <div className="rise mt-6" style={d(0.05)}>
          <Lotus draw className="mx-auto h-16 w-16 text-jade-ink sm:h-20 sm:w-20" strokeWidth={1.6} />
        </div>
        <h1 id="hero-titulo" className="display mt-4 text-[clamp(3.4rem,15.5vw,11rem)] uppercase leading-[0.9] tracking-[0.06em]">
          <span className="line">
            <span style={d(0.15)}>Reduzen</span>
          </span>
          <span className="sr-only"> — Mesoterapia y spa en Torreón</span>
        </h1>
        <p className="rise mt-4 font-serif text-3xl italic text-jade-500 sm:text-5xl" style={d(0.3)}>
          Florece desde adentro
        </p>
        <div className="rise mt-10 flex w-full flex-col items-stretch justify-center gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-8" style={d(0.45)}>
          <WhatsAppButton message={waMessages.hero} size="lg">
            Agenda tu cita
          </WhatsAppButton>
          <Link href="#servicios" className="group inline-flex min-h-12 items-center justify-center gap-2 text-sm font-semibold tracking-wide text-ink">
            <span className="link-draw">Ver servicios</span>
            <ArrowIcon size={18} className="rotate-90 transition-transform duration-500 group-hover:translate-y-1" />
          </Link>
        </div>
      </div>

      {/* Índice de categorías */}
      <nav aria-label="Categorías" className="rise border-y border-ink/15 bg-cream-50" style={d(0.7)}>
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
