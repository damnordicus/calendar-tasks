// Generates PNG icons from SVG using canvas (requires @napi-rs/canvas or sharp)
// Falls back to writing SVG files that browsers accept for development
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../static/icons');
mkdirSync(iconsDir, { recursive: true });

// SVG icon design: indigo rounded square with a checkmark
function makeSVG(size) {
	const r = Math.round(size * 0.2);
	const pad = Math.round(size * 0.18);
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

// Write SVGs (work as PWA icons in Chrome/Edge; iOS needs PNG)
for (const size of [72, 192, 512]) {
	writeFileSync(join(iconsDir, `icon-${size}.svg`), makeSVG(size));
}

// Write a maskable variant (same but with more padding)
function makeMaskableSVG(size) {
	const r = 0; // full square for maskable safe-zone
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

writeFileSync(join(iconsDir, 'icon-maskable-512.svg'), makeMaskableSVG(512));

console.log('Icons generated in static/icons/');
