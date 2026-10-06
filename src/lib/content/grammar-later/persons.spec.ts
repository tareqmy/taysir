import { describe, expect, it } from 'vitest';
import { personsLesson } from './persons';
import {
	choice,
	has,
	kindOf,
	refsOf,
	stringsOf,
	studiedBeforeLaterGrammar as studied,
	textAt
} from '../testing/corpus';

/**
 * What the lesson on “she” and “they” says about each verb, checked against the corpus's tags:
 * every verb it names is a past verb of the person it says, and each question's right and wrong
 * answers are the persons they are said to be.
 */

/** The past-tense verbs the lesson names, with the person the corpus gives each. */
const verbs: Record<string, string> = {
	'110:3:6': '3MS', // kāna, he was
	'78:21:3': '3FS', // kānat, she was
	'78:27:2': '3MP', // kānū, they were
	'82:5:1': '3FS', // ʿalimat, a soul will know
	'101:6:3': '3FS', // thaqulat, his scales became heavy
	'103:3:3': '3MP', // āmanū, they believed
	'103:3:4': '3MP', // ʿamilū, and they did
	'100:4:1': '3FP', // fa-atharna, then they raised
	'78:28:1': '3MP' // wa-kadhdhabū, and they denied
};

/** The persons of the past verbs in every place a verb's text appears in the studied surahs. */
const personsOf = (text: string) =>
	refsOf(text, studied).map((ref) =>
		has(ref, 'PERF') ? ['3MS', '3FS', '3MP', '3FP'].find((p) => has(ref, p)) : undefined
	);

const strings = stringsOf(personsLesson).join('\n');

describe('the lesson on “she” and “they” in the past', () => {
	it.each(Object.entries(verbs))('%s is a past verb in the person %s', (ref, person) => {
		expect(kindOf(ref)).toBe('verb');
		expect(has(ref, 'PERF')).toBe(true);
		expect(has(ref, person)).toBe(true);
	});

	it.each(Object.keys(verbs))('names %s in the lesson', (ref) => {
		expect(strings).toContain(textAt(ref));
	});

	it('only says a verb is “she”, “they” or “he” when the corpus gives it that person', () => {
		const wanted: Record<string, string> = { she: '3FS', they: '3MP', he: '3MS' };
		const claims = [...strings.matchAll(/([\p{scx=Arabic}\p{M}]+) is “(she|they|He|he) /gu)];
		expect(claims.length).toBeGreaterThan(3);
		for (const [, word, who] of claims) {
			const persons = personsOf(word);
			expect(persons.length, `${word} is a verb of the studied surahs`).toBeGreaterThan(0);
			expect(
				persons.every((p) => p === wanted[who.toLowerCase()]),
				`${word} is “${who}”`
			).toBe(true);
		}
	});

	it('shows the same verb, kāna, with no ending for “he”, -at for “she” and -ū for “they”', () => {
		for (const ref of ['110:3:6', '78:21:3', '78:27:2']) {
			expect(has(ref, 'FAM:كَان'), `${ref} is a form of kāna`).toBe(true);
		}
	});

	it('has the “she” doers it names as feminine words, and “scales” as a plural of things', () => {
		expect(has('82:5:2', 'FS')).toBe(true); // a soul
		expect(has('78:21:2', 'PN')).toBe(true); // Hell, a name the lesson calls feminine
		expect(has('101:6:4', 'MP')).toBe(true); // scales: a plural, yet the verb is “she”
	});

	it('asks about the person of each verb it shows', () => {
		const one = choice(personsLesson, 'persons-1');
		expect(one.answer.text).toBe('she (a feminine doer)');
		expect(has('78:21:3', '3FS')).toBe(true);
		const two = choice(personsLesson, 'persons-2');
		expect(two.answer.text).toBe('they');
		expect(has('78:27:2', '3MP')).toBe(true);
	});

	it('asks which verb means “they were”, with the she and he verbs as the wrong answers', () => {
		const { answer, others } = choice(personsLesson, 'persons-3');
		expect(personsOf(answer.text)).toEqual(expect.arrayContaining(['3MP']));
		expect(personsOf(answer.text).every((p) => p === '3MP')).toBe(true);
		for (const o of others) expect(personsOf(o.text).includes('3MP'), o.text).toBe(false);
		expect(new Set(others.flatMap((o) => personsOf(o.text)))).toEqual(new Set(['3FS', '3MS']));
	});

	it('asks which verb has the “they” ending, with no wrong answer that has it', () => {
		const { answer, others } = choice(personsLesson, 'persons-7');
		expect(personsOf(answer.text).every((p) => p === '3MP')).toBe(true);
		for (const o of others) {
			expect(
				personsOf(o.text).some((p) => p === '3MP'),
				o.text
			).toBe(false);
		}
	});

	it('taps the one verb of “and they denied Our signs with denial”', () => {
		const tap = personsLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		const kinds = tap.words.map((_, i) => kindOf(`78:28:${i + 1}`));
		expect(kinds.filter((k) => k === 'verb')).toHaveLength(1);
		expect(kinds[tap.words.findIndex((w) => w.id === tap.answerId)]).toBe('verb');
		expect(tap.words.map((w) => w.text)).toEqual([1, 2, 3].map((n) => textAt(`78:28:${n}`)));
	});
});
