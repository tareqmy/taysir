import { verseAudioUrl } from '../audio';
import { verse as findVerse, verseData } from '../data';
import type { Verse, Word } from '../data/types';
import { rngFor, shuffle, type Rng } from '../random';
import { ar, en } from './exercises';
import type { ChooseExercise, BuildExercise, Exercise, Lesson, TapExercise } from './types';

/**
 * Verse-level practice added to the end of each vocabulary lesson: put a verse in order, say what
 * a verse means, fill a gap in it, or tap a word in it. A verse's English is its word-by-word
 * glosses joined into one line, so these questions add no new English for a teacher to review.
 *
 * Up to three questions per lesson, each about a different verse the lesson showed, chosen with a
 * generator seeded from the lesson id so they stay the same between visits.
 */

type Kind = 'build' | 'which' | 'fill' | 'tap';
const KINDS: Kind[] = ['build', 'which', 'fill', 'tap'];
const MAX_PER_LESSON = 3;

/** A visible gap in an Arabic verse: a short run of tatweel, which joins nothing. */
const GAP = String.fromCodePoint(0x640).repeat(4);

const refOf = (v: Verse) => `${v.surah}:${v.ayah}`;
const englishLine = (v: Verse) => v.words.map((w) => w.gloss).join(' ');
const arabicLine = (v: Verse) => v.words.map((w) => w.text).join(' ');
const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

interface Context {
	lesson: Lesson;
	/** Every verse the lesson shows. */
	shown: Verse[];
	rng: Rng;
}

/** The verses a lesson shows, in order and without repeats. */
function shownVerses(lesson: Lesson): Verse[] {
	const seen = new Set<string>();
	const verses: Verse[] = [];
	for (const block of lesson.intro) {
		if (block.type !== 'verse') continue;
		const found = findVerse(block.surah, block.ayah);
		if (seen.has(refOf(found))) continue;
		seen.add(refOf(found));
		verses.push(found);
	}
	return verses;
}

/** Whether a word is one of the vocabulary cards this lesson teaches. */
const isLessonWord = (lesson: Lesson, word: Word) =>
	word.lexemeId !== undefined && lesson.cardIds.includes(`lx:${word.lexemeId}`);

/** Words whose text and meaning are each unique within the verse, so a question about one is clear. */
function uniqueWords(v: Verse): Word[] {
	return v.words.filter(
		(w) =>
			v.words.filter((o) => o.text === w.text).length === 1 &&
			v.words.filter((o) => sameText(o.gloss, w.gloss)).length === 1
	);
}

/** Lesson words first, then the rest, each group shuffled. */
function preferLessonWords(words: Word[], { lesson, rng }: Context): Word[] {
	const mine = shuffle(
		words.filter((w) => isLessonWord(lesson, w)),
		rng
	);
	const others = shuffle(
		words.filter((w) => !isLessonWord(lesson, w)),
		rng
	);
	return [...mine, ...others];
}

// --- The four kinds of question -------------------------------------------------------------

function build(v: Verse, ctx: Context): BuildExercise | undefined {
	const texts = v.words.map((w) => w.text);
	if (v.words.length < 3 || v.words.length > 7 || new Set(texts).size !== texts.length) {
		return undefined;
	}
	// A couple of words from the lesson's other verses make the word bank a little harder.
	const extras = shuffle(
		ctx.shown.filter((o) => o !== v).flatMap((o) => o.words.map((w) => w.text)),
		ctx.rng
	).filter((text, i, all) => !texts.includes(text) && all.indexOf(text) === i);
	return {
		kind: 'build',
		id: `verse-build:${refOf(v)}`,
		question: 'Put the verse in order.',
		prompt: en(englishLine(v)),
		answer: v.words.map((w, i) => ({ id: `w${i}`, chunk: ar(w.text) })),
		extras: extras.slice(0, 2).map((text, i) => ({ id: `x${i}`, chunk: ar(text) })),
		explanation: `${arabicLine(v)} says “${englishLine(v)}”.`,
		audioUrl: verseAudioUrl(v.surah, v.ayah)
	};
}

