/**
 * Widget de reservación de Dental MX.
 * Flujo: servicio → día y hora → datos → confirmación (+ aviso por WhatsApp).
 * Habla con Supabase sólo mediante las funciones RPC públicas (anon key):
 * datos_reserva, dias_disponibles, horarios_disponibles y crear_cita.
 * Se descarga bajo demanda desde Reservas.astro.
 */
import { fechaEnZona, sumarDias, diaSemana, fechaLarga } from './zona';

type Servicio = { id: string; clave: string; nombre: string; descripcion: string | null; duracion_min: number };
type Datos = { negocio: { nombre: string; whatsapp: string; zona_horaria: string; dias_max: number }; servicios: Servicio[] };
type Hora = { inicio: string; hora: string };
type CitaCreada = { id: string; inicio: string; hora: string; fecha: string; servicio: string; nombre: string; negocio: string; whatsapp: string };

const dialog = document.getElementById('reservas') as HTMLDialogElement;
const cuerpo = dialog.querySelector<HTMLElement>('[data-r-cuerpo]')!;
const titulo = dialog.querySelector<HTMLElement>('[data-r-titulo]')!;
const pasoTxt = dialog.querySelector<HTMLElement>('[data-r-paso]')!;
const progreso = dialog.querySelector<HTMLElement>('[data-r-progreso]')!;
const cfg = {
  url: dialog.dataset.url!,
  key: dialog.dataset.key!,
  slug: dialog.dataset.negocio!,
  wa: dialog.dataset.wa!,
};

const estado: {
  datos: Datos | null;
  servicio: Servicio | null;
  dias: Set<string>;
  fecha: string | null;
  horas: Hora[];
  hora: Hora | null;
  aviso: string | null;
  cita: CitaCreada | null;
  formulario: { nombre: string; telefono: string; nota: string };
} = { datos: null, servicio: null, dias: new Set(), fecha: null, horas: [], hora: null, aviso: null, cita: null, formulario: { nombre: '', telefono: '', nota: '' } };

