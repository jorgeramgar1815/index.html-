/**
 * Fechas en la zona horaria del negocio (America/Monterrey para Torreón),
 * sin importar la zona del dispositivo del paciente o de la clínica.
 */

/** Fecha local "YYYY-MM-DD" de un instante en una zona horaria. */
export function fechaEnZona(instante: Date, zona: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(instante)
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}

/** Hora local "HH:MM" de un instante en una zona horaria. */
export function horaEnZona(instante: Date, zona: string): string {
  return new Intl.DateTimeFormat('es-MX', { timeZone: zona, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(instante);
}

/** Desfase (ms) de la zona respecto a UTC en un instante dado. */
function desfase(instante: number, zona: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: zona, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
    })
      .formatToParts(new Date(instante))
      .map((x) => [x.type, Number(x.value)]),
  );
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(instante / 1000) * 1000;
}

/** Convierte fecha "YYYY-MM-DD" + hora "HH:MM" de la zona del negocio a un instante (Date). */
export function aInstante(fecha: string, hora: string, zona: string): Date {
  const [y, m, d] = fecha.split('-').map(Number);
  const [hh, mm] = hora.split(':').map(Number);
  const supuesto = Date.UTC(y, m - 1, d, hh, mm);
  let t = supuesto - desfase(supuesto, zona);
  t = supuesto - desfase(t, zona); // segunda pasada por si cae en un cambio de horario
  return new Date(t);
}

/** Suma días a una fecha "YYYY-MM-DD". */
export function sumarDias(fecha: string, dias: number): string {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** Día de la semana de una fecha "YYYY-MM-DD" (0 = domingo). */
export function diaSemana(fecha: string): number {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Texto en español de una fecha "YYYY-MM-DD" (ej. "lunes 5 de octubre"). */
export function fechaLarga(fecha: string, opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }): string {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', { ...opciones, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}
