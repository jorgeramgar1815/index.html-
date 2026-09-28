import type { Metadata } from "next";
import { ArtFrame, type ArtVariant } from "@/components/ArtFrame";
import { CTASection } from "@/components/CTASection";
import { ClipReveal } from "@/components/Effects";
import { valueIcons } from "@/components/Icons";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { PageHeader } from "@/components/PageHeader";
import { SectionHead } from "@/components/Section";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { brandValues } from "@/content/site";
import { story, team } from "@/content/team";
import { waMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Nosotros: un spa boutique en Torreón",
  description:
    "Conoce Reduzen, spa de mesoterapia y tratamientos estéticos en Torreón. Nuestra historia, nuestro equipo y los valores que guían cada tratamiento.",
  alternates: { canonical: "/nosotros/" },
  openGraph: { url: "/nosotros/", title: "Nosotros | Reduzen Spa Torreón" },
};

// PLACEHOLDER: fotos reales del espacio físico (recepción, cabinas, área de uñas, detalles)
const gallery: { variant: ArtVariant; alt: string; className: string }[] = [
  { variant: "space", alt: "Recepción", className: "col-span-2 aspect-[4/5] lg:col-span-5 lg:row-span-2 lg:aspect-auto" },
  { variant: "portrait", alt: "Cabina de faciales", className: "aspect-square lg:col-span-4" },
  { variant: "nails", alt: "Área de uñas", className: "aspect-square lg:col-span-3" },
  { variant: "pedicure", alt: "Pedicure", className: "aspect-square lg:col-span-3" },
  { variant: "laser", alt: "Cabina láser", className: "aspect-square lg:col-span-4" },
];

export default function NosotrosPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Nosotros" }]}
        eyebrow="Nuestra historia"
        title="Un lugar para"
        accent="volver a ti."
        intro="Un spa boutique en Torreón donde la técnica y el bienestar se encuentran."
      />

      {/* 01 — HISTORIA */}
      <section aria-labelledby="historia-titulo" className="bg-cream-50 py-24 sm:py-32">
        <div className="mx-auto grid max-w-[88rem] gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
          <figure className="lg:col-span-5">
            <ClipReveal className="aspect-[4/5]">
              <ArtFrame variant="portrait" alt="El equipo de Reduzen en el spa" className="h-full w-full" />
            </ClipReveal>
            <figcaption className="mt-3 flex items-baseline justify-between border-b border-ink/15 pb-3">
              <span className="eyebrow text-gold-ink">Fig. 01</span>
              <span className="font-serif text-lg italic text-ink">Col. Hacienda Residencial, Torreón</span>
            </figcaption>
          </figure>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
            <p className="eyebrow text-gold-ink">01 — Quiénes somos</p>
            <h2 id="historia-titulo" className="display mt-6 text-5xl sm:text-7xl">
              Belleza con <em className="text-jade-ink">alma de spa.</em>
            </h2>
            {/* PLACEHOLDER: historia editable en content/team.ts */}
            <Reveal className="mt-8 space-y-5 text-lg leading-relaxed text-stone first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-jade-ink">
              {story.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </Reveal>
            <Reveal delay={0.2} className="mt-10 border-l-2 border-gold pl-6">
              <p className="display text-4xl text-ink sm:text-5xl">“Te mereces este espacio.”</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 02 — VALORES */}
      <section aria-labelledby="valores-titulo" className="bg-jade-ink py-24 text-cream sm:py-32">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <SectionHead id="valores-titulo" dark number="02" label="Valores" title="Lo que nos mueve." />
          <Stagger as="ul" className="mt-16 grid border-t border-cream/20 sm:grid-cols-2 lg:grid-cols-4">
            {brandValues.map((v, i) => {
              const Icon = valueIcons[v.icon];
              return (
                <StaggerItem as="li" key={v.key} className="border-b border-cream/20 py-10 sm:pr-6 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-gold-pale">{String(i + 1).padStart(2, "0")}</span>
                    <Icon size={26} className="text-gold-pale" />
                  </div>
                  <h3 className="mt-10 font-serif text-4xl leading-none !text-cream">
                    {v.title} <em className="text-gold-pale">{v.phrase}</em>
                  </h3>
                  <p className="mt-3 text-cream/80">{v.body}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* 03 — EQUIPO */}
      <section aria-labelledby="equipo-titulo" className="bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <SectionHead id="equipo-titulo" number="03" label="Equipo" title="Manos expertas." intro="Especialistas que te acompañan en cada paso." />
          {/* PLACEHOLDER: fotos, nombres y bios reales en content/team.ts */}
          <Stagger className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, i) => (
              <StaggerItem key={i} className={i === 1 ? "lg:mt-20" : ""}>
                <figure data-placeholder="especialista" className="group">
                  <div className="overflow-hidden">
                    <ArtFrame
                      variant="team"
                      src={member.image}
                      alt={`Foto de ${member.name}`}
                      className="aspect-[3/4] w-full grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  </div>
                  <figcaption className="mt-4 border-b border-ink/15 pb-4">
                    <span className="eyebrow text-gold-ink">{member.role}</span>
                    <h3 className="mt-2 font-serif text-3xl text-ink">{member.name}</h3>
                    <p className="mt-1 text-stone">{member.bio}</p>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 04 — ESPACIO */}
      <section aria-labelledby="espacio-titulo" className="bg-cream-50 py-24 sm:py-32">
        <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
          <SectionHead
            id="espacio-titulo"
            number="04"
            label="Espacio"
            title="Hecho para desconectar."
            intro="Luz cálida y cabinas privadas en Col. Hacienda Residencial."
            aside={
              <WhatsAppButton message={waMessages.about} variant="outline" className="mt-6">
                Agenda una visita
              </WhatsAppButton>
            }
          />
          <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-12 lg:gap-5">
            {gallery.map((g, i) => (
              <figure key={g.alt} className={`group relative ${g.className}`}>
                <ClipReveal className="h-full min-h-full" delay={i * 0.08} drift={20}>
                  <ArtFrame variant={g.variant} alt={g.alt} className="h-full w-full transition-transform duration-[1.2s] group-hover:scale-110" />
                </ClipReveal>
                <figcaption className="eyebrow absolute bottom-3 left-3 bg-cream-50 px-2.5 py-1 text-ink">{g.alt}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <CTASection number="05" />
    </>
  );
}
