import Link from "next/link";
import type { ReactNode } from "react";
import { categories } from "@/content/services";
import { site } from "@/content/site";
import { waLink, waMessages } from "@/lib/whatsapp";
import { ArtFrame, type ArtVariant } from "../ArtFrame";
import { ArrowIcon, ClockIcon, FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "../Icons";
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
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-[3px] text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-300";

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
    <a href={waLink(message)} target="_blank" rel="noopener noreferrer" className={`${btnBase} h-14 px-8 ${btn[variant]} ${className}`}>
      {icon && <WhatsAppIcon size={18} />}
      {children}
      <span className="sr-only"> (abre WhatsApp en una pestaña nueva)</span>
    </a>
  );
}

/** Botón interno (anclas o páginas). */
export function SpaLink({ href, children, variant = "line", className = "" }: { href: string; children: ReactNode; variant?: BtnVariant; className?: string }) {
  return (
    <a href={href} className={`group ${btnBase} h-14 px-8 ${btn[variant]} ${className}`}>
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
      {align === "center" && <span aria-hidden className="h-px w-5 shrink-0 bg-gold/70 sm:w-8" />}
      <span className="whitespace-nowrap text-[0.7rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.74rem] sm:tracking-[0.24em]">{children}</span>
      <span aria-hidden className="h-px w-5 shrink-0 bg-gold/70 sm:w-8" />
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
      <h2 id={id} className={`mt-4 text-[2.1rem] leading-[1.08] sm:text-[3rem] ${dark ? "!text-cream" : ""}`}>
        {title}
      </h2>
      {intro && <p className={`mt-4 text-[1.06rem] leading-relaxed ${dark ? "text-cream/75" : "text-stone"}`}>{intro}</p>}
    </Reveal>
  );
}

