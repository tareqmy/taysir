import { describe, expect, it } from 'vitest';
import { cardIds, lessons } from '../content/course';
import { lexemeCardId, letterCardId, parseCardId } from '../content/cards';
import { lexicon, surahName, verse } from '../data';
import { newCard, reviewCard, type StoredCard } from './scheduler';
import {
	findWords,
	fold,
	learnedWords,
	matchesSearch,
	strengthCounts,
	wordExample,
	type LearnedWord
} from './words';

const now = new Date('2026-03-01T09:00:00Z');

/** Vocabulary cards in the order the course teaches them. */
const courseWordCards = [...cardIds].filter((id) => id.startsWith('lx:'));
const lexemeOf = (cardId: string) => lexicon.lexemes.find((l) => l.id === parseCardId(cardId).id)!;

const learning = (id: string): StoredCard => reviewCard(newCard(id, now), 'good', now);
const familiar = (id: string): StoredCard => ({
	...newCard(id, now),
	state: 2,
	reps: 4,
	scheduled_days: 7
});
const wellKnown = (id: string): StoredCard => ({
	...newCard(id, now),
	state: 2,
	reps: 6,
	scheduled_days: 40
});

describe('learnedWords', () => {
	it('lists the vocabulary words among the cards, with how well each is known', () => {
		const [a, b, c] = courseWordCards;
		const words = learnedWords([learning(a), familiar(b), wellKnown(c)]);
		expect(words.map((w) => [w.lexeme.id, w.strength])).toEqual([
			[parseCardId(a).id, 'learning'],
			[parseCardId(b).id, 'familiar'],
			[parseCardId(c).id, 'wellKnown']
		]);
	});

	it('leaves out letters, and a card for a word this version does not have', () => {
		const [a] = courseWordCards;
		const words = learnedWords([
			learning(letterCardId('alif')),
			learning(lexemeCardId('no-such-word')),
			learning('???'),
			learning(a)
		]);
		expect(words.map((w) => w.lexeme.id)).toEqual([parseCardId(a).id]);
	});

	it('knows where in the course each word is taught', () => {
		const [first, second] = courseWordCards;
		const [x, y] = learnedWords([learning(first), learning(second)]);
		expect(x.taught).toBeLessThan(y.taught);
	});
});

describe('wordExample', () => {
	it('always gives a verse the app has, when it says it has one', () => {
		// The words page opens a word's example verse, so one marked as in the app has to exist.
		for (const lexeme of lexicon.lexemes) {
			const example = wordExample(lexeme);
			expect(example.form, lexeme.id).not.toBe('');
			expect(example.place, lexeme.id).toMatch(/\d+:\d+$/);
			if (example.inApp) {
				expect(() => verse(example.surah, example.ayah), lexeme.id).not.toThrow();
			}
		}
	});

	it('uses the word’s own example when that verse is in the app', () => {
		const lexeme = lexicon.lexemes.find((l) => l.sample.loc.startsWith('1:'))!;
		const [surah, ayah] = lexeme.sample.loc.split(':').map(Number);
		expect(wordExample(lexeme)).toEqual({
			form: lexeme.sample.form,
			surah,
			ayah,
			inApp: true,
			place: `${surahName(surah)} ${surah}:${ayah}`
		});
	});

	it('uses another verse for a word whose own example is from a surah the app does not have', () => {
		const lexeme = lexicon.lexemes.find((l) => l.id === 'alima')!;
		const example = wordExample(lexeme);
		expect(example.inApp).toBe(true);
		expect(`${example.surah}:${example.ayah}`).not.toBe(
			lexeme.sample.loc.split(':').slice(0, 2).join(':')
		);
		expect(verse(example.surah, example.ayah).words.some((w) => w.lexemeId === 'alima')).toBe(true);
	});

	it('names the reference only, for a word that is in none of the app’s verses', () => {
		const lexeme = lexicon.lexemes.find((l) => !wordExample(l).inApp)!;
		expect(lexeme, 'some word should have no verse in the app').toBeDefined();
		const [surah, ayah] = lexeme.sample.loc.split(':').map(Number);
		// A surah the app has no name for, so the name is left out rather than failing the page.
		expect(wordExample(lexeme)).toEqual({
			form: lexeme.sample.form,
			surah,
			ayah,
			inApp: false,
			place: `${surah}:${ayah}`
		});
	});
});

describe('fold', () => {
	it('drops vowel marks, so a word can be found without them', () => {
		const withMarks = lexemeOf(courseWordCards[0]).arabic;
		const without = withMarks.normalize('NFD').replace(/\p{M}/gu, '');
		expect(fold(withMarks)).toBe(fold(without));
		expect(fold(withMarks)).not.toBe(withMarks);
	});

	it('treats the kinds of alef alike, and alef maksura as ya', () => {
		const alef = String.fromCodePoint(0x627);
		const kinds = [0x623, 0x625, 0x622, 0x671].map((code) => String.fromCodePoint(code));
		for (const kind of kinds) expect(fold(kind)).toBe(alef);
		expect(fold(String.fromCodePoint(0x649))).toBe(String.fromCodePoint(0x64a));
	});

	it('ignores capitals, hyphens and extra spaces', () => {
		expect(fold('  The  Lord-of  ')).toBe(fold('the lordof'));
	});
});

