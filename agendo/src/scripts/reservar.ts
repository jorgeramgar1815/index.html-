/**
 * Agendo · página pública de reservas.
 * Flujo: servicio → día y hora → datos → confirmación (+ aviso por WhatsApp al negocio).
 * Usa sólo las funciones RPC públicas: datos_reserva, dias_disponibles,
 * horarios_disponibles y crear_cita.
 */
import { crearRpc, mensaje, MENSAJES, esc, iniciales } from './api';
import { fechaEnZona, sumarDias, diaSemana, fechaLarga } from './zona';

type Servicio = { id: string; clave: string; nombre: string; descripcion: string | null; duracion_min: number };
type Negocio = { nombre: string; giro: string | null; direccion: string | null; whatsapp: string; zona_horaria: string; dias_max: number };
type Datos = { negocio: Negocio; servicios: Servicio[] };
type Hora = { inicio: string; hora: string };
type CitaCreada = { id: string; inicio: string; hora: string; fecha: string; servicio: string; nombre: string; negocio: string; whatsapp: string };

const raiz = document.getElementById('reservar')!;
const rpc = crearRpc(raiz.dataset.url!, raiz.dataset.key!);
const $ = <T extends HTMLElement = HTMLElement>(sel: string) => raiz.querySelector<T>(sel)!;
const cuerpo = $('[data-r-cuerpo]');
const titulo = $('[data-r-titulo]');
const subtitulo = $('[data-r-subtitulo]');

// El negocio viene en la ruta (/dental-mx) o en ?n=dental-mx.
const slug = (() => {
  const q = new URLSearchParams(location.search).get('n');
  if (q) return q;
  const seg = location.pathname.split('/').filter(Boolean)[0];
  return seg && seg !== 'reservar' ? seg : '';
})();

const st: {
  datos: Datos | null; servicio: Servicio | null; dias: Set<string>; fecha: string | null; horas: Hora[]; hora: Hora | null;
  aviso: string | null; formulario: { nombre: string; telefono: string; nota: string };
} = { datos: null, servicio: null, dias: new Set(), fecha: null, horas: [], hora: null, aviso: null, formulario: { nombre: '', telefono: '', nota: '' } };

const zona = () => st.datos?.negocio.zona_horaria ?? 'America/Monterrey';
const waNegocio = (texto = 'Hola, tengo una duda sobre mi cita.') =>
  st.datos ? `https://wa.me/${encodeURIComponent(st.datos.negocio.whatsapp)}?text=${encodeURIComponent(texto)}` : '#';

const ICONO_WA =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.37l-.36-.22-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41Z"/></svg>';
const ICONO_RELOJ =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

// ─── Encabezado, pasos y resumen ──────────────────────────────────────────────
function pintarNegocio() {
  const n = st.datos!.negocio;
  document.title = `Reservar en ${n.nombre} · Agendo`;
  $('[data-r-negocio]').innerHTML = `
    <div class="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-marca to-violet-500 text-lg font-bold text-white shadow-[0_8px_20px_-8px_rgb(79_70_229/0.7)]">${esc(iniciales(n.nombre))}</div>
    <div class="min-w-0">
      <p class="truncate text-lg font-bold tracking-tight text-texto sm:text-xl">${esc(n.nombre)}</p>
      <p class="mt-0.5 text-sm text-suave">${[n.giro, n.direccion].filter(Boolean).map((x) => esc(x!)).join(' · ') || 'Reserva tu cita en línea'}</p>
    </div>`;
}

function pasos(actual: number | null) {
  raiz.querySelectorAll<HTMLElement>('[data-paso]').forEach((li) => {
    const n = Number(li.dataset.paso);
    li.toggleAttribute('data-actual', n === actual);
    li.toggleAttribute('data-hecho', actual === null || n < actual);
    if (n === actual) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
  });
}

function encabezado(paso: number | null, t: string, sub: string) {
  pasos(paso);
  titulo.textContent = t;
  subtitulo.textContent = sub;
  titulo.focus({ preventScroll: true });
  if (window.innerWidth < 1024) titulo.scrollIntoView({ block: 'nearest' });
}

function resumen() {
  const set = (k: string, v: string) => (raiz.querySelector(`[data-r-res="${k}"]`)!.textContent = v);
  set('servicio', st.servicio ? `${st.servicio.nombre} · ${st.servicio.duracion_min} min` : '—');
  set('dia', st.fecha && st.hora ? fechaLarga(st.fecha) : st.fecha ? fechaLarga(st.fecha) : '—');
  set('hora', st.hora ? `${st.hora.hora} h` : '—');
}

