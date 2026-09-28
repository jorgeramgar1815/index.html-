import { HandIcon, LeafIcon, LotusIcon, ShieldIcon, SparkleIcon, WhatsAppIcon } from "./Icons";
import { Stagger, StaggerItem } from "./Motion";

const steps = [
  { icon: WhatsAppIcon, title: "Escríbenos", body: "Cuéntanos qué buscas por WhatsApp." },
  { icon: HandIcon, title: "Valoración", body: "Elegimos contigo el tratamiento ideal." },
  { icon: LotusIcon, title: "Florece", body: "Relájate y disfruta tus resultados." },
];

const reasons = [
  { icon: SparkleIcon, title: "Tecnología", body: "Hydrafacial, ultrasonido 3D y láser." },
  { icon: HandIcon, title: "Atención personal", body: "Un plan pensado para ti." },
  { icon: LeafIcon, title: "Ambiente sereno", body: "Desconectas desde que llegas." },
  { icon: ShieldIcon, title: "Resultados reales", body: "Seguimiento sesión a sesión." },
];

/** El método: 3 pasos con numerales gigantes en contorno + 4 diferenciadores. */
export function Method() {
  return (
    <>
      <Stagger as="ol" className="mt-16 grid border-t border-ink/15 md:grid-cols-3">
        {steps.map((s, i) => (
          <StaggerItem
            as="li"
            key={s.title}
            className="group relative border-b border-ink/15 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"
          >
            <span aria-hidden className="outline-text display block text-[4.5rem] text-gold transition-colors duration-700 group-hover:text-jade-ink sm:text-[9rem]">
              {i + 1}
            </span>
            <div className="mt-4 flex items-center gap-3">
              <s.icon size={22} className="text-jade-ink" />
              <h3 className="font-serif text-4xl text-ink">{s.title}</h3>
            </div>
            <p className="mt-2 text-[1.05rem] text-stone">{s.body}</p>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-20 bg-jade p-8 text-ink sm:p-12">
        <p className="eyebrow text-ink">Por qué Reduzen</p>
        <Stagger as="ul" className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
          {reasons.map((r) => (
            <StaggerItem as="li" key={r.title} className="border-t border-ink/25 pt-6">
              <r.icon size={28} className="text-ink" />
              <h3 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">{r.title}</h3>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </>
  );
}
