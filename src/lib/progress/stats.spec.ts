import { describe, expect, it } from 'vitest';
import { cardIds, units } from '../content/course';
import type { Unit } from '../content/types';
import { verseData } from '../data';
import type { Verse } from '../data/types';
import { newCard, type StoredCard } from './scheduler';
import {
	activityTotals,
	activityWeeks,
	courseProgress,
	coverage,
	isKnownVerse,
	learnedLexemes,
	lettersLearned,
	percent,
	unitProgress,
	verseCoverage,
	WELL_KNOWN_DAYS,
	wordKnowledge,
	wordsLearned
} from './stats';

const now = new Date('2026-10-03T09:00:00Z');
const NEW = 0;
const LEARNING = 1;
const REVIEW = 2;
const RELEARNING = 3;

const card = (id: string, state = REVIEW, scheduledDays = 0): StoredCard => ({
	...newCard(id, now),
	state,
	scheduled_days: scheduledDays
});

describe('percent', () => {
	it('rounds to a whole number', () => {
		expect(percent(1, 3)).toBe(33);
		expect(percent(2, 3)).toBe(67);
		expect(percent(1, 2)).toBe(50);
	});

	it('is 0 only when nothing has been done, and 100 only when everything has', () => {
		expect(percent(0, 100)).toBe(0);
		expect(percent(1, 1000)).toBe(1);
		expect(percent(999, 1000)).toBe(99);
		expect(percent(1000, 1000)).toBe(100);
	});

	it('copes with nothing to measure against', () => {
		expect(percent(0, 0)).toBe(0);
		expect(percent(5, 0)).toBe(0);
	});
});

describe('wordKnowledge', () => {
	it('puts words that are new, being learned or missed into learning', () => {
		const result = wordKnowledge([
			card('lx:a', NEW),
			card('lx:b', LEARNING),
			card('lx:c', RELEARNING, 30)
		]);
		expect(result).toEqual({ learning: 3, familiar: 0, wellKnown: 0 });
	});

	it('separates familiar from well known at three weeks', () => {
		const result = wordKnowledge([
			card('lx:a', REVIEW, WELL_KNOWN_DAYS - 1),
			card('lx:b', REVIEW, WELL_KNOWN_DAYS),
			card('lx:c', REVIEW, 90)
		]);
		expect(result).toEqual({ learning: 0, familiar: 1, wellKnown: 2 });
	});

	it('leaves out letters and ids it does not know', () => {
		const cards = [card('lt:alif'), card('lx:a'), card('zz:1')];
		expect(wordsLearned(wordKnowledge(cards))).toBe(1);
	});

	it('is all zeros before anything is learned', () => {
		expect(wordKnowledge([])).toEqual({ learning: 0, familiar: 0, wellKnown: 0 });
	});
});

describe('lettersLearned', () => {
	it('counts letter cards only', () => {
		expect(lettersLearned([card('lt:alif'), card('lt:ba'), card('lx:a'), card('zz:1')])).toBe(2);
	});
});

describe('coverage', () => {
	const word = (n: number, lexemeId?: string) => ({ n, text: `w${n}`, gloss: `g${n}`, lexemeId });
	const verses: Verse[] = [
		{ surah: 1, ayah: 1, words: [word(1, 'rabb'), word(2, 'hamd'), word(3)] },
		{ surah: 1, ayah: 2, words: [word(1, 'rabb')] },
		{ surah: 78, ayah: 1, words: [word(1, 'naba'), word(2, 'rabb')] }
	];

	it('counts every word, the words that can be learned, and the ones from completed lessons', () => {
		const result = coverage([card('lx:rabb')], verses);
		expect(result).toMatchObject({ words: 6, withCard: 5, known: 3 });
	});

	it('counts each time a learned word occurs', () => {
		expect(coverage([card('lx:hamd')], verses).known).toBe(1);
		expect(coverage([card('lx:rabb')], verses).known).toBe(3);
	});

	it('reports each surah, in the order of the verses', () => {
		const result = coverage([card('lx:rabb'), card('lx:naba')], verses);
		expect(result.surahs).toEqual([
			{ surah: 1, words: 4, withCard: 3, known: 2 },
			{ surah: 78, words: 2, withCard: 2, known: 2 }
		]);
	});

	it('ignores letters and cards for words that are not in these verses', () => {
		expect(coverage([card('lt:alif'), card('lx:unknown')], verses).known).toBe(0);
	});

	it('knows nothing before anything is learned', () => {
		expect(coverage([], verses)).toMatchObject({ words: 6, withCard: 5, known: 0 });
		expect(coverage([], [])).toEqual({ known: 0, withCard: 0, words: 0, surahs: [] });
	});

	it('can reach every word that has a card once the whole course is learned', () => {
		const all = coverage([...cardIds].map((id) => card(id)));
		expect(all.known).toBe(all.withCard);
		expect(all.words).toBe(verseData.verses.reduce((n, v) => n + v.words.length, 0));
		expect(all.withCard).toBeGreaterThan(0);
		expect(all.withCard).toBeLessThanOrEqual(all.words);
	});
});

