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
| `app/page.tsx` | Landing en 8 secciones numeradas: 01 portada · 02 manifiesto y valores · 03 portada del mes (spread oscuro) · 04 índice de servicios · 05 resultados · 06 el método y por qué Reduzen · 07 testimonios · 08 contacto |
| `app/servicios/` | Catálogo completo por categoría, con pestañas y un CTA de WhatsApp por tratamiento |
| `app/nosotros/` | Historia, valores, equipo y espacio |
| `app/aviso-de-privacidad/` | Placeholder legal |
| `app/globals.css` | **Sistema de diseño "Editorial"**: tokens de color, tipografía (Instrument Serif + Instrument Sans), utilidades y animaciones |
| `components/` | Header, Hero, Footer, SectionHead, CoverStory, TreatmentRow, ServiceIndex (vista previa que sigue al cursor), ScrollText (manifiesto que se entinta), TestimonialSlider, Method, BeforeAfter, CTASection (contacto), CategoryTabs, WhatsAppButton/WhatsAppFloat, ArtFrame, Effects (ScrollProgress, WordsReveal, Rule, ClipReveal), Decor (Bubbles, Marquee) |
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
| Testimonios (hoy son **ejemplos** y se ven con la etiqueta "Ejemplo") | `content/testimonials.ts` → `isExample` |
| Equipo: nombres, bios y fotos | `content/team.ts` |
| Historia del spa | `content/team.ts` → `story` |
| Antes/después reales (con consentimiento) | `app/page.tsx` → `<BeforeAfter beforeSrc afterSrc>` |
| Foto de portada | `components/Hero.tsx` → `HERO_IMAGE` |
| Aviso de privacidad | `app/aviso-de-privacidad/page.tsx` |
| Geo (lat/lng) y horario en schema.org | `app/layout.tsx` → `jsonLd` |
| Mapa: embed del perfil de Google Business | `content/site.ts` → `mapQuery` / `components/CTASection.tsx` |

### Fotografía

Mientras no haya fotos reales, cada espacio de imagen muestra una **composición gráfica de marca**
(`components/ArtFrame.tsx`: degradados + loto, burbujas y hojas en línea fina). Para usar una foto real:

1. Coloca el archivo en `public/images/` (JPG/WebP, idealmente de menos de 300 KB).
2. Pasa `src="/images/archivo.jpg"` al `ArtFrame`: `HERO_IMAGE` en `components/Hero.tsx`, `image` en
   `content/services.ts` o `image` en `content/team.ts`.

## Decisiones de diseño y accesibilidad

- **Estilo editorial de revista**: titulares display gigantes (Instrument Serif), texto en Instrument Sans,
  esquinas rectas, filetes finos, secciones numeradas, pies de foto "Fig." y botones rectangulares con
  relleno que sube al hacer hover.
- **Papel claro** como base; un solo spread oscuro ("Portada del mes") y bloques jade como acento.
- Contraste AA para texto pequeño: `gold-ink #7A5C14` (5.3:1) y `stone #625B51` (5.8:1) sobre papel;
  `gold-pale #F3E3BB` (4.6:1) sobre jade; dorado `#C9A24B` sobre azul marino (7.4:1).
- Efectos: titulares que suben por línea, imágenes que se revelan como cortina con parallax interno,
  manifiesto que se entinta con el scroll, índice de servicios con vista previa que sigue al cursor,
  cinta de texto en contorno, sello giratorio con loto que se dibuja, testimonios con barra de tiempo,
  menú a pantalla completa y filete de progreso de lectura.
- Las animaciones respetan `prefers-reduced-motion`. La portada y la transición de página usan CSS puro,
  así el LCP no espera a JavaScript.
- Lighthouse (móvil, servidor con compresión): Performance 95–99 · Accessibility 96–100 · Best Practices 100 · SEO 100.
  El 96 de la página de inicio se debe a las palabras del manifiesto que aún no se "entintan"
  (efecto intencional; el texto completo está disponible para lectores de pantalla).
