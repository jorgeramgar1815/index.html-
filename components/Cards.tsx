import Link from "next/link";
import type { Category, Treatment } from "@/content/services";
import type { Testimonial } from "@/content/testimonials";
import { waLink, waMessages } from "@/lib/whatsapp";
import { ArtFrame, type ArtVariant } from "./ArtFrame";
import { ArrowIcon, ClockIcon, QuoteIcon, StarIcon, WhatsAppIcon, categoryIcons } from "./Icons";

/* ---------- ServiceCard: categoría en la landing ---------- */
export function ServiceCard({ category, wide = false }: { category: Category; wide?: boolean }) {
  const Icon = categoryIcons[category.icon];
  return (
    <Link
      href={`/servicios/#${category.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] bg-cream-50 ring-1 ring-navy/8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift hover:ring-gold/60"
    >
      <ArtFrame
        variant={category.art}
        src={category.image}
        alt={`${category.name} en Reduzen`}
        className={`aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-[1.03] ${wide ? "sm:aspect-[16/7] lg:aspect-[4/3]" : ""}`}
      />
      <div className="relative flex flex-1 flex-col px-6 pb-6 pt-9">
        <span className="absolute -top-7 left-6 flex h-14 w-14 items-center justify-center rounded-full bg-cream-50 text-jade-ink shadow-soft ring-1 ring-gold/30 transition-shadow duration-500 group-hover:shadow-glow">
          <Icon size={26} />
        </span>
        <h3 className="text-[1.65rem] leading-tight text-navy">{category.short}</h3>
        <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-stone">{category.intro}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-jade-ink">
          Ver tratamientos
          <ArrowIcon size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
      {/* brillo dorado al hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(60%_40%_at_50%_0%,rgba(212,179,106,.22),transparent_70%)]"
      />
    </Link>
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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[28px] bg-night-3/70 ring-1 ring-cream/10 backdrop-blur transition-all duration-500 hover:-translate-y-1.5 hover:ring-gold/50 hover:shadow-[0_30px_60px_-25px_rgba(201,162,75,.45)]">
      <ArtFrame
        variant={spotlightArt[treatment.slug] ?? "facial"}
        alt={`${treatment.name}: tratamiento facial en Reduzen`}
        className="aspect-[5/4] w-full"
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
        <h3 className="font-serif text-[1.75rem] uppercase leading-tight tracking-[0.08em] text-cream">
          {treatment.name}
        </h3>
        <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-cream/80">{treatment.summary}</p>
        {treatment.highlights && (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Beneficios">
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
          className="btn-shine mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-gold/60 px-5 text-sm font-medium tracking-wide text-gold transition-all duration-300 hover:bg-gold hover:text-night"
        >
          <WhatsAppIcon size={18} />
          Quiero este tratamiento
          <span className="sr-only"> (abre WhatsApp)</span>
        </a>
      </div>
    </article>
  );
}

/* ---------- TreatmentRow: catálogo en /servicios ---------- */
export function TreatmentCard({ treatment, categoryIcon }: { treatment: Treatment; categoryIcon: Category["icon"] }) {
  const Icon = categoryIcons[categoryIcon];
  return (
    <article
      className="group flex h-full flex-col rounded-[24px] bg-cream-50 p-6 ring-1 ring-navy/8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift hover:ring-gold/50"
      data-placeholder={treatment.confirmed ? undefined : "tratamiento-por-confirmar"}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream-100 text-jade-ink ring-1 ring-gold/25">
          <Icon size={24} />
        </span>
        {treatment.price && (
          // PLACEHOLDER: precio a confirmar
          <span className="text-right">
            <span className="block text-[0.65rem] uppercase tracking-[0.2em] text-gold-ink">{treatment.price.label}</span>
            <span className="block font-serif text-2xl font-semibold leading-none text-navy">{treatment.price.amount}</span>
          </span>
        )}
      </div>
      <h3 className="mt-5 text-2xl leading-tight text-navy">{treatment.name}</h3>
      <p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-stone">{treatment.summary}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-4">
        {/* PLACEHOLDER: duración estimada */}
        <span className="inline-flex items-center gap-1.5 text-sm text-stone">
          <ClockIcon size={17} className="text-gold-ink" />
          {treatment.duration} aprox.
        </span>
        <a
          href={waLink(waMessages.treatment(treatment.name))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-jade-ink px-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
        >
          <WhatsAppIcon size={17} />
          Pedir info
          <span className="sr-only"> sobre {treatment.name} por WhatsApp</span>
        </a>
      </div>
    </article>
  );
}

/* ---------- TestimonialCard ---------- */
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure
      className="relative flex h-full flex-col rounded-[24px] bg-cream-50 p-7 ring-1 ring-navy/8"
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