const cargando = (n = 4, alto = 'h-[4.5rem]') => `<div class="grid gap-3" aria-busy="true"><span class="sr-only">Cargando…</span>${`<div class="esqueleto ${alto}"></div>`.repeat(n)}</div>`;

function avisoHtml() {
  if (!st.aviso) return '';
  const h = `<p role="alert" class="mb-4 rounded-xl border border-amber-200 bg-pendiente-50 px-4 py-3 text-sm font-medium text-pendiente">${esc(st.aviso)}</p>`;
  st.aviso = null;
  return h;
}

function errorHtml(codigo: string, reintentar: boolean) {
  return `
    <div class="grid gap-3 text-center">
      <p class="text-suave">${esc(mensaje(codigo))}</p>
      ${reintentar ? '<button type="button" class="btn btn-primario w-full" data-r-reintentar>Intentar de nuevo</button>' : ''}
      ${st.datos ? `<a href="${esc(waNegocio('Hola, quiero agendar una cita.'))}" target="_blank" rel="noopener" class="btn btn-secundario w-full">${ICONO_WA}Escribir por WhatsApp</a>` : ''}
    </div>`;
}

// ─── Paso 1: servicio ─────────────────────────────────────────────────────────
function pasoServicio() {
  encabezado(1, 'Elige el servicio', '¿Qué necesitas?');
  resumen();
  cuerpo.innerHTML = `${avisoHtml()}<div class="grid gap-2.5 aparecer">
    ${st.datos!.servicios
      .map(
        (s) => `
      <button type="button" class="r-opcion" data-r-servicio="${esc(s.id)}" aria-pressed="${st.servicio?.id === s.id}">
        <span class="min-w-0 flex-1">
          <span class="block font-semibold text-texto">${esc(s.nombre)}</span>
          ${s.descripcion ? `<span class="mt-0.5 block text-sm text-suave">${esc(s.descripcion)}</span>` : ''}
        </span>
        <span class="inline-flex shrink-0 items-center gap-1 rounded-full bg-fondo px-2.5 py-1 text-xs font-semibold text-suave">${ICONO_RELOJ}${s.duracion_min} min</span>
      </button>`,
      )
      .join('')}
  </div>`;
  cuerpo.querySelectorAll<HTMLButtonElement>('[data-r-servicio]').forEach((b) =>
    b.addEventListener('click', () => {
      st.servicio = st.datos!.servicios.find((s) => s.id === b.dataset.rServicio) ?? null;
      st.fecha = null;
      st.hora = null;
      pasoFecha();
    }),
  );
}

// ─── Paso 2: día y hora ───────────────────────────────────────────────────────
function barraServicio() {
  const s = st.servicio!;
  return `
    <div class="mb-5 flex items-center justify-between gap-3 rounded-xl bg-fondo px-4 py-3">
      <p class="min-w-0 text-sm"><span class="font-semibold text-texto">${esc(s.nombre)}</span> <span class="text-suave">· ${s.duracion_min} min</span></p>
      <button type="button" class="shrink-0 text-sm font-semibold text-marca hover:underline" data-r-cambiar-servicio>Cambiar</button>
    </div>`;
}

