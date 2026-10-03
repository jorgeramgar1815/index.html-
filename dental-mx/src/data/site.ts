/**
 * Fuente única de contenido del sitio Dental MX.
 *
 * Todo dato NO confirmado por el cliente está marcado con `PLACEHOLDER:`.
 * Para listarlos: `grep -rn "PLACEHOLDER" src/`
 */

export type IconName =
  | 'tooth'
  | 'sparkle'
  | 'braces'
  | 'implant'
  | 'shine'
  | 'heart'
  | 'family'
  | 'chat'
  | 'calendar'
  | 'shield'
  | 'chip'
  | 'leaf'
  | 'tag'
  | 'pin'
  | 'phone'
  | 'clock'
  | 'star'
  | 'users'
  | 'award';

// ─── Interruptores ────────────────────────────────────────────────────────────
export const flags = {
  /**
   * Muestra etiquetas visibles ("Ejemplo", "Por confirmar") sobre contenido
   * provisional. Poner en `false` cuando el cliente haya validado todo.
   */
  placeholderBadges: true,
  // PLACEHOLDER: confirmar con el cliente si los precios de Facebook siguen vigentes (pregunta #3).
  showPrices: true,
  // PLACEHOLDER: confirmar nombre del doctor antes de publicar (pregunta #1).
  // En `false` la sección Nosotros muestra "Nuestro equipo clínico" y un retrato ilustrativo.
  showDoctorName: false,
};

// ─── NAP (Name · Address · Phone) — debe coincidir con Facebook / Google ─────
const WA_NUMBER = '5218715866828';

export const site = {
  name: 'Dental MX',
  legalName: 'Dental MX Torreón',
  tagline: 'Tu sonrisa en manos profesionales',
  description: 'Cuidado dental integral para toda la familia.',
  values: ['Salud bucal', 'Confianza', 'Bienestar'],
  seo: {
    title: 'Dentista en Torreón | Dental MX — Tu sonrisa en manos profesionales',
    description:
      'Clínica dental en Torreón Residencial. Ortodoncia, implantes, resinas estéticas, blanqueamiento y piezas dentales para toda la familia. Agenda tu cita por WhatsApp.',
  },
  address: {
    street: 'C. del Mar 1000, Local 16',
    neighborhood: 'Torreón Residencial',
    postalCode: '27268',
    city: 'Torreón',
    region: 'Coahuila',
    country: 'MX',
    full: 'C. del Mar 1000, Local 16, Torreón Residencial, 27268 Torreón, Coah., México',
  },
  phone: {
    display: '871 586 6828',
    intl: '+52 1 871 586 6828',
    tel: '+528715866828',
  },
  whatsapp: {
    number: WA_NUMBER,
    defaultMessage: 'Hola, me gustaría agendar una cita en Dental MX.',
  },
  social: {
    instagram: { handle: '@dentalmx_trc', url: 'https://www.instagram.com/dentalmx_trc/' },
    // PLACEHOLDER: reemplazar por la URL exacta de la página de Facebook de la clínica.
    facebook: { handle: 'Dental MX Torreón', url: 'https://www.facebook.com/search/top?q=Dental%20MX%20Torre%C3%B3n' },
  },
  maps: {
    query: 'Dental MX, C. del Mar 1000, Local 16, Torreón Residencial, 27268 Torreón, Coah.',
  },
  // PLACEHOLDER: confirmar horario real de atención con el cliente (pregunta #2).
  hours: [
    { days: 'Lunes a viernes', time: '10:00 – 14:00 · 16:00 – 20:00' },
    { days: 'Sábado', time: '10:00 – 14:00' },
    { days: 'Domingo', time: 'Cerrado' },
  ],
  // Formato schema.org, en sincronía con `hours`. PLACEHOLDER junto con el horario.
  openingHoursSpec: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '14:00' },
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '16:00', closes: '20:00' },
    { days: ['Saturday'], opens: '10:00', closes: '14:00' },
  ],
  doctor: {
    // PLACEHOLDER: nombre tomado de material de la clínica; confirmar y agregar cédula profesional.
    name: 'Dr. Edgar Contreras',
    role: 'Cirujano dentista · Director clínico',
    // PLACEHOLDER: cédula profesional por confirmar.
    license: 'Céd. Prof. por confirmar',
    // PLACEHOLDER: ruta a foto real, p. ej. '/img/doctor.jpg' (vacío = marco provisional).
    photo: '',
  },
};

