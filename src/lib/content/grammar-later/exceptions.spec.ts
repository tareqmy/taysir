import { describe, expect, it } from 'vitest';
import { exceptionsLesson } from './exceptions';
import { anyPiece, choice, has, kindOf, stringsOf, textAt } from '../testing/corpus';

/**
 * What the lesson on illā says about each word, checked against the corpus's tags: the illā after a
 * group is tagged as an exception, the ones after a negative as a restriction, the negative in is a
 * negative, and the answers to its questions are what they are said to be.
 */

const strings = stringsOf(exceptionsLesson).join('\n');

describe('the lesson on “except” and “only”', () => {
	it('is right that illā after a group is an exception', () => {
		for (const ref of ['103:3:1', '88:23:1']) {
			expect(kindOf(ref), ref).toBe('small word');
			expect(has(ref, 'EXP'), ref).toBe(true);
		}
	});

	it('is right that illā after a negative is a restriction, and a negative comes before it', () => {
		for (const [illa, negative] of [
			['92:15:3', '92:15:1'],
			['98:5:3', '98:5:1'],
			['81:27:3', '81:27:1']
		]) {
			expect(has(illa, 'RES'), illa).toBe(true);
			expect(anyPiece(negative, 'NEG'), `${negative} is a negative`).toBe(true);
		}
	});

	it('is right that in in “it is nothing but a reminder” is a negative, not a condition', () => {
		expect(has('81:27:1', 'NEG')).toBe(true);
		expect(anyPiece('81:27:1', 'COND')).toBe(false);
	});

	it('is right that man after illā is “the one who”, not a condition word', () => {
		expect(anyPiece('88:23:2', 'REL')).toBe(true);
		expect(anyPiece('88:23:2', 'COND')).toBe(false);
	});

	it('is right that the exception follows a statement about the group, and a negative in 88:22', () => {
		expect(has('103:2:1', 'ACC')).toBe(true); // inna: indeed
		expect(has('88:22:1', 'VF:1')).toBe(true);
		expect(has('88:22:1', 'FAM:كَان')).toBe(true); // laysa, the negative “is not”
	});

	it('asks what illā means, and which word in a verse means “except”', () => {
		expect(choice(exceptionsLesson, 'except-1').answer.text).toBe('except');
		expect(choice(exceptionsLesson, 'except-1').exercise.choices.length).toBe(4);
		const four = choice(exceptionsLesson, 'except-4');
		expect(four.answer.text).toBe(textAt('88:23:1'));
		expect(four.others.map((o) => o.text).sort()).toEqual(
			[textAt('88:23:2'), textAt('88:23:3')].sort()
		);
		expect(anyPiece('88:23:1', 'EXP')).toBe(true);
	});

	it('asks what “not … except” means, and says it is “only”', () => {
		expect(choice(exceptionsLesson, 'except-5').answer.text).toBe('only');
		expect(has('98:5:3', 'RES')).toBe(true);
	});

	it('asks what in means in the verse, and it is a negative', () => {
		expect(choice(exceptionsLesson, 'except-6').answer.text).toBe('not');
		expect(has('81:27:1', 'NEG')).toBe(true);
	});

	it('matches small words with the meanings the corpus tags give them', () => {
		const match = exceptionsLesson.exercises.find((e) => e.id === 'except-7');
		if (match?.kind !== 'match') throw new Error('no match question');
		const shown = ['103:3:1', '98:5:1', '92:15:1', '103:2:1'];
		expect(match.pairs.map((p) => p.left.text).sort()).toEqual(shown.map(textAt).sort());
		for (const ref of shown) expect(kindOf(ref), ref).toBe('small word');
		expect(anyPiece('103:3:1', 'EXP')).toBe(true);
		expect(anyPiece('98:5:1', 'NEG')).toBe(true);
		expect(anyPiece('92:15:1', 'NEG')).toBe(true);
		expect(has('103:2:1', 'ACC')).toBe(true);
	});

	it('taps the illā of verse 92:15, which is the third word', () => {
		const tap = exceptionsLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		expect(tap.words.map((w) => w.text)).toEqual([1, 2, 3, 4].map((n) => textAt(`92:15:${n}`)));
		const tapped = tap.words.findIndex((w) => w.id === tap.answerId) + 1;
		expect(tapped).toBe(3);
		expect(has(`92:15:${tapped}`, 'RES')).toBe(true);
	});

	it('names the words it points at', () => {
		for (const ref of ['103:3:1', '88:23:1', '92:15:3', '81:27:1', '98:5:3']) {
			expect(strings).toContain(textAt(ref));
		}
	});
});