// ─── API ──────────────────────────────────────────────────────────────────────
class ErrorReserva extends Error {}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const control = new AbortController();
  const tiempo = setTimeout(() => control.abort(), 15000);
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', apikey: cfg.key };
    if (cfg.key.startsWith('eyJ')) headers.Authorization = `Bearer ${cfg.key}`;
    const r = await fetch(`${cfg.url}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(args), signal: control.signal });
    const data = await r.json().catch(() => null);
    if (!r.ok) throw new ErrorReserva((data && (data.message as string)) || 'ERROR_RED');
    return data as T;
  } catch (e) {
    if (e instanceof ErrorReserva) throw e;
    throw new ErrorReserva('ERROR_RED');
  } finally {
    clearTimeout(tiempo);
  }
}

const MENSAJES: Record<string, string> = {
  HORARIO_OCUPADO: 'Alguien acaba de apartar ese horario. Ya actualizamos la lista: elige otro.',
  HORARIO_NO_DISPONIBLE: 'Ese horario ya no está disponible. Ya actualizamos la lista: elige otro.',
  LIMITE_TELEFONO: 'Este teléfono ya tiene 2 citas pendientes. Si necesitas otra o quieres cambiarlas, escríbenos por WhatsApp.',
  LIMITE_DIARIO: 'Por hoy ya no podemos recibir más reservas en línea. Escríbenos por WhatsApp y te ayudamos.',
  TELEFONO_INVALIDO: 'Revisa tu teléfono: deben ser 10 dígitos.',
  NOMBRE_INVALIDO: 'Escribe tu nombre (mínimo 2 letras).',
  NOTA_LARGA: 'La nota es muy larga (máximo 280 caracteres).',
  SERVICIO_INVALIDO: 'Ese servicio ya no está disponible. Elige otro.',
  NEGOCIO_NO_ENCONTRADO: 'Las reservas en línea no están disponibles en este momento.',
  SOLICITUD_INVALIDA: 'No pudimos procesar tu solicitud.',
  ERROR_RED: 'No pudimos conectar. Revisa tu internet e inténtalo de nuevo.',
};
const mensaje = (codigo: string) => MENSAJES[codigo] ?? MENSAJES.ERROR_RED;

// ─── Utilidades de interfaz ───────────────────────────────────────────────────
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const zona = () => estado.datos?.negocio.zona_horaria ?? 'America/Monterrey';
const ICONO_WA =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.37l-.36-.22-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41Z"/></svg>';

function encabezado(paso: number | null, texto: string) {
  pasoTxt.textContent = paso ? `Paso ${paso} de 3` : 'Agenda tu cita';
  titulo.textContent = texto;
  progreso.style.width = `${paso ? (paso / 3) * 100 : 100}%`;
}

function enfocarTitulo() {
  titulo.setAttribute('tabindex', '-1');
  titulo.focus({ preventScroll: true });
  cuerpo.scrollTop = 0;
}

const botonWhatsApp = (texto = 'Escribir por WhatsApp') =>
  `<a href="${esc(cfg.wa)}" target="_blank" rel="noopener" class="btn btn-ghost w-full">${ICONO_WA}<span>${texto}</span></a>`;

function avisoHtml() {
  if (!estado.aviso) return '';
  const html = `<p role="alert" class="mb-4 rounded-xl border border-warm/40 bg-warm/10 px-4 py-3 text-sm text-snow">${esc(estado.aviso)}</p>`;
  estado.aviso = null;
  return html;
}

function cargando(filas = 4) {
  return `<div class="grid gap-3" aria-busy="true"><span class="sr-only">Cargando…</span>${'<div class="r-skeleton h-16"></div>'.repeat(filas)}</div>`;
}

function errorHtml(codigo: string, reintentar: boolean) {
  return `
    <div class="grid gap-4 text-center">
      <p class="text-snow">${esc(mensaje(codigo))}</p>
      ${reintentar ? '<button type="button" class="btn btn-primary w-full" data-r-reintentar>Intentar de nuevo</button>' : ''}
      ${botonWhatsApp('Agendar por WhatsApp')}
    </div>`;
}

// ─── Paso 1: servicio ─────────────────────────────────────────────────────────
function pasoServicio() {
  encabezado(1, 'Elige el servicio');
  const servicios = estado.datos!.servicios;
  cuerpo.innerHTML = `
    ${avisoHtml()}
    <div class="grid gap-2.5" role="list">
      ${servicios
        .map(
          (s) => `
        <button type="button" class="r-opcion" role="listitem" data-r-servicio="${esc(s.id)}" aria-pressed="${estado.servicio?.id === s.id}">
          <span class="min-w-0 flex-1">
            <span class="block font-display font-semibold text-white">${esc(s.nombre)}</span>
            ${s.descripcion ? `<span class="mt-0.5 block text-sm text-mute">${esc(s.descripcion)}</span>` : ''}
          </span>
          <span class="shrink-0 rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-lime">${s.duracion_min} min</span>
        </button>`,
        )
        .join('')}
    </div>`;
  cuerpo.querySelectorAll<HTMLButtonElement>('[data-r-servicio]').forEach((b) =>
    b.addEventListener('click', () => {
      estado.servicio = servicios.find((s) => s.id === b.dataset.rServicio) ?? null;
      estado.fecha = null;
      estado.hora = null;
      pasoFecha();
    }),
  );
  enfocarTitulo();
}

// ─── Paso 2: día y hora ───────────────────────────────────────────────────────
async function pasoFecha(recargar = true) {
  encabezado(2, 'Elige día y hora');
  const s = estado.servicio!;
  const resumen = `
    <div class="mb-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
      <p class="min-w-0 text-sm"><span class="font-semibold text-white">${esc(s.nombre)}</span> <span class="text-mute">· ${s.duracion_min} min</span></p>
      <button type="button" class="shrink-0 text-sm font-semibold text-lime underline-offset-4 hover:underline" data-r-cambiar-servicio>Cambiar</button>
    </div>`;
  const aviso = avisoHtml();
  if (recargar) {
    cuerpo.innerHTML = `${aviso}${resumen}${cargando(3)}`;
    enlazarCambiarServicio();
    try {
      const dias = await rpc<string[]>('dias_disponibles', { p_slug: cfg.slug, p_servicio_id: s.id });
      estado.dias = new Set(dias);
    } catch (e) {
      cuerpo.innerHTML = `${resumen}${errorHtml((e as Error).message, true)}`;
      enlazarCambiarServicio();
      cuerpo.querySelector('[data-r-reintentar]')?.addEventListener('click', () => pasoFecha());
      return;
    }
  }
  if (!estado.fecha || !estado.dias.has(estado.fecha)) estado.fecha = [...estado.dias].sort()[0] ?? null;

  cuerpo.innerHTML = `
    ${aviso}${resumen}
    ${estado.dias.size ? calendarioHtml() : `<p class="rounded-xl border border-line bg-surface px-4 py-6 text-center text-mute">No hay horarios disponibles en los próximos días para este servicio.</p><div class="mt-4">${botonWhatsApp('Agendar por WhatsApp')}</div>`}
    <div class="mt-5" data-r-horas></div>`;
  enlazarCambiarServicio();
  cuerpo.querySelectorAll<HTMLButtonElement>('[data-r-dia]').forEach((b) =>
    b.addEventListener('click', () => {
      estado.fecha = b.dataset.rDia!;
      estado.hora = null;
      cuerpo.querySelectorAll('[data-r-dia]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      cargarHoras().then(() => cuerpo.querySelector('[data-r-horas]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    }),
  );
  enfocarTitulo();
  if (estado.fecha) cargarHoras();
}

function enlazarCambiarServicio() {
  cuerpo.querySelector('[data-r-cambiar-servicio]')?.addEventListener('click', pasoServicio);
}

function calendarioHtml() {
  const hoy = fechaEnZona(new Date(), zona());
  const ultimo = sumarDias(hoy, estado.datos!.negocio.dias_max);
  const semana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  // Agrupa los días por mes; los meses sin ningún día libre no se muestran.
  const meses: { nombre: string; celdas: string[]; libres: number }[] = [];
  for (let f = hoy; f <= ultimo; f = sumarDias(f, 1)) {
    const nombre = fechaLarga(f, { month: 'long', year: 'numeric' });
    let mes = meses.at(-1);
    if (!mes || mes.nombre !== nombre) {
      mes = { nombre, celdas: Array((diaSemana(f) + 6) % 7).fill('<span></span>'), libres: 0 }; // lunes primero
      meses.push(mes);
    }
    const libre = estado.dias.has(f);
    if (libre) mes.libres++;
    mes.celdas.push(
      `<button type="button" class="r-dia" data-r-dia="${f}" ${libre ? '' : 'disabled'} aria-pressed="${estado.fecha === f}" aria-label="${esc(fechaLarga(f))}${libre ? '' : ', sin horarios'}">${Number(f.slice(8))}</button>`,
    );
  }
  const html = meses
    .filter((m) => m.libres)
    .map(
      (m) => `
      <p class="mt-4 mb-2 text-sm font-semibold text-white first:mt-0 first-letter:uppercase">${esc(m.nombre)}</p>
      <div class="mb-1 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-mute" aria-hidden="true">${semana.map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="grid grid-cols-7 gap-1.5">${m.celdas.join('')}</div>`,
    )
    .join('');
  return `<div role="group" aria-label="Elige un día">${html}</div>`;
}

async function cargarHoras() {
  const caja = cuerpo.querySelector<HTMLElement>('[data-r-horas]');
  if (!caja || !estado.fecha) return;
  const fecha = estado.fecha;
  caja.innerHTML = `<p class="mb-3 text-sm font-semibold text-white first-letter:uppercase">${esc(fechaLarga(fecha))}</p><div class="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-busy="true">${'<div class="r-skeleton h-11"></div>'.repeat(8)}</div>`;
  try {
    const horas = await rpc<Hora[]>('horarios_disponibles', { p_slug: cfg.slug, p_servicio_id: estado.servicio!.id, p_fecha: fecha });
    if (estado.fecha !== fecha) return; // el usuario ya eligió otro día
    estado.horas = horas;
  } catch (e) {
    caja.innerHTML = errorHtml((e as Error).message, true);
    caja.querySelector('[data-r-reintentar]')?.addEventListener('click', cargarHoras);
    return;
  }
  const grupo = (nombre: string, lista: Hora[]) =>
    lista.length
      ? `<p class="mt-3 mb-2 text-xs font-semibold tracking-wide text-mute uppercase first:mt-0">${nombre}</p>
         <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">${lista
           .map((h) => `<button type="button" class="r-hora" data-r-hora="${esc(h.inicio)}" aria-pressed="false">${esc(h.hora)}</button>`)
           .join('')}</div>`
      : '';
  const manana = estado.horas.filter((h) => h.hora < '14:00');
  const tarde = estado.horas.filter((h) => h.hora >= '14:00');
  caja.innerHTML = `
    <p class="mb-1 text-sm font-semibold text-white first-letter:uppercase">${esc(fechaLarga(fecha))}</p>
    ${
      estado.horas.length
        ? `<div role="group" aria-label="Elige una hora">${grupo('Mañana', manana)}${grupo('Tarde', tarde)}</div>`
        : '<p class="rounded-xl border border-line bg-surface px-4 py-5 text-center text-mute">Sin horarios disponibles este día. Elige otro día.</p>'
    }`;
  caja.querySelectorAll<HTMLButtonElement>('[data-r-hora]').forEach((b) =>
    b.addEventListener('click', () => {
      estado.hora = estado.horas.find((h) => h.inicio === b.dataset.rHora) ?? null;
      pasoDatos();
    }),
  );
}

// ─── Paso 3: datos del paciente ───────────────────────────────────────────────
function pasoDatos() {
  encabezado(3, 'Tus datos');
  const { servicio, fecha, hora, formulario } = estado;
  cuerpo.innerHTML = `
    ${avisoHtml()}
    <div class="mb-5 rounded-xl border border-lime/30 bg-lime/5 px-4 py-3">
      <p class="font-display font-semibold text-white">${esc(servicio!.nombre)}</p>
      <p class="mt-0.5 text-sm text-snow/80"><span class="first-letter:uppercase">${esc(fechaLarga(fecha!))}</span> · ${esc(hora!.hora)} h</p>
      <button type="button" class="mt-1 text-sm font-semibold text-lime underline-offset-4 hover:underline" data-r-cambiar-hora>Cambiar día u hora</button>
    </div>
    <form class="grid gap-4" novalidate data-r-form>
      <label class="r-campo"><span>Nombre completo</span>
        <input name="nombre" autocomplete="name" required minlength="2" maxlength="80" value="${esc(formulario.nombre)}" />
      </label>
      <label class="r-campo"><span>Teléfono (10 dígitos)</span>
        <input name="telefono" type="tel" inputmode="numeric" autocomplete="tel-national" required maxlength="16" placeholder="871 123 4567" value="${esc(formulario.telefono)}" />
      </label>
      <label class="r-campo"><span>Nota <span class="inline font-normal text-mute">(opcional)</span></span>
        <textarea name="nota" rows="2" maxlength="280" placeholder="Ej. tengo dolor en una muela">${esc(formulario.nota)}</textarea>
      </label>
      <label class="r-trampa" aria-hidden="true">Sitio web <input name="sitio_web" tabindex="-1" autocomplete="off" /></label>
      <p class="text-sm text-[#ff9a9a]" role="alert" data-r-error hidden></p>
      <button type="submit" class="btn btn-primary btn-lg w-full" data-r-enviar>Confirmar cita</button>
      <p class="text-center text-xs text-mute">Al confirmar aceptas el <a href="/aviso-de-privacidad" target="_blank" class="text-snow underline underline-offset-2">aviso de privacidad</a>. Sólo usamos tus datos para tu cita.</p>
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
  enfocarTitulo();
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
  const nombre = campo('nombre').value.trim();
  const telefono = normalizarTelefono(campo('telefono').value);
  const mostrarError = (texto: string, input?: HTMLInputElement) => {
    error.textContent = texto;
    error.hidden = false;
    form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    }
  };
  if (nombre.length < 2) return mostrarError(MENSAJES.NOMBRE_INVALIDO, campo('nombre'));
  if (!/^\d{10}$/.test(telefono)) return mostrarError(MENSAJES.TELEFONO_INVALIDO, campo('telefono'));

  boton.disabled = true;
  boton.textContent = 'Agendando…';
  try {
    estado.cita = await rpc<CitaCreada>('crear_cita', {
      p_slug: cfg.slug,
      p_servicio_id: estado.servicio!.id,
      p_inicio: estado.hora!.inicio,
      p_nombre: nombre,
      p_telefono: telefono,
      p_nota: campo('nota').value.trim() || null,
      p_trampa: campo('sitio_web').value || null,
    });
    pasoExito();
  } catch (e) {
    const codigo = (e as Error).message;
    boton.disabled = false;
    boton.textContent = 'Confirmar cita';
    if (codigo === 'HORARIO_OCUPADO' || codigo === 'HORARIO_NO_DISPONIBLE') {
      estado.aviso = mensaje(codigo);
      estado.hora = null;
      pasoFecha(true);
    } else if (codigo === 'TELEFONO_INVALIDO') {
      mostrarError(mensaje(codigo), campo('telefono'));
    } else if (codigo === 'NOMBRE_INVALIDO') {
      mostrarError(mensaje(codigo), campo('nombre'));
    } else {
      mostrarError(mensaje(codigo));
      if ((codigo === 'LIMITE_TELEFONO' || codigo === 'LIMITE_DIARIO') && !form.querySelector('[data-r-wa-extra]')) {
        error.insertAdjacentHTML('afterend', `<div data-r-wa-extra>${botonWhatsApp()}</div>`);
      }
    }
  }
}

// ─── Confirmación ─────────────────────────────────────────────────────────────
function pasoExito() {
  const c = estado.cita!;
  encabezado(null, '¡Cita registrada!');
  const texto = `Hola, acabo de agendar una cita en línea en ${c.negocio}: ${c.servicio}, ${fechaLarga(c.fecha)} a las ${c.hora} h. A nombre de ${c.nombre}.`;
  const wa = `https://wa.me/${encodeURIComponent(c.whatsapp)}?text=${encodeURIComponent(texto)}`;
  cuerpo.innerHTML = `
    <div class="grid gap-5 text-center">
      <div class="mx-auto grid size-16 place-items-center rounded-full bg-lime text-ink shadow-[0_0_40px_-6px_rgb(181_238_58/0.7)]">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
      </div>
      <div>
        <p class="font-display text-lg font-semibold text-white">Listo, ${esc(c.nombre.split(' ')[0])}.</p>
        <p class="mt-1 text-sm text-mute">Tu cita quedó registrada. La clínica te confirmará por WhatsApp.</p>
      </div>
      <dl class="grid gap-2 rounded-xl border border-line bg-surface px-4 py-4 text-left text-sm">
        <div class="flex justify-between gap-4"><dt class="text-mute">Servicio</dt><dd class="text-right font-semibold text-white">${esc(c.servicio)}</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-mute">Día</dt><dd class="text-right font-semibold text-white first-letter:uppercase">${esc(fechaLarga(c.fecha))}</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-mute">Hora</dt><dd class="text-right font-semibold text-white">${esc(c.hora)} h</dd></div>
      </dl>
      <a href="${esc(wa)}" target="_blank" rel="noopener" class="btn btn-primary btn-lg w-full">${ICONO_WA}<span>Avisar por WhatsApp</span></a>
      <button type="button" class="btn btn-ghost w-full" data-r-listo>Cerrar</button>
    </div>`;
  cuerpo.querySelector('[data-r-listo]')!.addEventListener('click', cerrar);
  enfocarTitulo();
}

// ─── Abrir / cerrar ───────────────────────────────────────────────────────────
function reiniciar() {
  Object.assign(estado, { servicio: null, fecha: null, horas: [], hora: null, aviso: null, cita: null });
  estado.formulario = { nombre: '', telefono: '', nota: '' };
}

function cerrar() {
  dialog.close();
}

dialog.addEventListener('close', () => {
  document.documentElement.classList.remove('reservas-abierto');
  if (estado.cita) reiniciar();
});
dialog.querySelector('[data-r-cerrar]')!.addEventListener('click', cerrar);
// Tocar fuera del panel cierra.
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) cerrar();
});

export async function abrirReservas(clave?: string) {
  if (!dialog.open) {
    dialog.showModal();
    document.documentElement.classList.add('reservas-abierto');
  }
  if (!estado.datos) {
    encabezado(1, 'Elige el servicio');
    cuerpo.innerHTML = cargando(5);
    try {
      estado.datos = await rpc<Datos>('datos_reserva', { p_slug: cfg.slug });
    } catch (e) {
      cuerpo.innerHTML = errorHtml((e as Error).message, true);
      cuerpo.querySelector('[data-r-reintentar]')?.addEventListener('click', () => abrirReservas(clave));
      return;
    }
  }
  const elegido = clave ? estado.datos.servicios.find((s) => s.clave === clave) : null;
  if (elegido) {
    if (estado.servicio?.id !== elegido.id) {
      estado.servicio = elegido;
      estado.fecha = null;
      estado.hora = null;
    }
    pasoFecha();
  } else if (estado.servicio && estado.hora) {
    pasoDatos();
  } else if (estado.servicio) {
    pasoFecha();
  } else {
    pasoServicio();
  }
}
