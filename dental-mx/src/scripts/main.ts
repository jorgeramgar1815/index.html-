/**
 * Interacciones globales: header sólido al hacer scroll, barra de progreso,
 * back-to-top, menú móvil, scroll reveal, parallax del hero, contadores
 * y comparador antes/después. Todo respeta `prefers-reduced-motion`.
 */
(window as Window & { __dmxReady?: boolean }).__dmxReady = true;
document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Scroll: header, progreso, back-to-top, parallax ─────────────────────────
const header = document.getElementById('site-header');
const progress = document.getElementById('scroll-progress');
const toTop = document.getElementById('back-to-top');
const parallax = document.querySelectorAll<HTMLElement>('[data-parallax]');

let ticking = false;
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header?.setAttribute('data-solid', String(y > 24));
  if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
  toTop?.setAttribute('data-show', String(y > window.innerHeight * 0.9));
  if (!reduceMotion) {
    parallax.forEach((el) => {
      const speed = Number(el.dataset.parallax) || 0.2;
      if (y < window.innerHeight * 1.5) el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });
  }
  ticking = false;
}
window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  },
  { passive: true },
);
onScroll();

toTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  document.querySelector<HTMLElement>('#site-header a')?.focus({ preventScroll: true });
});

// ── Menú móvil ──────────────────────────────────────────────────────────────
const toggle = document.getElementById('menu-toggle');
const menu = document.getElementById('mobile-menu');

function setMenu(open: boolean) {
  if (!toggle || !menu) return;
  menu.dataset.open = String(open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  toggle.querySelector('.menu-open-icon')?.classList.toggle('hidden', open);
  toggle.querySelector('.menu-close-icon')?.classList.toggle('hidden', !open);
  document.body.style.overflow = open ? 'hidden' : '';
  document.getElementById('fab')?.toggleAttribute('hidden', open);
  header?.setAttribute('data-solid', open ? 'true' : String(window.scrollY > 24));
  // Espera a que el panel sea visible para poder enfocarlo.
  if (open) setTimeout(() => menu.querySelector<HTMLElement>('a')?.focus(), 60);
}
toggle?.addEventListener('click', () => setMenu(menu?.dataset.open !== 'true'));
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu?.dataset.open === 'true') {
    setMenu(false);
    toggle?.focus();
  }
});
window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => e.matches && setMenu(false));

// ── Scrollspy: resalta en el menú la sección visible ────────────────────────
const spyLinks = document.querySelectorAll<HTMLElement>('[data-spy]');
const spySections = [...new Set(Array.from(spyLinks, (l) => l.dataset.spy!))]
  .map((id) => document.getElementById(id))
  .filter((el): el is HTMLElement => el !== null);
if (spySections.length && 'IntersectionObserver' in window) {
  const setActive = (id: string | null) =>
    spyLinks.forEach((l) => (l.dataset.spy === id ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
  const visible = new Set<string>();
  const so = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
      // La última sección (en orden del documento) que cruza la franja central gana.
      const current = spySections.filter((s) => visible.has(s.id)).pop();
      setActive(current?.id ?? null);
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  spySections.forEach((s) => so.observe(s));
}

// ── Titulares palabra por palabra ───────────────────────────────────────────
// Envuelve cada palabra en <span class="sw"><span>…</span></span> conservando
// los elementos internos (p. ej. <span class="text-neon">).
if (!reduceMotion) {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    let w = 0;
    const walk = (node: Node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = (child.textContent ?? '').split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
            const outer = document.createElement('span');
            outer.className = 'sw';
            const inner = document.createElement('span');
            inner.style.setProperty('--w', String(w++));
            inner.textContent = part;
            outer.append(inner);
            frag.append(outer);
          });
          child.replaceWith(frag);
        } else if (
          child.nodeType === Node.ELEMENT_NODE &&
          (child as Element).tagName !== 'BR' &&
          !(child as Element).hasAttribute('data-nosplit')
        ) {
          walk(child);
        }
      });
    };
    el.setAttribute('aria-label', el.innerText.replace(/\s+/g, ' ').trim());
    walk(el);
    el.querySelectorAll('.sw').forEach((s) => s.setAttribute('aria-hidden', 'true'));
    el.classList.add('is-split');
  });
}

// ── Scroll reveal ───────────────────────────────────────────────────────────
const revealables = document.querySelectorAll<HTMLElement>('[data-reveal], [data-split], [data-draw]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  revealables.forEach((el) => io.observe(el));
} else {
  revealables.forEach((el) => el.classList.add('is-visible'));
}

// ── Animaciones continuas sólo mientras están en pantalla ──────────────────
const lives = document.querySelectorAll<HTMLElement>('[data-live]');
if ('IntersectionObserver' in window) {
  const lo = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)));
  lives.forEach((el) => lo.observe(el));
} else {
  lives.forEach((el) => el.classList.add('is-live'));
}

// ── Contadores animados ─────────────────────────────────────────────────────
const counters = document.querySelectorAll<HTMLElement>('[data-count]');
const fmt = new Intl.NumberFormat('es-MX');
if (!reduceMotion && 'IntersectionObserver' in window) {
  const co = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const target = Number(el.dataset.count);
        const start = performance.now();
        const duration = 1600;
        const step = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = fmt.format(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => co.observe(el));
}

// ── Antes / Después: pestañas + comparador ──────────────────────────────────
document.querySelectorAll<HTMLElement>('.before-after').forEach((root) => {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const select = (tab: HTMLButtonElement) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls') || '');
      if (panel) panel.hidden = !on;
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      select(next);
    });
  });

  root.querySelectorAll<HTMLInputElement>('.ba-range').forEach((range) => {
    const frame = range.closest<HTMLElement>('.ba-frame');
    const update = () => frame?.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', update);
    update();
  });
});

// ── Efectos de cursor (sólo punteros finos y sin reducción de movimiento) ──
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (finePointer && !reduceMotion) {
  // Spotlight + inclinación 3D en tarjetas
  document.querySelectorAll<HTMLElement>('.card').forEach((card) => {
    const tilt = card.hasAttribute('data-tilt');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      if (tilt) {
        card.style.setProperty('--rx', `${(0.5 - y) * 7}deg`);
        card.style.setProperty('--ry', `${(x - 0.5) * 7}deg`);
      }
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  // Botones magnéticos
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mag-x', `${(e.clientX - r.left - r.width / 2) * 0.1}px`);
      btn.style.setProperty('--mag-y', `${(e.clientY - r.top - r.height / 2) * 0.25}px`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--mag-x', '0px');
      btn.style.setProperty('--mag-y', '0px');
    });
  });

  // Hero: luz que sigue al cursor
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (hero) {
    let raf = 0;
    hero.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        hero.style.setProperty('--sx', `${x * 100}%`);
        hero.style.setProperty('--sy', `${y * 100}%`);
      });
    });
  }
}
