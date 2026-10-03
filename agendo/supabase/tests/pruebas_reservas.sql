-- ═══════════════════════════════════════════════════════════════════════════
-- Pruebas de las reglas de reservación (criterios de aceptación del PRD).
-- Corre todo dentro de una transacción y al final hace ROLLBACK: no deja datos.
-- Uso: pegar en el SQL Editor de Supabase, o `psql -f supabase/tests/pruebas_reservas.sql`.
-- Cada prueba imprime "OK ..." o falla con un error que dice qué regla no se cumplió.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- Utilidades de prueba (temporales).
create function pg_temp.ok(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is not true then raise exception 'FALLA: %', msg; end if;
  raise notice 'OK  %', msg;
end $$;

create function pg_temp.error_de(sql text) returns text language plpgsql as $$
begin
  execute sql;
  return null;
exception when others then
  return sqlerrm;
end $$;

-- Fechas de referencia en hora de Torreón: el próximo lunes con al menos 2 días de margen,
-- y el domingo anterior a ese lunes.
create temp table ref as
select lunes, lunes - 1 as domingo,
       (select id from public.servicios where clave = 'atencion-personalizada') as valoracion,
       (select id from public.servicios where clave = 'ortodoncia') as ortodoncia,
       (select id from public.negocios where slug = 'dental-mx') as negocio
from (
  select hoy + case when d < 2 then d + 7 else d end as lunes
  from (select (now() at time zone 'America/Monterrey')::date as hoy) h,
       lateral (select ((8 - extract(isodow from h.hoy))::int % 7) as d) x
) l;

grant select on ref to anon, authenticated;

-- Hora local de Torreón → timestamptz.
create function pg_temp.t(fecha date, hhmm text) returns timestamptz language sql as $$
  select (fecha + hhmm::time) at time zone 'America/Monterrey'
$$;

-- ─── Como público (anon key) ────────────────────────────────────────────────
set local role anon;

select pg_temp.ok(json_array_length(public.datos_reserva('dental-mx') -> 'servicios') = 6,
  'datos_reserva devuelve los 6 servicios activos');

select pg_temp.ok(pg_temp.error_de($$select * from public.citas$$) like '%permission denied%',
  'el público no puede leer la tabla citas');

select pg_temp.ok(pg_temp.error_de($$select * from public.avisos$$) like '%permission denied%',
  'el público no puede leer avisos');

select pg_temp.ok(pg_temp.error_de($$insert into public.citas (negocio_id, servicio_id, inicio, fin, nombre, telefono) values (gen_random_uuid(), gen_random_uuid(), now(), now() + interval '1h', 'X', '8711111111')$$) like '%permission denied%',
  'el público no puede insertar citas directamente');
select pg_temp.ok(pg_temp.error_de($$select * from public.negocios$$) like '%permission denied%',
  'el público no puede leer la tabla negocios');
select pg_temp.ok((select count(*) from public.servicios) = 6,
  'el público sí puede leer servicios activos');

-- Horario del lunes para Valoración (30 min): 10:00–13:30 y 16:00–19:30.
select pg_temp.ok((select count(*) from public.horarios_disponibles('dental-mx', valoracion, lunes)) = 16
                  and (select min(hora) from public.horarios_disponibles('dental-mx', valoracion, lunes)) = '10:00'
                  and (select max(hora) from public.horarios_disponibles('dental-mx', valoracion, lunes)) = '19:30'
                  and not exists (select 1 from public.horarios_disponibles('dental-mx', valoracion, lunes) where hora between '14:00' and '15:59'),
  'valoración: 16 horarios de 10:00 a 19:30, sin la hora de comida')
from ref;

select pg_temp.ok(not exists (select 1 from public.horarios_disponibles('dental-mx', ortodoncia, lunes) where hora in ('13:30', '19:30'))
                  and exists (select 1 from public.horarios_disponibles('dental-mx', ortodoncia, lunes) where hora = '13:00'),
  'un servicio de 60 min no se ofrece a las 13:30 si se cierra a las 14:00')
from ref;

select pg_temp.ok(not exists (select 1 from public.horarios_disponibles('dental-mx', valoracion, domingo)),
  'domingo: sin horarios')
from ref;

select pg_temp.ok(not exists (
  select 1 from public.horarios_disponibles('dental-mx', valoracion, (now() at time zone 'America/Monterrey')::date)
  where inicio < now() + interval '2 hours'),
  'nunca se ofrecen horarios en el pasado ni a menos de 2 horas')
from ref;

select pg_temp.ok(not exists (select 1 from public.dias_disponibles('dental-mx', valoracion) d where extract(dow from d) = 0)
                  and (select max(d) from public.dias_disponibles('dental-mx', valoracion) d) <= (now() at time zone 'America/Monterrey')::date + 30,
  'el calendario no muestra domingos ni más de 30 días')
from ref;

select pg_temp.ok(to_char((select inicio from public.horarios_disponibles('dental-mx', valoracion, lunes) where hora = '10:00') at time zone 'UTC', 'HH24:MI') = '16:00',
  'las 10:00 de Torreón son las 16:00 UTC (zona America/Monterrey)')
from ref;

-- Crear citas
select pg_temp.ok((public.crear_cita('dental-mx', ortodoncia, pg_temp.t(lunes, '10:00'), '  Ana   López ', '+52 1 871 111 1111', 'Primera vez') ->> 'hora') = '10:00',
  'cita válida de 60 min a las 10:00 (teléfono con +52 1 se normaliza)')
from ref;

select pg_temp.ok(pg_temp.error_de(format($$select public.crear_cita('dental-mx', %L, %L, 'Beto', '8712222222')$$, valoracion, pg_temp.t(lunes, '10:30'))) = 'HORARIO_NO_DISPONIBLE',
  'una cita encimada (10:30 dentro de 10:00–11:00) se rechaza')
from ref;

select pg_temp.ok(exists (select 1 from public.horarios_disponibles('dental-mx', valoracion, lunes) where hora = '11:00')
                  and not exists (select 1 from public.horarios_disponibles('dental-mx', valoracion, lunes) where hora in ('10:00', '10:30')),
  'el horario ocupado desaparece; 11:00 (justo al terminar) sigue libre')
from ref;

select pg_temp.ok(pg_temp.error_de(format($$select public.crear_cita('dental-mx', %L, %L, 'Beto', '8712222222')$$, valoracion, pg_temp.t(lunes, '14:30'))) = 'HORARIO_NO_DISPONIBLE',
  'fuera de horario (14:30, hora de comida) se rechaza')
from ref;

select pg_temp.ok(pg_temp.error_de(format($$select public.crear_cita('dental-mx', %L, %L, 'Beto', '8712222222')$$, valoracion, pg_temp.t(lunes, '11:15'))) = 'HORARIO_NO_DISPONIBLE',
  'un horario fuera de los pasos de 30 min (11:15) se rechaza')
from ref;

select pg_temp.ok(pg_temp.error_de(format($$select public.crear_cita('dental-mx', %L, %L, 'Beto', '8712222222')$$, valoracion, date_trunc('hour', now()) + interval '1 hour')) = 'HORARIO_NO_DISPONIBLE',
  'con menos de 2 horas de anticipación se rechaza')
from ref;

select pg_temp.ok(pg_temp.error_de(format($$select public.crear_cita('dental-mx', %L, %L, 'Beto', '871222')$$, valoracion, pg_temp.t(lunes, '12:00'))) = 'TELEFONO_INVALIDO',
  'teléfono de menos de 10 dígitos se rechaza')
from ref;

select pg_temp.ok(pg_temp.error_de(format($$select public.crear_cita('dental-mx', %L, %L, 'Bot', '8713333333', null, 'http://spam')$$, valoracion, pg_temp.t(lunes, '12:00'))) = 'SOLICITUD_INVALIDA',
  'el campo trampa lleno (bot) se rechaza')
from ref;

-- Límite de 2 citas pendientes por teléfono (Ana ya tiene una).
select pg_temp.ok((public.crear_cita('dental-mx', valoracion, pg_temp.t(lunes, '12:00'), 'Ana López', '8711111111') ->> 'hora') = '12:00',
  'segunda cita pendiente del mismo teléfono: permitida')
from ref;

select pg_temp.ok(pg_temp.error_de(format($$select public.crear_cita('dental-mx', %L, %L, 'Ana López', '871 111 1111')$$, valoracion, pg_temp.t(lunes, '17:00'))) = 'LIMITE_TELEFONO',
  'un teléfono con 2 citas pendientes no puede agendar una tercera')
from ref;

reset role;

-- ─── Como la clínica (usuario autenticado) ──────────────────────────────────
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000a001', 'recepcion@prueba.local'),
  ('00000000-0000-0000-0000-00000000a002', 'intruso@prueba.local');
insert into public.admins (user_id, negocio_id)
select '00000000-0000-0000-0000-00000000a001', negocio from ref;

set local role authenticated;

set local request.jwt.claim.sub = '00000000-0000-0000-0000-00000000a002';
select pg_temp.ok((select count(*) from public.citas) = 0, 'un usuario que no es admin del negocio no ve citas');
select pg_temp.ok((select count(*) from public.avisos) = 0, 'un usuario que no es admin del negocio no ve avisos');

set local request.jwt.claim.sub = '00000000-0000-0000-0000-00000000a001';
select pg_temp.ok((select count(*) from public.citas) = 2, 'la clínica ve las citas de su negocio');

select pg_temp.ok((select count(*) from public.avisos where leido_en is null) = 2,
  'cada cita nueva deja un aviso sin leer en el panel');

update public.avisos set leido_en = now();
select pg_temp.ok((select count(*) from public.avisos where leido_en is null) = 0, 'la clínica marca sus avisos como leídos');

select pg_temp.ok(pg_temp.error_de($$update public.avisos set tipo = 'cita_nueva'$$) like '%permission denied%',
  'de un aviso la clínica sólo cambia si está leído');

select pg_temp.ok(pg_temp.error_de($$update public.citas set nombre = 'Otro'$$) like '%permission denied%',
  'la clínica no puede editar los datos del paciente, sólo el estado');

update public.citas set estado = 'confirmada'
where inicio = (select pg_temp.t(lunes, '12:00') from ref);
update public.citas set estado = 'cancelada'
where inicio = (select pg_temp.t(lunes, '10:00') from ref);
select pg_temp.ok((select count(*) from public.citas where estado = 'confirmada') = 1
                  and (select count(*) from public.citas where estado = 'cancelada') = 1,
  'la clínica confirma y cancela citas');

insert into public.bloqueos (negocio_id, inicio, fin, motivo)
select negocio, pg_temp.t(lunes, '17:00'), pg_temp.t(lunes, '18:00'), 'Junta' from ref;

reset role;
set local role anon;

select pg_temp.ok(exists (select 1 from public.horarios_disponibles('dental-mx', valoracion, lunes) where hora = '10:00'),
  'una cita cancelada libera su horario')
from ref;

select pg_temp.ok(not exists (select 1 from public.horarios_disponibles('dental-mx', valoracion, lunes) where hora in ('17:00', '17:30'))
                  and exists (select 1 from public.horarios_disponibles('dental-mx', valoracion, lunes) where hora = '18:00'),
  'un bloqueo oculta esos horarios')
from ref;

reset role;

-- Tope diario de citas desde el widget (freno contra abuso).
update public.negocios set max_citas_dia = 2 where slug = 'dental-mx';
set local role anon;
select pg_temp.ok(pg_temp.error_de(format($$select public.crear_cita('dental-mx', %L, %L, 'Carla', '8714444444')$$, valoracion, pg_temp.t(lunes, '13:00'))) = 'LIMITE_DIARIO',
  'al llegar al tope diario de citas se rechazan nuevas')
from ref;
reset role;

rollback;
