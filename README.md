# Reduzen — Mesoterapia & Spa

Sitio web de Reduzen (Torreón, Coahuila): landing de conversión + páginas de **Servicios** y **Nosotros**.
Todo el contacto va por WhatsApp.

- **Stack:** Next.js 16 (App Router, exportación estática) · Tailwind CSS 4 · Framer Motion
- **Salida:** HTML estático en `out/`, desplegable en Vercel, Netlify o GitHub Pages

```bash
npm install
npm run dev        # desarrollo en http://localhost:3000
npm run build      # genera /out
npm run typecheck
```

## Estructura

| Ruta | Contenido |
|---|---|
| `app/page.tsx` | Landing en 6 secciones numeradas: 01 portada centrada con el nombre · 02 manifiesto y valores · 03 portada del mes (spread oscuro) · 04 índice de servicios · 05 resultados · 06 contacto |
| `app/servicios/` | Catálogo completo por categoría, con pestañas y un CTA de WhatsApp por tratamiento |
| `app/nosotros/` | Historia, valores, equipo y espacio |
| `app/aviso-de-privacidad/` | Placeholder legal |
| `app/globals.css` | **Sistema de diseño "Editorial"** con la paleta de marca: tokens de color, tipografía (DM Serif Display + Montserrat), utilidades y animaciones |
| `components/` | Header, Hero, Footer, SectionHead, CoverStory, TreatmentRow, ServiceIndex, ScrollText (manifiesto que se entinta), BeforeAfter, CTASection (contacto), CategoryTabs, WhatsAppButton/WhatsAppFloat, ArtFrame, Effects (ScrollProgress, WordsReveal, Rule, ClipReveal), Decor (Bubbles, Marquee) |
| `content/` | **Todo el contenido editable**: datos del negocio, servicios, testimonios y equipo |
| `lib/whatsapp.ts` | Enlaces `wa.me` y mensajes prellenados por sección y por servicio |

## Placeholders por confirmar con la clienta

Busca `PLACEHOLDER` en el código (`grep -rn PLACEHOLDER app components content`).

| Dato | Dónde |
|---|---|
| Horario de atención (`hoursConfirmed: false`) | `content/site.ts` |
| Dominio definitivo (hoy `reduzenspa.mx`) | `content/site.ts` → `url` |
| URL de Facebook / ¿Instagram? | `content/site.ts` → `social` |
| Precio Hydrafacial **$499** (promo vista en Facebook) y demás precios | `content/services.ts` → `price` |
| Duraciones de los tratamientos | `content/services.ts` → `duration` |
| Tratamientos no vistos en Facebook (`confirmed: false`) | `content/services.ts` |
| Prioridad de los 4 tratamientos insignia | `content/services.ts` → `signatureSlugs` |
| Testimonios (sección retirada por ahora; datos de ejemplo guardados para reactivarla) | `content/testimonials.ts` |
| Equipo: nombres, bios y fotos | `content/team.ts` |
| Historia del spa | `content/team.ts` → `story` |
| Antes/después reales (con consentimiento) | `app/page.tsx` → `<BeforeAfter beforeSrc afterSrc>` |
| Aviso de privacidad | `app/aviso-de-privacidad/page.tsx` |
| Geo (lat/lng) y horario en schema.org | `app/layout.tsx` → `jsonLd` |
| Mapa: embed del perfil de Google Business | `content/site.ts` → `mapQuery` / `components/CTASection.tsx` |

### Fotografía

Mientras no haya fotos reales, cada espacio de imagen muestra una **composición gráfica de marca**
(`components/ArtFrame.tsx`: degradados + loto, burbujas y hojas en línea fina). Para usar una foto real:

1. Coloca el archivo en `public/images/` (JPG/WebP, idealmente de menos de 300 KB).
2. Pasa `src="/images/archivo.jpg"` al `ArtFrame`: `image` en
   `content/services.ts` o `image` en `content/team.ts`.

## Decisiones de diseño y accesibilidad

- **Estilo editorial de revista** con la **paleta principal de la marca** (PRD §2.1): crema `#F7F3EC`,
  azul marino `#1B2A4A`, dorado `#C9A24B` y turquesa `#2E8B8B` / `#3AA6A0`. Un solo bloque oscuro
  ("Portada del mes") y bloques turquesa con texto marino como acento.
- **Tipografía legible**: DM Serif Display (titulares, trazo grueso) + Montserrat (texto, 15 px base).
- **Inicio centrado** con el nombre "REDUZEN", el loto, el lema en turquesa y el CTA.
- Contraste AA: `gold-ink #7A5C14` (5.6:1) y `stone #665F55` (5.7:1) sobre crema; marino sobre
  turquesa `#3AA6A0` (4.8:1); dorado `#C9A24B` sobre azul marino (7.4:1).
- Efectos: titulares que suben por línea, imágenes que se revelan como cortina con parallax interno,
  manifiesto que se entinta con el scroll, cinta de texto en contorno, loto que se dibuja, menú a
  pantalla completa y filete de progreso de lectura. Sin imágenes dinámicas al pasar el mouse.
- Las animaciones respetan `prefers-reduced-motion`. La portada y la transición de página usan CSS puro,
  así el LCP no espera a JavaScript.
- Lighthouse (móvil, servidor con compresión): Performance 95–99 · Accessibility 96–100 · Best Practices 100 · SEO 100.
  El 96 de la página de inicio se debe a las palabras del manifiesto que aún no se "entintan"
  (efecto intencional; el texto completo está disponible para lectores de pantalla).
