/**
 * Agendify · panel del negocio (Supabase Auth + RLS).
 * - Inicio: saludo con el nombre del negocio, números del día, siguiente cita,
 *   citas por confirmar (botones grandes) y la línea del día.
 * - Agenda por día o semana con filtros; detalle de cita en un diálogo.
 * - Bloqueos de días u horas.
 * - Mi página: enlace de reservas (copiar / abrir / compartir), servicios visibles y horario.
 * - Avisos dentro del panel: cada cita nueva deja un aviso guardado (tabla `avisos`).
 *   Campana con contador y bandeja; llegan en tiempo real con sonido, notificación del
 *   navegador y título de la pestaña, con consulta periódica de respaldo. Los avisos
 *   que llegaron con el panel cerrado aparecen sin leer al entrar.
 */
import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import { aInstante, fechaEnZona, horaEnZona, sumarDias, diaSemana, fechaLarga } from './zona';
import { esc, iniciales } from './api';
import { icono, ICONO_WA } from './iconos';

type Estado = 'pendiente' | 'confirmada' | 'cancelada';
type Cita = {
  id: string; inicio: string; fin: string; nombre: string; telefono: string; nota: string | null;
  estado: Estado; creada_en: string; servicios: { nombre: string } | null;
};
type Bloqueo = { id: string; inicio: string; fin: string; motivo: string | null };
type Servicio = { id: string; nombre: string; duracion_min: number; activo: boolean };
type Horario = { dia_semana: number; abre: string; cierra: string };
type Seccion = 'inicio' | 'agenda' | 'historial' | 'bloqueos' | 'pagina';
type Historial = {
  anio: number; atendidas: number; canceladas: number; sin_confirmar: number; clientes: number;
  por_servicio: { servicio: string; total: number }[]; por_mes: number[]; cerrado_en: string;
};
type Aviso = {
  id: string; cita_id: string | null; tipo: 'cita_nueva' | 'historial_anual'; anio: number | null; creado_en: string; leido_en: string | null;
  citas: { nombre: string; inicio: string; estado: Estado; servicios: { nombre: string } | null } | null;
};
const CAMPOS_AVISO = 'id, cita_id, tipo, anio, creado_en, leido_en, citas(nombre, inicio, estado, servicios(nombre))';

const raiz = document.getElementById('panel');
if (!raiz) throw new Error('Panel sin configurar');
const supabase = createClient(raiz.dataset.url!, raiz.dataset.key!, { auth: { persistSession: true, autoRefreshToken: true } });
const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string) => [...document.querySelectorAll<T>(sel)];
const CAMPOS_CITA = 'id, inicio, fin, nombre, telefono, nota, estado, creada_en, servicios(nombre)';
const CLAVE_SONIDO = 'agendo-sonido'; // nombre anterior; se conserva para no perder la preferencia

const st = {
  negocioId: '',
  negocio: { slug: '', nombre: 'Tu negocio', giro: null as string | null, zona_horaria: 'America/Monterrey' },
  seccion: 'inicio' as Seccion,
  vista: 'dia' as 'dia' | 'semana',
  fecha: '',
  filtro: 'todas' as 'todas' | Estado,
  citas: new Map<string, Cita>(),
  avisos: [] as Aviso[],
  avisosVistos: new Set<string>(),
  ultimaRevision: new Date().toISOString(),
  canal: null as RealtimeChannel | null,
  sonido: false,
  sinLeer: 0,
};
const zona = () => st.negocio.zona_horaria;
const hoy = () => fechaEnZona(new Date(), zona());
const hora = (iso: string) => horaEnZona(new Date(iso), zona());
const fechaDe = (iso: string) => fechaEnZona(new Date(iso), zona());
const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
const recordar = (citas: Cita[]) => citas.forEach((c) => st.citas.set(c.id, c));

// ─── Acceso ───────────────────────────────────────────────────────────────────
function mostrar(vista: 'cargando' | 'login' | 'panel') {
  $('#vista-cargando').hidden = vista !== 'cargando';
  $('#vista-login').hidden = vista !== 'login';
  $('#vista-panel').hidden = vista !== 'panel';
}

function mostrarLogin(mensaje?: string) {
  mostrar('login');
  const err = $('#login-error');
  err.hidden = !mensaje;
  err.textContent = mensaje ?? '';
}

async function arrancar() {
  const { data } = await supabase.auth.getSession();
  if (data.session) await iniciarPanel();
  else mostrarLogin();
}

$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const boton = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
  const password = (form.elements.namedItem('password') as HTMLInputElement).value;
  if (!email || !password) return mostrarLogin('Escribe tu correo y tu contraseña.');
  boton.disabled = true;
  boton.textContent = 'Entrando…';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  boton.disabled = false;
  boton.textContent = 'Entrar';
  if (error) return mostrarLogin(/invalid/i.test(error.message) ? 'Correo o contraseña incorrectos.' : 'No se pudo entrar. Inténtalo de nuevo.');
  await iniciarPanel();
});

$$('[data-p-salir]').forEach((b) =>
  b.addEventListener('click', async () => {
    st.canal?.unsubscribe();
    await supabase.auth.signOut();
    location.replace(location.pathname);
  }),
);

async function iniciarPanel() {
  const { data: admin, error } = await supabase.from('admins').select('negocio_id').limit(1).maybeSingle();
  if (error || !admin) {
    await supabase.auth.signOut();
    return mostrarLogin('Este usuario no tiene un negocio asignado.');
  }
  st.negocioId = admin.negocio_id;
  const { data: negocio } = await supabase.from('negocios').select('slug, nombre, giro, zona_horaria').eq('id', st.negocioId).single();
  if (negocio) st.negocio = negocio;
  st.fecha = hoy();
  pintarNegocio();
  try { st.sonido = localStorage.getItem(CLAVE_SONIDO) === '1'; } catch { /* sin almacenamiento */ }
  pintarSonido();
  mostrar('panel');
  irA(seccionDeHash(), false);
  await cargarAvisos();
  const pendientes = st.avisos.filter((a) => !a.leido_en).length;
  if (pendientes) toast(`Tienes ${plural(pendientes, 'aviso nuevo', 'avisos nuevos')}`, true);
  conectarTiempoReal();
  setInterval(revisarNuevas, 60_000);
  // Al volver a la pestaña: limpia el contador y revisa por si algo llegó.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    st.sinLeer = 0;
    actualizarTitulo();
    revisarNuevas();
  });
}

function pintarNegocio() {
  const n = st.negocio;
  $$('[data-p-nombre]').forEach((x) => (x.textContent = n.nombre));
  $$('[data-p-giro]').forEach((x) => (x.textContent = n.giro || 'Panel de citas'));
  $$('[data-p-iniciales]').forEach((x) => (x.textContent = iniciales(n.nombre)));
  actualizarTitulo();
}

// ─── Navegación ───────────────────────────────────────────────────────────────
const SECCIONES: Seccion[] = ['inicio', 'agenda', 'historial', 'bloqueos', 'pagina'];
const seccionDeHash = (): Seccion => {
  const h = location.hash.slice(1) as Seccion;
  return SECCIONES.includes(h) ? h : 'inicio';
};