/** Imagen con marco cuadrado: filete dorado desplazado detrás de la foto. */
export function Framed({
  variant,
  alt,
  src = null,
  className = "",
  frameClassName = "",
  offset = "br",
  priority = false,
  children,
}: {
  variant: ArtVariant;
  alt: string;
  src?: string | null;
  className?: string;
  frameClassName?: string;
  /** Hacia dónde se desplaza el filete: abajo-derecha o arriba-izquierda. */
  offset?: "br" | "tl";
  priority?: boolean;
  children?: ReactNode;
}) {
  const shift = offset === "br" ? "translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4" : "-translate-x-3 -translate-y-3 sm:-translate-x-4 sm:-translate-y-4";
  return (
    <div className={`relative ${className}`}>
      <span aria-hidden className={`absolute inset-0 border border-gold/70 ${shift}`} />
      <ArtFrame variant={variant} src={src} alt={alt} priority={priority} className={`h-full w-full shadow-[0_30px_60px_-35px_rgba(27,42,74,.55)] ${frameClassName}`}>
        {children}
      </ArtFrame>
    </div>
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
  { href: "/#ubicacion", label: "Ubicación" },
] as const;

function NavList({ items }: { items: readonly { href: string; label: string }[] }) {
  return (
    <ul className="flex items-center gap-8">
      {items.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-ink/75 transition-colors hover:text-jade-ink">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Cabecera fija con el logo al centro y botón de WhatsApp siempre visible. */
export function SiteHeader() {
  return (
    <>
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

const footerNav = [
  { href: "/", label: "Inicio" },
  { href: "/#menu", label: "Tratamientos" },
  { href: "/#rituales", label: "Rituales" },
  { href: "/#resultados", label: "Resultados" },
  { href: "/servicios/", label: "Catálogo completo" },
  { href: "/nosotros/", label: "Nosotros" },
  { href: "/#ubicacion", label: "Ubicación y horario" },
] as const;

function FooterHeading({ children }: { children: ReactNode }) {
  return <h2 className="font-sans text-[0.74rem] font-semibold uppercase tracking-[0.22em] !text-gold-pale">{children}</h2>;
}

const social = "flex h-10 w-10 items-center justify-center border border-cream/20 text-cream/80 transition-colors hover:border-gold hover:text-gold";

/** Pie de página completo: llamada a la acción, marca, navegación, servicios, contacto y barra legal. */
export function SiteFooter() {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`;
  return (
    <footer className="on-dark bg-night text-cream/70">
      {/* Franja de llamada a la acción */}
      <div className="border-b border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
          <div>
            <p className="font-serif text-[1.9rem] leading-tight text-cream sm:text-[2.3rem]">
              ¿Lista para <em className="text-gold-pale">tu momento?</em>
            </p>
            <p className="mt-2 text-[1rem]">Reserva por WhatsApp y te confirmamos el horario disponible.</p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <SpaButton message={waMessages.closing} variant="gold">Reservar por WhatsApp</SpaButton>
            <a href={`tel:${site.phoneE164}`} className={`${btnBase} h-14 px-8 ${btn.light}`}>
              <PhoneIcon size={18} /> {site.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      {/* Columnas */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.35fr_1fr_1fr_1.35fr] lg:gap-10">
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" aria-label="Reduzen, ir al inicio" className="inline-block">
            <Wordmark light />
          </Link>
          <p className="mt-5 max-w-xs text-[0.98rem] leading-relaxed">
            Spa de mesoterapia y tratamientos estéticos en Torreón. Desconecta, renueva tu energía y florece desde adentro.
          </p>
          <ul className="mt-6 flex gap-2">
            <li>
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className={social}>
                <FacebookIcon size={18} />
                <span className="sr-only">Facebook de Reduzen</span>
              </a>
            </li>
            {site.social.instagram && (
              <li>
                <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className={social}>
                  <InstagramIcon size={18} />
                  <span className="sr-only">Instagram de Reduzen</span>
                </a>
              </li>
            )}
            <li>
              <a href={waLink(waMessages.floating)} target="_blank" rel="noopener noreferrer" className={social}>
                <WhatsAppIcon size={18} />
                <span className="sr-only">WhatsApp de Reduzen</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className={social}>
                <MailIcon size={18} />
                <span className="sr-only">Correo de Reduzen</span>
              </a>
            </li>
          </ul>
        </div>

        <nav aria-labelledby="pie-navegacion">
          <FooterHeading>
            <span id="pie-navegacion">Navegación</span>
          </FooterHeading>
          <ul className="mt-5 space-y-3 text-[0.98rem]">
            {footerNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-cream">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="pie-servicios">
          <FooterHeading>
            <span id="pie-servicios">Servicios</span>
          </FooterHeading>
          <ul className="mt-5 space-y-3 text-[0.98rem]">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/servicios/#${c.slug}`} className="transition-colors hover:text-cream">{c.name}</Link>
              </li>
            ))}
            <li>
              {/* PLACEHOLDER: promo vista en Facebook; confirmar vigencia */}
              <Link href="/#menu" className="text-gold-pale hover:text-white">
                Promo Hydrafacial $499 <ArrowIcon size={14} className="inline align-[-1px]" />
              </Link>
            </li>
          </ul>
        </nav>

        <div className="col-span-2 lg:col-span-1">
          <FooterHeading>Contacto</FooterHeading>
          <ul className="mt-5 space-y-4 text-[0.98rem]">
            <li className="flex gap-3">
              <PinIcon size={18} className="mt-0.5 shrink-0 text-gold" />
              <span>
                {site.address.street}, {site.address.neighborhood}
                <span className="block">
                  {site.address.city}, {site.address.region} · C.P. {site.address.postalCode}
                </span>
                <a href={maps} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-sm text-gold-pale hover:text-white">
                  Cómo llegar <ArrowIcon size={13} />
                </a>
              </span>
            </li>
            <li className="flex gap-3">
              <PhoneIcon size={18} className="mt-0.5 shrink-0 text-gold" />
              <a href={`tel:${site.phoneE164}`} className="hover:text-cream">{site.phoneDisplay}</a>
            </li>
            <li className="flex gap-3">
              <MailIcon size={18} className="mt-0.5 shrink-0 text-gold" />
              <a href={`mailto:${site.email}`} className="break-all hover:text-cream">{site.email}</a>
            </li>
            {/* PLACEHOLDER: horario a confirmar con la clienta */}
            <li className="flex gap-3" data-placeholder="horario-por-confirmar">
              <ClockIcon size={18} className="mt-0.5 shrink-0 text-gold" />
              <span>
                {site.hours.map((h) => (
                  <span key={h.days} className="block">
                    {h.days}: <span className="text-cream">{h.time}</span>
                  </span>
                ))}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Barra legal */}
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-center text-[0.8rem] sm:px-6 md:flex-row md:justify-between md:text-left">
          <p>© {new Date().getFullYear()} Reduzen — Mesoterapia & Spa. Todos los derechos reservados.</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <li>
              <Link href="/aviso-de-privacidad/" className="hover:text-cream">Aviso de privacidad</Link>
            </li>
            <li>Torreón, Coahuila, México</li>
            <li>
              <a href="#" className="inline-flex items-center gap-1.5 hover:text-cream">
                Volver arriba <ArrowIcon size={13} className="-rotate-90" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export { Wordmark };
