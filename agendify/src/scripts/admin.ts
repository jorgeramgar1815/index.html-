/**
 * Agendify · panel de negocios (superadmin).
 * Todo pasa por funciones de la base de datos que verifican que el usuario sea superadmin:
 * resumen_negocios, crear_negocio, editar_negocio y cambiar_clave_negocio.
 */
import { createClient } from '@supabase/supabase-js';
import { esc, iniciales } from './api';
import { icono, ICONO_WA } from './iconos';
import { editorHorario, activarHorario, leerHorario, opcionesDuracion, HORARIO_BASE } from './horario';

type Negocio = {
  id: string; slug: string; nombre: string; giro: string | null; direccion: string | null; whatsapp: string; activo: boolean;
  creado_en: string; usuario: string | null; citas_mes: number; por_confirmar: number; proxima_cita: string | null;
};

const raiz = document.getElementById('admin');
if (!raiz) throw new Error('Panel sin configurar');
const supabase = createClient(raiz.dataset.url!, raiz.dataset.key!, { auth: { persistSession: true, autoRefreshToken: true } });
const $ = <T extends HTMLElement = HTMLElement>(sel: string, base: ParentNode = document) => base.querySelector<T>(sel)!;
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, base: ParentNode = document) => [...base.querySelectorAll<T>(sel)];
const dialogo = $<HTMLDialogElement>('#a-dialogo');
const caja = $('[data-a-dialogo]');
let negocios: Negocio[] = [];

const ERRORES: Record<string, string> = {
  NO_AUTORIZADO: 'Esta cuenta no tiene permiso para administrar negocios.',
  ENLACE_INVALIDO: 'El enlace sólo puede tener letras minúsculas, números y guiones (2 a 40), y no puede ser una palabra reservada.',
  ENLACE_OCUPADO: 'Ese enlace ya lo usa otro negocio. Elige otro.',
  NOMBRE_INVALIDO: 'Escribe el nombre del negocio.',
  WHATSAPP_INVALIDO: 'El WhatsApp debe tener 10 dígitos.',
  CORREO_INVALIDO: 'Revisa el correo.',
  CORREO_OCUPADO: 'Ese correo ya tiene una cuenta. Usa otro.',
  CLAVE_CORTA: 'La contraseña debe tener al menos 8 caracteres.',
  SERVICIOS_VACIOS: 'Agrega al menos un servicio.',
  SIN_USUARIO: 'Este negocio no tiene un usuario de panel.',
  DATOS_INVALIDOS: 'Hay datos que no son válidos (revisa horarios y duraciones).',
};
const mensajeError = (e: { message: string }) => ERRORES[e.message] ?? `Algo salió mal: ${e.message}`;
const soloDigitos = (t: string) => {
  let d = t.replace(/\D/g, '');
  if (d.length === 13 && d.startsWith('521')) d = d.slice(3);
  else if (d.length === 12 && d.startsWith('52')) d = d.slice(2);
  return d;
};
const telefonoBonito = (t: string) => soloDigitos(t).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
const enlaceDe = (slug: string) => `${location.origin}/${slug}`;
const dominio = location.host;
const slugDe = (nombre: string) =>
  nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

function generarClave() {
  const letras = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = crypto.getRandomValues(new Uint32Array(12));
  const s = [...r].map((n) => letras[n % letras.length]).join('');
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}

function toast(texto: string) {
  const t = document.createElement('div');
  t.className = 'p-toast';
  t.setAttribute('role', 'status');
  t.innerHTML = `${icono('check', 18)}<span>${esc(texto)}</span>`;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 3500);
}

async function copiar(texto: string, aviso = 'Copiado') {
  try {
    await navigator.clipboard.writeText(texto);
    toast(aviso);
  } catch {
    prompt('Copia el texto:', texto);
  }
}

