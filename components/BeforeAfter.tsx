"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { ArtFrame } from "./ArtFrame";

type BeforeAfterProps = {
  title: string;
  sessions: string;
  figure: string;
  /** PLACEHOLDER: fotos reales autorizadas por la clienta. */
  beforeSrc?: string | null;
  afterSrc?: string | null;
  className?: string;
};

/** Comparador antes/después accesible (control deslizante nativo) con pista animada. */
export function BeforeAfter({ title, sessions, figure, beforeSrc = null, afterSrc = null, className = "" }: BeforeAfterProps) {
  const [pos, setPos] = useState(50);
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  const touched = useRef(false);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  // El divisor se mueve solo una vez para invitar a deslizar
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(50, [50, 76, 26, 50], {
      duration: 2.4,
      ease: "easeInOut",
      delay: 0.3,
      onUpdate: (v) => !touched.current && setPos(v),
    });
    return () => controls.stop();
  }, [inView, reduce]);

  return (
    <figure ref={ref} className={className}>
      <div className="relative aspect-[4/5] select-none overflow-hidden">
        <ArtFrame variant="after" src={afterSrc} alt={`${title}: después (imagen ilustrativa)`} className="absolute inset-0" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <ArtFrame variant="before" src={beforeSrc} alt={`${title}: antes (imagen ilustrativa)`} className="absolute inset-0" />
        </div>
        <span className="eyebrow absolute left-3 top-3 bg-ink px-2.5 py-1 text-cream">Antes</span>
        <span className="eyebrow absolute right-3 top-3 bg-cream-50 px-2.5 py-1 text-ink">Después</span>
        <div className="pointer-events-none absolute inset-y-0 w-px bg-cream-50" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50 text-ink shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
            </svg>
          </span>
        </div>
        <label htmlFor={id} className="sr-only">
          Deslizar para comparar antes y después de {title}
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={Math.round(pos)}
          onChange={(e) => {
            touched.current = true;
            setPos(Number(e.target.value));
          }}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
        {/* PLACEHOLDER: reemplazar por casos reales con autorización */}
        <span className="eyebrow absolute bottom-3 left-3 bg-cream-50/90 px-2.5 py-1 !text-[0.58rem] text-stone">Imagen ilustrativa</span>
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between gap-3 border-b border-ink/15 pb-3">
        <span className="flex items-baseline gap-3">
          <span className="eyebrow text-gold-ink">{figure}</span>
          <span className="font-serif text-base text-ink">{title}</span>
        </span>
        <span className="eyebrow text-stone">{sessions}</span>
      </figcaption>
    </figure>
  );
}
