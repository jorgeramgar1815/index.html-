"use client";

import { useEffect, useState } from "react";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./Icons";

/** Botón flotante de WhatsApp. En celular aparece al bajar, para no tapar la portada. */
export function WhatsAppFloat({ message }: { message: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 360);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-jade-ink text-white ring-2 ring-cream-50/80 shadow-[0_18px_40px_-14px_rgba(18,26,44,.5)] animate-pulse-soft transition-all duration-300 hover:-translate-y-1 sm:bottom-7 sm:right-7 sm:h-16 sm:w-16 ${
        shown ? "" : "max-sm:pointer-events-none max-sm:translate-y-24 max-sm:opacity-0"
      }`}
    >
      <WhatsAppIcon size={28} />
      <span className="sr-only">Escríbenos por WhatsApp</span>
      <span aria-hidden className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap bg-ink px-4 py-2 text-xs tracking-wide text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
        ¿Agendamos tu cita?
      </span>
    </a>
  );
}
