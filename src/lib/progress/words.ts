import { parseCardId } from '../content/cards';
import { lessons } from '../content/course';
import { lexicon, surahName, verseData } from '../data';
import type { Lexeme } from '../data/types';
import type { StoredCard } from './scheduler';
import { strengthOf, type Strength } from './stats';

/**
 * The words page: the vocabulary the learner has been given, searched, filtered and sorted. Like the
 * progress numbers, it works from the saved review cards alone, so nothing extra is stored.
 */

export interface LearnedWord {
	lexeme: Lexeme;
	card: StoredCard;
	strength: Strength;
	/** Where the word comes in the course, counting from the first word taught. Later is newer. */
	taught: number;
}

export type WordSort = 'newest' | 'weakest' | 'common';
export type StrengthFilter = Strength | 'all';

export const STRENGTH_LABEL: Record<Strength, string> = {
	learning: 'Learning',
	familiar: 'Familiar',
	wellKnown: 'Well known'
};

export const SORTS: { id: WordSort; label: string }[] = [
	{ id: 'newest', label: 'Newest first' },
	{ id: 'weakest', label: 'Weakest first' },
	{ id: 'common', label: 'Most common first' }
];

const lexemes = new Map(lexicon.lexemes.map((lexeme) => [lexeme.id, lexeme]));

/** Each word's place in the course: the order its lessons teach them in. */
const courseOrder = new Map<string, number>();
for (const id of lessons.flatMap((lesson) => lesson.cardIds)) {
	if (!courseOrder.has(id)) courseOrder.set(id, courseOrder.size);
}

/**
 * The vocabulary words among these cards. Letters are left out, and so is a card for a word this
 * version of the app does not have: one odd card must not break the page.
 */
export function learnedWords(cards: readonly StoredCard[]): LearnedWord[] {
	const words: LearnedWord[] = [];
	for (const card of cards) {
		let id: string;
		try {
			const parsed = parseCardId(card.id);
			if (parsed.type !== 'lexeme') continue;
			id = parsed.id;
		} catch {
			continue;
		}
		const lexeme = lexemes.get(id);
		if (!lexeme) continue;
		words.push({
			lexeme,
			card,
			strength: strengthOf(card),
			taught: courseOrder.get(card.id) ?? -1
		});
	}
	return words;
}

// --- Where a word is seen ---------------------------------------------------------------------

/** A real occurrence of a word. `inApp` says whether the verse it is in is one the app has. */
export interface WordExample {
	form: string;
	surah: number;
	ayah: number;
	inApp: boolean;
	/** Where it is, as it is written: with the surah's name only for a surah the app has. */
	place: string;
}

/** The first verse in the app that holds each word, for the few whose own example is not in it. */
const firstVerseWith = new Map<string, { surah: number; ayah: number; form: string }>();
const inApp = new Set<string>();
for (const verse of verseData.verses) {
	inApp.add(`${verse.surah}:${verse.ayah}`);
	for (const word of verse.words) {
		if (word.lexemeId && !firstVerseWith.has(word.lexemeId)) {
			firstVerseWith.set(word.lexemeId, { surah: verse.surah, ayah: verse.ayah, form: word.text });
		}
	}
}

/**
 * Where to show a word being used. Every word has a real example from the corpus, but a dozen of
 * them are from surahs the app does not have, so those are shown in the first verse the app does
 * have that holds the word, and four have none (they are only named by their reference).
 */
export function wordExample({ sample }: Lexeme, id: string): WordExample {
	const [surah, ayah] = sample.loc.split(':').map(Number);
	const inAppVerse = (at: { surah: number; ayah: number }) => ({
		inApp: true,
		surah: at.surah,
		ayah: at.ayah,
		place: `${surahName(at.surah)} ${at.surah}:${at.ayah}`
	});
	if (inApp.has(`${surah}:${ayah}`)) return { form: sample.form, ...inAppVerse({ surah, ayah }) };
	const other = firstVerseWith.get(id);
	if (other) return { form: other.form, ...inAppVerse(other) };
	return { form: sample.form, surah, ayah, inApp: false, place: `${surah}:${ayah}` };
}

// --- Searching ----------------------------------------------------------------------------------

/**
 * Text as it is compared when searching. Arabic loses its vowel marks and Quranic signs, the
 * stretching mark and the hamza on an alef, and two letters that are often typed for each other
 * are made one; English loses its capitals. Hyphens go too, so a root can be typed as `ر-ح-م`.
 */
export function fold(text: string): string {
	return text
		.normalize('NFD')
		.replace(/[\p{M}\p{Lm}\p{Cf}-]/gu, '')
		.replaceAll(String.fromCodePoint(0x671), String.fromCodePoint(0x627)) // alef wasla → alef
		.replaceAll(String.fromCodePoint(0x649), String.fromCodePoint(0x64a)) // alef maksura → ya
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
}

/** What a word can be found by: its dictionary form, the form seen in the Quran, its root and meaning. */
function searchable({ lexeme }: LearnedWord): string[] {
	return [lexeme.arabic, lexeme.sample.form, lexeme.root ?? '', lexeme.gloss].map(fold);
}

/** Every word typed must be found somewhere in the word, in any order. Nothing typed matches all. */
export function matchesSearch(word: LearnedWord, query: string): boolean {
	const terms = fold(query).split(' ').filter(Boolean);
	if (terms.length === 0) return true;
	const fields = searchable(word);
	return terms.every((term) => fields.some((field) => field.includes(term)));
}

// --- Ordering -----------------------------------------------------------------------------------

const STRENGTH_RANK: Record<Strength, number> = { learning: 0, familiar: 1, wellKnown: 2 };

const COMPARE: Record<WordSort, (a: LearnedWord, b: LearnedWord) => number> = {
	newest: (a, b) => b.taught - a.taught,
	// What is still being learned first, and within that the words missed most, as extra practice does.
	weakest: (a, b) =>
		STRENGTH_RANK[a.strength] - STRENGTH_RANK[b.strength] ||
		b.card.lapses - a.card.lapses ||
		a.card.scheduled_days - b.card.scheduled_days ||
		b.taught - a.taught,
	common: (a, b) => b.lexeme.count - a.lexeme.count || a.lexeme.rank - b.lexeme.rank
};

export interface WordQuery {
	query: string;
	strength: StrengthFilter;
	sort: WordSort;
}

/** The words that match the search and the strength chosen, in the order chosen. */
export function findWords(words: readonly LearnedWord[], { query, strength, sort }: WordQuery) {
	return words
		.filter((word) => strength === 'all' || word.strength === strength)
		.filter((word) => matchesSearch(word, query))
		.sort(COMPARE[sort]);
}

/** How many words are at each strength, for the filter's labels. */
export function strengthCounts(words: readonly LearnedWord[]): Record<Strength, number> {
	const counts: Record<Strength, number> = { learning: 0, familiar: 0, wellKnown: 0 };
	for (const word of words) counts[word.strength]++;
	return counts;
}
