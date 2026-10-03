-- ═══════════════════════════════════════════════════════════════════════════
-- Configuración final (se corre UNA vez, después de las migraciones y el seed).
-- Reemplaza los valores entre <> y ejecútalo en el SQL Editor de Supabase.
-- ═══════════════════════════════════════════════════════════════════════════

-- Usuario del negocio para el panel de Agendo (/panel).
--    Primero créalo en Authentication → Users → "Add user" (correo + contraseña,
--    marcando "Auto Confirm User"). Luego lígalo a Dental MX:
insert into public.admins (user_id, negocio_id)
select u.id, n.id
from auth.users u, public.negocios n
where u.email = '<correo-de-la-clinica>' and n.slug = 'dental-mx';

-- Comprobación: debe mostrar el negocio y el usuario ligado.
select n.slug, u.email as admin
from public.negocios n
left join public.admins a on a.negocio_id = n.id
left join auth.users u on u.id = a.user_id
where n.slug = 'dental-mx';