// ─── Acceso ───────────────────────────────────────────────────────────────────
function mostrar(vista: 'cargando' | 'login' | 'panel') {
  $('#a-cargando').hidden = vista !== 'cargando';
  $('#a-login').hidden = vista !== 'login';
  $('#a-panel').hidden = vista !== 'panel';
}
function errorLogin(texto?: string) {
  mostrar('login');
  const e = $('#a-login-error');
  e.hidden = !texto;
  e.textContent = texto ?? '';
}

async function arrancar() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return errorLogin();
  const { data: es } = await supabase.rpc('es_superadmin');
  if (!es) {
    await supabase.auth.signOut();
    return errorLogin('Esta cuenta no administra Agendify. Si eres un negocio, entra a tu panel.');
  }
  $('[data-a-dominio]').textContent = `${dominio}/panel`;
  mostrar('panel');
  cargar();
}

$('#a-form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.currentTarget as HTMLFormElement;
  const b = $<HTMLButtonElement>('button[type=submit]', f);
  const email = (f.elements.namedItem('email') as HTMLInputElement).value.trim();
  const password = (f.elements.namedItem('password') as HTMLInputElement).value;
  if (!email || !password) return errorLogin('Escribe tu correo y tu contraseña.');
  b.disabled = true;
  b.textContent = 'Entrando…';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  b.disabled = false;
  b.textContent = 'Entrar';
  if (error) return errorLogin(/invalid/i.test(error.message) ? 'Correo o contraseña incorrectos.' : 'No se pudo entrar. Inténtalo de nuevo.');
  arrancar();
});

$('[data-a-salir]').addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.reload();
});

// ─── Lista de negocios ────────────────────────────────────────────────────────
async function cargar() {
  const { data, error } = await supabase.rpc('resumen_negocios');
  if (error) {
    $('[data-a-lista]').innerHTML = `<p class="rounded-xl bg-orange-50 px-4 py-3 text-sm text-peligro">${esc(mensajeError(error))}</p>`;
    return;
  }
  negocios = (data ?? []) as Negocio[];
  const activos = negocios.filter((n) => n.activo);
  const kpi = (ico: Parameters<typeof icono>[0], valor: number, etiqueta: string, color: string) => `
    <div class="tarjeta p-kpi">
      <span class="p-kpi-icono ${color}">${icono(ico, 20)}</span>
      <div><p class="text-3xl font-bold tracking-tight tabular-nums">${valor.toLocaleString('es-MX')}</p><p class="text-sm font-medium text-suave">${etiqueta}</p></div>
    </div>`;
  $('[data-a-kpis]').innerHTML = [
    kpi('tienda', activos.length, activos.length === 1 ? 'Negocio activo' : 'Negocios activos', 'bg-marca-50 text-marca'),
    kpi('agenda', negocios.reduce((t, n) => t + Number(n.citas_mes), 0), 'Citas este mes', 'bg-sky-50 text-sky-700'),
    kpi('pendiente', negocios.reduce((t, n) => t + Number(n.por_confirmar), 0), 'Por confirmar', 'bg-pendiente-50 text-pendiente'),
    kpi('bloqueos', negocios.length - activos.length, 'Desactivados', 'bg-cancelada-50 text-cancelada'),
  ].join('');
  pintarLista();
}

