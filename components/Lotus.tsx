type LotusProps = {
  className?: string;
  strokeWidth?: number;
  /** Color del pétalo central y la gota (acento). */
  accent?: string;
  title?: string;
  /** Anima el trazo como si se dibujara (CSS). */
  draw?: boolean;
};

/** Flor de loto en línea fina con gota central: el ícono de la marca. */
export function Lotus({ className, strokeWidth = 1.4, accent = "var(--color-gold)", title, draw = false }: LotusProps) {
  const pl = draw ? 1 : undefined;
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={`${className ?? ""} ${draw ? "draw" : ""}`}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path pathLength={pl} d="M32 44C23 35.5 23.5 20 32 9c8.5 11 9 26.5 0 35Z" stroke={accent} />
      <path pathLength={pl} d="M32 44c-9.5-.8-17.5-8.2-19.5-21 9.5 1.6 16.8 7.4 19.5 21Z" />
      <path pathLength={pl} d="M32 44c9.5-.8 17.5-8.2 19.5-21-9.5 1.6-16.8 7.4-19.5 21Z" />
      <path pathLength={pl} d="M31 46.2C20 47.4 9.5 42.6 4.5 32.5c10.2-.8 20.3 4.2 26.5 13.7Z" />
      <path pathLength={pl} d="M33 46.2c11 1.2 21.5-3.6 26.5-13.7-10.2-.8-20.3 4.2-26.5 13.7Z" />
      <path pathLength={pl} d="M15 51.5c11 4.2 23 4.2 34 0" />
      <path pathLength={pl} d="M32 24.5c2.2 3 3.3 5.1 3.3 6.6a3.3 3.3 0 0 1-6.6 0c0-1.5 1.1-3.6 3.3-6.6Z" stroke={accent} />
    </svg>
  );
}

/** Wordmark "R E D U Z E N" + subtítulo en itálicas. */
export function Wordmark({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Lotus className={`h-9 w-9 shrink-0 ${light ? "text-jade" : "text-jade-ink"}`} />
      <span className="flex flex-col leading-none">
        <span className={`font-serif text-[1.35rem] font-medium tracking-[0.32em] ${light ? "text-cream" : "text-navy"}`}>
          REDUZEN
        </span>
        <span className={`mt-1 font-serif text-[0.8rem] italic tracking-wide ${light ? "text-gold" : "text-gold-ink"}`}>
          Mesoterapia &amp; Spa
        </span>
      </span>
    </span>
  );
}
