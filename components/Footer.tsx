import Link from "next/link";
import { categories } from "@/content/services";
import { pageLinks, site } from "@/content/site";
import { waLink, waMessages } from "@/lib/whatsapp";
import { ArrowIcon } from "./Icons";

export function Footer() {
  const year = new Date().getFullYear();
  const social = [
    { label: "Facebook", href: site.social.facebook },
    ...(site.social.instagram ? [{ label: "Instagram", href: site.social.instagram }] : []),
    { label: "WhatsApp", href: waLink(waMessages.general) },
  ];
  return (
    <footer className="on-dark overflow-hidden bg-night text-cream">
      <div className="mx-auto max-w-[88rem] px-5 pt-20 sm:px-8">
        {/* Llamado final */}
        <a
          href={waLink(waMessages.general)}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-end justify-between gap-6 border-b border-cream/15 pb-10"
        >
          <span className="display text-4xl text-cream sm:text-6xl lg:text-7xl">
            ¿Lista para <em className="text-gold">tu momento?</em>
          </span>
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-cream/30 transition-all duration-500 group-hover:border-gold group-hover:bg-gold group-hover:text-night sm:h-24 sm:w-24">
            <ArrowIcon size={28} className="-rotate-45 transition-transform duration-500 group-hover:rotate-0" />
          </span>
          <span className="sr-only"> Escríbenos por WhatsApp</span>
        </a>

        <div className="grid grid-cols-2 gap-10 py-14 lg:grid-cols-4">
          <nav aria-label="Servicios">
            <h2 className="eyebrow !font-sans !text-gold">Servicios</h2>
            <ul className="mt-5 space-y-2.5 text-cream/80">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/servicios/#${c.slug}`} className="link-draw hover:text-cream">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Reduzen">
            <h2 className="eyebrow !font-sans !text-gold">Reduzen</h2>
            <ul className="mt-5 space-y-2.5 text-cream/80">
              <li>
                <Link href="/" className="link-draw hover:text-cream">
                  Inicio
                </Link>
              </li>
              {pageLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-draw hover:text-cream">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/#contacto" className="link-draw hover:text-cream">
                  Ubicación
                </Link>
              </li>
            </ul>
          </nav>
          <div className="col-span-2 lg:col-span-1">
            <h2 className="eyebrow !font-sans !text-gold">Visítanos</h2>
            <address className="mt-5 not-italic leading-relaxed text-cream/80">
              {site.address.street}
              <br />
              {site.address.neighborhood}
              <br />
              {site.address.city}, {site.address.region} {site.address.postalCode}
            </address>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <h2 className="eyebrow !font-sans !text-gold">Contacto</h2>
            <ul className="mt-5 space-y-2.5 text-cream/80">
              <li>
                <a href={`tel:${site.phoneE164}`} className="link-draw hover:text-cream">
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="link-draw break-all hover:text-cream">
                  {site.email}
                </a>
              </li>
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-draw hover:text-cream">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Wordmark gigante a todo el ancho (SVG decorativo) */}
      <svg aria-hidden viewBox="0 15 1000 100" className="block w-full select-none">
        <text
          x="500"
          y="232"
          textAnchor="middle"
          textLength="980"
          lengthAdjust="spacingAndGlyphs"
          fill="rgb(247 243 236 / 0.07)"
          style={{ fontFamily: "var(--font-display)", fontSize: 300 }}
        >
          Reduzen
        </text>
      </svg>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-3 px-5 py-6 pb-24 text-xs tracking-wide text-cream/60 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:pb-6">
          <p>
            © {year} {site.fullName}
          </p>
          {/* PLACEHOLDER: enlazar al aviso de privacidad definitivo */}
          <Link href="/aviso-de-privacidad/" className="link-draw hover:text-cream">
            Aviso de privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
