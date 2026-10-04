import { describe, expect, it } from 'vitest';
import { seeded } from '../random';
import { weakestCards } from './practice';
import { newCard, type StoredCard } from './scheduler';
import { strengthOf, WELL_KNOWN_DAYS } from './stats';

const now = new Date('2026-10-03T09:00:00Z');
const NEW = 0;
const LEARNING = 1;
const REVIEW = 2;
const RELEARNING = 3;

const card = (id: string, state: number, scheduledDays = 0, lapses = 0): StoredCard => ({
	...newCard(id, now),
	state,
	scheduled_days: scheduledDays,
	lapses
});

const learning = (id: string, lapses = 0) => card(id, LEARNING, 0, lapses);
const familiar = (id: string, lapses = 0) => card(id, REVIEW, 5, lapses);
const wellKnown = (id: string) => card(id, REVIEW, WELL_KNOWN_DAYS + 10);
const ids = (cards: StoredCard[]) => cards.map((c) => c.id);

describe('strengthOf', () => {
	it('calls a card learning until the schedule has spaced it out', () => {
		for (const state of [NEW, LEARNING, RELEARNING]) {
			expect(strengthOf(card('lx:a', state, 60))).toBe('learning');
		}
	});

	it('separates familiar from well known at three weeks', () => {
		expect(strengthOf(card('lx:a', REVIEW, WELL_KNOWN_DAYS - 1))).toBe('familiar');
		expect(strengthOf(card('lx:a', REVIEW, WELL_KNOWN_DAYS))).toBe('wellKnown');
	});
});

describe('weakestCards', () => {
	const mixed = [
		wellKnown('lx:w1'),
		familiar('lx:f1'),
		learning('lx:l1'),
		wellKnown('lx:w2'),
		learning('lx:l2'),
		familiar('lx:f2')
	];

	it('puts what is being learned first, then familiar, then well known', () => {
		const result = weakestCards(mixed, seeded(1), 6);
		expect(ids(result.slice(0, 2)).sort()).toEqual(['lx:l1', 'lx:l2']);
		expect(ids(result.slice(2, 4)).sort()).toEqual(['lx:f1', 'lx:f2']);
		expect(ids(result.slice(4, 6)).sort()).toEqual(['lx:w1', 'lx:w2']);
	});

	it('stops at the limit, taking the weakest', () => {
		const result = weakestCards(mixed, seeded(1), 3);
		expect(result).toHaveLength(3);
		expect(ids(result.slice(0, 2)).sort()).toEqual(['lx:l1', 'lx:l2']);
		expect(strengthOf(result[2])).toBe('familiar');
	});

	it('puts the cards missed most often first within a group', () => {
		const cards = [
			learning('lx:a', 0),
			learning('lx:b', 3),
			learning('lx:c', 1),
			learning('lx:d', 2)
		];
		for (let seed = 1; seed <= 10; seed++) {
			expect(ids(weakestCards(cards, seeded(seed), 4))).toEqual(['lx:b', 'lx:d', 'lx:c', 'lx:a']);
		}
	});

	it('draws a different handful each time when there are more shaky cards than fit', () => {
		const cards = Array.from({ length: 30 }, (_, i) => learning(`lx:${i}`));
		const sessions = new Set(
			Array.from({ length: 12 }, (_, seed) => ids(weakestCards(cards, seeded(seed + 1), 10)).join())
		);
		expect(sessions.size).toBeGreaterThan(6);
	});

	it('never repeats a card, and every card it returns was given', () => {
		const result = weakestCards(mixed, seeded(4), 10);
		expect(new Set(ids(result)).size).toBe(result.length);
		expect(result).toHaveLength(mixed.length);
	});

	it('works for letters as well as words', () => {
		const result = weakestCards([card('lt:alif', NEW), wellKnown('lx:w')], seeded(1), 2);
		expect(ids(result)).toEqual(['lt:alif', 'lx:w']);
	});

	it('is empty when nothing has been learned', () => {
		expect(weakestCards([], seeded(1))).toEqual([]);
	});

	it('does not change the cards it is given', () => {
		const before = structuredClone(mixed);
		weakestCards(mixed, seeded(2), 3);
		expect(mixed).toEqual(before);
	});
});
