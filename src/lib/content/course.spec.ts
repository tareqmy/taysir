import { describe, expect, it } from 'vitest';
import { lexemeById, lexicon, phraseWords, surahName, verse, verseData } from '../data';
import { seeded } from '../random';
import { letterById, letterExample, letters } from './alphabet';
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

const versesOf = (surah: number) => verseData.verses.filter((v) => v.surah === surah);

describe('Al-Fatiha data', () => {
	it('has seven verses with every word glossed', () => {
		expect(versesOf(1).map((v) => v.words.length)).toEqual([4, 4, 2, 3, 4, 3, 9]);
		for (const v of versesOf(1)) for (const w of v.words) expect(w.gloss).not.toBe('');
	});

	it('links words to vocabulary cards', () => {
		const linked = versesOf(1)
			.flatMap((v) => v.words)
			.filter((w) => w.lexemeId);
		expect(linked.length).toBeGreaterThan(15);
		for (const w of linked) expect(() => lexemeById(w.lexemeId!)).not.toThrow();
	});

	it('records real corpus frequencies', () => {
		expect(lexemeById('allah').count).toBeGreaterThan(2000);
		expect(lexemeById('rabb').count).toBeGreaterThan(900);
		expect(lexicon.lexemes.every((l) => l.gloss.length > 0 && l.rank > 0)).toBe(true);
	});
});

describe('Juz Amma data', () => {
	const verseCounts: Record<number, number> = {
		78: 40,
		79: 46,
		80: 42,
		81: 29,
		82: 19,
		83: 36,
		84: 25,
		85: 22,
		86: 17,
		87: 19,
		88: 26,
		89: 30,
		90: 20,
		91: 15,
		92: 21,
		93: 11,
		94: 8,
		95: 8,
		96: 19,
		97: 5,
		98: 8,
		99: 8,
		100: 11,
		101: 11,
		102: 8,
		103: 3,
		104: 9,
		105: 5,
		106: 4,
		107: 7,
		108: 3,
		109: 6,
		110: 3,
		111: 5,
		112: 4,
		113: 5,
		114: 6
	};

	it('has every verse of surahs 78 to 114, each with a name', () => {
		for (const [surah, count] of Object.entries(verseCounts)) {
			const verses = versesOf(Number(surah));
			expect(
				verses.map((v) => v.ayah),
				`surah ${surah}`
			).toEqual(Array.from({ length: count }, (_, i) => i + 1));
			expect(surahName(Number(surah))).not.toBe('');
		}
	});

	it('glosses every word and numbers the words from 1', () => {
		for (const v of verseData.verses) {
			expect(
				v.words.map((w) => w.n),
				`${v.surah}:${v.ayah}`
			).toEqual(v.words.map((_, i) => i + 1));
			for (const w of v.words) expect(w.gloss, `${v.surah}:${v.ayah}:${w.n}`).not.toBe('');
		}
	});

	it('links words to the vocabulary they teach', () => {
		const text = (surah: number, ayah: number, n: number) =>
			versesOf(surah)
				.find((v) => v.ayah === ayah)!
				.words.find((w) => w.n === n)!;
		expect(text(112, 1, 3).lexemeId).toBe('allah');
		expect(text(113, 2, 2).lexemeId).toBe('shar');
		expect(text(109, 2, 2).lexemeId).toBe('abada');
		expect(text(114, 1, 3).lexemeId).toBe('rabb');
	});
});

describe('lexicon', () => {
	it('teaches every word in the lexicon in some lesson', () => {
		const taught = new Set(lessons.flatMap((l) => l.cardIds.map((id) => parseCardId(id).id)));
		expect(lexicon.lexemes.filter((l) => !taught.has(l.id)).map((l) => l.id)).toEqual([]);
	});

	it('gives every word its own meaning', () => {
		const glosses = lexicon.lexemes.map((l) => l.gloss);
		expect(glosses.filter((g, i) => glosses.indexOf(g) !== i)).toEqual([]);
	});
});

describe('alphabet', () => {
	it('has 28 distinct letters', () => {
		expect(letters).toHaveLength(28);
		expect(new Set(letters.map((l) => l.glyph)).size).toBe(28);
	});

	it('gives every letter a distinct Quran word that starts with it, with audio', () => {
		const alifs = ['ا', 'أ', 'إ', 'آ', 'ٱ'];
		for (const letter of letters) {
			const example = letterExample(letter);
			const first = example.text[0];
			const starts = letter.id === 'alif' ? alifs.includes(first) : first === letter.glyph;
			expect(starts, `${letter.id}: ${example.text}`).toBe(true);
			expect(example.audioUrl).toMatch(
				/^https:\/\/audio\.qurancdn\.com\/wbw\/\d{3}_\d{3}_\d{3}\.mp3$/
			);
		}
		const locations = letters.map((l) => l.example);
		expect(new Set(locations).size).toBe(locations.length);
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
				if (block.type === 'verse') verse(block.surah, block.ayah);
				if (block.type === 'phrase') phraseWords(block.surah, block.ayah, block.from, block.to);
			}
		}
	});

	it('shows a card for exactly the words a vocabulary lesson adds to review', () => {
		for (const lesson of lessons.filter((l) => l.kind === 'vocabulary')) {
			const shown = lesson.intro.flatMap((b) => (b.type === 'lexemes' ? b.ids : []));
			expect(shown.map((id) => `lx:${id}`).sort(), lesson.id).toEqual([...lesson.cardIds].sort());
		}
	});

	it('teaches each word once across the vocabulary lessons', () => {
		const taught = lessons.filter((l) => l.kind === 'vocabulary').flatMap((l) => l.cardIds);
		expect(taught.filter((id, i) => taught.indexOf(id) !== i)).toEqual([]);
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
