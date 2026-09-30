import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArtFrame } from "@/components/ArtFrame";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Bubbles } from "@/components/Decor";
import { ArrowIcon, ClockIcon, PhoneIcon, PinIcon } from "@/components/Icons";
import { BookingForm } from "@/components/landing/BookingForm";
import { Ornament, SpaButton, SpaLink, SpaTitle } from "@/components/landing/Kit";
import { TreatmentMenu } from "@/components/landing/TreatmentMenu";
import { Lotus } from "@/components/Lotus";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { categories } from "@/content/services";
import { site } from "@/content/site";
import { waMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Prototipo landing",
  description: site.description,
  // Prototipo en revisión: no indexar hasta que se apruebe
  robots: { index: false, follow: false },
  alternates: { canonical: "/landing/" },
};

const d = (s: string) => ({ "--d": s }) as CSSProperties;
const total = categories.reduce((n, c) => n + c.treatments.length, 0);

// PLACEHOLDER: rituales (paquetes) sugeridos; confirmar combinaciones y precios con la clienta
const rituals = [
  { name: "Ritual Glow", art: "facial", items: ["Hydrafacial", "Hidralips"], note: "Piel luminosa y labios hidratados." },
  { name: "Ritual Ligereza", art: "body", items: ["Mesoterapia corporal", "Drenaje linfático"], note: "Desinflama y moldea." },
  { name: "Ritual Manos & Pies", art: "pedicure", items: ["Manicure spa", "Pedicure spa"], note: "Un rato completo para ti." },
] as const;

