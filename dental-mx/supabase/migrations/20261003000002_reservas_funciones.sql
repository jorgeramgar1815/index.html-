-- ═══════════════════════════════════════════════════════════════════════════
-- Reservaciones · funciones públicas (RPC)
-- El widget (anon key) sólo puede usar estas funciones; las tablas están cerradas.
-- Errores: se lanzan con un código en MAYÚSCULAS que el widget traduce a español.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Interna: horarios libres de un negocio para una duración y rango de fechas ──
-- Aplica: horario semanal, pasos (paso_min), anticipación mínima, ventana máxima
-- (dias_max), bloqueos y citas activas. Todo en la zona horaria del negocio.
create function public._slots(p_negocio_id uuid, p_duracion integer, p_desde date, p_hasta date)
returns table (inicio timestamptz, fin timestamptz)
language sql stable security definer set search_path = '' as $$
  with n as (
    select ng.*, (now() at time zone ng.zona_horaria)::date as hoy
    from public.negocios ng
    where ng.id = p_negocio_id
  ),
  dias as (
    select d::date as fecha
    from n, generate_series(greatest(p_desde, n.hoy), least(p_hasta, n.hoy + n.dias_max), interval '1 day') as d
  ),
  candidatos as (
    select
      (local_ts at time zone n.zona_horaria) as inicio,
      (local_ts at time zone n.zona_horaria) + make_interval(mins => p_duracion) as fin
    from n
    join dias on true
    join public.horarios h
      on h.negocio_id = n.id and h.dia_semana = extract(dow from dias.fecha)
    cross join lateral generate_series(
      dias.fecha + h.abre,
      dias.fecha + h.cierra - make_interval(mins => p_duracion),
      make_interval(mins => n.paso_min)
    ) as local_ts
  )
  select c.inicio, c.fin
  from candidatos c, n
  where c.inicio >= now() + n.anticipacion_min
    and not exists (
      select 1 from public.citas ci
      where ci.negocio_id = n.id
        and ci.estado <> 'cancelada'
        and tstzrange(ci.inicio, ci.fin, '[)') && tstzrange(c.inicio, c.fin, '[)')
    )
    and not exists (
      select 1 from public.bloqueos b
      where b.negocio_id = n.id
        and tstzrange(b.inicio, b.fin, '[)') && tstzrange(c.inicio, c.fin, '[)')
    )
  order by c.inicio;
$$;

-- ─── Datos para abrir el widget: negocio y servicios activos ────────────────
create function public.datos_reserva(p_slug text)
returns json
language plpgsql stable security definer set search_path = '' as $$
declare
  v_negocio public.negocios;
