import type { ReactNode } from "react";
import { fullAddress, site } from "@/content/site";
import { waMessages } from "@/lib/whatsapp";
import { ClipReveal } from "./Effects";
import { Lotus } from "./Lotus";
import { Reveal } from "./Motion";
import { SectionHead } from "./Section";
import { WhatsAppButton } from "./WhatsAppButton";

/** Contacto: ficha de datos tipo colofón + mapa. */
export function CTASection({ withMap = true, number = "08" }: { withMap?: boolean; number?: string }) {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=16&output=embed`;
  const rows: { label: string; value: ReactNode; placeholder?: boolean }[] = [
    { label: "Dirección", value: <>{fullAddress}<span className="mt-1 block text-sm text-stone">{site.address.between}</span></> },
    {
      label: "Horario",
      // PLACEHOLDER: horario a confirmar con la clienta (content/site.ts)
      placeholder: !site.hoursConfirmed,
      value: (
        <ul>
          {site.hours.map((h) => (
            <li key={h.days} className="flex flex-wrap justify-between gap-x-4">
              <span className="text-stone">{h.days}</span>
              <span>{h.time}</span>
            </li>
          ))}
        </ul>
      ),
    },
    { label: "Teléfono", value: <a href={`tel:${site.phoneE164}`} className="link-draw">{site.phoneDisplay}</a> },
    { label: "Correo", value: <a href={`mailto:${site.email}`} className="link-draw break-all">{site.email}</a> },
  ];

  return (
    <section id="contacto" aria-labelledby="contacto-titulo" className="bg-cream-50 pb-28 pt-24 sm:pt-32">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <SectionHead id="contacto-titulo" number={number} label="Contacto" title="Reserva tu espacio." />

        <div className={`mt-16 grid grid-cols-1 gap-12 ${withMap ? "lg:grid-cols-12" : ""}`}>
          <Reveal className={withMap ? "lg:col-span-5" : "max-w-3xl"}>
            <ul className="border-t border-ink/15">
              {rows.map((r) => (
                <li
                  key={r.label}
                  className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 border-b border-ink/15 py-5 text-[1.02rem] text-ink sm:grid-cols-[8rem_minmax(0,1fr)]"
                  data-placeholder={r.placeholder ? "horario-por-confirmar" : undefined}
                >
                  <span className="eyebrow pt-1 text-gold-ink">{r.label}</span>
                  <span>{r.value}</span>
                </li>
              ))}
            </ul>
            <WhatsAppButton message={waMessages.closing} size="lg" className="mt-10 w-full">
              Agenda tu cita por WhatsApp
            </WhatsAppButton>
          </Reveal>

          {withMap && (
            <figure className="lg:col-span-7">
              <ClipReveal className="aspect-[4/3] bg-sand lg:aspect-auto lg:h-full lg:min-h-[32rem]" drift={0}>
                {/* Fondo de marca visible mientras carga el mapa */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cream-100 text-center" aria-hidden>
                  <Lotus className="h-14 w-14 text-jade-ink" />
                  <p className="font-serif text-2xl text-ink">{site.address.neighborhood}</p>
                </div>
                <iframe
                  title="Mapa: ubicación de Reduzen en Torreón"
                  src={mapSrc}
                  className="relative h-full w-full border-0 grayscale-[60%] sepia-[20%]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </ClipReveal>
              <figcaption className="mt-3 flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3">
                <span className="eyebrow text-gold-ink">Mapa</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-draw text-sm font-medium text-jade-ink"
                >
                  Cómo llegar en Google Maps ↗
                </a>
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
