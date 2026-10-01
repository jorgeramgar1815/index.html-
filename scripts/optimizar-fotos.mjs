/*
 * Convierte tus fotos reales a los tamaños y formatos que usa el sitio
 * (AVIF + WebP + JPG) y las guarda en /img con el nombre correcto.
 *
 * Uso:
 *   1. Coloca tus fotos originales en la carpeta  fotos-originales/  con estos nombres
 *      (cualquier extensión: .jpg, .jpeg, .png, .webp, .heic no):
 *        armazones.jpg   → nueva colección de armazones
 *        sol.jpg         → lentes de sol y clip-on polarizados
 *        kids.jpg        → armazones de la línea Kids
 *        local.jpg       → fachada o interior del local en Plaza Reyna
 *   2. Dentro de la carpeta scripts/ ejecuta:  npm install  y después  npm run fotos
 *
 * Solo procesa las fotos que encuentre; las demás se quedan como están.
 */
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origen = path.join(raiz, "fotos-originales");
const destino = path.join(raiz, "img");

// nombre de origen → [prefijo de salida, proporción ancho/alto, anchos a generar]
const FOTOS = {
  armazones: ["foto-armazones", 16 / 10, [480, 800]],
  sol: ["foto-sol", 16 / 10, [480, 800]],
  kids: ["foto-kids", 16 / 10, [480, 800]],
  local: ["foto-local", 5 / 4, [560, 1000]],
};

await mkdir(destino, { recursive: true });
let archivos = [];
try {
  archivos = await readdir(origen);
} catch {
  console.error("No existe la carpeta fotos-originales/. Créala y coloca ahí tus fotos.");
  process.exit(1);
}

let procesadas = 0;
for (const archivo of archivos) {
  const base = path.parse(archivo).name.toLowerCase();
  const conf = FOTOS[base];
  if (!conf) continue;
  const [prefijo, ratio, anchos] = conf;
  for (const w of anchos) {
    const h = Math.round(w / ratio);
    // "attention" encuadra automáticamente la zona más relevante de la foto
    const img = sharp(path.join(origen, archivo)).rotate().resize(w, h, { fit: "cover", position: sharp.strategy.attention });
    await img.clone().avif({ quality: 55, effort: 6 }).toFile(path.join(destino, `${prefijo}-${w}.avif`));
    await img.clone().webp({ quality: 78 }).toFile(path.join(destino, `${prefijo}-${w}.webp`));
    await img.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(destino, `${prefijo}-${w}.jpg`));
  }
  console.log(`✓ ${archivo} → img/${prefijo}-*.avif|webp|jpg`);
  procesadas++;
}

if (!procesadas) {
  console.log("No se encontró ninguna foto con los nombres esperados: " + Object.keys(FOTOS).join(", "));
}
