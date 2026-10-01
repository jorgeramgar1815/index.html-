import type { ReactNode } from "react";
import { Lotus } from "./Lotus";

/* =========================================================
   ArtFrame — espacio de imagen con dirección de arte.
   PLACEHOLDER: mientras `src` sea null se muestra una
   composición gráfica de marca (degradados + motivos de línea).
   Cuando la clienta entregue fotografía real, colocarla en
   /public/images y pasar `src="/images/archivo.jpg"` + `alt`.
   ========================================================= */

export type ArtVariant =
  | "portrait"
  | "facial"
  | "body"
  | "nails"
  | "pedicure"
  | "laser"
  | "space"
  | "team"
  | "before"
  | "after";

type ArtFrameProps = {
  variant: ArtVariant;
  src?: string | null;
  alt: string;
  className?: string;
  /** Carga prioritaria (solo imagen del hero). */
  priority?: boolean;
  children?: ReactNode;
};

const backgrounds: Record<ArtVariant, string> = {
  portrait:
    "radial-gradient(120% 80% at 30% 20%, #fbe9dc 0%, #f3d6c2 38%, #e8cdb2 62%, #d9bf9e 100%)",
  facial:
    "radial-gradient(90% 70% at 70% 25%, #27406b 0%, #16213e 45%, #0e1730 100%)",
  body: "linear-gradient(160deg, #f4e7d6 0%, #ecd5c5 55%, #e2c6ad 100%)",
  nails: "radial-gradient(110% 90% at 20% 10%, #fbeee6 0%, #efd3c8 55%, #e4bfb2 100%)",
  pedicure: "linear-gradient(170deg, #eef4f0 0%, #d6e9e4 45%, #b9dcd6 100%)",
  laser: "radial-gradient(80% 100% at 50% 0%, #ffffff 0%, #eaf3f1 35%, #d4e6e2 70%, #c3dad6 100%)",
  space: "linear-gradient(180deg, #fbf8f2 0%, #f1eadf 60%, #e8dcc8 100%)",
  team: "radial-gradient(100% 80% at 50% 30%, #f6ebdf 0%, #ead9c4 60%, #dcc6aa 100%)",
  before: "linear-gradient(160deg, #d9ccbd 0%, #cbbba8 50%, #bfae9a 100%)",
  after: "radial-gradient(90% 80% at 45% 35%, #fff4ea 0%, #f6dcc8 45%, #eccbb0 100%)",
};

function Bubbles({ color = "rgba(255,255,255,.55)", seed = 0 }: { color?: string; seed?: number }) {
  const b = [
    [18, 22, 9], [30, 60, 5], [72, 30, 12], [84, 70, 6], [55, 82, 8], [12, 78, 4], [62, 12, 4], [44, 46, 3],
  ];
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {b.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={(x + seed * 7) % 100} cy={y} r={r} fill="none" stroke={color} strokeWidth=".35" />
          <circle cx={(x + seed * 7) % 100 - r * 0.35} cy={y - r * 0.35} r={r * 0.18} fill={color} />
        </g>
      ))}
    </svg>
  );
}

