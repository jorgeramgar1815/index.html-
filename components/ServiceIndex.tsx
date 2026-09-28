"use client";

import Link from "next/link";
import { AnimatePresence, m, useMotionValue, useSpring } from "framer-motion";
import { useRef, useState, type PointerEvent } from "react";
import type { Category } from "@/content/services";
import { ArtFrame } from "./ArtFrame";
import { ArrowIcon, categoryIcons } from "./Icons";

const ease = [0.76, 0, 0.24, 1] as const;

/**
 * Índice de servicios tipo revista: filas grandes con filete. En desktop,
 * una imagen de vista previa sigue al cursor sobre la fila activa.
 */
export function ServiceIndex({ items }: { items: Category[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22 });
  const sy = useSpring(y, { stiffness: 180, damping: 22 });

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  return (
    <div ref={ref} className="relative" onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
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
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-1 py-6 sm:grid-cols-[4rem_1fr_1fr_auto] sm:py-8"
              >
                {/* Barra de color que se desliza al hover */}
                <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-cream-50 transition-transform duration-700 [transition-timing-function:var(--ease-editorial)] group-hover:scale-y-100" />
                <span className="eyebrow relative text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
                <span className="relative font-serif text-[2.6rem] leading-none text-ink transition-transform duration-700 [transition-timing-function:var(--ease-editorial)] group-hover:translate-x-3 sm:text-6xl lg:text-7xl">
                  {c.short}
                </span>
                <span className="relative col-span-3 col-start-2 row-start-2 flex items-center gap-3 text-stone sm:col-span-1 sm:col-start-3 sm:row-start-1">
                  <Icon size={22} className="hidden shrink-0 text-jade-ink sm:block" />
                  <span>
                    {c.intro} <span className="text-gold-ink">· {c.treatments.length} tratamientos</span>
                  </span>
                </span>
                <span className="relative col-start-3 row-start-1 flex h-12 w-12 items-center justify-center border border-ink/20 transition-all duration-500 group-hover:border-jade-ink group-hover:bg-jade-ink group-hover:text-cream sm:col-start-4">
                  <ArrowIcon size={20} className="-rotate-45 transition-transform duration-500 group-hover:rotate-0" />
                </span>
              </Link>
            </m.li>
          );
        })}
      </ol>

      {/* Vista previa que sigue al cursor (solo desktop con mouse) */}
      <m.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-10 hidden w-64 lg:block motion-reduce:!hidden"
        style={{ x: sx, y: sy }}
      >
        <div className="-translate-x-1/2 -translate-y-1/2">
          <AnimatePresence mode="popLayout">
            {active !== null && (
              <m.div
                key={active}
                initial={{ clipPath: "inset(100% 0 0 0)", rotate: -4 }}
                animate={{ clipPath: "inset(0% 0 0 0)", rotate: 3 }}
                exit={{ clipPath: "inset(0 0 100% 0)", rotate: 6 }}
                transition={{ duration: 0.55, ease }}
                className="shadow-[0_30px_60px_-20px_rgba(18,26,44,.45)]"
              >
                <ArtFrame variant={items[active].art} src={items[active].image} alt="" className="aspect-[3/4] w-full" />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </m.div>
    </div>
  );
}
