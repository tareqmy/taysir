import { describe, expect, it } from 'vitest';
import { verseData } from '../data';
import { units } from './course';
import { kindsLesson } from './grammar-kinds';
import {
	arabicIn,
	chunksOf,
	handTyped,
	hasArticle,
	kindOf,
	pieces as piecesOf,
	refOf as refOfIn,
	stringsOf
} from './testing/corpus';
import type { ChooseExercise, TapExercise } from './types';

/**
 * The lesson on the three kinds of word says which words are nouns, verbs and small words. Those
 * claims are checked here against the corpus's own tags, so a wrong label cannot reach a learner,
 * and its Arabic is checked to be real corpus words from Al-Fatiha, the only surah met so far.
 */

/** Al-Fatiha: the only surah the learner has met before this lesson. */
const studied = (surah: number) => surah === 1;
const refOf = (text: string) => refOfIn(text, studied);

const choose = (id: string) => {
	const found = kindsLesson.exercises.find((e) => e.id === id);
	if (found?.kind !== 'choose') throw new Error(`${id} is not a choice question`);
	return found as ChooseExercise;
};
const correct = (e: ChooseExercise) => e.choices.find((c) => c.id === e.answerId)!.chunk;
const wrong = (e: ChooseExercise) =>
	e.choices.filter((c) => c.id !== e.answerId).map((c) => c.chunk);

describe('the lesson on the three kinds of word', () => {
	it('is the first grammar lesson, straight after the roots, before “the” and iḍāfa', () => {
		const ids = units.map((u) => u.id);
		expect(ids.indexOf('grammar')).toBe(ids.indexOf('roots') + 1);
		const grammar = units.find((u) => u.id === 'grammar')!;
		expect(grammar.lessons.map((l) => l.id)).toEqual([
			'grammar-kinds',
			'grammar-definite',
			'grammar-idafa'
		]);
		expect(kindsLesson.unitId).toBe('grammar');
		expect(kindsLesson.kind).toBe('grammar');
		expect(kindsLesson.cardIds).toEqual([]);
	});

	it('teaches and then asks enough', () => {
		expect(kindsLesson.intro.filter((b) => b.type === 'rule').length).toBeGreaterThanOrEqual(2);
		expect(kindsLesson.intro.some((b) => b.type === 'phrase')).toBe(true);
		expect(kindsLesson.exercises).toHaveLength(8);
	});

	it('names the three kinds once each in Arabic, and the Words page’s name for the third', () => {
		const first = kindsLesson.intro.find((b) => b.type === 'rule');
		const body = first?.type === 'rule' ? first.body : '';
		for (const term of ['(ism)', '(fiʿl)', '(ḥarf, also called a particle)']) {
			expect(body).toContain(term);
		}
	});

	it('only shows verses from Al-Fatiha', () => {
		for (const block of kindsLesson.intro) {
			if (block.type === 'phrase' || block.type === 'verse') expect(block.surah).toBe(1);
		}
	});

	it('uses only Arabic words from Al-Fatiha, so none is typed by hand', () => {
		expect(handTyped(kindsLesson, studied)).toEqual([]);
		expect(stringsOf(kindsLesson).flatMap(arabicIn).length).toBeGreaterThan(20);
	});

	it('calls a word what the corpus calls it', () => {
		// The words the questions name as a noun, a verb or a small word.
		const nouns = ['1:6:2', '1:6:3', '1:2:3', '1:4:2', '1:4:3'];
		const verbs = ['1:5:2', '1:6:1', '1:7:3'];
		for (const ref of nouns) expect(kindOf(ref), ref).toBe('noun');
		for (const ref of verbs) expect(kindOf(ref), ref).toBe('verb');
		// Small words joined to the front of a word: the first piece, and for “and not” both.
		for (const ref of ['1:2:2', '1:1:1', '1:5:3', '1:7:8']) {
			expect(piecesOf(ref)[0].pos, `${ref} starts with a small word`).toBe('P');
		}
		expect(piecesOf('1:7:8').map((p) => p.pos)).toEqual(['P', 'P']);
	});

	it('asks about each word the kind the corpus gives it', () => {
		const label = { noun: 'A noun', verb: 'A verb', 'small word': 'A small word' };
		for (const id of ['kinds-1', 'kinds-2']) {
			const e = choose(id);
			expect(correct(e).text, id).toBe(label[kindOf(refOf(e.prompt!.text))]);
		}
		const four = choose('kinds-4');
		expect(correct(four).text).toBe('A noun');
		expect(kindOf('1:6:3')).toBe('noun');

		// “Which is a verb?”: one verb and two nouns.
		const five = choose('kinds-5');
		expect(kindOf(refOf(correct(five).text))).toBe('verb');
		for (const c of wrong(five)) expect(kindOf(refOf(c.text))).toBe('noun');

		// “Which must be a noun, because it has ال?”: the noun has it, the verbs do not.
		const six = choose('kinds-6');
		expect(kindOf(refOf(correct(six).text))).toBe('noun');
		expect(hasArticle(refOf(correct(six).text))).toBe(true);
		for (const c of wrong(six)) {
			expect(kindOf(refOf(c.text))).toBe('verb');
			expect(hasArticle(refOf(c.text))).toBe(false);
		}
	});

	it('has ال on the nouns it says have it, and on no verb', () => {
		for (const ref of ['1:6:2', '1:6:3', '1:4:3']) expect(hasArticle(ref), ref).toBe(true);
		for (const ref of ['1:5:2', '1:6:1', '1:7:3']) expect(hasArticle(ref), ref).toBe(false);
	});

	it('taps the one verb of verse 6', () => {
		const tap = kindsLesson.exercises.find((e) => e.kind === 'tap') as TapExercise;
		const kinds = tap.words.map((word, i) => kindOf(`1:6:${i + 1}`));
		expect(kinds.filter((k) => k === 'verb')).toHaveLength(1);
		expect(tap.words.map((w) => w.text)).toEqual(
			verseData.verses.find((v) => v.surah === 1 && v.ayah === 6)!.words.map((w) => w.text)
		);
		expect(kinds[tap.words.findIndex((w) => w.id === tap.answerId)]).toBe('verb');
	});

	it('keeps “you”, “who” and “this” out of its questions', () => {
		const asked = kindsLesson.exercises.flatMap((e) =>
			chunksOf(e).flatMap((c) => (c.lang === 'ar' ? arabicIn(c.text) : []))
		);
		for (const text of asked) {
			const pieces = piecesOf(refOf(text));
			expect(
				pieces.some((p) => p.features.includes('REL') || p.features.includes('DEM')),
				text
			).toBe(false);
			// A word that is only a pronoun, like “You alone”, is a noun the lesson does not ask about.
			expect(
				pieces.every((p) => p.features.includes('PRON') && !p.features.includes('SUFF')),
				text
			).toBe(false);
		}
	});
});
