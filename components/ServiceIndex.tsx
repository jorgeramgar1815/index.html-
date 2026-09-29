"use client";

import Link from "next/link";
import { m } from "framer-motion";
import type { Category } from "@/content/services";
import { ArrowIcon, categoryIcons } from "./Icons";

const ease = [0.76, 0, 0.24, 1] as const;

/** Índice de servicios tipo revista: filas con filete y barra que se desliza al hover. */
export function ServiceIndex({ items }: { items: Category[] }) {
  return (
    <ol className="border-t border-ink/15">
      {items.map((c, i) => {
        const Icon = categoryIcons[c.icon];
        return (
          <m.li
            key={c.slug}
            className="border-b border-ink/15"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.9, ease, delay: i * 0.06 }}
          >
            <Link
              href={`/servicios/#${c.slug}`}
              className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-1 py-5 sm:grid-cols-[4rem_1fr_1fr_auto] sm:py-6"
            >
              {/* Barra de color que se desliza al hover */}
              <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-cream-50 transition-transform duration-700 [transition-timing-function:var(--ease-editorial)] group-hover:scale-y-100" />
              <span className="eyebrow relative text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
              <span className="relative font-serif text-3xl leading-none text-ink transition-transform duration-700 [transition-timing-function:var(--ease-editorial)] group-hover:translate-x-3 sm:text-4xl lg:text-5xl">
                {c.short}
              </span>
              <span className="relative col-span-3 col-start-2 row-start-2 flex items-center gap-3 text-stone sm:col-span-1 sm:col-start-3 sm:row-start-1">
                <Icon size={20} className="hidden shrink-0 text-jade-ink sm:block" />
                <span className="eyebrow text-gold-ink">{c.treatments.length} tratamientos</span>
              </span>
              <span className="relative col-start-3 row-start-1 flex h-11 w-11 items-center justify-center border border-ink/20 transition-all duration-500 group-hover:border-jade-ink group-hover:bg-jade-ink group-hover:text-cream sm:col-start-4">
                <ArrowIcon size={18} className="-rotate-45 transition-transform duration-500 group-hover:rotate-0" />
              </span>
            </Link>
          </m.li>
        );
      })}
    </ol>
  );
}
