import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { verseData } from '../data';
import { units } from './course';
import { kindsLesson } from './grammar-kinds';
import type { Block, Chunk, ChooseExercise, Exercise, TapExercise } from './types';

/**
 * The lesson on the three kinds of word says which words are nouns, verbs and small words. Those
 * claims are checked here against the corpus's own tags, so a wrong label cannot reach a learner,
 * and its Arabic is checked to be real corpus words from Al-Fatiha, the only surah met so far.
 */

type Row = { pos: string; features: string[] };

/** The corpus rows (one per piece of a word) by location `surah:ayah:word`. */
const rows = new Map<string, Row[]>();
for (const line of readFileSync(
	new URL('../../../data/source/quran-morphology.txt', import.meta.url),
	'utf8'
).split('\n')) {
	const [location, , pos, features] = line.split('\t');
	if (!features) continue;
	const ref = location.split(':').slice(0, 3).join(':');
	rows.set(ref, [...(rows.get(ref) ?? []), { pos, features: features.split('|') }]);
}

const piecesOf = (ref: string) => {
	const found = rows.get(ref);
	if (!found) throw new Error(`No corpus word ${ref}`);
	return found;
};

/** What the word itself is: its stem, not a prefix or a joined ending. */
const kindOf = (ref: string): 'noun' | 'verb' | 'small word' => {
	const stems = piecesOf(ref).filter(
		(p) => !p.features.includes('PREF') && !p.features.includes('SUFF')
	);
	expect(stems, `${ref} has one stem`).toHaveLength(1);
	return { N: 'noun', V: 'verb', P: 'small word' }[stems[0].pos] as 'noun' | 'verb' | 'small word';
};

const hasArticle = (ref: string) => piecesOf(ref).some((p) => p.features.includes('DET'));

/** Every place in Al-Fatiha a word's text appears; the lesson only uses words that appear once. */
const fatiha = verseData.verses
	.filter((v) => v.surah === 1)
	.flatMap((v) => v.words.map((w) => ({ ref: `1:${v.ayah}:${w.n}`, text: w.text })));

function refOf(text: string): string {
	const found = fatiha.filter((w) => w.text === text);
	expect(found, `${text} is one word of Al-Fatiha`).toHaveLength(1);
	return found[0].ref;
}

const named = new Set(['ال']);
const arabicIn = (text: string) =>
	(text.match(/[\p{scx=Arabic}\p{M}]+/gu) ?? []).filter((word) => !named.has(word));

function textOf(block: Block): string[] {
	switch (block.type) {
		case 'text':
		case 'rule':
			return [block.title ?? '', block.body];
		case 'phrase':
			return [block.translation, block.note ?? ''];
		case 'verse':
			return [block.title ?? '', block.note ?? ''];
		default:
			return [];
	}
}

const chunksOf = (exercise: Exercise): Chunk[] => {
	switch (exercise.kind) {
		case 'choose':
			return [
				...(exercise.prompt ? [exercise.prompt] : []),
				...exercise.choices.map((c) => c.chunk)
			];
		case 'tap':
			return exercise.words.map((w) => ({ text: w.text, lang: 'ar' as const }));
		default:
			return [];
	}
};

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
		const known = new Set(fatiha.map((w) => w.text));
		const strings = [
			kindsLesson.title,
			kindsLesson.subtitle,
			...kindsLesson.intro.flatMap(textOf),
			...kindsLesson.exercises.flatMap((e) => [
				e.question,
				e.explanation ?? '',
				...chunksOf(e).map((c) => c.text)
			])
		];
		const unknown = strings.flatMap(arabicIn).filter((word) => !known.has(word));
		expect(unknown).toEqual([]);
		expect(strings.flatMap(arabicIn).length).toBeGreaterThan(20);
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
