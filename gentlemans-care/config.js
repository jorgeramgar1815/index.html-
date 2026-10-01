/**
 * ============================================================
 *  CONFIGURACIÓN DEL SITIO — Gentleman's Care (Peluquería y Spa)
 * ============================================================
 *  Edita SOLO este archivo para cambiar datos de contacto, horario,
 *  mensajes de WhatsApp y promoción. Todo lo que diga "TODO" es un
 *  dato pendiente de confirmar con el negocio: mientras siga así,
 *  la página muestra la etiqueta "[PENDIENTE]".
 *
 *  Nota: título, meta descripción, JSON-LD y Open Graph están en
 *  <head> de index.html (son estáticos para SEO). Si cambias aquí
 *  la dirección o el teléfono, actualiza también el JSON-LD.
 */
window.SITE_CONFIG = {
  negocio: {
    nombre: "Gentleman's Care",
    giro: 'Peluquería y Spa',
    ciudad: 'Torreón, Coahuila',
  },

  contacto: {
    // WhatsApp a 10 dígitos (México) o con lada internacional. Ej: '8711234567' o '528711234567'.
    // Mientras esté vacío, los botones abren WhatsApp para que el usuario elija el contacto.
    whatsapp: '', // TODO: WhatsApp del negocio
    telefono: '', // TODO: teléfono (ej. '871 123 4567')
    email: '', // TODO: correo (opcional)
    direccion: '', // TODO: plaza y número de local
    // Al confirmar la referencia, quita el prefijo 'TODO: ' (así desaparece la etiqueta [CONFIRMAR]).
    referencia: 'TODO: A un lado de LOOP Specialty Coffee Roasters',
    // Texto que se busca en Google Maps (mapa y botón "Abrir en Google Maps").
    mapsQuery: 'Torreón, Coahuila', // TODO: cambiar por la dirección exacta o el nombre en Google Maps
    facebook: '', // TODO: enlace al perfil "Edy Salazart" o a la Página oficial
    instagram: '', // TODO: enlace de Instagram
  },

  // Zona horaria de Torreón (sin horario de verano desde 2022).
  zonaHoraria: 'America/Monterrey',

  /**
   * Horario por día. Formato 24 h 'HH:MM'. Usa null si ese día está cerrado.
   * Mientras los valores sean 'TODO', se muestra [PENDIENTE] y el indicador
   * "Abierto ahora / Cerrado" queda oculto.
   * Ej: lunes: { abre: '10:00', cierra: '20:00' }
   */
  horario: {
    lunes: 'TODO',
    martes: 'TODO',
    miercoles: 'TODO',
    jueves: 'TODO',
    viernes: 'TODO',
    sabado: 'TODO',
    domingo: 'TODO',
  },

  // Mensajes prellenados de WhatsApp.
  mensajes: {
    cita: "Hola, quiero agendar una cita en Gentleman's Care. ¿Qué horarios tienen disponibles?",
    promo: "Hola, quiero información de la promoción de Gentleman's Care.",
  },

  /**
   * Promoción. Se muestra en el banner superior y en su propia sección.
   * - mostrar: true / false
   * - fechaFin: 'AAAA-MM-DD' (último día de la promoción). Al pasar esa fecha
   *   (hora de Torreón) la promoción se oculta sola. Déjala vacía si no caduca.
   */
  promo: {
    mostrar: false,
    titulo: '[PROMOCIÓN – pendiente del cliente]', // TODO
    descripcion: '[Descripción de la promoción]', // TODO
    vigenciaTexto: 'Vigencia: [DEL __ AL __ DE ____]', // TODO
    fechaFin: '', // TODO: ej. '2026-12-31'
  },
};
