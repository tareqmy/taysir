import { describe, expect, it } from 'vitest';
import { prefixLesson } from './prefix';
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
 * What the lesson on Forms VII, VIII and X says, checked against the corpus's tags: each pair it
 * gives is a plain verb and a Form VII, VIII or X verb of the same root, and each question's right
 * and wrong answers are in the forms they are said to be.
 */

/** The plain verb, the derived verb, and the derived verb's form, for each pair the lesson shows. */
const pairs: [string, string, string][] = [
	['80:26:2', '84:1:3', '7'], // split, be split
	['83:3:2', '83:2:3', '8'], // measure for them, take measure
	['79:40:6', '96:15:4', '8'], // restrain, restrain oneself
	['78:38:2', '81:28:5', '10'] // stand, go straight
];

/** Verbs the lesson names that have no plain partner shown, and their forms. */
const singles: [string, string][] = [
	['82:1:3', '7'],
	['83:31:2', '7'],
	['1:5:4', '10'],
	['110:3:4', '10'],
	['80:5:3', '10'],
	['83:2:6', '10']
];

const strings = stringsOf(prefixLesson).join('\n');

describe('the lesson on Forms VII, VIII and X', () => {
	it.each(pairs)('%s and %s: the same root, the plain verb and Form %s', (plain, derived, form) => {
		expect(kindOf(plain)).toBe('verb');
		expect(formOf(plain)).toBe('1');
		expect(formOf(derived)).toBe(form);
		expect(rootOf(derived)).toBe(rootOf(plain));
	});

	it.each(singles)('%s is Form %s', (ref, form) => {
		expect(kindOf(ref)).toBe('verb');
		expect(formOf(ref)).toBe(form);
	});

	it.each([
		...pairs.flatMap(([plain, derived]) => [plain, derived]),
		...singles.map(([ref]) => ref)
	])('names %s in the lesson', (ref) => {
		expect(strings).toContain(textAt(ref));
	});

	it('asks which verb is Form VII, VIII and X, and no wrong answer is that form', () => {
		for (const [id, form] of [
			['prefix-1', '7'],
			['prefix-3', '8'],
			['prefix-5', '10']
		]) {
			const { answer, others } = choice(prefixLesson, id);
			expect(refsOf(answer.text, studied).map(formOf), id).toContain(form);
			for (const o of others)
				expect(refsOf(o.text, studied).map(formOf), `${id}: ${o.text}`).not.toContain(form);
		}
	});

	it('asks for the word built on the root of “he goes straight”, and no wrong answer shares it', () => {
		const { answer, others } = choice(prefixLesson, 'prefix-7');
		expect(refsOf(answer.text, studied).map(rootOf)).toContain(rootOf('81:28:5'));
		for (const o of others) {
			for (const ref of refsOf(o.text, studied))
				expect(rootOf(ref), o.text).not.toBe(rootOf('81:28:5'));
		}
	});

	it('matches only Form X verbs', () => {
		const match = prefixLesson.exercises.find((e) => e.id === 'prefix-6');
		if (match?.kind !== 'match') throw new Error('no match question');
		const shown = ['80:5:3', '1:5:4', '110:3:4', '81:28:5'];
		expect(match.pairs.map((p) => p.left.text).sort()).toEqual(shown.map(textAt).sort());
		for (const ref of shown) expect(formOf(ref), ref).toBe('10');
	});

	it('taps the Form VIII verb of verse 83:2, the third word', () => {
		const tap = prefixLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		expect(tap.words.map((w) => w.text)).toEqual(
			[1, 2, 3, 4, 5, 6].map((n) => textAt(`83:2:${n}`))
		);
		const tapped = tap.words.findIndex((w) => w.id === tap.answerId) + 1;
		expect(tapped).toBe(3);
		expect(formOf(`83:2:${tapped}`)).toBe('8');
	});
});
