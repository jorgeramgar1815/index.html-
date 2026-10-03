# PRD — Agendo, sistema de reservaciones (primer cliente: Dental MX)

Oct 2, 2026 · @Jorge · Ajustado al proyecto real el Oct 3, 2026

## Resumen

**Agendo** (carpeta `agendo/`, Astro estático en Vercel) es un software de reservas propio, con diseño neutro que no usa los colores de ningún negocio, para usarlo con varios clientes. Cada negocio tiene su página de reservas en `/<slug>` (ej. `/dental-mx`) y un panel en `/panel` personalizado con su nombre. La landing de Dental MX (`dental-mx/`) sólo enlaza a su página en Agendo. El backend vive en Supabase y es multi-negocio (columna `negocio_id`).

**Objetivos**

- El paciente agenda una cita en menos de 1 minuto desde el celular.
- Imposible agendar dos citas en el mismo horario.
- La clínica ve y gestiona su agenda sin tocar código, y se entera al instante de cada cita nueva.
- Costo de operación: $0 en los planes gratuitos de Supabase, Vercel y Resend.

## Decisiones (Oct 3)

| Tema | Decisión |
| --- | --- |
| Producto | Software aparte (Agendo), neutro y multi-negocio. Muestra el nombre, giro y dirección del negocio; colores propios (índigo sobre blanco). |
| Botones | Los botones "Agendar" de la landing son enlaces a `agendo-reservas.vercel.app/dental-mx` (con `?servicio=` cuando aplica). WhatsApp queda para preguntas y como respaldo si no hay enlace (`PUBLIC_AGENDO_URL` vacía). |
| Horario y duraciones | Simulación: horario de la landing (L–V 10:00–14:00 y 16:00–20:00, sábado 10:00–14:00) y duraciones inventadas. Confirmar con la clínica. |
| Aviso de cita nueva | Dentro del panel (en lugar de correo): cada cita nueva deja un aviso guardado; campana con contador y bandeja, en tiempo real con sonido y notificación del navegador. |
| Supabase | Proyecto nuevo `dental-mx` en la organización de Jorge (plan gratis, us-east-1). |
| Rama | PR #2 del sitio fusionado a `main`; las reservas se desarrollan después. |

## Alcance del MVP

| Entra en el MVP | Queda para después |
| --- | --- |
| Catálogo de servicios con duración | Varios dentistas con agenda propia |
| Horario semanal y bloqueos de fechas u horas | Pagos o anticipos en línea |
| Página de reservas por negocio (`/<slug>`) | Recordatorios automáticos al paciente (SMS o correo) |
| Confirmación por WhatsApp con link wa.me | Sincronización con Google Calendar |
| Panel de la clínica: ver, confirmar, cancelar, bloquear | Historial clínico o datos médicos |
| Avisos de cita nueva dentro del panel (bandeja + tiempo real con sonido) | Que el paciente cancele o cambie su cita solo |
| Base multi-negocio y tope diario contra abuso | Panel para administrar varios clientes desde una sola cuenta |

No se guardan datos médicos: sólo nombre, teléfono, servicio y una nota corta opcional.

## Servicios simulados (seed)

| Clave (slug de la landing) | Servicio | Duración |
| --- | --- | --- |
| atencion-personalizada | Valoración | 30 min |
| ortodoncia | Ortodoncia | 60 min |
| blanqueamientos | Blanqueamiento | 90 min |
| resinas-esteticas | Resinas estéticas | 60 min |
| implantes | Implantes | 60 min |
| piezas-dentales | Piezas dentales | 60 min |

La clave permite que un enlace llegue con el servicio ya elegido: `/dental-mx?servicio=ortodoncia`.

## Arquitectura

```mermaid
flowchart LR
  L["Landing Dental MX<br/>(sólo enlaces)"]
  subgraph Vercel["Vercel · Agendo (Astro)"]
    W["Página de reservas<br/>/&lt;slug&gt; (reservar.ts)"]
    P["Panel del negocio<br/>/panel (panel.ts + supabase-js)"]
  end
  subgraph Supabase
    R["Funciones RPC<br/>datos_reserva · dias_disponibles<br/>horarios_disponibles · crear_cita"]
    A["Auth + RLS + Realtime"]
    DB[("Postgres<br/>tablas + exclusión")]
  end
  L -- enlace --> W
  W -- anon key --> R
  P -- sesión de usuario --> A
  R --> DB
  A --> DB
  DB -- trigger: aviso por cita nueva --> A
```

