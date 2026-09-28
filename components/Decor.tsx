import type { CSSProperties, ReactNode } from "react";

/** Burbujas que suben lentamente (CSS puro, sin JS). */
export function Bubbles({ count = 14, light = false, className = "" }: { count?: number; light?: boolean; className?: string }) {
  // Posiciones deterministas para evitar diferencias entre servidor y cliente
  const items = Array.from({ length: count }, (_, i) => {
    const seed = (i * 37) % 100;
    return {
      left: `${(i * 71 + 7) % 100}%`,
      size: 8 + ((i * 13) % 34),
      t: `${14 + ((i * 7) % 16)}s`,
      d: `-${(seed / 100) * 20}s`,
      o: light ? 0.35 : 0.75,
    };
  });
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {items.map((b, i) => (
        <span
          key={i}
          className={`bubble ${light ? "!border-cream/25" : ""}`}
          style={{ left: b.left, width: b.size, height: b.size, "--t": b.t, "--d": b.d, "--o": b.o } as CSSProperties}
        />
      ))}
    </div>
  );
}

/** Manchas de luz tipo aurora que se desplazan suavemente. */
export function Aurora({ dark = false }: { dark?: boolean }) {
  const blobs = dark
    ? ["rgba(58,166,160,.28)", "rgba(201,162,75,.22)", "rgba(39,64,107,.55)"]
    : ["rgba(58,166,160,.20)", "rgba(212,179,106,.30)", "rgba(236,213,197,.75)"];
  const pos = [
    "left-[-12%] top-[-10%] h-[34rem] w-[34rem]",
    "right-[-10%] top-[18%] h-[30rem] w-[30rem] [animation-delay:-6s]",
    "left-[28%] bottom-[-18%] h-[28rem] w-[36rem] [animation-delay:-12s]",
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((c, i) => (
        <div
          key={i}
          className={`absolute animate-aurora rounded-full will-change-transform ${pos[i]}`}
          style={{ background: `radial-gradient(closest-side, ${c}, transparent)` }}
        />
      ))}
    </div>
  );
}

/** Cinta infinita horizontal. El segundo juego se oculta a lectores de pantalla. */
export function Marquee({
  children,
  className = "",
  reverse = false,
  duration,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  duration?: string;
}) {
  return (
    <div className={`mask-fade-x group flex overflow-hidden motion-reduce:overflow-x-auto ${className}`}>
      <div
        className="flex w-max shrink-0 animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDirection: reverse ? "reverse" : undefined, animationDuration: duration }}
      >
        <div className="flex shrink-0 items-stretch">{children}</div>
        <div className="flex shrink-0 items-stretch" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Estrella dorada de 4 puntas. */
export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-10 -10 20 20" className={className} aria-hidden>
      <path d="M0-10c1 7 3 9 10 10-7 1-9 3-10 10-1-7-3-9-10-10 7-1 9-3 10-10Z" fill="currentColor" />
    </svg>
  );
}
