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

  /* ---------- Modo revisión: muestra los datos pendientes ---------- */
  if (CFG.mostrarPendientes) document.documentElement.classList.add('show-pending');

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

    if (!isTodo(contacto.whatsapp)) setText('[data-cfg="whatsapp-label"]', ' · ' + contacto.whatsapp);

    var tel = String(contacto.telefono || '').replace(/[^\d+]/g, '');
    if (tel) {
      $$('[data-tel]').forEach(function (el) {
        var a = toLink(el, 'tel:' + tel, false);
        a.hidden = false;
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
        a.classList.remove('pending-block');
        $$('.chip', a).forEach(function (c) { c.remove(); });
      }
    });

    if (!isTodo(contacto.direccion)) {
      setText('[data-cfg="direccion"]', contacto.direccion);
      setText('[data-cfg="direccion-faq"]', contacto.direccion + '.');
      $$('[data-cfg="direccion"], [data-cfg="direccion-faq"]').forEach(function (el) {
        var chip = el.parentNode.querySelector('.chip');
        if (chip) chip.remove();
      });
    }
    if (!isTodo(contacto.referencia)) {
      setText('[data-cfg="referencia"]', contacto.referencia);
      var refChip = $('#fila-referencia .chip');
      if (refChip) refChip.remove();
    } else if (contacto.referencia === '') {
      $('#fila-referencia').hidden = true;
    }

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
    if (allTodo) return; // Se queda "Consulta nuestro horario por WhatsApp".

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
    var header = $('#site-header');
    var links = $$('.nav__link, .nav__cta', nav);
    var mq = window.matchMedia('(min-width: 960px)');

    function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }
    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      label.textContent = 'Cerrar';
      nav.classList.add('is-open');
      header.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.classList.add('has-menu');
      document.addEventListener('keydown', onKey);
      document.addEventListener('click', onOutside);
      setTimeout(function () { links[0].focus(); }, 50);
    }
    function close(returnFocus) {
      toggle.setAttribute('aria-expanded', 'false');
      label.textContent = 'Menú';
      nav.classList.remove('is-open');
      header.classList.remove('is-open');
      document.documentElement.style.overflow = '';
      document.documentElement.classList.remove('has-menu');
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

  /* ---------- Galería: filtros por categoría ---------- */
  function initGallery() {
    var grid = $('#galeria-grid');
    if (!grid) return;
    var buttons = $$('[data-filter]');
    var items = $$('.gallery__item', grid);
    var status = $('#galeria-estado');

    function apply(cat) {
      items.forEach(function (li) {
        var show = cat === 'todos' || li.getAttribute('data-cat') === cat;
        li.classList.toggle('is-hidden', !show);
        if (show) li.classList.add('is-visible');
      });
      var n = items.filter(function (li) { return !li.classList.contains('is-hidden'); }).length;
      status.textContent = n + (n === 1 ? ' foto' : ' fotos');
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-pressed') === 'true') return;
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var cat = btn.getAttribute('data-filter');
        // Transición suave entre filtros (View Transitions API si existe)
        if (document.startViewTransition && !reduceMotion) {
          items.forEach(function (li, i) { li.style.viewTransitionName = 'g' + i; });
          var vt = document.startViewTransition(function () { apply(cat); });
          vt.finished.then(function () { items.forEach(function (li) { li.style.viewTransitionName = ''; }); });
        } else {
          apply(cat);
        }
      });
    });
  }

  /* ---------- Visor de fotos (galería y local) ---------- */
  function initLightbox() {
    var dlg = $('#lightbox');
    if (!dlg || typeof dlg.showModal !== 'function') return;
    var img = $('#lb-img');
    var avif = $('#lb-avif');
    var pic = $('.lightbox__pic', dlg);
    var cap = $('#lb-cap');
    var count = $('#lb-count');
    var list = [];
    var index = 0;
    var opener = null;

    function group(trigger) {
      var scope = trigger.closest('#galeria-grid') || trigger.closest('.venue');
      return $$('[data-lightbox]', scope).filter(function (b) {
        var li = b.closest('.gallery__item');
        return !li || !li.classList.contains('is-hidden');
      });
    }
    function show(i) {
      index = (i + list.length) % list.length;
      var b = list[index];
      var full = b.getAttribute('data-full');
      var thumb = $('img', b);
      avif.srcset = '/img/' + full + '.avif';
      img.src = '/img/' + full + '.webp';
      img.width = thumb.naturalWidth || thumb.width;
      img.height = thumb.naturalHeight || thumb.height;
      img.alt = thumb.alt;
      cap.textContent = b.getAttribute('data-caption') || thumb.alt;
      count.textContent = (index + 1) + ' / ' + list.length;
      pic.classList.remove('is-switching');
      void pic.offsetWidth;
      pic.classList.add('is-switching');
    }
    function open(trigger) {
      opener = trigger;
      list = group(trigger);
      dlg.classList.toggle('lightbox--single', list.length < 2);
      show(list.indexOf(trigger));
      dlg.showModal();
      document.documentElement.classList.add('has-lightbox');
    }

    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-lightbox]');
      if (t) open(t);
    });
    dlg.addEventListener('click', function (e) {
      var action = e.target.closest('[data-lb]');
      if (action) {
        var a = action.getAttribute('data-lb');
        if (a === 'close') dlg.close();
        else show(index + (a === 'next' ? 1 : -1));
      } else if (e.target === dlg || e.target.classList.contains('lightbox__frame')) {
        dlg.close();
      }
    });
    dlg.addEventListener('keydown', function (e) {
      if (list.length < 2) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    });
    dlg.addEventListener('close', function () {
      document.documentElement.classList.remove('has-lightbox');
      if (opener) opener.focus();
    });
    // Deslizar en pantallas táctiles
    var x0 = null;
    dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (x0 === null || list.length < 2) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
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
  [applyContact, applyPromo, applyHours, initHeader, initMenu, initActiveLink,
    initReveal, initParallax, initFaq, initMap, initGallery, initLightbox, initWaFloat, initTracking].forEach(safe);
  var anio = $('#anio');
  if (anio) anio.textContent = nowInTZ().iso.slice(0, 4);
})();