export default function LandingPage() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=16&output=embed`;

  return (
    <>
      {/* ================= HERO DIVIDIDO CON ARCO ================= */}
      <section id="inicio" aria-labelledby="hero-titulo" className="relative overflow-hidden bg-cream-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:min-h-[calc(100svh-7.25rem)] lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:py-16">
          <div className="text-center lg:text-left">
            <div className="rise" style={d(".05s")}>
              <Ornament align="left" className="justify-center lg:justify-start">Mesoterapia & Spa · Torreón</Ornament>
            </div>
            <h1 id="hero-titulo" className="rise mt-6 text-[clamp(3.4rem,11vw,6.6rem)] leading-[0.95] tracking-[-0.01em]" style={d(".12s")}>
              Reduzen
              <span className="sr-only"> — Mesoterapia & Spa en Torreón</span>
            </h1>
            <p className="rise mt-3 font-serif text-2xl italic text-jade-ink sm:text-[1.9rem]" style={d(".2s")}>
              Florece desde adentro.
            </p>
            <p className="rise mx-auto mt-6 max-w-md text-[0.95rem] leading-relaxed text-stone lg:mx-0" style={d(".28s")}>
              Tratamientos faciales y corporales, uñas, pedicure y láser en un espacio pensado para desconectar.
            </p>
            <div className="rise mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start" style={d(".36s")}>
              <SpaButton message={waMessages.hero}>Reservar cita</SpaButton>
              <SpaLink href="#menu">Ver tratamientos</SpaLink>
            </div>
            <a href={`tel:${site.phoneE164}`} className="rise mt-7 inline-flex items-center gap-2 text-sm text-ink/80 hover:text-jade-ink" style={d(".44s")}>
              <PhoneIcon size={16} className="text-jade-ink" /> {site.phoneDisplay}
            </a>
          </div>

          {/* Arco con imagen, sello giratorio y tarjeta de promo */}
          <div className="rise relative mx-auto w-full max-w-[22rem] sm:max-w-[26rem]" style={d(".3s")}>
            <span aria-hidden className="absolute -right-2 -top-4 bottom-8 left-6 rounded-t-full border border-gold/60 sm:-right-4" />
            <ArtFrame variant="portrait" priority alt="Clienta relajándose en Reduzen" className="aspect-[4/5] rounded-t-full shadow-[0_40px_80px_-40px_rgba(27,42,74,.45)]" />
            <div aria-hidden className="absolute -left-6 bottom-16 h-28 w-28 sm:-left-10 sm:h-32 sm:w-32">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-jade-ink text-white shadow-lg">
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-spin-slow">
                  <defs>
                    <path id="sello" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0" />
                  </defs>
                  <text fontSize="8.4" letterSpacing="2.6" fill="currentColor" fontFamily="var(--font-body)" fontWeight="600">
                    <textPath href="#sello">FLORECE · DESDE · ADENTRO · </textPath>
                  </text>
                </svg>
                <Lotus className="h-9 w-9 text-gold-pale" accent="var(--color-gold)" />
              </div>
            </div>
            {/* PLACEHOLDER: promo vista en Facebook; confirmar vigencia */}
            <a
              href="#menu"
              className="absolute -bottom-6 right-0 bg-white px-5 py-3.5 text-left shadow-[0_20px_40px_-20px_rgba(27,42,74,.5)] transition-transform hover:-translate-y-1 sm:-right-6"
              data-placeholder="precio-por-confirmar"
            >
              <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-ink">Promo del mes</span>
              <span className="mt-0.5 block font-serif text-xl text-ink">Hydrafacial $499</span>
            </a>
          </div>
        </div>
      </section>

      {/* ================= BIENVENIDA ================= */}
      <section id="bienvenida" aria-labelledby="bienvenida-titulo" className="scroll-mt-24 py-24 sm:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative mx-auto h-[26rem] w-full max-w-md sm:h-[30rem]">
            <span aria-hidden className="absolute left-4 top-4 h-[85%] w-[64%] rounded-t-full border border-gold/50" />
            <ArtFrame variant="body" alt="Recepción de Reduzen" className="absolute left-0 top-0 h-[85%] w-[64%] rounded-t-full" />
            <ArtFrame variant="facial" alt="Cabina de faciales" className="absolute bottom-0 right-0 h-[62%] w-[50%] rounded-t-full ring-8 ring-cream" />
          </Reveal>
          <div>
            <SpaTitle
              align="left"
              id="bienvenida-titulo"
              eyebrow="Bienvenida"
              title={<>Un spa boutique para <em className="text-jade-ink">volver a ti.</em></>}
              intro="Combinamos mesoterapia, tecnología facial y el cuidado de un spa para que salgas renovada, sin prisas."
            />
            <Stagger as="ul" className="mt-10 grid grid-cols-3 divide-x divide-gold/40 border-y border-gold/40 py-6 text-center">
              {[
                { n: String(categories.length), l: "Categorías" },
                { n: String(total), l: "Tratamientos" },
                { n: "1:1", l: "Valoración" },
              ].map((s) => (
                <StaggerItem as="li" key={s.l}>
                  <span className="block font-serif text-4xl text-jade-ink">{s.n}</span>
                  <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-stone">{s.l}</span>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.1} className="mt-8 flex items-center justify-between gap-4">
              <p className="font-serif text-xl italic text-ink">— Equipo Reduzen</p>
              <Link href="/nosotros/" className="inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-jade-ink hover:text-ink">
                Conócenos <ArrowIcon size={14} />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= CARTA DE TRATAMIENTOS ================= */}
      <section id="menu" aria-labelledby="menu-titulo" className="scroll-mt-24 bg-cream-100 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SpaTitle id="menu-titulo" eyebrow="Carta de tratamientos" title={<>Elige tu <em className="text-jade-ink">momento.</em></>} />
          <Reveal className="mt-14">
            <TreatmentMenu items={categories} />
          </Reveal>
        </div>
      </section>

      {/* ================= FRASE ================= */}
      <section aria-label="Nuestra filosofía" className="relative overflow-hidden bg-jade-ink py-24 text-center sm:py-28">
        <Bubbles count={10} light />
        <Reveal className="relative mx-auto max-w-3xl px-4">
          <Lotus className="mx-auto h-10 w-10 text-gold-pale" accent="var(--color-gold)" />
          <p className="mt-6 font-serif text-[2.1rem] italic leading-tight text-white sm:text-[3.2rem]">“Te mereces este espacio.”</p>
          <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold-pale">Desconecta · Renueva · Florece</p>
        </Reveal>
      </section>

      {/* ================= RITUALES ================= */}
      <section id="rituales" aria-labelledby="rituales-titulo" className="scroll-mt-24 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SpaTitle id="rituales-titulo" eyebrow="Rituales" title="Combina y consiéntete." intro="Dos tratamientos en una misma visita." />
          <Stagger as="ul" className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {rituals.map((r, i) => (
              <StaggerItem as="li" key={r.name} className={`text-center ${i === 1 ? "lg:mt-12" : ""} ${i === 2 ? "sm:col-span-2 sm:mx-auto sm:w-1/2 lg:col-span-1 lg:w-full" : ""}`}>
                <div className="relative mx-auto max-w-[19rem]">
                  <ArtFrame variant={r.art} alt={r.name} className="aspect-[3/4] rounded-t-full" />
                  <span className="absolute inset-x-0 -bottom-4 mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-gold font-serif text-night">{i + 1}</span>
                </div>
                <h3 className="mt-9 text-2xl">{r.name}</h3>
                <p className="mt-2 text-sm text-stone">{r.note}</p>
                <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-ink">{r.items.join(" + ")}</p>
                <SpaButton message={`Hola, quiero información del ${r.name} (${r.items.join(" + ")}).`} variant="line" icon={false} className="mt-6 !h-11">
                  Pedir precio
                </SpaButton>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ================= RESULTADOS ================= */}
      <section id="resultados" aria-labelledby="resultados-titulo" className="scroll-mt-24 bg-cream-50 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SpaTitle align="left" id="resultados-titulo" eyebrow="Resultados" title="Cambios que se sienten." intro="Desliza cada imagen para comparar antes y después." />
            <Reveal delay={0.1}>
              <SpaButton message={waMessages.results} variant="line">Quiero mi valoración</SpaButton>
            </Reveal>
          </div>
          {/* PLACEHOLDER: fotos reales antes/después con autorización */}
          <div className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:gap-8">
            {[
              { title: "Hydrafacial", sessions: "1 sesión" },
              { title: "Microneedling", sessions: "3 sesiones" },
              { title: "Moldeo corporal", sessions: "6 sesiones" },
            ].map((r, i) => (
              <Reveal key={r.title} delay={i * 0.1} className="w-[75%] shrink-0 snap-center sm:w-auto">
                <BeforeAfter figure={`0${i + 1}`} title={r.title} sessions={r.sessions} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HORARIO + RESERVA ================= */}
      <section id="reserva" aria-labelledby="reserva-titulo" className="scroll-mt-24 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SpaTitle id="reserva-titulo" eyebrow="Reserva" title={<>Este es <em className="text-jade-ink">tu momento.</em></>} />
          <div className="mt-14 grid overflow-hidden shadow-[0_40px_80px_-50px_rgba(27,42,74,.6)] lg:grid-cols-[1fr_1.4fr]">
            <Reveal className="relative bg-night p-8 text-cream sm:p-10">
              <h3 className="font-serif text-2xl !text-cream">Horario</h3>
              {/* PLACEHOLDER: horario a confirmar con la clienta */}
              <ul className="mt-5 divide-y divide-cream/15 border-y border-cream/15" data-placeholder="horario-por-confirmar">
                {site.hours.map((h) => (
                  <li key={h.days} className="flex justify-between gap-4 py-3 text-sm">
                    <span className="text-cream/70">{h.days}</span>
                    <span>{h.time}</span>
                  </li>
                ))}
              </ul>
              <ul className="mt-8 space-y-4 text-sm">
                <li className="flex gap-3">
                  <PinIcon size={18} className="mt-0.5 shrink-0 text-gold" />
                  <span>
                    {site.address.street}
                    <span className="block text-cream/70">{site.address.neighborhood}, {site.address.city}</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <PhoneIcon size={18} className="mt-0.5 shrink-0 text-gold" />
                  <a href={`tel:${site.phoneE164}`} className="hover:text-gold-pale">{site.phoneDisplay}</a>
                </li>
                <li className="flex gap-3">
                  <ClockIcon size={18} className="mt-0.5 shrink-0 text-gold" />
                  <span className="text-cream/70">Cita previa por WhatsApp</span>
                </li>
              </ul>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-pale hover:text-white"
              >
                Cómo llegar <ArrowIcon size={14} />
              </a>
            </Reveal>
            <Reveal delay={0.1} className="bg-white p-8 sm:p-10">
              <h3 className="font-serif text-2xl">Pre-reserva en 30 segundos</h3>
              <p className="mt-1 text-sm text-stone">Elige y te escribimos para confirmar.</p>
              <div className="mt-7">
                <BookingForm categories={categories} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= MAPA ================= */}
      <section aria-label="Mapa" className="relative h-72 bg-cream-100 sm:h-96">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center" aria-hidden>
          <Lotus className="h-10 w-10 text-jade-ink" />
          <p className="font-serif text-xl text-ink">{site.address.neighborhood}</p>
        </div>
        <iframe
          title="Mapa: ubicación de Reduzen en Torreón"
          src={mapSrc}
          className="relative h-full w-full border-0 grayscale-[50%] sepia-[15%]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </>
  );
}
