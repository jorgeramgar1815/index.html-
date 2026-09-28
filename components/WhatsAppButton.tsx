import type { ReactNode } from "react";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./Icons";

type Variant = "primary" | "gold" | "outline" | "ghost-light";

const styles: Record<Variant, string> = {
  // Jade profundo + texto blanco (5.9:1) — CTA principal sobre crema
  primary:
    "bg-jade-ink text-white shadow-soft hover:bg-[#1a5f5c] hover:shadow-glow",
  // Dorado + marino (7.1:1) — CTA sobre fondos oscuros
  gold: "bg-gold text-night shadow-[0_10px_30px_-12px_rgba(201,162,75,.6)] hover:bg-gold-soft hover:shadow-glow",
  outline:
    "border border-navy/25 text-navy hover:border-gold hover:bg-cream-50 hover:shadow-glow",
  "ghost-light": "border border-cream/30 text-cream hover:border-gold hover:text-gold",
};

type WhatsAppButtonProps = {
  message?: string;
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  className?: string;
  icon?: boolean;
};

/** CTA de WhatsApp con mensaje prellenado contextual. */
export function WhatsAppButton({
  message,
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon = true,
}: WhatsAppButtonProps) {
  const sizes = size === "lg" ? "min-h-14 px-7 text-[0.95rem]" : "min-h-12 px-6 text-sm";
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-shine inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5 ${sizes} ${styles[variant]} ${className}`}
    >
      {icon && <WhatsAppIcon size={size === "lg" ? 22 : 19} />}
      <span>{children}</span>
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
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-jade-ink text-white shadow-lift ring-1 ring-white/30 transition-transform duration-300 animate-pulse-soft hover:-translate-y-1 hover:bg-[#1a5f5c] sm:bottom-7 sm:right-7 sm:h-16 sm:w-16"
    >
      <WhatsAppIcon size={28} />
      <span className="sr-only">Escríbenos por WhatsApp</span>
      <span aria-hidden className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-navy px-4 py-2 text-xs tracking-wide text-cream opacity-0 shadow-soft transition-opacity duration-300 group-hover:opacity-100 sm:block">
        ¿Agendamos tu cita?
      </span>
    </a>
  );
}
