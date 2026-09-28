import type { CSSProperties, ReactNode } from "react";
import { waLink } from "@/lib/whatsapp";
import { ArrowIcon, WhatsAppIcon } from "./Icons";

type Variant = "solid" | "outline" | "light" | "gold";

// El color de relleno (--fill) sube desde abajo al hacer hover
const styles: Record<Variant, { cls: string; fill: string }> = {
  // Jade profundo + blanco (5.9:1)
  solid: { cls: "bg-jade-ink text-white hover:text-white", fill: "var(--color-ink)" },
  outline: { cls: "border border-ink/80 text-ink hover:text-cream-50", fill: "var(--color-ink)" },
  light: { cls: "border border-cream/40 text-cream hover:text-night", fill: "var(--color-cream-50)" },
  // Dorado + marino (7.4:1) — sobre fondos oscuros
  gold: { cls: "bg-gold text-night hover:text-night", fill: "var(--color-cream-50)" },
};

type WhatsAppButtonProps = {
  message?: string;
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  className?: string;
};

/** CTA rectangular de WhatsApp con mensaje prellenado contextual. */
export function WhatsAppButton({ message, children, variant = "solid", size = "md", className = "" }: WhatsAppButtonProps) {
  const sizes = size === "lg" ? "min-h-16 px-6 text-base sm:px-8" : "min-h-13 px-5 text-sm sm:px-6";
  const v = styles[variant];
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      style={{ "--fill": v.fill } as CSSProperties}
      className={`btn-fill group inline-flex items-center justify-between gap-6 whitespace-nowrap font-medium tracking-wide transition-colors duration-500 ${sizes} ${v.cls} ${className}`}
    >
      <span className="inline-flex items-center gap-3">
        <WhatsAppIcon size={size === "lg" ? 22 : 19} />
        {children}
      </span>
      <ArrowIcon size={20} className="-rotate-45 transition-transform duration-500 group-hover:rotate-0" />
      <span className="sr-only"> (abre WhatsApp en una pestaña nueva)</span>
    </a>
  );
}

/** Botón flotante (esquina inferior derecha) presente en todas las vistas. */
export function WhatsAppFloat({ message }: { message: string }) {
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-jade-ink text-white ring-2 ring-cream-50/80 shadow-[0_18px_40px_-14px_rgba(18,26,44,.5)] animate-pulse-soft transition-transform duration-300 hover:-translate-y-1 sm:bottom-7 sm:right-7 sm:h-16 sm:w-16"
    >
      <WhatsAppIcon size={28} />
      <span className="sr-only">Escríbenos por WhatsApp</span>
      <span aria-hidden className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap bg-ink px-4 py-2 text-xs tracking-wide text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
        ¿Agendamos tu cita?
      </span>
    </a>
  );
}
