# Gentleman's Care — Peluquería y Spa · Torreón

Sitio estático (HTML + CSS + JS, sin dependencias) generado a partir del diseño
`Gentlemans Care Landing.dc.html`. Mismo contenido, paleta y tipografía del diseño.

```
gentlemans-care/
├── index.html               Página principal (SEO, JSON-LD, Open Graph en <head>)
├── aviso-de-privacidad.html Aviso de privacidad básico
├── styles.css               Estilos (variables de color = paleta del diseño)
├── main.js                  Interacciones (menú, animaciones, horario, formulario…)
├── config.js                ← TODOS LOS DATOS EDITABLES
├── fonts/                   Archivo, Mrs Saint Delafield, IBM Plex Mono (woff2, OFL)
├── img/                     Imágenes (AVIF + WebP) y favicons
├── favicon.ico
├── robots.txt · sitemap.xml
└── vercel.json              Caché y cabeceras de seguridad
```

---

## 1. Editar datos y promoción (`config.js`)

Abre `config.js`; todo está comentado. Lo que dice `TODO` es un dato pendiente
y la página muestra `[PENDIENTE]` mientras no se llene.

| Campo | Qué hace |
|---|---|
| `contacto.whatsapp` | Número a 10 dígitos (`'8711234567'`); se le agrega `52`. Si está vacío, los botones abren WhatsApp para elegir contacto. |
| `contacto.telefono` | Activa el enlace `tel:` del footer. |
| `contacto.email` | Muestra el enlace `mailto:` del footer (oculto si está vacío). |
| `contacto.direccion` | Reemplaza "Plaza comercial… [PENDIENTE]" en Ubicación y en Preguntas. |
| `contacto.referencia` | Quita el prefijo `TODO: ` cuando se confirme (desaparece `[CONFIRMAR]`). |
| `contacto.mapsQuery` | Lo que se busca en Google Maps (mapa y botón "Abrir en Google Maps"). |
| `contacto.facebook` / `instagram` | URLs de redes; mientras estén vacías se muestra el marcador. |
| `zonaHoraria` | `America/Monterrey` (hora de Torreón). |
| `horario` | Un valor por día: `{ abre: '10:00', cierra: '20:00' }`, `null` = cerrado, o una lista para horario partido: `[{abre:'10:00',cierra:'14:00'},{abre:'16:00',cierra:'20:00'}]`. Los días iguales y seguidos se agrupan solos ("Lunes a viernes"). Cuando **los 7 días** tienen datos aparece el indicador **"Abierto ahora / Cerrado"**. |
| `mensajes` | Textos prellenados de WhatsApp (cita, promoción, VOLPE). |
| `mostrarVolpe` | `false` oculta la sección de la pasta VOLPE y su punto en "Por qué elegirnos". |
| `promo.mostrar` | `true` muestra el banner superior y la sección de promoción. |
| `promo.titulo` / `descripcion` / `vigenciaTexto` | Textos de la promoción. |
| `promo.fechaFin` | `'AAAA-MM-DD'`. Al terminar ese día (hora de Torreón) la promoción se oculta sola. |

**Cuando tengas datos reales, actualiza también en `index.html`:**
- El JSON-LD de `<head>` (agrega `telephone`, `streetAddress`, `openingHoursSpecification`, `sameAs` con redes).
- Textos marcados como `[PENDIENTE]`, `[PRECIO]` o `[Barba – por confirmar]` en las tarjetas de servicios y en las preguntas frecuentes.
- El aviso de privacidad (`aviso-de-privacidad.html`): domicilio y contacto.

### Dominio propio
Si cambias de dominio, reemplaza `https://gentlemans-care-torreon.vercel.app` en
`index.html` (canonical, Open Graph, Twitter, JSON-LD), `aviso-de-privacidad.html`,
`sitemap.xml` y `robots.txt`.

---

## 2. Cambiar las fotos

Las imágenes actuales son **de relleno**. En `index.html` cada una tiene un
comentario `<!-- FOTO REAL: ... -->` que indica qué foto va y su tamaño mínimo.

1. Prepara cada foto en dos anchos (los nombres deben coincidir):

   | Archivo | Proporción | Anchos |
   |---|---|---|
   | `hero-local` | 1:1 | 600 y 1080 |
   | `galeria-1` … `galeria-4` | 4:5 | 480 y 960 |
   | `producto-volpe` | 4:5 | 480 y 960 |
   | `mapa` (opcional) | 4:3 | 640 y 1200 |

2. Expórtalas en **AVIF** y **WebP** a `img/` (ej. `img/galeria-1-480.avif`,
   `img/galeria-1-480.webp`, `img/galeria-1-960.avif`, `img/galeria-1-960.webp`).
   Herramienta gratuita: <https://squoosh.app> (AVIF calidad ~50, WebP ~75).
   Desde terminal: `npx @squoosh/cli` o `sharp-cli`.
3. Si cambias la proporción, ajusta `width`/`height` del `<img>`.
4. Actualiza el `alt` si la foto muestra algo distinto.

### Logo
**Falta el logo oficial.** El círculo "GC" es un marcador provisional, no el logo.
Con el logo en alta resolución (PNG transparente o SVG):
- Reemplaza `img/logo-176.png`, `.webp` y `.avif` (176×176, cuadrado).
- Regenera `favicon.ico` (32×32), `img/icon-192.png` y `img/apple-touch-icon.png` (180×180),
  por ejemplo con <https://realfavicongenerator.net>.
- Opcional: actualiza `img/og-image.jpg` (1200×630) para redes sociales.

---

## 3. Medición (GA4 / Meta Pixel)

Los botones tienen `data-track` descriptivos (`whatsapp-hero`, `whatsapp-header`,
`whatsapp-flotante`, `whatsapp-formulario`, `tel-footer`, `maps-ubicacion`,
`mapa-ver`, etc.). Cada clic hace:

- `dataLayer.push({ event: 'cta_click', cta_name, link_url })` → úsalo en Google Tag Manager.
- `gtag('event', 'cta_click', …)` si GA4 está instalado.
- `fbq('track', 'Contact')` (WhatsApp/tel/correo) o `fbq('trackCustom', 'CTAClick')` si Meta Pixel está instalado.

Para instalar GA4 o el Pixel, pega su fragmento en `<head>` de `index.html`.

---

## 4. Publicar en Vercel

**Opción A — desde GitHub (recomendada, se actualiza sola):**
1. En <https://vercel.com/new> importa el repositorio.
2. En *Root Directory* elige `gentlemans-care`.
3. *Framework Preset*: **Other**. Sin comando de build ni output directory.
4. *Deploy*. Cada `git push` publica de nuevo.

**Opción B — con la CLI:**
```bash
npm i -g vercel
cd gentlemans-care
vercel          # vista previa
vercel --prod   # producción
```

**Opción C — arrastrar y soltar:** sube la carpeta `gentlemans-care` en
<https://vercel.com/new> (sección "Deploy without Git").

Para un dominio propio: *Project → Settings → Domains*.

## Probar localmente
```bash
cd gentlemans-care
python3 -m http.server 8080   # abre http://localhost:8080
```
(Usa un servidor; las rutas son absolutas desde la raíz `/`.)
