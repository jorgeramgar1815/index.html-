"use client";

import { m } from "framer-motion";
import { HandIcon, LotusIcon, WhatsAppIcon } from "./Icons";

const icons = { whatsapp: WhatsAppIcon, hand: HandIcon, lotus: LotusIcon };

type Step = { icon: keyof typeof icons; title: string; body: string };

const ease = [0.22, 1, 0.36, 1] as const;

/** Pasos conectados por una línea dorada que se dibuja al hacer scroll. */
export function RitualSteps({ steps }: { steps: Step[] }) {
  return (
    <m.ol
      className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {/* Línea conectora: horizontal en desktop, vertical en móvil */}
      <svg aria-hidden className="absolute left-[16.6%] right-[16.6%] top-10 hidden h-4 md:block" viewBox="0 0 100 4" preserveAspectRatio="none">
        <m.path
          d="M0 2 Q25 0 50 2 T100 2"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 1.6, ease, delay: 0.3 } } }}
        />
      </svg>
      <svg aria-hidden className="absolute bottom-10 left-10 top-10 w-2 md:hidden" viewBox="0 0 4 100" preserveAspectRatio="none">
        <m.path
          d="M2 0 V100"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 1.4, ease, delay: 0.2 } } }}
        />
      </svg>

      {steps.map((s, i) => {
        const Icon = icons[s.icon];
        return (
        <m.li
          key={s.title}
          className="relative flex items-start gap-6 md:flex-col md:items-center md:text-center"
          variants={{
            hidden: { opacity: 0, y: 18 },
            show: { opacity: 1, y: 0, transition: { duration: 0.8, ease, delay: 0.25 + i * 0.35 } },
          }}
        >
          <span className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-cream-50 text-jade-ink shadow-soft ring-1 ring-gold/40">
            <span aria-hidden className="absolute inset-[-6px] rounded-full border border-gold/30" />
            <Icon size={30} />
            <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-navy font-serif text-sm text-cream">
              {i + 1}
            </span>
          </span>
          <div className="pt-3 md:pt-0">
            <h3 className="text-[1.75rem] leading-tight text-navy md:mt-6">{s.title}</h3>
            <p className="mt-1.5 text-[0.98rem] text-stone">{s.body}</p>
          </div>
        </m.li>
        );
      })}
    </m.ol>
  );
}
