import type { CSSProperties } from "react";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Bubbles } from "@/components/Decor";
import { ArrowIcon, HeartIcon, PhoneIcon, PinIcon, ShieldIcon, SparkleIcon, WhatsAppIcon } from "@/components/Icons";
import { HoursTable } from "@/components/landing/HoursTable";
import { Framed, Ornament, SpaButton, SpaLink, SpaTitle } from "@/components/landing/Kit";
import { TreatmentMenu } from "@/components/landing/TreatmentMenu";
import { Lotus } from "@/components/Lotus";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { categories } from "@/content/services";
import { site } from "@/content/site";
import { waMessages } from "@/lib/whatsapp";

const d = (s: string) => ({ "--d": s }) as CSSProperties;
const total = categories.reduce((n, c) => n + c.treatments.length, 0);

const pillars = [
  { icon: ShieldIcon, title: "Valoración personalizada", body: "Te escuchamos y diseñamos un plan a tu medida." },
  { icon: SparkleIcon, title: "Tecnología de vanguardia", body: "Hydrafacial, oxígeno, microneedling y láser." },
  { icon: HeartIcon, title: "Ambiente de spa", body: "Calma, privacidad y tiempo solo para ti." },
];

// PLACEHOLDER: rituales (paquetes) sugeridos; confirmar combinaciones y precios con la clienta
const rituals = [
  { name: "Ritual Glow", art: "facial", items: ["Hydrafacial", "Hidralips"], note: "Piel luminosa y labios hidratados." },
  { name: "Ritual Ligereza", art: "body", items: ["Mesoterapia corporal", "Drenaje linfático"], note: "Desinflama y moldea." },
  { name: "Ritual Manos & Pies", art: "pedicure", items: ["Manicure spa", "Pedicure spa"], note: "Un rato completo para ti." },
] as const;

