import type { Metadata } from "next";
import { ArtFrame } from "@/components/ArtFrame";
import { TreatmentRow } from "@/components/Cards";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CTASection } from "@/components/CTASection";
import { ClipReveal, WordsReveal } from "@/components/Effects";
import { Reveal } from "@/components/Motion";
import { PageHeader } from "@/components/PageHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { categories } from "@/content/services";
import { waMessages } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Servicios: faciales, corporales, uñas, pedicure y depilación láser",
  description:
    "Catálogo de tratamientos de Reduzen en Torreón: Hydrafacial, Bubble Oxygen Facial, Microneedling, Hidralips, mesoterapia corporal, uñas, pedicure y depilación láser. Pide informes por WhatsApp.",
  alternates: { canonical: "/servicios/" },
  openGraph: { url: "/servicios/", title: "Servicios | Reduzen Spa Torreón" },
};

export default function ServiciosPage() {
  const total = categories.reduce((n, c) => n + c.treatments.length, 0);
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Servicios" }]}
        eyebrow="Catálogo completo"
        title="Nuestros"
        accent="servicios."
        intro="Cada tratamiento incluye una valoración previa."
      >
        <p className="eyebrow mt-6 text-gold-ink">
          {categories.length} categorías · {total} tratamientos
        </p>
      </PageHeader>

      <CategoryTabs items={categories.map(({ slug, short }) => ({ slug, short }))} />

      {categories.map((c, idx) => (
        <section
          key={c.slug}
          id={c.slug}
          aria-labelledby={`${c.slug}-titulo`}
          className={`scroll-mt-36 sm:scroll-mt-40 py-20 sm:py-28 ${idx % 2 ? "bg-cream-50" : "bg-cream"}`}
        >
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10">
            {/* Columna fija con número gigante, título e imagen */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-40">
                <span aria-hidden className="outline-text display block text-[3.2rem] text-gold sm:text-[4rem]">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h2 id={`${c.slug}-titulo`} className="display -mt-1 text-2xl sm:text-3xl">
                  <WordsReveal text={c.name} />
                </h2>
                <ClipReveal className="mt-8 hidden aspect-[4/3] lg:block">
                  <ArtFrame variant={c.art} src={c.image} alt={`${c.name} en Reduzen`} className="h-full w-full" />
                </ClipReveal>
              </div>
            </div>

            <div className="lg:col-span-8">
              <Reveal>
                <div className="border-t border-ink/15">
                  {c.treatments.map((t, i) => (
                    <TreatmentRow key={t.slug} treatment={t} index={i} />
                  ))}
                </div>
              </Reveal>
              <Reveal className="mt-10">
                <WhatsAppButton message={waMessages.category(c.name)} variant="outline">
                  Preguntar por {c.short.toLowerCase()}
                </WhatsAppButton>
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      <CTASection withMap={false} number="06" />
    </>
  );
}
