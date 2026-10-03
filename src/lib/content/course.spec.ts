import { describe, expect, it } from 'vitest';
import { fatiha, lexemeById, lexicon, phraseWords } from '../data';
import { seeded } from '../random';
import { letterById, letters } from './alphabet';
import { parseCardId } from './cards';
import { lessons, readerSkippedLessonIds, units } from './course';
import { reviewExercise } from './exercises';
import type { Exercise } from './types';

/** Fails with a readable message if an exercise could not be answered or is ambiguous. */
function problemsWith(exercise: Exercise): string[] {
	const problems: string[] = [];
	if (exercise.kind === 'choose') {
		const ids = exercise.choices.map((c) => c.id);
		const texts = exercise.choices.map((c) => c.chunk.text);
		if (!ids.includes(exercise.answerId)) problems.push('answer is not among the choices');
		if (new Set(ids).size !== ids.length) problems.push('duplicate choice ids');
		if (new Set(texts).size !== texts.length) problems.push('duplicate choice text');
		if (exercise.choices.length < 2) problems.push('fewer than two choices');
	} else if (exercise.kind === 'match') {
		const left = exercise.pairs.map((p) => p.left.text);
		const right = exercise.pairs.map((p) => p.right.text);
		if (exercise.pairs.length < 2) problems.push('fewer than two pairs');
		if (new Set(left).size !== left.length) problems.push('duplicate left side');
		if (new Set(right).size !== right.length) problems.push('duplicate right side');
	} else {
		const answer = exercise.answer.map((t) => t.chunk.text);
		const clash = exercise.extras.some((t) => answer.includes(t.chunk.text));
		if (answer.length < 2) problems.push('fewer than two tokens');
		if (clash) problems.push('an extra token duplicates an answer token');
	}
	return problems;
}

describe('Al-Fatiha data', () => {
	it('has seven verses with every word glossed', () => {
		expect(fatiha.verses.map((v) => v.words.length)).toEqual([4, 4, 2, 3, 4, 3, 9]);
		for (const v of fatiha.verses) for (const w of v.words) expect(w.gloss).not.toBe('');
	});

	it('links words to vocabulary cards', () => {
		const linked = fatiha.verses.flatMap((v) => v.words).filter((w) => w.lexemeId);
		expect(linked.length).toBeGreaterThan(15);
		for (const w of linked) expect(() => lexemeById(w.lexemeId!)).not.toThrow();
	});

	it('records real corpus frequencies', () => {
		expect(lexemeById('allah').count).toBeGreaterThan(2000);
		expect(lexemeById('rabb').count).toBeGreaterThan(900);
		expect(lexicon.lexemes.every((l) => l.gloss.length > 0 && l.rank > 0)).toBe(true);
	});
});

describe('alphabet', () => {
	it('has 28 distinct letters', () => {
		expect(letters).toHaveLength(28);
		expect(new Set(letters.map((l) => l.glyph)).size).toBe(28);
	});

	it('teaches every letter exactly once', () => {
		const taught = lessons
			.filter((l) => l.kind === 'letters')
			.flatMap((l) => l.cardIds.map((id) => parseCardId(id).id));
		expect([...taught].sort()).toEqual(letters.map((l) => l.id).sort());
	});
});

describe('course', () => {
	it('has unique lesson ids and at least one exercise per lesson', () => {
		expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
		for (const lesson of lessons) expect(lesson.exercises.length).toBeGreaterThan(0);
	});

	it('only skips the alphabet for readers', () => {
		expect(readerSkippedLessonIds).toEqual(units[0].lessons.map((l) => l.id));
	});

	it('builds well-formed exercises for every lesson', () => {
		for (const lesson of lessons) {
			const ids = lesson.exercises.map((e) => e.id);
			expect(new Set(ids).size, `${lesson.id} exercise ids`).toBe(ids.length);
			for (const exercise of lesson.exercises) {
				expect(problemsWith(exercise), `${lesson.id} / ${exercise.id}`).toEqual([]);
			}
		}
	});

	it('only references cards, letters, words and verses that exist', () => {
		for (const lesson of lessons) {
			for (const cardId of lesson.cardIds) {
				const { type, id } = parseCardId(cardId);
				expect(() => (type === 'letter' ? letterById(id) : lexemeById(id))).not.toThrow();
			}
			for (const exercise of lesson.exercises) {
				if (exercise.cardId) expect(() => parseCardId(exercise.cardId!)).not.toThrow();
			}
			for (const block of lesson.intro) {
				if (block.type === 'letters') block.ids.forEach(letterById);
				if (block.type === 'lexemes' || block.type === 'root') block.ids.forEach(lexemeById);
				if (block.type === 'phrase') phraseWords(block.ayah, block.from, block.to);
			}
		}
	});

	it('teaches each root lesson’s words from the right root', () => {
		for (const lesson of lessons.filter((l) => l.kind === 'roots')) {
			const root = lesson.intro.find((b) => b.type === 'root');
			expect(root).toBeDefined();
			if (root?.type !== 'root') continue;
			for (const id of root.ids) expect(lexemeById(id).root).toBe(root.root);
		}
	});
});

describe('review exercises', () => {
	it('can be built for every card in the course, in both directions', () => {
		const cardIds = new Set(lessons.flatMap((l) => l.cardIds));
		for (const cardId of cardIds) {
			for (const seed of [1, 2, 3, 4, 5, 6]) {
				const exercise = reviewExercise(cardId, lexicon.lexemes, seeded(seed));
				expect(exercise.cardId, cardId).toBe(cardId);
				expect(problemsWith(exercise), `${cardId} seed ${seed}`).toEqual([]);
			}
		}
	});
});
