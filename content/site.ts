/* =========================================================
   Datos del negocio — fuente única de verdad (NAP consistente
   con Facebook). Todo lo marcado PLACEHOLDER debe confirmarse
   con la clienta antes de publicar.
   ========================================================= */

export const site = {
  name: "Reduzen",
  fullName: "Reduzen — Mesoterapia & Spa",
  tagline: "Mesoterapia & Spa",
  // PLACEHOLDER: dominio definitivo (opciones sugeridas: reduzenspa.mx, reduzen.com.mx)
  url: "https://reduzenspa.mx",
  description:
    "Spa de mesoterapia y tratamientos estéticos faciales y corporales en Torreón, Coahuila. Hydrafacial, Bubble Oxygen Facial, Microneedling, uñas, pedicure y depilación láser. Agenda por WhatsApp.",
  message: "Este es tu momento. Desconecta, renueva tu energía y florece desde adentro. Te mereces este espacio.",

  phoneDisplay: "871 606 2886",
  phoneE164: "+528716062886",
  whatsappNumber: "5218716062886",
  email: "reduzenspa@gmail.com",

  address: {
    street: "Cerrada División del Norte 285, Local 1",
    between: "Entre calle de la Noria y Gómez Morín",
    neighborhood: "Col. Hacienda Residencial",
    city: "Torreón",
    region: "Coahuila",
    postalCode: "27276",
    country: "MX",
  },

  // Búsqueda por dirección para el mapa embebido (no requiere API key).
  // PLACEHOLDER: reemplazar por el embed del perfil de Google Business cuando exista.
  mapQuery:
    "Cerrada División del Norte 285, Hacienda Residencial, 27276 Torreón, Coahuila",

  // PLACEHOLDER: confirmar horario real con la clienta (Facebook no lo muestra).
  hours: [
    { days: "Lunes a viernes", time: "10:00 – 20:00" },
    { days: "Sábado", time: "10:00 – 15:00" },
    { days: "Domingo", time: "Cerrado" },
  ],
  hoursConfirmed: false,

  social: {
    // PLACEHOLDER: confirmar URL exacta de la página de Facebook.
    facebook: "https://www.facebook.com/reduzen",
    // PLACEHOLDER: confirmar si manejan Instagram; dejar null para ocultarlo.
    instagram: null as string | null,
  },
} as const;

export const fullAddress = `${site.address.street}, ${site.address.neighborhood}, ${site.address.city}, ${site.address.region}, C.P. ${site.address.postalCode}`;

export const brandValues = [
  {
    key: "bienestar",
    title: "Bienestar",
    phrase: "que se siente",
    icon: "drop",
    body:
      "Cada tratamiento empieza por cómo te sientes. Un espacio sereno, aromas suaves y tiempo solo para ti, para que el cuerpo y la mente bajen el ritmo.",
  },
  {
    key: "belleza",
    title: "Belleza",
    phrase: "que te acompaña",
    icon: "sparkle",
    body:
      "Resultados visibles que se sostienen en el tiempo. Te acompañamos con un plan pensado para tu piel y tu cuerpo, sesión tras sesión.",
  },
  {
    key: "conexion",
    title: "Conexión",
    phrase: "contigo",
    icon: "heart",
    body:
      "Escuchamos antes de recomendar. Queremos que salgas de aquí más en paz contigo misma, no solo con un tratamiento más.",
  },
  {
    key: "version",
    title: "Tu mejor",
    phrase: "versión",
    icon: "lotus",
    body:
      "Florecer desde adentro: confianza, luminosidad y energía renovada. Esa es la versión de ti que queremos ver salir por la puerta.",
  },
] as const;

export const navLinks = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#tratamientos", label: "Tratamientos" },
  { href: "/#resultados", label: "Resultados" },
  { href: "/#testimonios", label: "Testimonios" },
  { href: "/#contacto", label: "Contacto" },
] as const;

export const pageLinks = [
  { href: "/servicios/", label: "Catálogo de servicios" },
  { href: "/nosotros/", label: "Nosotros" },
] as const;
