-- ═══════════════════════════════════════════════════════════════════════════
-- Panel de negocios (dueño de Agendify) + configuración de cada negocio.
-- - superadmins: usuarios que administran todos los negocios desde /admin.
-- - Cada negocio edita sus datos (nombre, giro, dirección, WhatsApp), sus
--   servicios y su horario. El enlace (slug) sólo lo cambia el superadmin.
-- - Un negocio desactivado no recibe reservas en línea.
-- ═══════════════════════════════════════════════════════════════════════════

create table public.superadmins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.superadmins enable row level security;
create policy "usuario ve si es superadmin" on public.superadmins
  for select to authenticated using (user_id = (select auth.uid()));
revoke all on public.superadmins from anon, authenticated;
grant select on public.superadmins to authenticated;

create function public.es_superadmin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.superadmins where user_id = (select auth.uid()));
$$;
revoke execute on function public.es_superadmin() from public, anon;
grant execute on function public.es_superadmin() to authenticated;

alter table public.negocios add column activo boolean not null default true;

-- ─── El negocio edita sus propios datos ─────────────────────────────────────
create policy "admin actualiza su negocio" on public.negocios
  for update to authenticated using (public.es_admin(id)) with check (public.es_admin(id));
grant update (nombre, giro, direccion, whatsapp) on public.negocios to authenticated;
alter table public.negocios
  add constraint negocios_nombre_largo check (char_length(nombre) between 2 and 80);

-- Horario: reemplaza el de la semana completa de forma atómica.
-- p_horarios = [{"dia_semana": 1, "abre": "10:00", "cierra": "14:00"}, …]
create function public.guardar_horario(p_negocio_id uuid, p_horarios jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not (public.es_admin(p_negocio_id) or public.es_superadmin()) then
    raise exception 'NO_AUTORIZADO' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_horarios) <> 'array' or jsonb_array_length(p_horarios) > 28 then
    raise exception 'HORARIO_INVALIDO' using errcode = 'P0001';
  end if;
  delete from public.horarios where negocio_id = p_negocio_id;
  insert into public.horarios (negocio_id, dia_semana, abre, cierra)
  select p_negocio_id, (h ->> 'dia_semana')::smallint, (h ->> 'abre')::time, (h ->> 'cierra')::time
  from jsonb_array_elements(p_horarios) h;
exception
  when check_violation or invalid_datetime_format or invalid_text_representation then
    raise exception 'HORARIO_INVALIDO' using errcode = 'P0001';
end;
$$;
revoke execute on function public.guardar_horario(uuid, jsonb) from public, anon;
grant execute on function public.guardar_horario(uuid, jsonb) to authenticated;

-- ─── Reservas: un negocio inactivo no recibe citas ──────────────────────────
create or replace function public.datos_reserva(p_slug text)
returns json
language plpgsql stable security definer set search_path = '' as $$
declare
  v_negocio public.negocios;
begin
  select * into v_negocio from public.negocios where slug = p_slug;
  if not found then
    raise exception 'NEGOCIO_NO_ENCONTRADO' using errcode = 'P0001';
  end if;
  if not v_negocio.activo then
    raise exception 'NEGOCIO_INACTIVO' using errcode = 'P0001';
  end if;

  return json_build_object(
    'negocio', json_build_object(
      'nombre', v_negocio.nombre,
      'giro', v_negocio.giro,
      'direccion', v_negocio.direccion,
      'whatsapp', v_negocio.whatsapp,
      'zona_horaria', v_negocio.zona_horaria,
      'dias_max', v_negocio.dias_max
    ),
    'servicios', coalesce((
      select json_agg(json_build_object(
        'id', s.id, 'clave', s.clave, 'nombre', s.nombre,
        'descripcion', s.descripcion, 'duracion_min', s.duracion_min
      ) order by s.orden, s.nombre)
      from public.servicios s
      where s.negocio_id = v_negocio.id and s.activo
    ), '[]'::json)
  );
end;
$$;

create or replace function public._negocio_servicio(p_slug text, p_servicio_id uuid, out negocio public.negocios, out duracion integer, out servicio_nombre text)
language plpgsql stable security definer set search_path = '' as $$
begin
  select * into negocio from public.negocios where slug = p_slug;
  if not found then
    raise exception 'NEGOCIO_NO_ENCONTRADO' using errcode = 'P0001';
  end if;
  if not negocio.activo then
    raise exception 'NEGOCIO_INACTIVO' using errcode = 'P0001';
  end if;
  select s.duracion_min, s.nombre into duracion, servicio_nombre
  from public.servicios s
  where s.id = p_servicio_id and s.negocio_id = negocio.id and s.activo;
  if not found then
    raise exception 'SERVICIO_INVALIDO' using errcode = 'P0001';
  end if;
