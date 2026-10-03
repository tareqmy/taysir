import { describe, expect, it } from 'vitest';
import { lexemeById, lexicon } from '../data';
import { seeded } from '../random';
import {
	arabicChoice,
	buildPhrase,
	handChoice,
	isCorrect,
	meaningChoice,
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
