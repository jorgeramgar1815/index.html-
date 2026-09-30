import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArtFrame } from "@/components/ArtFrame";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Bubbles } from "@/components/Decor";
import { ArrowIcon, categoryIcons, ChevronIcon, ClockIcon, HeartIcon, PinIcon, ShieldIcon, SparkleIcon, WhatsAppIcon } from "@/components/Icons";
import { Badge, Checks, PillCTA, PillLink, Title } from "@/components/landing/Kit";
import { Lotus } from "@/components/Lotus";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { categories } from "@/content/services";
import { fullAddress, site } from "@/content/site";
import { waLink, waMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Prototipo landing",
  description: site.description,
  // Prototipo en revisión: no indexar hasta que se apruebe
  robots: { index: false, follow: false },
  alternates: { canonical: "/landing/" },
};

const benefits = [
  { icon: SparkleIcon, title: "Tecnología facial", body: "Hydrafacial, oxígeno y microneedling." },
  { icon: ShieldIcon, title: "Valoración previa", body: "Un plan a la medida de tu piel." },
  { icon: HeartIcon, title: "Trato de spa", body: "Tiempo solo para ti, sin prisas." },
  { icon: WhatsAppIcon, title: "Agenda en 1 minuto", body: "Todo por WhatsApp." },
];

const steps = [
  { title: "Escríbenos", body: "Elige tratamiento y horario por WhatsApp." },
  { title: "Valoración", body: "Revisamos tu caso y te proponemos un plan." },
  { title: "Disfruta", body: "Relájate: este es tu momento." },
];

// PLACEHOLDER: respuestas a confirmar con la clienta (pagos, duración, vigencia de promo)
const faqs = [
  { q: "¿Cómo agendo mi cita?", a: `Escríbenos por WhatsApp al ${site.phoneDisplay} y te compartimos los horarios disponibles.` },
  { q: "¿Necesito una valoración previa?", a: "Sí. Antes de cada tratamiento revisamos tu caso para recomendarte lo que mejor te funcione." },
  { q: "¿Cuánto dura una sesión?", a: "Entre 30 y 90 minutos, según el tratamiento." },
  { q: "¿La promo de Hydrafacial sigue vigente?", a: "Es la promoción del mes. Pregúntanos por WhatsApp la vigencia y los horarios con cupo." },
  { q: "¿Qué formas de pago aceptan?", a: "Te confirmamos las formas de pago al agendar tu cita." },
  { q: "¿Dónde están?", a: `${fullAddress}. ${site.address.between}.` },
];

const hydra = categories[0].treatments[0];