function pintarLista() {
  const q = $<HTMLInputElement>('[data-a-buscar]').value.trim().toLowerCase();
  const lista = q ? negocios.filter((n) => `${n.nombre} ${n.slug} ${n.usuario ?? ''} ${n.giro ?? ''}`.toLowerCase().includes(q)) : negocios;
  if (!lista.length) {
    $('[data-a-lista]').innerHTML = `
      <div class="grid justify-items-center gap-3 rounded-2xl border border-dashed border-borde px-6 py-12 text-center md:col-span-2 xl:col-span-3">
        <span class="grid size-12 place-items-center rounded-full bg-fondo text-tenue">${icono('tienda', 22)}</span>
        <p class="text-suave">${q ? 'Ningún negocio coincide con tu búsqueda.' : 'Aún no tienes negocios. Da de alta el primero.'}</p>
        ${q ? '' : `<button type="button" class="btn btn-primario" data-a-nuevo>${icono('mas', 18)}Nuevo negocio</button>`}
      </div>`;
    return;
  }
  $('[data-a-lista]').innerHTML = lista
    .map((n) => {
      const proxima = n.proxima_cita
        ? new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Monterrey' }).format(new Date(n.proxima_cita))
        : '—';
      return `
      <article class="tarjeta grid content-start gap-4 p-5 ${n.activo ? '' : 'opacity-70'}">
        <div class="flex items-start gap-3">
          <div class="p-avatar size-11 ${n.activo ? '' : 'grayscale'}">${esc(iniciales(n.nombre))}</div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-bold">${esc(n.nombre)}</p>
            <p class="truncate text-sm text-suave">${esc(n.giro ?? 'Sin giro')}</p>
          </div>
          <span class="estado shrink-0" data-estado="${n.activo ? 'confirmada' : 'cancelada'}">${n.activo ? 'Activo' : 'Desactivado'}</span>
        </div>
        <div class="flex items-center gap-2 rounded-xl bg-fondo px-3 py-2 text-sm">
          ${icono('pagina', 16)}<a class="min-w-0 flex-1 truncate font-semibold text-marca hover:underline" href="${esc(enlaceDe(n.slug))}" target="_blank" rel="noopener">${esc(dominio)}/${esc(n.slug)}</a>
          <button type="button" class="text-tenue hover:text-texto" data-a-copiar="${esc(enlaceDe(n.slug))}" title="Copiar enlace" aria-label="Copiar enlace">${icono('copiar', 16)}</button>
        </div>
        <dl class="grid grid-cols-3 gap-2 text-center">
          <div class="rounded-xl border border-borde px-2 py-2"><dt class="text-xs text-suave">Citas del mes</dt><dd class="text-lg font-bold tabular-nums">${n.citas_mes}</dd></div>
          <div class="rounded-xl border border-borde px-2 py-2"><dt class="text-xs text-suave">Por confirmar</dt><dd class="text-lg font-bold tabular-nums ${Number(n.por_confirmar) ? 'text-pendiente' : ''}">${n.por_confirmar}</dd></div>
          <div class="rounded-xl border border-borde px-2 py-2"><dt class="text-xs text-suave">Próxima</dt><dd class="truncate pt-1 text-xs font-semibold first-letter:uppercase">${esc(proxima)}</dd></div>
        </dl>
        <p class="flex items-center gap-2 truncate text-sm text-suave">${icono('usuarios', 16)}<span class="truncate">${esc(n.usuario ?? 'Sin usuario')}</span></p>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn btn-secundario min-h-10 flex-1 px-3 text-sm" data-a-editar="${n.id}">Editar</button>
          <button type="button" class="btn btn-secundario min-h-10 flex-1 px-3 text-sm" data-a-clave="${n.id}">Contraseña</button>
        </div>
      </article>`;
    })
    .join('');
}

$('[data-a-buscar]').addEventListener('input', pintarLista);

document.addEventListener('click', (e) => {
  const t = e.target as Element;
  const copia = t.closest<HTMLElement>('[data-a-copiar]');
  if (copia) return copiar(copia.dataset.aCopiar!, 'Enlace copiado');
  if (t.closest('[data-a-nuevo]')) return abrirNuevo();
  const ed = t.closest<HTMLElement>('[data-a-editar]');
  if (ed) return abrirEditar(negocios.find((n) => n.id === ed.dataset.aEditar)!);
  const cl = t.closest<HTMLElement>('[data-a-clave]');
  if (cl) return abrirClave(negocios.find((n) => n.id === cl.dataset.aClave)!);
  if (t.closest('[data-a-cerrar]')) dialogo.close();
});
dialogo.addEventListener('click', (e) => {
  if (e.target === dialogo) dialogo.close();
});

