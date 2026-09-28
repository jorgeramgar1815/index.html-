"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Testimonial } from "@/content/testimonials";
import { ArrowIcon, StarIcon } from "./Icons";

const ease = [0.76, 0, 0.24, 1] as const;

/** Un testimonio a la vez, a gran tamaño, con avance automático y controles. */
export function TestimonialSlider({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const t = items[i];

  useEffect(() => {
    if (paused || reduce) return;
    const id = setTimeout(() => setI((v) => (v + 1) % items.length), 7000);
    return () => clearTimeout(id);
  }, [i, paused, reduce, items.length]);

  const go = (dir: number) => setI((v) => (v + dir + items.length) % items.length);

  return (
    <div
      className="grid gap-10 lg:grid-cols-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="lg:col-span-2">
        <span aria-hidden className="block font-serif text-[9rem] leading-[0.7] text-gold">
          “
        </span>
      </div>
      <div className="lg:col-span-10">
        <div className="relative min-h-[16rem] sm:min-h-[11rem]" aria-live="polite">
          <AnimatePresence mode="wait">
            <m.figure
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease }}
              data-placeholder={t.isExample ? "testimonio-de-ejemplo" : undefined}
            >
              <blockquote className="display text-[2.1rem] leading-[1.1] text-ink sm:text-5xl">{t.quote}</blockquote>
              <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex gap-0.5 text-gold" role="img" aria-label={`${t.rating} de 5 estrellas`}>
                  {Array.from({ length: t.rating }).map((_, k) => (
                    <StarIcon key={k} size={15} />
                  ))}
                </span>
                <span className="font-medium text-ink">{t.name}</span>
                <span className="eyebrow text-stone">{t.detail}</span>
                {t.isExample && <span className="eyebrow border border-ink/20 px-2 py-1 text-stone">Ejemplo</span>}
              </figcaption>
            </m.figure>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center gap-6 border-t border-ink/15 pt-6">
          <span className="eyebrow tabular-nums text-ink">
            {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
          {/* Barra de tiempo */}
          <span className="relative h-px flex-1 overflow-hidden bg-ink/15" aria-hidden>
            <m.span
              key={`${i}-${paused}`}
              className="absolute inset-y-0 left-0 bg-jade-ink motion-reduce:hidden"
              initial={{ width: "0%" }}
              animate={{ width: paused ? "0%" : "100%" }}
              transition={{ duration: paused ? 0 : 7, ease: "linear" }}
            />
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={() => go(-1)} className="flex h-12 w-12 items-center justify-center border border-ink/25 transition-colors hover:bg-ink hover:text-cream">
              <ArrowIcon size={18} className="rotate-180" />
              <span className="sr-only">Testimonio anterior</span>
            </button>
            <button type="button" onClick={() => go(1)} className="flex h-12 w-12 items-center justify-center border border-ink/25 transition-colors hover:bg-ink hover:text-cream">
              <ArrowIcon size={18} />
              <span className="sr-only">Siguiente testimonio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