export default function LandingPage() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=16&output=embed`;

  return (
    <>
      {/* ================= HERO ================= */}
      <section
        id="inicio"
        aria-labelledby="hero-titulo"
        className="relative overflow-hidden pb-24 pt-14 sm:pb-32 sm:pt-20"
        style={{
          background:
            "radial-gradient(60% 50% at 12% 18%, rgba(58,166,160,.22), transparent 70%), radial-gradient(55% 45% at 90% 12%, rgba(201,162,75,.22), transparent 70%), var(--color-cream)",
        }}
      >
        <Bubbles count={8} />
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="rise" style={{ "--d": ".05s" } as CSSProperties}>
            <Badge>
              <Lotus className="h-4 w-4" strokeWidth={2} /> Mesoterapia & Spa · Torreón
            </Badge>
          </div>
          <h1 id="hero-titulo" className="rise mt-5 text-[clamp(3rem,12vw,5.75rem)] leading-none tracking-[-0.01em]" style={{ "--d": ".12s" } as CSSProperties}>
            Reduzen
            <span className="sr-only"> — Mesoterapia & Spa en Torreón</span>
          </h1>
          <p className="rise mx-auto mt-4 max-w-xl font-serif text-xl italic text-jade-500 sm:text-2xl" style={{ "--d": ".2s" } as CSSProperties}>
            Florece desde adentro.
          </p>
          <p className="rise mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed text-stone" style={{ "--d": ".26s" } as CSSProperties}>
            Faciales, corporales, uñas, pedicure y depilación láser con tecnología y trato de spa.
          </p>
          <div className="rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ "--d": ".34s" } as CSSProperties}>
            <PillCTA message={waMessages.hero} size="lg">
              Agenda por WhatsApp
            </PillCTA>
            <PillLink href="#promo">Ver promo del mes</PillLink>
          </div>

          {/* Composición de tres tarjetas */}
          <div className="rise relative mx-auto mt-14 h-[19rem] max-w-3xl sm:mt-16 sm:h-[25rem]" style={{ "--d": ".45s" } as CSSProperties}>
            <div className="absolute left-0 top-10 w-[42%] -rotate-6 sm:left-4 sm:w-[34%]">
              <ArtFrame variant="body" alt="Tratamiento corporal en Reduzen" className="aspect-[3/4] rounded-[1.5rem] shadow-[0_30px_60px_-30px_rgba(27,42,74,.45)]" />
              <span className="absolute -bottom-3 left-4 rounded-full bg-white px-3 py-1.5 text-[0.7rem] font-semibold text-ink shadow">Corporales</span>
            </div>
            <div className="absolute right-0 top-10 w-[42%] rotate-6 sm:right-4 sm:w-[34%]">
              <ArtFrame variant="nails" alt="Uñas y manicure en Reduzen" className="aspect-[3/4] rounded-[1.5rem] shadow-[0_30px_60px_-30px_rgba(27,42,74,.45)]" />
              <span className="absolute -bottom-3 right-4 rounded-full bg-white px-3 py-1.5 text-[0.7rem] font-semibold text-ink shadow">Uñas</span>
            </div>
            <div className="absolute left-1/2 top-0 z-10 w-[52%] -translate-x-1/2 sm:w-[40%]">
              <ArtFrame variant="facial" priority alt="Tratamiento facial Hydrafacial en Reduzen" className="aspect-[3/4] rounded-[1.75rem] ring-4 ring-cream-50 shadow-[0_40px_80px_-30px_rgba(14,23,48,.6)]" />
              <a
                href="#promo"
                className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-gold px-4 py-2 text-[0.75rem] font-semibold text-night shadow-lg sm:text-sm"
              >
                Hydrafacial desde $499
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}
      <section aria-label="Por qué Reduzen" className="relative z-10 -mt-12 px-4 sm:-mt-16 sm:px-6">
        <Stagger as="ul" className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] bg-ink/10 shadow-[0_30px_60px_-40px_rgba(27,42,74,.5)] lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, body }) => (
            <StaggerItem as="li" key={title} className="flex flex-col items-center gap-3 bg-white px-4 py-6 text-center sm:flex-row sm:items-start sm:px-6 sm:py-7 sm:text-left">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-jade/15 text-jade-ink">
                <Icon size={22} />
              </span>
              <span>
                <span className="block text-[0.9rem] font-semibold text-ink">{title}</span>
                <span className="mt-1 hidden text-sm text-stone sm:block">{body}</span>
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ================= SERVICIOS ================= */}
      <section id="servicios" aria-labelledby="servicios-titulo" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Title id="servicios-titulo" badge="Servicios" title={<>Todo para sentirte bien, <em className="text-jade-ink">en un solo lugar.</em></>} />
          <p aria-hidden className="mt-8 text-center text-xs font-medium text-stone sm:hidden">Desliza para ver más →</p>
          {/* Móvil: carrusel deslizable; tablet/escritorio: cuadrícula */}
          <Stagger as="ul" className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 sm:mx-0 sm:mt-12 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6">
            {categories.map((c, i) => {
              const Icon = categoryIcons[c.icon];
              return (
                <StaggerItem
                  as="li"
                  key={c.slug}
                  className={`group flex w-[82%] shrink-0 snap-center flex-col overflow-hidden rounded-[1.75rem] sm:w-auto bg-white shadow-[0_20px_50px_-35px_rgba(27,42,74,.5)] transition-shadow duration-300 hover:shadow-[0_30px_60px_-30px_rgba(27,42,74,.45)] ${i < 2 ? "lg:col-span-3" : "lg:col-span-2"}`}
                >
                  <ArtFrame variant={c.art} src={c.image} alt={`${c.name} en Reduzen`} className={`${i < 2 ? "aspect-[16/9]" : "aspect-[16/10]"} w-full`}>
                    <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-jade-ink">
                      <Icon size={22} />
                    </span>
                  </ArtFrame>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-[1.35rem] leading-tight">{c.short}</h3>
                    <p className="mt-1.5 text-sm text-stone">{c.intro}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {c.treatments.slice(0, 3).map((t) => (
                        <li key={t.slug} className="rounded-full bg-cream px-3 py-1 text-[0.75rem] font-medium text-ink/80">
                          {t.name}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={waLink(waMessages.category(c.name))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-jade-ink"
                    >
                      Pedir información
                      <ArrowIcon size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                      <span className="sr-only"> sobre {c.name} (abre WhatsApp)</span>
                    </a>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
          <Reveal className="mt-10 text-center">
            <Link href="/servicios/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-8 hover:text-jade-ink">
              Ver catálogo completo <ArrowIcon size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ================= PROMO ================= */}
      <section id="promo" aria-labelledby="promo-titulo" className="scroll-mt-20 px-4 sm:px-6">
        <Reveal className="relative mx-auto grid max-w-6xl items-center gap-10 overflow-hidden rounded-[2rem] bg-night p-7 sm:p-12 lg:grid-cols-2 lg:gap-14 lg:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(60% 60% at 100% 0%, rgba(58,166,160,.28), transparent 70%), radial-gradient(50% 60% at 0% 100%, rgba(201,162,75,.18), transparent 70%)" }}
          />
          <div className="relative">
            <Badge tone="night">Promo del mes</Badge>
            <h2 id="promo-titulo" className="mt-5 text-[2rem] leading-none !text-cream sm:text-[2.75rem]">
              {hydra.name}
            </h2>
            <p className="mt-3 max-w-sm text-[0.95rem] text-cream/75">{hydra.summary}</p>
            <Checks dark items={hydra.highlights ?? []} className="mt-6" />
            {/* PLACEHOLDER: precio visto en Facebook; confirmar vigencia */}
            <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-5" data-placeholder="precio-por-confirmar">
              <p className="text-cream">
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-gold">Desde</span>
                <span className="font-serif text-5xl leading-none">$499</span>
                <span className="ml-1 text-sm text-cream/60">MXN</span>
              </p>
              <PillCTA message={waMessages.treatment(hydra.name)} variant="gold" size="lg">
                Quiero mi Hydrafacial
              </PillCTA>
            </div>
            <p className="mt-4 text-xs text-cream/50">*Precio promocional sujeto a vigencia y valoración.</p>
          </div>
          <div className="relative hidden sm:block">
            <ArtFrame variant="facial" alt="Hydrafacial en Reduzen" className="aspect-[4/3] rounded-[1.5rem] ring-1 ring-cream/15 lg:aspect-[5/4]" />
            <span className="absolute -left-2 bottom-6 flex items-center gap-2 rounded-full bg-cream-50 px-4 py-2 text-[0.8rem] font-semibold text-ink shadow-lg sm:-left-5">
              <ClockIcon size={16} className="text-jade-ink" /> {hydra.duration} aprox.
            </span>
          </div>
        </Reveal>
      </section>

      {/* ================= CÓMO AGENDAR ================= */}
      <section id="como-agendar" aria-labelledby="pasos-titulo" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Title id="pasos-titulo" badge="Cómo agendar" title="Tu cita en 3 pasos." />
          <Stagger as="ol" className="relative mt-12 grid gap-5 md:grid-cols-3">
            <span aria-hidden className="absolute left-[16%] right-[16%] top-10 hidden border-t-2 border-dashed border-gold/50 md:block" />
            {steps.map((s, i) => (
              <StaggerItem as="li" key={s.title} className="relative rounded-[1.75rem] bg-cream-50 p-7 text-center ring-1 ring-ink/5">
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-jade-ink font-serif text-2xl text-white ring-8 ring-cream">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-xl">{s.title}</h3>
                <p className="mt-1.5 text-sm text-stone">{s.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-10 text-center">
            <PillCTA message={waMessages.general}>Empezar por WhatsApp</PillCTA>
          </Reveal>
        </div>
      </section>

      {/* ================= RESULTADOS ================= */}
      <section id="resultados" aria-labelledby="resultados-titulo" className="scroll-mt-20 bg-cream-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Title id="resultados-titulo" badge="Resultados" title="Se nota desde la primera sesión." intro="Desliza cada imagen para comparar." />
          {/* PLACEHOLDER: fotos reales antes/después con autorización */}
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Hydrafacial", sessions: "1 sesión" },
              { title: "Microneedling", sessions: "3 sesiones" },
              { title: "Moldeo corporal", sessions: "6 sesiones" },
            ].map((r, i) => (
              <Reveal key={r.title} delay={i * 0.1} className={i === 2 ? "sm:col-span-2 sm:mx-auto sm:w-1/2 lg:col-span-1 lg:w-full" : ""}>
                <BeforeAfter rounded figure={`0${i + 1}`} title={r.title} sessions={r.sessions} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PREGUNTAS ================= */}
      <section id="preguntas" aria-labelledby="faq-titulo" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <Title align="left" id="faq-titulo" badge="Preguntas" title="Resolvemos tus dudas." intro="¿No encuentras la tuya? Escríbenos." />
            <Reveal delay={0.15} className="mt-7">
              <PillCTA message={waMessages.floating} variant="ghost">
                Preguntar por WhatsApp
              </PillCTA>
            </Reveal>
          </div>
          <Reveal className="space-y-3">
            {faqs.map((f, i) => (
              <details key={f.q} open={i === 0} className="group rounded-2xl bg-white px-5 shadow-[0_10px_30px_-25px_rgba(27,42,74,.6)] ring-1 ring-ink/5 open:ring-jade/40 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[0.95rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-jade-ink transition-transform duration-300 group-open:rotate-180">
                    <ChevronIcon size={16} className="rotate-90" />
                  </span>
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-stone">{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ================= CIERRE + CONTACTO ================= */}
      <section id="contacto" aria-labelledby="cierre-titulo" className="scroll-mt-20 px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
          <Reveal className="relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-jade-ink px-6 py-14 text-center sm:px-10">
            <Bubbles count={7} light />
            <Lotus className="relative h-12 w-12 text-gold-pale" accent="var(--color-gold)" />
            <h2 id="cierre-titulo" className="relative mt-5 text-[2rem] leading-tight !text-white sm:text-[2.6rem]">
              Este es <em className="text-gold-pale">tu momento.</em>
            </h2>
            <p className="relative mt-3 max-w-sm text-[0.95rem] text-white/85">Desconecta, renueva tu energía y florece desde adentro.</p>
            <PillCTA message={waMessages.closing} variant="gold" size="lg" className="relative mt-8">
              Reservar mi cita
            </PillCTA>
            <a href={`tel:${site.phoneE164}`} className="relative mt-4 text-sm text-white/85 underline-offset-4 hover:underline">
              o llama al {site.phoneDisplay}
            </a>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col overflow-hidden rounded-[2rem] bg-white ring-1 ring-ink/5">
            <div className="relative aspect-[16/9] bg-cream-100">
              <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
                <Lotus className="h-12 w-12 text-jade-ink" />
              </div>
              <iframe
                title="Mapa: ubicación de Reduzen en Torreón"
                src={mapSrc}
                className="relative h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <ul className="grid gap-4 p-6 text-sm text-ink sm:grid-cols-2 sm:p-7">
              <li className="flex gap-3">
                <PinIcon size={20} className="mt-0.5 shrink-0 text-jade-ink" />
                <span>
                  {site.address.street}
                  <span className="block text-stone">{site.address.neighborhood}, {site.address.city}</span>
                </span>
              </li>
              {/* PLACEHOLDER: horario a confirmar con la clienta */}
              <li className="flex gap-3" data-placeholder="horario-por-confirmar">
                <ClockIcon size={20} className="mt-0.5 shrink-0 text-jade-ink" />
                <span>
                  {site.hours.slice(0, 2).map((h) => (
                    <span key={h.days} className="block">
                      <span className="text-stone">{h.days}:</span> {h.time}
                    </span>
                  ))}
                </span>
              </li>
            </ul>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-6 mb-6 mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-cream py-3 text-sm font-semibold text-ink transition-colors hover:bg-cream-100 sm:mx-7 sm:mb-7"
            >
              Cómo llegar <ArrowIcon size={16} />
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
