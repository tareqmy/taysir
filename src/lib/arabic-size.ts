/**
 * How big the Arabic text is, as chosen in Settings. The choice is kept on the device, not in the
 * learner's progress, so a small phone and a laptop can differ and a restored backup never changes
 * it. `scale` multiplies the app's usual Arabic size; 1 is that size.
 */

export const ARABIC_SIZES = [
	{ id: 'smaller', label: 'Smaller', scale: 0.9 },
	{ id: 'standard', label: 'Standard', scale: 1 },
	{ id: 'large', label: 'Large', scale: 1.25 },
	{ id: 'largest', label: 'Largest', scale: 1.5 }
] as const;

export type ArabicSizeId = (typeof ARABIC_SIZES)[number]['id'];

export const DEFAULT_ARABIC_SIZE: ArabicSizeId = 'standard';

/** Where the choice is kept in the browser. */
export const ARABIC_SIZE_KEY = 'taysir.arabicSize';

export function isArabicSize(value: unknown): value is ArabicSizeId {
	return ARABIC_SIZES.some((size) => size.id === value);
}

/** A saved value as a size, or the standard one if it is missing or not one this version has. */
export function parseArabicSize(value: unknown): ArabicSizeId {
	return isArabicSize(value) ? value : DEFAULT_ARABIC_SIZE;
}

export function scaleOf(id: ArabicSizeId): number {
	return ARABIC_SIZES.find((size) => size.id === id)!.scale;
}
