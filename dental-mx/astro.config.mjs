// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // PLACEHOLDER: reemplazar por el dominio definitivo (pregunta #6 del PRD). Por ahora, dominio de Vercel.
  site: 'https://dental-mx-three.vercel.app',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  // El sitio es una landing de una sola página; las URLs anteriores llevan a su sección.
  redirects: {
    '/servicios': '/#servicios',
    '/nosotros': '/#nosotros',
    '/contacto': '/#contacto',
  },
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
  vite: { plugins: [tailwindcss()] },
});
