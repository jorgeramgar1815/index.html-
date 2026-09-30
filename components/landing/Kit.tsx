import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { waLink, waMessages } from "@/lib/whatsapp";
import { ArrowIcon, CheckIcon, FacebookIcon, WhatsAppIcon } from "../Icons";
import { Wordmark } from "../Lotus";
import { Reveal } from "../Motion";

/* =========================================================
   Piezas de la landing (prototipo 2): botones píldora,
   títulos centrados, cabecera y pie compactos.
   ========================================================= */

type PillVariant = "jade" | "gold" | "ghost" | "light";

const pill: Record<PillVariant, string> = {
  // Jade profundo + blanco (5.9:1)
  jade: "bg-jade-ink text-white shadow-[0_14px_30px_-14px_rgba(31,111,108,.8)] hover:bg-ink",
  // Dorado + marino (7.4:1)
  gold: "bg-gold text-night shadow-[0_14px_30px_-14px_rgba(201,162,75,.9)] hover:bg-gold-soft",
  ghost: "border border-ink/20 bg-white/60 text-ink hover:border-ink hover:bg-white",
  light: "border border-cream/30 text-cream hover:bg-cream hover:text-night",
};

/** CTA píldora de WhatsApp con mensaje prellenado. */
export function PillCTA({
  message = waMessages.general,
  children,
  variant = "jade",
  size = "md",
  className = "",
}: {
  message?: string;
  children: ReactNode;
  variant?: PillVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "h-10 px-4 text-[0.8rem] gap-2", md: "h-12 px-6 text-sm gap-2.5", lg: "h-14 px-7 text-[0.95rem] gap-3" }[size];
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold transition-all duration-300 hover:-translate-y-0.5 ${sizes} ${pill[variant]} ${className}`}
    >
      <WhatsAppIcon size={size === "sm" ? 16 : 20} />
      {children}
      <span className="sr-only"> (abre WhatsApp en una pestaña nueva)</span>
    </a>
  );
}

/** Enlace píldora interno (anclas). */
export function PillLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`group inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${pill.ghost} ${className}`}
    >
      {children}
      <ArrowIcon size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  );
}

/** Etiqueta pequeña tipo chip. */
export function Badge({ children, tone = "jade", className = "" }: { children: ReactNode; tone?: "jade" | "gold" | "night"; className?: string }) {
  const tones = {
    jade: "bg-jade/15 text-jade-ink",
    gold: "bg-gold/20 text-gold-ink",
    night: "bg-gold text-night",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] ${tones} ${className}`}>
      {children}
    </span>
  );
}

/** Título de sección centrado: chip + titular + bajada corta. */
export function Title({
  id,
  badge,
  title,
  intro,
  dark = false,
  align = "center",
}: {
  id: string;
  badge: string;
  title: ReactNode;
  intro?: ReactNode;
  dark?: boolean;
  align?: "center" | "left";
}) {
  const center = align === "center";
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <Badge tone={dark ? "night" : "jade"}>{badge}</Badge>
      <h2 id={id} className={`mt-4 text-[1.75rem] leading-[1.1] sm:text-[2.35rem] ${dark ? "!text-cream" : ""}`}>
        {title}
      </h2>
      {intro && <p className={`mt-3 text-[0.95rem] leading-relaxed ${dark ? "text-cream/75" : "text-stone"}`}>{intro}</p>}
    </Reveal>
  );
}

/** Lista con palomitas. */
export function Checks({ items, dark = false, className = "" }: { items: readonly string[]; dark?: boolean; className?: string }) {
  return (
    <ul className={`space-y-2.5 ${className}`}>
      {items.map((t) => (
        <li key={t} className={`flex items-center gap-3 text-[0.95rem] ${dark ? "text-cream/90" : "text-ink"}`}>
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${dark ? "bg-gold text-night" : "bg-jade/20 text-jade-ink"}`}>
            <CheckIcon size={14} strokeWidth={2.2} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

export const landingNav = [
  { href: "#servicios", label: "Servicios" },
  { href: "#promo", label: "Promo" },
  { href: "#como-agendar", label: "Cómo agendar" },
  { href: "#resultados", label: "Resultados" },
  { href: "#preguntas", label: "Preguntas" },
] as const;

/** Barra de aviso + cabecera fija con CTA siempre visible. */
export function LandingHeader() {
  return (
    <>
      {/* PLACEHOLDER: promo vista en Facebook; confirmar vigencia */}
      <a
        href="#promo"
        className="block bg-night px-4 py-2 text-center text-[0.75rem] font-medium tracking-wide text-cream transition-colors hover:text-gold-soft"
      >
        <span className="text-gold">✦</span> Promo del mes: <strong className="font-semibold">Hydrafacial desde $499</strong>
        <span className="hidden sm:inline"> · Cupo limitado</span> <span aria-hidden>→</span>
      </a>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
          <a href="#inicio" aria-label="Reduzen, ir al inicio">
            <Wordmark />
          </a>
          <nav aria-label="Secciones" className="hidden lg:block">
            <ul className="flex items-center gap-7 text-[0.85rem] font-medium text-ink/80">
              {landingNav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition-colors hover:text-jade-ink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <PillCTA message={waMessages.header} size="sm" className="sm:h-11 sm:px-5 sm:text-sm">
            Agendar cita
          </PillCTA>
        </div>
      </header>
    </>
  );
}

/** Pie compacto. */
export function LandingFooter() {
  return (
    <footer className="bg-night text-cream/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
        <div>
          <Wordmark light />
          <p className="mt-3 text-sm">
            {site.address.street}, {site.address.neighborhood}, {site.address.city}
          </p>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <li>
            <Link href="/servicios/" className="hover:text-cream">Catálogo</Link>
          </li>
          <li>
            <Link href="/nosotros/" className="hover:text-cream">Nosotros</Link>
          </li>
          <li>
            <Link href="/aviso-de-privacidad/" className="hover:text-cream">Aviso de privacidad</Link>
          </li>
          <li>
            <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 hover:border-cream hover:text-cream">
              <FacebookIcon size={18} />
              <span className="sr-only">Facebook de Reduzen</span>
            </a>
          </li>
        </ul>
      </div>
      <p className="border-t border-cream/10 py-5 text-center text-xs">© {new Date().getFullYear()} Reduzen — Mesoterapia & Spa · Torreón, Coahuila</p>
    </footer>
  );
}