end;
$$;

-- ─── Funciones del panel de negocios (sólo superadmin) ──────────────────────

-- Lista de negocios con su usuario y números del mes.
create function public.resumen_negocios()
returns table (
  id uuid, slug text, nombre text, giro text, direccion text, whatsapp text, activo boolean, creado_en timestamptz,
  usuario text, citas_mes bigint, por_confirmar bigint, proxima_cita timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.es_superadmin() then
    raise exception 'NO_AUTORIZADO' using errcode = 'P0001';
  end if;
  return query
  select n.id, n.slug, n.nombre, n.giro, n.direccion, n.whatsapp, n.activo, n.creado_en,
    (select u.email::text from public.admins a join auth.users u on u.id = a.user_id where a.negocio_id = n.id order by u.email limit 1),
    (select count(*) from public.citas c where c.negocio_id = n.id and c.estado <> 'cancelada'
       and c.inicio >= date_trunc('month', now() at time zone n.zona_horaria) at time zone n.zona_horaria),
    (select count(*) from public.citas c where c.negocio_id = n.id and c.estado = 'pendiente' and c.inicio >= now()),
    (select min(c.inicio) from public.citas c where c.negocio_id = n.id and c.estado <> 'cancelada' and c.inicio >= now())
  from public.negocios n
  order by n.creado_en desc, n.nombre;
end;
$$;

-- Crea un usuario de Supabase Auth con correo y contraseña (interna).
create function public._crear_usuario(p_email text, p_clave text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := gen_random_uuid();
begin
  if exists (select 1 from auth.users where lower(email) = lower(p_email)) then
    raise exception 'CORREO_OCUPADO' using errcode = 'P0001';
  end if;
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', lower(p_email),
    extensions.crypt(p_clave, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
    jsonb_build_object('sub', v_id::text, 'email', lower(p_email), 'email_verified', true), 'email', now(), now(), now());
  return v_id;
end;
$$;
revoke execute on function public._crear_usuario(text, text) from public, anon, authenticated;

-- Alta completa: negocio + servicios + horario + usuario del panel.
-- p_servicios = [{"nombre": "Corte", "duracion_min": 30}, …]
create function public.crear_negocio(
  p_nombre text, p_slug text, p_giro text, p_direccion text, p_whatsapp text,
  p_email text, p_clave text, p_servicios jsonb, p_horarios jsonb
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_usuario uuid;
  s jsonb;
  v_orden integer := 0;
  v_clave text;
begin
  if not public.es_superadmin() then
    raise exception 'NO_AUTORIZADO' using errcode = 'P0001';
  end if;
  p_slug := lower(trim(p_slug));
  if p_slug !~ '^[a-z0-9-]{2,40}$' or p_slug in ('panel', 'admin', 'reservar', 'api', '_astro', 'favicon') then
    raise exception 'ENLACE_INVALIDO' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.negocios where slug = p_slug) then
    raise exception 'ENLACE_OCUPADO' using errcode = 'P0001';
  end if;
  if char_length(trim(coalesce(p_nombre, ''))) < 2 then
    raise exception 'NOMBRE_INVALIDO' using errcode = 'P0001';
  end if;
  if coalesce(p_whatsapp, '') !~ '^[0-9]{10,15}$' then
    raise exception 'WHATSAPP_INVALIDO' using errcode = 'P0001';
  end if;
  if coalesce(p_email, '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'CORREO_INVALIDO' using errcode = 'P0001';
  end if;
  if char_length(coalesce(p_clave, '')) < 8 then
    raise exception 'CLAVE_CORTA' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_servicios) <> 'array' or jsonb_array_length(p_servicios) = 0 then
    raise exception 'SERVICIOS_VACIOS' using errcode = 'P0001';
  end if;

  insert into public.negocios (slug, nombre, giro, direccion, whatsapp)
  values (p_slug, trim(p_nombre), nullif(trim(p_giro), ''), nullif(trim(p_direccion), ''), p_whatsapp)
  returning id into v_id;

  for s in select * from jsonb_array_elements(p_servicios) loop
    v_orden := v_orden + 1;
    v_clave := trim(both '-' from regexp_replace(translate(lower(s ->> 'nombre'), 'áéíóúüñ', 'aeiouun'), '[^a-z0-9]+', '-', 'g'));
    if char_length(v_clave) < 2 then v_clave := 'servicio-' || v_orden; end if;
    if exists (select 1 from public.servicios where negocio_id = v_id and clave = v_clave) then
      v_clave := left(v_clave, 55) || '-' || v_orden;
    end if;
    insert into public.servicios (negocio_id, clave, nombre, descripcion, duracion_min, orden)
    values (v_id, left(v_clave, 60), trim(s ->> 'nombre'), nullif(trim(s ->> 'descripcion'), ''), (s ->> 'duracion_min')::integer, v_orden);
  end loop;

  insert into public.horarios (negocio_id, dia_semana, abre, cierra)
  select v_id, (h ->> 'dia_semana')::smallint, (h ->> 'abre')::time, (h ->> 'cierra')::time
  from jsonb_array_elements(coalesce(p_horarios, '[]'::jsonb)) h;

  v_usuario := public._crear_usuario(p_email, p_clave);
  insert into public.admins (user_id, negocio_id) values (v_usuario, v_id);
  return v_id;
exception
  when check_violation or invalid_datetime_format or invalid_text_representation then
    raise exception 'DATOS_INVALIDOS' using errcode = 'P0001';
end;
$$;

-- Editar cualquier negocio (incluye enlace y activo).
create function public.editar_negocio(
  p_id uuid, p_nombre text, p_slug text, p_giro text, p_direccion text, p_whatsapp text, p_activo boolean
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.es_superadmin() then
    raise exception 'NO_AUTORIZADO' using errcode = 'P0001';
  end if;
  p_slug := lower(trim(p_slug));
  if p_slug !~ '^[a-z0-9-]{2,40}$' or p_slug in ('panel', 'admin', 'reservar', 'api', '_astro', 'favicon') then
    raise exception 'ENLACE_INVALIDO' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.negocios where slug = p_slug and id <> p_id) then
    raise exception 'ENLACE_OCUPADO' using errcode = 'P0001';
  end if;
  if coalesce(p_whatsapp, '') !~ '^[0-9]{10,15}$' then
    raise exception 'WHATSAPP_INVALIDO' using errcode = 'P0001';
  end if;
  update public.negocios set
    nombre = trim(p_nombre), slug = p_slug, giro = nullif(trim(p_giro), ''),
    direccion = nullif(trim(p_direccion), ''), whatsapp = p_whatsapp, activo = p_activo
  where id = p_id;
  if not found then
    raise exception 'NEGOCIO_NO_ENCONTRADO' using errcode = 'P0001';
  end if;
exception
  when check_violation then
    raise exception 'DATOS_INVALIDOS' using errcode = 'P0001';
end;
$$;

-- Nueva contraseña para el usuario del panel de un negocio.
create function public.cambiar_clave_negocio(p_negocio_id uuid, p_clave text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_email text;
begin
  if not public.es_superadmin() then
    raise exception 'NO_AUTORIZADO' using errcode = 'P0001';
  end if;
  if char_length(coalesce(p_clave, '')) < 8 then
    raise exception 'CLAVE_CORTA' using errcode = 'P0001';
  end if;
  update auth.users u set encrypted_password = extensions.crypt(p_clave, extensions.gen_salt('bf')), updated_at = now()
  from public.admins a
  where a.negocio_id = p_negocio_id and a.user_id = u.id
  returning u.email into v_email;
  if v_email is null then
    raise exception 'SIN_USUARIO' using errcode = 'P0001';
  end if;
  return v_email;
end;
$$;

revoke execute on function public.resumen_negocios() from public, anon;
revoke execute on function public.crear_negocio(text, text, text, text, text, text, text, jsonb, jsonb) from public, anon;
revoke execute on function public.editar_negocio(uuid, text, text, text, text, text, boolean) from public, anon;
revoke execute on function public.cambiar_clave_negocio(uuid, text) from public, anon;
grant execute on function public.resumen_negocios() to authenticated;
grant execute on function public.crear_negocio(text, text, text, text, text, text, text, jsonb, jsonb) to authenticated;
grant execute on function public.editar_negocio(uuid, text, text, text, text, text, boolean) to authenticated;
grant execute on function public.cambiar_clave_negocio(uuid, text) to authenticated;
