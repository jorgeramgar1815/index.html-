/* =========================================================
   Catálogo de servicios.
   - `confirmed: false` = tratamiento sugerido/por confirmar con
     la clienta (no aparece en Facebook). Revisar antes de publicar.
   - `price` = PLACEHOLDER hasta que la clienta confirme vigencia.
   - `duration` = PLACEHOLDER (duraciones estimadas).
   - `image` = ruta en /public/images; mientras sea null se
     muestra la composición gráfica de marca (ArtFrame).
   ========================================================= */

import type { ArtVariant } from "@/components/ArtFrame";

export type Treatment = {
  slug: string;
  name: string;
  summary: string;
  duration: string;
  price?: { label: string; amount: string };
  confirmed: boolean;
  highlights?: string[];
};

export type Category = {
  slug: string;
  name: string;
  short: string;
  intro: string;
  icon: "face" | "body" | "nails" | "foot" | "laser";
  art: ArtVariant;
  image: string | null;
  treatments: Treatment[];
};

export const categories: Category[] = [
  {
    slug: "faciales",
    name: "Tratamientos faciales",
    short: "Faciales",
    intro: "Piel limpia, hidratada y luminosa con tecnología.",
    icon: "face",
    art: "facial",
    image: null, // PLACEHOLDER: foto de tratamiento facial
    treatments: [
      {
        slug: "hydrafacial",
        name: "Hydrafacial",
        summary:
          "Limpia, exfolia e hidrata en una sola sesión.",
        duration: "60 min", // PLACEHOLDER: confirmar duración
        // PLACEHOLDER: promo vista en Facebook; confirmar vigencia antes de publicar
        price: { label: "Promo desde", amount: "$499" },
        confirmed: true,
        highlights: ["Limpieza profunda", "Hidratación", "Luminosidad"],
      },
      {
        slug: "bubble-oxygen-facial",
        name: "Bubble Oxygen Facial",
        summary:
          "Oxigena y renueva tu piel con burbujas activas.",
        duration: "75 min", // PLACEHOLDER
        confirmed: true,
        highlights: ["Oxigenación", "Fotorejuvenecimiento", "Ultrasonido 3D", "Cápsulas inteligentes"],
      },
      {
        slug: "microneedling",
        name: "Microneedling",
        summary:
          "Estimula tu colágeno natural para una piel más firme.",
        duration: "60 min", // PLACEHOLDER
        confirmed: true,
        highlights: ["Textura", "Poros y marcas", "Rostro y manos"],
      },
      {
        slug: "hidralips",
        name: "Hidralips",
        summary:
          "Labios hidratados y definidos, con efecto natural.",
        duration: "45 min", // PLACEHOLDER
        confirmed: true,
        highlights: ["Hidratación", "Definición", "Efecto natural"],
      },
      {
        slug: "limpieza-facial",
        name: "Limpieza facial profunda",
        summary:
          "El punto de partida ideal para cualquier rutina.",
        duration: "50 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER: tratamiento sugerido, confirmar con la clienta
        highlights: ["Extracción", "Exfoliación", "Mascarilla"],
      },
    ],
  },
  {
    slug: "corporales",
    name: "Tratamientos corporales",
    short: "Corporales",
    intro: "Moldea, reafirma y recupera ligereza.",
    icon: "body",
    art: "body",
    image: null, // PLACEHOLDER
    treatments: [
      {
        slug: "mesoterapia-corporal",
        name: "Mesoterapia corporal",
        summary:
          "Activos localizados, con plan por sesiones.",
        duration: "45 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER: confirmar detalle del servicio
        highlights: ["Grasa localizada", "Celulitis", "Flacidez"],
      },
      {
        slug: "moldeo-corporal",
        name: "Moldeo y reducción",
        summary:
          "Protocolo combinado para tu contorno corporal.",
        duration: "60 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
        highlights: ["Abdomen", "Cintura", "Brazos y piernas"],
      },
      {
        slug: "drenaje-linfatico",
        name: "Drenaje linfático",
        summary:
          "Masaje suave que desinflama y aligera.",
        duration: "60 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
        highlights: ["Desinflama", "Retención de líquidos"],
      },
    ],
  },
  {
    slug: "unas",
    name: "Uñas",
    short: "Uñas",
    intro: "Manos impecables, con diseños a tu gusto.",
    icon: "nails",
    art: "nails",
    image: null, // PLACEHOLDER
    treatments: [
      {
        slug: "manicure-spa",
        name: "Manicure spa",
        summary: "Cuidado completo de manos y esmaltado a elegir.",
        duration: "45 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
        highlights: ["Cutícula", "Exfoliación", "Hidratación"],
      },
      {
        slug: "unas-gel",
        name: "Uñas en gel o acrílico",
        summary: "Acabado duradero con diseño personalizado.",
        duration: "90 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
        highlights: ["Gel", "Acrílico", "Diseño"],
      },
    ],
  },
  {
    slug: "pedicure",
    name: "Pedicure",
    short: "Pedicure",
    intro: "Un ritual de descanso para tus pies.",
    icon: "foot",
    art: "pedicure",
    image: null, // PLACEHOLDER
    treatments: [
      {
        slug: "pedicure-spa",
        name: "Pedicure spa",
        summary: "El ritual completo para tus pies.",
        duration: "60 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
        highlights: ["Baño relajante", "Callosidad", "Masaje"],
      },
      {
        slug: "pedicure-express",
        name: "Pedicure express",
        summary: "Acabado impecable cuando tienes poco tiempo.",
        duration: "35 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
        highlights: ["Limado", "Cutícula", "Esmaltado"],
      },
    ],
  },
  {
    slug: "depilacion-laser",
    name: "Depilación láser",
    short: "Depilación láser",
    intro: "Piel suave por más tiempo, por zonas.",
    icon: "laser",
    art: "laser",
    image: null, // PLACEHOLDER
    treatments: [
      {
        slug: "laser-zonas-pequenas",
        name: "Zonas pequeñas",
        summary: "Sesiones cortas con resultados progresivos.",
        duration: "15–20 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
        highlights: ["Axila", "Bozo", "Bikini"],
      },
      {
        slug: "laser-zonas-grandes",
        name: "Zonas medianas y grandes",
        summary: "Plan de sesiones adaptado a tu piel.",
        duration: "30–60 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
        highlights: ["Piernas", "Brazos", "Espalda"],
      },
    ],
  },
];

/** Tratamientos insignia para la sección oscura "momento premium".
 *  PLACEHOLDER: confirmar prioridad con la clienta. */
export const signatureSlugs = ["hydrafacial", "bubble-oxygen-facial", "microneedling", "hidralips"];

export const signatureTreatments = signatureSlugs
  .map((slug) => categories.flatMap((c) => c.treatments).find((t) => t.slug === slug))
  .filter((t): t is Treatment => Boolean(t));