const encabezado = (titulo: string, sub: string) => `
  <div class="sticky top-0 z-10 flex items-start gap-3 border-b border-borde bg-superficie px-5 py-4 sm:px-6">
    <div class="min-w-0 flex-1"><h2 class="text-lg font-bold">${titulo}</h2><p class="text-sm text-suave">${sub}</p></div>
    <button type="button" class="p-icono-btn -mr-2" data-a-cerrar aria-label="Cerrar">${icono('x')}</button>
  </div>`;

// ─── Nuevo negocio ────────────────────────────────────────────────────────────
function filaServicio(nombre = '', duracion = 30) {
  return `
    <div class="s-fila" data-a-servicio>
      <input type="text" maxlength="80" value="${esc(nombre)}" placeholder="Ej. Corte de cabello" aria-label="Nombre del servicio" />
      <select aria-label="Duración">${opcionesDuracion(duracion)}</select>
      <button type="button" class="p-icono-btn" data-a-quitar-servicio aria-label="Quitar servicio" title="Quitar">${icono('basura', 18)}</button>
    </div>`;
}

function abrirNuevo() {
  caja.innerHTML = `
    ${encabezado('Nuevo negocio', 'Se crea su página de reservas y su cuenta para el panel.')}
    <form class="grid gap-6 px-5 py-5 sm:px-6" data-a-form-nuevo novalidate>
      <section class="a-paso !border-0 !pt-0">
        <h3 class="flex items-center gap-2 font-bold"><span class="a-paso-num">1</span>Datos del negocio</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="campo sm:col-span-2"><span>Nombre</span><input name="nombre" required maxlength="80" placeholder="Ej. Barbería Centro" /></label>
          <label class="campo sm:col-span-2"><span>Enlace de su página</span>
            <div class="a-prefijo"><span>${esc(dominio)}/</span><input name="slug" required maxlength="40" placeholder="barberia-centro" autocapitalize="off" spellcheck="false" /></div>
          </label>
          <label class="campo"><span>Giro</span><input name="giro" maxlength="60" placeholder="Ej. Barbería" /></label>
          <label class="campo"><span>WhatsApp del negocio</span><input name="whatsapp" type="tel" inputmode="numeric" maxlength="16" placeholder="871 123 4567" required /></label>
          <label class="campo sm:col-span-2"><span>Dirección <span class="inline font-normal text-tenue">(opcional)</span></span><input name="direccion" maxlength="200" /></label>
        </div>
      </section>
      <section class="a-paso">
        <h3 class="flex items-center gap-2 font-bold"><span class="a-paso-num">2</span>Cuenta para su panel</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="campo"><span>Correo</span><input name="email" type="email" required autocomplete="off" placeholder="negocio@correo.com" /></label>
          <label class="campo"><span>Contraseña</span>
            <div class="flex gap-2"><input name="clave" required minlength="8" autocomplete="off" class="font-mono" /><button type="button" class="btn btn-secundario shrink-0 px-3 text-sm" data-a-generar>Generar</button></div>
          </label>
        </div>
      </section>
      <section class="a-paso">
        <h3 class="flex items-center gap-2 font-bold"><span class="a-paso-num">3</span>Servicios</h3>
        <div class="grid gap-2.5" data-a-servicios>${filaServicio()}${filaServicio()}${filaServicio()}</div>
        <button type="button" class="justify-self-start text-sm font-semibold text-marca hover:underline" data-a-mas-servicio>+ Agregar otro servicio</button>
        <p class="text-xs text-tenue">Las filas vacías se ignoran. El negocio podrá cambiarlos después desde su panel.</p>
      </section>
      <section class="a-paso">
        <h3 class="flex items-center gap-2 font-bold"><span class="a-paso-num">4</span>Horario</h3>
        <div data-a-horario>${editorHorario(HORARIO_BASE)}</div>
      </section>
      <p class="rounded-xl bg-orange-50 px-4 py-3 text-sm font-medium text-peligro" role="alert" data-a-error hidden></p>
      <div class="sticky bottom-0 -mx-5 flex gap-2 border-t border-borde bg-superficie px-5 py-4 sm:-mx-6 sm:px-6">
        <button type="button" class="btn btn-sutil" data-a-cerrar>Cancelar</button>
        <button type="submit" class="btn btn-primario flex-1">Crear negocio</button>
      </div>
    </form>`;
  const f = $<HTMLFormElement>('[data-a-form-nuevo]', caja);
  const campo = (n: string) => f.elements.namedItem(n) as HTMLInputElement;
  campo('clave').value = generarClave();
  activarHorario($('[data-a-horario]', f));
  let slugTocado = false;
  campo('nombre').addEventListener('input', () => {
    if (!slugTocado) campo('slug').value = slugDe(campo('nombre').value);
  });
  campo('slug').addEventListener('input', () => {
    slugTocado = true;
    campo('slug').value = campo('slug').value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  });
  $('[data-a-generar]', f).addEventListener('click', () => (campo('clave').value = generarClave()));
  $('[data-a-mas-servicio]', f).addEventListener('click', () => {
    $('[data-a-servicios]', f).insertAdjacentHTML('beforeend', filaServicio());
    $$<HTMLInputElement>('[data-a-servicio] input', f).at(-1)?.focus();
  });
  $('[data-a-servicios]', f).addEventListener('click', (e) => {
    const b = (e.target as Element).closest('[data-a-quitar-servicio]');
    if (b && $$('[data-a-servicio]', f).length > 1) b.closest('[data-a-servicio]')!.remove();
  });
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('[data-a-error]', f);
    const falla = (t: string) => {
      err.hidden = false;
      err.textContent = t;
      err.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    const servicios = $$('[data-a-servicio]', f)
      .map((fila) => ({ nombre: $<HTMLInputElement>('input', fila).value.trim(), duracion_min: Number($<HTMLSelectElement>('select', fila).value) }))
      .filter((s) => s.nombre);
    const horario = leerHorario($('[data-a-horario]', f));
    const tel = soloDigitos(campo('whatsapp').value);
    if (campo('nombre').value.trim().length < 2) return falla(ERRORES.NOMBRE_INVALIDO!);
    if (!/^[a-z0-9-]{2,40}$/.test(campo('slug').value)) return falla(ERRORES.ENLACE_INVALIDO!);
    if (!/^\d{10}$/.test(tel)) return falla(ERRORES.WHATSAPP_INVALIDO!);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(campo('email').value.trim())) return falla(ERRORES.CORREO_INVALIDO!);
    if (campo('clave').value.length < 8) return falla(ERRORES.CLAVE_CORTA!);
    if (servicios.some((s) => s.nombre.length < 2)) return falla('Cada servicio necesita un nombre de al menos 2 letras.');
    if (!servicios.length) return falla(ERRORES.SERVICIOS_VACIOS!);
    if (typeof horario === 'string') return falla(horario);
    if (!horario.length) return falla('Abre al menos un día en el horario.');
    err.hidden = true;
    const b = $<HTMLButtonElement>('button[type=submit]', f);
    b.disabled = true;
    b.textContent = 'Creando…';
    const datos = {
      nombre: campo('nombre').value.trim(), slug: campo('slug').value, email: campo('email').value.trim().toLowerCase(), clave: campo('clave').value,
      whatsapp: `52${tel}`,
    };
    const { error } = await supabase.rpc('crear_negocio', {
      p_nombre: datos.nombre, p_slug: datos.slug, p_giro: campo('giro').value, p_direccion: campo('direccion').value,
      p_whatsapp: datos.whatsapp, p_email: datos.email, p_clave: datos.clave, p_servicios: servicios, p_horarios: horario,
    });
    b.disabled = false;
    b.textContent = 'Crear negocio';
    if (error) return falla(mensajeError(error));
    mostrarAcceso(datos.nombre, datos.slug, datos.email, datos.clave, datos.whatsapp, 'Negocio creado');
    cargar();
  });
  dialogo.showModal();
  campo('nombre').focus();
}

