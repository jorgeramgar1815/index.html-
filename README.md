# Óptica Luz · Sitio web

Landing page estática de **Óptica Luz** (Torreón, Coahuila). Se hizo a partir del diseño original, con el mismo contenido, la misma paleta y la misma tipografía (Nunito).

- **Sin dependencias ni compilación.** Solo son archivos HTML, CSS y JS; se pueden subir tal cual.
- `index.html`: contenido y SEO (metadatos, Open Graph y JSON-LD).
- `styles.css`: estilos mobile-first con variables de color con nombre (`--azul-luz`, `--rubor`, `--tinta`…).
- `main.js`: menú, animaciones, horario, formulario, mapa y medición de clics.
- **`config.js`: los datos que vas a editar.**

```
/
├── index.html · styles.css · main.js · config.js
├── img/                 fotos (AVIF/WebP/JPG), logo, íconos, imagen para redes
├── fonts/               Nunito (autoalojada, licencia OFL)
├── favicon.ico · apple-touch-icon.png · site.webmanifest
├── sitemap.xml · robots.txt
├── netlify.toml · vercel.json
└── scripts/             herramienta opcional para optimizar fotos
```

> **Nota:** `index.html.html` ya estaba en el repositorio y es de otro negocio (Notaría 140). No forma parte de este sitio. Bórralo si no lo necesitas, porque se publicaría junto con la página.

---

## 1. Editar datos en `config.js`

Abre `config.js` con cualquier editor de texto y cambia solo el texto entre comillas. Al guardar y volver a publicar, se actualizan **todos** los botones y textos de la página.

| Qué quieres cambiar | Dónde |
|---|---|
| Número de WhatsApp | `contacto.whatsapp`: solo dígitos, con 52 al inicio (`"528713333666"`) |
| Teléfono para llamadas | `contacto.telefono` (`"+528713333666"`) y cómo se ve en pantalla (`contacto.telefonoVisible`) |
| Correo | `contacto.email` |
| Facebook | `contacto.facebook`: pega la URL de la página. Mientras esté vacío se usa una búsqueda en Facebook. |
| Mensaje prellenado de WhatsApp | `whatsapp.mensajes.general` (botones generales) y `whatsapp.mensajes.promo` (botón de la promoción) |
| Mensaje del formulario | `whatsapp.plantillaFormulario` y `whatsapp.motivos` |
| Horario | `horario.bloques`. Los días van de `0` = domingo a `6` = sábado y las horas en formato 24 h (`"18:30"`). |
| Días festivos cerrados | `horario.diasCerrados`, por ejemplo `["2026-12-25", "2027-01-01"]` |
| Zona horaria | `horario.zonaHoraria` (`"America/Monterrey"` corresponde a Torreón) |

Con el horario se calculan tres cosas: el indicador **"Abierto ahora / Cerrado"**, la etiqueta **"Hoy"** en la tabla de horarios y las horas disponibles en el formulario de citas.

> Si cambias el horario, actualiza también el texto visible en `index.html`: busca `9:30 am a 6:30 pm` y `10:00 am a 3:00 pm`. Aparece en la sección de ubicación, en el pie de página, en la pregunta frecuente y en los datos estructurados (`openingHoursSpecification`).

### Promoción

```js
promocion: {
  mostrar: true,                         // false = se oculta en todo el sitio
  vigenciaTexto: "Válido durante septiembre",
  fechaFin: "2026-09-30T23:59:59-06:00", // al pasar esta fecha se oculta sola
},
```

- **Para ocultarla ya:** `mostrar: false`.
- **Para extenderla:** cambia `fechaFin` y `vigenciaTexto`.
- **Para que no se oculte sola:** `fechaFin: ""`.
- Al ocultarse desaparecen la barra superior, la sección "Promoción", la tarjeta "25% de descuento" y el enlace "Promoción" del menú.
- `-06:00` es la hora de Torreón. Si dejas `23:59:59-06:00`, la promoción dura hasta el final de ese día.

> ⚠️ **TODO:** el diseño solo dice "Válido durante septiembre". Se asumió **septiembre de 2026** (por el "© 2026" del pie). Confirma la fecha real.

### Dominio (TODO)

Cuando tengas dominio, reemplaza `https://www.example.com` por tu dominio real en:
- `index.html`: canonical, Open Graph, Twitter y JSON-LD
- `sitemap.xml`
- `robots.txt`

Un "buscar y reemplazar" en tu editor lo resuelve en un paso.

### Textos de la página y SEO

Los textos (títulos, servicios, productos, preguntas) están directamente en `index.html`. El título, la descripción y los datos para Google (JSON-LD) están en el `<head>`, escritos a mano a propósito para que los buscadores los lean sin JavaScript. Si cambias el teléfono o el correo en `config.js`, cámbialos también ahí (busca `871 333 3666` u `opticaluzcolon`).

---

## 2. Cambiar las fotos

En el HTML hay comentarios `<!-- FOTO REAL: ... -->` que indican qué foto va en cada lugar. Por ahora el sitio usa **imágenes de relleno** (dicen "FOTO DE RELLENO").

| Lugar | Archivos | Proporción | Tamaño mínimo |
|---|---|---|---|
| Hero: optometrista haciendo el examen | `img/foto-hero-640.*`, `img/foto-hero-1040.*` | 4:5 (vertical) | 1040 × 1300 |
| Nueva colección de armazones | `img/foto-armazones-480.*`, `-800.*` | 16:10 | 800 × 500 |
| Lentes de sol y clip-on | `img/foto-sol-480.*`, `-800.*` | 16:10 | 800 × 500 |
| Línea Kids | `img/foto-kids-480.*`, `-800.*` | 16:10 | 800 × 500 |
| Fachada o interior del local | `img/foto-local-560.*`, `-1000.*` | 5:4 | 1000 × 800 |

