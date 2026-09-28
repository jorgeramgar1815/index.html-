import Link from "next/link";
import { ArtFrame } from "@/components/ArtFrame";
import { BeforeAfter } from "@/components/BeforeAfter";
import { ServiceCard, TestimonialCard, TreatmentSpotlightCard } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { Aurora, Bubbles, Marquee, Star } from "@/components/Decor";
import { Hero } from "@/components/Hero";
import { ArrowIcon, HandIcon, LeafIcon, ShieldIcon, SparkleIcon, valueIcons } from "@/components/Icons";
import { Parallax, Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { RitualSteps } from "@/components/RitualSteps";
import { SectionHeading } from "@/components/Section";
import { SectionDivider } from "@/components/SectionDivider";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { categories, signatureTreatments } from "@/content/services";
import { brandValues } from "@/content/site";
import { testimonials } from "@/content/testimonials";
import { waMessages } from "@/lib/whatsapp";

const tickerItems = [
  "Hydrafacial",
  "Bubble Oxygen Facial",
  "Microneedling",
  "Hidralips",
  "Mesoterapia",
  "Depilación láser",
  "Uñas",
  "Pedicure spa",
];

const reasons = [
  { icon: SparkleIcon, title: "Tecnología", body: "Hydrafacial, ultrasonido 3D y láser." },
  { icon: HandIcon, title: "Atención personal", body: "Un plan pensado para ti." },
  { icon: LeafIcon, title: "Ambiente sereno", body: "Desconectas desde que llegas." },
  { icon: ShieldIcon, title: "Resultados reales", body: "Seguimiento sesión a sesión." },
];

const ritual = [
  { icon: "whatsapp" as const, title: "Escríbenos", body: "Cuéntanos qué buscas por WhatsApp." },
  { icon: "hand" as const, title: "Valoración", body: "Elegimos contigo el tratamiento ideal." },
  { icon: "lotus" as const, title: "Florece", body: "Relájate y disfruta tus resultados." },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* ============ CINTA DE TRATAMIENTOS ============ */}
      <div className="border-y border-gold/25 bg-cream-50 py-5" aria-label="Tratamientos destacados">
        <Marquee>
          {tickerItems.map((t) => (
            <span key={t} className="flex items-center gap-8 pr-8 font-serif text-2xl italic text-navy sm:text-3xl">
              {t}
              <Star className="h-3.5 w-3.5 text-gold" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* ============ VALORES ============ */}
      <section aria-label="Valores de Reduzen" className="bg-cream-50 py-16 sm:py-20">
        <Stagger as="ul" className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-10 px-5 sm:grid-cols-4 sm:px-6">
          {brandValues.map((v) => {
            const Icon = valueIcons[v.icon];
            return (
              <StaggerItem as="li" key={v.key} className="group flex flex-col items-center text-center">
                <span className="relative flex h-20 w-20 items-center justify-center">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full border border-dashed border-gold/60 transition-transform duration-[1.6s] ease-out group-hover:rotate-180"
                  />
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream text-jade-ink shadow-soft transition-all duration-500 group-hover:bg-jade-ink group-hover:text-cream">
                    <Icon size={28} />
                  </span>
                </span>
                <p className="eyebrow mt-5 text-navy">{v.title}</p>
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
            title="Todo para sentirte tú"
            intro="Del rostro a los pies, con técnica profesional y trato cercano."
          />
          <Stagger className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-6">
            {categories.map((c, i) => (
              <StaggerItem
                key={c.slug}
                className={`w-[80%] shrink-0 snap-center sm:w-auto ${i < 2 ? "lg:col-span-3" : "lg:col-span-2"} ${i === 4 ? "sm:col-span-2 lg:col-span-2" : ""}`}
              >
                <ServiceCard category={c} />
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-10 text-center">
            <Link
              href="/servicios/"
              className="group inline-flex min-h-12 items-center gap-3 text-sm font-medium uppercase tracking-[0.18em] text-navy"
            >
              <span className="bg-[linear-gradient(var(--color-gold),var(--color-gold))] bg-[length:100%_1px] bg-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:0%_1px]">
                Ver catálogo completo
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold transition-all duration-300 group-hover:bg-gold group-hover:text-night">
                <ArrowIcon size={18} />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ TRATAMIENTOS INSIGNIA — momento premium (única sección oscura) ============ */}
      <div className="bg-cream">
        <SectionDivider fill="var(--color-night)" accent="rgba(58,166,160,.22)" animated />
      </div>
      <section
        id="tratamientos"
        aria-labelledby="tratamientos-titulo"
        className="on-dark relative isolate overflow-hidden bg-night pb-24 pt-14 sm:pb-32 sm:pt-20"
      >
        <Aurora dark />
        <Bubbles count={8} light />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <SectionHeading
            id="tratamientos-titulo"
            dark
            eyebrow="Tratamientos insignia"
            script="Tu piel, renovada"
            title="Lo más pedido en Reduzen"
          />
          <Stagger className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 xl:grid-cols-4">
            {signatureTreatments.map((t, i) => (
              <StaggerItem key={t.slug} className="w-[84%] shrink-0 snap-center sm:w-auto">
                <TreatmentSpotlightCard treatment={t} index={i} />
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-2 text-center text-xs uppercase tracking-[0.2em] text-cream/60 sm:hidden" aria-hidden>
            Desliza →
          </p>
          <Reveal className="mt-10 text-center">
            {/* PLACEHOLDER: vigencia de promociones */}
            <p className="text-sm text-cream/70">Promociones sujetas a cambio. Pregunta por la promo del mes.</p>
          </Reveal>
        </div>
      </section>
      <div className="bg-night">
        <SectionDivider fill="var(--color-cream)" accent="rgba(58,166,160,.35)" animated />
      </div>

      {/* ============ TU RITUAL EN 3 PASOS ============ */}
      <section aria-labelledby="ritual-titulo" className="bg-cream py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <SectionHeading id="ritual-titulo" eyebrow="Cómo agendar" title="Tu ritual en 3 pasos" />
          <RitualSteps steps={ritual} />
          <Reveal className="mt-12 flex justify-center">
            <WhatsAppButton message={waMessages.general} size="lg">
              Empezar por WhatsApp
            </WhatsAppButton>
          </Reveal>
        </div>
      </section>

      {/* ============ RESULTADOS ============ */}
      <section id="resultados" aria-labelledby="resultados-titulo" className="bg-cream-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <SectionHeading
            id="resultados-titulo"
            eyebrow="Resultados"
            title="Cambios que se ven"
            intro="Desliza para comparar. Pronto, casos reales con autorización."
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
      <section aria-labelledby="porque-titulo" className="relative overflow-hidden bg-cream py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-10">
          <Reveal className="relative order-2 mx-auto w-full max-w-md lg:order-1">
            <div className="absolute -inset-3 rounded-[999px_999px_36px_36px] border border-gold/50" aria-hidden />
            <Parallax speed={40}>
              {/* PLACEHOLDER: foto del espacio físico */}
              <ArtFrame
                variant="space"
                alt="Cabina de tratamiento de Reduzen con luz cálida"
                className="aspect-[4/5] w-full rounded-[999px_999px_28px_28px] shadow-lift"
              />
            </Parallax>
            <Parallax speed={-60} className="absolute -bottom-8 -right-4 w-36 sm:-right-10 sm:w-44">
              <ArtFrame
                variant="nails"
                alt="Detalle de manicure en Reduzen"
                className="aspect-square w-full rounded-full shadow-lift ring-8 ring-cream"
              />
            </Parallax>
            <Parallax speed={-30} className="absolute -left-6 top-10 w-24 sm:-left-12 sm:w-28">
              <ArtFrame variant="facial" alt="Tratamiento facial" className="aspect-square w-full rounded-full shadow-lift ring-8 ring-cream" />
            </Parallax>
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading id="porque-titulo" align="left" eyebrow="Por qué Reduzen" title="Técnica con calma" />
            <Stagger as="ul" className="mt-10 grid grid-cols-2 gap-4">
              {reasons.map((r) => (
                <StaggerItem
                  as="li"
                  key={r.title}
                  className="group rounded-[22px] bg-cream-50 p-5 ring-1 ring-navy/8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift hover:ring-gold/50"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-jade-ink ring-1 ring-gold/35 transition-all duration-500 group-hover:bg-jade-ink group-hover:text-cream">
                    <r.icon size={22} />
                  </span>
                  <h3 className="mt-4 text-xl leading-tight text-navy sm:text-2xl">{r.title}</h3>
                  <p className="mt-1 text-sm text-stone">{r.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIOS ============ */}
      <section id="testimonios" aria-labelledby="testimonios-titulo" className="relative bg-cream-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <SectionHeading id="testimonios-titulo" eyebrow="Testimonios" script="Con cariño" title="Lo que dicen nuestras clientas" />
        </div>
        {/* PLACEHOLDER: testimonios de ejemplo — ver content/testimonials.ts */}
        <Reveal className="mt-14">
          <Marquee duration="60s">
            {testimonials.map((t) => (
              <div key={t.name} className="w-[300px] shrink-0 px-2.5 py-3 sm:w-[380px]">
                <TestimonialCard testimonial={t} />
              </div>
            ))}
          </Marquee>
        </Reveal>
      </section>

      {/* ============ CTA FINAL + MAPA ============ */}
      <CTASection />
    </>
  );
}
