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
  const sizes = size === "lg" ? "min-h-14 px-6 text-[0.95rem] sm:px-7" : "min-h-12 px-5 text-sm sm:px-6";
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
