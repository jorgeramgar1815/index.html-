import { fullAddress, site } from "@/content/site";
import { waMessages } from "@/lib/whatsapp";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "./Icons";
import { Lotus } from "./Lotus";
import { Reveal } from "./Motion";
import { Branch, Sparkles } from "./Section";
import { WhatsAppButton } from "./WhatsAppButton";

/** Bloque de cierre: mensaje emocional + datos de contacto + mapa. */
export function CTASection({ withMap = true }: { withMap?: boolean }) {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=16&output=embed`;
  return (
    <section id="contacto" aria-labelledby="contacto-titulo" className="relative overflow-hidden bg-cream-100 pb-40 pt-20 sm:pt-28 lg:pb-48">
      <Branch className="pointer-events-none absolute -right-10 -top-6 w-56 rotate-90 text-jade-ink/20 sm:w-72" />
      <Sparkles />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:px-10">
        <Reveal>
          <Lotus className="h-12 w-12 text-jade-ink" />
          <p className="script mt-5 text-5xl text-jade-ink sm:text-6xl" aria-hidden>
            Este es tu momento
          </p>
          <h2 id="contacto-titulo" className="mt-2 text-[2.4rem] leading-[1.08] text-navy sm:text-5xl">
            Reserva tu espacio y florece desde adentro
          </h2>
          <p className="mt-5 max-w-lg text-[1.02rem] leading-relaxed text-stone">
            Escríbenos por WhatsApp y te ayudamos a elegir el tratamiento ideal para ti. Respondemos en horario de
            atención.
          </p>
          <WhatsAppButton message={waMessages.closing} size="lg" className="mt-8 w-full sm:w-auto">
            Agenda tu cita por WhatsApp
          </WhatsAppButton>

          <ul className="mt-10 grid gap-6 text-[0.95rem] sm:grid-cols-2">
            <li className="flex gap-3">
              <PinIcon size={22} className="mt-0.5 shrink-0 text-gold-ink" />
              <div>
                <p className="eyebrow text-navy">Dirección</p>
                <div className="mt-1.5 leading-relaxed text-stone">
                  {fullAddress}
                  <span className="mt-1 block text-sm">{site.address.between}</span>
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <ClockIcon size={22} className="mt-0.5 shrink-0 text-gold-ink" />
              <div>
                <p className="eyebrow text-navy">Horario</p>
                {/* PLACEHOLDER: horario a confirmar con la clienta (content/site.ts) */}
                <div className="mt-1.5 text-stone" data-placeholder={site.hoursConfirmed ? undefined : "horario-por-confirmar"}>
                  <ul className="space-y-0.5">
                    {site.hours.map((h) => (
                      <li key={h.days}>
                        {h.days}: <span className="text-navy">{h.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <PhoneIcon size={22} className="mt-0.5 shrink-0 text-gold-ink" />
              <div>
                <p className="eyebrow text-navy">Teléfono</p>
                <div className="mt-1.5">
                  <a href={`tel:${site.phoneE164}`} className="text-stone underline-offset-4 hover:text-navy hover:underline">
                    {site.phoneDisplay}
                  </a>
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <MailIcon size={22} className="mt-0.5 shrink-0 text-gold-ink" />
              <div>
                <p className="eyebrow text-navy">Correo</p>
                <div className="mt-1.5">
                  <a href={`mailto:${site.email}`} className="break-all text-stone underline-offset-4 hover:text-navy hover:underline">
                    {site.email}
                  </a>
                </div>
              </div>
            </li>
          </ul>
        </Reveal>

        {withMap && (
          <Reveal delay={0.15} className="relative">
            <div className="absolute -inset-3 rounded-[36px] border border-gold/40 sm:-inset-4" aria-hidden />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-sand shadow-lift lg:aspect-[4/5]">
              {/* Fondo de marca visible mientras carga el mapa */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_40%,#fbf8f2,#e8dcc8)] px-8 text-center" aria-hidden>
                <Lotus className="h-14 w-14 text-jade-ink" />
                <p className="font-serif text-xl text-navy">{site.address.neighborhood}</p>
                <p className="text-sm text-stone">{site.address.city}, {site.address.region}</p>
              </div>
              <iframe
                title="Mapa: ubicación de Reduzen en Torreón"
                src={mapSrc}
                className="relative h-full w-full border-0 grayscale-[35%] sepia-[15%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium tracking-wide text-jade-ink underline-offset-4 hover:underline"
            >
              <PinIcon size={18} />
              Cómo llegar en Google Maps
            </a>
          </Reveal>
        )}
      </div>
    </section>
  );
}
