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
| `app/page.tsx` | Landing: hero, valores, categorías, tratamientos insignia (sección oscura), resultados, por qué Reduzen, testimonios, CTA + mapa |
| `app/servicios/` | Catálogo completo por categoría, con pestañas y un CTA de WhatsApp por tratamiento |
| `app/nosotros/` | Historia, valores, equipo y espacio |
| `app/aviso-de-privacidad/` | Placeholder legal |
| `app/globals.css` | **Sistema de diseño**: tokens de color (claro y oscuro), tipografía y animaciones |
| `components/` | Header, Hero, Footer, ServiceCard, TreatmentSpotlightCard, TreatmentCard, TestimonialCard, WhatsAppButton/WhatsAppFloat, CTASection, RitualSteps, SectionDivider (ola), ArtFrame, BeforeAfter, Motion (Reveal/Stagger/Parallax), Effects (ScrollProgress, WordsReveal, Tilt, PointerParallax), Decor (Aurora, Bubbles, Marquee) |
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
| Fotos de los arcos flotantes del hero | `components/Hero.tsx` → `HERO_LEFT` / `HERO_RIGHT` |
| Aviso de privacidad | `app/aviso-de-privacidad/page.tsx` |
| Geo (lat/lng) y horario en schema.org | `app/layout.tsx` → `jsonLd` |
| Mapa: embed del perfil de Google Business | `content/site.ts` → `mapQuery` / `components/CTASection.tsx` |

### Fotografía

Mientras no haya fotos reales, cada espacio de imagen muestra una **composición gráfica de marca**
(`components/ArtFrame.tsx`: degradados + loto, burbujas y hojas en línea fina). Para usar una foto real:

1. Coloca el archivo en `public/images/` (JPG/WebP, idealmente de menos de 300 KB).
2. Pasa `src="/images/archivo.jpg"` al `ArtFrame`: `HERO_LEFT`/`HERO_RIGHT` en `components/Hero.tsx`, `image` en
   `content/services.ts` o `image` en `content/team.ts`.

## Decisiones de diseño y accesibilidad

- **Modo claro** como base; **modo oscuro** solo en "Tratamientos insignia" y en el footer.
- El dorado `#C9A24B` sobre crema no alcanza AA (2.2:1). Para texto pequeño sobre crema se usan
  `gold-ink #8A6A1F` (4.6:1), `jade-ink #1F6F6C` (5.3:1) y `stone #665F55` (5.7:1).
  Sobre azul marino, el dorado sí pasa (7.4:1).
- Efectos: loto que se dibuja con anillo de texto giratorio, aurora y burbujas, parallax con el mouse,
  títulos revelados palabra por palabra, tarjetas con inclinación 3D, cinta infinita de tratamientos,
  testimonios en carrusel continuo, línea de pasos que se dibuja y barra de progreso de lectura.
- Las animaciones respetan `prefers-reduced-motion`. El hero y la transición de página usan CSS puro,
  así el LCP no espera a JavaScript. Las animaciones continuas solo usan `transform` y `opacity`.
- Lighthouse (móvil, servidor con compresión): Performance 91–95 · Accessibility 100 · Best Practices 100 · SEO 100.
