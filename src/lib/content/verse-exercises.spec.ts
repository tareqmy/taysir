import { describe, expect, it } from 'vitest';
import { verse } from '../data';
import { lessons } from './course';
import { verseExercises } from './verse-exercises';
import type { Exercise, Lesson } from './types';

const vocabulary = lessons.filter((l) => l.kind === 'vocabulary');
const verseOnes = (lesson: Lesson) => lesson.exercises.filter((e) => e.id.startsWith('verse-'));
const all = vocabulary.flatMap((lesson) =>
	verseOnes(lesson).map((exercise) => ({ lesson, exercise }))
);
const ofKind = (kind: string) =>
	all.filter(({ exercise }) => exercise.id.startsWith(`verse-${kind}:`));

/** `verse-fill:105:1` → the verse it is about. */
function verseOf(exercise: Exercise) {
	const [, surah, ayah] = exercise.id.split(':').map((part, i) => (i === 0 ? part : Number(part)));
	return verse(surah as number, ayah as number);
}

const shownBy = (lesson: Lesson) =>
	new Set(lesson.intro.flatMap((b) => (b.type === 'verse' ? [`${b.surah}:${b.ayah}`] : [])));

describe('verse-level exercises', () => {
	it('are added to vocabulary lessons only, and at most three each', () => {
		for (const lesson of lessons) {
			const count = verseOnes(lesson).length;
			if (lesson.kind === 'vocabulary') expect(count, lesson.id).toBeLessThanOrEqual(3);
			else expect(count, lesson.id).toBe(0);
		}
		const withNone = vocabulary.filter((l) => verseOnes(l).length === 0).map((l) => l.id);
		// Only lessons about one very long verse have nothing to ask.
		expect(withNone.length).toBeLessThan(vocabulary.length / 10);
	});

	it('come after the word exercises', () => {
		for (const lesson of vocabulary) {
			const firstVerse = lesson.exercises.findIndex((e) => e.id.startsWith('verse-'));
			if (firstVerse === -1) continue;
			expect(lesson.exercises.slice(firstVerse).every((e) => e.id.startsWith('verse-'))).toBe(true);
		}
	});

	it('are about verses the lesson showed, and are the same every time', () => {
		for (const lesson of vocabulary) {
			const shown = shownBy(lesson);
			for (const exercise of verseOnes(lesson)) {
				const v = verseOf(exercise);
				expect(shown.has(`${v.surah}:${v.ayah}`), `${lesson.id} ${exercise.id}`).toBe(true);
			}
			expect(verseExercises(lesson)).toEqual(verseExercises(lesson));
		}
	});

	it('use all five kinds of question across the course', () => {
		for (const kind of ['build', 'which', 'fill', 'tap', 'listen'])
			expect(ofKind(kind).length).toBeGreaterThan(20);
	});
});

describe('listening to a verse', () => {
	it('is asked in every lesson that has a verse short enough to offer four choices', () => {
		const withListen = vocabulary.filter((l) =>
			verseOnes(l).some((e) => e.id.startsWith('verse-listen:'))
		);
		// Only lessons about one very long verse can lack one.
		expect(vocabulary.length - withListen.length).toBeLessThan(vocabulary.length / 10);
		for (const lesson of withListen) {
			expect(verseOnes(lesson).filter((e) => e.id.startsWith('verse-listen:'))).toHaveLength(1);
		}
	});

	it('plays the verse, shows no Arabic, and offers four different meanings', () => {
		for (const { lesson, exercise } of ofKind('listen')) {
			if (exercise.kind !== 'choose') throw new Error('not a choose exercise');
			expect(exercise.listening, `${lesson.id} ${exercise.id}`).toBe(true);
			expect(exercise.prompt).toBeUndefined();
			expect(exercise.audioUrl).toMatch(/^https:\/\/everyayah\.com\/data\/.+\/\d{6}\.mp3$/);
			expect(exercise.choices).toHaveLength(4);
			expect(exercise.choices.every((c) => c.chunk.lang === 'en')).toBe(true);
			expect(new Set(exercise.choices.map((c) => c.chunk.text)).size).toBe(4);
			const v = verseOf(exercise);
			const right = exercise.choices.find((c) => c.id === exercise.answerId)!;
			expect(right.chunk.text).toBe(v.words.map((w) => w.gloss).join(' '));
		}
	});
});