/** Resumen con los datos de acceso para mandárselos al negocio. */
function mostrarAcceso(nombre: string, slug: string, email: string, clave: string, whatsapp: string, titulo: string) {
  const texto = [
    `¡Hola! Tu cuenta de ${nombre} en Agendify está lista.`,
    '',
    `Tu página de reservas: ${enlaceDe(slug)}`,
    `Tu panel: ${location.origin}/panel`,
    `Correo: ${email}`,
    `Contraseña: ${clave}`,
    '',
    'En tu panel puedes cambiar tus datos, servicios y horario.',
  ].join('\n');
  caja.innerHTML = `
    ${encabezado(titulo, 'Mándale estos datos al negocio para que entre a su panel.')}
    <div class="grid gap-4 px-5 py-5 sm:px-6">
      <div class="mx-auto grid size-14 place-items-center rounded-full bg-confirmada-50 text-confirmada">${icono('check', 28)}</div>
      <dl class="grid gap-2.5 rounded-xl bg-fondo px-4 py-4 text-sm">
        <div class="flex justify-between gap-4"><dt class="text-suave">Página</dt><dd class="truncate text-right font-semibold">${esc(dominio)}/${esc(slug)}</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-suave">Panel</dt><dd class="text-right font-semibold">${esc(dominio)}/panel</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-suave">Correo</dt><dd class="truncate text-right font-semibold">${esc(email)}</dd></div>
        <div class="flex justify-between gap-4"><dt class="text-suave">Contraseña</dt><dd class="text-right font-mono font-semibold">${esc(clave)}</dd></div>
      </dl>
      <p class="text-xs text-tenue">Guárdala ahora: por seguridad no se vuelve a mostrar. Si se pierde, crea una nueva con "Contraseña".</p>
      <div class="grid gap-2 sm:grid-cols-2">
        <button type="button" class="btn btn-secundario" data-a-copiar-acceso>${icono('copiar', 18)}Copiar datos</button>
        <a class="btn btn-exito" href="https://wa.me/${esc(whatsapp)}?text=${encodeURIComponent(texto)}" target="_blank" rel="noopener">${ICONO_WA(18)}Enviar por WhatsApp</a>
      </div>
      <button type="button" class="btn btn-sutil" data-a-cerrar>Listo</button>
    </div>`;
  $('[data-a-copiar-acceso]', caja).addEventListener('click', () => copiar(texto, 'Datos copiados'));
  if (!dialogo.open) dialogo.showModal();
}