- La página de reservas usa la anon key y sólo llama funciones RPC (con `fetch`, sin librería). Las tablas quedan cerradas por RLS. `vercel.json` reescribe `/<slug>` a la página de reservas.
- El panel entra con Supabase Auth y sólo ve su negocio. Recibe las citas nuevas por Realtime y, de respaldo, revisa cada minuto.
- Agendo necesita `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` (proyecto Vercel `agendo`, raíz `agendo/`). La landing ya no usa Supabase.

## Modelo de datos y seguridad

Archivos: `agendo/supabase/migrations/` (7 migraciones), `seed.sql`, `configurar.sql`, `tests/pruebas_reservas.sql`.

| Tabla | Campos clave | Notas |
| --- | --- | --- |
| negocios | id, slug, nombre, giro, direccion, whatsapp, zona_horaria, email_notificaciones, reglas | Reglas configurables: anticipación (2 h), días máx. (30), paso (30 min), pendientes por teléfono (2), tope diario (40) |
| servicios | id, negocio_id, clave, nombre, duracion_min, activo | |
| horarios | negocio_id, dia_semana (0–6), abre, cierra | Varias filas por día (hora de comida) |
| bloqueos | id, negocio_id, inicio, fin, motivo | |
| citas | id, negocio_id, servicio_id, inicio, fin, nombre, telefono, nota, estado, creada_en, notificada_en | estado: pendiente, confirmada, cancelada |
| avisos | id, negocio_id, cita_id, tipo, creado_en, leido_en | Uno por cita nueva (trigger); la clínica sólo puede marcarlos como leídos |
| historiales_anuales | negocio_id, anio, atendidas, canceladas, sin_confirmar, clientes, por_servicio, por_mes, cerrado_en | Resumen congelado de cada año cerrado; la clínica sólo lo lee |
| admins | user_id, negocio_id | Liga usuarios de Supabase Auth con su negocio |
| ajustes_internos | clave, valor | URL de funciones; nadie la lee por la API |

**Reglas de seguridad**

- RLS activo en todas las tablas; permisos de tabla explícitos además de RLS.
- Público (anon): sólo lee servicios activos; no puede leer ni insertar citas, ni leer negocios.
- Público agenda y consulta sólo con funciones `security definer` (`search_path` vacío).
- Restricción de exclusión `btree_gist` sobre `tstzrange(inicio, fin, '[)')` por negocio, excluyendo canceladas: impide citas encimadas aunque lleguen al mismo tiempo; permite citas seguidas.
- La clínica sólo ve y edita lo de su negocio; de las citas sólo puede cambiar el `estado` y sólo puede borrar las canceladas.

**Reglas de negocio en `crear_cita`** (todas del lado del servidor)

- El inicio debe ser exactamente un horario ofrecido: dentro del horario, fuera de bloqueos y citas, en pasos de 30 min, con 2 h mínimas de anticipación y máximo 30 días.
- La hora de fin la calcula la base de datos con la duración del servicio.
- Teléfono de 10 dígitos (acepta +52 / 521 y lo normaliza); máximo 2 citas pendientes por teléfono.
- Tope de citas creadas por día (freno contra bots que llamen la API directo) y campo trampa.
- Errores con código (`HORARIO_OCUPADO`, `LIMITE_TELEFONO`, …) que la página de reservas traduce a español.

## Requisitos funcionales (implementados)

**Página de reservas** — `agendo/src/pages/reservar.astro`, `src/scripts/reservar.ts` (ruta `/<slug>`)

- Encabezado con el negocio (iniciales, nombre, giro y dirección) y pasos 1-2-3; resumen lateral en escritorio.
- Servicio → calendario de 30 días (sólo días con horarios) → horas libres (mañana / tarde) → datos → éxito con "Avisar por WhatsApp".
- Estados de carga, "sin horarios ese día", errores claros y salida a WhatsApp; negocio inexistente muestra un aviso.
- Si alguien ganó el horario, avisa y recarga las horas.

**Panel** — `agendo/src/pages/panel.astro`, `src/scripts/panel.ts` (ruta `/panel`, `noindex`)

