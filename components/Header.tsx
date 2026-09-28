"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { navLinks, pageLinks } from "@/content/site";
import { waLink, waMessages } from "@/lib/whatsapp";
import { CloseIcon, MenuIcon, WhatsAppIcon } from "./Icons";
import { Wordmark } from "./Lotus";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid
            ? "bg-cream/92 py-2.5 shadow-[0_8px_30px_-18px_rgba(27,42,74,.35)] backdrop-blur-md"
            : "bg-transparent py-4 sm:py-5"
        }`}
      >
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-cream"
        >
          Saltar al contenido
        </a>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
          <Link href="/" className="shrink-0">
            <Wordmark />
            <span className="sr-only">, ir al inicio</span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-7 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="relative text-[0.8rem] uppercase tracking-[0.18em] text-navy/80 transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:text-navy hover:after:scale-x-100"
              >
                {l.label}
              </Link>
            ))}
            <span className="h-4 w-px bg-navy/15" aria-hidden />
            <Link
              href="/nosotros/"
              aria-current={pathname?.startsWith("/nosotros") ? "page" : undefined}
              className="text-[0.8rem] uppercase tracking-[0.18em] text-navy/80 transition-colors hover:text-navy aria-[current=page]:text-jade-ink"
            >
              Nosotros
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={waLink(waMessages.header)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine hidden min-h-11 items-center gap-2 rounded-full bg-jade-ink px-5 text-sm font-medium tracking-wide text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow sm:inline-flex"
            >
              <WhatsAppIcon size={18} />
              Agenda tu cita
            </a>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-movil"
              className="flex h-11 w-11 items-center justify-center rounded-full text-navy transition-colors hover:bg-navy/5 lg:hidden"
            >
              <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
              {open ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

      </header>

      {/* Fuera del <header>: su backdrop-filter crearía un bloque contenedor para el menú fijo */}
      <AnimatePresence>
        {open && (
          <m.div
            id="menu-movil"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 top-[64px] z-[45] overflow-y-auto bg-cream px-6 pb-10 pt-6 lg:hidden"
          >
            <nav aria-label="Menú móvil" className="flex flex-col">
              {[...navLinks, ...pageLinks].map((l, i) => (
                <m.div
                  key={l.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i + 0.05, duration: 0.4 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-navy/10 py-4 font-serif text-2xl text-navy"
                  >
                    {l.label}
                    <span className="text-gold" aria-hidden>
                      ✦
                    </span>
                  </Link>
                </m.div>
              ))}
            </nav>
            <a
              href={waLink(waMessages.header)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-jade-ink text-base font-medium text-white shadow-soft"
            >
              <WhatsAppIcon size={22} />
              Agenda tu cita por WhatsApp
            </a>
            <p className="script mt-10 text-center text-4xl text-gold-ink">Te mereces este espacio</p>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
