/**
 * Genera favicon PNG, íconos PWA e imagen Open Graph (1200×630) a partir de HTML.
 * Uso: npm i -D playwright && node scripts/generate-images.mjs
 * (Opcional: CHROME_PATH=/ruta/a/chrome para usar un Chromium existente.)
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const nm = (p) => 'file://' + path.join(root, 'node_modules', p);
const out = (f) => path.join(root, 'public', f);

const TOOTH =
  'M7.5 3C4.9 3 3.5 5 3.5 7.8c0 2.6 1 4.6 1.7 7.3.6 2.5 1 5.4 2.4 5.4 1.3 0 1.6-2.6 2.2-4.6.4-1.3 1.2-2.1 2.2-2.1s1.8.8 2.2 2.1c.6 2 .9 4.6 2.2 4.6 1.4 0 1.8-2.9 2.4-5.4.7-2.7 1.7-4.7 1.7-7.3C20.5 5 19.1 3 16.5 3c-1.9 0-3 1-4.5 1S9.4 3 7.5 3Z';

const fonts = `
@font-face{font-family:Sora;src:url(${nm('@fontsource-variable/sora/files/sora-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:Inter;src:url(${nm('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:Yellowtail;src:url(${nm('@fontsource/yellowtail/files/yellowtail-latin-400-normal.woff2')}) format('woff2')}
*{margin:0;box-sizing:border-box}`;

const icon = (size) => `<!doctype html><style>${fonts}body{width:${size}px;height:${size}px;background:#0e100e;display:grid;place-items:center}</style>
<svg viewBox="0 0 24 24" width="${size * 0.68}" height="${size * 0.68}" style="overflow:visible">
<path d="${TOOTH}" fill="none" stroke="#b5ee3a" stroke-width="3" opacity=".35" style="filter:blur(${size / 90}px)"/>
<path d="${TOOTH}" fill="none" stroke="#b5ee3a" stroke-width="1.7" stroke-linejoin="round"/></svg>`;

const og = `<!doctype html><style>${fonts}
body{width:1200px;height:630px;background:#0e100e;color:#fff;font-family:Inter;position:relative;overflow:hidden}
.slats{position:absolute;inset:0;opacity:.55;background:linear-gradient(90deg,rgb(14 16 14/.98),rgb(14 16 14/.75) 55%,rgb(14 16 14/.35)),repeating-linear-gradient(90deg,#3a2a1c 0 34px,#2c2016 34px 36px,#43301f 36px 70px,#2a1e14 70px 72px)}
.glow{position:absolute;right:120px;top:150px;width:420px;height:420px;border-radius:50%;background:rgb(181 238 58/.28);filter:blur(110px)}
.c{position:absolute;left:84px;top:92px}
.logo{display:flex;align-items:center;gap:14px;font-family:Sora;font-weight:800;font-size:30px;letter-spacing:.04em}
.logo b{color:#b5ee3a}
h1{font-family:Sora;font-weight:800;font-size:64px;line-height:1.02;letter-spacing:-.02em;margin-top:70px}
.s{display:block;font-family:Yellowtail;font-weight:400;color:#b5ee3a;font-size:100px;line-height:1.15;letter-spacing:0;text-shadow:0 0 8px rgb(181 238 58/.6),0 0 30px rgb(181 238 58/.45)}
p{margin-top:26px;font-size:26px;color:#c9cec9}
.tooth{position:absolute;right:80px;top:140px;width:320px;height:320px;overflow:visible}
</style>
<div class="slats"></div><div class="glow"></div>
<svg class="tooth" viewBox="0 0 24 24"><path d="${TOOTH}" fill="none" stroke="#b5ee3a" stroke-width="1.6" opacity=".45" style="filter:blur(4px)"/><path d="${TOOTH}" fill="none" stroke="#d9ffa0" stroke-width=".9" opacity=".7" style="filter:blur(1px)"/><path d="${TOOTH}" fill="none" stroke="#fff" stroke-width=".42" stroke-linejoin="round"/></svg>
<div class="c">
<div class="logo"><svg viewBox="0 0 24 24" width="40" height="40"><path d="${TOOTH}" fill="none" stroke="#fff" stroke-width="1.5"/></svg>DENTAL <b>MX</b></div>
<h1>Tu sonrisa en manos<span class="s">profesionales</span></h1>
<p>Clínica dental en Torreón · Agenda por WhatsApp</p>
</div>`;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const shots = [
  { html: icon(32), w: 32, h: 32, file: 'favicon-32.png' },
  { html: icon(180), w: 180, h: 180, file: 'apple-touch-icon.png' },
  { html: icon(192), w: 192, h: 192, file: 'icon-192.png' },
  { html: icon(512), w: 512, h: 512, file: 'icon-512.png' },
  { html: og, w: 1200, h: 630, file: 'og.png' },
];
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  // Se carga desde un archivo para que las fuentes locales (file://) estén permitidas.
  const tmp = path.join(os.tmpdir(), `dmx-${s.file}.html`);
  fs.writeFileSync(tmp, s.html);
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out(s.file) });
  await page.close();
  console.log('✓', s.file);
}
await browser.close();
