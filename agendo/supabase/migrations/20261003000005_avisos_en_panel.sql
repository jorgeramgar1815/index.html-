-- ═══════════════════════════════════════════════════════════════════════════
-- Avisos dentro del panel (reemplazan el correo).
-- Cada cita nueva crea un aviso para su negocio. El panel los recibe en tiempo
-- real (campana con contador) y quedan guardados: si el panel estaba cerrado,
-- los avisos sin leer aparecen al entrar.
-- ═══════════════════════════════════════════════════════════════════════════

-- Se apaga el aviso por correo (Edge Function + pg_net de la migración 3).
alter table public.citas disable trigger citas_avisar_nueva;

create table public.avisos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  cita_id uuid references public.citas (id) on delete cascade,
  tipo text not null default 'cita_nueva' check (tipo in ('cita_nueva')),
  creado_en timestamptz not null default now(),
  leido_en timestamptz
);
create index avisos_negocio_recientes on public.avisos (negocio_id, creado_en desc);
create index avisos_cita on public.avisos (cita_id);

alter table public.avisos enable row level security;

create policy "admin lee sus avisos" on public.avisos
  for select to authenticated using (public.es_admin(negocio_id));
create policy "admin marca sus avisos" on public.avisos
  for update to authenticated using (public.es_admin(negocio_id)) with check (public.es_admin(negocio_id));

revoke all on public.avisos from anon, authenticated;
grant select on public.avisos to authenticated;
-- La clínica sólo puede marcarlos como leídos.
grant update (leido_en) on public.avisos to authenticated;

create function public.crear_aviso_cita() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.avisos (negocio_id, cita_id, tipo) values (new.negocio_id, new.id, 'cita_nueva');
  return new;
end;
$$;
revoke execute on function public.crear_aviso_cita() from public, anon, authenticated;

create trigger citas_crear_aviso after insert on public.citas
for each row execute function public.crear_aviso_cita();

-- Tiempo real (respeta RLS: cada negocio sólo recibe sus avisos).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.avisos;
  end if;
end;
$$;
