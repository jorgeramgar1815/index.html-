/**
 * Acceso público a Agendo: funciones RPC de Supabase con la anon key (sin librería).
 * Los errores llegan con un código en MAYÚSCULAS que aquí se traduce a español.
 */
export class ErrorAgendo extends Error {}

export function crearRpc(url: string, key: string) {
  return async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
    const control = new AbortController();
    const tiempo = setTimeout(() => control.abort(), 15000);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', apikey: key };
      if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;
      const r = await fetch(`${url}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(args), signal: control.signal });
      const data = await r.json().catch(() => null);
      if (!r.ok) throw new ErrorAgendo((data && (data.message as string)) || 'ERROR_RED');
      return data as T;
    } catch (e) {
      if (e instanceof ErrorAgendo) throw e;
      throw new ErrorAgendo('ERROR_RED');
    } finally {
      clearTimeout(tiempo);
    }
  };
}

export const MENSAJES: Record<string, string> = {
  HORARIO_OCUPADO: 'Alguien acaba de apartar ese horario. Ya actualizamos la lista: elige otro.',
  HORARIO_NO_DISPONIBLE: 'Ese horario ya no está disponible. Ya actualizamos la lista: elige otro.',
  LIMITE_TELEFONO: 'Este teléfono ya tiene 2 citas pendientes. Si necesitas otra o quieres cambiarlas, escribe por WhatsApp.',
  LIMITE_DIARIO: 'Por hoy ya no se pueden recibir más reservas en línea. Escribe por WhatsApp y te ayudan.',
  TELEFONO_INVALIDO: 'Revisa tu teléfono: deben ser 10 dígitos.',
  NOMBRE_INVALIDO: 'Escribe tu nombre (mínimo 2 letras).',
  NOTA_LARGA: 'La nota es muy larga (máximo 280 caracteres).',
  SERVICIO_INVALIDO: 'Ese servicio ya no está disponible. Elige otro.',
  NEGOCIO_NO_ENCONTRADO: 'No encontramos este negocio. Revisa el enlace.',
  SOLICITUD_INVALIDA: 'No pudimos procesar tu solicitud.',
  ERROR_RED: 'No pudimos conectar. Revisa tu internet e inténtalo de nuevo.',
};
export const mensaje = (codigo: string) => MENSAJES[codigo] ?? MENSAJES.ERROR_RED;

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Iniciales para el avatar del negocio (ej. "Dental MX" → "DM"). */
export const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
