import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  robots: { index: false },
  alternates: { canonical: "/aviso-de-privacidad/" },
};

/* PLACEHOLDER: sustituir por el aviso de privacidad definitivo
   (LFPDPPP) redactado/validado por la clienta o su asesor legal. */
export default function AvisoPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Inicio" }, { label: "Aviso de privacidad" }]}
        eyebrow="Legal"
        script="Tu confianza"
        title="Aviso de privacidad"
        intro="Documento en preparación."
      />
      <section className="bg-cream-50 pb-40 pt-6">
        <div className="mx-auto max-w-3xl space-y-5 px-5 text-[1.02rem] leading-relaxed text-stone sm:px-6">
          <p data-placeholder="aviso-de-privacidad">
            {site.fullName}, con domicilio en {site.address.street}, {site.address.neighborhood}, {site.address.city},{" "}
            {site.address.region}, es responsable del uso y protección de tus datos personales. El texto completo del
            aviso de privacidad se publicará aquí próximamente.
          </p>
          <p>
            Para cualquier duda sobre el tratamiento de tus datos escríbenos a{" "}
            <a href={`mailto:${site.email}`} className="text-jade-ink underline underline-offset-4">
              {site.email}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
