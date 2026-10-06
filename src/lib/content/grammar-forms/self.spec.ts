import { describe, expect, it } from 'vitest';
import { selfLesson } from './self';
import {
	choice,
	formOf,
	kindOf,
	refsOf,
	rootOf,
	stringsOf,
	studiedBeforeLaterGrammar as studied,
	textAt
} from '../testing/corpus';

/**
 * What the lesson on Forms V and VI says, checked against the corpus's tags: each pair it gives is
 * a Form I or Form II verb and a Form V or VI verb of the same root, and each question's right
 * and wrong answers are in the forms and roots they are said to be.
 */

/** The base verb, the derived verb, and the base and derived forms, for each pair the lesson shows. */
const pairs: [string, string, string, string][] = [
	['91:9:4', '92:18:4', '2', '5'], // purify, purify oneself
	['87:9:1', '79:35:2', '2', '5'], // remind, remember
	['79:42:1', '78:1:2', '1', '6'], // ask you, ask one another
	['107:3:2', '89:18:2', '1', '6'] // urge, urge each other
];

const strings = stringsOf(selfLesson).join('\n');

describe('the lesson on Forms V and VI', () => {
	it.each(pairs)('%s and %s: the same root, Form %s and Form %s', (base, derived, from, to) => {
		expect(kindOf(base)).toBe('verb');
		expect(kindOf(derived)).toBe('verb');
		expect(formOf(base)).toBe(from);
		expect(formOf(derived)).toBe(to);
		expect(rootOf(derived)).toBe(rootOf(base));
	});

	it.each(pairs.flatMap(([base, derived]) => [base, derived]))('names %s in the lesson', (ref) => {
		expect(strings).toContain(textAt(ref));
	});

	it('is right that a verb that begins with ya-ta- or ta- before the doubled letter is Form V', () => {
		for (const ref of ['92:18:4', '79:35:2', '80:1:2', '84:4:4'])
			expect(formOf(ref), ref).toBe('5');
	});

	it('asks which verb is Form V, with a Form II and a plain verb as the wrong answers', () => {
		const { answer, others } = choice(selfLesson, 'self-1');
		expect(refsOf(answer.text, studied).map(formOf)).toContain('5');
		for (const o of others) expect(refsOf(o.text, studied).map(formOf), o.text).not.toContain('5');
	});

	it('asks which verb means “they ask one another”, and only it is Form VI', () => {
		const { answer, others } = choice(selfLesson, 'self-3');
		expect(refsOf(answer.text, studied).map(formOf)).toContain('6');
		for (const o of others) expect(refsOf(o.text, studied).map(formOf), o.text).not.toContain('6');
	});

	it('asks for the word built on the root of “remembers”, and no wrong answer shares it', () => {
		const { answer, others } = choice(selfLesson, 'self-7');
		expect(refsOf(answer.text, studied).map(rootOf)).toContain(rootOf('79:35:2'));
		for (const o of others) {
			for (const ref of refsOf(o.text, studied))
				expect(rootOf(ref), o.text).not.toBe(rootOf('79:35:2'));
		}
	});

	it('matches the four verbs of the two Form VI pairs', () => {
		const match = selfLesson.exercises.find((e) => e.id === 'self-5');
		if (match?.kind !== 'match') throw new Error('no match question');
		expect(match.pairs.map((p) => p.left.text).sort()).toEqual(
			['79:42:1', '78:1:2', '107:3:2', '89:18:2'].map(textAt).sort()
		);
	});

	it('taps the Form VI verb of verse 89:18, the second word', () => {
		const tap = selfLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		expect(tap.words.map((w) => w.text)).toEqual([1, 2, 3, 4, 5].map((n) => textAt(`89:18:${n}`)));
		const tapped = tap.words.findIndex((w) => w.id === tap.answerId) + 1;
		expect(tapped).toBe(2);
		expect(formOf(`89:18:${tapped}`)).toBe('6');
	});
});
