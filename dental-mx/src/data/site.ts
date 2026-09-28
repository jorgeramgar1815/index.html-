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
  showDoctorName: true,
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
    // PLACEHOLDER: bio provisional, reemplazar con la del doctor.
    bio: [
      'Al frente de Dental MX, el Dr. Contreras combina la precisión clínica con un trato cercano: explica cada paso, resuelve dudas sin prisa y diseña planes de tratamiento a la medida de cada paciente y de cada presupuesto.',
      'Su enfoque es preventivo y familiar: que niños, jóvenes y adultos se sientan en confianza desde la primera visita.',
    ],
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
  short: string;
  description: string;
  forWho: string[];
  waMessage: string;
  /** PLACEHOLDER: promociones vistas en Facebook; pueden estar vencidas. */
  promo?: { label: string; was?: string; now: string; note?: string };
};

export const services: Service[] = [
  {
    slug: 'piezas-dentales',
    name: 'Piezas dentales',
    icon: 'tooth',
    short: 'Recupera las piezas que faltan con prótesis fijas o removibles que se ven y se sienten naturales.',
    description:
      'Coronas, puentes y prótesis a la medida para devolverte la función al masticar y la seguridad al sonreír. Te explicamos cada alternativa y su costo antes de empezar.',
    forWho: [
      'Perdiste una o varias piezas',
      'Tienes dientes muy desgastados o fracturados',
      'Buscas renovar una prótesis que ya no ajusta',
    ],
    waMessage: 'Hola, quiero información sobre piezas dentales / prótesis.',
  },
  {
    slug: 'resinas-esteticas',
    name: 'Resinas estéticas',
    icon: 'sparkle',
    short: 'Restauraciones del color de tu diente para caries, fracturas o pequeños detalles estéticos.',
    description:
      'Reparamos caries, bordes astillados y espacios pequeños con resinas del tono exacto de tu diente, en una sola cita y con mínima intervención.',
    forWho: [
      'Tienes caries o empastes oscuros antiguos',
      'Un diente se astilló o fracturó',
      'Quieres cerrar pequeños espacios sin ortodoncia',
    ],
    waMessage: 'Hola, quiero información sobre resinas estéticas.',
  },
  {
    slug: 'ortodoncia',
    name: 'Ortodoncia',
    icon: 'braces',
    short: 'Brackets y alineadores para una mordida correcta y una sonrisa alineada, a cualquier edad.',
    description:
      'Corregimos apiñamiento, espacios y problemas de mordida con brackets o alineadores transparentes. Plan de pagos claro y seguimiento en cada ajuste.',
    forWho: [
      'Niños y adolescentes en crecimiento',
      'Adultos que quieren alinear su sonrisa',
      'Personas con dolor o desgaste por mala mordida',
    ],
    waMessage: 'Hola, quiero información sobre ortodoncia (brackets).',
    // PLACEHOLDER: promo "Estrena sonrisa desde $499" vista en Facebook; confirmar vigencia.
    promo: { label: 'Estrena sonrisa', now: 'desde $499', note: 'Precio promocional sujeto a valoración' },
  },
  {
    slug: 'implantes',
    name: 'Implantes',
    icon: 'implant',
    short: 'La solución más estable y duradera para reemplazar dientes perdidos, con raíz de titanio.',
    description:
      'Un implante sustituye la raíz del diente y sostiene una corona fija: no se mueve, no afecta a los dientes vecinos y se cuida como un diente natural.',
    forWho: [
      'Perdiste una pieza y quieres una solución fija',
      'Tu prótesis removible te resulta incómoda',
      'Buscas un resultado duradero a largo plazo',
    ],
    waMessage: 'Hola, quiero información sobre implantes dentales.',
  },
  {
    slug: 'blanqueamientos',
    name: 'Blanqueamientos',
    icon: 'shine',
    short: 'Aclara varios tonos tu sonrisa en una sola sesión, de forma segura y supervisada.',
    description:
      'Blanqueamiento profesional en consultorio con protección de encías y control de sensibilidad. Resultados visibles desde la primera sesión.',
    forWho: [
      'Tus dientes se han manchado por café, té o tabaco',
      'Tienes un evento especial próximamente',
      'Quieres complementar un tratamiento estético',
    ],
    waMessage: 'Hola, quiero información sobre el blanqueamiento dental.',
    // PLACEHOLDER: promo $3,000 → $1,200 vista en Facebook; confirmar vigencia.
    promo: { label: 'Promoción', was: '$3,000', now: '$1,200', note: 'En una sola sesión' },
  },
  {
    slug: 'atencion-personalizada',
    name: 'Atención personalizada',
    icon: 'heart',
    short: 'Valoración integral, plan de tratamiento claro y acompañamiento en cada visita.',
    description:
      'Revisamos tu salud bucal completa, te explicamos opciones y costos sin letras chiquitas, y diseñamos un plan a tu ritmo y a tu presupuesto. Para toda la familia.',
    forWho: [
      'Primera visita o revisión general',
      'Familias que buscan un dentista de confianza',
      'Pacientes con miedo o ansiedad al dentista',
    ],
    waMessage: 'Hola, quiero agendar una valoración general.',
  },
];

// ─── Barra de confianza ──────────────────────────────────────────────────────
type TrustItem = { icon: IconName; label: string; value?: number; suffix?: string; placeholder?: boolean };

