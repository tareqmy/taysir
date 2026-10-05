import { parseCardId, type ParsedCardId } from '../content/cards';
import type { Unit } from '../content/types';
import { verseData } from '../data';
import type { Verse } from '../data/types';
import type { StoredCard } from './scheduler';
import type { Meta } from './store';
import { addDays, type DayKey } from './streak';

/**
 * The numbers on the progress page. Everything is worked out from what the app already saves (the
 * review cards and `Meta`), so there is nothing extra to store, back up or migrate.
 */

/** A card's kind, or nothing for an id this version does not know: one odd card must not break a page. */
export function tryParseCardId(cardId: string): ParsedCardId | undefined {
	try {
		return parseCardId(cardId);
	} catch {
		return undefined;
	}
}

/** The review schedule's state for a card that has been learned and is being kept in memory. */
const REVIEW_STATE = 2;

/** A word whose last review set the next one this many days away counts as well known. */
export const WELL_KNOWN_DAYS = 21;

/** A whole-number percentage that never reads 0% for something started or 100% for something unfinished. */
export function percent(part: number, whole: number): number {
	if (whole <= 0 || part <= 0) return 0;
	if (part >= whole) return 100;
	return Math.min(99, Math.max(1, Math.round((part / whole) * 100)));
}

// --- Words ------------------------------------------------------------------------------------

export interface WordKnowledge {
	/** New, just started, or missed lately: the schedule has not yet spaced it out. */
	learning: number;
	/** Answered correctly, with the next review less than three weeks away. */
	familiar: number;
	/** The last review set the next one three weeks or more away. */
	wellKnown: number;
}

export type Strength = keyof WordKnowledge;

/** How well a card is known, by where the review schedule has got to with it. */
export function strengthOf(card: StoredCard): Strength {
	if (card.state !== REVIEW_STATE) return 'learning';
	return card.scheduled_days >= WELL_KNOWN_DAYS ? 'wellKnown' : 'familiar';
}

/** How well the learner knows the vocabulary cards they have been given, by the review schedule. */
export function wordKnowledge(cards: readonly StoredCard[]): WordKnowledge {
	const result: WordKnowledge = { learning: 0, familiar: 0, wellKnown: 0 };
	for (const card of cards) {
		if (tryParseCardId(card.id)?.type === 'lexeme') result[strengthOf(card)]++;
	}
	return result;
}

export const wordsLearned = (k: WordKnowledge) => k.learning + k.familiar + k.wellKnown;

/** Letters the learner has been given. */
export function lettersLearned(cards: readonly StoredCard[]): number {
	return cards.filter((card) => tryParseCardId(card.id)?.type === 'letter').length;
}

// --- The Quran ----------------------------------------------------------------------------------

/** The ids of the vocabulary words the learner has been given. */
export function learnedLexemes(cards: readonly StoredCard[]): Set<string> {
	return new Set(
		cards.flatMap((card) => {
			const found = tryParseCardId(card.id);
			return found?.type === 'lexeme' ? [found.id] : [];
		})
	);
}

export interface SurahCoverage {
	surah: number;
	/** Words in the surah that come from lessons the learner has completed. */
	known: number;
	/** Words in the surah that belong to a vocabulary card, so can be learned. */
	withCard: number;
	/** Every word in the surah. */
	words: number;
}

export interface Coverage {
	known: number;
	withCard: number;
	words: number;
	/** In the order of the Quran. */
	surahs: SurahCoverage[];
}

/**
 * How many of the words in the verses the course covers come from lessons the learner has done. A
 * word counts once it has a review card, however well it is known: how well is `wordKnowledge`'s
 * question. Some words, such as a noun with a pronoun ending, are not vocabulary cards (yet), so
 * the total can never be reached.
 */
export function coverage(
	cards: readonly StoredCard[],
	verses: readonly Verse[] = verseData.verses
): Coverage {
	const learned = learnedLexemes(cards);
	const bySurah = new Map<number, SurahCoverage>();
	for (const verse of verses) {
		const entry = bySurah.get(verse.surah) ?? {
			surah: verse.surah,
			known: 0,
			withCard: 0,
			words: 0
		};
		for (const word of verse.words) {
			entry.words++;
			if (word.lexemeId === undefined) continue;
			entry.withCard++;
			if (learned.has(word.lexemeId)) entry.known++;
		}
		bySurah.set(verse.surah, entry);
	}
	const surahs = [...bySurah.values()];
	const sum = (pick: (s: SurahCoverage) => number) => surahs.reduce((n, s) => n + pick(s), 0);
	return {
		known: sum((s) => s.known),
		withCard: sum((s) => s.withCard),
		words: sum((s) => s.words),
		surahs
	};
}