function Motif({ variant }: { variant: ArtVariant }) {
  switch (variant) {
    case "portrait":
      return (
        <>
          <div className="absolute left-1/2 top-[18%] h-[46%] aspect-square -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,250,240,.95)_0%,rgba(255,244,230,.4)_55%,transparent_72%)]" />
          <Lotus className="absolute left-1/2 top-[30%] w-[46%] -translate-x-1/2 text-navy/70" strokeWidth={0.8} accent="var(--color-gold)" />
          <svg className="absolute -left-6 bottom-6 w-[55%] text-jade-ink/40" viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
            <path d="M4 116C50 90 96 58 196 8" />
            {[30, 60, 90, 120, 150].map((x, i) => (
              <path key={x} d={`M${x} ${104 - i * 20}c-8-18-4-30 10-38 6 16 2 30-10 38Zm0 0c16 4 30-2 38-14-16-6-30-2-38 14Z`} />
            ))}
          </svg>
          <Bubbles color="rgba(255,255,255,.7)" />
        </>
      );
    case "facial":
      return (
        <>
          <div className="absolute right-[12%] top-[12%] h-2/5 aspect-square rounded-full bg-[radial-gradient(circle,rgba(201,162,75,.45)_0%,transparent_70%)]" />
          <Bubbles color="rgba(247,243,236,.55)" seed={1} />
          <Lotus className="absolute bottom-[14%] left-1/2 w-1/3 -translate-x-1/2 text-jade" strokeWidth={0.9} />
        </>
      );
    case "body":
      return (
        <svg className="absolute inset-0 h-full w-full text-navy-deep/25" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth=".4" aria-hidden>
          {[0, 8, 16, 24, 32].map((o) => (
            <path key={o} d={`M${-10 + o} 110C${20 + o} 70 ${-5 + o} 40 ${30 + o} 0`} />
          ))}
          <path d="M60 110C80 70 55 40 90 0" stroke="var(--color-gold)" strokeWidth=".6" />
        </svg>
      );
    case "nails":
      return (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden>
          {[[25, 30, 20], [70, 22, -30], [55, 65, 60], [20, 75, 110], [82, 70, 160]].map(([x, y, r], i) => (
            <path key={i} transform={`translate(${x} ${y}) rotate(${r})`} d="M0 0c6-8 14-8 16 0-6 6-12 6-16 0Z" fill="rgba(255,255,255,.55)" stroke="rgba(201,162,75,.7)" strokeWidth=".3" />
          ))}
        </svg>
      );
    case "pedicure":
      return (
        <svg className="absolute inset-0 h-full w-full text-jade-ink/35" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" aria-hidden>
          {[8, 16, 26, 38].map((r, i) => (
            <ellipse key={r} cx="55" cy="62" rx={r} ry={r * 0.32} strokeWidth={0.5 - i * 0.08} />
          ))}
          <path d="M20 30c4 3 8 3 12 0s8-3 12 0" strokeWidth=".4" />
        </svg>
      );
    case "laser":
      return (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden>
          {Array.from({ length: 11 }).map((_, i) => (
            <path key={i} d={`M50 -5L${5 + i * 9} 105`} stroke="rgba(46,139,139,.22)" strokeWidth=".3" />
          ))}
          <circle cx="50" cy="-5" r="18" fill="rgba(255,255,255,.8)" />
        </svg>
      );
    case "space":
      return (
        <svg className="absolute inset-0 h-full w-full text-navy/25" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" strokeWidth=".4" aria-hidden>
          <path d="M18 100V46a16 16 0 0 1 32 0v54" />
          <path d="M58 100V38a18 18 0 0 1 36 0v62" stroke="var(--color-gold)" />
          <path d="M34 100c0-14 2-24 8-30M34 100c-2-10-6-16-12-18M42 70c4-2 8-2 10 0" />
          <path d="M6 100h92" />
        </svg>
      );
    case "team":
      return (
        <svg className="absolute inset-0 h-full w-full text-navy/20" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice" aria-hidden>
          <circle cx="50" cy="40" r="15" fill="currentColor" />
          <path d="M20 100c2-22 14-34 30-34s28 12 30 34Z" fill="currentColor" />
        </svg>
      );
    case "before":
      return <div className="grain absolute inset-0 opacity-40 mix-blend-multiply" />;
    case "after":
      return (
        <>
          <div className="absolute left-[30%] top-[20%] h-1/2 aspect-square rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.8)_0%,transparent_70%)]" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
            {[[30, 30], [70, 40], [55, 70], [22, 62]].map(([x, y], i) => (
              <path key={i} transform={`translate(${x} ${y}) scale(.35)`} d="M0-10c1 7 3 9 10 10-7 1-9 3-10 10-1-7-3-9-10-10 7-1 9-3 10-10Z" fill="rgba(201,162,75,.8)" />
            ))}
          </svg>
        </>
      );
  }
}

export function ArtFrame({ variant, src, alt, className = "", priority = false, children }: ArtFrameProps) {
  return (
    <div
      className={`isolate overflow-hidden ${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} ${className}`}
      style={{ background: backgrounds[variant] }}
      role={src ? undefined : "img"}
      aria-label={src ? undefined : alt}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      ) : (
        <Motif variant={variant} />
      )}
      {children}
    </div>
  );
}
