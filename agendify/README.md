# Agendify

Software de reservas en línea para negocios (clínicas, estéticas, barberías, consultorios…). Diseño propio y neutro: de cada negocio sólo se muestran su nombre, giro, dirección, servicios y horario.

- **`/<slug>`** — página de reservas del negocio (ej. [`/dental-mx`](https://agendify-reservas.vercel.app/dental-mx)). `?servicio=<clave>` llega con el servicio elegido.
- **`/panel`** — panel del negocio: inicio del día, agenda (día / semana), historial anual, bloqueos y "Mi negocio" (datos, servicios y horario editables). Avisos de cita nueva dentro del panel (campana + bandeja), en tiempo real con sonido y notificación.
- **`/admin`** — panel de negocios (dueño de Agendify): alta de negocios con su cuenta, lista, editar, activar / desactivar y contraseñas.
- **`/`** — página del producto.

Producción: <https://agendify-reservas.vercel.app> (proyecto Vercel `agendify`, raíz `agendify/`).

## Backend (Supabase)

- `supabase/migrations/` — esquema + RLS, funciones RPC, tiempo real, perfil del negocio, avisos en el panel.
- `supabase/seed.sql` — Dental MX (simulado). `supabase/configurar.sql` — liga el usuario del panel.
- `supabase/tests/pruebas_reservas.sql` — 56 reglas (hace ROLLBACK).

### Agregar otro negocio

Desde **`/admin`** → "Nuevo negocio": datos, enlace, correo y contraseña, servicios y horario. Al crear, copia o manda por WhatsApp los datos de acceso. El negocio entra a `/panel` y desde "Mi negocio" ajusta lo demás.

Para dar acceso al panel de negocios a otra persona: crea su usuario y agrégalo a `superadmins` (`insert into public.superadmins (user_id) values ('<id>');`).

## Comandos

```bash
npm install
cp .env.example .env   # PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY
npm run dev            # en local la página de reservas es /reservar/?n=<slug>
npm run build
```
