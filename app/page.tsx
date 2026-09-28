import Link from "next/link";
import type React from "react";
import { ArtFrame } from "@/components/ArtFrame";
import { BeforeAfter } from "@/components/BeforeAfter";
import { ServiceCard, TestimonialCard, TreatmentSpotlightCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { ArrowIcon, HandIcon, LeafIcon, ShieldIcon, SparkleIcon, valueIcons } from "@/components/Icons";
import { Lotus } from "@/components/Lotus";
import { Parallax, Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { Branch, SectionHeading, Sparkles } from "@/components/Section";
import { SectionDivider } from "@/components/SectionDivider";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { categories, signatureTreatments } from "@/content/services";
import { brandValues } from "@/content/site";
import { testimonials } from "@/content/testimonials";
import { waMessages } from "@/lib/whatsapp";

// PLACEHOLDER: fotografía real del hero (retrato spa, luz cálida). Ver components/ArtFrame.tsx
const HERO_IMAGE: string | null = null;

const reasons = [
  {
    icon: SparkleIcon,
    title: "Tecnología de vanguardia",
    body: "Equipos para Hydrafacial, oxigenación, ultrasonido 3D y láser, con protocolos actualizados.",
  },
  {
    icon: HandIcon,
    title: "Atención personalizada",
    body: "Valoramos tu piel y tus objetivos antes de recomendarte cualquier tratamiento.",
  },
  {
    icon: LeafIcon,
    title: "Un ambiente que relaja",
    body: "Un espacio cálido y sereno, pensado para que desconectes desde que cruzas la puerta.",
  },
  {
    icon: ShieldIcon,
    title: "Resultados que se notan",
    body: "Planes por sesiones con seguimiento, para que veas y sientas el cambio con el tiempo.",
  },
];

export default function Home() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section aria-labelledby="hero-titulo" className="relative overflow-hidden bg-cream pt-28 sm:pt-32 lg:pt-36">
        <div
          aria-hidden
          className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(58,166,160,.16),transparent_70%)]"
        />
        <div
          aria-hidden
          className="absolute -right-20 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(212,179,106,.22),transparent_70%)]"
        />
        <Parallax speed={60} className="pointer-events-none absolute -left-10 top-24 hidden w-48 text-jade-ink/25 lg:block">
          <Branch />
        </Parallax>
        <Sparkles />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-6 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:px-10">
          <div className="text-center lg:text-left">
            <div className="rise">
              <p className="eyebrow inline-flex items-center gap-3 text-gold-ink">
                <span className="h-px w-8 bg-gold" aria-hidden />
                Mesoterapia &amp; Spa · Torreón
              </p>
            </div>
            <div className="rise" style={{ "--d": "0.06s" } as React.CSSProperties}>
              <p className="script mt-5 text-[3.4rem] text-jade-ink sm:text-7xl" aria-hidden>
                Este es tu momento
              </p>
            </div>
            <div className="rise" style={{ "--d": "0.11s" } as React.CSSProperties}>
              <h1 id="hero-titulo" className="mt-2 text-[2.6rem] leading-[1.04] text-navy sm:text-6xl lg:text-[4.4rem]">
                Desconecta, renueva tu energía y <em className="font-normal italic text-gold-ink">florece</em> desde adentro
              </h1>
            </div>
            <div className="rise" style={{ "--d": "0.16s" } as React.CSSProperties}>
              <p className="mx-auto mt-6 max-w-xl text-[1.05rem] leading-relaxed text-stone lg:mx-0">
                Tratamientos faciales y corporales, uñas, pedicure y depilación láser con tecnología profesional y la
                calma de un spa boutique. Te mereces este espacio.
              </p>
            </div>
            <div className="rise" style={{ "--d": "0.20s" } as React.CSSProperties}>
              <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
                <WhatsAppButton message={waMessages.hero} size="lg">
                  Agenda tu cita por WhatsApp
                </WhatsAppButton>
                <Link
                  href="#servicios"
                  className="btn-shine inline-flex min-h-14 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-navy/20 px-7 text-[0.95rem] font-medium tracking-wide text-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-cream-50 hover:shadow-glow"
                >
                  Conoce nuestros tratamientos
                  <ArrowIcon size={18} />
                </Link>
              </div>
            </div>
            <div className="rise" style={{ "--d": "0.25s" } as React.CSSProperties}>
              <p className="mt-8 flex items-center justify-center gap-2 text-sm text-stone lg:justify-start">
                <span className="flex text-gold" aria-hidden>
                  ✦
                </span>
                Col. Hacienda Residencial, Torreón · Atención con cita
              </p>
            </div>
          </div>

          <div className="rise relative mx-auto w-full max-w-[26rem] lg:max-w-[30rem]" style={{ "--d": "0.15s" } as React.CSSProperties}>
            <div className="absolute -inset-3 rounded-[999px_999px_36px_36px] border border-gold/50 sm:-inset-4" aria-hidden />
            <Parallax speed={36}>
              <ArtFrame
                variant="portrait"
                src={HERO_IMAGE}
                priority
                alt="Mujer relajada con piel luminosa durante un tratamiento facial en Reduzen"
                className="aspect-[4/5] w-full rounded-[999px_999px_28px_28px] shadow-lift"
              />
            </Parallax>
            <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl bg-cream-50/95 px-4 py-3 shadow-soft ring-1 ring-gold/30 backdrop-blur sm:-left-8">
              <Lotus className="h-9 w-9 text-jade-ink" />
              <div className="text-left">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-gold-ink">Tratamiento estrella</p>
                <p className="font-serif text-lg leading-tight text-navy">Hydrafacial</p>
              </div>
            </div>
          </div>
        </div>

        <SectionDivider fill="var(--color-cream-50)" accent="rgba(201,162,75,.18)" animated className="mt-10" />
      </section>

      {/* ============ VALORES ============ */}
      <section aria-label="Valores de Reduzen" className="bg-cream-50 pb-16 pt-6 sm:pb-20">
        <Stagger as="ul" className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-10 px-5 sm:grid-cols-4 sm:px-6 lg:px-10">
          {brandValues.map((v) => {
            const Icon = valueIcons[v.icon];
            return (
              <StaggerItem as="li" key={v.key} className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream text-jade-ink ring-1 ring-gold/35">
                  <Icon size={28} />
                </span>
                <p className="eyebrow mt-4 text-navy">{v.title}</p>
                <p className="mt-1 font-serif text-lg italic text-gold-ink">{v.phrase}</p>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* ============ CATEGORÍAS ============ */}
      <section id="servicios" aria-labelledby="servicios-titulo" className="relative bg-cream py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <SectionHeading
            id="servicios-titulo"
            eyebrow="Nuestros servicios"
            title="Todo lo que necesitas para sentirte tú"
            intro="Del rostro a los pies: rituales de belleza y bienestar con técnica profesional y trato cercano."
          />
          <Stagger className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-6">
            {categories.map((c, i) => (
              <StaggerItem
                key={c.slug}
                className={`w-[82%] shrink-0 snap-center sm:w-auto ${i < 2 ? "lg:col-span-3" : "lg:col-span-2"} ${i === 4 ? "sm:col-span-2 lg:col-span-2" : ""}`}
              >
                <ServiceCard category={c} wide={i === 4} />
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-10 text-center">
            <Link
              href="/servicios/"
              className="inline-flex min-h-12 items-center gap-2 border-b border-gold pb-1 text-sm font-medium uppercase tracking-[0.18em] text-navy transition-colors hover:text-jade-ink"
            >
              Ver catálogo completo
              <ArrowIcon size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ TRATAMIENTOS DESTACADOS — momento premium (única sección oscura) ============ */}
      <div className="bg-cream">
        <SectionDivider fill="var(--color-night)" accent="rgba(58,166,160,.22)" animated />
      </div>
      <section
        id="tratamientos"
        aria-labelledby="tratamientos-titulo"
        className="on-dark relative overflow-hidden bg-night pb-24 pt-14 sm:pb-32 sm:pt-20"
      >
        <div
          aria-hidden
          className="absolute left-1/2 top-0 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(58,166,160,.18),transparent)]"
        />
        <Parallax speed={80} className="pointer-events-none absolute inset-0">
          <svg className="absolute inset-0 h-full w-full" aria-hidden>
            {[
              [8, 12, 28], [92, 22, 18], [15, 70, 12], [88, 82, 30], [50, 94, 10], [70, 8, 8],
            ].map(([x, y, r], i) => (
              <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} fill="none" stroke="rgba(247,243,236,.12)" />
            ))}
          </svg>
        </Parallax>
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <SectionHeading
            id="tratamientos-titulo"
            dark
            eyebrow="Tratamientos insignia"
            script="Tu piel, renovada"
            title="Lo más pedido en Reduzen"
            intro="Tecnología para limpiar, oxigenar e hidratar tu piel en profundidad. Resultados que se ven desde la primera sesión."
          />
          <Stagger className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 xl:grid-cols-4">
            {signatureTreatments.map((t, i) => (
              <StaggerItem key={t.slug} className="w-[84%] shrink-0 snap-center sm:w-auto">
                <TreatmentSpotlightCard treatment={t} index={i} />
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-cream/60 sm:hidden" aria-hidden>
            Desliza para ver más →
          </p>
          <Reveal className="mt-10 text-center">
            <p className="text-sm text-cream/70">
              {/* PLACEHOLDER: vigencia de promociones */}
              Precios y promociones sujetos a cambio. Pregunta por la promo del mes.
            </p>
          </Reveal>
        </div>
      </section>
      <div className="bg-night">
        <SectionDivider fill="var(--color-cream)" accent="rgba(58,166,160,.35)" animated />
      </div>

      {/* ============ RESULTADOS ============ */}
      <section id="resultados" aria-labelledby="resultados-titulo" className="bg-cream py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <SectionHeading
            id="resultados-titulo"
            eyebrow="Resultados"
            title="Cambios que se ven y se sienten"
            intro="Desliza para comparar. Mostraremos aquí casos reales de nuestras clientas, siempre con su autorización."
          />
          {/* PLACEHOLDER: casos reales antes/después con consentimiento firmado */}
          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            <StaggerItem>
              <BeforeAfter title="Hydrafacial" sessions="1 sesión" />
            </StaggerItem>
            <StaggerItem>
              <BeforeAfter title="Microneedling" sessions="3 sesiones" />
            </StaggerItem>
            <StaggerItem>
              <BeforeAfter title="Hidralips" sessions="1 sesión" />
            </StaggerItem>
          </Stagger>
          <Reveal className="mt-10 flex justify-center">
            <WhatsAppButton message={waMessages.results} variant="outline">
              Quiero una valoración
            </WhatsAppButton>
          </Reveal>
        </div>
      </section>

      {/* ============ POR QUÉ REDUZEN ============ */}
      <section aria-labelledby="porque-titulo" className="relative overflow-hidden bg-cream-50 py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-10">
          <Reveal className="relative order-2 mx-auto w-full max-w-md lg:order-1">
            <Parallax speed={30}>
              {/* PLACEHOLDER: foto del espacio físico */}
              <ArtFrame
                variant="space"
                alt="Cabina de tratamiento de Reduzen con luz cálida"
                className="aspect-[4/5] w-full rounded-[999px_999px_28px_28px] shadow-lift"
              />
            </Parallax>
            <ArtFrame
              variant="nails"
              alt="Detalle de manicure en Reduzen"
              className="absolute -bottom-8 -right-4 aspect-square w-36 rounded-full shadow-lift ring-8 ring-cream-50 sm:-right-10 sm:w-44"
            />
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading
              id="porque-titulo"
              align="left"
              eyebrow="Por qué elegir Reduzen"
              title="Belleza con técnica, bienestar con calma"
            />
            <Stagger as="ul" className="mt-10 grid gap-8 sm:grid-cols-2">
              {reasons.map((r) => (
                <StaggerItem as="li" key={r.title}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-jade-ink ring-1 ring-gold/35">
                    <r.icon size={24} />
                  </span>
                  <h3 className="mt-4 text-2xl text-navy">{r.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-stone">{r.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIOS ============ */}
      <section id="testimonios" aria-labelledby="testimonios-titulo" className="relative bg-cream py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <SectionHeading
            id="testimonios-titulo"
            eyebrow="Testimonios"
            script="Con cariño"
            title="Lo que dicen nuestras clientas"
          />
          {/* PLACEHOLDER: testimonios de ejemplo — ver content/testimonials.ts */}
          <Stagger className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <StaggerItem
                key={t.name}
                className={`w-[85%] shrink-0 snap-center md:w-auto ${i >= 3 ? "lg:translate-x-1/2" : ""}`}
              >
                <TestimonialCard testimonial={t} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============ CTA FINAL + MAPA ============ */}
      <CTASection />
    </>
  );
}
