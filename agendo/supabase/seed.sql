-- ═══════════════════════════════════════════════════════════════════════════
-- Datos iniciales de Dental MX (simulación).
-- PLACEHOLDER: duraciones y horario inventados; confirmar con la clínica.
-- El horario coincide con el publicado en la landing (src/data/site.ts).
-- ═══════════════════════════════════════════════════════════════════════════

with negocio as (
  insert into public.negocios (slug, nombre, giro, direccion, whatsapp, zona_horaria)
  values ('dental-mx', 'Dental MX', 'Clínica dental',
          'C. del Mar 1000, Local 16, Torreón Residencial, Torreón, Coah.',
          '5218715866828', 'America/Monterrey')
  returning id
),
servicios as (
  -- La clave coincide con el slug del servicio en la landing para preseleccionarlo.
  insert into public.servicios (negocio_id, clave, nombre, descripcion, duracion_min, orden)
  select negocio.id, s.clave, s.nombre, s.descripcion, s.duracion, s.orden
  from negocio, (values
    ('atencion-personalizada', 'Valoración', 'Revisión completa y plan de tratamiento.', 30, 1),
    ('ortodoncia', 'Ortodoncia', 'Consulta, colocación o ajuste de brackets.', 60, 2),
    ('blanqueamientos', 'Blanqueamiento', 'Sesión de blanqueamiento en consultorio.', 90, 3),
    ('resinas-esteticas', 'Resinas estéticas', 'Restauración del color natural del diente.', 60, 4),
    ('implantes', 'Implantes', 'Valoración y seguimiento de implantes.', 60, 5),
    ('piezas-dentales', 'Piezas dentales', 'Coronas, puentes y prótesis.', 60, 6)
  ) as s (clave, nombre, descripcion, duracion, orden)
  returning 1
)
insert into public.horarios (negocio_id, dia_semana, abre, cierra)
select negocio.id, h.dia, h.abre::time, h.cierra::time
from negocio, (values
  -- Lunes a viernes: 10:00–14:00 y 16:00–20:00 (comida de 14:00 a 16:00)
  (1, '10:00', '14:00'), (1, '16:00', '20:00'),
  (2, '10:00', '14:00'), (2, '16:00', '20:00'),
  (3, '10:00', '14:00'), (3, '16:00', '20:00'),
  (4, '10:00', '14:00'), (4, '16:00', '20:00'),
  (5, '10:00', '14:00'), (5, '16:00', '20:00'),
  -- Sábado: 10:00–14:00
  (6, '10:00', '14:00')
) as h (dia, abre, cierra);
