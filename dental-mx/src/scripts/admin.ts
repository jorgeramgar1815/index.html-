/**
 * Panel de la clínica (Supabase Auth + RLS).
 * - Agenda por día o semana, filtros por estado y pendientes resaltadas.
 * - Confirmar / cancelar citas y WhatsApp al paciente.
 * - Bloqueos de días u horas.
 * - Avisos de cita nueva: tiempo real (Supabase Realtime), sonido, notificación del
 *   navegador y título de la pestaña; con consulta periódica de respaldo.
 */
import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import { aInstante, fechaEnZona, horaEnZona, sumarDias, diaSemana, fechaLarga } from './zona';

type Estado = 'pendiente' | 'confirmada' | 'cancelada';
type Cita = {
  id: string; inicio: string; fin: string; nombre: string; telefono: string; nota: string | null;
  estado: Estado; creada_en: string; servicios: { nombre: string } | null;
};
type Bloqueo = { id: string; inicio: string; fin: string; motivo: string | null };

const raiz = document.getElementById('admin')!;
const supabase = createClient(raiz.dataset.url!, raiz.dataset.key!, { auth: { persistSession: true, autoRefreshToken: true } });
const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const CAMPOS_CITA = 'id, inicio, fin, nombre, telefono, nota, estado, creada_en, servicios(nombre)';

const st = {
  negocioId: '',
  negocio: { nombre: 'Dental MX', zona_horaria: 'America/Monterrey', whatsapp: '' },
  vista: 'dia' as 'dia' | 'semana',
  fecha: '',
  filtro: 'todas' as 'todas' | Estado,
  conocidas: new Set<string>(),
  ultimaRevision: new Date().toISOString(),
  canal: null as RealtimeChannel | null,
  avisos: false,
  sinLeer: 0,
};
const zona = () => st.negocio.zona_horaria;
const hoy = () => fechaEnZona(new Date(), zona());

// ─── Acceso ───────────────────────────────────────────────────────────────────
async function arrancar() {
  const { data } = await supabase.auth.getSession();
  if (data.session) await iniciarPanel();
  else mostrarLogin();
}

function mostrarLogin(mensaje?: string) {
  $('#vista-panel').hidden = true;
  $('#vista-login').hidden = false;
  const err = $('#login-error');
  err.hidden = !mensaje;
  err.textContent = mensaje ?? '';
}

$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const boton = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
  const password = (form.elements.namedItem('password') as HTMLInputElement).value;
  if (!email || !password) return mostrarLogin('Escribe tu correo y contraseña.');
  boton.disabled = true;
  boton.textContent = 'Entrando…';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  boton.disabled = false;
  boton.textContent = 'Entrar';
  if (error) return mostrarLogin(error.message.includes('Invalid') ? 'Correo o contraseña incorrectos.' : 'No se pudo entrar. Inténtalo de nuevo.');
  await iniciarPanel();
});

$('#btn-salir').addEventListener('click', async () => {
  st.canal?.unsubscribe();
  await supabase.auth.signOut();
  location.reload();
});

async function iniciarPanel() {
  const { data: admin, error } = await supabase.from('admins').select('negocio_id').limit(1).maybeSingle();
  if (error || !admin) {
    await supabase.auth.signOut();
    return mostrarLogin('Este usuario no tiene una clínica asignada.');
  }
  st.negocioId = admin.negocio_id;
  const { data: negocio } = await supabase.from('negocios').select('nombre, zona_horaria, whatsapp').eq('id', st.negocioId).single();
  if (negocio) st.negocio = negocio;
  st.fecha = hoy();
  $('#negocio-nombre').textContent = st.negocio.nombre;
  $('#vista-login').hidden = true;
  $('#vista-panel').hidden = false;
  try { st.avisos = localStorage.getItem('dmx-avisos') === '1'; } catch { /* sin almacenamiento */ }
  pintarBotonAvisos();
  await Promise.all([cargarAgenda(), cargarPendientes()]);
  conectarTiempoReal();
  setInterval(revisarNuevas, 60_000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      st.sinLeer = 0;
      actualizarTitulo();
      revisarNuevas();
    }
  });
}