export const trust: TrustItem[] = [
  { icon: 'family', label: 'Atención para toda la familia' },
  { icon: 'chat', label: 'Citas por WhatsApp' },
  // PLACEHOLDER: años de experiencia por confirmar.
  { icon: 'award', label: 'Años de experiencia', value: 10, suffix: '+', placeholder: true },
  // PLACEHOLDER: número de pacientes atendidos por confirmar.
  { icon: 'users', label: 'Pacientes atendidos', value: 2500, suffix: '+', placeholder: true },
];

// ─── Por qué elegirnos ───────────────────────────────────────────────────────
export const reasons = [
  {
    icon: 'chip' as IconName,
    title: 'Tecnología actual',
    text: 'Equipo y materiales de calidad para diagnósticos precisos y tratamientos más cómodos.',
  },
  {
    icon: 'heart' as IconName,
    title: 'Atención personalizada',
    text: 'Te explicamos cada paso y resolvemos tus dudas. Aquí no eres un número de expediente.',
  },
  {
    icon: 'leaf' as IconName,
    title: 'Ambiente cómodo',
    text: 'Un consultorio cálido y tranquilo, pensado para que la visita al dentista se sienta ligera.',
  },
  {
    icon: 'tag' as IconName,
    title: 'Precios accesibles',
    text: 'Presupuestos claros desde el inicio y opciones para que cuidar tu sonrisa quepa en tu bolsillo.',
  },
];

// ─── Testimonios ─────────────────────────────────────────────────────────────
// PLACEHOLDER: testimonios de EJEMPLO. Reemplazar por reseñas reales con consentimiento (pregunta #5).
export const testimonials = [
  {
    name: 'Mariana G.',
    detail: 'Paciente de ortodoncia',
    text: 'Desde la primera cita me explicaron todo con mucha paciencia. Llevo seis meses con brackets y el cambio ya se nota. El consultorio está súper bonito y limpio.',
    rating: 5,
  },
  {
    name: 'Luis R.',
    detail: 'Blanqueamiento',
    text: 'Me hice el blanqueamiento antes de mi boda y quedé feliz. Cero sensibilidad y el resultado se vio desde la misma sesión.',
    rating: 5,
  },
  {
    name: 'Patricia S.',
    detail: 'Mamá de dos pacientes',
    text: 'Llevo a mis hijos y a mí me atienden también. Son muy pacientes con los niños y los precios son muy justos. Agendar por WhatsApp es comodísimo.',
    rating: 5,
  },
];

// ─── Tips (contenido educativo, estilo carrusel de Facebook) ─────────────────
export const tips = [
  {
    tag: 'Brackets',
    title: 'Cuida tus brackets',
    points: [
      'Evita alimentos pegajosos o muy duros: caramelos, chicles, palomitas.',
      'Usa cepillo interproximal y enhebrador para el hilo dental.',
      'Si un bracket se despega, agenda una revisión cuanto antes.',
    ],
  },
  {
    tag: 'Prótesis',
    title: 'Tu prótesis, como nueva',
    points: [
      'Cepíllala a diario con jabón neutro, no con pasta abrasiva.',
      'No duermas con ella puesta: deja descansar tus encías.',
      'Guárdala en un recipiente limpio y con agua.',
    ],
  },
  {
    tag: 'Alineadores',
    title: 'Alineadores transparentes',
    points: [
      'Úsalos de 20 a 22 horas al día para ver resultados.',
      'Quítalos para comer y lávate los dientes antes de volver a ponerlos.',
      'Límpialos con agua fría: el agua caliente los deforma.',
    ],
  },
];

// ─── Preguntas frecuentes (página de servicios) ──────────────────────────────
export const faqs = [
  {
    q: '¿Cada cuánto debo ir al dentista?',
    a: 'Recomendamos una revisión y limpieza cada seis meses. Así detectamos a tiempo caries o problemas de encías, cuando su tratamiento es más sencillo y económico.',
  },
  {
    q: '¿Qué señales indican que debo agendar una cita pronto?',
    a: 'Dolor o sensibilidad persistente, encías que sangran o están inflamadas, mal aliento constante, un diente flojo o fracturado, o dolor al masticar. Si notas alguna, escríbenos por WhatsApp.',
  },
  {
    q: '¿El blanqueamiento daña el esmalte?',
    a: 'No, cuando se realiza en consultorio y bajo supervisión profesional. Protegemos las encías y usamos productos que controlan la sensibilidad.',
  },
  {
    q: '¿A qué edad se puede iniciar la ortodoncia?',
    a: 'Una primera valoración a partir de los 7 años permite anticipar problemas. Sin embargo, la ortodoncia funciona a cualquier edad, también en adultos.',
  },
  {
    q: '¿Cómo agendo una cita?',
    a: 'Escríbenos por WhatsApp con el servicio que te interesa y el horario que prefieres. Te respondemos para confirmar tu cita.',
  },
];

// ─── Antes / Después ─────────────────────────────────────────────────────────
// PLACEHOLDER: ilustraciones. Reemplazar por casos reales con autorización del paciente.
export const beforeAfter = [
  { id: 'blanqueamiento', label: 'Blanqueamiento', variant: 'whitening' as const },
  { id: 'ortodoncia', label: 'Ortodoncia', variant: 'ortho' as const },
  { id: 'resinas', label: 'Resinas / piezas', variant: 'restoration' as const },
];
