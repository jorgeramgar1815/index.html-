"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";

// Índice de la fila de horario que corresponde a cada día (0 = domingo)
const rowForDay = [2, 0, 0, 0, 0, 0, 1];

/** Horario con el día de hoy resaltado (hora de Torreón). Se calcula en el cliente para no fijarlo en el HTML estático. */
export function HoursTable() {
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/Monterrey" }).format(new Date());
    const idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day);
    if (idx >= 0) setToday(rowForDay[idx]);
  }, []);

  return (
    // PLACEHOLDER: horario a confirmar con la clienta (content/site.ts)
    <ul className="mt-5 divide-y divide-cream/15 border-y border-cream/15" data-placeholder="horario-por-confirmar">
      {site.hours.map((h, i) => {
        const isToday = i === today;
        return (
          <li key={h.days} className={`flex items-center justify-between gap-4 py-3.5 text-[0.98rem] ${isToday ? "text-white" : "text-cream/75"}`}>
            <span className="flex items-center gap-3">
              {h.days}
              {isToday && <span className="bg-gold px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-night">Hoy</span>}
            </span>
            <span className={isToday ? "font-semibold" : ""}>{h.time}</span>
          </li>
        );
      })}
    </ul>
  );
}
