import type { Metadata } from "next";
import { ArtFrame, type ArtVariant } from "@/components/ArtFrame";
import { CTASection } from "@/components/CTASection";
import { valueIcons } from "@/components/Icons";
import { Lotus } from "@/components/Lotus";
import { Parallax, Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeading } from "@/components/Section";
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
  { variant: "space", alt: "Recepción de Reduzen", className: "col-span-2 row-span-2 aspect-square sm:aspect-auto" },
  { variant: "portrait", alt: "Cabina de faciales", className: "aspect-square" },
  { variant: "nails", alt: "Área de uñas", className: "aspect-square" },
  { variant: "pedicure", alt: "Sillón de pedicure", className: "aspect-square" },
  { variant: "laser", alt: "Cabina de depilación láser", className: "aspect-square" },
];

export default function NosotrosPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Nosotros" }]}
        eyebrow="Nuestra historia"
        script="Te mereces este espacio"
        title="Un lugar para volver a ti"
        intro="Somos un spa boutique en Torreón donde la técnica y el bienestar se encuentran."
      />

      {/* ============ HISTORIA ============ */}
      <section aria-labelledby="historia-titulo" className="bg-cream-50 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-10">
          <Reveal className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 rounded-[999px_999px_36px_36px] border border-gold/50" aria-hidden />
            <Parallax speed={30}>
              <ArtFrame
                variant="portrait"
                alt="El equipo de Reduzen en el spa"
                className="aspect-[4/5] w-full rounded-[999px_999px_28px_28px] shadow-lift"
              />
            </Parallax>
          </Reveal>
          <div>
            <SectionHeading id="historia-titulo" align="left" eyebrow="Quiénes somos" title="Bienestar que se siente, belleza que te acompaña" />
            {/* PLACEHOLDER: historia editable en content/team.ts */}
            <Reveal className="mt-6 space-y-5 text-[1.02rem] leading-relaxed text-stone">
              {story.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ VALORES ============ */}
      <section aria-labelledby="valores-titulo" className="bg-cream py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <SectionHeading
            id="valores-titulo"
            eyebrow="Nuestros valores"
            script="Florece"
            title="Lo que nos mueve"
            intro="Cuatro ideas que guían cada cita, desde que nos escribes hasta que te despedimos."
          />
          <Stagger as="ul" className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {brandValues.map((v) => {
              const Icon = valueIcons[v.icon];
              return (
                <StaggerItem
                  as="li"
                  key={v.key}
                  className="rounded-[24px] bg-cream-50 p-7 ring-1 ring-navy/8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift hover:ring-gold/50"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-jade-ink ring-1 ring-gold/35">
                    <Icon size={26} />
                  </span>
                  <h3 className="mt-5 text-2xl text-navy">
                    {v.title} <em className="text-gold-ink">{v.phrase}</em>
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-stone">{v.body}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* ============ EQUIPO ============ */}
      <section aria-labelledby="equipo-titulo" className="bg-cream-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <SectionHeading
            id="equipo-titulo"
            eyebrow="Nuestro equipo"
            title="Manos expertas, trato cercano"
            intro="Especialistas certificadas que te acompañan en cada paso."
          />
          {/* PLACEHOLDER: fotos, nombres y bios reales en content/team.ts */}
          <Stagger className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, i) => (
              <StaggerItem key={i} className="text-center" >
                <div data-placeholder="especialista">
                  <ArtFrame
                    variant="team"
                    src={member.image}
                    alt={`Foto de ${member.name}`}
                    className="mx-auto aspect-[4/5] w-full max-w-xs rounded-[999px_999px_24px_24px]"
                  />
                  <h3 className="mt-6 text-2xl text-navy">{member.name}</h3>
                  <p className="eyebrow mt-2 text-gold-ink">{member.role}</p>
                  <p className="mx-auto mt-3 max-w-xs text-[0.95rem] leading-relaxed text-stone">{member.bio}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============ ESPACIO ============ */}
      <section aria-labelledby="espacio-titulo" className="bg-cream py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <SectionHeading
            id="espacio-titulo"
            eyebrow="Nuestro espacio"
            title="Diseñado para que desconectes"
            intro="Luz cálida, aromas suaves y cabinas privadas en Col. Hacienda Residencial."
          />
          <Stagger className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {gallery.map((g) => (
              <StaggerItem key={g.alt} className={g.className}>
                <ArtFrame variant={g.variant} alt={g.alt} className="h-full min-h-full w-full rounded-[24px]" />
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-12 flex flex-col items-center gap-4 text-center">
            <Lotus className="h-10 w-10 text-jade-ink" />
            <WhatsAppButton message={waMessages.about}>Agenda una visita</WhatsAppButton>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  );
}
