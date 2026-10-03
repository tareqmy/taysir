import { describe, expect, it } from 'vitest';
import { splitArabic } from './text';

describe('splitArabic', () => {
	it('returns plain English as one part', () => {
		expect(splitArabic('Lord of the worlds')).toEqual([{ text: 'Lord of the worlds', ar: false }]);
	});

	it('separates an Arabic run from surrounding English', () => {
		expect(splitArabic('the word ال means “the”')).toEqual([
			{ text: 'the word ', ar: false },
			{ text: 'ال', ar: true },
			{ text: ' means “the”', ar: false }
		]);
	});

	it('keeps Arabic words separated by a space together', () => {
		const parts = splitArabic('see رَبِّ ٱلْعَٰلَمِينَ now');
		expect(parts.filter((p) => p.ar)).toHaveLength(1);
		expect(parts[1].text).toBe('رَبِّ ٱلْعَٰلَمِينَ');
	});

	it('splits letters separated by commas', () => {
		const arabic = splitArabic('such as ر, د, س').filter((p) => p.ar);
		expect(arabic.map((p) => p.text)).toEqual(['ر', 'د', 'س']);
	});

	it('handles empty text', () => {
		expect(splitArabic('')).toEqual([]);
	});
});