describe('verses the learner has the words for', () => {
	const word = (n: number, lexemeId?: string) => ({ n, text: `w${n}`, gloss: `g${n}`, lexemeId });
	const verse = (surah: number, ayah: number, ...words: (string | undefined)[]): Verse => ({
		surah,
		ayah,
		words: words.map((id, i) => word(i + 1, id))
	});
	const learned = (...ids: string[]) => new Set(ids);

	it('needs every vocabulary word in the verse to be learned', () => {
		const v = verse(1, 1, 'rabb', 'hamd');
		expect(isKnownVerse(v, learned('rabb', 'hamd'))).toBe(true);
		expect(isKnownVerse(v, learned('rabb'))).toBe(false);
		expect(isKnownVerse(v, learned())).toBe(false);
	});

	it('does not let words that are not vocabulary cards stand in the way', () => {
		const v = verse(1, 2, 'rabb', undefined); // half the words are vocabulary
		expect(isKnownVerse(v, learned('rabb'))).toBe(true);
	});

	it('does not count a verse that is mostly words that are not cards yet', () => {
		const v = verse(1, 3, 'rabb', undefined, undefined);
		expect(isKnownVerse(v, learned('rabb'))).toBe(false);
	});

	it('never counts a verse with no vocabulary words, even before anything is learned', () => {
		const v = verse(1, 4, undefined, undefined);
		expect(isKnownVerse(v, learned())).toBe(false);
		expect(isKnownVerse(v, learned('rabb'))).toBe(false);
	});

	it('counts a verse once, however often a word occurs in it', () => {
		expect(isKnownVerse(verse(1, 5, 'rabb', 'rabb', 'rabb'), learned('rabb'))).toBe(true);
	});

	it('finds the learned ids from the cards, ignoring letters and ids it does not know', () => {
		expect(learnedLexemes([card('lx:a'), card('lt:alif'), card('zz:1'), card('lx:b')])).toEqual(
			new Set(['a', 'b'])
		);
	});

	describe('verseCoverage', () => {
		const verses = [
			verse(1, 1, 'rabb', 'hamd'),
			verse(1, 2, 'rabb'),
			verse(78, 1, 'naba', undefined, undefined),
			verse(78, 2, 'naba')
		];

		it('lists each surah in order with its known verses and its total', () => {
			const result = verseCoverage([card('lx:rabb'), card('lx:naba')], verses);
			expect(result.surahs.map((s) => [s.surah, s.total, s.known.map((v) => v.ayah)])).toEqual([
				[1, 2, [2]],
				[78, 2, [2]]
			]);
			expect(result).toMatchObject({ known: 2, total: 4 });
		});

		it('adds a verse as soon as its last word is learned', () => {
			expect(verseCoverage([card('lx:rabb')], verses).known).toBe(1);
			expect(verseCoverage([card('lx:rabb'), card('lx:hamd')], verses).known).toBe(2);
		});

		it('is empty before anything is learned', () => {
			expect(verseCoverage([], verses)).toMatchObject({ known: 0, total: 4 });
			expect(verseCoverage([], [])).toEqual({ known: 0, total: 0, surahs: [] });
		});

		it('on the real course, nothing is known at first and nearly everything once it is all learned', () => {
			expect(verseCoverage([]).known).toBe(0);
			const all = verseCoverage([...cardIds].map((id) => card(id)));
			const learnedAll = learnedLexemes([...cardIds].map((id) => card(id)));
			// Whatever is left out is left out by the vocabulary share rule alone.
			const short = verseData.verses.filter((v) => !isKnownVerse(v, learnedAll));
			for (const v of short) {
				const vocabulary = v.words.filter((w) => w.lexemeId !== undefined).length;
				expect(vocabulary < v.words.length * 0.5 || vocabulary === 0, `${v.surah}:${v.ayah}`).toBe(
					true
				);
			}
			expect(all.known + short.length).toBe(all.total);
			expect(all.known).toBeGreaterThan(all.total * 0.8);
			expect(all.total).toBe(verseData.verses.length);
		});
	});
});

