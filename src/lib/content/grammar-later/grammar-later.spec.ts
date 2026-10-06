import { describe, expect, it } from 'vitest';
import { units } from '../course';
import { arabicIn, handTyped, studiedBeforeLaterGrammar as studied } from '../testing/corpus';
import { grammarLaterUnit } from './index';

/**
 * Rules for every lesson in the later-surahs grammar unit: where the unit sits, that each lesson
 * teaches and then asks enough, and that its Arabic is real. What each lesson says about a word is
 * checked against the corpus in the lesson's own spec.
 */

const lessons = grammarLaterUnit.lessons;

describe('the later-surahs grammar unit', () => {
	it('comes after all of Juz Amma, which its examples are drawn from', () => {
		const ids = units.map((u) => u.id);
		expect(ids.indexOf('grammar-later')).toBeGreaterThan(ids.indexOf('juz-amma-7'));
	});

	it.each(lessons.map((l) => [l.id, l] as const))(
		'%s is a grammar lesson that teaches and then asks enough',
		(_id, lesson) => {
			expect(lesson.unitId).toBe('grammar-later');
			expect(lesson.kind).toBe('grammar');
			expect(lesson.cardIds).toEqual([]);
			expect(lesson.intro.filter((b) => b.type === 'rule').length).toBeGreaterThanOrEqual(1);
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

	it('uses only Arabic words from those surahs, so none is typed by hand', () => {
		for (const lesson of lessons) {
			expect(handTyped(lesson, studied), `${lesson.id}: Arabic that is not a studied word`).toEqual(
				[]
			);
		}
	});

	it('has some Arabic to check, so the test above is not passing for nothing', () => {
		const words = lessons.flatMap((l) =>
			l.exercises.flatMap((e) => [e.question, e.explanation ?? ''].flatMap(arabicIn))
		);
		expect(words.length).toBeGreaterThan(10);
	});
});