function irA(seccion: Seccion, desplazar = true) {
  st.seccion = seccion;
  $$('[data-seccion]').forEach((s) => (s.hidden = s.dataset.seccion !== seccion));
  $$('[data-ir]').forEach((a) => (a.dataset.ir === seccion ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  if (desplazar) window.scrollTo({ top: 0 });
  cargarSeccion();
}
window.addEventListener('hashchange', () => st.negocioId && irA(seccionDeHash()));

function cargarSeccion() {
  if (st.seccion === 'inicio') return cargarInicio();
  if (st.seccion === 'agenda') return cargarAgenda();
  if (st.seccion === 'historial') return cargarHistorial();
  if (st.seccion === 'bloqueos') return cargarBloqueos();
  return cargarPagina();
}

/** Recarga lo que se ve y el contador de pendientes (tras un cambio o una cita nueva). */
async function refrescar() {
  await Promise.all([cargarSeccion(), st.seccion === 'inicio' ? null : contarPendientes()]);
}

function pintarContador(n: number) {
  $$('[data-p-contador]').forEach((x) => {
    x.hidden = n === 0;
    x.textContent = String(n);
  });
}

async function contarPendientes() {
  const { count } = await supabase
    .from('citas')
    .select('id', { count: 'exact', head: true })
    .eq('negocio_id', st.negocioId)
    .eq('estado', 'pendiente')
    .gte('inicio', new Date().toISOString());
  pintarContador(count ?? 0);
}

// ─── Tarjeta de cita (reutilizada en inicio, agenda y diálogo) ────────────────
function enlaceWa(c: Cita) {
  const servicio = c.servicios?.nombre ?? 'cita';
  const nombre = c.nombre.split(' ')[0];
  const texto =
    c.estado === 'cancelada'
      ? `Hola ${nombre}, te escribimos de ${st.negocio.nombre} sobre tu cita de ${servicio}.`
      : `Hola ${nombre}, te escribimos de ${st.negocio.nombre} para confirmar tu cita de ${servicio} el ${fechaLarga(fechaDe(c.inicio))} a las ${hora(c.inicio)} h.`;
  return `https://wa.me/52${c.telefono}?text=${encodeURIComponent(texto)}`;
}

const ETIQUETA: Record<Estado, string> = { pendiente: 'Por confirmar', confirmada: 'Confirmada', cancelada: 'Cancelada' };
const telefonoBonito = (t: string) => t.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');

function acciones(c: Cita) {
  return `
    <div class="flex flex-wrap gap-2">
      ${c.estado === 'pendiente' ? `<button type="button" class="p-accion max-sm:flex-1" data-tipo="confirmar" data-accion="confirmada" data-id="${c.id}">${icono('check', 17)}Confirmar</button>` : ''}
      <a class="p-accion" data-tipo="wa" href="${esc(enlaceWa(c))}" target="_blank" rel="noopener">${ICONO_WA(16)}WhatsApp</a>
      ${c.estado !== 'cancelada' ? `<button type="button" class="p-accion" data-tipo="cancelar" data-accion="cancelada" data-id="${c.id}" title="Cancelar cita">${icono('x', 16)}<span class="max-sm:sr-only">Cancelar</span></button>` : ''}
      ${c.estado === 'cancelada' ? `<button type="button" class="p-accion" data-tipo="eliminar" data-eliminar="${c.id}" title="Eliminar del historial">${icono('basura', 16)}Eliminar</button>` : ''}
    </div>`;
}

function tarjetaCita(c: Cita, { conFecha = false, conHora = true, conEstado = true, horaSoloMovil = false } = {}) {
  const fecha = fechaDe(c.inicio);
  return `
    <article class="p-cita" data-estado="${c.estado}">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          ${
            conHora || conFecha
              ? `<p class="text-sm font-semibold text-suave tabular-nums ${horaSoloMovil ? 'sm:hidden' : ''}">${conFecha ? `<span class="first-letter:uppercase inline-block">${esc(fechaLarga(fecha, { weekday: 'short', day: 'numeric', month: 'short' }))}</span> · ` : ''}${hora(c.inicio)}–${hora(c.fin)}</p>`
              : ''
          }
          <p class="p-cita-titulo mt-0.5 text-base font-bold text-texto">${esc(c.nombre)}</p>
          <p class="mt-0.5 text-sm text-suave">${esc(c.servicios?.nombre ?? 'Cita')} · <a class="whitespace-nowrap tabular-nums hover:text-marca" href="tel:${c.telefono}">${telefonoBonito(c.telefono)}</a></p>
        </div>
        ${conEstado ? `<span class="estado shrink-0" data-estado="${c.estado}">${ETIQUETA[c.estado]}</span>` : ''}
      </div>
      ${c.nota ? `<p class="flex gap-2 rounded-xl bg-fondo px-3 py-2 text-sm text-suave"><span class="mt-0.5 shrink-0 text-tenue">${icono('nota', 15)}</span><span>${esc(c.nota)}</span></p>` : ''}
      ${acciones(c)}
    </article>`;
}

const vacio = (texto: string, ico: Parameters<typeof icono>[0] = 'agenda') => `
  <div class="grid justify-items-center gap-2 rounded-2xl border border-dashed border-borde px-4 py-10 text-center">
    <span class="grid size-11 place-items-center rounded-full bg-fondo text-tenue">${icono(ico, 22)}</span>
    <p class="text-sm text-suave">${texto}</p>
  </div>`;

const errorCarga = (msg: string) => `<p class="rounded-xl bg-orange-50 px-4 py-3 text-sm text-peligro">No se pudo cargar. ${esc(msg)}</p>`;

// Confirmar / cancelar (delegado: inicio, agenda y diálogo).
document.addEventListener('click', async (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('[data-accion]');
  if (!b) return;
  const nuevo = b.dataset.accion as Estado;
  if (nuevo === 'cancelada' && !confirm('¿Cancelar esta cita? El horario quedará libre para otra persona.')) return;
  b.disabled = true;
  const { error } = await supabase.from('citas').update({ estado: nuevo }).eq('id', b.dataset.id!);
  if (error) {
    b.disabled = false;
    return toast(`No se pudo actualizar: ${error.message}`);
  }
  $<HTMLDialogElement>('#detalle').close();
  toast(nuevo === 'confirmada' ? 'Cita confirmada. Avísale por WhatsApp.' : 'Cita cancelada · el horario quedó libre');
  await refrescar();
});

// Eliminar del historial (sólo citas canceladas; la base de datos también lo exige).
document.addEventListener('click', async (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('[data-eliminar]');
  if (!b) return;
  const ids = b.dataset.eliminar!.split(',').filter(Boolean);
  const pregunta =
    ids.length === 1
      ? '¿Eliminar esta cita cancelada? Se borra del historial y no se puede deshacer.'
      : `¿Eliminar ${ids.length} citas canceladas? Se borran del historial y no se puede deshacer.`;
  if (!confirm(pregunta)) return;
  b.disabled = true;
  const { data, error } = await supabase.from('citas').delete().in('id', ids).eq('estado', 'cancelada').select('id');
  if (error || !data?.length) {
    b.disabled = false;
    return toast(error ? `No se pudo eliminar: ${error.message}` : 'Sólo se pueden eliminar citas canceladas');
  }
  const borradas = new Set(data.map((x) => x.id as string));
  borradas.forEach((id) => st.citas.delete(id));
  st.avisos = st.avisos.filter((a) => !a.cita_id || !borradas.has(a.cita_id));
  pintarBandeja();
  $<HTMLDialogElement>('#detalle').close();
  toast(borradas.size === 1 ? 'Cita eliminada del historial' : `${borradas.size} citas eliminadas del historial`);
  await refrescar();
});

// Detalle de cita (desde la vista de semana).
document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLElement>('[data-ver-cita]');
  if (b) verCita(b.dataset.verCita!);
});
function verCita(id: string) {
  const c = st.citas.get(id);
  if (!c) return;
  $('[data-p-detalle]').innerHTML = `
    <div class="grid gap-2">
      ${tarjetaCita(c, { conFecha: true })}
      <button type="button" class="btn btn-secundario w-full" data-cerrar>Cerrar</button>
    </div>`;
  $<HTMLDialogElement>('#detalle').showModal();
}
document.addEventListener('click', (e) => {
  if ((e.target as Element).closest('[data-cerrar]')) $<HTMLDialogElement>('#detalle').close();
});
$('#detalle').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) (e.currentTarget as HTMLDialogElement).close();
});

