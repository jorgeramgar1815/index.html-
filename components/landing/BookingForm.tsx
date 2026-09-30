"use client";

import { useId, useState } from "react";
import type { Category } from "@/content/services";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "../Icons";

const days = ["Lo antes posible", "Entre semana", "Sábado"] as const;
const times = ["Mañana", "Tarde"] as const;

const field =
  "mt-2 block h-12 w-full rounded-[3px] border border-ink/20 bg-cream-50 px-4 text-[0.95rem] text-ink outline-none transition-colors focus:border-jade-ink focus:ring-2 focus:ring-jade/30";
const label = "text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink/80";

/** Pre-reserva: arma el mensaje de WhatsApp con los datos elegidos (no guarda nada). */
export function BookingForm({ categories }: { categories: Category[] }) {
  const id = useId();
  const [name, setName] = useState("");
  const [treatment, setTreatment] = useState(categories[0].treatments[0].name);
  const [day, setDay] = useState<string>(days[0]);
  const [time, setTime] = useState<string>(times[0]);

  const message = [
    `Hola${name.trim() ? `, soy ${name.trim()}` : ""}. Quiero reservar en Reduzen.`,
    `Tratamiento: ${treatment}.`,
    `Día: ${day.toLowerCase()}, por la ${time.toLowerCase()}.`,
  ].join(" ");

  return (
    <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} aria-describedby={`${id}-nota`}>
      <label className="sm:col-span-2">
        <span className={label}>Tu nombre</span>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="Opcional" />
      </label>
      <label className="sm:col-span-2">
        <span className={label}>Tratamiento</span>
        <select className={field} value={treatment} onChange={(e) => setTreatment(e.target.value)}>
          {categories.map((c) => (
            <optgroup key={c.slug} label={c.short}>
              {c.treatments.map((t) => (
                <option key={t.slug}>{t.name}</option>
              ))}
            </optgroup>
          ))}
          <option>No sé, quiero una recomendación</option>
        </select>
      </label>
      <fieldset>
        <legend className={label}>Día</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {days.map((d) => (
            <Chip key={d} name={`${id}-dia`} value={d} checked={day === d} onChange={setDay} />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className={label}>Horario</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {times.map((t) => (
            <Chip key={t} name={`${id}-hora`} value={t} checked={time === t} onChange={setTime} />
          ))}
        </div>
      </fieldset>
      <a
        href={waLink(message)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-14 items-center justify-center gap-3 rounded-[3px] bg-jade-ink text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink sm:col-span-2"
      >
        <WhatsAppIcon size={20} /> Enviar por WhatsApp
        <span className="sr-only"> (abre una pestaña nueva)</span>
      </a>
      <p id={`${id}-nota`} className="text-xs text-stone sm:col-span-2">
        Se abre WhatsApp con tu mensaje listo; te confirmamos el horario disponible.
      </p>
    </form>
  );
}

function Chip({ name, value, checked, onChange }: { name: string; value: string; checked: boolean; onChange: (v: string) => void }) {
  return (
    <label
      className={`cursor-pointer rounded-[3px] border px-3.5 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-jade/40 ${
        checked ? "border-jade-ink bg-jade-ink text-white" : "border-ink/20 bg-cream-50 text-ink hover:border-jade-ink"
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
      {value}
    </label>
  );
}