export default function HomePage() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=16&output=embed`;
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`;
  const waze = `https://waze.com/ul?q=${encodeURIComponent(site.mapQuery)}&navigate=yes`;

  return (
    <>
      {/* ================= PORTADA: NOMBRE Y LOGO AL CENTRO ================= */}
      <section id="inicio" aria-labelledby="hero-titulo" className="relative overflow-hidden bg-cream-50">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 55% at 50% 42%, rgba(58,166,160,.12), transparent 70%), radial-gradient(35% 45% at 88% 85%, rgba(201,162,75,.16), transparent 70%), radial-gradient(30% 40% at 10% 15%, rgba(201,162,75,.12), transparent 70%)",
          }}
        />
        {/* Loto gigante como marca de agua */}
        <Lotus
          className="pointer-events-none absolute left-1/2 top-[44%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 text-ink/[0.04] sm:h-[48rem] sm:w-[48rem]"
          accent="rgba(201,162,75,.10)"
          strokeWidth={0.5}
        />
        <Bubbles count={9} />

        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-3xl flex-col items-center justify-center px-4 pb-36 pt-16 text-center sm:min-h-[calc(100svh-5rem)] sm:pb-40">
          <Lotus draw className="rise h-20 w-20 text-jade-ink sm:h-24 sm:w-24" strokeWidth={1.3} />
          <div className="rise mt-6" style={d(".1s")}>
            <Ornament>Mesoterapia & Spa · Torreón</Ornament>
          </div>
          <h1 id="hero-titulo" className="rise mt-5 text-[clamp(3.8rem,14vw,8.25rem)] leading-[0.9] tracking-[0.01em]" style={d(".18s")}>
            Reduzen
            <span className="sr-only"> — Mesoterapia & Spa en Torreón</span>
          </h1>
          <span
            aria-hidden
            className="rise mt-6 block h-px w-48 animate-shimmer bg-[linear-gradient(90deg,transparent,#c9a24b,transparent)] bg-[length:200%_100%]"
            style={d(".26s")}
          />
          <p className="rise mt-6 font-serif text-[1.75rem] italic text-jade-ink sm:text-[2.2rem]" style={d(".3s")}>
            Florece desde adentro.
          </p>
          <p className="rise mt-4 max-w-lg text-[1.06rem] leading-relaxed text-stone" style={d(".38s")}>
            Tratamientos faciales y corporales, uñas, pedicure y láser en un espacio pensado para desconectar.
          </p>
          <div className="rise mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row" style={d(".46s")}>
            <SpaButton message={waMessages.hero} className="w-full sm:w-auto">Reservar por WhatsApp</SpaButton>
            <SpaLink href="#menu" className="w-full sm:w-auto">Ver tratamientos</SpaLink>
          </div>
        </div>

        {/* Franja de confianza */}
        <div className="absolute inset-x-0 bottom-0 border-t border-gold/30 bg-cream-50/80 backdrop-blur-sm">
          <ul className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-gold/30 px-2 sm:px-6">
            {[
              { icon: ShieldIcon, label: "Valoración previa" },
              { icon: SparkleIcon, label: "Tecnología facial" },
              { icon: WhatsAppIcon, label: "Reserva por WhatsApp" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center justify-center gap-2 px-2 py-4 text-center sm:flex-row sm:gap-3 sm:py-5">
                <Icon size={20} className="shrink-0 text-jade-ink" />
                <span className="text-[0.68rem] font-semibold uppercase leading-tight tracking-[0.14em] text-ink sm:text-[0.74rem] sm:tracking-[0.18em]">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= BIENVENIDA ================= */}
      <section id="bienvenida" aria-labelledby="bienvenida-titulo" className="scroll-mt-24 bg-cream py-24 sm:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-24">
          <Reveal className="relative mx-auto w-full max-w-md pr-4 sm:pr-6">
            <Framed variant="nails" alt="Recepción de Reduzen" className="aspect-[4/5]" />
            <div className="absolute -left-3 bottom-24 flex items-center gap-3 bg-white px-4 py-3 shadow-[0_20px_40px_-20px_rgba(27,42,74,.5)] sm:-left-8">
              <PinIcon size={20} className="shrink-0 text-jade-ink" />
              <span className="text-left">
                <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-ink">Torreón, Coahuila</span>
                <span className="block font-serif text-[1.05rem] leading-tight text-ink">{site.address.neighborhood}</span>
              </span>
            </div>
          </Reveal>

          <div>
            <SpaTitle
              align="left"
              id="bienvenida-titulo"
              eyebrow="Bienvenida"
              title={<>Un spa boutique para <em className="text-jade-ink">volver a ti.</em></>}
            />
            <Stagger as="ul" className="mt-10 space-y-6">
              {pillars.map(({ icon: Icon, title, body }) => (
                <StaggerItem as="li" key={title} className="flex gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-gold/60 bg-cream-50 text-jade-ink">
                    <Icon size={22} />
                  </span>
                  <span>
                    <span className="block font-serif text-xl text-ink">{title}</span>
                    <span className="mt-1 block text-[1rem] text-stone">{body}</span>
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.1} className="mt-10 flex flex-col gap-6 border-t border-gold/40 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <ul className="flex gap-8">
                {[
                  { n: String(categories.length), l: "Categorías" },
                  { n: String(total), l: "Tratamientos" },
                ].map((s) => (
                  <li key={s.l}>
                    <span className="block font-serif text-4xl leading-none text-jade-ink">{s.n}</span>
                    <span className="mt-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone">{s.l}</span>
                  </li>
                ))}
              </ul>
              <SpaLink href="/nosotros/">Conócenos</SpaLink>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= SLOGAN ================= */}
      <section aria-label="Nuestra filosofía" className="relative overflow-hidden bg-jade-ink py-14 text-center sm:py-16">
        <Bubbles count={8} light />
        <Reveal className="relative mx-auto flex max-w-3xl items-center justify-center gap-5 px-4 sm:gap-8">
          <span aria-hidden className="hidden h-px w-16 bg-gold/70 sm:block" />
          <div>
            <p className="font-serif text-[1.6rem] italic leading-tight text-white sm:text-[2.2rem]">“Te mereces este espacio.”</p>
            <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-gold-pale">Desconecta · Renueva · Florece</p>
          </div>
          <span aria-hidden className="hidden h-px w-16 bg-gold/70 sm:block" />
        </Reveal>
      </section>

      {/* ================= CARTA DE TRATAMIENTOS ================= */}
      <section id="menu" aria-labelledby="menu-titulo" className="on-dark relative scroll-mt-16 overflow-hidden bg-night py-24 sm:scroll-mt-20 sm:py-32">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "radial-gradient(50% 50% at 100% 0%, rgba(58,166,160,.18), transparent 70%), radial-gradient(40% 50% at 0% 100%, rgba(201,162,75,.12), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <SpaTitle dark id="menu-titulo" eyebrow="Carta de tratamientos" title={<>Elige tu <em className="text-gold-pale">momento.</em></>} />
          <Reveal className="mt-14">
            <TreatmentMenu items={categories} />
          </Reveal>
        </div>
      </section>

      {/* ================= RITUALES ================= */}
      <section id="rituales" aria-labelledby="rituales-titulo" className="scroll-mt-20 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SpaTitle id="rituales-titulo" eyebrow="Rituales" title="Combina y consiéntete." intro="Dos tratamientos en una misma visita." />
          <Stagger as="ul" className="mt-16 grid gap-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {rituals.map((r, i) => (
              <StaggerItem as="li" key={r.name} className={`group text-center ${i === 1 ? "lg:mt-12" : ""} ${i === 2 ? "sm:col-span-2 sm:mx-auto sm:w-1/2 lg:col-span-1 lg:w-full" : ""}`}>
                <Framed variant={r.art} alt={r.name} className="mx-auto aspect-[4/5] max-w-[19rem] transition-transform duration-500 group-hover:-translate-y-1.5">
                  <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center bg-gold font-serif text-lg text-night">{i + 1}</span>
                </Framed>
                <h3 className="mt-9 text-[1.7rem]">{r.name}</h3>
                <p className="mt-2 text-[1rem] text-stone">{r.note}</p>
                <p className="mt-3 text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-gold-ink">{r.items.join(" + ")}</p>
                <SpaButton message={`Hola, quiero información del ${r.name} (${r.items.join(" + ")}).`} variant="line" icon={false} className="mt-6 !h-12">
                  Pedir precio
                </SpaButton>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ================= RESULTADOS ================= */}
      <section id="resultados" aria-labelledby="resultados-titulo" className="scroll-mt-20 bg-cream-50 py-24 sm:py-32">
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

      {/* ================= UBICACIÓN Y HORARIO ================= */}
      <section id="ubicacion" aria-labelledby="ubicacion-titulo" className="scroll-mt-20 bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SpaTitle
            id="ubicacion-titulo"
            eyebrow="Ubicación y horario"
            title={<>Te esperamos en <em className="text-jade-ink">Torreón.</em></>}
            intro="Las citas se reservan por WhatsApp; te confirmamos el horario disponible."
          />
          <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
            {/* Mapa con marco cuadrado y tarjeta de dirección */}
            <Reveal className="relative">
              <span aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 border border-gold/70 sm:translate-x-4 sm:translate-y-4" />
              <div className="relative h-[24rem] overflow-hidden bg-cream-100 sm:h-[30rem] lg:h-full lg:min-h-[34rem]">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center" aria-hidden>
                  <Lotus className="h-12 w-12 text-jade-ink" />
                  <p className="font-serif text-xl text-ink">{site.address.neighborhood}</p>
                </div>
                <iframe
                  title="Mapa: ubicación de Reduzen en Torreón"
                  src={mapSrc}
                  className="relative h-full w-full border-0 grayscale-[40%] sepia-[15%]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute inset-x-3 bottom-3 bg-white p-5 shadow-[0_20px_40px_-20px_rgba(27,42,74,.6)] sm:inset-x-auto sm:left-4 sm:bottom-4 sm:max-w-sm">
                  <p className="flex items-start gap-3">
                    <PinIcon size={20} className="mt-0.5 shrink-0 text-jade-ink" />
                    <span>
                      <span className="block font-serif text-[1.15rem] leading-snug text-ink">{site.address.street}</span>
                      <span className="block text-[0.95rem] text-stone">
                        {site.address.neighborhood}, {site.address.city}
                      </span>
                      <span className="mt-1 block text-sm text-stone">{site.address.between}</span>
                    </span>
                  </p>
                  <div className="mt-4 flex gap-2">
                    <a href={gmaps} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[3px] bg-ink px-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream-50 hover:bg-jade-ink">
                      Google Maps
                    </a>
                    <a href={waze} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[3px] border border-ink/30 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink hover:border-ink">
                      Waze
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="flex flex-col gap-5">
              <Reveal delay={0.05} className="on-dark bg-night p-8 text-cream sm:p-10">
                <h3 className="font-serif text-[1.75rem] !text-cream">Horario</h3>
                <HoursTable />
                <p className="mt-5 text-sm text-cream/65">Atención con cita previa.</p>
              </Reveal>
              <Reveal delay={0.12} className="border border-gold/40 bg-cream-50 p-8 sm:p-10">
                <h3 className="font-serif text-[1.75rem]">Reserva tu cita</h3>
                <p className="mt-2 text-[1rem] text-stone">Escríbenos y elige tratamiento, día y horario.</p>
                <SpaButton message={waMessages.closing} className="mt-6 w-full">Reservar por WhatsApp</SpaButton>
                <a href={`tel:${site.phoneE164}`} className="mt-5 flex items-center justify-center gap-2 text-[0.98rem] text-ink hover:text-jade-ink">
                  <PhoneIcon size={18} className="text-jade-ink" /> {site.phoneDisplay}
                  <ArrowIcon size={14} className="text-stone" />
                </a>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
