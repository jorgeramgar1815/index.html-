"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useId, useState } from "react";
import type { Category } from "@/content/services";
import { waLink, waMessages } from "@/lib/whatsapp";
import { ArtFrame } from "../ArtFrame";
import { ArrowIcon, categoryIcons, ClockIcon, WhatsAppIcon } from "../Icons";

const ease = [0.22, 1, 0.36, 1] as const;

/** Carta formal sobre fondo noche: categorías a la izquierda, tratamientos animados a la derecha. */
export function TreatmentMenu({ items }: { items: Category[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const base = useId();
  const cat = items[active];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-16">
      {/* Índice de categorías: columna en escritorio, carrusel en celular */}
      <div
        role="tablist"
        aria-label="Categorías de tratamientos"
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-cream/15 lg:px-0"
      >
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
              className={`group relative flex shrink-0 items-center gap-3 border px-4 py-3 text-left transition-colors lg:border-0 lg:border-b lg:border-cream/15 lg:px-0 lg:py-5 ${
                selected ? "border-gold bg-gold/10 text-cream lg:bg-transparent" : "border-cream/15 text-cream/60 hover:text-cream"
              }`}
            >
              {/* Barra dorada de la categoría activa */}
              <span
                aria-hidden
                className={`absolute -left-4 top-1/2 hidden h-8 w-[3px] -translate-y-1/2 bg-gold transition-transform duration-500 lg:block ${selected ? "scale-y-100" : "scale-y-0"}`}
              />
              <span className={`text-[0.7rem] font-semibold tracking-[0.2em] ${selected ? "text-gold" : "text-cream/40"}`}>{String(i + 1).padStart(2, "0")}</span>
              <Icon size={20} className={`hidden lg:block ${selected ? "text-gold" : "text-cream/40 group-hover:text-cream/70"}`} />
              <span className="font-serif text-lg leading-tight lg:text-[1.35rem]">{c.short}</span>
              <span className="ml-auto hidden text-xs text-cream/50 lg:block">{c.treatments.length}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${active}`} className="min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={cat.slug}
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -10 }}
            transition={{ duration: 0.45, ease }}
          >
            {/* Encabezado de la categoría con imagen enmarcada */}
            <div className="grid items-end gap-8 sm:grid-cols-[minmax(0,1fr)_11rem] lg:grid-cols-[minmax(0,1fr)_13rem]">
              <div>
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-gold">
                  {cat.treatments.length} tratamientos
                </p>
                <h3 className="mt-3 text-[2rem] leading-tight !text-cream sm:text-[2.5rem]">{cat.name}</h3>
                <p className="mt-2 font-serif text-lg italic text-gold-pale">{cat.intro}</p>
              </div>
              <div className="relative hidden aspect-square sm:block">
                <span aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 border border-gold/60" />
                <ArtFrame variant={cat.art} src={cat.image} alt={`${cat.name} en Reduzen`} className="h-full w-full" />
              </div>
            </div>

            <ul className="mt-10 border-t border-cream/15">
              {cat.treatments.map((t, i) => (
                <m.li
                  key={t.slug}
                  initial={{ opacity: 0, x: reduce ? 0 : 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.08 * i + 0.1 }}
                  className="border-b border-cream/15"
                >
                  <a
                    href={waLink(waMessages.treatment(t.name))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 py-6 transition-colors hover:bg-cream/[0.04] sm:px-3"
                  >
                    <span className="pt-1.5 text-[0.7rem] font-semibold tracking-[0.2em] text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="flex items-baseline gap-3">
                        <span className="font-serif text-[1.35rem] leading-snug text-cream transition-colors group-hover:text-gold-pale sm:text-2xl">{t.name}</span>
                        <span aria-hidden className="mb-1.5 min-w-6 flex-1 border-b border-dotted border-gold/40" />
                        {t.price ? (
                          // PLACEHOLDER: promo vista en Facebook; confirmar vigencia
                          <span className="whitespace-nowrap bg-gold px-3 py-1 text-[0.78rem] font-semibold text-night" data-placeholder="precio-por-confirmar">
                            Promo {t.price.amount}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-cream/70">
                            <ClockIcon size={15} className="text-gold" />
                            {t.duration}
                          </span>
                        )}
                      </span>
                      <span className="mt-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                        <span className="text-[0.98rem] text-cream/70">{t.summary}</span>
                        <span className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gold transition-transform duration-300 group-hover:translate-x-1">
                          <WhatsAppIcon size={15} /> Reservar
                        </span>
                      </span>
                    </span>
                    <span className="sr-only"> (abre WhatsApp)</span>
                  </a>
                </m.li>
              ))}
            </ul>
          </m.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-cream/60">Duraciones aproximadas · Cada tratamiento incluye valoración previa.</p>
          <Link href="/servicios/" className="group inline-flex items-center gap-2 text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-gold-pale hover:text-white">
            Ver catálogo completo <ArrowIcon size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
