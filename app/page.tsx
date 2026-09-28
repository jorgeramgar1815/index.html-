import { BeforeAfter } from "@/components/BeforeAfter";
import { CoverStory } from "@/components/Cards";
import { CTASection } from "@/components/CTASection";
import { Bubbles, Marquee, Star } from "@/components/Decor";
import { Hero } from "@/components/Hero";
import { valueIcons } from "@/components/Icons";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { Method } from "@/components/RitualSteps";
import { ScrollText } from "@/components/ScrollText";
import { SectionHead } from "@/components/Section";
import { ServiceIndex } from "@/components/ServiceIndex";
import { TestimonialSlider } from "@/components/TestimonialSlider";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { categories, signatureTreatments } from "@/content/services";
import { brandValues, site } from "@/content/site";
import { testimonials } from "@/content/testimonials";
import { waMessages } from "@/lib/whatsapp";

const tickerItems = ["Hydrafacial", "Bubble Oxygen", "Microneedling", "Hidralips", "Mesoterapia", "Láser", "Uñas", "Pedicure"];

export default function Home() {
  const [lead, ...others] = signatureTreatments;
  return (
    <>
      {/* 01 — PORTADA */}
      <Hero />

      {/* Cinta en tipografía display (llena / contorno) */}
      <div className="overflow-hidden border-b border-ink/15 bg-cream py-6" aria-label="Tratamientos">
        <Marquee duration="50s">
          {tickerItems.map((t, i) => (
            <span
              key={t}
              className={`display flex items-center gap-10 pr-10 text-6xl sm:text-8xl ${i % 2 ? "outline-text text-ink" : "text-ink"}`}
            >
              {t}
              <Star className="h-6 w-6 shrink-0 text-gold" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* 02 — MANIFIESTO + VALORES */}
      <section aria-labelledby="manifiesto-titulo" className="bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="eyebrow text-gold-ink">02 — Manifiesto</p>
              <h2 id="manifiesto-titulo" className="sr-only">
                Nuestro manifiesto
              </h2>
            </div>
            <ScrollText
              className="display text-[2.6rem] leading-[1.02] text-ink sm:text-6xl lg:col-span-9 lg:text-[5.2rem]"
              text={`${site.message}`}
              emphasis={["florece", "adentro", "espacio"]}
            />
          </div>

          <Stagger as="ul" className="mt-24 grid grid-cols-2 border-t border-ink/15 lg:grid-cols-4">
            {brandValues.map((v, i) => {
              const Icon = valueIcons[v.icon];
              return (
                <StaggerItem
                  as="li"
                  key={v.key}
                  className={`group border-b border-ink/15 py-8 pr-4 lg:border-b-0 ${i % 2 === 0 ? "border-r pl-0" : "pl-5"} lg:border-r lg:pl-6 lg:first:pl-0 lg:last:border-r-0`}
                >
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
                    <Icon size={24} className="text-jade-ink transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110" />
                  </div>
                  <h3 className="mt-8 font-serif text-3xl leading-none text-ink sm:text-4xl">
                    {v.title} <em className="text-jade-ink">{v.phrase}</em>
                  </h3>
                  <p className="mt-3 text-stone">{v.body}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* 03 — PORTADA DEL MES (único spread oscuro) */}
      <section id="tratamientos" aria-labelledby="tratamientos-titulo" className="on-dark relative isolate overflow-hidden bg-night py-24 sm:py-32">
        <Bubbles count={8} />
        <div className="relative mx-auto max-w-[88rem] px-5 sm:px-8">
          <SectionHead
            id="tratamientos-titulo"
            dark
            number="03"
            label="Tratamientos insignia"
            title="Lo más pedido."
            intro="Tecnología para limpiar, oxigenar e hidratar tu piel. Resultados desde la primera sesión."
          />
          <div className="mt-20">
            <CoverStory lead={lead} others={others} />
          </div>
          {/* PLACEHOLDER: vigencia de promociones */}
          <p className="eyebrow mt-10 text-cream/60">* Promociones sujetas a cambio. Pregunta por la promo del mes.</p>
        </div>
      </section>

      {/* 04 — ÍNDICE DE SERVICIOS */}
      <section id="servicios" aria-labelledby="servicios-titulo" className="bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <SectionHead
            id="servicios-titulo"
            number="04"
            label="Servicios"
            title="Todo para sentirte tú."
            intro="Del rostro a los pies, con técnica profesional y trato cercano."
          />
          <div className="mt-16">
            <ServiceIndex items={categories} />
          </div>
        </div>
      </section>

      {/* 05 — RESULTADOS */}
      <section id="resultados" aria-labelledby="resultados-titulo" className="bg-cream-50 py-24 sm:py-32">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <SectionHead
            id="resultados-titulo"
            number="05"
            label="Resultados"
            title="Cambios que se ven."
            intro="Desliza para comparar. Pronto, casos reales con autorización."
            aside={
              <WhatsAppButton message={waMessages.results} variant="outline" className="mt-6">
                Quiero una valoración
              </WhatsAppButton>
            }
          />
          {/* PLACEHOLDER: casos reales antes/después con consentimiento firmado */}
          <Stagger className="mt-16 grid gap-8 md:grid-cols-3 md:gap-6">
            <StaggerItem>
              <BeforeAfter figure="Fig. 03" title="Hydrafacial" sessions="1 sesión" />
            </StaggerItem>
            <StaggerItem className="md:mt-16">
              <BeforeAfter figure="Fig. 04" title="Microneedling" sessions="3 sesiones" />
            </StaggerItem>
            <StaggerItem className="md:mt-32">
              <BeforeAfter figure="Fig. 05" title="Hidralips" sessions="1 sesión" />
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      {/* 06 — EL MÉTODO */}
      <section aria-labelledby="metodo-titulo" className="bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <SectionHead
            id="metodo-titulo"
            number="06"
            label="El método"
            title="Tu ritual en 3 pasos."
            aside={
              <WhatsAppButton message={waMessages.general} className="mt-2">
                Empezar ahora
              </WhatsAppButton>
            }
          />
          <Method />
        </div>
      </section>

      {/* 07 — VOCES */}
      <section id="testimonios" aria-labelledby="testimonios-titulo" className="border-t border-ink/15 bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <div className="flex items-center gap-4 text-gold-ink">
            <span className="eyebrow">07</span>
            <span className="h-px flex-1 bg-ink/15" />
            <h2 id="testimonios-titulo" className="eyebrow !font-sans !text-gold-ink">
              Lo que dicen nuestras clientas
            </h2>
          </div>
          {/* PLACEHOLDER: testimonios de ejemplo — ver content/testimonials.ts */}
          <Reveal className="mt-14">
            <TestimonialSlider items={testimonials} />
          </Reveal>
        </div>
      </section>

      {/* 08 — CONTACTO */}
      <CTASection />
    </>
  );
}
