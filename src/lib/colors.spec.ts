import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Text must stay readable (WCAG AA, 4.5:1) wherever the stylesheet puts it. This reads the colour
 * variables straight from app.css, so changing one of them cannot quietly break contrast.
 */

const css = readFileSync(new URL('../app.css', import.meta.url), 'utf8');

function variables(block: string): Record<string, string> {
	return Object.fromEntries(
		[...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]])
	);
}

const light = variables(css.match(/:root\s*{([^}]*)}/)![1]);
const dark = {
	...light,
	...variables(css.match(/prefers-color-scheme:\s*dark\)\s*{\s*:root\s*{([^}]*)}/)![1])
};

function luminance(hex: string): number {
	const [r, g, b] = [1, 3, 5]
		.map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
		.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
	const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (lighter + 0.05) / (darker + 0.05);
}

/** [text colour, background colour]: pairs the app really draws, by variable name. */
const pairs: [string, string][] = [
	['ink', 'bg'],
	['ink', 'surface'],
	['ink', 'surface-2'],
	['ink', 'good-soft'],
	['ink', 'bad-soft'],
	['ink-soft', 'bg'],
	['ink-soft', 'surface'],
	['ink-soft', 'surface-2'],
	['primary', 'bg'],
	['primary', 'surface'],
	['primary', 'surface-2'],
	['primary', 'primary-soft'],
	['primary-ink', 'primary'],
	['primary-ink', 'primary-hover'],
	['accent-ink', 'accent-soft'],
	['accent-ink', 'surface'],
	['accent-ink', 'bg'],
	['bg', 'accent-ink'],
	['good', 'good-soft'],
	['good', 'surface'],
	['bad', 'bad-soft'],
	['bad', 'surface']
];

/**
 * [shape colour, background colour]: things drawn rather than written, which need 3:1 (WCAG 1.4.11)
 * to be seen. The progress bars and the practice calendar.
 */
const graphics: [string, string][] = [
	['primary', 'surface'],
	['primary', 'surface-2'],
	['accent-ink', 'surface'],
	['accent-ink', 'surface-2'],
	['ink-soft', 'surface'],
	['ink-soft', 'surface-2']
];

describe.each([
	['light', light],
	['dark', dark]
])('%s colours', (_name, colours) => {
	it.each(pairs)('%s text on %s is at least 4.5:1', (text, background) => {
		expect(colours[text], `--${text}`).toBeDefined();
		expect(colours[background], `--${background}`).toBeDefined();
		expect(contrast(colours[text], colours[background])).toBeGreaterThanOrEqual(4.5);
	});

	it.each(graphics)('%s shapes on %s are at least 3:1', (shape, background) => {
		expect(colours[shape], `--${shape}`).toBeDefined();
		expect(colours[background], `--${background}`).toBeDefined();
		expect(contrast(colours[shape], colours[background])).toBeGreaterThanOrEqual(3);
	});
});