/**
 * A verse needs at least this share of vocabulary words before it can count as known. Without it a
 * verse of six words, five of them not vocabulary cards yet, would count once its one card was
 * learned, and a verse with no vocabulary words at all would count before anything was learned.
 */
export const MIN_VOCABULARY_SHARE = 0.5;

/**
 * Whether the learner has the words for a verse: every vocabulary word in it is learned. Words
 * that are not vocabulary cards yet, such as a noun with a pronoun ending, do not stand in the way;
 * the verse shows their English meaning.
 */
export function isKnownVerse(verse: Verse, learned: ReadonlySet<string>): boolean {
	const vocabulary = verse.words.filter((word) => word.lexemeId !== undefined);
	if (vocabulary.length === 0 || vocabulary.length < verse.words.length * MIN_VOCABULARY_SHARE) {
		return false;
	}
	return vocabulary.every((word) => learned.has(word.lexemeId!));
}

export interface SurahVerses {
	surah: number;
	/** Every verse in the surah. */
	total: number;
	/** The verses the learner has the words for, in order. */
	known: Verse[];
}

export interface VerseCoverage {
	known: number;
	total: number;
	/** In the order of the Quran. */
	surahs: SurahVerses[];
}

/** The verses the learner has the words for, surah by surah. */
export function verseCoverage(
	cards: readonly StoredCard[],
	verses: readonly Verse[] = verseData.verses
): VerseCoverage {
	const learned = learnedLexemes(cards);
	const bySurah = new Map<number, SurahVerses>();
	for (const verse of verses) {
		const entry = bySurah.get(verse.surah) ?? { surah: verse.surah, total: 0, known: [] };
		entry.total++;
		if (isKnownVerse(verse, learned)) entry.known.push(verse);
		bySurah.set(verse.surah, entry);
	}
	const surahs = [...bySurah.values()];
	return {
		known: surahs.reduce((n, s) => n + s.known.length, 0),
		total: surahs.reduce((n, s) => n + s.total, 0),
		surahs
	};
}

// --- The course ---------------------------------------------------------------------------------

export interface UnitProgress {
	unit: Unit;
	done: number;
	/** Lessons left out because the learner said they can already read the script. */
	skipped: number;
	total: number;
}

export function unitProgress(
	units: readonly Unit[],
	meta: Pick<Meta, 'completedLessons' | 'skippedLessons'>
): UnitProgress[] {
	const completed = new Set(meta.completedLessons);
	const skipped = new Set(meta.skippedLessons);
	return units.map((unit) => ({
		unit,
		done: unit.lessons.filter((l) => completed.has(l.id)).length,
		skipped: unit.lessons.filter((l) => !completed.has(l.id) && skipped.has(l.id)).length,
		total: unit.lessons.length
	}));
}

export function courseProgress(rows: readonly UnitProgress[]) {
	const sum = (pick: (row: UnitProgress) => number) => rows.reduce((n, row) => n + pick(row), 0);
	return { done: sum((r) => r.done), skipped: sum((r) => r.skipped), total: sum((r) => r.total) };
}

// --- Practice over time -------------------------------------------------------------------------

export interface ActivityDay {
	key: DayKey;
	/** Exercises answered that day. */
	count: number;
	/** The daily goal was met. */
	met: boolean;
	/** After today. */
	future: boolean;
	today: boolean;
}

export interface ActivityWeek {
	/** The Monday the week starts on. */
	start: DayKey;
	/** Monday to Sunday. */
	days: ActivityDay[];
}

/** Which day of the week a day key falls on, counted from Monday = 0. */
function weekdayIndex(key: DayKey): number {
	const [y, m, d] = key.split('-').map(Number);
	return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

/** The last `weeks` weeks up to and including the week of `today`, oldest first. */
export function activityWeeks(
	meta: Pick<Meta, 'activity' | 'metDays'>,
	today: DayKey,
	weeks = 12
): ActivityWeek[] {
	const met = new Set(meta.metDays);
	const first = addDays(today, -weekdayIndex(today) - 7 * (weeks - 1));
	return Array.from({ length: weeks }, (_, week) => {
		const start = addDays(first, week * 7);
		return {
			start,
			days: Array.from({ length: 7 }, (_, day) => {
				const key = addDays(start, day);
				return {
					key,
					count: meta.activity[key] ?? 0,
					met: met.has(key),
					future: key > today,
					today: key === today
				};
			})
		};
	});
}

export function activityTotals(meta: Pick<Meta, 'activity' | 'metDays'>) {
	const counts = Object.values(meta.activity);
	return {
		daysPracticed: counts.filter((n) => n > 0).length,
		exercises: counts.reduce((total, n) => total + n, 0),
		goalDays: new Set(meta.metDays).size
	};
}
