import Link from "next/link";
import { categories } from "@/content/services";
import { fullAddress, pageLinks, site } from "@/content/site";
import { waLink, waMessages } from "@/lib/whatsapp";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./Icons";
import { Wordmark } from "./Lotus";
import { SectionDivider } from "./SectionDivider";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark relative bg-night text-cream">
      <div className="absolute inset-x-0 -top-px -translate-y-full">
        <SectionDivider fill="var(--color-night)" accent="rgba(58,166,160,.22)" />
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-12 px-5 pb-10 pt-14 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:px-10 lg:pt-16">
        <div className="col-span-2 lg:col-span-1">
          <Wordmark light />
          <p className="mt-6 max-w-xs text-[0.95rem] leading-relaxed text-cream/75">{site.message}</p>
          <div className="mt-6 flex gap-3">
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Reduzen en Facebook"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:text-gold"
            >
              <FacebookIcon size={20} />
            </a>
            {site.social.instagram && (
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Reduzen en Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:text-gold"
              >
                <InstagramIcon size={20} />
              </a>
            )}
            <a
              href={waLink(waMessages.general)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Reduzen en WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:text-gold"
            >
              <WhatsAppIcon size={20} />
            </a>
          </div>
        </div>

        <nav aria-label="Servicios">
          <h2 className="eyebrow text-gold">Servicios</h2>
          <ul className="mt-5 space-y-3 text-[0.95rem] text-cream/80">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/servicios/#${c.slug}`} className="transition-colors hover:text-gold">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Reduzen">
          <h2 className="eyebrow text-gold">Reduzen</h2>
          <ul className="mt-5 space-y-3 text-[0.95rem] text-cream/80">
            <li>
              <Link href="/" className="transition-colors hover:text-gold">
                Inicio
              </Link>
            </li>
            {pageLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#testimonios" className="transition-colors hover:text-gold">
                Testimonios
              </Link>
            </li>
            <li>
              <Link href="/#contacto" className="transition-colors hover:text-gold">
                Ubicación
              </Link>
            </li>
          </ul>
        </nav>

        <div className="col-span-2 lg:col-span-1">
          <h2 className="eyebrow text-gold">Contacto</h2>
          <address className="mt-5 space-y-4 text-[0.95rem] not-italic text-cream/80">
            <p className="flex gap-3">
              <PinIcon size={20} className="mt-0.5 shrink-0 text-jade" />
              <span>
                {fullAddress}
                <span className="mt-1 block text-sm text-cream/60">{site.address.between}</span>
              </span>
            </p>
            <p>
              <a href={`tel:${site.phoneE164}`} className="flex gap-3 transition-colors hover:text-gold">
                <PhoneIcon size={20} className="shrink-0 text-jade" />
                {site.phoneDisplay}
              </a>
            </p>
            <p>
              <a href={`mailto:${site.email}`} className="flex gap-3 break-all transition-colors hover:text-gold">
                <MailIcon size={20} className="shrink-0 text-jade" />
                {site.email}
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 pb-24 text-xs tracking-wide text-cream/60 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-6 lg:px-10">
          <p>
            © {year} {site.fullName}. Torreón, Coahuila.
          </p>
          {/* PLACEHOLDER: enlazar al aviso de privacidad definitivo */}
          <Link href="/aviso-de-privacidad/" className="underline-offset-4 hover:text-gold hover:underline">
            Aviso de privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
