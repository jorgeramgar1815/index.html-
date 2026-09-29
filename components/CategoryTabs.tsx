"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/content/services";

/** Índice fijo de categorías con subrayado en la sección visible. */
export function CategoryTabs({ items }: { items: Pick<Category, "slug" | "short">[] }) {
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
    <nav aria-label="Categorías de servicio" className="sticky top-[58px] z-30 border-y border-ink/15 bg-cream/95">
      <ol className="no-scrollbar mx-auto flex max-w-[88rem] overflow-x-auto px-5 sm:px-8">
        {items.map((c, i) => {
          const isActive = active === c.slug;
          return (
            <li key={c.slug} className="shrink-0">
              <a
                href={`#${c.slug}`}
                aria-current={isActive ? "true" : undefined}
                className={`relative flex min-h-14 items-center gap-2 px-4 text-sm transition-colors duration-300 first:pl-0 ${isActive ? "text-ink" : "text-stone hover:text-ink"}`}
              >
                <span className="eyebrow text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-lg">{c.short}</span>
                <span
                  aria-hidden
                  className={`absolute inset-x-4 bottom-0 h-[2px] origin-left bg-jade-ink transition-transform duration-500 ${isActive ? "scale-x-100" : "scale-x-0"}`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
