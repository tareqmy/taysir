import { describe, expect, it } from 'vitest';
import { questionsLesson } from './questions';
import { anyPiece, choice, glossAt, has, plainEnglish, stringsOf, textAt } from '../testing/corpus';

/**
 * Checks `questions.ts` against the corpus tags: alaysa, fa-ayna, and ayyāna carry INTG,
 * lan and lammā carry NEG, and balā and kallā carry ANS / AVR.
 */

const strings = stringsOf(questionsLesson).join('\n');

describe('the lesson on questions, “yes indeed”, and “never”', () => {
	it('is right that alaysa, fa-ayna, and ayyāna are question words in the corpus', () => {
		for (const ref of ['95:8:1', '81:26:1', '79:42:4']) {
			expect(anyPiece(ref, 'INTG'), ref).toBe(true);
		}
	});

	it('is right that lan and lammā are negatives', () => {
		for (const ref of ['84:14:4', '75:3:3', '80:23:2']) {
			expect(anyPiece(ref, 'NEG'), ref).toBe(true);
		}
	});

	it('is right that balā is an answer word and kallā is a rejection word', () => {
		expect(has('75:4:1', 'ANS')).toBe(true);
		expect(has('80:23:1', 'AVR')).toBe(true);
		expect(plainEnglish(glossAt('75:4:1'))).toBe('yes indeed');
		expect(plainEnglish(glossAt('80:23:1'))).toBe('nay');
	});

	it('asks which word means “when” in 79:42', () => {
		const five = choice(questionsLesson, 'quest-5');
		expect(five.answer.text).toBe(textAt('79:42:4'));
		expect(anyPiece('79:42:4', 'INTG')).toBe(true);
	});

	it('taps lammā in verse 80:23, which is the second word', () => {
		const tap = questionsLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		expect(tap.words.map((w) => w.text)).toEqual([1, 2, 3, 4, 5].map((n) => textAt(`80:23:${n}`)));
		const tapped = tap.words.findIndex((w) => w.id === tap.answerId) + 1;
		expect(tapped).toBe(2);
		expect(anyPiece(`80:23:${tapped}`, 'NEG')).toBe(true);
	});

	it('names all key words in the lesson strings', () => {
		for (const ref of [
			'95:8:1',
			'75:3:3',
			'75:4:1',
			'84:14:4',
			'80:23:1',
			'80:23:2',
			'81:26:1',
			'79:42:4'
		]) {
			expect(strings).toContain(textAt(ref));
		}
	});
});
