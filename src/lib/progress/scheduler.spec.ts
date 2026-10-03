import { describe, expect, it } from 'vitest';
import { dueCards, isDue, newCard, reviewCard } from './scheduler';

const now = new Date('2026-10-03T09:00:00.000Z');
const later = (minutes: number) => new Date(now.getTime() + minutes * 60_000);

describe('scheduler', () => {
	it('makes new cards due immediately', () => {
		const card = newCard('lx:rabb', now);
		expect(card.id).toBe('lx:rabb');
		expect(isDue(card, now)).toBe(true);
	});

	it('schedules a correct answer into the future', () => {
		const card = reviewCard(newCard('lx:rabb', now), 'good', now);
		expect(card.reps).toBe(1);
		expect(isDue(card, now)).toBe(false);
	});

	it('brings a wrong answer back sooner than a correct one', () => {
		const start = newCard('lx:rabb', now);
		const good = reviewCard(start, 'good', now);
		const again = reviewCard(start, 'again', now);
		expect(new Date(again.due).getTime()).toBeLessThan(new Date(good.due).getTime());
	});

	it('spaces a mature card further the more easily it was answered', () => {
		const day = 24 * 60 * 60_000;
		const mature = {
			...newCard('lx:rabb', now),
			state: 2, // Review
			stability: 30,
			difficulty: 5,
			reps: 6,
			elapsed_days: 30,
			scheduled_days: 30,
			last_review: new Date(now.getTime() - 30 * day).toISOString(),
			due: now.toISOString()
		};
		const due = (grade: 'again' | 'hard' | 'good' | 'easy') =>
			new Date(reviewCard(mature, grade, now).due).getTime();
		expect(due('again')).toBeLessThan(due('hard'));
		expect(due('hard')).toBeLessThan(due('good'));
		expect(due('good')).toBeLessThan(due('easy'));
	});

	it('survives being saved and reloaded as plain data', () => {
		const saved = JSON.parse(JSON.stringify(reviewCard(newCard('lt:ba', now), 'good', now)));
		const next = reviewCard(saved, 'good', later(60));
		expect(next.reps).toBe(2);
	});

	it('lists only due cards, most overdue first', () => {
		const a = { ...newCard('a', now), due: later(-30).toISOString() };
		const b = { ...newCard('b', now), due: later(-90).toISOString() };
		const c = { ...newCard('c', now), due: later(30).toISOString() };
		expect(dueCards([a, b, c], now).map((x) => x.id)).toEqual(['b', 'a']);
		expect(dueCards([a, b, c], now, 1).map((x) => x.id)).toEqual(['b']);
	});
});