- Login con correo y contraseña (Supabase Auth); el panel toma el nombre del negocio del usuario.
- Inicio: saludo con el nombre del negocio, números del día (citas hoy, por confirmar, próximos 7 días, reservas nuevas), siguiente cita, "Por confirmar" con botones grandes y la línea del día.
- Agenda por día o semana (columnas en escritorio, lista en celular), filtros por estado y detalle de cita.
- Confirmar, Cancelar (libera el horario) y WhatsApp al cliente con mensaje listo.
- Eliminar del historial: sólo citas canceladas (botón "Eliminar" y, con el filtro "Canceladas", "Eliminar las N"). La base de datos lo exige (política RLS).
- Bloqueos: día completo o rango de horas, con lista y opción de quitar.
- Historial: por año, citas atendidas (confirmadas y ya terminadas), clientes, canceladas y las que pasaron sin confirmar; gráfica por mes, desglose por servicio, lista por mes con buscador y "Descargar Excel" (CSV). El año en curso se calcula en vivo; el 1 de enero `cerrar_anio()` (pg_cron, 12:00 UTC) guarda el resumen del año anterior en `historiales_anuales` y deja un aviso "Tu historial AAAA está listo".
- Mi página: enlace de reservas (copiar, abrir, compartir), servicios visibles (interruptor) y horario.
- Avisos: campana con contador de no leídos y bandeja ("Nueva cita · nombre", servicio, día y hora, hace cuánto). Tocar un aviso abre la cita; "Marcar todo como leído". Llegan en tiempo real con sonido, notificación del navegador y contador en la pestaña; los que llegaron con el panel cerrado aparecen al entrar ("Tienes N avisos nuevos").
- Barra lateral en escritorio y pestañas abajo en celular.

**Avisos** — migración 5: tabla `avisos` + trigger en `citas`. Reemplazó al correo (Resend), que quedó apagado.

**Mantenimiento** — `.github/workflows/supabase-keepalive.yml` consulta Supabase dos veces por semana para que el plan gratis no se pause.

## Puesta en marcha

Proyecto Supabase: `dental-mx` (ref `pfqswksorjvxtpbcuoam`, us-east-1, plan gratis).

- [x] Proyecto creado; 7 migraciones aplicadas y seed cargado.
- [x] Tarea programada `cerrar-anio` (pg_cron, 1 de enero 12:00 UTC) activa; cierre probado en producción dentro de una transacción que se deshizo.
- [x] Pruebas (`supabase/tests/pruebas_reservas.sql`) en la base real: todas pasan.
- [x] Realtime activo en `citas` y `avisos`; trigger de avisos probado en producción (dentro de una transacción que se deshizo).
- [x] Aviso por correo apagado (trigger `citas_avisar_nueva` desactivado). La Edge Function `notificar-cita` sigue publicada pero ya nadie la llama; se puede borrar en Supabase → Edge Functions.
- [x] Usuario de la clínica creado y ligado a Dental MX (credenciales entregadas por chat; cambiar la contraseña).
- [x] Proyecto Vercel `agendo` (raíz `agendo/`) con `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`; dominio `agendo-reservas.vercel.app`.
- [x] Landing de Dental MX enlazando a `agendo-reservas.vercel.app/dental-mx`.
- [ ] Desactivar el registro público en Supabase → Authentication → Sign In / Providers → "Allow new users to sign up".
- [x] Keep-alive con la URL y anon key públicas en el workflow (GitHub sólo programa workflows de la rama `main`: se activa al fusionar).
- [ ] Borrar la cita de prueba "Prueba Sistema" (quedó cancelada; no ocupa horario).

## Criterios de aceptación

Verificados en local (Postgres 16 + PostgREST + navegador en celular simulado). Falta repetirlos en producción.

- [x] Un paciente agenda desde el celular en menos de 1 minuto.
- [x] Dos pestañas que intentan el mismo horario: sólo una lo consigue y la otra ve un aviso claro.
- [x] No aparecen horarios fuera del horario, en bloqueos, en el pasado ni a menos de 2 horas.
- [x] Un servicio de 60 min no se ofrece a las 13:30 si la clínica cierra a las 14:00.
- [x] Un teléfono con 2 citas pendientes no puede agendar una tercera.
- [x] Con la anon key, `select * from citas` devuelve error.
- [x] El botón de WhatsApp abre el chat de la clínica con el mensaje correcto.
- [x] La clínica ve la cita nueva en el panel y puede confirmarla y cancelarla.
- [x] Una cita cancelada libera su horario.
- [x] Un bloqueo creado en el panel oculta esos horarios en la página de reservas.
- [x] Las horas mostradas coinciden con la hora de Torreón.
- [x] Una cita nueva aparece como aviso sin leer en la campana; tocarla abre la cita; marcar como leído persiste al recargar.
- [ ] El panel muestra "En vivo" y avisa sin recargar (requiere Realtime de Supabase).
