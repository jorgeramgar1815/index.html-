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
    intro: "Limpieza profunda, hidratación y rejuvenecimiento con tecnología para una piel luminosa.",
    icon: "face",
    art: "facial",
    image: null, // PLACEHOLDER: foto de tratamiento facial
    treatments: [
      {
        slug: "hydrafacial",
        name: "Hydrafacial",
        summary:
          "Limpieza profunda, exfoliación e hidratación intensa en una sola sesión. Tu piel se ve más luminosa desde el primer día.",
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
          "Oxigenación con burbujas activas, fotorejuvenecimiento, ultrasonido 3D y cápsulas inteligentes para una piel renovada.",
        duration: "75 min", // PLACEHOLDER
        confirmed: true,
        highlights: ["Fotorejuvenecimiento", "Ultrasonido 3D", "Cápsulas inteligentes"],
      },
      {
        slug: "microneedling",
        name: "Microneedling",
        summary:
          "Estimula el colágeno natural para mejorar textura, poros y marcas. Rejuvenece el rostro e incluso el dorso de las manos.",
        duration: "60 min", // PLACEHOLDER
        confirmed: true,
        highlights: ["Colágeno", "Textura", "Rostro y manos"],
      },
      {
        slug: "hidralips",
        name: "Hidralips",
        summary:
          "Hidratación profunda y definición de labios para un contorno suave, jugoso y natural, sin perder tu esencia.",
        duration: "45 min", // PLACEHOLDER
        confirmed: true,
        highlights: ["Hidratación", "Definición", "Efecto natural"],
      },
      {
        slug: "limpieza-facial",
        name: "Limpieza facial profunda",
        summary:
          "Extracción, exfoliación y mascarilla según tu tipo de piel. El punto de partida ideal para cualquier rutina.",
        duration: "50 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER: tratamiento sugerido, confirmar con la clienta
      },
    ],
  },
  {
    slug: "corporales",
    name: "Tratamientos corporales",
    short: "Corporales",
    intro: "Mesoterapia y técnicas corporales para moldear, reafirmar y recuperar ligereza.",
    icon: "body",
    art: "body",
    image: null, // PLACEHOLDER
    treatments: [
      {
        slug: "mesoterapia-corporal",
        name: "Mesoterapia corporal",
        summary:
          "Aplicación localizada de activos para trabajar grasa localizada, celulitis y flacidez, con un plan por sesiones.",
        duration: "45 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER: confirmar detalle del servicio
      },
      {
        slug: "moldeo-corporal",
        name: "Moldeo y reducción",
        summary:
          "Protocolo combinado para contorno corporal y reafirmación de abdomen, cintura, brazos o piernas.",
        duration: "60 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
      },
      {
        slug: "drenaje-linfatico",
        name: "Drenaje linfático",
        summary:
          "Masaje suave y rítmico que ayuda a desinflamar, reducir retención de líquidos y aligerar el cuerpo.",
        duration: "60 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
      },
    ],
  },
  {
    slug: "unas",
    name: "Uñas",
    short: "Uñas",
    intro: "Manos cuidadas y un acabado impecable, con diseños a tu gusto.",
    icon: "nails",
    art: "nails",
    image: null, // PLACEHOLDER
    treatments: [
      {
        slug: "manicure-spa",
        name: "Manicure spa",
        summary: "Limpieza, cutícula, exfoliación e hidratación de manos con esmaltado a elegir.",
        duration: "45 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
      },
      {
        slug: "unas-gel",
        name: "Uñas en gel o acrílico",
        summary: "Aplicación, nivelación y diseño personalizado con acabado duradero y natural.",
        duration: "90 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
      },
    ],
  },
  {
    slug: "pedicure",
    name: "Pedicure",
    short: "Pedicure",
    intro: "Un ritual para tus pies: descanso, suavidad y un acabado limpio.",
    icon: "foot",
    art: "pedicure",
    image: null, // PLACEHOLDER
    treatments: [
      {
        slug: "pedicure-spa",
        name: "Pedicure spa",
        summary: "Baño relajante, exfoliación, retiro de callosidad, masaje e hidratación profunda.",
        duration: "60 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
      },
      {
        slug: "pedicure-express",
        name: "Pedicure express",
        summary: "Limado, cutícula y esmaltado para cuando buscas un acabado rápido e impecable.",
        duration: "35 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
      },
    ],
  },
  {
    slug: "depilacion-laser",
    name: "Depilación láser",
    short: "Depilación láser",
    intro: "Piel suave por más tiempo, con sesiones rápidas y un plan por zona.",
    icon: "laser",
    art: "laser",
    image: null, // PLACEHOLDER
    treatments: [
      {
        slug: "laser-zonas-pequenas",
        name: "Zonas pequeñas",
        summary: "Axila, bozo, mentón o línea de bikini. Sesiones cortas con resultados progresivos.",
        duration: "15–20 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
      },
      {
        slug: "laser-zonas-grandes",
        name: "Zonas medianas y grandes",
        summary: "Piernas, brazos o espalda con un plan de sesiones adaptado a tu piel y tu vello.",
        duration: "30–60 min", // PLACEHOLDER
        confirmed: false, // PLACEHOLDER
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