// ─── Editar negocio ───────────────────────────────────────────────────────────
function abrirEditar(n: Negocio) {
  caja.innerHTML = `
    ${encabezado(`Editar ${esc(n.nombre)}`, 'Los servicios y el horario los edita el negocio desde su panel.')}
    <form class="grid gap-4 px-5 py-5 sm:px-6" data-a-form-editar novalidate>
      <label class="campo"><span>Nombre</span><input name="nombre" required maxlength="80" value="${esc(n.nombre)}" /></label>
      <label class="campo"><span>Enlace de su página</span>
        <div class="a-prefijo"><span>${esc(dominio)}/</span><input name="slug" required maxlength="40" value="${esc(n.slug)}" autocapitalize="off" spellcheck="false" /></div>
        <span class="mt-1 block text-xs font-normal text-tenue">Si lo cambias, el enlace anterior deja de funcionar.</span>
      </label>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="campo"><span>Giro</span><input name="giro" maxlength="60" value="${esc(n.giro ?? '')}" /></label>
        <label class="campo"><span>WhatsApp</span><input name="whatsapp" type="tel" inputmode="numeric" maxlength="16" value="${esc(telefonoBonito(n.whatsapp))}" /></label>
      </div>
      <label class="campo"><span>Dirección</span><input name="direccion" maxlength="200" value="${esc(n.direccion ?? '')}" /></label>
      <label class="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-fondo px-4 py-3">
        <span><span class="block text-sm font-semibold">Negocio activo</span><span class="block text-xs text-suave">Desactivado, su página deja de recibir reservas (su panel sigue funcionando).</span></span>
        <input type="checkbox" name="activo" class="p-switch" ${n.activo ? 'checked' : ''} />
      </label>
      <p class="rounded-xl bg-orange-50 px-4 py-3 text-sm font-medium text-peligro" role="alert" data-a-error hidden></p>
      <div class="flex gap-2">
        <button type="button" class="btn btn-sutil" data-a-cerrar>Cancelar</button>
        <button type="submit" class="btn btn-primario flex-1">Guardar cambios</button>
      </div>
    </form>`;
  const f = $<HTMLFormElement>('[data-a-form-editar]', caja);
  const campo = (x: string) => f.elements.namedItem(x) as HTMLInputElement;
  campo('slug').addEventListener('input', () => (campo('slug').value = campo('slug').value.toLowerCase().replace(/[^a-z0-9-]/g, '-')));
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('[data-a-error]', f);
    const tel = soloDigitos(campo('whatsapp').value);
    const falla = (t: string) => ((err.hidden = false), (err.textContent = t));
    if (campo('nombre').value.trim().length < 2) return falla(ERRORES.NOMBRE_INVALIDO!);
    if (!/^\d{10}$/.test(tel)) return falla(ERRORES.WHATSAPP_INVALIDO!);
    if (campo('slug').value !== n.slug && !confirm(`¿Cambiar el enlace a ${dominio}/${campo('slug').value}? El enlace anterior dejará de funcionar.`)) return;
    const b = $<HTMLButtonElement>('button[type=submit]', f);
    b.disabled = true;
    const { error } = await supabase.rpc('editar_negocio', {
      p_id: n.id, p_nombre: campo('nombre').value, p_slug: campo('slug').value, p_giro: campo('giro').value,
      p_direccion: campo('direccion').value, p_whatsapp: `52${tel}`, p_activo: campo('activo').checked,
    });
    b.disabled = false;
    if (error) return falla(mensajeError(error));
    dialogo.close();
    toast('Negocio actualizado');
    cargar();
  });
  dialogo.showModal();
}

