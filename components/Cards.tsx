import Link from "next/link";
import type { Category, Treatment } from "@/content/services";
import type { Testimonial } from "@/content/testimonials";
import { waLink, waMessages } from "@/lib/whatsapp";
import { ArtFrame, type ArtVariant } from "./ArtFrame";
import { Tilt } from "./Effects";
import { ArrowIcon, ClockIcon, QuoteIcon, StarIcon, WhatsAppIcon, categoryIcons } from "./Icons";

/* ---------- ServiceCard: categoría en la landing (imagen a sangre + texto sobrepuesto) ---------- */
export function ServiceCard({ category }: { category: Category }) {
  const Icon = categoryIcons[category.icon];
  return (
    <Tilt className="rounded-[28px]">
      <Link
        href={`/servicios/#${category.slug}`}
        className="group relative flex h-[25rem] flex-col justify-end overflow-hidden rounded-[28px] shadow-soft ring-1 ring-navy/10 transition-shadow duration-500 hover:shadow-lift sm:h-[27rem]"
      >
        <ArtFrame
          variant={category.art}
          src={category.image}
          alt={`${category.name} en Reduzen`}
          className="absolute inset-0 transition-transform duration-[1.2s] ease-out group-hover:scale-[1.08]"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/35 to-transparent transition-opacity duration-500 group-hover:opacity-95" />
        <span className="absolute left-5 top-5 rounded-full bg-cream/85 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-navy">
          {category.treatments.length} tratamientos
        </span>
        <span className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-cream/85 text-jade-ink transition-transform duration-700 group-hover:rotate-[360deg]">
          <Icon size={24} />
        </span>
        <div className="relative p-6">
          <h3 className="text-[2rem] leading-none text-cream">{category.short}</h3>
          <p className="mt-2 text-[0.95rem] text-cream/85">{category.intro}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-gold">
            Ver tratamientos
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/60 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-gold group-hover:text-night">
              <ArrowIcon size={16} />
            </span>
          </span>
        </div>
      </Link>
    </Tilt>
  );
}

/* ---------- TreatmentSpotlightCard: sección oscura premium ---------- */
const spotlightArt: Record<string, ArtVariant> = {
  hydrafacial: "facial",
  "bubble-oxygen-facial": "facial",
  microneedling: "facial",
  hidralips: "facial",
};

