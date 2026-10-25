import { describe, expect, it } from 'vitest';
import { directionsLesson } from './directions';
import {
	anyPiece,
	choice,
	glossAt,
	has,
	kindOf,
	plainEnglish,
	stringsOf,
	textAt
} from '../testing/corpus';

/**
 * Checks `directions.ts` against the corpus: the location words carry the LOC tag (or GEN after
 * min), and the possession/people words match their corpus glosses.
 */

const strings = stringsOf(directionsLesson).join('\n');

describe('the lesson on places, directions, and possession', () => {
	it('is right that fawqa, ʿinda, and ladā carry LOC, and taḥta, bayna, and warāʾa take GEN after min', () => {
		for (const ref of ['78:12:2', '81:20:3', '73:12:2']) {
			expect(anyPiece(ref, 'LOC'), ref).toBe(true);
		}
		for (const ref of ['85:11:10', '86:7:3', '85:20:3']) {
			expect(kindOf(ref), ref).toBe('noun');
			expect(has(ref, 'GEN'), ref).toBe(true);
		}
	});

	it('is right about the glosses of dhī, dhāt, and ahl', () => {
		expect(plainEnglish(glossAt('81:20:1'))).toBe('possessor of');
		expect(plainEnglish(glossAt('85:1:2'))).toBe('having');
		expect(plainEnglish(glossAt('98:1:6'))).toBe('the people of');
	});

	it('asks which word means “between” in 86:7', () => {
		const two = choice(directionsLesson, 'dir-2');
		expect(two.answer.text).toBe(textAt('86:7:3'));
		expect(plainEnglish(glossAt('86:7:3'))).toBe('between');
	});

	it('taps ʿinda in verse 81:20, which is the third word', () => {
		const tap = directionsLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		expect(tap.words.map((w) => w.text)).toEqual(
			[1, 2, 3, 4, 5, 6].map((n) => textAt(`81:20:${n}`))
		);
		const tapped = tap.words.findIndex((w) => w.id === tap.answerId) + 1;
		expect(tapped).toBe(3);
		expect(anyPiece(`81:20:${tapped}`, 'LOC')).toBe(true);
	});

	it('names all key words in the lesson strings', () => {
		for (const ref of [
			'78:12:2',
			'85:11:10',
			'86:7:3',
			'85:20:3',
			'81:20:1',
			'81:20:3',
			'85:1:2',
			'73:12:2',
			'98:1:6'
		]) {
			expect(strings).toContain(textAt(ref));
		}
	});
});
