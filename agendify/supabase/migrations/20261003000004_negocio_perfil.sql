-- ═══════════════════════════════════════════════════════════════════════════
-- Perfil público del negocio para la página de reservas de Agendify:
-- dirección y giro (ej. "Clínica dental"). datos_reserva los devuelve.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.negocios
  add column if not exists direccion text check (char_length(direccion) <= 200),
  add column if not exists giro text check (char_length(giro) <= 60);

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

revoke execute on function public.datos_reserva(text) from public;
grant execute on function public.datos_reserva(text) to anon, authenticated;
