import type { CSSProperties } from "react";

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
