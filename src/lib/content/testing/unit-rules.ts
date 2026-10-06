import { describe, expect, it } from 'vitest';
import { formatRoot, lexicon } from '../../data';
import { units } from '../course';
import type { Unit } from '../types';
import {
	arabicIn,
	glossAt,
	glossClaims,
	handTyped,
	neighbours,
	plainEnglish,
	refsOf,
	rootsIn,
	sideBySide,
	stringsOf
} from './corpus';

/**
 * Rules for every hand-written grammar unit: where the unit sits, that each lesson teaches and then
 * asks enough, that its Arabic is real and that what it says about a word fits the verse data. What
 * a lesson says about a particular word is checked against the corpus in the lesson's own spec.
 * Call it from the unit's spec file.
 */
export function describeGrammarUnit(
	unit: Unit,
	options: {
		/** The surahs the learner has studied by the time of the unit. */
		studied: (surah: number) => boolean;
		/** The unit that must come before this one, which its examples are drawn from. */
		after: string;
		/** The fewest Arabic words, side by side or glossed, the unit must give for the checks to mean something. */
		minGlossed?: number;
	}
) {
	const { studied, after, minGlossed = 8 } = options;
	const lessons = unit.lessons;

	describe(`the ${unit.id} grammar unit`, () => {
		it(`comes after ${after}`, () => {
			const ids = units.map((u) => u.id);
			expect(ids).toContain(unit.id);
			expect(ids.indexOf(unit.id)).toBeGreaterThan(ids.indexOf(after));
		});

		it.each(lessons.map((l) => [l.id, l] as const))(
			'%s is a grammar lesson that teaches and then asks enough',
			(_id, lesson) => {
				expect(lesson.unitId).toBe(unit.id);
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
				expect(
					handTyped(lesson, studied),
					`${lesson.id}: Arabic that is not a studied word`
				).toEqual([]);
			}
		});

		it('writes a root only as the root of a word the course teaches', () => {
			const roots = new Set(lexicon.lexemes.flatMap((l) => (l.root ? [formatRoot(l.root)] : [])));
			let written = 0;
			for (const lesson of lessons) {
				for (const text of stringsOf(lesson)) {
					for (const root of rootsIn(text)) {
						written++;
						expect(roots.has(root), `${lesson.id}: ${root} is not a root of any lexeme`).toBe(true);
					}
				}
			}
			expect(written).toBeGreaterThanOrEqual(0);
		});

		it('only writes two Arabic words side by side when they stand so in a verse', () => {
			let pairs = 0;
			for (const lesson of lessons) {
				for (const text of stringsOf(lesson)) {
					for (const [first, second] of sideBySide(text)) {
						pairs++;
						expect(
							neighbours(first, second, studied).length,
							`${lesson.id}: ${first} ${second} is not a pair of neighbours in any verse`
						).toBeGreaterThan(0);
					}
				}
			}
			// A unit may have none; the check is that every one it has is real.
			expect(pairs).toBeGreaterThanOrEqual(0);
		});

		it('only glosses a word, as in “word (“meaning”)”, with a meaning its verse gives it', () => {
			let checked = 0;
			for (const lesson of lessons) {
				for (const text of stringsOf(lesson)) {
					for (const [word, meaning] of glossClaims(text)) {
						const glosses = refsOf(word, studied).map((ref) => plainEnglish(glossAt(ref)));
						const claimed = plainEnglish(meaning);
						checked++;
						expect(
							glosses.some((g) => g.includes(claimed) || claimed.includes(g)),
							`${lesson.id}: ${word} is not “${meaning}” in any verse (its glosses: ${glosses.join(' | ')})`
						).toBe(true);
					}
				}
			}
			expect(checked).toBeGreaterThan(minGlossed);
		});

		it('has some Arabic to check, so the tests above are not passing for nothing', () => {
			const words = lessons.flatMap((l) =>
				l.exercises.flatMap((e) => [e.question, e.explanation ?? ''].flatMap(arabicIn))
			);
			expect(words.length).toBeGreaterThan(10);
		});
	});
}