begin
  select * into v_negocio from public.negocios where slug = p_slug;
  if not found then
    raise exception 'NEGOCIO_NO_ENCONTRADO' using errcode = 'P0001';
  end if;

  return json_build_object(
    'negocio', json_build_object(
      'nombre', v_negocio.nombre,
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

-- ─── Resuelve negocio + servicio activo (interna) ───────────────────────────
create function public._negocio_servicio(p_slug text, p_servicio_id uuid, out negocio public.negocios, out duracion integer, out servicio_nombre text)
language plpgsql stable security definer set search_path = '' as $$
begin
  select * into negocio from public.negocios where slug = p_slug;
  if not found then
    raise exception 'NEGOCIO_NO_ENCONTRADO' using errcode = 'P0001';
  end if;
  select s.duracion_min, s.nombre into duracion, servicio_nombre
  from public.servicios s
  where s.id = p_servicio_id and s.negocio_id = negocio.id and s.activo;
  if not found then
    raise exception 'SERVICIO_INVALIDO' using errcode = 'P0001';
  end if;
end;
$$;

-- ─── Días con al menos un horario libre (para el calendario) ────────────────
create function public.dias_disponibles(p_slug text, p_servicio_id uuid)
returns setof date
language plpgsql stable security definer set search_path = '' as $$
declare
  r record;
begin
  select * into r from public._negocio_servicio(p_slug, p_servicio_id);
  return query
    select distinct (sl.inicio at time zone (r.negocio).zona_horaria)::date as fecha
    from public._slots((r.negocio).id, r.duracion, '-infinity'::date, 'infinity'::date) sl
    order by 1;
end;
$$;

-- ─── Horarios libres de un día ──────────────────────────────────────────────
create function public.horarios_disponibles(p_slug text, p_servicio_id uuid, p_fecha date)
returns table (inicio timestamptz, hora text)
language plpgsql stable security definer set search_path = '' as $$
declare
  r record;
begin
  select * into r from public._negocio_servicio(p_slug, p_servicio_id);
  return query
    select sl.inicio, to_char(sl.inicio at time zone (r.negocio).zona_horaria, 'HH24:MI')
    from public._slots((r.negocio).id, r.duracion, p_fecha, p_fecha) sl;
end;
$$;

-- ─── Crear una cita ─────────────────────────────────────────────────────────
create function public.crear_cita(
  p_slug text,
  p_servicio_id uuid,
  p_inicio timestamptz,
  p_nombre text,
  p_telefono text,
  p_nota text default null,
  p_trampa text default null
)
returns json
language plpgsql volatile security definer set search_path = '' as $$
declare
  r record;
  v_fecha date;
  v_tel text;
  v_nombre text;
  v_nota text;
  v_fin timestamptz;
  v_cita public.citas;
  v_inicio_dia timestamptz;
begin
  -- Campo trampa: los humanos no lo ven; si viene lleno es un bot.
  if coalesce(p_trampa, '') <> '' then
    raise exception 'SOLICITUD_INVALIDA' using errcode = 'P0001';
  end if;

  select * into r from public._negocio_servicio(p_slug, p_servicio_id);

  -- Datos del paciente
  v_nombre := regexp_replace(trim(coalesce(p_nombre, '')), '\s+', ' ', 'g');
  if char_length(v_nombre) < 2 or char_length(v_nombre) > 80 then
    raise exception 'NOMBRE_INVALIDO' using errcode = 'P0001';
  end if;

  v_tel := regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g');
  if char_length(v_tel) = 13 and v_tel like '521%' then
    v_tel := right(v_tel, 10);
  elsif char_length(v_tel) = 12 and v_tel like '52%' then
    v_tel := right(v_tel, 10);
  end if;
  if v_tel !~ '^[0-9]{10}$' then
    raise exception 'TELEFONO_INVALIDO' using errcode = 'P0001';
  end if;

  v_nota := nullif(trim(coalesce(p_nota, '')), '');
  if char_length(v_nota) > 280 then
    raise exception 'NOTA_LARGA' using errcode = 'P0001';
  end if;

  -- Serializa solicitudes del mismo teléfono para que el límite no se brinque en paralelo.
  perform pg_advisory_xact_lock(hashtextextended((r.negocio).id::text || ':' || v_tel, 0));

  -- El inicio debe ser exactamente uno de los horarios ofrecidos (horario, pasos,
  -- anticipación, ventana, bloqueos y citas existentes).
  v_fecha := (p_inicio at time zone (r.negocio).zona_horaria)::date;
  select sl.fin into v_fin
  from public._slots((r.negocio).id, r.duracion, v_fecha, v_fecha) sl
  where sl.inicio = p_inicio;
  if not found then
    raise exception 'HORARIO_NO_DISPONIBLE' using errcode = 'P0001';
  end if;

  if (
    select count(*) from public.citas c
    where c.negocio_id = (r.negocio).id and c.telefono = v_tel
      and c.estado = 'pendiente' and c.inicio > now()
  ) >= (r.negocio).max_pendientes_telefono then
    raise exception 'LIMITE_TELEFONO' using errcode = 'P0001';
  end if;

  v_inicio_dia := date_trunc('day', now() at time zone (r.negocio).zona_horaria) at time zone (r.negocio).zona_horaria;
  if (
    select count(*) from public.citas c
    where c.negocio_id = (r.negocio).id and c.creada_en >= v_inicio_dia
  ) >= (r.negocio).max_citas_dia then
    raise exception 'LIMITE_DIARIO' using errcode = 'P0001';
  end if;

  begin
    insert into public.citas (negocio_id, servicio_id, inicio, fin, nombre, telefono, nota)
    values ((r.negocio).id, p_servicio_id, p_inicio, v_fin, v_nombre, v_tel, v_nota)
    returning * into v_cita;
  exception when exclusion_violation then
    -- Otra persona ganó el horario mientras se llenaba el formulario.
    raise exception 'HORARIO_OCUPADO' using errcode = 'P0001';
  end;

  return json_build_object(
    'id', v_cita.id,
    'inicio', v_cita.inicio,
    'fin', v_cita.fin,
    'hora', to_char(v_cita.inicio at time zone (r.negocio).zona_horaria, 'HH24:MI'),
    'fecha', (v_cita.inicio at time zone (r.negocio).zona_horaria)::date,
    'servicio', r.servicio_nombre,
    'nombre', v_cita.nombre,
    'negocio', (r.negocio).nombre,
    'whatsapp', (r.negocio).whatsapp
  );
end;
$$;

-- ─── Permisos de ejecución ──────────────────────────────────────────────────
revoke execute on function public._slots(uuid, integer, date, date) from public, anon, authenticated;
revoke execute on function public._negocio_servicio(text, uuid) from public, anon, authenticated;

revoke execute on function public.datos_reserva(text) from public;
revoke execute on function public.dias_disponibles(text, uuid) from public;
revoke execute on function public.horarios_disponibles(text, uuid, date) from public;
revoke execute on function public.crear_cita(text, uuid, timestamptz, text, text, text, text) from public;

grant execute on function public.datos_reserva(text) to anon, authenticated;
grant execute on function public.dias_disponibles(text, uuid) to anon, authenticated;
grant execute on function public.horarios_disponibles(text, uuid, date) to anon, authenticated;
grant execute on function public.crear_cita(text, uuid, timestamptz, text, text, text, text) to anon, authenticated;
