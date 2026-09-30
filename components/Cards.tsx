import type { Treatment } from "@/content/services";
import { waLink, waMessages } from "@/lib/whatsapp";
import { ClockIcon, WhatsAppIcon } from "./Icons";

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

/* ---------- TreatmentRow: fila del catálogo en /servicios ---------- */
export function TreatmentRow({ treatment, index }: { treatment: Treatment; index: number }) {
  return (
    <article
      className="group grid gap-5 border-b border-ink/15 py-8 transition-colors duration-500 hover:bg-cream-50 sm:grid-cols-[3rem_1fr_auto] sm:gap-8 sm:px-4"
      data-placeholder={treatment.confirmed ? undefined : "tratamiento-por-confirmar"}
    >
      <span className="eyebrow pt-2 text-gold-ink">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <h3 className="font-serif text-xl leading-none text-ink transition-transform duration-500 group-hover:translate-x-1.5 sm:text-2xl">
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
              <span className="font-serif text-xl leading-none text-ink">{treatment.price.amount}</span>
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
          className="inline-flex min-h-12 items-center gap-2 rounded-[3px] border border-ink/40 px-5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-cream-50"
        >
          <WhatsAppIcon size={17} />
          Pedir info
          <span className="sr-only"> sobre {treatment.name} por WhatsApp</span>
        </a>
      </div>
    </article>
  );
}
