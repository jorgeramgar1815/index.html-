# Agendo

Software de reservas en línea para negocios (clínicas, estéticas, barberías, consultorios…). Diseño propio y neutro: de cada negocio sólo se muestran su nombre, giro, dirección, servicios y horario.

- **`/<slug>`** — página de reservas del negocio (ej. [`/dental-mx`](https://agendo-reservas.vercel.app/dental-mx)). `?servicio=<clave>` llega con el servicio elegido.
- **`/panel`** — panel del negocio: inicio del día, agenda (día / semana), bloqueos y "Mi página". Avisos de cita nueva dentro del panel (campana + bandeja), en tiempo real con sonido y notificación.
- **`/`** — página del producto.

Producción: <https://agendo-reservas.vercel.app> (proyecto Vercel `agendo`, raíz `agendo/`).

## Backend (Supabase)

- `supabase/migrations/` — esquema + RLS, funciones RPC, tiempo real, perfil del negocio, avisos en el panel.
- `supabase/seed.sql` — Dental MX (simulado). `supabase/configurar.sql` — liga el usuario del panel.
- `supabase/tests/pruebas_reservas.sql` — 33 reglas (hace ROLLBACK).

### Agregar otro negocio

1. Insertar en `negocios` (slug, nombre, giro, direccion, whatsapp), sus `servicios` y `horarios` (como en `seed.sql`).
2. Crear su usuario en Supabase Auth y ligarlo en `admins` (como en `configurar.sql`).
3. Su página queda en `/<slug>` y entra al panel con su correo.

## Comandos

```bash
npm install
cp .env.example .env   # PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY
npm run dev            # en local la página de reservas es /reservar/?n=<slug>
npm run build
```
