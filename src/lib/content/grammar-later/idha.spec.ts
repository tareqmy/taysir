import { describe, expect, it } from 'vitest';
import { idhaLesson } from './idha';
import {
	anyPiece,
	choice,
	has,
	kindOf,
	refsOf,
	stringsOf,
	studiedBeforeLaterGrammar as studied,
	textAt
} from '../testing/corpus';

/**
 * What the lesson on runs of “when” says, checked against the corpus's tags: the clauses it counts
 * start with idhā, each clause's verb is “she”, the answer is not a “when” clause, and the answers
 * to its questions are what they are said to be.
 */

/** Whether a verse begins with “when”, that is with idhā, with or without wa- in front. */
const opensWithWhen = (surah: number, ayah: number) => has(`${surah}:${ayah}:1`, 'T');

const count = (surah: number, from: number, to: number) =>
	Array.from({ length: to - from + 1 }, (_, i) => from + i).filter((a) => opensWithWhen(surah, a))
		.length;

const strings = stringsOf(idhaLesson).join('\n');

describe('the lesson on runs of “when”', () => {
	it('is right that Al-Infitar has four “when” clauses and then an answer that is not one', () => {
		expect(count(82, 1, 4)).toBe(4);
		expect(opensWithWhen(82, 5)).toBe(false);
	});

	it('says four, in the question and the lesson, because that is how many there are', () => {
		expect(choice(idhaLesson, 'idha-4').answer.text).toBe(
			['', 'one', 'two', 'three', 'four'][count(82, 1, 4)]
		);
		expect(strings).toContain(`twelve “when” clauses`);
		expect(count(81, 1, 13)).toBe(12);
	});

	it('is right that At-Takwir has twelve “when” clauses before its answer', () => {
		expect(count(81, 1, 13)).toBe(12);
		expect(opensWithWhen(81, 9)).toBe(false);
		expect(opensWithWhen(81, 14)).toBe(false);
	});

	it('is right that each next clause begins wa-idhā, and the first begins idhā alone', () => {
		expect(anyPiece('82:1:1', 'PREF')).toBe(false);
		for (const ref of ['82:2:1', '82:3:1', '82:4:1']) {
			expect(has(ref, 'T'), ref).toBe(true);
			expect(anyPiece(ref, 'CONJ'), `${ref} has a wa-`).toBe(true);
		}
	});

	it('is right that each clause has a noun and then a “she” verb, past in form', () => {
		for (const verb of ['82:1:3', '82:2:3', '82:3:3', '82:4:3']) {
			expect(kindOf(verb), verb).toBe('verb');
			expect(has(verb, 'PERF'), verb).toBe(true);
			expect(has(verb, '3FS'), verb).toBe(true);
		}
		for (const noun of ['82:1:2', '82:2:2', '82:3:2', '82:4:2']) {
			expect(kindOf(noun), noun).toBe('noun');
		}
		// The sky is a feminine singular; the planets, seas and graves are plurals.
		expect(has('82:1:2', 'F')).toBe(true);
		for (const plural of ['82:2:2', '82:3:2', '82:4:2']) {
			expect(has(plural, 'MP') || has(plural, 'FP'), plural).toBe(true);
		}
	});

	it('is right that the answer’s verb has a past form and is “she”, in both surahs', () => {
		for (const ref of ['82:5:1', '81:14:1']) {
			expect(has(ref, 'PERF'), ref).toBe(true);
			expect(has(ref, '3FS'), ref).toBe(true);
		}
		expect(has('82:5:2', 'FS')).toBe(true); // a soul: the doer is a feminine word
		expect(has('81:14:2', 'FS')).toBe(true);
	});

	it('asks what wa-idhā means about a word that is wa- and idhā', () => {
		expect(choice(idhaLesson, 'idha-1').answer.text).toBe('and when');
		expect(anyPiece('82:2:1', 'CONJ') && has('82:2:1', 'T')).toBe(true);
	});

	it('asks which word is the verb of a clause, with the noun and “when” as the wrong answers', () => {
		const { answer, others } = choice(idhaLesson, 'idha-2');
		expect(refsOf(answer.text, studied).map(kindOf)).toContain('verb');
		for (const o of others) {
			expect(refsOf(o.text, studied).map(kindOf).includes('verb'), o.text).toBe(false);
		}
	});

	it('asks which word begins the answer, with two verbs from the clauses as the wrong answers', () => {
		const { answer, others } = choice(idhaLesson, 'idha-5');
		expect(refsOf(answer.text, studied)).toContain('82:5:1');
		for (const o of others) {
			expect(refsOf(o.text, studied).map(kindOf), o.text).toContain('verb');
			expect(
				refsOf(o.text, studied).some((r) => r.startsWith('82:')),
				o.text
			).toBe(true);
		}
	});

	it('taps the soul in the answer verse', () => {
		const tap = idhaLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		expect(tap.words.map((w) => w.text)).toEqual([1, 2, 3, 4].map((n) => textAt(`81:14:${n}`)));
		const tapped = tap.words.findIndex((w) => w.id === tap.answerId) + 1;
		expect(has(`81:14:${tapped}`, 'LEM:نَفْس')).toBe(true);
	});

	it('names the words it points at', () => {
		for (const ref of ['82:1:1', '82:2:1', '82:5:1', '81:14:2']) {
			expect(strings).toContain(textAt(ref));
		}
	});
});
