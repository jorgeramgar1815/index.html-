"use client";

import Link from "next/link";
import { useRef } from "react";
import { CloseIcon, MenuIcon } from "../Icons";

/** Menú desplegable para celular; se cierra al elegir un enlace. */
export function MobileMenu({ links }: { links: readonly { href: string; label: string }[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const close = () => ref.current?.removeAttribute("open");
  return (
    <details ref={ref} className="group relative lg:hidden" onKeyDown={(e) => e.key === "Escape" && close()}>
      <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-[3px] border border-ink/20 text-ink [&::-webkit-details-marker]:hidden">
        <MenuIcon size={20} className="group-open:hidden" />
        <CloseIcon size={20} className="hidden group-open:block" />
        <span className="sr-only">Menú</span>
      </summary>
      <nav aria-label="Menú" className="absolute right-0 top-12 w-56 border border-gold/30 bg-cream-50 py-2 shadow-[0_20px_40px_-20px_rgba(27,42,74,.5)]">
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={close}
                className="block px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-ink hover:bg-cream-100 hover:text-jade-ink"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