describe('building a verse', () => {
	it('uses short verses whose words are all different', () => {
		for (const { lesson, exercise } of ofKind('build')) {
			if (exercise.kind !== 'build') throw new Error('not a build exercise');
			const texts = exercise.answer.map((t) => t.chunk.text);
			expect(texts.length, `${lesson.id} ${exercise.id}`).toBeGreaterThanOrEqual(3);
			expect(texts.length).toBeLessThanOrEqual(7);
			expect(new Set(texts).size).toBe(texts.length);
			expect(texts.join(' ')).toBe(
				verseOf(exercise)
					.words.map((w) => w.text)
					.join(' ')
			);
			expect(exercise.extras.length).toBeLessThanOrEqual(2);
		}
	});
});

describe('saying what a verse means', () => {
	it('offers four different verses, one of them right', () => {
		for (const { lesson, exercise } of ofKind('which')) {
			if (exercise.kind !== 'choose') throw new Error('not a choose exercise');
			const v = verseOf(exercise);
			expect(exercise.choices, `${lesson.id} ${exercise.id}`).toHaveLength(4);
			const right = exercise.choices.find((c) => c.id === exercise.answerId)!;
			const text =
				right.chunk.lang === 'en'
					? v.words.map((w) => w.gloss).join(' ')
					: v.words.map((w) => w.text).join(' ');
			expect(right.chunk.text).toBe(text);
			expect(new Set(exercise.choices.map((c) => c.chunk.text)).size).toBe(4);
		}
	});
});

describe('filling a gap', () => {
	it('blanks one word of the verse and offers it among four different words', () => {
		for (const { lesson, exercise } of ofKind('fill')) {
			if (exercise.kind !== 'choose') throw new Error('not a choose exercise');
			const v = verseOf(exercise);
			const gap = exercise
				.prompt!.text.split(' ')
				.filter((w) => !v.words.some((x) => x.text === w));
			expect(gap, `${lesson.id} ${exercise.id}`).toHaveLength(1);
			const answer = exercise.choices.find((c) => c.id === exercise.answerId)!.chunk.text;
			expect(v.words.some((w) => w.text === answer)).toBe(true);
			expect(exercise.prompt!.text.split(' ').includes(answer)).toBe(false);
			expect(exercise.hint).toBe(v.words.map((w) => w.gloss).join(' '));
			expect(new Set(exercise.choices.map((c) => c.chunk.text)).size).toBe(4);
			// No wrong answer may be a word the verse already has.
			for (const choice of exercise.choices) {
				if (choice.id !== exercise.answerId) {
					expect(v.words.some((w) => w.text === choice.chunk.text)).toBe(false);
				}
			}
		}
	});
});

describe('tapping a word', () => {
	it('asks for a word whose meaning is not shared by another word of the verse', () => {
		for (const { lesson, exercise } of ofKind('tap')) {
			if (exercise.kind !== 'tap') throw new Error('not a tap exercise');
			const v = verseOf(exercise);
			expect(
				exercise.words.map((w) => w.text),
				`${lesson.id} ${exercise.id}`
			).toEqual(v.words.map((w) => w.text));
			const target = v.words[Number(exercise.answerId.slice(1))];
			expect(
				v.words.filter((w) => w.gloss.toLowerCase() === target.gloss.toLowerCase())
			).toHaveLength(1);
			expect(v.words.filter((w) => w.text === target.text)).toHaveLength(1);
			expect(exercise.question).toContain(target.gloss);
		}
	});
});
