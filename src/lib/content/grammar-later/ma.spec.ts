import { describe, expect, it } from 'vitest';
import { maLesson } from './ma';
import {
	anyPiece,
	choice,
	glossAt,
	pieces,
	plainEnglish,
	stringsOf,
	textAt
} from '../testing/corpus';

/**
 * Checks the claims in `ma.ts` against the corpus: shortened interrogatives drop the ending alif
 * after a preposition, while relative preposition + mā compounds keep the alif and carry REL.
 */

const strings = stringsOf(maLesson).join('\n');

describe('the lesson on mā and its joined forms', () => {
	it('is right that shortened preposition + mā words join a preposition + mā and drop the final alif', () => {
		for (const ref of ['78:1:1', '79:43:1', '86:5:3']) {
			expect(anyPiece(ref, 'P'), ref).toBe(true);
			expect(
				pieces(ref).some((p) => p.features.includes('LEM:ما')),
				ref
			).toBe(true);
			expect(textAt(ref).endsWith('ا'), ref).toBe(false);
		}
		expect(anyPiece('78:1:1', 'INTG')).toBe(true);
		expect(anyPiece('79:43:1', 'INTG')).toBe(true);
	});

	it('is right that non-question preposition + mā words keep the final alif and are relative', () => {
		for (const ref of ['84:23:3', '77:42:2']) {
			expect(anyPiece(ref, 'REL'), ref).toBe(true);
			expect(anyPiece(ref, 'P'), ref).toBe(true);
			expect(textAt(ref).endsWith('ا'), ref).toBe(true);
		}
	});

	it('is right about the glosses of innamā, fa-ammā, and immā', () => {
		expect(plainEnglish(glossAt('79:45:1'))).toBe('only');
		expect(plainEnglish(glossAt('93:9:1'))).toBe('so as for');
		expect(plainEnglish(glossAt('76:3:4'))).toBe('whether');
	});

	it('asks for the shortened “about what” word, and the wrong choices keep their alif', () => {
		const two = choice(maLesson, 'ma-2');
		expect(two.answer.text).toBe(textAt('78:1:1'));
		for (const o of two.others) {
			expect(o.text.endsWith('ا')).toBe(true);
		}
	});

	it('taps mimma in verse 86:5, which is the third word', () => {
		const tap = maLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		expect(tap.words.map((w) => w.text)).toEqual([1, 2, 3, 4].map((n) => textAt(`86:5:${n}`)));
		const tapped = tap.words.findIndex((w) => w.id === tap.answerId) + 1;
		expect(tapped).toBe(3);
		expect(textAt(`86:5:${tapped}`).endsWith('ا')).toBe(false);
	});

	it('names all key words in the lesson strings', () => {
		for (const ref of [
			'78:1:1',
			'79:43:1',
			'86:5:3',
			'84:23:3',
			'77:42:2',
			'79:45:1',
			'93:9:1',
			'76:3:4'
		]) {
			expect(strings).toContain(textAt(ref));
		}
	});
});