/** Construye un enlace de WhatsApp con mensaje prellenado. */
export function waLink(message: string = site.whatsapp.defaultMessage): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Navegación de la landing: anclas a cada sección de la página de inicio. */
export const nav = [
  { href: '/#servicios', id: 'servicios', label: 'Servicios' },
  { href: '/#nosotros', id: 'nosotros', label: 'Nosotros' },
  { href: '/#testimonios', id: 'testimonios', label: 'Testimonios' },
  { href: '/#preguntas', id: 'preguntas', label: 'Preguntas' },
  { href: '/#contacto', id: 'contacto', label: 'Contacto' },
];

// ─── Servicios ───────────────────────────────────────────────────────────────
export type Service = {
  slug: string;
  name: string;
  icon: IconName;
  /** Categoría que se muestra en la tarjeta (Valoración, Estética…). */
  category: string;
  /** Punto de partida recomendado: tarjeta resaltada y botón "Agendar valoración". */
  featured?: boolean;
  /** Una línea: qué es. */
  short: string;
  /** Descripción ampliada (datos estructurados / SEO). */
  description: string;
  /** Para quién es, en etiquetas cortas. */
  forWho: string[];
  waMessage: string;
  /** PLACEHOLDER: promociones vistas en Facebook; pueden estar vencidas. */
  promo?: { label: string; was?: string; now: string; note?: string };
};

export const services: Service[] = [
  {
    slug: 'atencion-personalizada',
    category: 'Valoración',
    featured: true,
    name: 'Atención personalizada',
    icon: 'heart',
    short: 'Valoración integral y un plan claro, a tu ritmo y a tu presupuesto.',
    description:
      'Revisamos tu salud bucal completa, te explicamos opciones y costos sin letras chiquitas, y diseñamos un plan a tu ritmo y a tu presupuesto. Para toda la familia.',
    forWho: ['Primera visita', 'Toda la familia', 'Miedo al dentista'],
    waMessage: 'Hola, quiero agendar una valoración general.',
  },
  {
    slug: 'ortodoncia',
    category: 'Alineación',
    name: 'Ortodoncia',
    icon: 'braces',
    short: 'Brackets y alineadores para una sonrisa alineada, a cualquier edad.',
    description:
      'Corregimos apiñamiento, espacios y problemas de mordida con brackets o alineadores transparentes, con plan de pagos claro y seguimiento en cada ajuste.',
    forWho: ['Niños y adolescentes', 'Adultos', 'Mordida incorrecta'],
    waMessage: 'Hola, quiero información sobre ortodoncia (brackets).',
    // PLACEHOLDER: promo "Estrena sonrisa desde $499" vista en Facebook; confirmar vigencia.
    promo: { label: 'Estrena sonrisa', now: 'desde $499', note: 'Sujeto a valoración' },
  },
  {
    slug: 'blanqueamientos',
    category: 'Estética',
    name: 'Blanqueamientos',
    icon: 'shine',
    short: 'Varios tonos más blanca en una sola sesión, con supervisión profesional.',
    description:
      'Blanqueamiento profesional en consultorio con protección de encías y control de sensibilidad. Resultados visibles desde la primera sesión.',
    forWho: ['Manchas por café o tabaco', 'Eventos especiales'],
    waMessage: 'Hola, quiero información sobre el blanqueamiento dental.',
    // PLACEHOLDER: promo $3,000 → $1,200 vista en Facebook; confirmar vigencia.
    promo: { label: 'Promoción', was: '$3,000', now: '$1,200', note: 'En una sola sesión' },
  },
  {
    slug: 'resinas-esteticas',
    category: 'Estética',
    name: 'Resinas estéticas',
    icon: 'sparkle',
    short: 'Restauraciones del color de tu diente, en una sola cita.',
    description:
      'Reparamos caries, bordes astillados y espacios pequeños con resinas del tono exacto de tu diente, en una sola cita y con mínima intervención.',
    forWho: ['Caries', 'Dientes astillados', 'Espacios pequeños'],
    waMessage: 'Hola, quiero información sobre resinas estéticas.',
  },
  {
    slug: 'implantes',
    category: 'Rehabilitación',
    name: 'Implantes',
    icon: 'implant',
    short: 'La solución fija y duradera para reemplazar dientes perdidos.',
    description:
      'Un implante sustituye la raíz del diente y sostiene una corona fija: no se mueve, no afecta a los dientes vecinos y se cuida como un diente natural.',
    forWho: ['Diente perdido', 'Adiós a la prótesis removible'],
    waMessage: 'Hola, quiero información sobre implantes dentales.',
  },
  {
    slug: 'piezas-dentales',
    category: 'Rehabilitación',
    name: 'Piezas dentales',
    icon: 'tooth',
    short: 'Coronas, puentes y prótesis que se ven y se sienten naturales.',
    description:
      'Coronas, puentes y prótesis a la medida para devolverte la función al masticar y la seguridad al sonreír. Te explicamos cada alternativa y su costo antes de empezar.',
    forWho: ['Piezas perdidas', 'Dientes desgastados', 'Prótesis que no ajusta'],
    waMessage: 'Hola, quiero información sobre piezas dentales / prótesis.',
  },
];

