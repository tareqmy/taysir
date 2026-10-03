/**
 * Renders the PWA icons as PNG files, so browsers and phones offer to install the app.
 *
 *   npm run icons
 *
 * Output (all written to static/):
 *   icon-192.png, icon-512.png   rounded square, purpose "any"
 *   icon-maskable-512.png        full-bleed square, purpose "maskable" (the OS applies its own mask)
 *   apple-touch-icon.png         full-bleed 180px square for iOS
 *
 * The drawing mirrors static/icon.svg (a green tile with two gold arches); keep the two in sync.
 * It rasterises the shapes directly with 4x4 supersampling and writes the PNGs itself, so it needs
 * no image library. Runs directly on Node (type stripping).
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

type Rgb = [number, number, number];

const GREEN: Rgb = [0x1f, 0x5c, 0x4a];
const GOLD: Rgb = [0xe3, 0xb8, 0x66];

/** The artwork is defined on a 512 by 512 canvas, like the SVG. */
const CANVAS = 512;
const TILE_RADIUS = 112;
const SAMPLES = 4;

interface Arch {
	/** Left and right edge of the arch's centre line. */
	left: number;
	right: number;
	/** Where the straight sides meet the curve, and where they end. */
	springY: number;
	baseY: number;
	/** Stroke width. */
	width: number;
	opacity: number;
}

// Mirrors the two <path> elements in static/icon.svg.
const ARCHES: Arch[] = [
	{ left: 150, right: 362, springY: 252, baseY: 392, width: 34, opacity: 1 },
	{ left: 214, right: 298, springY: 256, baseY: 392, width: 26, opacity: 0.7 }
];

function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
	const dx = bx - ax;
	const dy = by - ay;
	const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
	return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Distance from a point to the arch's centre line: two straight sides and a half circle on top. */
function distanceToArch(px: number, py: number, arch: Arch) {
	const cx = (arch.left + arch.right) / 2;
	const radius = (arch.right - arch.left) / 2;
	let d = Math.min(
		distanceToSegment(px, py, arch.left, arch.springY, arch.left, arch.baseY),
		distanceToSegment(px, py, arch.right, arch.springY, arch.right, arch.baseY)
	);
	if (py <= arch.springY)
		d = Math.min(d, Math.abs(Math.hypot(px - cx, py - arch.springY) - radius));
	return d;
}

/** Whether a point is inside a square with rounded corners (or a plain square when `radius` is 0). */
function insideTile(x: number, y: number, radius: number) {
	const nx = Math.min(x, CANVAS - x);
	const ny = Math.min(y, CANVAS - y);
	if (nx >= radius || ny >= radius) return x >= 0 && x <= CANVAS && y >= 0 && y <= CANVAS;
	return Math.hypot(radius - nx, radius - ny) <= radius;
}

/** Colour of the artwork at one point of the canvas, as straight RGB plus alpha (0 to 1). */
function sample(x: number, y: number, tileRadius: number): [number, number, number, number] {
	if (!insideTile(x, y, tileRadius)) return [0, 0, 0, 0];
	let color: Rgb = GREEN;
	for (const arch of ARCHES) {
		if (distanceToArch(x, y, arch) > arch.width / 2) continue;
		color = color.map((c, i) => c * (1 - arch.opacity) + GOLD[i] * arch.opacity) as Rgb;
	}
	return [...color, 1];
}

function render(size: number, tileRadius: number): Buffer {
	const scale = CANVAS / size;
	const pixels = Buffer.alloc(size * size * 4);
	for (let j = 0; j < size; j++) {
		for (let i = 0; i < size; i++) {
			let r = 0;
			let g = 0;
			let b = 0;
			let a = 0;
			for (let sy = 0; sy < SAMPLES; sy++) {
				for (let sx = 0; sx < SAMPLES; sx++) {
					const x = (i + (sx + 0.5) / SAMPLES) * scale;
					const y = (j + (sy + 0.5) / SAMPLES) * scale;
					const [sr, sg, sb, sa] = sample(x, y, tileRadius);
					r += sr * sa;
					g += sg * sa;
					b += sb * sa;
					a += sa;
				}
			}
			const o = (j * size + i) * 4;
			if (a > 0) {
				pixels[o] = Math.round(r / a);
				pixels[o + 1] = Math.round(g / a);
				pixels[o + 2] = Math.round(b / a);
			}
			pixels[o + 3] = Math.round((a / (SAMPLES * SAMPLES)) * 255);
		}
	}
	return pixels;
}

// --- PNG encoding -----------------------------------------------------------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
	let c = n;
	for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	return c >>> 0;
});

function crc32(data: Buffer): number {
	let c = 0xffffffff;
	for (const byte of data) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
	const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
	const out = Buffer.alloc(body.length + 8);
	out.writeUInt32BE(data.length, 0);
	body.copy(out, 4);
	out.writeUInt32BE(crc32(body), body.length + 4);
	return out;
}

function encodePng(size: number, rgba: Buffer): Buffer {
	const header = Buffer.alloc(13);
	header.writeUInt32BE(size, 0);
	header.writeUInt32BE(size, 4);
	header[8] = 8; // bits per channel
	header[9] = 6; // RGBA
	const rows = Buffer.alloc(size * (size * 4 + 1)); // each row starts with filter type 0
	for (let j = 0; j < size; j++) {
		rgba.copy(rows, j * (size * 4 + 1) + 1, j * size * 4, (j + 1) * size * 4);
	}
	return Buffer.concat([
		Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		chunk('IHDR', header),
		chunk('IDAT', deflateSync(rows, { level: 9 })),
		chunk('IEND', Buffer.alloc(0))
	]);
}

const staticDir = fileURLToPath(new URL('../static/', import.meta.url));
const icons = [
	{ file: 'icon-192.png', size: 192, tileRadius: TILE_RADIUS },
	{ file: 'icon-512.png', size: 512, tileRadius: TILE_RADIUS },
	{ file: 'icon-maskable-512.png', size: 512, tileRadius: 0 },
	{ file: 'apple-touch-icon.png', size: 180, tileRadius: 0 }
];
for (const { file, size, tileRadius } of icons) {
	const png = encodePng(size, render(size, tileRadius));
	writeFileSync(`${staticDir}${file}`, png);
	console.log(`${file.padEnd(24)} ${size}x${size}  ${png.length} bytes`);
}
