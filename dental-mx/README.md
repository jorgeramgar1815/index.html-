# Dental MX — sitio web

Landing page de **Dental MX** (Torreón, Coahuila), construida a partir del PRD. Todo el contenido vive en una sola página con navegación por anclas: Servicios, Cómo funciona (3 pasos), Promociones, Por qué elegirnos, Antes/después, Nosotros, Testimonios, Tips, Preguntas frecuentes y Contacto. Además incluye Aviso de privacidad y una página 404. La única conversión es la cita por WhatsApp.

Las URLs anteriores (`/servicios`, `/nosotros`, `/contacto`) redirigen a su sección (`redirects` en `astro.config.mjs`).

- **Stack:** [Astro](https://astro.build) (genera HTML estático, sin JS de framework en el cliente) + Tailwind CSS v4 + fuentes auto-hospedadas (Sora, Inter y Yellowtail vía Fontsource).
- **Animaciones y efectos:** CSS y un script pequeño en TypeScript (`src/scripts/main.ts`):
  - Hero centrado con letrero de neón que se dibuja, aurora de luz y luz que sigue al cursor.
  - Titulares que aparecen palabra por palabra (`data-split`), scroll reveal con stagger (`data-reveal`) y fotos con revelado tipo cortina (`data-reveal="clip"`).
  - Tarjetas con inclinación 3D y brillo bajo el cursor (`data-tilt`), botones magnéticos (`data-magnetic`) y destello en botones principales.
  - Bandas y carrusel de testimonios en movimiento continuo, borde de neón giratorio, contadores y transiciones de página nativas.
  - Las animaciones continuas se pausan fuera de pantalla (`data-live`) y todo se desactiva con `prefers-reduced-motion`.
- **SEO local:** title, description, canonical, Open Graph (`public/og.png`), sitemap y `robots.txt`. También JSON-LD `Dentist` con NAP, horario y datos del doctor, más `FAQPage` e `ItemList` de servicios.
- **Navegación:** menú con anclas y resaltado automático de la sección visible (scrollspy).

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
  pages/                ← index (landing completa), aviso-de-privacidad, 404
public/                 ← favicon, íconos, og.png, manifest, img/ (fotos reales)
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
| Nombre, cédula y foto del doctor | `site.doctor` en `src/data/site.ts` (`flags.showDoctorName` lo oculta) |
| Horario de atención | `site.hours` y `site.openingHoursSpec` |
| Precios promocionales (brackets $499, blanqueamiento $1,200) | `promo` de cada servicio (`flags.showPrices` los oculta) |
| Testimonios reales (3–6) | `testimonials` |
| URL exacta de Facebook | `site.social.facebook.url` |
| Fotos del consultorio | `gallery` y `heroImage` en `src/pages/index.astro` |
| Casos antes/después reales | `src/components/BeforeAfter.astro` (hoy son ilustraciones) |
| Historia de la clínica | Sección Nosotros en `src/pages/index.astro` |
| Aviso de privacidad integral | `src/pages/aviso-de-privacidad.astro` |
| Dominio (hoy: dental-mx-three.vercel.app) | `astro.config.mjs` y `public/robots.txt` |

### Cómo reemplazar fotos

1. Copia la imagen optimizada (JPG/WebP, máximo ~1600 px de ancho) a `public/img/`.
2. Pasa la ruta al componente, por ejemplo `src: '/img/recepcion.jpg'`. Mientras la ruta esté vacía, el componente `Photo` muestra la ilustración de marca de respaldo.
