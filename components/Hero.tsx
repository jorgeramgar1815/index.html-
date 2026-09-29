import Link from "next/link";
import type { CSSProperties } from "react";
import { waMessages } from "@/lib/whatsapp";
import { Bubbles } from "./Decor";
import { ArrowIcon } from "./Icons";
import { Lotus } from "./Lotus";
import { WhatsAppButton } from "./WhatsAppButton";

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/** Portada centrada: nombre del spa, loto, lema y CTA. */
export function Hero() {
  return (
    <section aria-labelledby="hero-titulo" className="relative isolate overflow-hidden bg-cream">
      <div className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center px-5 pb-16 pt-28 text-center">
        <Bubbles count={9} />

        {/* Anillos dorado y turquesa detrás del nombre */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="rise h-[30rem] w-[30rem] rounded-full border border-gold/30 sm:h-[38rem] sm:w-[38rem]" style={d(0.2)} />
          <div className="rise absolute inset-10 rounded-full border border-jade/25 sm:inset-14" style={d(0.3)} />
        </div>

        <p className="rise eyebrow text-jade-ink" style={d(0)}>
          Mesoterapia &amp; Spa · Torreón
        </p>
        <div className="rise mt-5" style={d(0.05)}>
          <Lotus draw className="mx-auto h-14 w-14 text-jade-ink sm:h-16 sm:w-16" strokeWidth={1.6} />
        </div>
        <h1 id="hero-titulo" className="display mt-3 text-[clamp(3rem,13vw,8.5rem)] uppercase leading-[0.9] tracking-[0.06em]">
          <span className="line">
            <span style={d(0.15)}>Reduzen</span>
          </span>
          <span className="sr-only"> — Mesoterapia y spa en Torreón</span>
        </h1>
        <p className="rise mt-3 font-serif text-2xl italic text-jade-500 sm:text-4xl" style={d(0.3)}>
          Florece desde adentro
        </p>
        <div className="rise mt-9 flex w-full flex-col items-stretch justify-center gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-8" style={d(0.45)}>
          <WhatsAppButton message={waMessages.hero} size="lg">
            Agenda tu cita
          </WhatsAppButton>
          <Link href="#servicios" className="group inline-flex min-h-12 items-center justify-center gap-2 text-sm font-semibold tracking-wide text-ink">
            <span className="link-draw">Ver servicios</span>
            <ArrowIcon size={18} className="rotate-90 transition-transform duration-500 group-hover:translate-y-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
