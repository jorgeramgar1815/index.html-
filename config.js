/*
 * ─────────────────────────────────────────────────────────────
 *  ÓPTICA LUZ · Datos editables del sitio
 * ─────────────────────────────────────────────────────────────
 *  Todo lo que cambia con frecuencia vive aquí: contacto, horario,
 *  mensajes de WhatsApp y la promoción. main.js lee este archivo y
 *  actualiza los enlaces y textos de la página.
 *
 *  Busca "TODO" para ver los datos que faltan confirmar.
 *  Instrucciones completas en README.md.
 */
window.SITE_CONFIG = {
  negocio: {
    nombre: "Óptica Luz",
    slogan: "Claridad que transforma tu mirada",
  },

  contacto: {
    // Número de WhatsApp en formato internacional, solo dígitos (52 + lada + número).
    whatsapp: "528713333666",
    // Número para enlaces tel: (con +52).
    telefono: "+528713333666",
    // Cómo se muestra el número en pantalla.
    telefonoVisible: "871 333 3666",
    email: "opticaluzcolon@gmail.com",
    // TODO: URL real de la página de Facebook (el diseño no la incluye).
    // Mientras esté vacía se usa una búsqueda de "Óptica Luz Torreón" en Facebook.
    facebook: "",
  },

  ubicacion: {
    direccionMapa: "Calzada Colón 690, Plaza Reyna, 27220 Torreón, Coahuila",
  },

  horario: {
    // Zona horaria de Torreón, Coahuila (sin horario de verano).
    zonaHoraria: "America/Monterrey",
    // dias: 0 = domingo, 1 = lunes … 6 = sábado. Horas en formato 24 h "HH:MM".
    bloques: [
      { dias: [1, 2, 3, 4, 5], abre: "09:30", cierra: "18:30" },
      { dias: [6, 0], abre: "10:00", cierra: "15:00" },
    ],
    // Días cerrados excepcionales (feriados), formato "AAAA-MM-DD". Ej.: ["2026-12-25"]
    diasCerrados: [],
    // Intervalo (minutos) de las opciones de horario en el formulario de citas.
    intervaloCitas: 30,
  },

  whatsapp: {
    // Mensaje prellenado de los botones de WhatsApp.
    mensajes: {
      general: "Hola, quiero agendar mi examen de la vista en Óptica Luz.",
      promo: "Hola, quiero aprovechar el 25% de descuento por apertura en Óptica Luz.",
    },
    // Plantilla del formulario. Variables: {nombre} {motivo} {dia} {horario}
    plantillaFormulario:
      "Hola, soy {nombre}. {motivo}\nDía preferido: {dia}\nHorario preferido: {horario}",
    motivos: {
      examen: "Quiero agendar mi examen de la vista GRATIS en Óptica Luz.",
      informes: "Quiero pedir informes en Óptica Luz.",
    },
    // Segundos antes de mostrar el globo del botón flotante.
    segundosTooltip: 4,
  },

  promocion: {
    // true = se muestra la promoción · false = se oculta en todo el sitio.
    mostrar: true,
    // Texto de vigencia que se ve en la barra superior y en la sección de promoción.
    vigenciaTexto: "Válido durante septiembre",
    // Fecha y hora de fin (hora de Torreón, UTC-6). Al pasar esta fecha la promoción
    // se oculta sola. Déjala vacía ("") para no ocultarla automáticamente.
    // TODO: confirmar. El diseño solo dice "Válido durante septiembre"; se asumió
    // septiembre de 2026 por el "© 2026" del pie de página.
    fechaFin: "2026-09-30T23:59:59-06:00",
  },
};
