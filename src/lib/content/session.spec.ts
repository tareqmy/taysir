import { describe, expect, it } from 'vitest';
import { en, handChoice } from './exercises';
import { summarize } from './session';
import { seeded } from '../random';

const make = (id: string, cardId?: string) => ({
	...handChoice(id, 'q', undefined, en('a'), [en('b')], '', seeded(1)),
	cardId
});

describe('summarize', () => {
	it('counts first-try answers', () => {
		const exercises = [make('a'), make('b'), make('c')];
		const result = summarize(
			exercises,
			new Map([
				['a', true],
				['b', false],
				['c', true]
			])
		);
		expect(result).toMatchObject({ total: 3, firstTryCorrect: 2, byCard: {} });
	});

	it('marks a card right only if all its exercises were right first time', () => {
		const exercises = [
			make('a', 'lx:rabb'),
			make('b', 'lx:rabb'),
			make('c', 'lx:allah'),
			make('d', 'lx:allah')
		];
		const result = summarize(
			exercises,
			new Map([
				['a', true],
				['b', false],
				['c', true],
				['d', true]
			])
		);
		expect(result.byCard).toEqual({ 'lx:rabb': false, 'lx:allah': true });
	});

	it('treats unanswered exercises as wrong', () => {
		expect(summarize([make('a', 'lx:rabb')], new Map()).byCard).toEqual({ 'lx:rabb': false });
	});
});
