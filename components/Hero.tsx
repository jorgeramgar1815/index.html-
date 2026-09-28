import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { waMessages } from "@/lib/whatsapp";
import { ArtFrame, type ArtVariant } from "./ArtFrame";
import { Aurora, Bubbles, Star } from "./Decor";
import { PointerParallax } from "./Effects";
import { ArrowIcon, HandIcon, PinIcon, SparkleIcon } from "./Icons";
import { Lotus } from "./Lotus";
import { Branch } from "./Section";
import { SectionDivider } from "./SectionDivider";
import { WhatsAppButton } from "./WhatsAppButton";

// PLACEHOLDER: fotos reales para los arcos flotantes del hero (retrato spa / tratamiento facial)
const HERO_LEFT: string | null = null;
const HERO_RIGHT: string | null = null;

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/** Capa que sigue al mouse (profundidad = px de desplazamiento máximo). */
function Depth({ depth, className = "", children }: { depth: number; className?: string; children: ReactNode }) {
  return (
    <div
      className={`transition-[translate] duration-700 ease-out ${className}`}
      style={{ translate: `calc(var(--px, 0) * ${depth}px) calc(var(--py, 0) * ${depth * 0.7}px)` }}
    >
      {children}
    </div>
  );
}

function FloatingArch({
  variant,
  src,
  alt,
  rotate,
  delay,
  className,
}: {
  variant: ArtVariant;
  src: string | null;
  alt: string;
  rotate: number;
  delay: number;
  className: string;
}) {
  return (
    <div className={`rise ${className}`} style={d(delay)}>
      <div className="animate-float-tilt" style={{ "--r": `${rotate}deg`, animationDelay: `${-delay * 3}s` } as CSSProperties}>
        <div className="relative">
          <div className="absolute -inset-2.5 rounded-[999px_999px_30px_30px] border border-gold/50" aria-hidden />
          <ArtFrame variant={variant} src={src} alt={alt} className="aspect-[3/4] w-full rounded-[999px_999px_24px_24px] shadow-lift" />
        </div>
      </div>
    </div>
  );
}

