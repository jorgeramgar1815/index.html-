"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, m } from "framer-motion";
import { navLinks, pageLinks, site } from "@/content/site";
import { waLink, waMessages } from "@/lib/whatsapp";
import { ArrowIcon, CloseIcon, WhatsAppIcon } from "./Icons";
import { Wordmark } from "./Lotus";

const ease = [0.76, 0, 0.24, 1] as const;

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

  const links = [...navLinks, ...pageLinks.filter((l) => l.href === "/nosotros/")];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,padding] duration-500 ${
          open
            ? "border-transparent bg-transparent py-5"
            : scrolled
              ? "border-ink/10 bg-cream/95 py-3"
              : "border-transparent py-5"
        }`}
      >
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
        >
          Saltar al contenido
        </a>
        <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" className="shrink-0">
            <Wordmark light={open} />
            <span className="sr-only">, ir al inicio</span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-8 xl:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="link-draw eyebrow !text-[0.68rem] text-ink/80 hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={waLink(waMessages.header)}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn-fill hidden min-h-11 items-center gap-2 px-5 text-sm font-medium transition-colors duration-500 sm:inline-flex ${
                open ? "border border-cream/40 text-cream" : "bg-ink text-cream-50"
              }`}
              style={{ "--fill": "var(--color-jade-ink)" } as CSSProperties}
            >
              <WhatsAppIcon size={17} />
              Agenda tu cita
            </a>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-movil"
              className={`flex min-h-11 items-center gap-3 px-2 xl:hidden ${open ? "text-cream" : "text-ink"}`}
            >
              <span className="eyebrow">{open ? "Cerrar" : "Menú"}</span>
              {open ? (
                <CloseIcon size={22} />
              ) : (
                <span aria-hidden className="flex w-6 flex-col gap-1.5">
                  <span className="h-px w-full bg-current" />
                  <span className="h-px w-2/3 bg-current" />
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Fuera del <header>: menú a pantalla completa en jade profundo */}
      <AnimatePresence>
        {open && (
          <m.div
            id="menu-movil"
            className="on-dark fixed inset-0 z-[45] flex flex-col overflow-y-auto bg-jade-ink px-5 pb-10 pt-28 text-cream sm:px-8 xl:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease }}
          >
            <nav aria-label="Menú móvil" className="flex-1">
              <ol>
                {[...navLinks, ...pageLinks].map((l, i) => (
                  <li key={l.href} className="overflow-hidden border-b border-cream/15">
                    <m.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.7, ease, delay: 0.15 + i * 0.05 }}>
                      <Link href={l.href} onClick={() => setOpen(false)} className="group flex items-baseline gap-5 py-3.5">
                        <span className="eyebrow w-6 text-gold-pale">{String(i + 1).padStart(2, "0")}</span>
                        <span className="font-serif text-[1.75rem] leading-none text-cream transition-transform duration-500 group-hover:translate-x-2">
                          {l.label}
                        </span>
                        <ArrowIcon size={22} className="ml-auto -rotate-45 text-gold-pale opacity-70" />
                      </Link>
                    </m.div>
                  </li>
                ))}
              </ol>
            </nav>
            <a
              href={waLink(waMessages.header)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 flex min-h-16 items-center justify-between bg-gold px-6 text-base font-medium text-night"
            >
              <span className="flex items-center gap-3">
                <WhatsAppIcon size={22} />
                Agenda por WhatsApp
              </span>
              <ArrowIcon size={20} />
            </a>
            <p className="eyebrow mt-6 text-cream/70">
              {site.phoneDisplay} · {site.address.city}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
