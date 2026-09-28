type SectionDividerProps = {
  /** Color de la sección que sigue (relleno de la ola). */
  fill: string;
  /** Color de la ola secundaria translúcida. */
  accent?: string;
  /** Voltea la ola para cerrar una sección (ola hacia abajo). */
  flip?: boolean;
  /** Deriva horizontal lenta de la ola (se detiene con reduced-motion). */
  animated?: boolean;
  className?: string;
};

// Una sola "ola" repetida dos veces para permitir la deriva continua sin cortes.
const WAVE = "M0 50C240 18 480 18 720 50S1200 82 1440 50V100H0Z";
const WAVE_SOFT = "M0 40C300 70 420 10 720 36S1140 10 1440 40V100H0Z";

/** Divisor orgánico tipo ola, el elemento gráfico de la portada de Facebook. */
export function SectionDivider({ fill, accent, flip = false, animated = false, className = "" }: SectionDividerProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none ${/\babsolute\b/.test(className) ? "" : "relative"} -mb-px h-14 w-full overflow-hidden sm:h-20 lg:h-24 ${flip ? "rotate-180" : ""} ${className}`}
    >
      {accent && (
        <svg
          className={`absolute bottom-0 left-0 h-full w-[200%] ${animated ? "animate-wave-drift [animation-duration:26s]" : ""}`}
          viewBox="0 0 2880 100"
          preserveAspectRatio="none"
        >
          <path d={WAVE_SOFT} fill={accent} />
          <path d={WAVE_SOFT} fill={accent} transform="translate(1440 0)" />
        </svg>
      )}
      <svg
        className={`absolute bottom-0 left-0 h-[82%] w-[200%] ${animated ? "animate-wave-drift" : ""}`}
        viewBox="0 0 2880 100"
        preserveAspectRatio="none"
      >
        <path d={WAVE} fill={fill} />
        <path d={WAVE} fill={fill} transform="translate(1440 0)" />
      </svg>
    </div>
  );
}
