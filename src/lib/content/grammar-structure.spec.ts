import { describe, expect, it } from 'vitest';
import { verseData } from '../data';
import { units } from './course';
import { grammarStructureUnit } from './grammar-structure';
import type { Block, Chunk, Exercise } from './types';

/**
 * The new grammar lessons teach with examples the learner has already met, and the Arabic in them
 * is never typed by hand: both are checked here against the corpus.
 */

/** Al-Fatiha and surahs 105 to 114: everything the learner has studied before these lessons. */
const studied = (surah: number) => surah === 1 || (surah >= 105 && surah <= 114);

const studiedWords = new Set(
	verseData.verses.filter((v) => studied(v.surah)).flatMap((v) => v.words.map((w) => w.text))
);

const lessons = grammarStructureUnit.lessons;

/** The article, which the lessons write on its own when they name it ("a noun with ال"). */
const named = new Set(['ال']);

/**
 * Every Arabic word in a piece of text. The vowel marks are not Arabic letters, so they are counted
 * in as part of the word, and `scx` (script extensions) covers the tatweel that stretches a letter.
 */
const arabicIn = (text: string) =>
	(text.match(/[\p{scx=Arabic}\p{M}]+/gu) ?? []).filter((word) => !named.has(word));

/** The words a learner reads in a block, apart from the verse text the block shows. */
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

describe('the more-grammar unit', () => {
	it('comes straight after the first grammar from the short surahs, before Juz Amma', () => {
		const ids = units.map((u) => u.id);
		expect(ids.indexOf('grammar-structure')).toBe(ids.indexOf('grammar-patterns') + 1);
		expect(ids.indexOf('grammar-structure')).toBeLessThan(ids.indexOf('juz-amma-1'));
	});

	it('has the four lessons, in the order that builds each on the last', () => {
		expect(lessons.map((l) => l.id)).toEqual([
			'grammar-prepositions',
			'grammar-nominal',
			'grammar-cases',
			'grammar-when-o'
		]);
		for (const lesson of lessons) {
			expect(lesson.unitId).toBe('grammar-structure');
			expect(lesson.kind).toBe('grammar');
			expect(lesson.cardIds).toEqual([]);
		}
	});

	it.each(lessons.map((l) => [l.id, l] as const))(
		'%s teaches and then asks enough',
		(_id, lesson) => {
			expect(lesson.intro.filter((b) => b.type === 'rule').length).toBeGreaterThanOrEqual(2);
			expect(lesson.intro.some((b) => b.type === 'phrase' || b.type === 'verse')).toBe(true);
			expect(lesson.exercises.length).toBeGreaterThanOrEqual(8);
		}
	);

	it('only shows verses from surahs the learner has already studied', () => {
		for (const lesson of lessons) {
			for (const block of lesson.intro) {
				if (block.type === 'phrase' || block.type === 'verse') {
					expect(studied(block.surah), `${lesson.id}: ${block.surah}:${block.ayah}`).toBe(true);
				}
			}
		}
	});

	it('uses only Arabic words that are in those surahs, so none is typed by hand', () => {
		for (const lesson of lessons) {
			const strings = [
				lesson.title,
				lesson.subtitle,
				...lesson.intro.flatMap(textOf),
				...lesson.exercises.flatMap((e) => [
					e.question,
					e.explanation ?? '',
					...chunksOf(e).map((c) => c.text)
				])
			];
			const unknown = strings.flatMap(arabicIn).filter((word) => !studiedWords.has(word));
			expect(unknown, `${lesson.id}: Arabic that is not a studied corpus word`).toEqual([]);
		}
	});

	it('has some Arabic to check, so the test above is not passing for nothing', () => {
		const words = lessons.flatMap((l) =>
			l.exercises.flatMap((e) =>
				chunksOf(e).flatMap((c) => (c.lang === 'ar' ? arabicIn(c.text) : []))
			)
		);
		expect(words.length).toBeGreaterThan(80);
	});
});