export function TreatmentSpotlightCard({ treatment, index }: { treatment: Treatment; index: number }) {
  return (
    <Tilt className="rounded-[28px]">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[28px] bg-night-3/80 ring-1 ring-cream/10 transition-all duration-500 hover:-translate-y-1.5 hover:ring-gold/50 hover:shadow-[0_30px_60px_-25px_rgba(201,162,75,.45)]">
        <ArtFrame
          variant={spotlightArt[treatment.slug] ?? "facial"}
          alt={`${treatment.name}: tratamiento facial en Reduzen`}
          className="aspect-[5/4] w-full transition-transform duration-[1.2s] group-hover:scale-[1.06]"
        >
          <span className="absolute left-5 top-5 font-serif text-sm tracking-[0.3em] text-gold">
            0{index + 1}
          </span>
          {treatment.price && (
            // PLACEHOLDER: precio a confirmar con la clienta (ver content/services.ts)
            <span className="absolute bottom-5 right-5 rounded-full bg-gold px-4 py-2 text-night shadow-lg">
              <span className="block text-[0.62rem] uppercase leading-none tracking-[0.2em]">{treatment.price.label}</span>
              <span className="block font-serif text-2xl font-semibold leading-none">{treatment.price.amount}</span>
            </span>
          )}
        </ArtFrame>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-serif text-[1.55rem] uppercase leading-tight tracking-[0.06em] text-cream">
            {treatment.name}
          </h3>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-cream/80">{treatment.summary}</p>
          {treatment.highlights && (
            <ul className="mb-6 mt-4 flex flex-wrap content-start gap-2" aria-label="Beneficios">
              {treatment.highlights.map((h) => (
                <li key={h} className="rounded-full border border-jade/40 px-3 py-1 text-xs tracking-wide text-jade">
                  {h}
                </li>
              ))}
            </ul>
          )}
          <a
            href={waLink(waMessages.treatment(treatment.name))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-gold/60 px-5 text-sm font-medium tracking-wide text-gold transition-all duration-300 hover:bg-gold hover:text-night"
          >
            <WhatsAppIcon size={18} />
            Quiero este tratamiento
            <span className="sr-only"> (abre WhatsApp)</span>
          </a>
        </div>
      </article>
    </Tilt>
  );
}

/* ---------- TreatmentCard: catálogo en /servicios ---------- */
export function TreatmentCard({ treatment, categoryIcon }: { treatment: Treatment; categoryIcon: Category["icon"] }) {
  const Icon = categoryIcons[categoryIcon];
  return (
    <Tilt className="rounded-[24px]" max={5}>
      <article
        className="group flex h-full flex-col rounded-[24px] bg-cream-50 p-6 ring-1 ring-navy/8 transition-all duration-500 hover:shadow-lift hover:ring-gold/50"
        data-placeholder={treatment.confirmed ? undefined : "tratamiento-por-confirmar"}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream-100 text-jade-ink ring-1 ring-gold/25 transition-all duration-500 group-hover:bg-jade-ink group-hover:text-cream">
            <Icon size={24} />
          </span>
          {treatment.price && (
            // PLACEHOLDER: precio a confirmar
            <span className="rounded-2xl bg-gold/15 px-3 py-1.5 text-right ring-1 ring-gold/40">
              <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-gold-ink">{treatment.price.label}</span>
              <span className="block font-serif text-2xl font-semibold leading-none text-navy">{treatment.price.amount}</span>
            </span>
          )}
        </div>
        <h3 className="mt-5 text-[1.6rem] leading-tight text-navy">{treatment.name}</h3>
        <p className="mt-1.5 text-[0.95rem] text-stone">{treatment.summary}</p>
        {treatment.highlights && (
          <ul className="mt-4 flex flex-1 flex-wrap content-start gap-1.5" aria-label="Incluye">
            {treatment.highlights.map((h) => (
              <li key={h} className="rounded-full bg-cream-100 px-2.5 py-1 text-xs text-navy/80">
                {h}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-4">
          {/* PLACEHOLDER: duración estimada */}
          <span className="inline-flex items-center gap-1.5 text-sm text-stone">
            <ClockIcon size={17} className="text-gold-ink" />
            {treatment.duration}
          </span>
          <a
            href={waLink(waMessages.treatment(treatment.name))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-shine inline-flex min-h-11 items-center gap-2 rounded-full bg-jade-ink px-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
          >
            <WhatsAppIcon size={17} />
            Pedir info
            <span className="sr-only"> sobre {treatment.name} por WhatsApp</span>
          </a>
        </div>
      </article>
    </Tilt>
  );
}

/* ---------- TestimonialCard ---------- */
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure
      className="relative flex h-full flex-col rounded-[24px] bg-cream-50 p-7 shadow-soft ring-1 ring-navy/8 transition-all duration-500 hover:-translate-y-1 hover:ring-gold/50"
      data-placeholder={testimonial.isExample ? "testimonio-de-ejemplo" : undefined}
    >
      <QuoteIcon size={30} className="text-gold" />
      <div className="mt-3 flex gap-0.5 text-gold" role="img" aria-label={`${testimonial.rating} de 5 estrellas`}>
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <StarIcon key={i} size={16} />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 font-serif text-[1.3rem] leading-snug text-navy">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-navy/10 pt-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand font-serif text-lg text-navy" aria-hidden>
          {testimonial.name.charAt(0)}
        </span>
        <span>
          <span className="block text-sm font-medium text-navy">{testimonial.name}</span>
          <span className="block text-xs tracking-wide text-stone">{testimonial.detail}</span>
        </span>
        {testimonial.isExample && (
          <span className="ml-auto rounded-full bg-cream-100 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-stone">
            Ejemplo
          </span>
        )}
      </figcaption>
    </figure>
  );
}
