import type { Metadata } from "next";
import { ArtFrame } from "@/components/ArtFrame";
import { TreatmentCard } from "@/components/Cards";
import { CategoryTabs } from "@/components/CategoryTabs";
import { CTASection } from "@/components/CTASection";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
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
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Servicios" }]}
        eyebrow="Catálogo completo"
        script="Florece desde adentro"
        title="Nuestros servicios"
        intro="Elige tu ritual. Cada tratamiento incluye una valoración previa para adaptarlo a tu piel, tu cuerpo y tus objetivos."
      />

      <div className="bg-cream-50">
        <CategoryTabs items={categories.map(({ slug, short, icon }) => ({ slug, short, icon }))} />

        {categories.map((c, idx) => (
          <section
            key={c.slug}
            id={c.slug}
            aria-labelledby={`${c.slug}-titulo`}
            className={`scroll-mt-32 py-16 sm:py-24 ${idx % 2 ? "bg-cream" : "bg-cream-50"}`}
          >
            <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
              <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
                <Reveal className={`lg:sticky lg:top-40 ${idx % 2 ? "lg:order-2" : ""}`}>
                  <ArtFrame
                    variant={c.art}
                    src={c.image}
                    alt={`${c.name} en Reduzen`}
                    className="aspect-[16/10] w-full rounded-[28px] shadow-soft lg:aspect-[4/5] lg:rounded-[999px_999px_28px_28px]"
                  />
                </Reveal>
                <div>
                  <Reveal>
                    <p className="eyebrow text-gold-ink">
                      {String(idx + 1).padStart(2, "0")} · {c.treatments.length} tratamientos
                    </p>
                    <h2 id={`${c.slug}-titulo`} className="mt-3 text-[2.3rem] leading-tight text-navy sm:text-5xl">
                      {c.name}
                    </h2>
                    <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-stone">{c.intro}</p>
                  </Reveal>
                  <Stagger className="mt-8 grid gap-5 sm:grid-cols-2">
                    {c.treatments.map((t) => (
                      <StaggerItem key={t.slug}>
                        <TreatmentCard treatment={t} categoryIcon={c.icon} />
                      </StaggerItem>
                    ))}
                  </Stagger>
                  <Reveal className="mt-8">
                    <WhatsAppButton message={waMessages.category(c.name)} variant="outline">
                      Preguntar por {c.short.toLowerCase()}
                    </WhatsAppButton>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <CTASection withMap={false} />
    </>
  );
}
