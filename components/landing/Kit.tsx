import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { waLink, waMessages } from "@/lib/whatsapp";
import { ArrowIcon, ClockIcon, FacebookIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "../Icons";
import { Lotus, Wordmark } from "../Lotus";
import { Reveal } from "../Motion";
import { MobileMenu } from "./MobileMenu";

/* =========================================================
   Piezas del sitio (estilo "spa boutique"):
   botones rectangulares con letra espaciada, títulos con
   ornamento de loto, cabecera con logo al centro.
   ========================================================= */

type BtnVariant = "jade" | "gold" | "line" | "light";

const btn: Record<BtnVariant, string> = {
  // Jade profundo + blanco (5.9:1)
  jade: "bg-jade-ink text-white hover:bg-ink",
  // Dorado + marino (7.4:1)
  gold: "bg-gold text-night hover:bg-gold-soft",
  line: "border border-ink/40 text-ink hover:border-ink hover:bg-ink hover:text-cream-50",
  light: "border border-cream/50 text-cream hover:bg-cream hover:text-night",
};

const btnBase =
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-[3px] text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-300";

/** Botón de WhatsApp con mensaje prellenado. */
export function SpaButton({
  message = waMessages.general,
  children,
  variant = "jade",
  className = "",
  icon = true,
}: {
  message?: string;
  children: ReactNode;
  variant?: BtnVariant;
  className?: string;
  icon?: boolean;
}) {
  return (
    <a href={waLink(message)} target="_blank" rel="noopener noreferrer" className={`${btnBase} h-[3.25rem] px-7 ${btn[variant]} ${className}`}>
      {icon && <WhatsAppIcon size={18} />}
      {children}
      <span className="sr-only"> (abre WhatsApp en una pestaña nueva)</span>
    </a>
  );
}

/** Botón interno (anclas o páginas). */
export function SpaLink({ href, children, variant = "line", className = "" }: { href: string; children: ReactNode; variant?: BtnVariant; className?: string }) {
  return (
    <a href={href} className={`group ${btnBase} h-[3.25rem] px-7 ${btn[variant]} ${className}`}>
      {children}
      <ArrowIcon size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  );
}

/** Eyebrow con filetes dorados a los lados. */
export function Ornament({
  children,
  dark = false,
  align = "center",
  className = "",
}: {
  children: ReactNode;
  dark?: boolean;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <p className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""} ${dark ? "text-gold-pale" : "text-gold-ink"} ${className}`}>
      {align === "center" && <span aria-hidden className="h-px w-8 bg-gold/70" />}
      <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]">{children}</span>
      <span aria-hidden className="h-px w-8 bg-gold/70" />
    </p>
  );
}

/** Título de sección con loto, eyebrow y titular serif. */
export function SpaTitle({
  id,
  eyebrow,
  title,
  intro,
  dark = false,
  align = "center",
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  dark?: boolean;
  align?: "center" | "left";
}) {
  const center = align === "center";
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      {center && <Lotus className={`mx-auto mb-4 h-8 w-8 ${dark ? "text-jade" : "text-jade-ink"}`} />}
      <Ornament dark={dark} align={align}>
        {eyebrow}
      </Ornament>
      <h2 id={id} className={`mt-4 text-[1.9rem] leading-[1.08] sm:text-[2.6rem] ${dark ? "!text-cream" : ""}`}>
        {title}
      </h2>
      {intro && <p className={`mt-4 text-[0.95rem] leading-relaxed ${dark ? "text-cream/75" : "text-stone"}`}>{intro}</p>}
    </Reveal>
  );
}

// Rutas absolutas para que funcionen desde cualquier página
const navLeft = [
  { href: "/#menu", label: "Tratamientos" },
  { href: "/#rituales", label: "Rituales" },
  { href: "/servicios/", label: "Catálogo" },
] as const;
const navRight = [
  { href: "/nosotros/", label: "Nosotros" },
  { href: "/#reserva", label: "Horario" },
] as const;

function NavList({ items }: { items: readonly { href: string; label: string }[] }) {
  return (
    <ul className="flex items-center gap-8">
      {items.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink/75 transition-colors hover:text-jade-ink">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Barra superior de datos + cabecera con logo al centro. */
export function SiteHeader() {
  return (
    <>
      <div className="hidden bg-jade-ink text-[0.72rem] text-white/90 md:block">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-6">
          <span className="flex items-center gap-2">
            <PinIcon size={14} /> {site.address.neighborhood}, {site.address.city}
          </span>
          {/* PLACEHOLDER: horario a confirmar con la clienta */}
          <span className="flex items-center gap-2">
            <ClockIcon size={14} /> {site.hours[0].days} {site.hours[0].time}
          </span>
          <a href={`tel:${site.phoneE164}`} className="flex items-center gap-2 hover:text-white">
            <PhoneIcon size={14} /> {site.phoneDisplay}
          </a>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-gold/25 bg-cream-50/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <nav aria-label="Secciones" className="hidden lg:block">
            <NavList items={navLeft} />
          </nav>
          <Link href="/" aria-label="Reduzen, ir al inicio" className="lg:justify-self-center">
            <Wordmark />
          </Link>
          <div className="flex items-center justify-end gap-2 lg:gap-8">
            <nav aria-label="Más secciones" className="hidden lg:block">
              <NavList items={navRight} />
            </nav>
            <a
              href={waLink(waMessages.header)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnBase} h-10 px-4 ${btn.jade}`}
            >
              <WhatsAppIcon size={16} /> Reservar
              <span className="sr-only"> por WhatsApp (abre una pestaña nueva)</span>
            </a>
            <MobileMenu links={[...navLeft, ...navRight]} />
          </div>
        </div>
      </header>
    </>
  );
}

/** Pie centrado. */
export function SiteFooter() {
  return (
    <footer className="bg-night text-center text-cream/70">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Lotus className="mx-auto h-10 w-10 text-jade" />
        <p className="mt-3 font-serif text-3xl text-cream">Reduzen</p>
        <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-pale">Mesoterapia & Spa</p>
        <p className="mx-auto mt-6 max-w-md text-sm">
          {site.address.street}, {site.address.neighborhood}, {site.address.city}
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
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
            <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-cream">
              <FacebookIcon size={16} /> Facebook
            </a>
          </li>
        </ul>
      </div>
      <p className="border-t border-cream/10 py-5 text-xs">© {new Date().getFullYear()} Reduzen — Mesoterapia & Spa · Torreón, Coahuila</p>
    </footer>
  );
}

export { Wordmark };
