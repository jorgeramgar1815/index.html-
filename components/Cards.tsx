import type { Treatment } from "@/content/services";
import { waLink, waMessages } from "@/lib/whatsapp";
import { ArtFrame } from "./ArtFrame";
import { ClipReveal } from "./Effects";
import { ArrowIcon, ClockIcon, WhatsAppIcon } from "./Icons";
import { Reveal, Stagger, StaggerItem } from "./Motion";
import { WhatsAppButton } from "./WhatsAppButton";

export function Chips({ items, dark = false }: { items?: string[]; dark?: boolean }) {
  if (!items?.length) return null;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Incluye">
      {items.map((h) => (
        <li key={h} className={`eyebrow !text-[0.62rem] ${dark ? "text-jade" : "text-jade-ink"}`}>
          + {h}
        </li>
      ))}
    </ul>
  );
}

/* ---------- CoverStory: spread oscuro con el tratamiento estrella ---------- */
export function CoverStory({ lead, others }: { lead: Treatment; others: Treatment[] }) {
  return (
    <>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <figure className="lg:col-span-6">
          <div className="relative">
            <ClipReveal className="aspect-[4/5] lg:aspect-square">
              <ArtFrame variant="facial" alt={`${lead.name}: tratamiento facial en Reduzen`} className="h-full w-full" />
            </ClipReveal>
            {lead.price && (
              // PLACEHOLDER: precio a confirmar con la clienta (content/services.ts)
              <Reveal delay={0.6} className="absolute -right-2 -top-6 sm:-right-8">
                <span className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-gold text-center text-night sm:h-32 sm:w-32">
                  <span className="eyebrow !text-[0.6rem]">{lead.price.label}</span>
                  <span className="font-serif text-4xl leading-none sm:text-5xl">{lead.price.amount}</span>
                </span>
              </Reveal>
            )}
          </div>
          <figcaption className="mt-3 flex items-baseline justify-between gap-4 border-b border-cream/15 pb-3">
            <span className="eyebrow text-gold">Fig. 02</span>
            <span className="eyebrow text-cream/70">{lead.name}</span>
          </figcaption>
        </figure>

        <div className="flex flex-col justify-end lg:col-span-6 lg:pl-6">
          <Reveal>
            <p className="eyebrow text-gold">Portada del mes</p>
            <h3 className="display mt-4 text-[2.3rem] !text-cream sm:text-5xl xl:text-[4rem]">{lead.name}</h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-cream/80">{lead.summary}</p>
            <div className="mt-6">
              <Chips items={lead.highlights} dark />
            </div>
            <WhatsAppButton message={waMessages.treatment(lead.name)} variant="gold" size="lg" className="mt-10 w-full sm:w-auto">
              Quiero mi {lead.name}
            </WhatsAppButton>
          </Reveal>
        </div>
      </div>

      <Stagger as="ul" className="mt-16 grid border-t border-cream/15 md:grid-cols-3">
        {others.map((t, i) => (
          <StaggerItem as="li" key={t.slug} className="border-b border-cream/15 md:border-b-0 md:border-r md:last:border-r-0">
            <a
              href={waLink(waMessages.treatment(t.name))}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex h-full flex-col gap-4 py-8 transition-colors duration-500 hover:bg-cream/[0.04] ${i === 0 ? "md:pr-8" : "md:px-8"}`}
            >
              <span className="eyebrow text-gold">{String(i + 2).padStart(2, "0")}</span>
              <span className="font-serif text-2xl leading-none text-cream transition-transform duration-500 group-hover:translate-x-2">{t.name}</span>
              <Chips items={t.highlights?.slice(0, 3)} dark />
              <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-medium text-gold">
                <WhatsAppIcon size={17} />
                <span className="link-draw">Pedir información</span>
                <ArrowIcon size={17} className="-rotate-45 transition-transform duration-500 group-hover:rotate-0" />
                <span className="sr-only"> sobre {t.name} por WhatsApp</span>
              </span>
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </>
  );
}

/* ---------- TreatmentRow: fila del catálogo en /servicios ---------- */
export function TreatmentRow({ treatment, index }: { treatment: Treatment; index: number }) {
  return (
    <article
      className="group grid gap-5 border-b border-ink/15 py-8 transition-colors duration-500 hover:bg-cream-50 sm:grid-cols-[3rem_1fr_auto] sm:gap-8 sm:px-4"
      data-placeholder={treatment.confirmed ? undefined : "tratamiento-por-confirmar"}
    >
      <span className="eyebrow pt-2 text-gold-ink">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3 className="font-serif text-2xl leading-none text-ink transition-transform duration-500 group-hover:translate-x-1.5 sm:text-3xl">
          {treatment.name}
        </h3>
        <p className="mt-2 text-[0.95rem] text-stone">{treatment.summary}</p>
        <div className="mt-4">
          <Chips items={treatment.highlights} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 sm:flex-col sm:items-end">
        <div className="flex items-center gap-5 sm:flex-col sm:items-end sm:gap-1">
          {treatment.price && (
            // PLACEHOLDER: precio a confirmar
            <span className="text-right">
              <span className="eyebrow block text-gold-ink">{treatment.price.label}</span>
              <span className="font-serif text-2xl leading-none text-ink">{treatment.price.amount}</span>
            </span>
          )}
          {/* PLACEHOLDER: duración estimada */}
          <span className="inline-flex items-center gap-1.5 text-sm text-stone">
            <ClockIcon size={16} className="text-gold-ink" />
            {treatment.duration}
          </span>
        </div>
        <a
          href={waLink(waMessages.treatment(treatment.name))}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-fill inline-flex min-h-12 items-center gap-2 border border-ink/80 px-5 text-sm font-medium text-ink transition-colors duration-500 hover:text-cream-50"
        >
          <WhatsAppIcon size={17} />
          Pedir info
          <span className="sr-only"> sobre {treatment.name} por WhatsApp</span>
        </a>
      </div>
    </article>
  );
}