Cada foto existe en tres formatos: `.avif`, `.webp` y `.jpg`. El navegador elige el más ligero que soporte.

### Opción A: automática (recomendada)

Necesitas [Node.js](https://nodejs.org) 18 o superior.

1. Crea la carpeta `fotos-originales/` en la raíz del proyecto.
2. Guarda ahí tus fotos con estos nombres: `hero.jpg`, `armazones.jpg`, `sol.jpg`, `kids.jpg`, `local.jpg`.
3. Ejecuta:
   ```bash
   cd scripts
   npm install
   npm run fotos
   ```

El script recorta a la proporción correcta, genera los dos tamaños en los tres formatos y los guarda en `img/` con el nombre correcto. La carpeta `fotos-originales/` no se sube a git.

### Opción B: manual con [Squoosh](https://squoosh.app)

Por cada foto, exporta los dos anchos de la tabla en AVIF, WebP y JPG, con exactamente el mismo nombre que el archivo que reemplazas.

### Después de cambiar una foto

- Revisa que el texto `alt` de la imagen en `index.html` describa lo que realmente se ve.
- Si la proporción de tu foto es distinta, el sitio la recorta al centro para conservar el diseño.

### Logo

`img/optica-luz-logo.png` es el logo original del diseño y **no se modificó**. Solo se generaron copias más ligeras (`img/logo-240.*`, `img/logo-400.*`). El favicon y los íconos (`favicon.ico`, `apple-touch-icon.png`, `img/icon-*.png`) son un recorte del ojo del mismo logo.

> Ese archivo tiene baja resolución y artefactos de compresión. Si tienes el logo en **SVG** o en PNG de alta resolución (1200 px o más), reemplázalo y vuelve a generar las copias.

### Imagen para redes sociales

`img/og-image.jpg` (1200 × 630) es la imagen que aparece al compartir el enlace en WhatsApp y Facebook. Puedes reemplazarla por otra del mismo tamaño.

---

## 3. Publicar

### Netlify

**Arrastrar y soltar (sin cuenta de GitHub):**
1. Entra a <https://app.netlify.com/drop>.
2. Arrastra la carpeta completa del proyecto.
3. Listo: te da una URL `*.netlify.app`.

**Conectado a GitHub (se actualiza solo con cada cambio):**
1. En Netlify: **Add new site → Import an existing project → GitHub** y elige este repositorio.
2. Deja vacío *Build command*. En *Publish directory* pon `.` (ya viene en `netlify.toml`).
3. **Deploy**.

### Vercel

1. En <https://vercel.com/new> importa este repositorio.
2. *Framework Preset*: **Other**. Deja vacíos *Build Command* y *Output Directory*.
3. **Deploy**. Las cabeceras de caché y seguridad ya vienen en `vercel.json`.

### Dominio propio

En Netlify (**Domain management**) o en Vercel (**Settings → Domains**), agrega tu dominio y sigue las instrucciones de DNS. Después reemplaza `https://www.example.com` (ver "Dominio" arriba) y da de alta el `sitemap.xml` en [Google Search Console](https://search.google.com/search-console).

### Probar en tu computadora

```bash
npx serve .
# o
python3 -m http.server 8080
```

Después abre <http://localhost:8080>. Abrir `index.html` con doble clic también funciona, pero el mapa y algunos detalles se comportan mejor con un servidor local.

---

## 4. Medición (Google Analytics 4 / Meta Pixel)

Cada botón y enlace importante tiene un atributo `data-track` con un nombre descriptivo, por ejemplo `whatsapp-hero`, `whatsapp-flotante`, `whatsapp-formulario`, `tel-footer`, `email-ubicacion`, `como-llegar-hero` o `mapa-ver`.

Al hacer clic, `main.js` envía el evento automáticamente:
- **GA4 (gtag.js):** evento `cta_click` con los parámetros `cta` (nombre) y `canal` (`whatsapp`, `telefono`, `email`, `mapa` o `navegacion`).
- **Google Tag Manager:** si no hay gtag, hace `dataLayer.push({ event: "cta_click", cta, canal })`.
- **Meta Pixel:** `fbq('track', 'Contact')` para WhatsApp, teléfono o correo, y `fbq('trackCustom', 'CTAClick')` para lo demás.

Solo pega el código de GA4, GTM o Meta Pixel en el `<head>` de `index.html`. No hay que tocar nada más.

---

## 5. Qué incluye

- Menú móvil animado: se cierra con `Esc`, mantiene el foco dentro mientras está abierto y resalta la sección visible.
- Animaciones de entrada al hacer scroll (escalonadas en tarjetas) y entrada con parallax leve en el hero. Se desactivan si el sistema tiene activado "reducir movimiento".
- Preguntas frecuentes con `<details>` nativo y animado.
- Formulario (nombre, motivo, día y horario) que arma el mensaje y abre WhatsApp. **No guarda datos.**
- Indicador "Abierto ahora / Cerrado" calculado con la hora de Torreón.
- Botón flotante de WhatsApp con un globo que aparece a los 4 segundos y un pulso que ocurre una sola vez.
- Promoción que se oculta sola al pasar la fecha de fin.
- Mapa de Google que se carga solo al hacer clic en "Ver mapa", para que la página sea más ligera y más privada.
- Accesibilidad: enlace "Saltar al contenido", foco visible, contraste AA, `lang="es-MX"` y áreas táctiles de 44 px o más.
- SEO: título, descripción, canonical, Open Graph, Twitter Card, JSON-LD (`Optician` + `LocalBusiness` y `FAQPage`), sitemap y robots.