// ─── Cómo funciona ───────────────────────────────────────────────────────────
export const steps = [
  { icon: 'chat' as IconName, title: 'Escríbenos', text: 'Cuéntanos por WhatsApp qué necesitas.' },
  { icon: 'shield' as IconName, title: 'Valoración', text: 'Revisamos tu caso y te damos un plan claro.' },
  { icon: 'shine' as IconName, title: 'Sonríe', text: 'Tratamiento a tu ritmo y a tu presupuesto.' },
];

// ─── Por qué elegirnos ───────────────────────────────────────────────────────
export const reasons = [
  { icon: 'chip' as IconName, title: 'Tecnología actual', text: 'Diagnósticos precisos y tratamientos más cómodos.' },
  { icon: 'heart' as IconName, title: 'Trato cercano', text: 'Te explicamos cada paso, sin prisas.' },
  { icon: 'leaf' as IconName, title: 'Ambiente cómodo', text: 'Un consultorio cálido que se siente ligero.' },
  { icon: 'tag' as IconName, title: 'Precios accesibles', text: 'Presupuestos claros desde el inicio.' },
];

// ─── Testimonios ─────────────────────────────────────────────────────────────
// PLACEHOLDER: testimonios de EJEMPLO. Reemplazar por reseñas reales con consentimiento (pregunta #5).
export const testimonials = [
  {
    name: 'Mariana G.',
    detail: 'Ortodoncia',
    text: 'Me explicaron todo con paciencia. A seis meses con brackets, el cambio ya se nota.',
    rating: 5,
  },
  {
    name: 'Luis R.',
    detail: 'Blanqueamiento',
    text: 'Me lo hice antes de mi boda: cero sensibilidad y resultado desde la primera sesión.',
    rating: 5,
  },
  {
    name: 'Patricia S.',
    detail: 'Mamá de dos pacientes',
    text: 'Súper pacientes con mis hijos, precios justos y agendar por WhatsApp es comodísimo.',
    rating: 5,
  },
];

// ─── Tips (contenido educativo, estilo carrusel de Facebook) ─────────────────
export const tips = [
  {
    tag: 'Brackets',
    title: 'Cuida tus brackets',
    points: ['Evita alimentos pegajosos o duros.', 'Usa cepillo interproximal.', '¿Se despegó uno? Agenda revisión.'],
  },
  {
    tag: 'Prótesis',
    title: 'Tu prótesis, como nueva',
    points: ['Límpiala con jabón neutro.', 'No duermas con ella puesta.', 'Guárdala en agua, en un recipiente limpio.'],
  },
  {
    tag: 'Alineadores',
    title: 'Alineadores transparentes',
    points: ['Úsalos de 20 a 22 horas al día.', 'Quítalos para comer y cepíllate antes de ponerlos.', 'Lávalos con agua fría, nunca caliente.'],
  },
];

// ─── Preguntas frecuentes ────────────────────────────────────────────────────
export const faqs = [
  {
    q: '¿Cada cuánto debo ir al dentista?',
    a: 'Cada seis meses, para revisión y limpieza. Detectar a tiempo es más sencillo y económico.',
  },
  {
    q: '¿Qué señales indican que debo ir pronto?',
    a: 'Dolor o sensibilidad persistente, encías que sangran, mal aliento constante o un diente flojo o fracturado.',
  },
  {
    q: '¿El blanqueamiento daña el esmalte?',
    a: 'No, si se hace en consultorio y con supervisión profesional. Protegemos tus encías y controlamos la sensibilidad.',
  },
  {
    q: '¿A qué edad se puede iniciar la ortodoncia?',
    a: 'Recomendamos una valoración desde los 7 años, pero la ortodoncia funciona a cualquier edad.',
  },
  {
    q: '¿Cómo agendo una cita?',
    a: 'Escríbenos por WhatsApp con el servicio y el horario que prefieres, y confirmamos tu cita.',
  },
];

// ─── Antes / Después ─────────────────────────────────────────────────────────
// PLACEHOLDER: ilustraciones. Reemplazar por casos reales con autorización del paciente.
export const beforeAfter = [
  { id: 'blanqueamiento', label: 'Blanqueamiento', variant: 'whitening' as const },
  { id: 'ortodoncia', label: 'Ortodoncia', variant: 'ortho' as const },
  { id: 'resinas', label: 'Resinas / piezas', variant: 'restoration' as const },
];
