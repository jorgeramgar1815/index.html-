"use client";

import { useId, useState } from "react";
import { ArtFrame } from "./ArtFrame";

type BeforeAfterProps = {
  title: string;
  sessions: string;
  /** PLACEHOLDER: fotos reales autorizadas por la clienta. */
  beforeSrc?: string | null;
  afterSrc?: string | null;
};

/** Comparador antes/después accesible (control deslizante nativo). */
export function BeforeAfter({ title, sessions, beforeSrc = null, afterSrc = null }: BeforeAfterProps) {
  const [pos, setPos] = useState(50);
  const id = useId();
  return (
    <figure className="overflow-hidden rounded-[28px] bg-cream-50 ring-1 ring-navy/8">
      <div className="relative aspect-square select-none md:aspect-[5/6]">
        <ArtFrame variant="after" src={afterSrc} alt={`${title}: después (imagen ilustrativa)`} className="absolute inset-0" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <ArtFrame variant="before" src={beforeSrc} alt={`${title}: antes (imagen ilustrativa)`} className="absolute inset-0" />
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-navy/80 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-cream">
          Antes
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-navy">
          Después
        </span>
        <div className="pointer-events-none absolute inset-y-0 w-px bg-cream shadow-[0_0_0_1px_rgba(201,162,75,.5)]" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-gold-ink shadow-lift ring-1 ring-gold/50">
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
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
        {/* PLACEHOLDER: reemplazar por casos reales con autorización */}
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cream/90 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-stone">
          Imagen ilustrativa
        </span>
      </div>
      <figcaption className="flex items-center justify-between gap-3 px-6 py-5">
        <span className="font-serif text-xl text-navy">{title}</span>
        <span className="text-xs uppercase tracking-[0.18em] text-gold-ink">{sessions}</span>
      </figcaption>
    </figure>
  );
}