// ─── Pestañas, vista y filtros ────────────────────────────────────────────────
document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) =>
  b.addEventListener('click', () => {
    document.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    $('#tab-agenda').hidden = b.dataset.tab !== 'agenda';
    $('#tab-bloqueos').hidden = b.dataset.tab !== 'bloqueos';
    if (b.dataset.tab === 'bloqueos') cargarBloqueos();
  }),
);
document.querySelectorAll<HTMLButtonElement>('[data-vista]').forEach((b) =>
  b.addEventListener('click', () => {
    st.vista = b.dataset.vista as 'dia' | 'semana';
    document.querySelectorAll('[data-vista]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    cargarAgenda();
  }),
);
document.querySelectorAll<HTMLButtonElement>('[data-nav]').forEach((b) =>
  b.addEventListener('click', () => {
    const paso = Number(b.dataset.nav);
    st.fecha = paso === 0 ? hoy() : sumarDias(st.fecha, paso * (st.vista === 'dia' ? 1 : 7));
    cargarAgenda();
  }),
);
document.querySelectorAll<HTMLButtonElement>('[data-filtro]').forEach((b) =>
  b.addEventListener('click', () => {
    st.filtro = b.dataset.filtro as typeof st.filtro;
    document.querySelectorAll('[data-filtro]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    cargarAgenda();
  }),
);

// ─── Agenda ───────────────────────────────────────────────────────────────────
function rango(): [string, string] {
  if (st.vista === 'dia') return [st.fecha, sumarDias(st.fecha, 1)];
  const lunes = sumarDias(st.fecha, -((diaSemana(st.fecha) + 6) % 7));
  return [lunes, sumarDias(lunes, 7)];
}

async function cargarAgenda() {
  const [desde, hasta] = rango();
  $('#rango-titulo').textContent =
    st.vista === 'dia'
      ? `${fechaLarga(desde)}${desde === hoy() ? ' · hoy' : ''}`
      : `Semana del ${fechaLarga(desde, { day: 'numeric', month: 'long' })} al ${fechaLarga(sumarDias(hasta, -1), { day: 'numeric', month: 'long' })}`;
  const lista = $('#lista-citas');
  lista.innerHTML = '<p class="py-6 text-mute">Cargando…</p>';
  let consulta = supabase
    .from('citas')
    .select(CAMPOS_CITA)
    .eq('negocio_id', st.negocioId)
    .gte('inicio', aInstante(desde, '00:00', zona()).toISOString())
    .lt('inicio', aInstante(hasta, '00:00', zona()).toISOString())
    .order('inicio');
  if (st.filtro !== 'todas') consulta = consulta.eq('estado', st.filtro);
  const { data: filas, error } = await consulta;
  const data = (filas ?? []) as unknown as Cita[];
  if (error) {
    lista.innerHTML = `<p class="py-6 text-[#ff9a9a]">No se pudo cargar la agenda. ${esc(error.message)}</p>`;
    return;
  }
  data.forEach((c) => st.conocidas.add(c.id));
  if (!data.length) {
    lista.innerHTML = `<p class="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-mute">Sin citas ${st.filtro === 'todas' ? '' : `${st.filtro}s `}en este ${st.vista === 'dia' ? 'día' : 'rango'}.</p>`;
    return;
  }
  // Agrupa por día.
  const porDia = new Map<string, Cita[]>();
  data.forEach((c) => {
    const f = fechaEnZona(new Date(c.inicio), zona());
    porDia.set(f, [...(porDia.get(f) ?? []), c]);
  });
  lista.innerHTML = [...porDia.entries()]
    .map(
      ([f, citas]) => `
      ${st.vista === 'semana' ? `<h3 class="mt-6 mb-2 text-sm font-semibold tracking-wide text-mute uppercase first:mt-0">${esc(fechaLarga(f))}</h3>` : ''}
      <div class="grid gap-3">${citas.map((c) => tarjetaCita(c)).join('')}</div>`,
    )
    .join('');
}

async function cargarPendientes() {
  const { data: filas } = await supabase
    .from('citas')
    .select(CAMPOS_CITA)
    .eq('negocio_id', st.negocioId)
    .eq('estado', 'pendiente')
    .gte('inicio', new Date().toISOString())
    .order('inicio')
    .limit(20);
  const caja = $('#pendientes');
  const data = filas as unknown as Cita[] | null;
  if (!data?.length) {
    caja.innerHTML = '';
    return;
  }
  data.forEach((c) => st.conocidas.add(c.id));
  caja.innerHTML = `
    <section class="mb-6 rounded-2xl border border-lime/40 bg-lime/[0.06] p-4 sm:p-5" aria-label="Citas por confirmar">
      <p class="font-display font-bold text-white">${data.length} ${data.length === 1 ? 'cita por confirmar' : 'citas por confirmar'}</p>
      <div class="mt-3 grid gap-3">${data.map((c) => tarjetaCita(c, true)).join('')}</div>
    </section>`;
}

function tarjetaCita(c: Cita, conFecha = false) {
  const inicio = new Date(c.inicio);
  const fecha = fechaEnZona(inicio, zona());
  const servicio = c.servicios?.nombre ?? 'Cita';
  const texto =
    c.estado === 'cancelada'
      ? `Hola ${c.nombre.split(' ')[0]}, te escribimos de ${st.negocio.nombre} sobre tu cita de ${servicio}.`
      : `Hola ${c.nombre.split(' ')[0]}, te escribimos de ${st.negocio.nombre} para confirmar tu cita de ${servicio} el ${fechaLarga(fecha)} a las ${horaEnZona(inicio, zona())} h.`;
  const wa = `https://wa.me/52${c.telefono}?text=${encodeURIComponent(texto)}`;
  return `
    <article class="adm-cita" data-estado="${c.estado}" data-id="${c.id}">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="font-display text-lg font-bold text-white tabular-nums">
            ${horaEnZona(inicio, zona())}–${horaEnZona(new Date(c.fin), zona())}
            ${conFecha ? `<span class="ml-1 text-sm font-semibold text-mute first-letter:uppercase">${esc(fechaLarga(fecha, { weekday: 'short', day: 'numeric', month: 'short' }))}</span>` : ''}
          </p>
          <p class="mt-0.5 font-semibold text-snow">${esc(c.nombre)} <span class="font-normal text-mute">· ${esc(servicio)}</span></p>
          <p class="mt-0.5 text-sm text-mute tabular-nums">${esc(c.telefono.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'))}</p>
          ${c.nota ? `<p class="mt-2 rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-snow/85">“${esc(c.nota)}”</p>` : ''}
        </div>
        <span class="adm-badge" data-estado="${c.estado}">${c.estado}</span>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        ${c.estado !== 'confirmada' && c.estado !== 'cancelada' ? `<button type="button" class="adm-accion primaria" data-accion="confirmada" data-id="${c.id}">Confirmar</button>` : ''}
        ${c.estado !== 'cancelada' ? `<button type="button" class="adm-accion" data-accion="cancelada" data-id="${c.id}">Cancelar</button>` : ''}
        <a class="adm-accion" href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </article>`;
}

// Confirmar / cancelar (delegado: sirve para la agenda y para "por confirmar").
document.addEventListener('click', async (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('[data-accion]');
  if (!b) return;
  const nuevo = b.dataset.accion as Estado;
  if (nuevo === 'cancelada' && !confirm('¿Cancelar esta cita? El horario quedará libre para otra persona.')) return;
  b.disabled = true;
  const { error } = await supabase.from('citas').update({ estado: nuevo }).eq('id', b.dataset.id!);
  if (error) {
    b.disabled = false;
    return aviso(`No se pudo actualizar: ${error.message}`);
  }
  aviso(nuevo === 'confirmada' ? 'Cita confirmada' : 'Cita cancelada · el horario quedó libre');
  await Promise.all([cargarAgenda(), cargarPendientes()]);
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
  const desde = campoB('desde').value;
  const hasta = campoB('hasta').value || desde;
  const todoDia = campoB('todo_dia').checked;
  if (!desde) {
    err.hidden = false;
    err.textContent = 'Elige al menos el día de inicio.';
    return;
  }
  const inicio = aInstante(desde, todoDia ? '00:00' : campoB('hora_desde').value, zona());
  const fin = todoDia ? aInstante(sumarDias(hasta, 1), '00:00', zona()) : aInstante(hasta, campoB('hora_hasta').value, zona());
  if (!(fin > inicio)) {
    err.hidden = false;
    err.textContent = 'El fin debe ser después del inicio.';
    return;
  }
  err.hidden = true;
  const { error } = await supabase.from('bloqueos').insert({
    negocio_id: st.negocioId, inicio: inicio.toISOString(), fin: fin.toISOString(), motivo: campoB('motivo').value.trim() || null,
  });
  if (error) {
    err.hidden = false;
    err.textContent = `No se pudo crear: ${error.message}`;
    return;
  }
  formBloqueo.reset();
  campoB('todo_dia').dispatchEvent(new Event('change'));
  aviso('Bloqueo creado');
  cargarBloqueos();
});

async function cargarBloqueos() {
  const lista = $('#lista-bloqueos');
  const { data: filas, error } = await supabase
    .from('bloqueos')
    .select('id, inicio, fin, motivo')
    .eq('negocio_id', st.negocioId)
    .gte('fin', new Date().toISOString())
    .order('inicio');
  const data = (filas ?? []) as Bloqueo[];
  if (error) {
    lista.innerHTML = `<p class="text-[#ff9a9a]">${esc(error.message)}</p>`;
    return;
  }
  if (!data.length) {
    lista.innerHTML = '<p class="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-mute">No hay bloqueos próximos.</p>';
    return;
  }
  lista.innerHTML = `<div class="grid gap-2">${data
    .map((b) => {
      const i = new Date(b.inicio);
      const f = new Date(b.fin);
      const fi = fechaEnZona(i, zona());
      const ff = fechaEnZona(new Date(f.getTime() - 1), zona());
      const diaCompleto = horaEnZona(i, zona()) === '00:00' && horaEnZona(f, zona()) === '00:00';
      const texto = diaCompleto
        ? fi === ff
          ? `${fechaLarga(fi)} · todo el día`
          : `Del ${fechaLarga(fi)} al ${fechaLarga(ff)}`
        : `${fechaLarga(fi)} ${horaEnZona(i, zona())} → ${fi === fechaEnZona(f, zona()) ? '' : `${fechaLarga(fechaEnZona(f, zona()))} `}${horaEnZona(f, zona())}`;
      return `
        <div class="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
          <div class="min-w-0">
            <p class="font-semibold text-snow first-letter:uppercase">${esc(texto)}</p>
            ${b.motivo ? `<p class="text-sm text-mute">${esc(b.motivo)}</p>` : ''}
          </div>
          <button type="button" class="adm-accion" data-borrar-bloqueo="${b.id}">Quitar</button>
        </div>`;
    })
    .join('')}</div>`;
}

document.addEventListener('click', async (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('[data-borrar-bloqueo]');
  if (!b || !confirm('¿Quitar este bloqueo? Esos horarios volverán a estar disponibles.')) return;
  b.disabled = true;
  const { error } = await supabase.from('bloqueos').delete().eq('id', b.dataset.borrarBloqueo!);
  if (error) {
    b.disabled = false;
    return aviso(`No se pudo quitar: ${error.message}`);
  }
  aviso('Bloqueo quitado');
  cargarBloqueos();
});

// ─── Avisos de cita nueva ─────────────────────────────────────────────────────
let audio: AudioContext | null = null;

function pintarBotonAvisos() {
  const b = $('#btn-avisos');
  b.setAttribute('aria-pressed', String(st.avisos));
  b.textContent = st.avisos ? 'Avisos: sí' : 'Avisos: no';
  b.title = st.avisos ? 'Sonido y notificación al llegar una cita nueva' : 'Toca para activar sonido y notificación de citas nuevas';
}

$('#btn-avisos').addEventListener('click', async () => {
  st.avisos = !st.avisos;
  if (st.avisos) {
    audio ??= new AudioContext();
    await audio.resume();
    sonar();
    if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
  }
  try { localStorage.setItem('dmx-avisos', st.avisos ? '1' : '0'); } catch { /* sin almacenamiento */ }
  pintarBotonAvisos();
});

function sonar() {
  if (!st.avisos) return;
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

function aviso(texto: string, destacado = false) {
  const t = document.createElement('div');
  t.className = 'adm-toast';
  t.innerHTML = `<p class="${destacado ? 'font-display font-bold text-lime' : 'text-sm text-snow'}">${esc(texto)}</p>`;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), destacado ? 9000 : 3500);
}

function actualizarTitulo() {
  document.title = `${st.sinLeer ? `(${st.sinLeer}) ` : ''}Panel · ${st.negocio.nombre}`;
}

async function citaNueva(id: string) {
  if (st.conocidas.has(id)) return;
  st.conocidas.add(id);
  const { data: fila } = await supabase.from('citas').select(CAMPOS_CITA).eq('id', id).maybeSingle();
  const c = fila as unknown as Cita | null;
  const resumen = c
    ? `${c.nombre} · ${c.servicios?.nombre ?? 'Cita'} · ${fechaLarga(fechaEnZona(new Date(c.inicio), zona()), { weekday: 'short', day: 'numeric', month: 'short' })} ${horaEnZona(new Date(c.inicio), zona())} h`
    : 'Revisa la agenda';
  aviso(`Nueva cita: ${resumen}`, true);
  sonar();
  if (document.hidden) {
    st.sinLeer++;
    actualizarTitulo();
  }
  if (st.avisos && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('Nueva cita', { body: resumen, icon: '/apple-touch-icon.png', tag: id });
  }
  await Promise.all([cargarAgenda(), cargarPendientes()]);
}

function estadoEnVivo(ok: boolean, texto: string) {
  $('#en-vivo-punto').className = `inline-block size-2 rounded-full ${ok ? 'bg-lime shadow-[0_0_8px_#b5ee3a]' : 'bg-warm'}`;
  $('#en-vivo-texto').textContent = texto;
}

function conectarTiempoReal() {
  st.canal = supabase
    .channel(`citas-${st.negocioId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'citas', filter: `negocio_id=eq.${st.negocioId}` }, (p) => {
      if (p.eventType === 'INSERT') citaNueva((p.new as Cita).id);
      else {
        cargarAgenda();
        cargarPendientes();
      }
    })
    .subscribe((estado) => {
      if (estado === 'SUBSCRIBED') estadoEnVivo(true, 'En vivo');
      else if (estado === 'CHANNEL_ERROR' || estado === 'TIMED_OUT' || estado === 'CLOSED') estadoEnVivo(false, 'Revisando cada minuto');
    });
}

// Respaldo por si el tiempo real se corta: busca citas creadas desde la última revisión.
async function revisarNuevas() {
  const desde = st.ultimaRevision;
  st.ultimaRevision = new Date().toISOString();
  // Margen de 2 minutos por posibles diferencias de reloj; los repetidos se ignoran.
  const margen = new Date(Date.parse(desde) - 120_000).toISOString();
  const { data } = await supabase.from('citas').select('id').eq('negocio_id', st.negocioId).gte('creada_en', margen);
  for (const { id } of data ?? []) await citaNueva(id);
}

arrancar();
