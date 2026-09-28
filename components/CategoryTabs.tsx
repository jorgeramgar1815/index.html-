"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/content/services";
import { categoryIcons } from "./Icons";

/** Navegación por anclas entre categorías, con resaltado de la sección visible. */
export function CategoryTabs({ items }: { items: Pick<Category, "slug" | "short" | "icon">[] }) {
  const [active, setActive] = useState(items[0]?.slug);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    items.forEach((i) => {
      const el = document.getElementById(i.slug);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Categorías de servicio" className="sticky top-[62px] z-30 border-y border-navy/10 bg-cream-50/92 backdrop-blur-md">
      <ul className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 sm:justify-center sm:px-6">
        {items.map((c) => {
          const Icon = categoryIcons[c.icon];
          const isActive = active === c.slug;
          return (
            <li key={c.slug} className="shrink-0">
              <a
                href={`#${c.slug}`}
                aria-current={isActive ? "true" : undefined}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm tracking-wide transition-all duration-300 ${
                  isActive ? "bg-navy text-cream shadow-soft" : "text-navy/80 hover:bg-cream-100 hover:text-navy"
                }`}
              >
                <Icon size={18} className={isActive ? "text-gold" : "text-jade-ink"} />
                {c.short}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
