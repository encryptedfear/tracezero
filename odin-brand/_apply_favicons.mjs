// Generates ODIN-branded favicons into src/core/server/core_app/assets/favicons/
// - copies provided PNGs at native sizes
// - renders missing raster sizes (android-chrome, mstile) from the ODIN mark via puppeteer
// - packs favicon.ico from the 16/32/48 PNGs
// - writes a monochrome safari mask icon
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brand = join(root, 'odin-brand/favicon');
const out = join(root, 'src/core/server/core_app/assets/favicons');

// 1) Direct copies of provided brand PNGs ------------------------------------
copyFileSync(join(brand, 'apple-touch-icon-180.png'), join(out, 'apple-touch-icon.png'));
copyFileSync(join(brand, 'favicon-32.png'), join(out, 'favicon-32x32.png'));
copyFileSync(join(brand, 'favicon-16.png'), join(out, 'favicon-16x16.png'));
console.log('copied apple-touch-icon / favicon-16 / favicon-32');

// 2) App-icon render source: gradient ODIN mark centered on navy rounded tile -
const NAVY = '#0B1220';
const appIcon = (size, square = true) => `<!doctype html><html><head><style>
  html,body{margin:0;padding:0}
  svg{display:block}
</style></head><body>
<svg id="t" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${square ? size : Math.round(size * 150 / 310)}" viewBox="0 0 ${square ? '100 100' : '310 150'}">
  <rect width="100%" height="100%" fill="${NAVY}"${square ? ' rx="20"' : ''}></rect>
  <g transform="translate(${square ? 18 : 113},${square ? 18 : 33}) scale(0.64)">
    <defs><linearGradient id="g" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3B82F6"></stop><stop offset="1" stop-color="#22D3EE"></stop></linearGradient></defs>
    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#g)" stroke-width="7"></circle>
    <circle cx="50" cy="50" r="20" fill="none" stroke="url(#g)" stroke-width="8" opacity="0.4"></circle>
    <line x1="50" y1="50" x2="83.096" y2="24.142" stroke="url(#g)" stroke-width="8" stroke-linecap="round"></line>
    <circle cx="50" cy="50" r="6.5" fill="url(#g)"></circle>
  </g>
</svg></body></html>`;

// gradient mark on transparent bg, for the .ico high-res entry
const markTransparent = (size) => `<!doctype html><html><head><style>html,body{margin:0;padding:0}svg{display:block}</style></head><body>
<svg id="t" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3B82F6"></stop><stop offset="1" stop-color="#22D3EE"></stop></linearGradient></defs>
  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#g)" stroke-width="7"></circle>
  <circle cx="50" cy="50" r="20" fill="none" stroke="url(#g)" stroke-width="8" opacity="0.4"></circle>
  <line x1="50" y1="50" x2="83.096" y2="24.142" stroke="url(#g)" stroke-width="8" stroke-linecap="round"></line>
  <circle cx="50" cy="50" r="6.5" fill="url(#g)"></circle>
</svg></body></html>`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

async function render(html, w, h, transparent = false) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const el = await page.$('#t');
  const buf = await el.screenshot({ omitBackground: transparent, type: 'png' });
  await page.close();
  return buf;
}

// Android Chrome + manifest icons
writeFileSync(join(out, 'android-chrome-192x192.png'), await render(appIcon(192), 192, 192));
writeFileSync(join(out, 'android-chrome-512x512.png'), await render(appIcon(512), 512, 512));
console.log('rendered android-chrome 192 / 512');

// Windows tiles
for (const s of [70, 144, 150, 310]) {
  writeFileSync(join(out, `mstile-${s}x${s}.png`), await render(appIcon(s), s, s));
}
writeFileSync(join(out, 'mstile-310x150.png'), await render(appIcon(310, false), 310, 150));
console.log('rendered mstile tiles');

await browser.close();

// 3) favicon.ico from 16/32/48 PNGs (ICO with embedded PNG payloads) ----------
function buildIco(pngPaths) {
  const imgs = pngPaths.map((p) => {
    const data = readFileSync(p);
    // parse width/height from PNG IHDR (bytes 16-23)
    const w = data.readUInt32BE(16);
    const h = data.readUInt32BE(20);
    return { data, w, h };
  });
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(imgs.length, 4);

  const entries = [];
  let offset = 6 + imgs.length * 16;
  for (const img of imgs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(img.w >= 256 ? 0 : img.w, 0);
    e.writeUInt8(img.h >= 256 ? 0 : img.h, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // color planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(img.data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += img.data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...imgs.map((i) => i.data)]);
}

writeFileSync(
  join(out, 'favicon.ico'),
  buildIco([
    join(brand, 'favicon-16.png'),
    join(brand, 'favicon-32.png'),
    join(brand, 'favicon-48.png'),
  ])
);
console.log('packed favicon.ico');

// 4) Safari pinned-tab mask icon (monochrome silhouette; Safari recolors it) ---
const maskIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<circle cx="50" cy="50" r="42" fill="none" stroke="#000000" stroke-width="7"></circle>
<circle cx="50" cy="50" r="20" fill="none" stroke="#000000" stroke-width="8"></circle>
<line x1="50" y1="50" x2="83.096" y2="24.142" stroke="#000000" stroke-width="8" stroke-linecap="round"></line>
<circle cx="50" cy="50" r="6.5" fill="#000000"></circle>
</svg>
`;
writeFileSync(join(out, 'safari-pinned-tab.svg'), maskIcon);
console.log('wrote safari-pinned-tab.svg');

console.log('favicons done');
