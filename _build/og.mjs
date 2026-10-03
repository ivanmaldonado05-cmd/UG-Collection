// Genera assets/img/og.jpg (1200×630): la imagen que aparece al compartir el sitio en WhatsApp, Instagram, Facebook…
// Uso: node _build/og.mjs
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sharp = createRequire(path.join(ROOT, '_extract/package.json'))('sharp');
const W = 1200, H = 630;

const bg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="74%" cy="50%" r="60%"><stop offset="0" stop-color="#b08d57" stop-opacity=".42"/><stop offset=".45" stop-color="#b08d57" stop-opacity=".08"/><stop offset="1" stop-color="#141519" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#141519"/>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="888" cy="315" r="250" fill="none" stroke="#d6b97f" stroke-opacity=".35" stroke-width="1.5"/>
  <circle cx="888" cy="315" r="272" fill="none" stroke="#d6b97f" stroke-opacity=".12" stroke-width="1"/>
  <line x1="80" y1="455" x2="128" y2="455" stroke="#d6b97f" stroke-width="2"/>
  <text x="142" y="461" font-family="Arial, Helvetica, sans-serif" font-size="19" letter-spacing="4.5" fill="#d6b97f">PAGANI DESIGN · PARAGUAY</text>
  <text x="80" y="510" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#f3efe8">Automáticos y cronógrafos</text>
  <text x="80" y="552" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#f3efe8">con materiales premium</text>
</svg>`);

const logo = await sharp(path.join(ROOT, '_brand/logo-ug-gold.png')).resize({ width: 330 }).png().toBuffer();
const watch = await sharp(path.join(ROOT, 'assets/img/products/pd-1644.webp'))
  .resize({ height: 520, fit: 'inside' }).png().toBuffer();
const wm = await sharp(watch).metadata();

await sharp(bg)
  .composite([
    { input: logo, left: 80, top: 78 },
    { input: watch, left: Math.round(888 - wm.width / 2), top: Math.round(315 - wm.height / 2) },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(ROOT, 'assets/img/og.jpg'));
console.log('assets/img/og.jpg listo');