describe('matchesSearch', () => {
	// A word whose root, form and meaning are all distinct enough to search by.
	const word: LearnedWord = learnedWords([
		learning(courseWordCards.find((id) => lexemeOf(id).root)!)
	])[0];
	const { lexeme } = word;

	it('matches everything when nothing is typed', () => {
		expect(matchesSearch(word, '')).toBe(true);
		expect(matchesSearch(word, '   ')).toBe(true);
	});

	it('finds a word by its English meaning, in any case and by part of a word', () => {
		const meaning = lexeme.gloss;
		expect(matchesSearch(word, meaning.toUpperCase())).toBe(true);
		expect(matchesSearch(word, meaning.slice(1, 4))).toBe(true);
		expect(matchesSearch(word, 'zzzzqq')).toBe(false);
	});

	it('finds a word by its Arabic with or without vowel marks', () => {
		expect(matchesSearch(word, lexeme.arabic)).toBe(true);
		expect(matchesSearch(word, lexeme.arabic.normalize('NFD').replace(/\p{M}/gu, ''))).toBe(true);
	});

	it('finds a word by the form it takes in the Quran', () => {
		expect(matchesSearch(word, lexeme.sample.form)).toBe(true);
	});

	it('finds a word by its root, typed with or without hyphens', () => {
		expect(matchesSearch(word, lexeme.root!)).toBe(true);
		expect(matchesSearch(word, [...lexeme.root!].join('-'))).toBe(true);
	});

	it('finds a word with a dagger alef under either spelling', () => {
		const dagger = String.fromCodePoint(0x670);
		const lexeme = lexicon.lexemes.find((l) => l.arabic.includes(dagger))!;
		expect(lexeme, 'some word should be written with a dagger alef').toBeDefined();
		const marked = learnedWords([learning(lexemeCardId(lexeme.id))])[0];

		// As the Quran writes it (the mark is dropped) and as it is usually typed (a full alef).
		const asWritten = lexeme.arabic.normalize('NFD').replace(/\p{M}/gu, '');
		const withAlef = lexeme.arabic
			.replaceAll(dagger, String.fromCodePoint(0x627))
			.normalize('NFD')
			.replace(/\p{M}/gu, '');
		expect(withAlef).not.toBe(asWritten);
		expect(matchesSearch(marked, asWritten)).toBe(true);
		expect(matchesSearch(marked, withAlef)).toBe(true);
		expect(matchesSearch(marked, `${withAlef}zzzz`)).toBe(false);
	});

	it('needs every word typed to be found, in any order', () => {
		const [first, ...rest] = lexeme.gloss.split(/[^\p{L}]+/u).filter((part) => part.length > 2);
		expect(rest.length, 'the test word should have a gloss of several words').toBeGreaterThan(0);
		expect(matchesSearch(word, `${rest.at(-1)} ${first}`)).toBe(true);
		expect(matchesSearch(word, `${first} zzzzqq`)).toBe(false);
	});
});

describe('findWords', () => {
	const ids = courseWordCards.slice(0, 12);
	const cards = ids.map((id, i) => [learning, familiar, wellKnown][i % 3](id));
	const words = learnedWords(cards);
	const all = { query: '', strength: 'all', sort: 'newest' } as const;

	it('shows the newest words first, or the most common, or the weakest', () => {
		expect(findWords(words, all).map((w) => w.taught)).toEqual(
			[...words].map((w) => w.taught).sort((a, b) => b - a)
		);

		const common = findWords(words, { ...all, sort: 'common' }).map((w) => w.lexeme.count);
		expect(common).toEqual([...common].sort((a, b) => b - a));

		const weakest = findWords(words, { ...all, sort: 'weakest' }).map((w) => w.strength);
		const rank = { learning: 0, familiar: 1, wellKnown: 2 };
		expect(weakest.map((s) => rank[s])).toEqual(weakest.map((s) => rank[s]).sort((a, b) => a - b));
	});

	it('puts the words missed most first among those equally known', () => {
		const [a, b] = ids;
		const missed = [
			{ ...learning(a), lapses: 0 },
			{ ...learning(b), lapses: 3 }
		];
		const order = findWords(learnedWords(missed), { ...all, sort: 'weakest' });
		expect(order.map((w) => w.card.id)).toEqual([b, a]);
	});

	it('keeps only the strength asked for', () => {
		for (const strength of ['learning', 'familiar', 'wellKnown'] as const) {
			const found = findWords(words, { ...all, strength });
			expect(found.length).toBeGreaterThan(0);
			expect(found.every((w) => w.strength === strength)).toBe(true);
		}
	});

	it('combines the search with the strength', () => {
		const target = words[1];
		const found = findWords(words, {
			query: target.lexeme.gloss,
			strength: target.strength,
			sort: 'newest'
		});
		expect(found.map((w) => w.lexeme.id)).toContain(target.lexeme.id);
		const other = findWords(words, {
			query: target.lexeme.gloss,
			strength: target.strength === 'learning' ? 'familiar' : 'learning',
			sort: 'newest'
		});
		expect(other.map((w) => w.lexeme.id)).not.toContain(target.lexeme.id);
	});

	it('does not change the list it is given', () => {
		const before = words.map((w) => w.lexeme.id);
		findWords(words, { ...all, sort: 'common' });
		expect(words.map((w) => w.lexeme.id)).toEqual(before);
	});

	it('counts the words at each strength', () => {
		expect(strengthCounts(words)).toEqual({ learning: 4, familiar: 4, wellKnown: 4 });
		expect(strengthCounts([])).toEqual({ learning: 0, familiar: 0, wellKnown: 0 });
	});
});

describe('the course order', () => {
	it('has every word taught by some lesson, so every learned word has a place', () => {
		const taught = new Set(lessons.flatMap((lesson) => lesson.cardIds));
		for (const id of courseWordCards) expect(taught.has(id)).toBe(true);
	});
});
