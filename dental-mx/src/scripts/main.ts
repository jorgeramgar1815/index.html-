/**
 * Interacciones globales: header sólido al hacer scroll, barra de progreso,
 * back-to-top, menú móvil, scroll reveal, parallax del hero, contadores
 * y comparador antes/después. Todo respeta `prefers-reduced-motion`.
 */
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

// ── Scroll reveal ───────────────────────────────────────────────────────────
const revealables = document.querySelectorAll<HTMLElement>('[data-reveal]');
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
