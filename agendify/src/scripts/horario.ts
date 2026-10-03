/**
 * Editor de horario semanal (lo usan "Mi negocio" y el panel de negocios).
 * Cada día: abierto / cerrado y hasta dos tramos (ej. 10:00–14:00 y 16:00–20:00).
 */
import { esc } from './api';

export type Tramo = { dia_semana: number; abre: string; cierra: string };

export const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const ORDEN = [1, 2, 3, 4, 5, 6, 0];

/** Horario sugerido para un negocio nuevo. */
export const HORARIO_BASE: Tramo[] = [
  ...[1, 2, 3, 4, 5].flatMap((d) => [
    { dia_semana: d, abre: '10:00', cierra: '14:00' },
    { dia_semana: d, abre: '16:00', cierra: '20:00' },
  ]),
  { dia_semana: 6, abre: '10:00', cierra: '14:00' },
];

const hhmm = (t: string) => t.slice(0, 5);

export function editorHorario(tramos: Tramo[]) {
  return `<div class="grid gap-2" data-horario>${ORDEN.map((d) => {
    const del = tramos.filter((t) => t.dia_semana === d).sort((a, b) => a.abre.localeCompare(b.abre));
    const t1 = del[0];
    const t2 = del[1];
    return `
      <div class="grid gap-2 rounded-xl border border-borde px-3 py-2.5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center" data-dia="${d}">
        <label class="flex items-center gap-2.5 text-sm font-semibold">
          <input type="checkbox" class="p-switch" data-abierto ${del.length ? 'checked' : ''} aria-label="${DIAS[d]} abierto" />${DIAS[d]}
        </label>
        <div class="flex flex-wrap items-center gap-2 text-sm" data-tramos ${del.length ? '' : 'hidden'}>
          <input type="time" step="900" class="h-input" data-abre="1" value="${esc(hhmm(t1?.abre ?? '10:00'))}" aria-label="${DIAS[d]}: abre" />
          <span class="text-tenue">a</span>
          <input type="time" step="900" class="h-input" data-cierra="1" value="${esc(hhmm(t1?.cierra ?? '14:00'))}" aria-label="${DIAS[d]}: cierra" />
          <span class="flex flex-wrap items-center gap-2" data-segundo ${t2 ? '' : 'hidden'}>
            <span class="text-tenue">y</span>
            <input type="time" step="900" class="h-input" data-abre="2" value="${esc(hhmm(t2?.abre ?? '16:00'))}" aria-label="${DIAS[d]}: abre (segundo turno)" />
            <span class="text-tenue">a</span>
            <input type="time" step="900" class="h-input" data-cierra="2" value="${esc(hhmm(t2?.cierra ?? '20:00'))}" aria-label="${DIAS[d]}: cierra (segundo turno)" />
          </span>
          <button type="button" class="text-xs font-semibold text-marca hover:underline" data-turno>${t2 ? 'Quitar 2º turno' : '+ 2º turno'}</button>
        </div>
        <p class="text-sm text-tenue sm:col-start-2" data-cerrado ${del.length ? 'hidden' : ''}>Cerrado</p>
      </div>`;
  }).join('')}</div>`;
}

/** Conecta los interruptores y botones del editor (llamar después de pintarlo). */
export function activarHorario(caja: HTMLElement) {
  caja.querySelectorAll<HTMLElement>('[data-dia]').forEach((fila) => {
    const abierto = fila.querySelector<HTMLInputElement>('[data-abierto]')!;
    abierto.addEventListener('change', () => {
      fila.querySelector<HTMLElement>('[data-tramos]')!.hidden = !abierto.checked;
      fila.querySelector<HTMLElement>('[data-cerrado]')!.hidden = abierto.checked;
    });
    const boton = fila.querySelector<HTMLButtonElement>('[data-turno]')!;
    boton.addEventListener('click', () => {
      const seg = fila.querySelector<HTMLElement>('[data-segundo]')!;
      seg.hidden = !seg.hidden;
      boton.textContent = seg.hidden ? '+ 2º turno' : 'Quitar 2º turno';
    });
  });
}

/** Lee el editor. Devuelve los tramos o un texto de error. */
export function leerHorario(caja: HTMLElement): Tramo[] | string {
  const tramos: Tramo[] = [];
  for (const fila of caja.querySelectorAll<HTMLElement>('[data-dia]')) {
    if (!fila.querySelector<HTMLInputElement>('[data-abierto]')!.checked) continue;
    const d = Number(fila.dataset.dia);
    const valor = (sel: string) => fila.querySelector<HTMLInputElement>(sel)!.value;
    const turnos = [[valor('[data-abre="1"]'), valor('[data-cierra="1"]')]];
    if (!fila.querySelector<HTMLElement>('[data-segundo]')!.hidden) turnos.push([valor('[data-abre="2"]'), valor('[data-cierra="2"]')]);
    for (const [abre, cierra] of turnos) {
      if (!abre || !cierra || abre >= cierra) return `Revisa el horario del ${DIAS[d]!.toLowerCase()}: la hora de cierre debe ser después de la de apertura.`;
      tramos.push({ dia_semana: d, abre, cierra });
    }
    if (turnos.length === 2 && turnos[1]![0]! < turnos[0]![1]!) return `En el ${DIAS[d]!.toLowerCase()} el segundo turno empieza antes de que termine el primero.`;
  }
  return tramos;
}

/** Duraciones permitidas para un servicio (múltiplos de 15 min). */
export const DURACIONES = [15, 30, 45, 60, 75, 90, 120, 150, 180, 240];
export const opcionesDuracion = (actual = 30) =>
  DURACIONES.map((m) => `<option value="${m}" ${m === actual ? 'selected' : ''}>${m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`}</option>`).join('');