describe('unitProgress', () => {
	const unit = (id: string, lessonIds: string[]) =>
		({
			id,
			title: id,
			description: '',
			lessons: lessonIds.map((l) => ({ id: l }))
		}) as unknown as Unit;
	const fixture = [unit('letters', ['l1', 'l2']), unit('words', ['w1', 'w2', 'w3'])];

	it('counts lessons done and skipped in each unit', () => {
		const rows = unitProgress(fixture, { completedLessons: ['w1'], skippedLessons: ['l1', 'l2'] });
		expect(rows.map(({ done, skipped, total }) => ({ done, skipped, total }))).toEqual([
			{ done: 0, skipped: 2, total: 2 },
			{ done: 1, skipped: 0, total: 3 }
		]);
	});

	it('counts a lesson that was done as done even if it was also skipped', () => {
		const [letters] = unitProgress(fixture, { completedLessons: ['l1'], skippedLessons: ['l1'] });
		expect(letters).toMatchObject({ done: 1, skipped: 0 });
	});

	it('adds the units up', () => {
		const rows = unitProgress(fixture, { completedLessons: ['w1', 'w2'], skippedLessons: ['l1'] });
		expect(courseProgress(rows)).toEqual({ done: 2, skipped: 1, total: 5 });
	});

	it('works on the real course before anything is done', () => {
		const rows = unitProgress(units, { completedLessons: [], skippedLessons: [] });
		expect(rows).toHaveLength(units.length);
		expect(courseProgress(rows).done).toBe(0);
		expect(courseProgress(rows).total).toBe(units.flatMap((u) => u.lessons).length);
	});
});

describe('activityWeeks', () => {
	// 3 October 2026 is a Saturday.
	const today = '2026-10-03';
	const none = { activity: {}, metDays: [] };
	const dayOfWeek = (key: string) => new Date(`${key}T00:00:00Z`).getUTCDay();

	it('gives twelve weeks of seven days, oldest first, each starting on a Monday', () => {
		const weeks = activityWeeks(none, today);
		expect(weeks).toHaveLength(12);
		for (const week of weeks) {
			expect(week.days).toHaveLength(7);
			expect(dayOfWeek(week.start)).toBe(1);
			expect(week.days[0].key).toBe(week.start);
		}
		expect(weeks.at(-1)!.start).toBe('2026-09-28');
	});

	it('runs through every day with none missing or repeated', () => {
		const keys = activityWeeks(none, today).flatMap((w) => w.days.map((d) => d.key));
		expect(keys).toHaveLength(84);
		expect(new Set(keys).size).toBe(84);
		expect([...keys].sort()).toEqual(keys);
	});

	it('marks today once and the days after it as the future', () => {
		const days = activityWeeks(none, today).flatMap((w) => w.days);
		expect(days.filter((d) => d.today).map((d) => d.key)).toEqual([today]);
		expect(days.filter((d) => d.future).map((d) => d.key)).toEqual(['2026-10-04']);
	});

	it('ends on a week of one day when today is a Monday', () => {
		const days = activityWeeks(none, '2026-09-28').at(-1)!.days;
		expect(days.map((d) => d.future)).toEqual([false, true, true, true, true, true, true]);
		expect(days[0].today).toBe(true);
	});

	it('takes each day’s count and whether the goal was met from the saved activity', () => {
		const meta = {
			activity: { '2026-10-01': 12, '2026-10-02': 3, '2020-01-01': 99 },
			metDays: ['2026-10-01']
		};
		const days = activityWeeks(meta, today).flatMap((w) => w.days);
		const byKey = Object.fromEntries(days.map((d) => [d.key, d]));
		expect(byKey['2026-10-01']).toMatchObject({ count: 12, met: true });
		expect(byKey['2026-10-02']).toMatchObject({ count: 3, met: false });
		expect(byKey['2026-09-30']).toMatchObject({ count: 0, met: false });
		expect(byKey['2020-01-01']).toBeUndefined(); // older than the grid
	});

	it('shows as many weeks as asked for', () => {
		expect(activityWeeks(none, today, 4)).toHaveLength(4);
	});
});

describe('activityTotals', () => {
	it('adds up days practised, exercises and days the goal was met', () => {
		const totals = activityTotals({
			activity: { '2026-10-01': 12, '2026-10-02': 3, '2026-10-03': 0 },
			metDays: ['2026-10-01', '2026-10-01']
		});
		expect(totals).toEqual({ daysPracticed: 2, exercises: 15, goalDays: 1 });
	});

	it('is zero for a new learner', () => {
		expect(activityTotals({ activity: {}, metDays: [] })).toEqual({
			daysPracticed: 0,
			exercises: 0,
			goalDays: 0
		});
	});
});
