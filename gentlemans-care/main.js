/* ==========================================================
   Gentleman's Care — interacciones
   Sin dependencias. Los datos editables viven en config.js.
   ========================================================== */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var contacto = CFG.contacto || {};
  var TZ = CFG.zonaHoraria || 'America/Monterrey';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var isTodo = function (v) { return v == null || v === '' || /^TODO/i.test(String(v)); };

  /* ---------- Fecha y hora en la zona horaria del negocio ---------- */
  function nowInTZ() {
    var parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday); // 0 = lunes
    return {
      iso: parts.year + '-' + parts.month + '-' + parts.day,
      dow: dow,
      minutes: (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10),
    };
  }

  /* ---------- Enlaces de WhatsApp, teléfono, correo y redes ---------- */
  var waNumber = (function () {
    var raw = String(contacto.whatsapp || '').replace(/\D/g, '');
    return raw.length === 10 ? '52' + raw : raw;
  })();

  function waLink(message) {
    return 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message || '');
  }

  function applyContact() {
    var mensajes = CFG.mensajes || {};
    $$('[data-wa]').forEach(function (a) {
      a.href = waLink(mensajes[a.getAttribute('data-wa')] || mensajes.cita);
    });

    if (!isTodo(contacto.whatsapp)) setText('[data-cfg="whatsapp-label"]', contacto.whatsapp);

    var tel = String(contacto.telefono || '').replace(/[^\d+]/g, '');
    if (tel) {
      $$('[data-tel]').forEach(function (el) {
        var a = toLink(el, 'tel:' + tel, false);
        setText('[data-cfg="telefono-label"]', contacto.telefono, a);
      });
    }

    if (!isTodo(contacto.email)) {
      $$('[data-mail]').forEach(function (a) {
        a.href = 'mailto:' + contacto.email;
        setText('[data-cfg="email-label"]', contacto.email, a);
        a.hidden = false;
      });
    }

    $$('[data-social]').forEach(function (el) {
      var url = contacto[el.getAttribute('data-social')];
      if (!isTodo(url)) {
        var a = toLink(el, url, true);
        var pending = $('[data-pending]', a);
        if (pending) pending.remove();
      }
    });

    if (!isTodo(contacto.direccion)) {
      setText('[data-cfg="direccion"]', contacto.direccion);
      setText('[data-cfg="direccion-faq"]', contacto.direccion);
      var faqChip = $('[data-cfg="direccion-faq"]');
      if (faqChip) faqChip.classList.remove('chip');
    }
    if (!isTodo(contacto.referencia)) setText('[data-cfg="referencia"]', contacto.referencia);

    var q = encodeURIComponent(contacto.mapsQuery || 'Torreón, Coahuila');
    $$('[data-maps-link]').forEach(function (a) {
      a.href = 'https://www.google.com/maps/search/?api=1&query=' + q;
    });
  }

  // Convierte un <span> marcador en un enlace real cuando el dato ya existe en config.js.
  function toLink(el, href, external) {
    var a = document.createElement('a');
    Array.prototype.forEach.call(el.attributes, function (attr) { a.setAttribute(attr.name, attr.value); });
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener'; }
    while (el.firstChild) a.appendChild(el.firstChild);
    el.replaceWith(a);
    return a;
  }

  function setText(sel, text, ctx) {
    var el = $(sel, ctx);
    if (el) el.textContent = text;
  }

  /* ---------- Producto VOLPE (mostrar / ocultar) ---------- */
  function applyVolpe() {
    if (CFG.mostrarVolpe === false) {
      $$('#productos, [data-volpe]').forEach(function (el) { el.hidden = true; });
    }
  }

  /* ---------- Promoción con fecha de fin ---------- */
  function applyPromo() {
    var promo = CFG.promo || {};
    var activa = !!promo.mostrar;
    if (activa && promo.fechaFin && /^\d{4}-\d{2}-\d{2}$/.test(promo.fechaFin)) {
      activa = nowInTZ().iso <= promo.fechaFin;
    }
    if (!activa) return;
    ['titulo', 'descripcion', 'vigenciaTexto'].forEach(function (key) {
      if (promo[key]) $$('[data-promo="' + key + '"]').forEach(function (el) { el.textContent = promo[key]; });
    });
    $('#promo-bar').hidden = false;
    $('#promocion').hidden = false;
  }

  /* ---------- Horario + indicador "Abierto ahora / Cerrado" ---------- */
  var DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  var NOMBRES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  function toMin(hhmm) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim());
    return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
  }
  // Normaliza un día a: 'TODO' | [] (cerrado) | [{abre, cierra}] (minutos)
  function normDay(v) {
    if (isTodo(v) && v !== null) return 'TODO';
    if (v === null || v === false) return [];
    var list = Array.isArray(v) ? v : [v];
    var out = [];
    list.forEach(function (r) {
      var a = toMin(r && r.abre), c = toMin(r && r.cierra);
      if (a != null && c != null) out.push({ abre: a, cierra: c <= a ? c + 1440 : c });
    });
    return out;
  }
  function fmt(min) {
    min = min % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function dayLabel(d) {
    if (d === 'TODO') return '[PENDIENTE]';
    if (!d.length) return 'Cerrado';
    return d.map(function (r) { return fmt(r.abre) + ' – ' + fmt(r.cierra); }).join(', ');
  }

  function applyHours() {
    var horario = CFG.horario || {};
    var days = DIAS.map(function (k) { return normDay(horario[k]); });
    var allTodo = days.every(function (d) { return d === 'TODO'; });
    if (allTodo) return; // Se queda el marcador del diseño.

    var now = nowInTZ();
    var groups = [];
    days.forEach(function (d, i) {
      var label = dayLabel(d);
      var last = groups[groups.length - 1];
      if (last && last.label === label) last.to = i;
      else groups.push({ from: i, to: i, label: label });
    });
    var name = function (g) {
      if (g.from === g.to) return NOMBRES[g.from];
      return NOMBRES[g.from] + (g.to - g.from === 1 ? ' y ' : ' a ') + NOMBRES[g.to].toLowerCase();
    };

    var list = $('#horario');
    var foot = $('#horario-footer');
    list.innerHTML = '';
    foot.innerHTML = '';
    groups.forEach(function (g) {
      var li = document.createElement('li');
      if (now.dow >= g.from && now.dow <= g.to) li.className = 'is-today';
      var a = document.createElement('span'); a.textContent = name(g);
      var b = document.createElement('span'); b.className = 'mono gold'; b.textContent = g.label;
      li.appendChild(a); li.appendChild(b);
      list.appendChild(li);
      foot.appendChild(li.cloneNode(true));
    });

    if (days.some(function (d) { return d === 'TODO'; })) return; // Sin datos completos, no hay indicador.

    var status = $('#estado-abierto');
    var text = $('.status__text', status);
    var today = days[now.dow];
    var yesterday = days[(now.dow + 6) % 7];
    var openRange = null;
    today.forEach(function (r) { if (now.minutes >= r.abre && now.minutes < r.cierra) openRange = r; });
    yesterday.forEach(function (r) { if (r.cierra > 1440 && now.minutes < r.cierra - 1440) openRange = { cierra: r.cierra - 1440 }; });

    if (openRange) {
      status.classList.add('is-open');
      text.textContent = 'Abierto ahora · cierra a las ' + fmt(openRange.cierra);
    } else {
      status.classList.add('is-closed');
      var next = null;
      for (var i = 0; i < 7 && !next; i++) {
        var idx = (now.dow + i) % 7;
        for (var j = 0; j < days[idx].length; j++) {
          if (i > 0 || days[idx][j].abre > now.minutes) { next = { i: i, idx: idx, r: days[idx][j] }; break; }
        }
      }
      text.textContent = 'Cerrado' + (next
        ? ' · abre ' + (next.i === 0 ? 'hoy' : next.i === 1 ? 'mañana' : 'el ' + NOMBRES[next.idx].toLowerCase()) + ' a las ' + fmt(next.r.abre)
        : '');
    }
    status.hidden = false;
  }

  /* ---------- Header: sombra al hacer scroll ---------- */
  function initHeader() {
    var header = $('#site-header');
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Menú móvil: animado, Escape y focus trap ---------- */
  function initMenu() {
    var toggle = $('.menu-toggle');
    var nav = $('#menu-principal');
    var label = $('.menu-toggle__label', toggle);
    var links = $$('.nav__link', nav);
    var mq = window.matchMedia('(min-width: 960px)');

    function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }
    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      label.textContent = 'Cerrar';
      nav.classList.add('is-open');
      document.addEventListener('keydown', onKey);
      document.addEventListener('click', onOutside);
      setTimeout(function () { links[0].focus(); }, 50);
    }
    function close(returnFocus) {
      toggle.setAttribute('aria-expanded', 'false');
      label.textContent = 'Menú';
      nav.classList.remove('is-open');
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onOutside);
      if (returnFocus) toggle.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key !== 'Tab') return;
      var ring = [toggle].concat(links);
      var i = ring.indexOf(document.activeElement);
      e.preventDefault();
      var next = i === -1 ? 0 : (i + (e.shiftKey ? -1 : 1) + ring.length) % ring.length;
      ring[next].focus();
    }
    function onOutside(e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) close(false);
    }

    toggle.addEventListener('click', function () { isOpen() ? close(false) : open(); });
    links.forEach(function (a) { a.addEventListener('click', function () { if (isOpen()) close(false); }); });
    var onMq = function () { if (mq.matches && isOpen()) close(false); };
    mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);
  }

  /* ---------- Enlace activo según la sección visible ---------- */
  function initActiveLink() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('.nav__link');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var link = map[entry.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { io.observe(s); });
  }

  /* ---------- Entradas al hacer scroll (con escalonado) ---------- */
  function initReveal() {
    var items = $$('.reveal');
    $$('[data-stagger]').forEach(function (group) {
      $$('.reveal', group).forEach(function (el, i) { el.style.setProperty('--delay', (i * 0.09).toFixed(2) + 's'); });
    });
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Parallax leve en el hero ---------- */
  function initParallax() {
    if (reduceMotion) return;
    var els = $$('[data-parallax]');
    var hero = $('.hero');
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY;
      if (y > hero.offsetHeight + 200) return;
      els.forEach(function (el) {
        el.style.transform = 'translate3d(0,' + (y * parseFloat(el.getAttribute('data-parallax'))).toFixed(1) + 'px,0)';
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ---------- Preguntas frecuentes: <details> animado ---------- */
  function initFaq() {
    $$('.faq__item').forEach(function (details) {
      var summary = $('summary', details);
      var panel = $('.faq__a', details);
      var anim = null;
      summary.addEventListener('click', function (e) {
        if (reduceMotion || !panel.animate) return;
        e.preventDefault();
        if (anim) anim.cancel();
        if (!details.open) {
          details.open = true;
          var h = panel.offsetHeight;
          anim = panel.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
        } else {
          var h2 = panel.offsetHeight;
          anim = panel.animate([{ height: h2 + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' });
          anim.onfinish = function () { details.open = false; };
        }
        anim.addEventListener('finish', function () { anim = null; });
      });
    });
  }

  /* ---------- Mapa: se carga al hacer clic ---------- */
  function initMap() {
    var btn = $('[data-map-load]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var wrap = $('#mapa');
      var iframe = document.createElement('iframe');
      iframe.title = "Mapa de ubicación de Gentleman's Care en Torreón";
      iframe.src = 'https://www.google.com/maps?q=' + encodeURIComponent(contacto.mapsQuery || 'Torreón, Coahuila') + '&output=embed';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.setAttribute('allowfullscreen', '');
      wrap.innerHTML = '';
      wrap.appendChild(iframe);
      iframe.focus();
    });
  }

  /* ---------- Mini formulario → WhatsApp (no guarda datos) ---------- */
  function initForm() {
    var form = $('#form-cita');
    if (!form) return;
    var nombre = $('#f-nombre');
    var dia = $('#f-dia');
    var horario = $('#f-horario');
    var hoy = nowInTZ().iso;
    dia.min = hoy;

    function setError(input, msg) {
      var out = $('#' + input.getAttribute('aria-describedby'));
      out.textContent = msg || '';
      if (msg) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
      return !msg;
    }
    function validate() {
      var ok = true;
      var n = nombre.value.trim();
      ok = setError(nombre, n.length < 2 ? 'Escribe tu nombre (mínimo 2 letras).' : '') && ok;
      ok = setError(dia, !dia.value ? 'Elige el día que prefieres.' : dia.value < hoy ? 'Elige una fecha de hoy en adelante.' : '') && ok;
      ok = setError(horario, !horario.value ? 'Elige un horario.' : '') && ok;
      return ok;
    }
    [nombre, dia, horario].forEach(function (el) {
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () {
        if (el.getAttribute('aria-invalid')) validate();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        var first = $('[aria-invalid="true"]', form);
        if (first) first.focus();
        return;
      }
      var fecha = new Date(dia.value + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
      var msg = 'Hola, soy ' + nombre.value.trim() + ". Quiero agendar una cita en Gentleman's Care para el " + fecha +
        ', de preferencia ' + horario.value + '. ¿Qué horarios tienen disponibles?';
      var url = waLink(msg);
      var a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      form.reset();
    });
  }

  /* ---------- Botón flotante: tooltip a los pocos segundos y pulso único ---------- */
  function initWaFloat() {
    var wrap = $('.wa-float');
    if (!wrap) return;
    setTimeout(function () {
      wrap.classList.add('show-tip');
      if (!reduceMotion) wrap.classList.add('is-pulsing');
      setTimeout(function () { wrap.classList.remove('show-tip'); }, 6000);
    }, 4000);
  }

  /* ---------- Medición de clics (GA4 / Meta Pixel / GTM) ---------- */
  function initTracking() {
    window.dataLayer = window.dataLayer || [];
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-track]');
      if (!el) return;
      var name = el.getAttribute('data-track');
      var href = el.getAttribute('href') || '';
      var payload = { event: 'cta_click', cta_name: name, link_url: href };
      window.dataLayer.push(payload);
      if (typeof window.gtag === 'function') window.gtag('event', 'cta_click', { cta_name: name, link_url: href });
      if (typeof window.fbq === 'function') {
        if (/wa\.me|tel:|mailto:/.test(href)) window.fbq('track', 'Contact', { content_name: name });
        else window.fbq('trackCustom', 'CTAClick', { content_name: name });
      }
    });
  }

  /* ---------- Inicio ---------- */
  function safe(fn) { try { fn(); } catch (err) { if (window.console) console.error(err); } }
  [applyContact, applyVolpe, applyPromo, applyHours, initHeader, initMenu, initActiveLink,
    initReveal, initParallax, initFaq, initMap, initForm, initWaFloat, initTracking].forEach(safe);
  var anio = $('#anio');
  if (anio) anio.textContent = nowInTZ().iso.slice(0, 4);
})();