function which(v: Verse, ctx: Context): ChooseExercise | undefined {
	if (v.words.length < 2 || v.words.length > 9) return undefined;
	const line = englishLine(v);
	const text = arabicLine(v);
	// Wrong answers come from the same surah first, and from verses of a similar length.
	const others = shuffle(
		verseData.verses.filter(
			(o) =>
				o !== v &&
				o.words.length >= 2 &&
				o.words.length <= 9 &&
				englishLine(o) !== line &&
				arabicLine(o) !== text
		),
		ctx.rng
	).sort(
		(a, b) =>
			Number(b.surah === v.surah) - Number(a.surah === v.surah) ||
			Math.abs(a.words.length - v.words.length) - Math.abs(b.words.length - v.words.length)
	);
	const wrong: Verse[] = [];
	for (const o of others) {
		const clash = wrong.some(
			(w) => englishLine(w) === englishLine(o) || arabicLine(w) === arabicLine(o)
		);
		if (!clash) wrong.push(o);
		if (wrong.length === 3) break;
	}
	if (wrong.length < 3) return undefined;

	const toArabic = ctx.rng() < 0.5;
	const choices = shuffle([v, ...wrong], ctx.rng).map((o) => ({
		id: `v:${refOf(o)}`,
		chunk: toArabic ? en(englishLine(o)) : ar(arabicLine(o))
	}));
	return {
		kind: 'choose',
		id: `verse-which:${refOf(v)}`,
		question: toArabic ? 'What does this verse say?' : 'Which verse says this?',
		prompt: toArabic ? ar(text) : en(line),
		choices,
		answerId: `v:${refOf(v)}`,
		explanation: `${text} says “${line}”.`,
		audioUrl: verseAudioUrl(v.surah, v.ayah)
	};
}

function fill(v: Verse, ctx: Context): ChooseExercise | undefined {
	if (v.words.length < 3 || v.words.length > 14) return undefined;
	const inVerse = new Set(v.words.map((w) => w.text));
	// Wrong answers: other words from the lesson's verses, then the same surah, then anywhere.
	const wordsOf = (verses: Verse[]) =>
		shuffle(
			verses.flatMap((o) => o.words),
			ctx.rng
		);
	const pool = [
		...wordsOf(ctx.shown),
		...wordsOf(verseData.verses.filter((o) => o.surah === v.surah)),
		...wordsOf(verseData.verses)
	];

	for (const target of preferLessonWords(uniqueWords(v), ctx)) {
		const wrong: Word[] = [];
		for (const w of pool) {
			if (inVerse.has(w.text) || sameText(w.gloss, target.gloss)) continue;
			if (wrong.some((o) => o.text === w.text || sameText(o.gloss, w.gloss))) continue;
			wrong.push(w);
			if (wrong.length === 3) break;
		}
		if (wrong.length < 3) continue;
		const gapped = v.words.map((w) => (w === target ? GAP : w.text)).join(' ');
		return {
			kind: 'choose',
			id: `verse-fill:${refOf(v)}`,
			question: 'Which word fills the gap?',
			prompt: ar(gapped),
			hint: englishLine(v),
			choices: shuffle([target, ...wrong], ctx.rng).map((w) => ({
				id: w === target ? 'answer' : `w:${w.text}`,
				chunk: ar(w.text)
			})),
			answerId: 'answer',
			explanation: `${target.text} means “${target.gloss}”: ${arabicLine(v)}.`
		};
	}
	return undefined;
}

function tap(v: Verse, ctx: Context): TapExercise | undefined {
	if (v.words.length < 3 || v.words.length > 14) return undefined;
	const [target] = preferLessonWords(uniqueWords(v), ctx);
	if (!target) return undefined;
	return {
		kind: 'tap',
		id: `verse-tap:${refOf(v)}`,
		question: `Tap the word that means “${target.gloss}”.`,
		words: v.words.map((w, i) => ({ id: `t${i}`, text: w.text })),
		answerId: `t${v.words.indexOf(target)}`,
		explanation: `${target.text} means “${target.gloss}”: ${arabicLine(v)}.`,
		audioUrl: verseAudioUrl(v.surah, v.ayah)
	};
}

const makers: Record<Kind, (v: Verse, ctx: Context) => Exercise | undefined> = {
	build,
	which,
	fill,
	tap
};

/** The verse-level questions for a lesson: none for lessons that show no verses. */
export function verseExercises(lesson: Lesson): Exercise[] {
	const shown = shownVerses(lesson);
	const ctx: Context = { lesson, shown, rng: rngFor(`verses:${lesson.id}`) };
	const used = new Set<string>();
	const out: Exercise[] = [];
	for (const kind of shuffle(KINDS, ctx.rng)) {
		if (out.length >= MAX_PER_LESSON) break;
		// Different verses where possible; a verse is used twice only if nothing else works.
		const order = [...shuffle(shown, ctx.rng)].sort(
			(a, b) => Number(used.has(refOf(a))) - Number(used.has(refOf(b)))
		);
		for (const v of order) {
			const exercise = makers[kind](v, ctx);
			if (!exercise) continue;
			out.push(exercise);
			used.add(refOf(v));
			break;
		}
	}
	return out;
}

/** A lesson with its verse-level questions added after the rest of its exercises. */
export function withVerseExercises(lesson: Lesson): Lesson {
	return lesson.kind === 'vocabulary'
		? { ...lesson, exercises: [...lesson.exercises, ...verseExercises(lesson)] }
		: lesson;
}
