-- ═══════════════════════════════════════════════════════════════════════════
-- Reservaciones · esquema base (multi-negocio)
-- Tablas, restricción anti-traslape, Row Level Security y permisos.
-- Ver PRD-reservas.md en la raíz del repositorio.
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;

-- ─── Tablas ──────────────────────────────────────────────────────────────────

create table public.negocios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  nombre text not null,
  -- Número completo para wa.me, sólo dígitos (ej. 5218715866828).
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,15}$'),
  zona_horaria text not null default 'America/Monterrey',
  -- Correo que recibe el aviso de cada cita nueva (opcional).
  email_notificaciones text,
  -- Reglas de agenda, configurables por negocio.
  anticipacion_min interval not null default interval '2 hours',
  dias_max integer not null default 30 check (dias_max between 1 and 180),
  paso_min integer not null default 30 check (paso_min in (10, 15, 20, 30, 60)),
  max_pendientes_telefono integer not null default 2 check (max_pendientes_telefono >= 1),
  -- Tope de citas creadas por día desde el widget (freno contra abuso).
  max_citas_dia integer not null default 40 check (max_citas_dia >= 1),
  creado_en timestamptz not null default now()
);

create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  -- Identificador estable para preseleccionar el servicio desde la landing.
  clave text not null check (clave ~ '^[a-z0-9-]{2,60}$'),
  nombre text not null,
  descripcion text,
  duracion_min integer not null check (duracion_min between 15 and 480 and duracion_min % 15 = 0),
  activo boolean not null default true,
  orden integer not null default 0,
  unique (negocio_id, clave)
);

create table public.horarios (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  -- 0 = domingo … 6 = sábado (igual que extract(dow)).
  dia_semana smallint not null check (dia_semana between 0 and 6),
  abre time not null,
  cierra time not null,
  check (abre < cierra)
);

create table public.bloqueos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  inicio timestamptz not null,
  fin timestamptz not null,
  motivo text check (char_length(motivo) <= 120),
  creado_en timestamptz not null default now(),
  check (inicio < fin)
);

create table public.citas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  servicio_id uuid not null references public.servicios (id) on delete restrict,
  inicio timestamptz not null,
  fin timestamptz not null,
  nombre text not null check (char_length(nombre) between 2 and 80),
  telefono text not null check (telefono ~ '^[0-9]{10}$'),
  nota text check (char_length(nota) <= 280),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmada', 'cancelada')),
  creada_en timestamptz not null default now(),
  actualizada_en timestamptz not null default now(),
  notificada_en timestamptz,
  check (inicio < fin),
  -- Imposible encimar dos citas activas del mismo negocio, aunque lleguen al mismo
  -- tiempo. Rango semiabierto [inicio, fin): una cita puede empezar justo cuando otra termina.
  constraint citas_sin_traslape exclude using gist (
    negocio_id with =,
    tstzrange(inicio, fin, '[)') with &&
  ) where (estado <> 'cancelada')
);

create index citas_negocio_inicio_idx on public.citas (negocio_id, inicio);
create index citas_telefono_idx on public.citas (negocio_id, telefono) where estado = 'pendiente';
create index bloqueos_negocio_idx on public.bloqueos (negocio_id, inicio);
create index horarios_negocio_idx on public.horarios (negocio_id, dia_semana);

create table public.admins (
  user_id uuid not null references auth.users (id) on delete cascade,
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  primary key (user_id, negocio_id)
);

-- Ajustes internos (URL de funciones, etc.). RLS sin políticas: nadie los lee por la API.
create table public.ajustes_internos (
  clave text primary key,
  valor text not null
);

-- Mantiene actualizada_en al cambiar una cita.
create function public.tocar_actualizada_en() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizada_en := now();
  return new;
end;
$$;

create trigger citas_actualizada_en before update on public.citas
for each row execute function public.tocar_actualizada_en();

-- ─── ¿El usuario actual administra este negocio? ────────────────────────────
-- security definer para que las políticas no dependan de RLS sobre admins.
create function public.es_admin(p_negocio uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admins a
    where a.negocio_id = p_negocio and a.user_id = (select auth.uid())
  );
$$;

-- ─── Row Level Security ─────────────────────────────────────────────────────

alter table public.negocios enable row level security;
alter table public.servicios enable row level security;
alter table public.horarios enable row level security;
alter table public.bloqueos enable row level security;
alter table public.citas enable row level security;
alter table public.admins enable row level security;
alter table public.ajustes_internos enable row level security;

-- Público: sólo servicios activos. Todo lo demás pasa por las funciones RPC.
create policy "publico lee servicios activos" on public.servicios
  for select to anon using (activo);

-- Clínica: sólo su negocio.
create policy "admin lee su negocio" on public.negocios
  for select to authenticated using (public.es_admin(id));

create policy "admin gestiona servicios" on public.servicios
  for all to authenticated using (public.es_admin(negocio_id)) with check (public.es_admin(negocio_id));

create policy "admin gestiona horarios" on public.horarios
  for all to authenticated using (public.es_admin(negocio_id)) with check (public.es_admin(negocio_id));

create policy "admin gestiona bloqueos" on public.bloqueos
  for all to authenticated using (public.es_admin(negocio_id)) with check (public.es_admin(negocio_id));

create policy "admin lee citas" on public.citas
  for select to authenticated using (public.es_admin(negocio_id));

create policy "admin actualiza citas" on public.citas
  for update to authenticated using (public.es_admin(negocio_id)) with check (public.es_admin(negocio_id));

create policy "usuario ve sus negocios" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- ─── Permisos de tabla (además de RLS) ──────────────────────────────────────

revoke all on public.negocios, public.servicios, public.horarios, public.bloqueos,
  public.citas, public.admins, public.ajustes_internos from anon, authenticated;

grant select on public.servicios to anon;

grant select on public.negocios, public.admins to authenticated;
grant select, insert, update, delete on public.servicios, public.horarios, public.bloqueos to authenticated;
-- La clínica sólo cambia el estado de una cita (confirmar / cancelar).
grant select on public.citas to authenticated;
grant update (estado) on public.citas to authenticated;

revoke execute on function public.es_admin(uuid) from public, anon;
grant execute on function public.es_admin(uuid) to authenticated;
revoke execute on function public.tocar_actualizada_en() from public, anon, authenticated;
