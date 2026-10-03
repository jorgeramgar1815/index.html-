-- ═══════════════════════════════════════════════════════════════════════════
-- Historial anual de citas atendidas.
-- Cita atendida = confirmada y ya terminada. El 1 de enero se "cierra" el año
-- anterior de cada negocio: se guarda su resumen (no cambia aunque después se
-- borren citas) y se deja un aviso en la campana del panel.
-- ═══════════════════════════════════════════════════════════════════════════

create table public.historiales_anuales (
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  anio integer not null check (anio between 2000 and 2200),
  atendidas integer not null default 0,
  canceladas integer not null default 0,
  sin_confirmar integer not null default 0,
  clientes integer not null default 0,
  -- [{"servicio": "Valoración", "total": 120}, …] de mayor a menor.
  por_servicio jsonb not null default '[]',
  -- 12 números: citas atendidas de enero a diciembre.
  por_mes jsonb not null default '[]',
  cerrado_en timestamptz not null default now(),
  primary key (negocio_id, anio)
);

alter table public.historiales_anuales enable row level security;
create policy "admin lee su historial" on public.historiales_anuales
  for select to authenticated using (public.es_admin(negocio_id));
revoke all on public.historiales_anuales from anon, authenticated;
grant select on public.historiales_anuales to authenticated;

-- Avisos: nuevo tipo "historial_anual" (con el año).
alter table public.avisos add column anio integer;
alter table public.avisos drop constraint avisos_tipo_check;
alter table public.avisos add constraint avisos_tipo_check check (tipo in ('cita_nueva', 'historial_anual'));

-- Cierra un año para todos los negocios (por omisión, el año que acaba de terminar
-- en la zona horaria de cada negocio). Es idempotente: volver a correrlo recalcula
-- el resumen pero no repite el aviso.
create function public.cerrar_anio(p_anio integer default null) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  n record;
  v_anio integer;
  v_desde timestamptz;
  v_hasta timestamptz;
  v_total integer;
  v_cerrados integer := 0;
begin
  for n in select id, zona_horaria from public.negocios loop
    v_anio := coalesce(p_anio, extract(year from (now() at time zone n.zona_horaria))::integer - 1);
    v_desde := make_timestamptz(v_anio, 1, 1, 0, 0, 0, n.zona_horaria);
    v_hasta := make_timestamptz(v_anio + 1, 1, 1, 0, 0, 0, n.zona_horaria);

    select count(*) into v_total from public.citas c
    where c.negocio_id = n.id and c.inicio >= v_desde and c.inicio < v_hasta;
    continue when v_total = 0;

    insert into public.historiales_anuales as h
      (negocio_id, anio, atendidas, canceladas, sin_confirmar, clientes, por_servicio, por_mes, cerrado_en)
    select
      n.id, v_anio,
      count(*) filter (where c.estado = 'confirmada' and c.fin <= now()),
      count(*) filter (where c.estado = 'cancelada'),
      count(*) filter (where c.estado = 'pendiente' and c.fin <= now()),
      count(distinct c.telefono) filter (where c.estado = 'confirmada' and c.fin <= now()),
      coalesce((
        select jsonb_agg(jsonb_build_object('servicio', s.nombre, 'total', x.total) order by x.total desc, s.nombre)
        from (
          select c2.servicio_id, count(*) as total from public.citas c2
          where c2.negocio_id = n.id and c2.inicio >= v_desde and c2.inicio < v_hasta
            and c2.estado = 'confirmada' and c2.fin <= now()
          group by c2.servicio_id
        ) x join public.servicios s on s.id = x.servicio_id
      ), '[]'::jsonb),
      (
        select jsonb_agg(coalesce(m.total, 0) order by g.mes)
        from generate_series(1, 12) g(mes)
        left join (
          select extract(month from (c3.inicio at time zone n.zona_horaria))::integer as mes, count(*) as total
          from public.citas c3
          where c3.negocio_id = n.id and c3.inicio >= v_desde and c3.inicio < v_hasta
            and c3.estado = 'confirmada' and c3.fin <= now()
          group by 1
        ) m on m.mes = g.mes
      ),
      now()
    from public.citas c
    where c.negocio_id = n.id and c.inicio >= v_desde and c.inicio < v_hasta
    on conflict (negocio_id, anio) do update set
      atendidas = excluded.atendidas, canceladas = excluded.canceladas, sin_confirmar = excluded.sin_confirmar,
      clientes = excluded.clientes, por_servicio = excluded.por_servicio, por_mes = excluded.por_mes;

    if not exists (select 1 from public.avisos a where a.negocio_id = n.id and a.tipo = 'historial_anual' and a.anio = v_anio) then
      insert into public.avisos (negocio_id, tipo, anio) values (n.id, 'historial_anual', v_anio);
    end if;
    v_cerrados := v_cerrados + 1;
  end loop;
  return v_cerrados;
end;
$$;
revoke execute on function public.cerrar_anio(integer) from public, anon, authenticated;

-- Programación: 1 de enero a las 12:00 UTC (ya es 1 de enero en todo el continente).
-- Sólo en Supabase (pg_cron); en un Postgres sin pg_cron se omite.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('cerrar-anio', '0 12 1 1 *', 'select public.cerrar_anio()');
  end if;
end;
$$;
