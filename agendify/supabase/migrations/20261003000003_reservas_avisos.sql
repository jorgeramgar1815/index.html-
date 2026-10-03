-- ═══════════════════════════════════════════════════════════════════════════
-- Reservaciones · avisos de cita nueva
-- 1) Tiempo real: el panel de la clínica recibe las citas nuevas al instante.
-- 2) Correo: cada cita nueva llama a la Edge Function `notificar-cita`.
-- Específico de Supabase; en un Postgres sin estas piezas se omite sin fallar.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) Realtime (respeta RLS: cada clínica sólo recibe sus citas).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.citas;
  end if;
end;
$$;

-- 2) Llamada HTTP asíncrona con pg_net (si está disponible).
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_net with schema extensions;
  end if;
end;
$$;

-- La URL de las funciones se guarda en ajustes_internos (clave 'url_funciones'),
-- p. ej. https://<ref>.supabase.co/functions/v1. Sin ese ajuste no se llama a nada.
create function public.avisar_cita_nueva() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_url text;
begin
  select valor into v_url from public.ajustes_internos where clave = 'url_funciones';
  if v_url is null or not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'net' and p.proname = 'http_post'
  ) then
    return new;
  end if;
  begin
    execute 'select net.http_post(url := $1, body := $2, headers := $3)'
      using v_url || '/notificar-cita',
            jsonb_build_object('cita_id', new.id),
            jsonb_build_object('Content-Type', 'application/json');
  exception when others then
    -- Un fallo del aviso nunca debe impedir que se guarde la cita.
    raise warning 'avisar_cita_nueva: %', sqlerrm;
  end;
  return new;
end;
$$;

revoke execute on function public.avisar_cita_nueva() from public, anon, authenticated;

create trigger citas_avisar_nueva after insert on public.citas
for each row execute function public.avisar_cita_nueva();
