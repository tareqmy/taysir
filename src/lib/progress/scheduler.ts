import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type State } from 'ts-fsrs';
import type { Grade } from './grading';

/** A review card in a form that can be saved: dates are ISO strings. */
export interface StoredCard {
	id: string;
	due: string;
	stability: number;
	difficulty: number;
	elapsed_days: number;
	scheduled_days: number;
	learning_steps: number;
	reps: number;
	lapses: number;
	state: number;
	last_review?: string;
}

const scheduler = fsrs(generatorParameters({ enable_fuzz: true }));

const toCard = (c: StoredCard): Card => ({
	due: new Date(c.due),
	stability: c.stability,
	difficulty: c.difficulty,
	elapsed_days: c.elapsed_days,
	scheduled_days: c.scheduled_days,
	learning_steps: c.learning_steps,
	reps: c.reps,
	lapses: c.lapses,
	state: c.state as State,
	last_review: c.last_review ? new Date(c.last_review) : undefined
});

const fromCard = (id: string, c: Card): StoredCard => ({
	id,
	due: c.due.toISOString(),
	stability: c.stability,
	difficulty: c.difficulty,
	elapsed_days: c.elapsed_days,
	scheduled_days: c.scheduled_days,
	learning_steps: c.learning_steps,
	reps: c.reps,
	lapses: c.lapses,
	state: c.state,
	last_review: c.last_review?.toISOString()
});

/** A fresh card, due immediately. */
export function newCard(id: string, now: Date): StoredCard {
	return fromCard(id, createEmptyCard(now));
}

const RATINGS = {
	again: Rating.Again,
	hard: Rating.Hard,
	good: Rating.Good,
	easy: Rating.Easy
} as const;

/** Schedules a card's next review from how the answer went. */
export function reviewCard(card: StoredCard, grade: Grade, now: Date): StoredCard {
	const { card: next } = scheduler.next(toCard(card), now, RATINGS[grade]);
	return fromCard(card.id, next);
}

export const isDue = (card: StoredCard, now: Date): boolean => new Date(card.due) <= now;

/** Cards due now, most overdue first. */
export function dueCards(cards: readonly StoredCard[], now: Date, limit = Infinity): StoredCard[] {
	return cards
		.filter((c) => isDue(c, now))
		.sort((a, b) => a.due.localeCompare(b.due))
		.slice(0, limit);
}
