"use client";

import { useId, useState } from "react";
import type { Category } from "@/content/services";
import { waLink, waMessages } from "@/lib/whatsapp";
import { ArtFrame } from "../ArtFrame";
import { categoryIcons } from "../Icons";

/** Carta de tratamientos tipo menú de spa: pestañas por categoría y filas con línea punteada. */
export function TreatmentMenu({ items }: { items: Category[] }) {
  const [active, setActive] = useState(0);
  const base = useId();
  const cat = items[active];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-14">
      {/* Imagen en arco de la categoría activa */}
      <div className="relative mx-auto hidden w-full max-w-sm lg:block">
        <span aria-hidden className="absolute -inset-3 rounded-t-full border border-gold/50" />
        <ArtFrame key={cat.slug} variant={cat.art} src={cat.image} alt={`${cat.name} en Reduzen`} className="page-fade aspect-[3/4] rounded-t-full" />
        <p className="absolute inset-x-6 -bottom-6 bg-cream-50 px-4 py-2.5 text-center font-serif text-base italic text-jade-ink shadow-sm">{cat.intro}</p>
      </div>

      <div className="min-w-0">
        <div role="tablist" aria-label="Categorías de tratamientos" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {items.map((c, i) => {
            const Icon = categoryIcons[c.icon];
            const selected = i === active;
            return (
              <button
                key={c.slug}
                role="tab"
                id={`${base}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${base}-panel`}
                onClick={() => setActive(i)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-[3px] border px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  selected ? "border-jade-ink bg-jade-ink text-white" : "border-ink/15 bg-white text-ink/75 hover:border-jade-ink hover:text-jade-ink"
                }`}
              >
                <Icon size={16} />
                {c.short}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${active}`} className="mt-8">
          <ul key={cat.slug} className="page-fade divide-y divide-ink/10 border-y border-ink/10">
            {cat.treatments.map((t) => (
              <li key={t.slug}>
                <a
                  href={waLink(waMessages.treatment(t.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block py-5 transition-colors hover:bg-white/70 sm:px-3"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-serif text-xl text-ink transition-colors group-hover:text-jade-ink">{t.name}</span>
                    <span aria-hidden className="mb-1 min-w-6 flex-1 border-b border-dotted border-ink/30" />
                    {t.price ? (
                      // PLACEHOLDER: promo vista en Facebook; confirmar vigencia
                      <span className="whitespace-nowrap bg-gold px-2.5 py-1 text-[0.72rem] font-semibold text-night" data-placeholder="precio-por-confirmar">
                        Promo {t.price.amount}
                      </span>
                    ) : (
                      <span className="whitespace-nowrap text-sm text-stone">{t.duration}</span>
                    )}
                  </span>
                  <span className="mt-1.5 flex items-center justify-between gap-4 text-sm text-stone">
                    {t.summary}
                    <span className="hidden whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-jade-ink opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
                      Pedir info →
                    </span>
                  </span>
                  <span className="sr-only"> (abre WhatsApp)</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-stone">Duraciones aproximadas. Cada tratamiento incluye valoración previa.</p>
        </div>
      </div>
    </div>
  );
}
