# Dental MX — sitio web

Landing page de **Dental MX** (Torreón, Coahuila), construida a partir del PRD. Todo el contenido vive en una sola página con navegación por anclas: Servicios, Cómo funciona (3 pasos), Promociones, Por qué elegirnos, Antes/después, Nosotros, Testimonios, Tips, Preguntas frecuentes y Contacto. Además incluye Aviso de privacidad y una página 404. La única conversión es la cita por WhatsApp.

Las URLs anteriores (`/servicios`, `/nosotros`, `/contacto`) redirigen a su sección (`redirects` en `astro.config.mjs`).

- **Stack:** [Astro](https://astro.build) (genera HTML estático, sin JS de framework en el cliente) + Tailwind CSS v4 + fuentes auto-hospedadas (Sora, Inter y Yellowtail vía Fontsource).
- **Animaciones y efectos:** CSS y un script pequeño en TypeScript (`src/scripts/main.ts`):
  - Hero centrado con letrero de neón que se dibuja, aurora de luz y luz que sigue al cursor. La portada se anima sólo con CSS (no espera al JS) y los resplandores son degradados radiales, no `filter: blur()`, para que cargue rápido en celulares.
  - Titulares que aparecen palabra por palabra (`data-split`), scroll reveal con stagger (`data-reveal`) y fotos con revelado tipo cortina (`data-reveal="clip"`).
  - Tarjetas con inclinación 3D y brillo bajo el cursor (`data-tilt`), botones magnéticos (`data-magnetic`) y destello en botones principales.
  - Bandas y carrusel de testimonios en movimiento continuo, borde de neón giratorio y contadores.
  - Las animaciones continuas se pausan fuera de pantalla (`data-live`) y todo se desactiva con `prefers-reduced-motion`.
- **SEO local:** title, description, canonical, Open Graph (`public/og.png`), sitemap y `robots.txt`. También JSON-LD `Dentist` con NAP, horario y datos del doctor, más `FAQPage` e `ItemList` de servicios.
- **Navegación:** menú con anclas y resaltado automático de la sección visible (scrollspy).

## Reservaciones en línea

Widget de reserva (modal) + panel de la clínica en `/admin`, con Supabase como backend. Especificación, decisiones y puesta en marcha: [`PRD-reservas.md`](../PRD-reservas.md).

- **Activación:** variables `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` (ver `.env.example`). Sin ellas, los botones "Agendar" abren WhatsApp como antes y `/admin` muestra un aviso.
- **Botones:** cualquier elemento con `data-reservar` abre el widget; `data-servicio="<clave>"` preselecciona el servicio. Componente: `BookingButton.astro`.
- **Base de datos:** `supabase/migrations/` (esquema + RLS, funciones RPC, avisos), `supabase/seed.sql` (Dental MX simulado), `supabase/configurar.sql` (admin, correo, URL de funciones).
- **Pruebas:** `supabase/tests/pruebas_reservas.sql` (28 reglas, hace ROLLBACK).
- **Correo de cita nueva:** Edge Function `supabase/functions/notificar-cita` (Resend).
- **Keep-alive:** `.github/workflows/supabase-keepalive.yml`.
- El widget pesa ~15 KB y se descarga sólo al tocar "Agendar"; el panel carga `supabase-js` sólo en `/admin`.

## Comandos

```bash
npm install
npm run dev       # servidor local en http://localhost:4321
npm run build     # genera el sitio estático en dist/
npm run preview   # sirve dist/ localmente
npm run check     # verificación de tipos
```

## Despliegue

`dist/` es 100 % estático y se puede subir a cualquier hosting:

- **Vercel / Netlify:** importa el repositorio y elige `dental-mx` como *Root Directory*. El framework Astro se detecta solo.
- **Otro hosting:** ejecuta `npm run build` y sube el contenido de `dist/`.

Antes de publicar, cambia el dominio en `astro.config.mjs` (`site`) y en `public/robots.txt`.

## Estructura

```
src/
  data/site.ts          ← TODO el contenido editable (NAP, servicios, horario, testimonios, tips, FAQ)
  styles/global.css     ← sistema de diseño: tokens de color, tipografía, botones, tarjetas, movimiento
  layouts/BaseLayout    ← <head> SEO + JSON-LD, header, footer, botón flotante
  components/           ← Header, Footer, ServiceCard, TestimonialCard, TipCard, WhatsAppButton,
                          WhatsAppFab, CTASection, BeforeAfter, Photo, MapEmbed, TrustBar, …
  pages/                ← index (landing completa), admin (panel de citas), aviso-de-privacidad, 404
src/assets/img/         ← fotos del consultorio (Astro las optimiza a WebP con varios tamaños)
public/                 ← favicon, íconos, og.png, manifest
scripts/generate-images.mjs ← regenera favicon PNG, íconos PWA y og.png
```

### Tokens de diseño

| Token | Valor | Uso |
|---|---|---|
| `ink` | `#0E100E` | Fondo principal |
| `surface` | `#1C1F1C` | Tarjetas / superficies |
| `lime` | `#B5EE3A` | Acento neón (CTA, íconos, glow). Contraste 13.6:1 sobre `ink` |
| `lime-ink` | `#3D6A00` | Verde para texto sobre fondos claros (AA 6.2:1) |
| `snow` / `mute` | `#F2F2F2` / `#A0A6A0` | Texto principal / secundario sobre oscuro |
| `paper` | `#FAFAF8` | Secciones claras alternas |

Fuentes: **Sora** (titulares), **Inter** (texto), **Yellowtail** (acento script de neón, 1–2 palabras por página).

## Placeholders (pendientes de confirmar con el cliente)

Todo dato no confirmado está marcado en el código con `PLACEHOLDER:`. Para listarlos:

```bash
grep -rn "PLACEHOLDER" src/ public/ astro.config.mjs
```

En el sitio también se ven etiquetas punteadas ("Por confirmar", "Ejemplo", "Placeholder · Foto…") para revisarlos con el cliente. Cuando todo esté validado, pon `flags.placeholderBadges = false` en `src/data/site.ts` para ocultarlas.

| Pendiente | Dónde se cambia |
|---|---|
| Nombre, cédula y foto del doctor | `site.doctor` en `src/data/site.ts`. Hoy `flags.showDoctorName = false`: Nosotros muestra "Nuestro equipo clínico" con un retrato ilustrativo (`equipo-clinico.jpg`) |
| Horario de atención | `site.hours` y `site.openingHoursSpec` |
| Precios promocionales (brackets $499, blanqueamiento $1,200) | `promo` de cada servicio (`flags.showPrices` los oculta) |
| Testimonios reales (3–6) | `testimonials` |
| URL exacta de Facebook | `site.social.facebook.url` |
| Casos antes/después reales | `photos` en `src/components/BeforeAfter.astro` (hoy son fotos ilustrativas) |
| Historia de la clínica | Sección Nosotros en `src/pages/index.astro` |
| Aviso de privacidad integral | `src/pages/aviso-de-privacidad.astro` |
| Dominio (hoy: dental-mx-three.vercel.app) | `astro.config.mjs` y `public/robots.txt` |

### Fotos

Ya colocadas (en `src/assets/img/`):

- Sillón en "Por qué elegirnos" (`consultorio-sillon.jpg`) y galería de Nosotros (`recepcion.jpg`, `consultorio.jpg`, `sala-de-espera.jpg`).
- **Ilustrativas** (con la etiqueta "Imagen ilustrativa"): retrato de Nosotros (`equipo-clinico.jpg`) y los tres casos de antes/después (`blanqueamiento-*`, `ortodoncia-*`, `resinas-*`).

Para agregar o cambiar una foto:

1. Copia la imagen (JPG/PNG, idealmente de 1600 px de ancho o más) a `src/assets/img/`.
2. Impórtala en `src/pages/index.astro` (`import foto from '../assets/img/archivo.jpg'`) y pásala como `src` al componente `Photo`. Mientras `src` esté vacío, `Photo` muestra la ilustración de marca de respaldo.
3. Pendientes: la foto real del doctor (impórtala y asígnala en `site.doctor.photo`, luego pon `flags.showDoctorName = true`) y casos reales de antes/después con autorización por escrito del paciente.
