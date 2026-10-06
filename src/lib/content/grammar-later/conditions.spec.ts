import { describe, expect, it } from 'vitest';
import { conditionsLesson } from './conditions';
import { anyPiece, choice, has, kindOf, stringsOf, textAt } from '../testing/corpus';

/**
 * What the lesson on conditions says about each word, checked against the corpus's tags: the words
 * it calls condition words are tagged as conditions, inna is not one, the verbs it says lose their
 * -u are in the shortened mood, and the answers to its questions are what they are said to be.
 */

const strings = stringsOf(conditionsLesson).join('\n');

/** Every word the lesson uses as a condition word, with the piece that carries the condition. */
const conditionWords = ['87:9:2', '96:15:2', '102:5:2', '99:7:1', '99:8:1', '80:12:1', '96:11:2'];

describe('the lesson on conditions', () => {
	it.each(conditionWords)('%s is a condition word in the corpus', (ref) => {
		expect(anyPiece(ref, 'COND')).toBe(true);
	});

	it('is right that in and law are small words and man is a noun, and none is inna', () => {
		expect(anyPiece('87:9:2', 'COND')).toBe(true);
		expect(kindOf('87:9:2')).toBe('small word');
		expect(kindOf('102:5:2')).toBe('small word');
		expect(anyPiece('99:7:1', 'COND')).toBe(true);
		expect(anyPiece('78:21:1', 'COND')).toBe(false);
		expect(has('78:21:1', 'ACC')).toBe(true);
	});

	it('is right that the verbs it says lose their -u are in the shortened mood', () => {
		for (const ref of ['99:7:2', '99:7:6', '96:15:4']) {
			expect(has(ref, 'MOOD:JUS'), ref).toBe(true);
		}
	});

	it('is right that the verb in “so whoever wills” has a past form, and so has its result', () => {
		for (const ref of ['80:12:2', '80:12:3']) {
			expect(kindOf(ref)).toBe('verb');
			expect(has(ref, 'PERF'), ref).toBe(true);
		}
	});

	it('is right that the result in the third example starts with the emphatic la-', () => {
		expect(anyPiece('96:15:5', 'EMPH')).toBe(true);
		expect(anyPiece('96:15:2', 'EMPH')).toBe(true);
		expect(has('96:15:3', 'NEG')).toBe(true); // lam: the same shortening
	});

	it('is right that law’s verb is a present form with a past meaning in the lesson', () => {
		expect(has('102:5:3', 'IMPF')).toBe(true);
	});

	it('asks what a condition word means, and which of two looks-alikes means “indeed”', () => {
		const one = choice(conditionsLesson, 'cond-1');
		expect(one.answer.text).toBe('if');
		expect(anyPiece('87:9:2', 'COND')).toBe(true);

		const two = choice(conditionsLesson, 'cond-2');
		expect(two.answer.text).toBe(textAt('78:21:1'));
		expect(anyPiece('78:21:1', 'COND')).toBe(false);
		expect(two.others.map((o) => o.text).sort()).toEqual(
			[textAt('87:9:2'), textAt('102:5:2')].sort()
		);
		expect(anyPiece('87:9:2', 'COND') && anyPiece('102:5:2', 'COND')).toBe(true);
	});

	it('asks which word is the result, and it is the one that is not part of the condition', () => {
		const five = choice(conditionsLesson, 'cond-5');
		expect(five.answer.text).toBe(textAt('80:12:3'));
		expect(kindOf('80:12:3')).toBe('verb');
		for (const o of five.others) expect(o.text).not.toBe(five.answer.text);
		expect(anyPiece('80:12:1', 'COND')).toBe(true);

		const eight = choice(conditionsLesson, 'cond-8');
		expect(eight.answer.text).toBe(textAt('96:15:5'));
		expect(eight.others.map((o) => o.text)).toEqual(
			expect.arrayContaining([textAt('96:15:2'), textAt('96:15:4')])
		);
		expect(anyPiece('96:15:5', 'EMPH') && !anyPiece('96:15:5', 'COND')).toBe(true);
	});

	it('asks which word starts the condition, and it is the law of the verse', () => {
		const six = choice(conditionsLesson, 'cond-6');
		expect(six.answer.text).toBe(textAt('102:5:2'));
		expect(anyPiece('102:5:2', 'COND')).toBe(true);
		expect(six.others.map((o) => o.text).sort()).toEqual(
			[textAt('102:5:1'), textAt('102:5:4')].sort()
		);
		for (const ref of ['102:5:1', '102:5:4']) expect(anyPiece(ref, 'COND'), ref).toBe(false);
	});

	it('matches only condition words to their meanings', () => {
		const match = conditionsLesson.exercises.find((e) => e.id === 'cond-7');
		if (match?.kind !== 'match') throw new Error('no match question');
		const shown = ['87:9:2', '96:15:2', '99:7:1', '99:8:1'];
		expect(match.pairs.map((p) => p.left.text).sort()).toEqual(shown.map(textAt).sort());
		for (const ref of shown) expect(anyPiece(ref, 'COND'), ref).toBe(true);
	});

	it('names the words it points at', () => {
		for (const ref of ['87:9:2', '78:21:1', '99:7:2', '99:7:6', '102:5:2', '96:15:5']) {
			expect(strings).toContain(textAt(ref));
		}
	});
});