async function pasoFecha(recargar = true) {
  encabezado(2, 'Elige día y hora', 'Sólo mostramos los horarios libres.');
  resumen();
  const aviso = avisoHtml();
  const enlazar = () => cuerpo.querySelector('[data-r-cambiar-servicio]')?.addEventListener('click', pasoServicio);
  if (recargar) {
    cuerpo.innerHTML = `${aviso}${barraServicio()}${cargando(3, 'h-12')}`;
    enlazar();
    try {
      st.dias = new Set(await rpc<string[]>('dias_disponibles', { p_slug: slug, p_servicio_id: st.servicio!.id }));
    } catch (e) {
      cuerpo.innerHTML = `${barraServicio()}${errorHtml((e as Error).message, true)}`;
      enlazar();
      cuerpo.querySelector('[data-r-reintentar]')?.addEventListener('click', () => pasoFecha());
      return;
    }
  }
  if (!st.fecha || !st.dias.has(st.fecha)) st.fecha = [...st.dias].sort()[0] ?? null;
  resumen();
  cuerpo.innerHTML = `
    ${aviso}${barraServicio()}
    <div class="grid gap-6 aparecer md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>${st.dias.size ? calendarioHtml() : '<p class="rounded-xl bg-fondo px-4 py-6 text-center text-suave">No hay horarios disponibles en los próximos días para este servicio.</p>'}</div>
      <div data-r-horas></div>
    </div>`;
  enlazar();
  cuerpo.querySelectorAll<HTMLButtonElement>('[data-r-dia]').forEach((b) =>
    b.addEventListener('click', () => {
      st.fecha = b.dataset.rDia!;
      st.hora = null;
      cuerpo.querySelectorAll('[data-r-dia]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      resumen();
      cargarHoras().then(() => {
        if (window.innerWidth < 768) cuerpo.querySelector('[data-r-horas]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }),
  );
  if (st.fecha) cargarHoras();
}

function calendarioHtml() {
  const hoy = fechaEnZona(new Date(), zona());
  const ultimo = sumarDias(hoy, st.datos!.negocio.dias_max);
  const semana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const meses: { nombre: string; celdas: string[]; libres: number }[] = [];
  for (let f = hoy; f <= ultimo; f = sumarDias(f, 1)) {
    const nombre = fechaLarga(f, { month: 'long', year: 'numeric' });
    let mes = meses.at(-1);
    if (!mes || mes.nombre !== nombre) {
      mes = { nombre, celdas: Array((diaSemana(f) + 6) % 7).fill('<span></span>'), libres: 0 };
      meses.push(mes);
    }
    const libre = st.dias.has(f);
    if (libre) mes.libres++;
    mes.celdas.push(
      `<button type="button" class="r-dia" data-r-dia="${f}" ${libre ? '' : 'disabled'} aria-pressed="${st.fecha === f}" aria-label="${esc(fechaLarga(f))}${libre ? '' : ', sin horarios'}">${Number(f.slice(8))}</button>`,
    );
  }
  return `<div role="group" aria-label="Elige un día">${meses
    .filter((m) => m.libres)
    .map(
      (m) => `
      <p class="mb-2 mt-5 text-sm font-bold text-texto first:mt-0 first-letter:uppercase">${esc(m.nombre)}</p>
      <div class="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-tenue" aria-hidden="true">${semana.map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="grid grid-cols-7 gap-1">${m.celdas.join('')}</div>`,
    )
    .join('')}</div>`;
}

async function cargarHoras() {
  const caja = cuerpo.querySelector<HTMLElement>('[data-r-horas]');
  if (!caja || !st.fecha) return;
  const fecha = st.fecha;
  const titular = `<p class="mb-3 text-sm font-bold text-texto first-letter:uppercase">${esc(fechaLarga(fecha))}</p>`;
  caja.innerHTML = `${titular}<div class="grid grid-cols-3 gap-2" aria-busy="true">${'<div class="esqueleto h-11"></div>'.repeat(9)}</div>`;
  try {
    const horas = await rpc<Hora[]>('horarios_disponibles', { p_slug: slug, p_servicio_id: st.servicio!.id, p_fecha: fecha });
    if (st.fecha !== fecha) return;
    st.horas = horas;
  } catch (e) {
    caja.innerHTML = errorHtml((e as Error).message, true);
    caja.querySelector('[data-r-reintentar]')?.addEventListener('click', cargarHoras);
    return;
  }
  const grupo = (nombre: string, lista: Hora[]) =>
    lista.length
      ? `<p class="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-tenue first:mt-0">${nombre}</p>
         <div class="grid grid-cols-3 gap-2">${lista.map((h) => `<button type="button" class="r-hora" data-r-hora="${esc(h.inicio)}" aria-pressed="false">${esc(h.hora)}</button>`).join('')}</div>`
      : '';
  caja.innerHTML = `${titular}${
    st.horas.length
      ? `<div role="group" aria-label="Elige una hora" class="aparecer">${grupo('Mañana', st.horas.filter((h) => h.hora < '14:00'))}${grupo('Tarde', st.horas.filter((h) => h.hora >= '14:00'))}</div>`
      : '<p class="rounded-xl bg-fondo px-4 py-6 text-center text-sm text-suave">Sin horarios libres este día. Elige otro.</p>'
  }`;
  caja.querySelectorAll<HTMLButtonElement>('[data-r-hora]').forEach((b) =>
    b.addEventListener('click', () => {
      st.hora = st.horas.find((h) => h.inicio === b.dataset.rHora) ?? null;
      pasoDatos();
    }),
  );
}

// ─── Paso 3: datos ────────────────────────────────────────────────────────────
function pasoDatos() {
  encabezado(3, 'Tus datos', 'Sólo los necesarios para tu cita.');
  resumen();
  const { servicio, fecha, hora, formulario } = st;
  cuerpo.innerHTML = `
    ${avisoHtml()}
    <div class="mb-5 flex items-start justify-between gap-3 rounded-xl border border-marca-100 bg-marca-50 px-4 py-3 aparecer">
      <div class="min-w-0">
        <p class="font-semibold text-texto">${esc(servicio!.nombre)}</p>
        <p class="mt-0.5 text-sm text-suave"><span class="inline-block first-letter:uppercase">${esc(fechaLarga(fecha!))}</span> · ${esc(hora!.hora)} h</p>
      </div>
      <button type="button" class="shrink-0 text-sm font-semibold text-marca hover:underline" data-r-cambiar-hora>Cambiar</button>
    </div>
    <form class="grid gap-4 aparecer" novalidate data-r-form>
      <label class="campo"><span>Nombre completo</span>
        <input name="nombre" autocomplete="name" required minlength="2" maxlength="80" value="${esc(formulario.nombre)}" />
      </label>
      <label class="campo"><span>Teléfono (10 dígitos)</span>
        <input name="telefono" type="tel" inputmode="numeric" autocomplete="tel-national" required maxlength="16" placeholder="871 123 4567" value="${esc(formulario.telefono)}" />
      </label>
      <label class="campo"><span>Nota <span class="inline font-normal text-tenue">(opcional)</span></span>
        <textarea name="nota" rows="2" maxlength="280" placeholder="Algo que debamos saber">${esc(formulario.nota)}</textarea>
      </label>
      <label class="r-trampa" aria-hidden="true">Sitio web <input name="sitio_web" tabindex="-1" autocomplete="off" /></label>
      <p class="text-sm font-medium text-peligro" role="alert" data-r-error hidden></p>
      <button type="submit" class="btn btn-primario btn-lg w-full" data-r-enviar>Confirmar cita</button>
      <p class="text-center text-xs text-tenue">Tus datos sólo se usan para tu cita y se comparten únicamente con ${esc(st.datos!.negocio.nombre)}.</p>
    </form>`;
  cuerpo.querySelector('[data-r-cambiar-hora]')!.addEventListener('click', () => pasoFecha(false));
  const form = cuerpo.querySelector<HTMLFormElement>('[data-r-form]')!;
  form.addEventListener('input', () => {
    formulario.nombre = (form.elements.namedItem('nombre') as HTMLInputElement).value;
    formulario.telefono = (form.elements.namedItem('telefono') as HTMLInputElement).value;
    formulario.nota = (form.elements.namedItem('nota') as HTMLTextAreaElement).value;
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    enviar(form);
  });
}

function normalizarTelefono(t: string) {
  let d = t.replace(/\D/g, '');
  if (d.length === 13 && d.startsWith('521')) d = d.slice(3);
  else if (d.length === 12 && d.startsWith('52')) d = d.slice(2);
  return d;
}

async function enviar(form: HTMLFormElement) {
  const campo = (n: string) => form.elements.namedItem(n) as HTMLInputElement;
  const error = form.querySelector<HTMLElement>('[data-r-error]')!;
  const boton = form.querySelector<HTMLButtonElement>('[data-r-enviar]')!;
  const mostrar = (texto: string, input?: HTMLInputElement) => {
    error.textContent = texto;
    error.hidden = false;
    form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    }
  };
  const nombre = campo('nombre').value.trim();
  const telefono = normalizarTelefono(campo('telefono').value);
  if (nombre.length < 2) return mostrar(MENSAJES.NOMBRE_INVALIDO, campo('nombre'));
  if (!/^\d{10}$/.test(telefono)) return mostrar(MENSAJES.TELEFONO_INVALIDO, campo('telefono'));

  boton.disabled = true;
  boton.textContent = 'Agendando…';
  try {
    const cita = await rpc<CitaCreada>('crear_cita', {
      p_slug: slug,
      p_servicio_id: st.servicio!.id,
      p_inicio: st.hora!.inicio,
      p_nombre: nombre,
      p_telefono: telefono,
      p_nota: campo('nota').value.trim() || null,
      p_trampa: campo('sitio_web').value || null,
    });
    pasoExito(cita);
  } catch (e) {
    const codigo = (e as Error).message;
    boton.disabled = false;
    boton.textContent = 'Confirmar cita';
    if (codigo === 'HORARIO_OCUPADO' || codigo === 'HORARIO_NO_DISPONIBLE') {
      st.aviso = mensaje(codigo);
      st.hora = null;
      pasoFecha(true);
    } else if (codigo === 'TELEFONO_INVALIDO') mostrar(mensaje(codigo), campo('telefono'));
    else if (codigo === 'NOMBRE_INVALIDO') mostrar(mensaje(codigo), campo('nombre'));
    else {
      mostrar(mensaje(codigo));
      if ((codigo === 'LIMITE_TELEFONO' || codigo === 'LIMITE_DIARIO') && !form.querySelector('[data-r-wa-extra]')) {
        error.insertAdjacentHTML('afterend', `<a data-r-wa-extra href="${esc(waNegocio())}" target="_blank" rel="noopener" class="btn btn-secundario w-full">${ICONO_WA}Escribir por WhatsApp</a>`);
      }
    }
  }
}

// ─── Confirmación ─────────────────────────────────────────────────────────────
function pasoExito(c: CitaCreada) {
  encabezado(null, '¡Cita registrada!', `${c.negocio} te confirmará por WhatsApp.`);
  const texto = `Hola, acabo de agendar en línea: ${c.servicio}, ${fechaLarga(c.fecha)} a las ${c.hora} h. A nombre de ${c.nombre}.`;
  cuerpo.innerHTML = `
    <div class="grid gap-5 text-center aparecer">
      <div class="mx-auto grid size-16 place-items-center rounded-full bg-confirmada-50 text-confirmada ring-8 ring-confirmada-50/60">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
      </div>
      <p class="text-lg font-bold text-texto">Listo, ${esc(c.nombre.split(' ')[0]!)}.</p>
      <dl class="grid gap-2.5 rounded-xl bg-fondo px-4 py-4 text-left text-sm">
        <div class="flex justify-between gap-4"><dt class="text-suave">Negocio</dt><dd class="text-right font-semibold">${esc(c.negocio)}</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-suave">Servicio</dt><dd class="text-right font-semibold">${esc(c.servicio)}</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-suave">Día</dt><dd class="text-right font-semibold first-letter:uppercase">${esc(fechaLarga(c.fecha))}</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-suave">Hora</dt><dd class="text-right font-semibold">${esc(c.hora)} h</dd></div>
      </dl>
      <a href="https://wa.me/${encodeURIComponent(c.whatsapp)}?text=${encodeURIComponent(texto)}" target="_blank" rel="noopener" class="btn btn-exito btn-lg w-full">${ICONO_WA}Avisar por WhatsApp</a>
      <button type="button" class="btn btn-sutil w-full" data-r-otra>Agendar otra cita</button>
    </div>`;
  cuerpo.querySelector('[data-r-otra]')!.addEventListener('click', () => {
    Object.assign(st, { servicio: null, fecha: null, hora: null });
    st.formulario = { nombre: '', telefono: '', nota: '' };
    pasoServicio();
  });
  resumen();
}

// ─── Inicio ───────────────────────────────────────────────────────────────────
async function iniciar() {
  if (!slug) {
    $('[data-r-negocio]').innerHTML = '<p class="text-suave">Este enlace no indica un negocio.</p>';
    cuerpo.innerHTML = errorHtml('NEGOCIO_NO_ENCONTRADO', false);
    return;
  }
  try {
    st.datos = await rpc<Datos>('datos_reserva', { p_slug: slug });
  } catch (e) {
    $('[data-r-negocio]').innerHTML = '<p class="text-suave">No pudimos cargar el negocio.</p>';
    cuerpo.innerHTML = errorHtml((e as Error).message, (e as Error).message === 'ERROR_RED');
    cuerpo.querySelector('[data-r-reintentar]')?.addEventListener('click', iniciar);
    return;
  }
  pintarNegocio();
  // Preselección: /dental-mx?servicio=ortodoncia
  const clave = new URLSearchParams(location.search).get('servicio');
  const elegido = clave ? st.datos.servicios.find((s) => s.clave === clave) : null;
  if (elegido) {
    st.servicio = elegido;
    pasoFecha();
  } else pasoServicio();
}

iniciar();