/** Emblema: loto que se dibuja dentro de un anillo de texto que gira. */
function Emblem() {
  return (
    <div className="rise relative mx-auto h-32 w-32 sm:h-36 sm:w-36" aria-hidden>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow text-gold-ink">
        <defs>
          <path id="anillo" d="M100 100m-84 0a84 84 0 1 1 168 0a84 84 0 1 1-168 0" />
        </defs>
        <text fontSize="12.5" letterSpacing="3" fill="currentColor" style={{ fontFamily: "var(--font-jost)" }}>
          <textPath href="#anillo" textLength="520" lengthAdjust="spacing">
            MESOTERAPIA &amp; SPA ✦ TORREÓN ✦ BIENESTAR ✦
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[21%] flex items-center justify-center rounded-full bg-cream-50 shadow-[0_0_0_6px_rgba(201,162,75,.08),0_18px_40px_-16px_rgba(27,42,74,.35)] ring-1 ring-gold/40">
        <Lotus draw className="w-[62%] text-jade-ink" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-titulo" className="relative isolate overflow-hidden bg-cream">
      <PointerParallax className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pb-28 pt-28 text-center sm:pb-32">
        <Aurora />
        <Bubbles count={10} />

        {/* Ramas en las esquinas */}
        <Depth depth={-14} className="pointer-events-none absolute -left-10 top-20 w-40 text-jade-ink/25 sm:w-56">
          <Branch />
        </Depth>
        <Depth depth={-14} className="pointer-events-none absolute -right-10 bottom-24 w-40 -scale-x-100 rotate-180 text-jade-ink/25 sm:w-56">
          <Branch />
        </Depth>

        {/* Arcos flotantes (desktop) */}
        <Depth depth={-26} className="pointer-events-none absolute left-[2%] top-[20%] hidden w-40 lg:block xl:left-[4%] xl:w-52">
          <FloatingArch variant="facial" src={HERO_LEFT} alt="Tratamiento facial con burbujas en Reduzen" rotate={-7} delay={0.45} className="" />
        </Depth>
        <Depth depth={-18} className="pointer-events-none absolute left-[13%] bottom-[16%] hidden w-24 lg:block xl:left-[16%]">
          <div className="rise" style={d(0.7)}>
            <ArtFrame variant="nails" alt="Detalle de manicure" className="aspect-square w-full animate-float rounded-full shadow-lift ring-4 ring-cream-50" />
          </div>
        </Depth>
        <Depth depth={-26} className="pointer-events-none absolute right-[2%] top-[26%] hidden w-40 lg:block xl:right-[4%] xl:w-52">
          <FloatingArch variant="portrait" src={HERO_RIGHT} alt="Mujer relajada con piel luminosa" rotate={7} delay={0.55} className="" />
        </Depth>
        <Depth depth={-18} className="pointer-events-none absolute right-[14%] top-[14%] hidden w-20 lg:block xl:right-[17%]">
          <div className="rise" style={d(0.8)}>
            <ArtFrame variant="pedicure" alt="Ritual de pedicure" className="aspect-square w-full animate-float rounded-full shadow-lift ring-4 ring-cream-50 [animation-delay:-3s]" />
          </div>
        </Depth>

        {/* Destellos */}
        <Depth depth={20} className="pointer-events-none absolute inset-0" >
          <Star className="absolute left-[22%] top-[24%] h-4 w-4 animate-twinkle text-gold" />
          <Star className="absolute right-[26%] top-[62%] h-3 w-3 animate-twinkle text-gold [animation-delay:1.4s]" />
          <Star className="absolute left-[30%] bottom-[20%] h-2.5 w-2.5 animate-twinkle text-gold [animation-delay:2.4s]" />
        </Depth>

        <Depth depth={8} className="relative z-10 mx-auto max-w-3xl">
          <Emblem />
          <p className="rise script mt-6 text-[3.1rem] text-jade-ink sm:text-7xl" style={d(0.1)} aria-hidden>
            Este es tu momento
          </p>
          <h1 id="hero-titulo" className="rise mt-1 text-[3.3rem] leading-[0.98] text-navy sm:text-7xl xl:text-[5.6rem]" style={d(0.18)}>
            Florece <em className="text-shine font-normal italic">desde adentro</em>
            <span className="sr-only"> — Reduzen, mesoterapia y spa en Torreón</span>
          </h1>
          <p className="rise mx-auto mt-6 max-w-xl text-[1.08rem] leading-relaxed text-stone sm:text-lg" style={d(0.28)}>
            Faciales, corporales, uñas, pedicure y láser con la calma de un spa boutique en Torreón.
          </p>
          <div className="rise mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center" style={d(0.38)}>
            <WhatsAppButton message={waMessages.hero} size="lg">
              Agenda tu cita
            </WhatsAppButton>
            <Link
              href="#servicios"
              className="btn-shine inline-flex min-h-14 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-navy/20 bg-cream-50/60 px-7 text-[0.95rem] font-medium tracking-wide text-navy backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-glow"
            >
              Ver tratamientos
              <ArrowIcon size={18} />
            </Link>
          </div>
          <ul className="rise mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-stone" style={d(0.5)}>
            <li className="inline-flex items-center gap-2">
              <SparkleIcon size={18} className="text-gold-ink" /> Tecnología de vanguardia
            </li>
            <li className="inline-flex items-center gap-2">
              <HandIcon size={18} className="text-gold-ink" /> Atención personalizada
            </li>
            <li className="inline-flex items-center gap-2">
              <PinIcon size={18} className="text-gold-ink" /> Hacienda Residencial
            </li>
          </ul>
        </Depth>

        {/* Indicador de scroll */}
        <Link
          href="#servicios"
          aria-label="Bajar a servicios"
          className="rise absolute bottom-20 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-stone sm:flex"
          style={d(0.9)}
        >
          <span className="flex h-9 w-5 justify-center rounded-full border border-navy/30 pt-1.5">
            <span className="h-1.5 w-1 rounded-full bg-gold [animation:scroll-dot_1.8s_ease-in-out_infinite]" />
          </span>
          Descubre
        </Link>
      </PointerParallax>
      <SectionDivider fill="var(--color-cream-50)" accent="rgba(201,162,75,.2)" animated className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