// ─── Cambiar contraseña ───────────────────────────────────────────────────────
function abrirClave(n: Negocio) {
  caja.innerHTML = `
    ${encabezado('Nueva contraseña', `Para el panel de ${esc(n.nombre)} (${esc(n.usuario ?? 'sin usuario')}).`)}
    <form class="grid gap-4 px-5 py-5 sm:px-6" data-a-form-clave novalidate>
      <label class="campo"><span>Nueva contraseña</span>
        <div class="flex gap-2"><input name="clave" required minlength="8" autocomplete="off" class="font-mono" /><button type="button" class="btn btn-secundario shrink-0 px-3 text-sm" data-a-generar>Generar</button></div>
      </label>
      <p class="text-xs text-tenue">La contraseña anterior deja de funcionar al guardar.</p>
      <p class="rounded-xl bg-orange-50 px-4 py-3 text-sm font-medium text-peligro" role="alert" data-a-error hidden></p>
      <div class="flex gap-2">
        <button type="button" class="btn btn-sutil" data-a-cerrar>Cancelar</button>
        <button type="submit" class="btn btn-primario flex-1">Guardar contraseña</button>
      </div>
    </form>`;
  const f = $<HTMLFormElement>('[data-a-form-clave]', caja);
  const campo = f.elements.namedItem('clave') as HTMLInputElement;
  campo.value = generarClave();
  $('[data-a-generar]', f).addEventListener('click', () => (campo.value = generarClave()));
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('[data-a-error]', f);
    if (campo.value.length < 8) return ((err.hidden = false), (err.textContent = ERRORES.CLAVE_CORTA!));
    const { data, error } = await supabase.rpc('cambiar_clave_negocio', { p_negocio_id: n.id, p_clave: campo.value });
    if (error) return ((err.hidden = false), (err.textContent = mensajeError(error)));
    mostrarAcceso(n.nombre, n.slug, data as string, campo.value, n.whatsapp, 'Contraseña cambiada');
  });
  dialogo.showModal();
}

mostrar('cargando');
arrancar();
