/**
 * Configuración de Agendify. La marca del software es independiente de cada negocio:
 * cada negocio sólo aporta su nombre, giro, dirección, servicios y horario (en Supabase).
 */
export const APP = {
  nombre: 'Agendify',
  lema: 'Reservas en línea para tu negocio',
};

/** Valores públicos de Supabase (la seguridad la dan RLS y las funciones RPC). */
export const SUPABASE = {
  url: (import.meta.env.PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, ''),
  anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '',
};
export const configurado = Boolean(SUPABASE.url && SUPABASE.anonKey);
