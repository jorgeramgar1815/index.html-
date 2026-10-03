// ═══════════════════════════════════════════════════════════════════════════
// Edge Function: notificar-cita
// La llama el trigger `citas_avisar_nueva` (pg_net) con { cita_id } cada vez que
// entra una cita. Envía un correo a negocios.email_notificaciones usando Resend.
//
// Variables (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   clave de https://resend.com (plan gratis: 3,000 correos/mes)
//   AVISOS_REMITENTE opcional, ej. "Agendo <citas@tudominio.com>".
//   AGENDO_URL opcional: dirección de Agendo para el enlace al panel.
//                    Sin dominio verificado en Resend usa "onboarding@resend.dev"
//                    (sólo puede enviar al correo de tu cuenta de Resend).
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY las pone Supabase automáticamente.
//
// Seguridad: sólo actúa sobre citas creadas hace menos de 10 minutos y aún no
// notificadas, y marca `notificada_en` de forma atómica: cada cita genera como
// máximo un correo aunque alguien llame la función por su cuenta.
// ═══════════════════════════════════════════════════════════════════════════
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const REMITENTE = Deno.env.get('AVISOS_REMITENTE') ?? 'Agendo <onboarding@resend.dev>';
const PANEL = `${(Deno.env.get('AGENDO_URL') ?? 'https://agendo-reservas.vercel.app').replace(/\/+$/, '')}/panel`;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'método no permitido' }, 405);
  const { cita_id } = await req.json().catch(() => ({}));
  if (typeof cita_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(cita_id)) return json({ error: 'cita_id inválido' }, 400);

  // Marca como notificada sólo si es reciente y no se había notificado (una vez por cita).
  const hace10min = new Date(Date.now() - 10 * 60_000).toISOString();
  const { data: cita, error } = await supabase
    .from('citas')
    .update({ notificada_en: new Date().toISOString() })
    .eq('id', cita_id)
    .is('notificada_en', null)
    .gte('creada_en', hace10min)
    .select('id, inicio, nombre, telefono, nota, servicios(nombre), negocios(nombre, zona_horaria, email_notificaciones)')
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  if (!cita) return json({ ok: true, omitido: 'ya notificada o no reciente' });

  const negocio = cita.negocios as unknown as { nombre: string; zona_horaria: string; email_notificaciones: string | null };
  const servicio = (cita.servicios as unknown as { nombre: string } | null)?.nombre ?? 'Cita';
  if (!negocio?.email_notificaciones || !RESEND_API_KEY) return json({ ok: true, omitido: 'sin correo o sin RESEND_API_KEY' });

  const cuando = new Intl.DateTimeFormat('es-MX', {
    timeZone: negocio.zona_horaria, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(cita.inicio));
  const tel = cita.telefono.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;color:#111">
      <h2 style="margin:0 0 4px">Nueva cita por confirmar</h2>
      <p style="margin:0 0 16px;color:#555">${esc(negocio.nombre)}</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px">
        <tr><td style="padding:6px 0;color:#555">Cliente</td><td style="padding:6px 0;text-align:right"><b>${esc(cita.nombre)}</b></td></tr>
        <tr><td style="padding:6px 0;color:#555">Servicio</td><td style="padding:6px 0;text-align:right">${esc(servicio)}</td></tr>
        <tr><td style="padding:6px 0;color:#555">Cuándo</td><td style="padding:6px 0;text-align:right">${esc(cuando)}</td></tr>
        <tr><td style="padding:6px 0;color:#555">Teléfono</td><td style="padding:6px 0;text-align:right">${esc(tel)}</td></tr>
        ${cita.nota ? `<tr><td style="padding:6px 0;color:#555">Nota</td><td style="padding:6px 0;text-align:right">${esc(cita.nota)}</td></tr>` : ''}
      </table>
      <p style="margin:20px 0 0"><a href="${PANEL}" style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:600">Abrir mi panel</a>
        <a href="https://wa.me/52${cita.telefono}" style="margin-left:8px;color:#047857;font-weight:600;text-decoration:none">WhatsApp al cliente</a></p>
      <p style="margin:16px 0 0;color:#777;font-size:13px">Confírmala o cancélala desde tu panel de Agendo.</p>
    </div>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: REMITENTE,
      to: [negocio.email_notificaciones],
      subject: `Nueva cita: ${cita.nombre} · ${servicio} · ${cuando}`,
      html,
    }),
  });
  if (!r.ok) {
    // Permite reintentar si el envío falla.
    await supabase.from('citas').update({ notificada_en: null }).eq('id', cita_id);
    return json({ error: `Resend ${r.status}`, detalle: await r.text() }, 502);
  }
  return json({ ok: true });
});
