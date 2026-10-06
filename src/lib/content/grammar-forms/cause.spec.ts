import { describe, expect, it } from 'vitest';
import { causeLesson } from './cause';
import {
	choice,
	formOf,
	kindOf,
	rootOf,
	stringsOf,
	studiedBeforeLaterGrammar as studied,
	textAt,
	refsOf
} from '../testing/corpus';

/**
 * What the lesson on Form II and Form IV says, checked against the corpus's tags: each pair it gives
 * is a plain Form I verb and a Form II or IV verb of the same root, and each question's right and
 * wrong answers are in the forms they are said to be.
 */

/** The plain verb, the derived verb and the derived verb's form, for each pair the lesson shows. */
const pairs: [string, string, string][] = [
	['78:4:2', '96:4:2', '2'], // know, teach
	['80:12:3', '87:9:1', '2'], // remember, remind
	['87:13:3', '80:21:2', '4'], // die, cause to die
	['96:1:1', '87:6:1', '4'] // read, make recite
];

const strings = stringsOf(causeLesson).join('\n');

describe('the lesson on Form II and Form IV', () => {
	it.each(pairs)('%s and %s: the same root, the plain verb and Form %s', (plain, derived, form) => {
		expect(kindOf(plain)).toBe('verb');
		expect(kindOf(derived)).toBe('verb');
		expect(formOf(plain)).toBe('1');
		expect(formOf(derived)).toBe(form);
		expect(rootOf(derived)).toBe(rootOf(plain));
	});

	it.each(pairs.flatMap(([plain, derived]) => [plain, derived]))(
		'names %s in the lesson',
		(ref) => {
			expect(strings).toContain(textAt(ref));
		}
	);

	it('asks which verb has a doubled middle letter, and it is the only Form II one', () => {
		const { answer, others } = choice(causeLesson, 'cause-1');
		expect(refsOf(answer.text, studied).map(formOf)).toContain('2');
		for (const o of others) {
			expect(refsOf(o.text, studied).map(formOf), o.text).not.toContain('2');
		}
	});

	it('asks which verb has the a- of Form IV, and neither wrong answer is Form IV', () => {
		const { answer, others } = choice(causeLesson, 'cause-2');
		expect(refsOf(answer.text, studied).map(formOf)).toContain('4');
		for (const o of others) {
			expect(refsOf(o.text, studied).map(formOf), o.text).not.toContain('4');
		}
	});

	it('asks for the plain verb of the root of “We will make you recite”', () => {
		const { answer, others } = choice(causeLesson, 'cause-7');
		expect(refsOf(answer.text, studied)).toContain('96:1:1');
		expect(rootOf('96:1:1')).toBe(rootOf('87:6:1'));
		for (const o of others) {
			for (const ref of refsOf(o.text, studied))
				expect(rootOf(ref), o.text).not.toBe(rootOf('87:6:1'));
		}
	});

	it('matches only verbs of these pairs, with meanings that fit', () => {
		const match = causeLesson.exercises.find((e) => e.id === 'cause-5');
		if (match?.kind !== 'match') throw new Error('no match question');
		expect(match.pairs.map((p) => p.left.text).sort()).toEqual(
			['87:13:3', '80:21:2', '96:4:2', '87:9:1'].map(textAt).sort()
		);
	});

	it('taps the Form II verb of verse 96:5, the first word, not the plain verb in it', () => {
		const tap = causeLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		expect(tap.words.map((w) => w.text)).toEqual([1, 2, 3, 4, 5].map((n) => textAt(`96:5:${n}`)));
		const tapped = tap.words.findIndex((w) => w.id === tap.answerId) + 1;
		expect(formOf(`96:5:${tapped}`)).toBe('2');
		expect(formOf('96:5:5')).toBe('1');
	});
});
