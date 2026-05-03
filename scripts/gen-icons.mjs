import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../static/icons');
mkdirSync(iconsDir, { recursive: true });

function makeSVG(size) {
	const r = Math.round(size * 0.2);
	const strokeW = Math.round(size * 0.085);
	const cx = size / 2;
	const cy = size / 2;
	const circR = Math.round(size * 0.28);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#6366f1"/>
  <circle cx="${cx}" cy="${cy}" r="${circR}" fill="none" stroke="white" stroke-width="${Math.round(strokeW * 0.6)}" opacity="0.3"/>
  <path d="M${cx - circR * 0.55} ${cy} L${cx - circR * 0.1} ${cy + circR * 0.5} L${cx + circR * 0.6} ${cy - circR * 0.45}"
        stroke="white" stroke-width="${strokeW}" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

function makeMaskableSVG(size) {
	const strokeW = Math.round(size * 0.085);
	const cx = size / 2;
	const cy = size / 2;
	const circR = Math.round(size * 0.22);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#6366f1"/>
  <circle cx="${cx}" cy="${cy}" r="${circR}" fill="none" stroke="white" stroke-width="${Math.round(strokeW * 0.6)}" opacity="0.3"/>
  <path d="M${cx - circR * 0.55} ${cy} L${cx - circR * 0.1} ${cy + circR * 0.5} L${cx + circR * 0.6} ${cy - circR * 0.45}"
        stroke="white" stroke-width="${strokeW}" fill="none"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

// Write SVGs (kept for browsers that support them)
for (const size of [72, 192, 512]) {
	writeFileSync(join(iconsDir, `icon-${size}.svg`), makeSVG(size));
}
writeFileSync(join(iconsDir, 'icon-maskable-512.svg'), makeMaskableSVG(512));

// Generate PNGs — required by Chrome/Android for PWA install prompt
for (const size of [192, 512]) {
	await sharp(Buffer.from(makeSVG(size))).resize(size, size).png().toFile(join(iconsDir, `icon-${size}.png`));
}
await sharp(Buffer.from(makeMaskableSVG(512))).resize(512, 512).png().toFile(join(iconsDir, 'icon-maskable-512.png'));

console.log('Icons written to static/icons/');
