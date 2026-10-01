/* =========================================================
   PLACEHOLDER: testimonios de EJEMPLO.
   Reemplazar por reseñas reales de clientas (con consentimiento
   por escrito) antes de publicar. Estructura lista para 3–6.
   ========================================================= */

export type Testimonial = {
  name: string;
  detail: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  isExample: boolean;
};

export const testimonials: Testimonial[] = [
  {
    name: "Mariana G.",
    detail: "Hydrafacial",
    quote:
      "Salí con la piel luminosa y sintiéndome ligera. Te atienden con muchísimo cariño.",
    rating: 5,
    isExample: true,
  },
  {
    name: "Daniela R.",
    detail: "Bubble Oxygen Facial",
    quote: "Me explicaron todo antes de empezar. Se nota que saben lo que hacen.",
    rating: 5,
    isExample: true,
  },
  {
    name: "Paola V.",
    detail: "Microneedling",
    quote: "Tres sesiones y la textura de mi piel cambió muchísimo.",
    rating: 5,
    isExample: true,
  },
  {
    name: "Karla M.",
    detail: "Pedicure spa",
    quote: "Un ratito para mí, sin prisas. Agendar por WhatsApp fue facilísimo.",
    rating: 5,
    isExample: true,
  },
  {
    name: "Sofía L.",
    detail: "Hidralips",
    quote: "Resultado súper natural. Se siente como un spa de verdad, nada clínico.",
    rating: 5,
    isExample: true,
  },
];
