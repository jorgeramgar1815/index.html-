/*
 * Óptica Luz · Interactividad
 * Sin dependencias. Lee los datos de config.js (window.SITE_CONFIG).
 */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var contacto = cfg.contacto || {};
  var horario = cfg.horario || {};
  var wa = cfg.whatsapp || {};
  var promo = cfg.promocion || {};
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ─────────────── Medición de clics (GA4 / GTM / Meta Pixel) ─────────────── */
  function canal(nombre) {
    if (/^whatsapp/.test(nombre)) return "whatsapp";
    if (/^tel/.test(nombre)) return "telefono";
    if (/^email/.test(nombre)) return "email";
    if (/^(como-llegar|mapa)/.test(nombre)) return "mapa";
    return "navegacion";
  }

  function track(nombre, extra) {
    var datos = { cta: nombre, canal: canal(nombre) };
    if (extra) for (var k in extra) datos[k] = extra[k];
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", "cta_click", datos);
      } else {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(Object.assign({ event: "cta_click" }, datos));
      }
      if (typeof window.fbq === "function") {
        if (datos.canal === "whatsapp" || datos.canal === "telefono" || datos.canal === "email") {
          window.fbq("track", "Contact", { content_name: nombre });
        } else {
          window.fbq("trackCustom", "CTAClick", { content_name: nombre });
        }
      }
    } catch (e) { /* la medición nunca debe romper la página */ }
  }
  window.opticaLuzTrack = track;

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-track]");
    if (el) track(el.getAttribute("data-track"));
  });

  /* ─────────────── Datos de config.js → enlaces y textos ─────────────── */
  function waUrl(mensaje) {
    return "https://wa.me/" + contacto.whatsapp + "?text=" + encodeURIComponent(mensaje || "");
  }

  function aplicarConfig() {
    var mensajes = wa.mensajes || {};
    if (contacto.whatsapp) {
      $$("[data-wa]").forEach(function (a) {
        var clave = a.getAttribute("data-wa") || "general";
        a.href = waUrl(mensajes[clave] || mensajes.general);
      });
    }
    if (contacto.telefono) $$("[data-tel]").forEach(function (a) { a.href = "tel:" + contacto.telefono; });
    if (contacto.email) $$("[data-mail]").forEach(function (a) { a.href = "mailto:" + contacto.email; });
    if (contacto.facebook) $$("[data-facebook]").forEach(function (a) { a.href = contacto.facebook; });

    var dir = (cfg.ubicacion || {}).direccionMapa;
    if (dir) {
      $$("[data-maps-dir]").forEach(function (a) {
        a.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(dir);
      });
    }

    var textos = {
      telefonoVisible: contacto.telefonoVisible,
      email: contacto.email,
      promoVigencia: promo.vigenciaTexto,
    };
    $$("[data-cfg]").forEach(function (el) {
      var v = textos[el.getAttribute("data-cfg")];
      if (v) el.textContent = v;
    });

    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ─────────────── Promoción: se oculta sola al vencer ─────────────── */
  function revisarPromo() {
    var fin = promo.fechaFin ? Date.parse(promo.fechaFin) : NaN;
    var oculta = promo.mostrar === false || (!isNaN(fin) && Date.now() > fin);
    root.classList.toggle("sin-promo", oculta);
    pintarCuentaRegresiva(fin, oculta);
    return oculta;
  }

  // "Termina hoy" / "Último día: mañana" / "Quedan N días" cuando faltan 7 días o menos
  function pintarCuentaRegresiva(fin, oculta) {
    var el = $("[data-promo-countdown]");
    if (!el) return;
    if (oculta || isNaN(fin)) { el.hidden = true; return; }
    var hoy = ahoraNegocio();
    var finPartes = fmtPartes ? (function () {
      var o = {};
      fmtPartes.formatToParts(new Date(fin)).forEach(function (p) { o[p.type] = p.value; });
      return infoFecha(+o.year, +o.month, +o.day);
    })() : null;
    if (!finPartes) { el.hidden = true; return; }
    var dias = Math.round((Date.UTC(finPartes.y, finPartes.m - 1, finPartes.d) - Date.UTC(hoy.y, hoy.m - 1, hoy.d)) / 86400000);
    if (dias < 0 || dias > 7) { el.hidden = true; return; }
    el.textContent = dias === 0 ? "Termina hoy" : dias === 1 ? "Último día: mañana" : "Quedan " + (dias + 1) + " días";
    el.hidden = false;
  }

  /* ─────────────── Horario y zona horaria ─────────────── */
  var TZ = horario.zonaHoraria || "America/Monterrey";
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var fmtPartes;
  try {
    fmtPartes = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    });
  } catch (e) {
    fmtPartes = null;
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function aMinutos(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
  function hora12(min) {
    var h = Math.floor(min / 60), m = min % 60;
    var sufijo = h < 12 ? "am" : "pm";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + pad(m) + " " + sufijo;
  }

  // Fecha "civil" (año, mes, día) → info del día sin depender de la zona del visitante
  function infoFecha(y, m, d) {
    var dt = new Date(Date.UTC(y, m - 1, d));
    return {
      y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate(),
      dow: dt.getUTCDay(),
      iso: dt.getUTCFullYear() + "-" + pad(dt.getUTCMonth() + 1) + "-" + pad(dt.getUTCDate()),
    };
  }

  function ahoraNegocio() {
    var now = new Date();
    if (!fmtPartes) {
      var f = infoFecha(now.getFullYear(), now.getMonth() + 1, now.getDate());
      f.min = now.getHours() * 60 + now.getMinutes();
      return f;
    }
    var o = {};
    fmtPartes.formatToParts(now).forEach(function (p) { o[p.type] = p.value; });
    var info = infoFecha(+o.year, +o.month, +o.day);
    info.min = (+o.hour % 24) * 60 + +o.minute;
    return info;
  }

  function bloqueDelDia(info) {
    if ((horario.diasCerrados || []).indexOf(info.iso) !== -1) return null;
    var bloques = horario.bloques || [];
    for (var i = 0; i < bloques.length; i++) {
      if (bloques[i].dias.indexOf(info.dow) !== -1) {
        return { abre: aMinutos(bloques[i].abre), cierra: aMinutos(bloques[i].cierra) };
      }
    }
    return null;
  }

  function estadoHorario() {
    var hoy = ahoraNegocio();
    var b = bloqueDelDia(hoy);
    if (b && hoy.min >= b.abre && hoy.min < b.cierra) {
      return { abierto: true, detalle: "Cierra a las " + hora12(b.cierra), hoy: hoy };
    }
    if (b && hoy.min < b.abre) {
      return { abierto: false, detalle: "Abre hoy a las " + hora12(b.abre), hoy: hoy };
    }
    for (var k = 1; k <= 14; k++) {
      var dia = infoFecha(hoy.y, hoy.m, hoy.d + k);
      var bk = bloqueDelDia(dia);
      if (bk) {
        var cuando = k === 1 ? "mañana" : "el " + DIAS[dia.dow];
        return { abierto: false, detalle: "Abre " + cuando + " a las " + hora12(bk.abre), hoy: hoy };
      }
    }
    return { abierto: false, detalle: "", hoy: hoy };
  }

  function pintarEstado() {
    if (!horario.bloques) return;
    var st = estadoHorario();
    $$("[data-open-status]").forEach(function (el) {
      el.classList.toggle("is-open", st.abierto);
      el.innerHTML =
        '<span class="open-status__dot" aria-hidden="true"></span>' +
        '<span class="open-status__state">' + (st.abierto ? "Abierto ahora" : "Cerrado") + "</span>" +
        (st.detalle ? '<span class="open-status__detail">' + st.detalle + "</span>" : "");
      el.hidden = false;
      el.classList.add("is-ready");
    });
    var cerradoHoy = (horario.diasCerrados || []).indexOf(st.hoy.iso) !== -1;
    $$(".hours__row[data-days]").forEach(function (row) {
      var dias = row.getAttribute("data-days").split(",").map(Number);
      row.classList.toggle("is-today", !cerradoHoy && dias.indexOf(st.hoy.dow) !== -1);
    });
  }

  /* ─────────────── Encabezado: alto real y sombra al hacer scroll ─────────────── */
  var header = $("[data-header]");
  function medirHeader() {
    if (header) root.style.setProperty("--header-h", Math.round(header.getBoundingClientRect().height) + "px");
  }
  if (header && "ResizeObserver" in window) new ResizeObserver(medirHeader).observe(header);

  /* ─────────────── Menú móvil ─────────────── */
  var toggle = $("[data-menu-toggle]");
  var menu = $("[data-menu]");
  var backdrop = $("[data-menu-backdrop]");
  var menuAbierto = false;

  function enfocables() {
    return [toggle].concat($$("a", menu)).filter(function (el) {
      return el.offsetParent !== null || el === toggle;
    });
  }

  function abrirMenu() {
    menuAbierto = true;
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Cerrar menú");
    menu.classList.add("is-open");
    backdrop.classList.add("is-open");
    var primero = $("a", menu);
    if (primero) setTimeout(function () { primero.focus(); }, 60);
  }

  function cerrarMenu(devolverFoco) {
    if (!menuAbierto) return;
    menuAbierto = false;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    menu.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    if (devolverFoco) toggle.focus();
  }

  if (toggle && menu && backdrop) {
    toggle.addEventListener("click", function () { menuAbierto ? cerrarMenu(false) : abrirMenu(); });
    backdrop.addEventListener("click", function () { cerrarMenu(false); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { cerrarMenu(false); }); });

    document.addEventListener("keydown", function (e) {
      if (!menuAbierto) return;
      if (e.key === "Escape") {
        e.preventDefault();
        cerrarMenu(true);
        return;
      }
      if (e.key === "Tab") {
        var f = enfocables();
        var primero = f[0], ultimo = f[f.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
        else if (f.indexOf(document.activeElement) === -1) { e.preventDefault(); primero.focus(); }
      }
    });

    var mqEscritorio = window.matchMedia("(min-width: 960px)");
    var alCambiar = function () { if (mqEscritorio.matches) cerrarMenu(false); };
    mqEscritorio.addEventListener ? mqEscritorio.addEventListener("change", alCambiar) : mqEscritorio.addListener(alCambiar);
  }

  /* ─────────────── Enlace activo según la sección visible ─────────────── */
  function iniciarNavActiva() {
    if (!("IntersectionObserver" in window)) return;
    var links = $$("[data-nav]");
    var ids = [];
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (ids.indexOf(id) === -1) ids.push(id);
    });
    var secciones = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var visibles = {};

    function marcar() {
      var activa = null;
      for (var i = 0; i < secciones.length; i++) {
        if (visibles[secciones[i].id]) { activa = secciones[i].id; break; }
      }
      links.forEach(function (a) {
        var on = a.getAttribute("href") === "#" + activa;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visibles[en.target.id] = en.isIntersecting; });
      marcar();
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    secciones.forEach(function (s) { io.observe(s); });
  }

  /* ─────────────── Entradas al hacer scroll (con escalonado) ─────────────── */
  function iniciarReveal() {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) return;
    // Lo que ya se ve al cargar queda tal cual; solo se animan los elementos de más abajo
    var limite = window.innerHeight;
    var els = $$(".reveal").filter(function (el) { return el.getBoundingClientRect().top > limite; });
    els.forEach(function (el) { el.classList.add("is-pending"); });
    var io = new IntersectionObserver(function (entries) {
      var lote = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.parentElement && el.parentElement.closest("[data-stagger]")) {
          el.style.setProperty("--reveal-delay", Math.min(lote, 6) * 80 + "ms");
          lote++;
        }
        el.classList.add("is-visible");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ─────────────── Parallax leve en el hero + sombra del encabezado ─────────────── */
  var parallaxEls = $$("[data-parallax]");
  var hero = $(".hero");
  var progreso = $("[data-scroll-progress]");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("is-scrolled", y > 8);
      if (progreso) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progreso.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ")";
      }
      if (!reduceMotion.matches && hero && y < hero.offsetHeight) {
        parallaxEls.forEach(function (el) {
          var f = parseFloat(el.getAttribute("data-parallax")) || 0;
          el.style.translate = "0 " + (y * f).toFixed(1) + "px";
        });
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ─────────────── Preguntas frecuentes: <details> animado ─────────────── */
  function iniciarFaq() {
    $$(".faq__item").forEach(function (det) {
      var summary = $("summary", det);
      var cont = $(".faq__a", det);
      var anim = null;

      summary.addEventListener("click", function (e) {
        if (reduceMotion.matches || !det.animate) return;
        e.preventDefault();
        var bordes = det.offsetHeight - det.clientHeight;
        var inicio = det.offsetHeight + "px";
        if (anim) anim.cancel();

        if (!det.open) {
          det.style.height = inicio;
          det.open = true;
          var finAbrir = summary.offsetHeight + cont.offsetHeight + bordes + "px";
          anim = det.animate({ height: [inicio, finAbrir] }, { duration: 320, easing: "cubic-bezier(.2,.7,.2,1)" });
          anim.onfinish = function () { anim = null; det.style.height = ""; };
        } else {
          var finCerrar = summary.offsetHeight + bordes + "px";
          anim = det.animate({ height: [inicio, finCerrar] }, { duration: 260, easing: "ease-in-out" });
          anim.onfinish = function () { anim = null; det.open = false; det.style.height = ""; };
        }
        anim.oncancel = function () { det.style.height = ""; };
      });
    });
  }

  /* ─────────────── Mapa de Google al hacer clic ─────────────── */
  function iniciarMapa() {
    var cont = $("[data-map]");
    var btn = $("[data-map-load]");
    if (!cont || !btn) return;
    btn.addEventListener("click", function () {
      var dir = (cfg.ubicacion || {}).direccionMapa || "Calzada Colón 690, Plaza Reyna, 27220 Torreón, Coahuila";
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.google.com/maps?q=" + encodeURIComponent(dir) + "&output=embed";
      iframe.title = "Mapa: Óptica Luz, Calzada Colón #690, Plaza Reyna, Torreón";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.allowFullscreen = true;
      cont.appendChild(iframe);
      cont.classList.add("is-loaded");
      iframe.focus();
    });
  }

  /* ─────────────── Formulario → WhatsApp ─────────────── */
  function iniciarFormulario() {
    var form = $("[data-booking]");
    if (!form || !contacto.whatsapp) return;
    var nombre = form.elements.nombre;
    var dia = form.elements.dia;
    var hora = form.elements.horario;
    var estado = $("[data-booking-status]", form);
    var fmtDia = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
    var paso = +horario.intervaloCitas || 30;

    function hoyIso() { return ahoraNegocio().iso; }
    var h = ahoraNegocio();
    dia.min = h.iso;
    dia.max = infoFecha(h.y, h.m, h.d + 90).iso;

    function error(campo, msg) {
      var p = document.getElementById(campo.id + "-error");
      if (p) p.textContent = msg || "";
      if (msg) campo.setAttribute("aria-invalid", "true"); else campo.removeAttribute("aria-invalid");
      return !msg;
    }

    function infoDeInput() {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia.value);
      return m ? infoFecha(+m[1], +m[2], +m[3]) : null;
    }

    // Opciones de horario según el día elegido y el horario del negocio
    function llenarHorarios() {
      var previo = hora.value;
      hora.innerHTML = "";
      var info = infoDeInput();
      var opciones = [];
      var msg = "";
      if (info && info.iso >= hoyIso()) {
        var b = bloqueDelDia(info);
        if (!b) {
          msg = "Ese día no abrimos. Elige otro, por favor.";
        } else {
          var ahora = ahoraNegocio();
          for (var t = b.abre; t < b.cierra; t += paso) {
            if (info.iso === ahora.iso && t <= ahora.min) continue;
            opciones.push(t);
          }
          if (!opciones.length) msg = "Por hoy ya no hay horarios disponibles. Elige otro día.";
        }
      }
      var ph = document.createElement("option");
      ph.value = "";
      ph.textContent = opciones.length ? "Elige un horario" : "Elige primero un día";
      hora.appendChild(ph);
      opciones.forEach(function (t) {
        var o = document.createElement("option");
        o.value = hora12(t);
        o.textContent = hora12(t);
        hora.appendChild(o);
      });
      hora.disabled = !opciones.length;
      if (previo && opciones.some(function (t) { return hora12(t) === previo; })) hora.value = previo;
      return msg;
    }

    function validarDia() {
      // Siempre se recalculan las opciones, para no dejar horarios de un día anterior
      var msg = llenarHorarios();
      if (!dia.value) return error(dia, "Elige el día que prefieres.");
      var info = infoDeInput();
      if (!info) return error(dia, "Escribe una fecha válida.");
      if (info.iso < hoyIso()) return error(dia, "Elige hoy o un día posterior.");
      return error(dia, msg);
    }
    function validarNombre() {
      var v = nombre.value.trim();
      return error(nombre, v.length < 2 ? "Escribe tu nombre." : "");
    }
    function validarHora() {
      if (hora.disabled) return error(hora, "");
      return error(hora, hora.value ? "" : "Elige el horario que prefieres.");
    }

    dia.addEventListener("change", function () { validarDia(); error(hora, ""); });
    nombre.addEventListener("blur", function () { if (nombre.value) validarNombre(); });
    nombre.addEventListener("input", function () { if (nombre.getAttribute("aria-invalid")) validarNombre(); });
    hora.addEventListener("change", validarHora);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var okN = validarNombre();
      var okD = validarDia();
      var okH = okD ? (hora.disabled ? false : validarHora()) : true;
      if (!okN || !okD || !okH) {
        var primero = !okN ? nombre : !okD ? dia : hora;
        primero.focus();
        estado.textContent = "Revisa los campos marcados.";
        return;
      }

      var info = infoDeInput();
      var motivoClave = (form.elements.motivo && form.elements.motivo.value) || "examen";
      var motivos = wa.motivos || {};
      var plantilla = wa.plantillaFormulario || "Hola, soy {nombre}. {motivo}\nDía preferido: {dia}\nHorario preferido: {horario}";
      var texto = plantilla
        .replace("{nombre}", nombre.value.trim())
        .replace("{motivo}", motivos[motivoClave] || "")
        .replace("{dia}", fmtDia.format(new Date(Date.UTC(info.y, info.m - 1, info.d))))
        .replace("{horario}", hora.value);

      var url = waUrl(texto);
      track("whatsapp-formulario", { motivo: motivoClave });
      estado.textContent = "Abriendo WhatsApp con tu mensaje…";
      var w = window.open(url, "_blank");
      if (w) { try { w.opener = null; } catch (err) { /* noop */ } }
      else window.location.href = url;
    });
  }

  /* ─────────────── Botón flotante: globo + pulso (una vez) ─────────────── */
  function iniciarFlotante() {
    var flot = $("[data-wa-float]");
    if (!flot) return;
    var seg = wa.segundosTooltip != null ? +wa.segundosTooltip : 4;
    var usado = false;
    flot.addEventListener("click", function () { usado = true; flot.classList.remove("show-tip"); });
    setTimeout(function () {
      if (usado || menuAbierto) return;
      flot.classList.add("show-tip");
      if (!reduceMotion.matches) flot.classList.add("is-pulsing");
      setTimeout(function () { flot.classList.remove("show-tip"); }, 6000);
    }, seg * 1000);
  }

  /* ─────────────── "25%" que cuenta hacia arriba al aparecer ─────────────── */
  function iniciarConteo() {
    var num = $(".promo__number");
    if (!num || reduceMotion.matches || !("IntersectionObserver" in window)) return;
    var nodo = num.firstChild; // nodo de texto "25"
    if (!nodo || nodo.nodeType !== 3) return;
    var meta = parseInt(nodo.nodeValue, 10);
    if (!meta) return;
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      var t0 = performance.now(), dur = 1100;
      (function paso(t) {
        var k = Math.min(1, (t - t0) / dur);
        nodo.nodeValue = String(Math.round(meta * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(paso);
      })(t0);
    }, { threshold: 0.4 });
    // Solo si aún no está en pantalla: lo visible al cargar no se altera
    if (num.getBoundingClientRect().top > window.innerHeight) io.observe(num);
  }

  /* ─────────────── Inclinación 3D sutil en tarjetas (solo mouse) ─────────────── */
  function iniciarInclinacion() {
    if (reduceMotion.matches || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(".card, .service, .step").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-3px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  /* ─────────────── Arranque ─────────────── */
  aplicarConfig();
  revisarPromo();
  pintarEstado();
  medirHeader();
  iniciarNavActiva();
  iniciarReveal();
  iniciarFaq();
  iniciarMapa();
  iniciarFormulario();
  iniciarFlotante();
  iniciarConteo();
  iniciarInclinacion();
  onScroll();

  // Actualiza "Abierto / Cerrado" y la vigencia de la promo cada minuto
  setInterval(function () { pintarEstado(); revisarPromo(); }, 60 * 1000);
})();
