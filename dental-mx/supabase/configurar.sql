-- ═══════════════════════════════════════════════════════════════════════════
-- Configuración final (se corre UNA vez, después de las migraciones y el seed).
-- Reemplaza los valores entre <> y ejecútalo en el SQL Editor de Supabase.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) Usuario de la clínica para el panel /admin.
--    Primero créalo en Authentication → Users → "Add user" (correo + contraseña,
--    marcando "Auto Confirm User"). Luego lígalo a Dental MX:
insert into public.admins (user_id, negocio_id)
select u.id, n.id
from auth.users u, public.negocios n
where u.email = '<correo-de-la-clinica>' and n.slug = 'dental-mx';

-- 2) Correo que recibe el aviso de cada cita nueva.
update public.negocios
set email_notificaciones = '<correo-para-avisos>'
where slug = 'dental-mx';

-- 3) URL de las Edge Functions (Project Settings → API → Project URL + /functions/v1).
insert into public.ajustes_internos (clave, valor)
values ('url_funciones', 'https://<ref-del-proyecto>.supabase.co/functions/v1')
on conflict (clave) do update set valor = excluded.valor;

-- Comprobación: debe mostrar el negocio, su correo de avisos y el admin ligado.
select n.slug, n.email_notificaciones, u.email as admin
from public.negocios n
left join public.admins a on a.negocio_id = n.id
left join auth.users u on u.id = a.user_id
where n.slug = 'dental-mx';
