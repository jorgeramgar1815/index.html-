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
| `app/page.tsx` | Inicio estilo spa boutique: portada con nombre y logo al centro · bienvenida · carta de tratamientos (fondo noche, animada) · slogan · rituales · resultados · ubicación y horario |
| `app/servicios/` | Catálogo completo por categoría, con pestañas y un CTA de WhatsApp por tratamiento |
| `app/nosotros/` | Historia, valores, equipo y espacio |
| `app/aviso-de-privacidad/` | Placeholder legal |
| `app/globals.css` | Tokens de la paleta de marca, tipografía (DM Serif Display + Montserrat), utilidades y animaciones |
| `components/landing/` | Cabecera y pie del sitio (logo al centro, menú móvil), botones, títulos con loto, marco cuadrado con filete dorado (`Framed`), carta de tratamientos (`TreatmentMenu`) y horario con el día de hoy resaltado (`HoursTable`) |
| `components/` | PageHeader, SectionHead, TreatmentRow, BeforeAfter, CTASection, CategoryTabs, WhatsAppButton/WhatsAppFloat, ArtFrame, Effects, Decor (Bubbles) |
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
| Rituales (paquetes sugeridos) y sus precios | `app/page.tsx` → `rituals` |
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

- **Estilo spa boutique** con la **paleta principal de la marca** (PRD §2.1): crema `#F7F3EC`,
  azul marino `#1B2A4A`, dorado `#C9A24B` y turquesa `#2E8B8B` / `#3AA6A0`. Marcos cuadrados con filete
  dorado desplazado, botones rectangulares con letra espaciada y un orden distinto al de otros proyectos (sin tarjetas de
  servicios, sin "3 pasos" ni preguntas frecuentes).
- **Tipografía legible**: DM Serif Display (titulares) + Montserrat (texto, 16 px base).
- **Conversión**: todas las reservas van por WhatsApp: botón "Reservar" fijo en la cabecera, cada fila de la
  carta abre WhatsApp con el nombre del tratamiento y la sección de ubicación incluye Google Maps y Waze.
- Contraste AA: `gold-ink #7A5C14` (5.6:1) y `stone #665F55` (5.7:1) sobre crema; marino sobre
  turquesa `#3AA6A0` (4.8:1); dorado `#C9A24B` sobre azul marino (7.4:1).
- Efectos: entrada escalonada de la portada, sello giratorio, burbujas, revelado al hacer scroll y comparador antes/después con pista animada. Sin imágenes dinámicas al pasar el mouse.
- Las animaciones respetan `prefers-reduced-motion`. La portada y la transición de página usan CSS puro,
  así el LCP no espera a JavaScript.
- Lighthouse del inicio: Accessibility 100 · Best Practices 100.
