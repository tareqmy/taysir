import { readFileSync } from 'node:fs';
import { verseData } from '../../data';
import type { Block, Chunk, Exercise, Lesson } from '../types';

/**
 * What the lesson tests need from the corpus: the tags it puts on each word, to check what a lesson
 * says about a word, and the verse data the app ships, to check a lesson's Arabic is real. Only the
 * tests import this; it reads a file, so it must never reach the app.
 */

export type Piece = { pos: string; features: string[] };

/** What the learner has studied before the later-surahs grammar unit: Al-Fatiha and Juz Amma. */
export const studiedBeforeLaterGrammar = (surah: number) => surah === 1 || surah >= 78;

/** The corpus rows (one per piece of a word) by location `surah:ayah:word`. */
const rows = new Map<string, Piece[]>();
for (const line of readFileSync(
	new URL('../../../../data/source/quran-morphology.txt', import.meta.url),
	'utf8'
).split('\n')) {
	const [location, , pos, features] = line.split('\t');
	if (!features) continue;
	const ref = location.split(':').slice(0, 3).join(':');
	rows.set(ref, [...(rows.get(ref) ?? []), { pos, features: features.split('|') }]);
}

/** `surah:ayah:word`, the corpus's own address of a word. */
export const at = (surah: number, ayah: number, n: number) => `${surah}:${ayah}:${n}`;

export function pieces(ref: string): Piece[] {
	const found = rows.get(ref);
	if (!found) throw new Error(`No corpus word ${ref}`);
	return found;
}

/** What the word itself is, apart from a prefix or a joined ending: its one stem. */
export function stem(ref: string): Piece {
	const stems = pieces(ref).filter(
		(p) => !p.features.includes('PREF') && !p.features.includes('SUFF')
	);
	if (stems.length !== 1) throw new Error(`${ref} has ${stems.length} stems`);
	return stems[0];
}

export type Kind = 'noun' | 'verb' | 'small word';
export const kindOf = (ref: string): Kind =>
	(({ N: 'noun', V: 'verb', P: 'small word' }) as const)[stem(ref).pos as 'N' | 'V' | 'P'];

/** Whether the word's stem carries a tag, such as `PERF`, `3FS`, `COND`, `ADJ` or `GEN`. */
export const has = (ref: string, tag: string) => stem(ref).features.includes(tag);

/** Whether any piece of the word, a prefix too, carries a tag, such as `DET` for ال. */
export const anyPiece = (ref: string, tag: string) =>
	pieces(ref).some((p) => p.features.includes(tag));

export const hasArticle = (ref: string) => anyPiece(ref, 'DET');

// --- The words the app ships --------------------------------------------------------------

type Located = { ref: string; text: string };

const allWords: Located[] = verseData.verses.flatMap((v) =>
	v.words.map((w) => ({ ref: at(v.surah, v.ayah, w.n), text: w.text }))
);

const textByRef = new Map(allWords.map((w) => [w.ref, w.text]));
const glossByRef = new Map(
	verseData.verses.flatMap((v) => v.words.map((w) => [at(v.surah, v.ayah, w.n), w.gloss] as const))
);

/** The English the app shows under the word at `surah:ayah:word`. */
export const glossAt = (ref: string) => glossByRef.get(ref) ?? '';

/** The Arabic text of the word at `surah:ayah:word`. */
export function textAt(ref: string): string {
	const found = textByRef.get(ref);
	if (found === undefined) throw new Error(`The app has no word ${ref}`);
	return found;
}

/** Every place a word's exact text appears, within the surahs a lesson may use. */
export const refsOf = (text: string, studied: (surah: number) => boolean) =>
	allWords.filter((w) => w.text === text && studied(Number(w.ref.split(':')[0]))).map((w) => w.ref);

/** Where two words stand side by side in a verse, in that order, within the studied surahs. */
export function neighbours(first: string, second: string, studied: (surah: number) => boolean) {
	return refsOf(first, studied)
		.map((a) => {
			const [surah, ayah, n] = a.split(':').map(Number);
			return [a, at(surah, ayah, n + 1)] as const;
		})
		.filter(([, b]) => textByRef.get(b) === second);
}

