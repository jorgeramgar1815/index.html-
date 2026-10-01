import { site } from "@/content/site";

/** Enlace wa.me con mensaje prellenado contextual. */
export function waLink(message = "Hola, me gustaría agendar una cita en Reduzen.") {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const waMessages = {
  general: "Hola, me gustaría agendar una cita en Reduzen.",
  hero: "Hola, vi su página y quiero agendar mi cita en Reduzen.",
  header: "Hola, quiero agendar una cita en Reduzen.",
  floating: "Hola, tengo una pregunta sobre sus tratamientos.",
  results: "Hola, quiero una valoración para saber qué tratamiento es para mí.",
  closing: "Hola, quiero reservar mi espacio en Reduzen.",
  about: "Hola, me gustaría conocer Reduzen y agendar una visita.",
  treatment: (name: string) => `Hola, quiero información sobre ${name}.`,
  category: (name: string) => `Hola, quiero información sobre sus servicios de ${name.toLowerCase()}.`,
};