// ─── Inicio ───────────────────────────────────────────────────────────────────
function saludo() {
  const h = Number(horaEnZona(new Date(), zona()).slice(0, 2));
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

async function cargarInicio() {
  const d = hoy();
  $('[data-p-hoy-fecha]').textContent = fechaLarga(d, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('[data-p-saludo]').innerHTML = `${saludo()}, <span class="text-marca">${esc(st.negocio.nombre)}</span>`;

  const ahora = new Date();
  const [semana, pendientes] = await Promise.all([
    supabase
      .from('citas')
      .select(CAMPOS_CITA)
      .eq('negocio_id', st.negocioId)
      .gte('inicio', aInstante(d, '00:00', zona()).toISOString())
      .lt('inicio', aInstante(sumarDias(d, 7), '00:00', zona()).toISOString())
      .order('inicio'),
    supabase
      .from('citas')
      .select(CAMPOS_CITA)
      .eq('negocio_id', st.negocioId)
      .eq('estado', 'pendiente')
      .gte('inicio', ahora.toISOString())
      .order('inicio')
      .limit(30),
  ]);
  if (semana.error || pendientes.error) {
    $('[data-p-hoy]').innerHTML = errorCarga((semana.error ?? pendientes.error)!.message);
    return;
  }
  const citas = semana.data as unknown as Cita[];
  const porConfirmar = pendientes.data as unknown as Cita[];
  recordar(citas);
  recordar(porConfirmar);
  pintarContador(porConfirmar.length);

  const activas = citas.filter((c) => c.estado !== 'cancelada');
  const deHoy = activas.filter((c) => fechaDe(c.inicio) === d);
  const nuevasHoy = citas.filter((c) => fechaDe(c.creada_en) === d).length;

  const kpi = (ico: Parameters<typeof icono>[0], valor: number, etiqueta: string, color: string, destacar = false) => `
    <div class="tarjeta p-kpi ${destacar ? 'ring-2 ring-amber-300' : ''}">
      <span class="p-kpi-icono ${color}">${icono(ico, 20)}</span>
      <div><p class="text-3xl font-bold tracking-tight tabular-nums">${valor}</p><p class="text-sm font-medium text-suave">${etiqueta}</p></div>
    </div>`;
  $('[data-p-kpis]').innerHTML = [
    kpi('agenda', deHoy.length, deHoy.length === 1 ? 'Cita hoy' : 'Citas hoy', 'bg-marca-50 text-marca'),
    kpi('pendiente', porConfirmar.length, 'Por confirmar', 'bg-pendiente-50 text-pendiente', porConfirmar.length > 0),
    kpi('semana', activas.length, 'Próximos 7 días', 'bg-sky-50 text-sky-700'),
    kpi('nuevo', nuevasHoy, nuevasHoy === 1 ? 'Reserva nueva hoy' : 'Reservas nuevas hoy', 'bg-violet-50 text-violet-700'),
  ].join('');

  // Siguiente cita.
  const siguiente = activas.find((c) => new Date(c.fin) > ahora);
  $('[data-p-siguiente]').innerHTML = siguiente
    ? (() => {
        const enCurso = new Date(siguiente.inicio) <= ahora;
        const min = Math.round((new Date(siguiente.inicio).getTime() - ahora.getTime()) / 60000);
        const cuando = enCurso
          ? 'En curso'
          : fechaDe(siguiente.inicio) === d
            ? min < 60 ? `En ${min} min` : `Hoy a las ${hora(siguiente.inicio)}`
            : fechaLarga(fechaDe(siguiente.inicio), { weekday: 'long', day: 'numeric', month: 'short' });
        return `
          <section class="p-hero p-5 sm:p-6 text-white" aria-label="Siguiente cita">
            <div class="relative z-10 flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="text-xs font-bold uppercase tracking-wider text-white/70">Siguiente cita · <span class="normal-case first-letter:uppercase inline-block">${esc(cuando)}</span></p>
                <p class="mt-2 text-2xl font-bold tracking-tight">${esc(siguiente.nombre)}</p>
                <p class="mt-1 text-white/80">${esc(siguiente.servicios?.nombre ?? 'Cita')} · ${hora(siguiente.inicio)}–${hora(siguiente.fin)}</p>
              </div>
              <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">${ETIQUETA[siguiente.estado]}</span>
            </div>
            <div class="relative z-10 mt-4 flex flex-wrap gap-2">
              <a class="btn min-h-10 bg-white px-4 text-sm text-marca-osc hover:bg-marca-50" href="${esc(enlaceWa(siguiente))}" target="_blank" rel="noopener">${ICONO_WA(16)}WhatsApp</a>
              <a class="btn min-h-10 border border-white/30 px-4 text-sm text-white hover:bg-white/10" href="tel:${siguiente.telefono}">${icono('tel', 16)}Llamar</a>
            </div>
          </section>`;
      })()
    : '';

  // Por confirmar.
  const num = $('[data-p-pendientes-num]');
  num.hidden = !porConfirmar.length;
  num.textContent = plural(porConfirmar.length, 'cita', 'citas');
  $('[data-p-pendientes]').innerHTML = porConfirmar.length
    ? `<div class="grid gap-3">${porConfirmar.map((c) => tarjetaCita(c, { conFecha: true, conEstado: false })).join('')}</div>`
    : vacio('Todo al día. No hay citas esperando respuesta.', 'check');

  // Línea del día.
  const todasHoy = citas.filter((c) => fechaDe(c.inicio) === d);
  $('[data-p-hoy]').innerHTML = todasHoy.length
    ? todasHoy
        .map(
          (c) => `
        <div class="p-linea ${new Date(c.fin) < ahora ? 'opacity-55' : ''}">
          <p class="p-linea-hora">${hora(c.inicio)}<small>${hora(c.fin)}</small></p>
          ${tarjetaCita(c, { horaSoloMovil: true })}
        </div>`,
        )
        .join('')
    : vacio('Hoy no hay citas agendadas.');
}

// ─── Agenda ───────────────────────────────────────────────────────────────────
$$('[data-vista]').forEach((b) =>
  b.addEventListener('click', () => {
    st.vista = b.dataset.vista as 'dia' | 'semana';
    $$('[data-vista]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    cargarAgenda();
  }),
);
$$('[data-nav]').forEach((b) =>
  b.addEventListener('click', () => {
    const paso = Number(b.dataset.nav);
    st.fecha = paso === 0 ? hoy() : sumarDias(st.fecha, paso * (st.vista === 'dia' ? 1 : 7));
    cargarAgenda();
  }),
);
$$('[data-filtro]').forEach((b) =>
  b.addEventListener('click', () => {
    st.filtro = b.dataset.filtro as typeof st.filtro;
    $$('[data-filtro]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    cargarAgenda();
  }),
);

function rango(): [string, string] {
  if (st.vista === 'dia') return [st.fecha, sumarDias(st.fecha, 1)];
  const lunes = sumarDias(st.fecha, -((diaSemana(st.fecha) + 6) % 7));
  return [lunes, sumarDias(lunes, 7)];
}

async function cargarAgenda() {
  const [desde, hasta] = rango();
  const d = hoy();
  $('[data-p-rango]').textContent =
    st.vista === 'dia'
      ? `${fechaLarga(desde)}${desde === d ? ' · hoy' : ''}`
      : `${fechaLarga(desde, { day: 'numeric', month: 'short' })} – ${fechaLarga(sumarDias(hasta, -1), { day: 'numeric', month: 'short', year: 'numeric' })}`;
  const caja = $('[data-p-agenda]');
  caja.innerHTML = `<div class="grid gap-3">${'<div class="esqueleto h-28"></div>'.repeat(3)}</div>`;
  let consulta = supabase
    .from('citas')
    .select(CAMPOS_CITA)
    .eq('negocio_id', st.negocioId)
    .gte('inicio', aInstante(desde, '00:00', zona()).toISOString())
    .lt('inicio', aInstante(hasta, '00:00', zona()).toISOString())
    .order('inicio');
  if (st.filtro !== 'todas') consulta = consulta.eq('estado', st.filtro);
  const [{ data: filas, error }] = await Promise.all([consulta, contarPendientes()]);
  if (error) {
    caja.innerHTML = errorCarga(error.message);
    return;
  }
  const citas = (filas ?? []) as unknown as Cita[];
  recordar(citas);
  const PLURAL: Record<Estado, string> = { pendiente: 'por confirmar', confirmada: 'confirmadas', cancelada: 'canceladas' };
  const filtroTxt = st.filtro === 'todas' ? '' : ` ${PLURAL[st.filtro]}`;
  const conteo = st.filtro === 'todas' ? plural(citas.length, 'cita', 'citas')
    : citas.length === 1 ? `1 cita ${ETIQUETA[st.filtro].toLowerCase()}` : `${citas.length} citas${filtroTxt}`;
  const canceladas = citas.filter((c) => c.estado === 'cancelada');
  const limpiar =
    st.filtro === 'cancelada' && canceladas.length > 1
      ? `<div class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-borde bg-superficie px-4 py-3">
           <p class="text-sm text-suave">¿Ya no necesitas estas citas canceladas?</p>
           <button type="button" class="p-accion" data-tipo="eliminar" data-eliminar="${canceladas.map((c) => c.id).join(',')}">${icono('basura', 16)}Eliminar las ${canceladas.length}</button>
         </div>`
      : '';

  if (st.vista === 'dia') {
    caja.innerHTML = citas.length
      ? `${limpiar}<p class="mb-3 text-sm font-medium text-suave">${conteo}</p>
         <div class="grid gap-3 lg:grid-cols-2">${citas.map((c) => tarjetaCita(c)).join('')}</div>`
      : vacio(`Sin citas${filtroTxt} este día.`);
    return;
  }

  // Semana: columnas en escritorio, lista por día en móvil.
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(desde, i));
  const porDia = new Map(dias.map((f) => [f, citas.filter((c) => fechaDe(c.inicio) === f)]));
  const columnas = dias
    .map((f) => {
      const lista = porDia.get(f)!;
      return `
        <div class="p-dia-col" ${f === d ? 'data-hoy' : ''}>
          <p class="px-1 pb-1 text-center">
            <span class="block text-xs font-bold uppercase tracking-wide ${f === d ? 'text-marca' : 'text-tenue'}">${esc(fechaLarga(f, { weekday: 'short' }).replace('.', ''))}</span>
            <span class="text-lg font-bold tabular-nums ${f === d ? 'text-marca' : 'text-texto'}">${Number(f.slice(8))}</span>
          </p>
          ${
            lista.length
              ? lista
                  .map(
                    (c) => `
            <button type="button" class="p-bloque" data-estado="${c.estado}" data-ver-cita="${c.id}">
              <span class="font-bold tabular-nums">${hora(c.inicio)}</span>
              <span class="truncate font-semibold text-texto">${esc(c.nombre)}</span>
              <span class="truncate text-suave">${esc(c.servicios?.nombre ?? 'Cita')}</span>
            </button>`,
                  )
                  .join('')
              : '<p class="pt-6 text-center text-xs text-tenue">—</p>'
          }
        </div>`;
    })
    .join('');
  const listas = dias
    .filter((f) => porDia.get(f)!.length)
    .map(
      (f) => `
      <h3 class="mb-2 mt-6 text-sm font-bold uppercase tracking-wide first:mt-0 ${f === d ? 'text-marca' : 'text-suave'}">${esc(fechaLarga(f))}${f === d ? ' · hoy' : ''}</h3>
      <div class="grid gap-3">${porDia.get(f)!.map((c) => tarjetaCita(c)).join('')}</div>`,
    )
    .join('');
  caja.innerHTML = `${limpiar}
    <div class="hidden lg:block">
      <div class="mb-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-suave">
        <span>${conteo}</span>
        <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-sm bg-amber-400"></span>Por confirmar</span>
        <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-sm bg-emerald-500"></span>Confirmada</span>
        <span class="flex items-center gap-1.5"><span class="size-2.5 rounded-sm bg-slate-400"></span>Cancelada</span>
      </div>
      <div class="p-semana">${columnas}</div>
    </div>
    <div class="lg:hidden">${citas.length ? listas : vacio(`Sin citas${filtroTxt} esta semana.`)}</div>`;
}

// ─── Historial anual ──────────────────────────────────────────────────────────
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const hist = { anio: 0, atendidas: [] as Cita[], cerrados: new Map<number, Historial>(), primerAnio: 0 };
const anioActual = () => Number(hoy().slice(0, 4));
const numero = (n: number) => n.toLocaleString('es-MX');

/** Todas las citas de un año (PostgREST entrega máximo 1000 por consulta). */
async function citasDelAnio(anio: number) {
  const desde = aInstante(`${anio}-01-01`, '00:00', zona()).toISOString();
  const hasta = aInstante(`${anio + 1}-01-01`, '00:00', zona()).toISOString();
  const todas: Cita[] = [];
  for (let i = 0; ; i += 1000) {
    const { data, error } = await supabase
      .from('citas').select(CAMPOS_CITA).eq('negocio_id', st.negocioId)
      .gte('inicio', desde).lt('inicio', hasta).order('inicio').range(i, i + 999);
    if (error) throw error;
    todas.push(...(data as unknown as Cita[]));
    if (!data || data.length < 1000) return todas;
  }
}

/** Resumen calculado en el momento (año en curso o años sin cerrar). */
function resumenEnVivo(anio: number, citas: Cita[]): Historial {
  const ahora = Date.now();
  const atendidas = citas.filter((c) => c.estado === 'confirmada' && Date.parse(c.fin) <= ahora);
  const porServicio = new Map<string, number>();
  const porMes = Array(12).fill(0) as number[];
  atendidas.forEach((c) => {
    const s = c.servicios?.nombre ?? 'Cita';
    porServicio.set(s, (porServicio.get(s) ?? 0) + 1);
    porMes[Number(fechaDe(c.inicio).slice(5, 7)) - 1]++;
  });
  return {
    anio,
    atendidas: atendidas.length,
    canceladas: citas.filter((c) => c.estado === 'cancelada').length,
    sin_confirmar: citas.filter((c) => c.estado === 'pendiente' && Date.parse(c.fin) <= ahora).length,
    clientes: new Set(atendidas.map((c) => c.telefono)).size,
    por_servicio: [...porServicio].map(([servicio, total]) => ({ servicio, total })).sort((a, b) => b.total - a.total),
    por_mes: porMes,
    cerrado_en: '',
  };
}

async function cargarHistorial() {
  const actual = anioActual();
  if (!hist.primerAnio) {
    const [cerrados, primera] = await Promise.all([
      supabase.from('historiales_anuales').select('*').eq('negocio_id', st.negocioId),
      supabase.from('citas').select('inicio').eq('negocio_id', st.negocioId).order('inicio').limit(1).maybeSingle(),
    ]);
    ((cerrados.data ?? []) as Historial[]).forEach((h) => hist.cerrados.set(h.anio, h));
    const primerCita = primera.data ? Number(fechaDe((primera.data as { inicio: string }).inicio).slice(0, 4)) : actual;
    hist.primerAnio = Math.min(primerCita, ...hist.cerrados.keys(), actual);
  }
  if (!hist.anio) hist.anio = actual;
  const anios = Array.from({ length: actual - hist.primerAnio + 1 }, (_, i) => actual - i);
  $('[data-p-anios]').innerHTML = anios
    .map((a) => `<button type="button" class="chip" data-anio="${a}" aria-pressed="${a === hist.anio}">${a}${a === actual ? ' · en curso' : ''}</button>`)
    .join('');

  const cerrado = hist.cerrados.get(hist.anio);
  $('[data-p-anio-estado]').innerHTML =
    hist.anio === actual
      ? `<span class="estado shrink-0" data-estado="pendiente">En curso</span> Se cierra el 1 de enero de ${actual + 1}. Los números se actualizan solos.`
      : cerrado
        ? `<span class="estado shrink-0" data-estado="confirmada">Cerrado</span> Resumen guardado el ${esc(fechaLarga(fechaDe(cerrado.cerrado_en), { day: 'numeric', month: 'long', year: 'numeric' }))}.`
        : `<span class="estado shrink-0" data-estado="cancelada">Terminado</span> Año anterior a los resúmenes automáticos; calculado con las citas guardadas.`;

  $('[data-p-hist-lista]').innerHTML = '<div class="esqueleto h-40"></div>';
  const anio = hist.anio;
  let citas: Cita[];
  try {
    citas = await citasDelAnio(anio);
  } catch (e) {
    $('[data-p-hist-lista]').innerHTML = errorCarga((e as Error).message);
    return;
  }
  if (anio !== hist.anio) return; // cambió de año mientras cargaba
  const ahora = Date.now();
  hist.atendidas = citas.filter((c) => c.estado === 'confirmada' && Date.parse(c.fin) <= ahora).reverse();
  recordar(hist.atendidas);
  const r = cerrado ?? resumenEnVivo(anio, citas);

  const kpi = (ico: Parameters<typeof icono>[0], valor: number, etiqueta: string, color: string) => `
    <div class="tarjeta p-kpi">
      <span class="p-kpi-icono ${color}">${icono(ico, 20)}</span>
      <div><p class="text-3xl font-bold tracking-tight tabular-nums">${numero(valor)}</p><p class="text-sm font-medium text-suave">${etiqueta}</p></div>
    </div>`;
  $('[data-p-hist-kpis]').innerHTML = [
    kpi('check', r.atendidas, 'Citas atendidas', 'bg-confirmada-50 text-confirmada'),
    kpi('usuarios', r.clientes, r.clientes === 1 ? 'Cliente atendido' : 'Clientes atendidos', 'bg-marca-50 text-marca'),
    kpi('x', r.canceladas, 'Canceladas', 'bg-cancelada-50 text-cancelada'),
    kpi('pendiente', r.sin_confirmar, 'Pasaron sin confirmar', 'bg-pendiente-50 text-pendiente'),
  ].join('');

  // Por mes: una serie (color de marca), valor al pasar el cursor y etiqueta sólo en el máximo.
  const max = Math.max(...r.por_mes, 0);
  const mesActual = anio === actual ? Number(hoy().slice(5, 7)) - 1 : 11;
  const iMax = r.por_mes.indexOf(max);
  $('[data-p-hist-meses]').innerHTML = r.atendidas
    ? `<div class="p-barras" role="img" aria-label="${esc(r.por_mes.map((v, i) => `${MESES_LARGOS[i]}: ${v}`).join(', '))}">
        ${r.por_mes
          .map((v, i) => {
            const futuro = i > mesActual;
            const alto = max ? Math.max((v / max) * 100, v ? 3 : 0) : 0;
            return `<button type="button" class="p-barra" ${v ? '' : 'data-cero'} ${futuro ? 'data-futuro' : ''} aria-label="${MESES_LARGOS[i]}: ${v} citas">
              <span class="p-barra-col" style="height:${futuro ? 0 : alto}%"></span>
              ${i === iMax && max ? `<span class="p-barra-valor" style="bottom:calc(${alto}% + 0.3rem)">${numero(v)}</span>` : ''}
              <span class="p-barra-tip" style="bottom:calc(${futuro ? 0 : alto}% + ${i === iMax ? '1.7rem' : '0.4rem'})">${MESES_LARGOS[i][0]!.toUpperCase() + MESES_LARGOS[i].slice(1)}: ${futuro ? 'aún no llega' : `${numero(v)} ${v === 1 ? 'cita' : 'citas'}`}</span>
            </button>`;
          })
          .join('')}
      </div>
      <div class="p-barras-meses" aria-hidden="true">${MESES.map((m) => `<span>${m}</span>`).join('')}</div>`
    : vacio(anio === actual ? 'Aún no hay citas atendidas este año.' : 'No hubo citas atendidas este año.', 'historial');

  const topServicio = r.por_servicio[0]?.total ?? 0;
  $('[data-p-hist-servicios]').innerHTML = r.por_servicio.length
    ? `<ul class="grid gap-3.5">${r.por_servicio
        .map(
          (s) => `
        <li>
          <div class="flex items-baseline justify-between gap-3 text-sm">
            <span class="min-w-0 truncate font-semibold">${esc(s.servicio)}</span>
            <span class="shrink-0 tabular-nums text-suave"><b class="text-texto">${numero(s.total)}</b> · ${Math.round((s.total / r.atendidas) * 100)}%</span>
          </div>
          <div class="mt-1.5 h-2 rounded-full bg-fondo"><div class="h-2 rounded-full bg-marca" style="width:${(s.total / topServicio) * 100}%"></div></div>
        </li>`,
        )
        .join('')}</ul>`
    : vacio('Sin servicios atendidos.', 'historial');

  pintarListaHistorial();
}

function pintarListaHistorial() {
  const q = $<HTMLInputElement>('[data-p-hist-buscar]').value.trim().toLowerCase();
  const filtradas = q
    ? hist.atendidas.filter((c) => `${c.nombre} ${c.telefono} ${c.servicios?.nombre ?? ''}`.toLowerCase().includes(q))
    : hist.atendidas;
  const caja = $('[data-p-hist-lista]');
  if (!filtradas.length) {
    caja.innerHTML = vacio(q ? 'Nada coincide con tu búsqueda.' : 'Todavía no hay citas atendidas en este año.', 'historial');
    return;
  }
  const porMes = new Map<number, Cita[]>();
  filtradas.forEach((c) => {
    const m = Number(fechaDe(c.inicio).slice(5, 7)) - 1;
    porMes.set(m, [...(porMes.get(m) ?? []), c]);
  });
  caja.innerHTML = `<div class="grid gap-2">${[...porMes]
    .map(
      ([m, lista], i) => `
      <details class="p-mes rounded-xl border border-borde" ${i === 0 || q ? 'open' : ''}>
        <summary class="flex items-center gap-3 px-4 py-3">
          <span class="p-mes-flecha text-tenue">${icono('der', 16)}</span>
          <span class="flex-1 font-bold first-letter:uppercase">${MESES_LARGOS[m]}</span>
          <span class="text-sm tabular-nums text-suave">${plural(lista.length, 'cita', 'citas')}</span>
        </summary>
        <ul class="divide-y divide-borde border-t border-borde">${lista
          .map(
            (c) => `
          <li><button type="button" class="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5 px-4 py-2.5 text-left text-sm hover:bg-fondo sm:flex sm:items-center" data-ver-cita="${c.id}">
            <span class="order-3 col-span-2 tabular-nums text-suave first-letter:uppercase sm:order-none sm:w-28 sm:shrink-0">${esc(fechaLarga(fechaDe(c.inicio), { weekday: 'short', day: 'numeric' }))} · ${hora(c.inicio)}</span>
            <span class="min-w-0 truncate font-semibold sm:flex-1">${esc(c.nombre)}</span>
            <span class="text-right text-suave">${esc(c.servicios?.nombre ?? 'Cita')}</span>
            <span class="hidden tabular-nums text-tenue sm:inline">${telefonoBonito(c.telefono)}</span>
          </button></li>`,
          )
          .join('')}</ul>
      </details>`,
    )
    .join('')}</div>`;
}

document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLElement>('[data-anio]');
  if (!b) return;
  hist.anio = Number(b.dataset.anio);
  $<HTMLInputElement>('[data-p-hist-buscar]').value = '';
  cargarHistorial();
});
$('[data-p-hist-buscar]').addEventListener('input', pintarListaHistorial);

$('[data-p-hist-descargar]').addEventListener('click', () => {
  if (!hist.atendidas.length) return toast('No hay citas atendidas para descargar');
  const celda = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const filas = [
    ['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Servicio', 'Nota'],
    ...[...hist.atendidas].reverse().map((c) => [fechaDe(c.inicio), hora(c.inicio), c.nombre, c.telefono, c.servicios?.nombre ?? '', c.nota ?? '']),
  ];
  // BOM para que Excel abra bien los acentos.
  const csv = '﻿' + filas.map((f) => f.map(celda).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `historial-${st.negocio.slug}-${hist.anio}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast(`Descargado: ${plural(hist.atendidas.length, 'cita', 'citas')} de ${hist.anio}`);
});

// ─── Bloqueos ─────────────────────────────────────────────────────────────────
const formBloqueo = $<HTMLFormElement>('#form-bloqueo');
const campoB = (n: string) => formBloqueo.elements.namedItem(n) as HTMLInputElement;
campoB('todo_dia').addEventListener('change', () => {
  formBloqueo.querySelectorAll<HTMLElement>('[data-horas]').forEach((x) => (x.hidden = campoB('todo_dia').checked));
});

formBloqueo.addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('#bloqueo-error');
  const falla = (t: string) => ((err.hidden = false), (err.textContent = t));
  const desde = campoB('desde').value;
  const hasta = campoB('hasta').value || desde;
  const todoDia = campoB('todo_dia').checked;
  if (!desde) return falla('Elige al menos el día de inicio.');
  const inicio = aInstante(desde, todoDia ? '00:00' : campoB('hora_desde').value, zona());
  const fin = todoDia ? aInstante(sumarDias(hasta, 1), '00:00', zona()) : aInstante(hasta, campoB('hora_hasta').value, zona());
  if (!(fin > inicio)) return falla('El final debe ser después del inicio.');
  err.hidden = true;
  const boton = formBloqueo.querySelector<HTMLButtonElement>('button[type=submit]')!;
  boton.disabled = true;
  const { error } = await supabase.from('bloqueos').insert({
    negocio_id: st.negocioId, inicio: inicio.toISOString(), fin: fin.toISOString(), motivo: campoB('motivo').value.trim() || null,
  });
  boton.disabled = false;
  if (error) return falla(`No se pudo crear: ${error.message}`);
  formBloqueo.reset();
  campoB('todo_dia').dispatchEvent(new Event('change'));
  toast('Listo, ese tiempo quedó bloqueado');
  cargarBloqueos();
});

function textoBloqueo(b: Bloqueo) {
  const i = new Date(b.inicio);
  const f = new Date(b.fin);
  const fi = fechaEnZona(i, zona());
  const ff = fechaEnZona(new Date(f.getTime() - 1), zona());
  const diaCompleto = horaEnZona(i, zona()) === '00:00' && horaEnZona(f, zona()) === '00:00';
  if (diaCompleto) return fi === ff ? { titulo: fechaLarga(fi), detalle: 'Todo el día' } : { titulo: `${fechaLarga(fi, { day: 'numeric', month: 'short' })} – ${fechaLarga(ff, { day: 'numeric', month: 'short' })}`, detalle: 'Días completos' };
  const mismoDia = fi === fechaEnZona(f, zona());
  return {
    titulo: fechaLarga(fi),
    detalle: `${horaEnZona(i, zona())} – ${mismoDia ? '' : `${fechaLarga(fechaEnZona(f, zona()), { day: 'numeric', month: 'short' })} `}${horaEnZona(f, zona())} h`,
  };
}

async function cargarBloqueos() {
  const lista = $('[data-p-bloqueos]');
  const [{ data: filas, error }] = await Promise.all([
    supabase.from('bloqueos').select('id, inicio, fin, motivo').eq('negocio_id', st.negocioId).gte('fin', new Date().toISOString()).order('inicio'),
    contarPendientes(),
  ]);
  if (error) {
    lista.innerHTML = errorCarga(error.message);
    return;
  }
  const data = (filas ?? []) as Bloqueo[];
  lista.innerHTML = data.length
    ? `<div class="grid gap-2.5">${data
        .map((b) => {
          const t = textoBloqueo(b);
          return `
          <div class="flex items-center gap-3 rounded-xl border border-borde px-4 py-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-cancelada-50 text-cancelada">${icono('bloqueos', 18)}</span>
            <div class="min-w-0 flex-1">
              <p class="font-semibold first-letter:uppercase">${esc(t.titulo)}</p>
              <p class="text-sm text-suave">${esc(t.detalle)}${b.motivo ? ` · ${esc(b.motivo)}` : ''}</p>
            </div>
            <button type="button" class="p-accion" data-tipo="cancelar" data-borrar-bloqueo="${b.id}">Quitar</button>
          </div>`;
        })
        .join('')}</div>`
    : vacio('No hay bloqueos próximos. Tu agenda está abierta según tu horario.', 'bloqueos');
}

document.addEventListener('click', async (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('[data-borrar-bloqueo]');
  if (!b || !confirm('¿Quitar este bloqueo? Esos horarios volverán a estar disponibles.')) return;
  b.disabled = true;
  const { error } = await supabase.from('bloqueos').delete().eq('id', b.dataset.borrarBloqueo!);
  if (error) {
    b.disabled = false;
    return toast(`No se pudo quitar: ${error.message}`);
  }
  toast('Bloqueo quitado');
  cargarBloqueos();
});

// ─── Mi página ────────────────────────────────────────────────────────────────
const enlacePagina = () => `${location.origin}/${st.negocio.slug}`;
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

async function cargarPagina() {
  const url = enlacePagina();
  $('[data-p-enlace]').textContent = url.replace(/^https?:\/\//, '');
  $<HTMLAnchorElement>('[data-p-abrir]').href = url;
  const [serv, hor] = await Promise.all([
    supabase.from('servicios').select('id, nombre, duracion_min, activo').eq('negocio_id', st.negocioId).order('orden'),
    supabase.from('horarios').select('dia_semana, abre, cierra').eq('negocio_id', st.negocioId).order('abre'),
    contarPendientes(),
  ]);
  const cajaS = $('[data-p-servicios]');
  if (serv.error) cajaS.innerHTML = errorCarga(serv.error.message);
  else
    cajaS.innerHTML = `<ul class="divide-y divide-borde">${(serv.data as Servicio[])
      .map(
        (s) => `
        <li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div class="min-w-0 flex-1">
            <p class="font-semibold ${s.activo ? '' : 'text-tenue'}">${esc(s.nombre)}</p>
            <p class="flex items-center gap-1 text-sm text-suave">${icono('reloj', 14)}${s.duracion_min} min${s.activo ? '' : ' · oculto'}</p>
          </div>
          <input type="checkbox" class="p-switch" data-servicio-activo="${s.id}" ${s.activo ? 'checked' : ''} aria-label="Mostrar ${esc(s.nombre)} en tu página" />
        </li>`,
      )
      .join('')}</ul>`;

  const cajaH = $('[data-p-horario]');
  if (hor.error) cajaH.innerHTML = errorCarga(hor.error.message);
  else {
    const filas = hor.data as Horario[];
    const hoyDia = diaSemana(hoy());
    cajaH.innerHTML = `<ul class="grid gap-1">${[1, 2, 3, 4, 5, 6, 0]
      .map((dia) => {
        const tramos = filas.filter((h) => h.dia_semana === dia);
        return `
          <li class="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ${dia === hoyDia ? 'bg-marca-50' : ''}">
            <span class="font-semibold ${dia === hoyDia ? 'text-marca-osc' : ''}">${DIAS[dia]}${dia === hoyDia ? ' <span class="text-xs font-bold">· hoy</span>' : ''}</span>
            <span class="text-right text-sm tabular-nums ${tramos.length ? 'font-medium text-texto' : 'text-tenue'}">${
              tramos.length ? tramos.map((t) => `${t.abre.slice(0, 5)} – ${t.cierra.slice(0, 5)}`).join('<span class="text-tenue"> · </span>') : 'Cerrado'
            }</span>
          </li>`;
      })
      .join('')}</ul>`;
  }
}

document.addEventListener('change', async (e) => {
  const sw = (e.target as Element).closest<HTMLInputElement>('[data-servicio-activo]');
  if (!sw) return;
  sw.disabled = true;
  const { error } = await supabase.from('servicios').update({ activo: sw.checked }).eq('id', sw.dataset.servicioActivo!);
  sw.disabled = false;
  if (error) {
    sw.checked = !sw.checked;
    return toast(`No se pudo cambiar: ${error.message}`);
  }
  toast(sw.checked ? 'Servicio visible en tu página' : 'Servicio oculto de tu página');
  cargarPagina();
});

$('[data-p-copiar]').addEventListener('click', async (e) => {
  const b = e.currentTarget as HTMLButtonElement;
  try {
    await navigator.clipboard.writeText(enlacePagina());
    const t = b.querySelector('span')!;
    t.textContent = '¡Copiado!';
    setTimeout(() => (t.textContent = 'Copiar enlace'), 2000);
  } catch {
    prompt('Copia tu enlace:', enlacePagina());
  }
});
$('[data-p-compartir]').addEventListener('click', async () => {
  const datos = { title: st.negocio.nombre, text: `Reserva tu cita en ${st.negocio.nombre}`, url: enlacePagina() };
  if (navigator.share) {
    try { await navigator.share(datos); } catch { /* cancelado */ }
  } else window.open(`https://wa.me/?text=${encodeURIComponent(`${datos.text}: ${datos.url}`)}`, '_blank', 'noopener');
});

// ─── Sonido y notificaciones del navegador ────────────────────────────────────
let audio: AudioContext | null = null;

function pintarSonido() {
  $$<HTMLInputElement>('[data-p-sonido]').forEach((x) => (x.checked = st.sonido));
  $('[data-p-sugerir-sonido]').hidden = st.sonido;
}

async function cambiarSonido(activo: boolean) {
  st.sonido = activo;
  if (activo) {
    audio ??= new AudioContext();
    await audio.resume();
    sonar();
    if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
  }
  try { localStorage.setItem(CLAVE_SONIDO, activo ? '1' : '0'); } catch { /* sin almacenamiento */ }
  pintarSonido();
  toast(activo ? 'Listo: sonará al llegar una cita' : 'Sonido desactivado');
}
$$<HTMLInputElement>('[data-p-sonido]').forEach((x) => x.addEventListener('change', () => cambiarSonido(x.checked)));
$('[data-p-activar-sonido]').addEventListener('click', () => cambiarSonido(true));

function sonar() {
  if (!st.sonido) return;
  audio ??= new AudioContext();
  const t = audio.currentTime;
  [880, 1320].forEach((freq, i) => {
    const osc = audio!.createOscillator();
    const vol = audio!.createGain();
    osc.frequency.value = freq;
    vol.gain.setValueAtTime(0.0001, t + i * 0.18);
    vol.gain.exponentialRampToValueAtTime(0.25, t + i * 0.18 + 0.02);
    vol.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.18 + 0.3);
    osc.connect(vol).connect(audio!.destination);
    osc.start(t + i * 0.18);
    osc.stop(t + i * 0.18 + 0.32);
  });
}

function toast(texto: string, nueva = false) {
  const t = document.createElement('div');
  t.className = 'p-toast';
  if (nueva) t.dataset.tipo = 'nueva';
  t.setAttribute('role', 'status');
  t.innerHTML = `${nueva ? icono('campana', 18) : icono('check', 18)}<span>${esc(texto)}</span>`;
  if (nueva) {
    t.style.cursor = 'pointer';
    t.title = 'Ver avisos';
    t.addEventListener('click', () => {
      t.remove();
      abrirBandeja();
    });
  }
  $('#toasts').append(t);
  setTimeout(() => t.remove(), nueva ? 9000 : 3500);
}

function actualizarTitulo() {
  document.title = `${st.sinLeer ? `(${st.sinLeer}) ` : ''}${st.negocio.nombre} · Panel`;
}

// ─── Bandeja de avisos ────────────────────────────────────────────────────────
const bandeja = $<HTMLDialogElement>('#bandeja');

function haceCuanto(iso: string) {
  const min = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  if (min < 24 * 60) return `Hace ${Math.round(min / 60)} h`;
  const f = fechaDe(iso);
  return f === sumarDias(hoy(), -1) ? `Ayer, ${hora(iso)}` : `${fechaLarga(f, { day: 'numeric', month: 'short' })}, ${hora(iso)}`;
}

function resumenCita(c: NonNullable<Aviso['citas']>) {
  return `${c.servicios?.nombre ?? 'Cita'} · ${fechaLarga(fechaDe(c.inicio), { weekday: 'short', day: 'numeric', month: 'short' })} ${hora(c.inicio)} h`;
}

function pintarBandeja() {
  const sinLeer = st.avisos.filter((a) => !a.leido_en).length;
  $$('[data-p-avisos-num]').forEach((x) => {
    x.hidden = sinLeer === 0;
    x.textContent = sinLeer > 9 ? '9+' : String(sinLeer);
  });
  $$('[data-p-campana]').forEach((b) => b.setAttribute('aria-label', sinLeer ? `Avisos: ${sinLeer} sin leer` : 'Avisos'));
  $<HTMLButtonElement>('[data-p-leer-todo]').disabled = sinLeer === 0;
  $('[data-p-bandeja-lista]').innerHTML = st.avisos.length
    ? `<div class="grid gap-1">${st.avisos
        .map((a) => {
          const c = a.citas;
          if (a.tipo === 'historial_anual') {
            return `
          <button type="button" class="p-aviso" data-aviso="${a.id}" ${a.leido_en ? '' : 'data-nuevo'}>
            <span class="grid size-10 shrink-0 place-items-center rounded-full ${a.leido_en ? 'bg-fondo text-tenue' : 'bg-white text-marca shadow-sm'}">${icono('historial', 18)}</span>
            <span class="min-w-0 flex-1 pr-4">
              <span class="block text-sm font-bold text-texto">Tu historial ${a.anio} está listo</span>
              <span class="mt-0.5 block text-sm text-suave">Se cerró el año: mira tus citas atendidas y descárgalas.</span>
              <span class="mt-1 block text-xs text-tenue">${haceCuanto(a.creado_en)}</span>
            </span>
          </button>`;
          }
          return `
          <button type="button" class="p-aviso" data-aviso="${a.id}" ${a.leido_en ? '' : 'data-nuevo'}>
            <span class="grid size-10 shrink-0 place-items-center rounded-full ${a.leido_en ? 'bg-fondo text-tenue' : 'bg-white text-marca shadow-sm'}">${icono('agenda', 18)}</span>
            <span class="min-w-0 flex-1 pr-4">
              <span class="block text-sm font-bold text-texto">Nueva cita${c ? ` · ${esc(c.nombre)}` : ''}</span>
              <span class="mt-0.5 block text-sm text-suave">${c ? esc(resumenCita(c)) : 'La cita ya no existe'}</span>
              <span class="mt-1 flex items-center gap-2 text-xs text-tenue">${haceCuanto(a.creado_en)}${c && c.estado !== 'pendiente' ? ` <span class="estado" data-estado="${c.estado}">${ETIQUETA[c.estado]}</span>` : ''}</span>
            </span>
          </button>`;
        })
        .join('')}</div>`
    : `<div class="grid justify-items-center gap-2 px-6 py-16 text-center">
         <span class="grid size-12 place-items-center rounded-full bg-fondo text-tenue">${icono('campana', 22)}</span>
         <p class="font-semibold">Sin avisos todavía</p>
         <p class="text-sm text-suave">Aquí te avisamos cada vez que alguien reserve en tu página.</p>
       </div>`;
}

async function cargarAvisos() {
  const { data } = await supabase.from('avisos').select(CAMPOS_AVISO).eq('negocio_id', st.negocioId).order('creado_en', { ascending: false }).limit(40);
  st.avisos = (data ?? []) as unknown as Aviso[];
  st.avisos.forEach((a) => st.avisosVistos.add(a.id));
  pintarBandeja();
}

function abrirBandeja() {
  pintarBandeja(); // refresca los "hace X min"
  if (!bandeja.open) bandeja.showModal();
}
$$('[data-p-campana]').forEach((b) => b.addEventListener('click', abrirBandeja));
$('[data-p-cerrar-bandeja]').addEventListener('click', () => bandeja.close());
bandeja.addEventListener('click', (e) => {
  if (e.target === bandeja) bandeja.close();
});

async function marcarLeidos(ids: string[]) {
  if (!ids.length) return;
  const ahora = new Date().toISOString();
  st.avisos.forEach((a) => ids.includes(a.id) && (a.leido_en ??= ahora));
  pintarBandeja();
  const { error } = await supabase.from('avisos').update({ leido_en: ahora }).in('id', ids);
  if (error) toast(`No se pudo marcar como leído: ${error.message}`);
}

$('[data-p-leer-todo]').addEventListener('click', () => marcarLeidos(st.avisos.filter((a) => !a.leido_en).map((a) => a.id)));

// Tocar un aviso: lo marca como leído y abre la cita.
$('[data-p-bandeja-lista]').addEventListener('click', async (e) => {
  const b = (e.target as Element).closest<HTMLElement>('[data-aviso]');
  const a = b && st.avisos.find((x) => x.id === b.dataset.aviso);
  if (!a) return;
  if (!a.leido_en) marcarLeidos([a.id]);
  if (a.tipo === 'historial_anual' && a.anio) {
    hist.anio = a.anio;
    bandeja.close();
    if (location.hash === '#historial') cargarHistorial();
    else location.hash = 'historial';
    return;
  }
  if (!a.cita_id) return;
  if (!st.citas.has(a.cita_id)) {
    const { data } = await supabase.from('citas').select(CAMPOS_CITA).eq('id', a.cita_id).maybeSingle();
    if (data) recordar([data as unknown as Cita]);
  }
  if (!st.citas.has(a.cita_id)) return;
  bandeja.close();
  verCita(a.cita_id);
});

async function avisoNuevo(id: string) {
  if (st.avisosVistos.has(id)) return;
  st.avisosVistos.add(id);
  const { data } = await supabase.from('avisos').select(CAMPOS_AVISO).eq('id', id).maybeSingle();
  const a = data as unknown as Aviso | null;
  if (!a) return;
  st.avisos = [a, ...st.avisos].slice(0, 40);
  pintarBandeja();
  if (a.tipo === 'historial_anual') {
    toast(`Tu historial ${a.anio} está listo`, true);
    return;
  }
  const resumen = a.citas ? `${a.citas.nombre} · ${resumenCita(a.citas)}` : 'Revisa tu agenda';
  toast(`Nueva cita: ${resumen}`, true);
  sonar();
  if (document.hidden) {
    st.sinLeer++;
    actualizarTitulo();
  }
  if (st.sonido && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(`Nueva cita · ${st.negocio.nombre}`, { body: resumen, icon: '/favicon.svg', tag: id });
  }
  await refrescar();
}

// ─── Tiempo real y respaldo ───────────────────────────────────────────────────
function estadoEnVivo(ok: boolean, texto: string) {
  $$('[data-p-vivo]').forEach((x) => (x.dataset.ok = ok ? 'si' : 'no'));
  $$('[data-p-vivo-texto]').forEach((x) => (x.textContent = texto));
}

let refrescoPendiente: ReturnType<typeof setTimeout> | undefined;
const refrescarPronto = () => {
  clearTimeout(refrescoPendiente);
  refrescoPendiente = setTimeout(refrescar, 400);
};

function conectarTiempoReal() {
  st.canal = supabase
    .channel(`panel-${st.negocioId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'avisos', filter: `negocio_id=eq.${st.negocioId}` }, (p) =>
      avisoNuevo((p.new as Aviso).id),
    )
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'citas', filter: `negocio_id=eq.${st.negocioId}` }, refrescarPronto)
    .subscribe((estado) => {
      if (estado === 'SUBSCRIBED') estadoEnVivo(true, 'En vivo');
      else if (estado === 'CHANNEL_ERROR' || estado === 'TIMED_OUT' || estado === 'CLOSED') estadoEnVivo(false, 'Revisando cada minuto');
    });
}

// Respaldo por si el tiempo real se corta: busca avisos creados desde la última revisión.
async function revisarNuevas() {
  const desde = st.ultimaRevision;
  st.ultimaRevision = new Date().toISOString();
  // Margen de 2 minutos por diferencias de reloj; los repetidos se ignoran.
  const margen = new Date(Date.parse(desde) - 120_000).toISOString();
  const { data } = await supabase.from('avisos').select('id').eq('negocio_id', st.negocioId).gte('creado_en', margen).order('creado_en');
  for (const { id } of data ?? []) await avisoNuevo(id);
}

mostrar('cargando');
arrancar();