/** Every pair of Arabic words written side by side, with one space between, in a piece of text. */
export const sideBySide = (text: string) =>
	[
		...text.matchAll(/([\p{scx=Arabic}\p{M}]+) (?=[\p{scx=Arabic}\p{M}])([\p{scx=Arabic}\p{M}]+)/gu)
	].map((m) => [m[1], m[2]] as const);

/** The one place a word's text appears, or a failure: a lesson that points at it can then be checked. */
export function refOf(text: string, studied: (surah: number) => boolean): string {
	const found = refsOf(text, studied);
	if (found.length !== 1)
		throw new Error(`${text} is in ${found.length} places: ${found.join(', ')}`);
	return found[0];
}

// --- The Arabic in a lesson -----------------------------------------------------------------

/**
 * Every Arabic word in a piece of text. The vowel marks are not Arabic letters, so they are counted
 * in as part of the word, and `scx` (script extensions) covers the tatweel that stretches a letter.
 * The article, which lessons write on its own when they name it, is not a corpus word.
 */
export const arabicIn = (text: string) =>
	(text.match(/[\p{scx=Arabic}\p{M}]+/gu) ?? []).filter((word) => word !== 'ال');

/** The words a learner reads in a block, apart from the verse text the block shows. */
export function textOf(block: Block): string[] {
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

export const chunksOf = (exercise: Exercise): Chunk[] => {
	switch (exercise.kind) {
		case 'choose':
			return [
				...(exercise.prompt ? [exercise.prompt] : []),
				...exercise.choices.map((c) => c.chunk)
			];
		case 'match':
			return exercise.pairs.flatMap((p) => [p.left, p.right]);
		case 'build':
			return [
				exercise.prompt,
				...exercise.answer.map((t) => t.chunk),
				...exercise.extras.map((t) => t.chunk)
			];
		case 'tap':
			return exercise.words.map((w) => ({ text: w.text, lang: 'ar' as const }));
	}
};

/** Every string of English and Arabic a learner reads in a lesson. */
export const stringsOf = (lesson: Lesson): string[] => [
	lesson.title,
	lesson.subtitle,
	...lesson.intro.flatMap(textOf),
	...lesson.exercises.flatMap((e) => [
		e.question,
		e.explanation ?? '',
		...chunksOf(e).map((c) => c.text)
	])
];

/** Every Arabic word of a lesson that is not a word of the studied surahs, so typed by hand. */
export function handTyped(lesson: Lesson, studied: (surah: number) => boolean): string[] {
	const known = new Set(
		allWords.filter((w) => studied(Number(w.ref.split(':')[0]))).map((w) => w.text)
	);
	return stringsOf(lesson)
		.flatMap(arabicIn)
		.filter((word) => !known.has(word));
}

/** The exercise with this id, which must be a multiple-choice question. */
export function choice(lesson: Lesson, id: string) {
	const found = lesson.exercises.find((e) => e.id === id);
	if (found?.kind !== 'choose') throw new Error(`${id} is not a choice question`);
	const answer = found.choices.find((c) => c.id === found.answerId)!.chunk;
	const others = found.choices.filter((c) => c.id !== found.answerId).map((c) => c.chunk);
	return { exercise: found, answer, others };
}

/**
 * Every `Arabic word (“meaning”)` and `Arabic word means “meaning”` a piece of lesson text gives, as
 * the word and its meaning.
 */
export const glossClaims = (text: string) =>
	[...text.matchAll(/([\p{scx=Arabic}\p{M}]+)(?: \(| means | is )“([^”]+)”/gu)].map(
		(m) => [m[1], m[2]] as const
	);

const PRONOUNS = new Set(['i', 'we', 'you', 'he', 'she', 'it', 'they', 'him', 'her', 'them', 'us']);

/**
 * Lower case, letters and spaces only, without pronouns, so “Will see it” and “will see” compare
 * equal, and so does “and they did” with the app's “and did”: a verb's ending already says who.
 */
export const plainEnglish = (text: string) =>
	text
		.toLowerCase()
		.replace(/[^a-z ]/g, '')
		.split(/\s+/)
		.filter((word) => word && !PRONOUNS.has(word))
		.join(' ');
