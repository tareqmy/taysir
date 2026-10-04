import { describe, expect, it } from 'vitest';
import { lexemeById, lexicon } from '../data';
import { seeded } from '../random';
import {
	arabicChoice,
	buildPhrase,
	handChoice,
	isCorrect,
	listenMeaning,
	meaningChoice,
	reviewExercise,
	ar,
	en
} from './exercises';

describe('meaningChoice', () => {
	const rabb = lexemeById('rabb');

	it('offers the right meaning among four distinct options', () => {
		const exercise = meaningChoice(rabb, lexicon.lexemes, seeded(1));
		expect(exercise.choices).toHaveLength(4);
		const answer = exercise.choices.find((c) => c.id === exercise.answerId);
		expect(answer?.chunk.text).toBe(rabb.gloss);
	});

	it('is stable for the same seed and varies with a different one', () => {
		const a = meaningChoice(rabb, lexicon.lexemes, seeded(7));
		const b = meaningChoice(rabb, lexicon.lexemes, seeded(7));
		expect(a).toEqual(b);
		const orders = new Set(
			[1, 2, 3, 4, 5, 6].map((s) =>
				meaningChoice(rabb, lexicon.lexemes, seeded(s))
					.choices.map((c) => c.id)
					.join()
			)
		);
		expect(orders.size).toBeGreaterThan(1);
	});

	it('attaches the card and word audio', () => {
		const exercise = meaningChoice(rabb, lexicon.lexemes, seeded(1));
		expect(exercise.cardId).toBe('lx:rabb');
		expect(exercise.audioUrl).toMatch(/\/wbw\/001_002_003\.mp3$/);
	});

	it('does not offer another word with the same meaning as a wrong answer', () => {
		const exercise = meaningChoice(rabb, lexicon.lexemes, seeded(3));
		const glosses = exercise.choices.map((c) => c.chunk.text);
		expect(new Set(glosses).size).toBe(glosses.length);
	});
});

describe('listenMeaning', () => {
	const rabb = lexemeById('rabb');

	it('plays the word and shows nothing to read until the answer', () => {
		const exercise = listenMeaning(rabb, lexicon.lexemes, seeded(1));
		expect(exercise.listening).toBe(true);
		expect(exercise.prompt).toBeUndefined();
		expect(exercise.audioUrl).toMatch(/\/wbw\/001_002_003\.mp3$/);
		expect(exercise.cardId).toBe('lx:rabb');
		expect(exercise.choices).toHaveLength(4);
		expect(exercise.choices.every((c) => c.chunk.lang === 'en')).toBe(true);
		expect(exercise.choices.find((c) => c.id === exercise.answerId)?.chunk.text).toBe(rabb.gloss);
	});

	it('is the same for the same seed', () => {
		expect(listenMeaning(rabb, lexicon.lexemes, seeded(5))).toEqual(
			listenMeaning(rabb, lexicon.lexemes, seeded(5))
		);
	});
});

describe('reviewExercise with listening', () => {
	const cardId = 'lx:rabb';

	it('never listens unless allowed', () => {
		for (let seed = 1; seed <= 40; seed++) {
			expect(reviewExercise(cardId, lexicon.lexemes, seeded(seed)).listening).toBeUndefined();
		}
	});

	it('listens now and then when allowed, about one time in four', () => {
		const listening = Array.from({ length: 400 }, (_, i) =>
			reviewExercise(cardId, lexicon.lexemes, seeded(i + 1), true)
		).filter((e) => e.listening);
		expect(listening.length).toBeGreaterThan(60);
		expect(listening.length).toBeLessThan(140);
		for (const e of listening) expect(e.cardId).toBe(cardId);
	});

	it('only listens to words: letters are never played', () => {
		for (let seed = 1; seed <= 40; seed++) {
			expect(
				reviewExercise('lt:ba', lexicon.lexemes, seeded(seed), true).listening
			).toBeUndefined();
		}
	});
});

describe('words spelled the same', () => {
	// ما is both “what” and “not”; إِذا is both “when” and “behold”.
	const pairs = [
		['ma', 'manafiya'],
		['idha', 'idhasudden']
	];

	it('never offers one spelling’s meaning as a wrong answer for the other', () => {
		for (const [a, b] of pairs) {
			for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
				const exercise = meaningChoice(lexemeById(a), lexicon.lexemes, seeded(seed));
				const texts = exercise.choices.map((c) => c.chunk.text);
				expect(texts, `${a} seed ${seed}`).not.toContain(lexemeById(b).gloss);
			}
		}
	});

	it('never shows the same Arabic twice among the choices', () => {
		for (const lexeme of lexicon.lexemes) {
			for (const seed of [1, 2, 3]) {
				const texts = arabicChoice(lexeme, lexicon.lexemes, seeded(seed)).choices.map(
					(c) => c.chunk.text
				);
				expect(new Set(texts).size, `${lexeme.id} seed ${seed}`).toBe(texts.length);
			}
		}
	});
});

describe('arabicChoice', () => {
	it('asks for the Arabic word given the meaning', () => {
		const exercise = arabicChoice(lexemeById('yawm'), lexicon.lexemes, seeded(2));
		expect(exercise.prompt?.lang).toBe('en');
		expect(exercise.choices.every((c) => c.chunk.lang === 'ar')).toBe(true);
		expect(isCorrect(exercise, 'yawm')).toBe(true);
		expect(isCorrect(exercise, 'rabb')).toBe(false);
	});
});

describe('handChoice', () => {
	it('keeps the correct answer identifiable after shuffling', () => {
		const exercise = handChoice('t', 'Q?', undefined, en('right'), [en('wrong')], 'why', seeded(5));
		const answer = exercise.choices.find((c) => c.id === exercise.answerId);
		expect(answer?.chunk.text).toBe('right');
	});
});

describe('buildPhrase', () => {
	const exercise = buildPhrase(
		'b',
		'Lord of the worlds',
		['رب', 'عالمين'],
		['يوم'],
		'why',
		seeded(1)
	);

	it('accepts only the exact order', () => {
		expect(isCorrect(exercise, ['w0', 'w1'])).toBe(true);
		expect(isCorrect(exercise, ['w1', 'w0'])).toBe(false);
		expect(isCorrect(exercise, ['w0'])).toBe(false);
		expect(isCorrect(exercise, 'w0')).toBe(false);
	});

	it('includes extra tokens that are not part of the answer', () => {
		expect(exercise.extras.map((t) => t.chunk)).toEqual([ar('يوم')]);
	});
});
