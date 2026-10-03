import { beforeEach, describe, expect, it } from 'vitest';
import { lessonById } from '../content/course';
import { AppState } from './app.svelte';
import { MemoryStore } from './store';

let now: Date;
let store: MemoryStore;

const create = async () => {
	const app = new AppState(store, () => now);
	await app.init();
	return app;
};

beforeEach(() => {
	now = new Date(2026, 9, 3, 9, 0, 0);
	store = new MemoryStore();
});

describe('placement', () => {
	it('asks a new learner to choose a starting point', async () => {
		const app = await create();
		expect(app.needsPlacement).toBe(true);
	});

	it('starts beginners at the first letter lesson', async () => {
		const app = await create();
		await app.setPlacement('beginner', 10);
		expect(app.needsPlacement).toBe(false);
		expect(app.nextLesson?.id).toBe('letters-1');
	});

	it('lets readers skip the alphabet and start at the words', async () => {
		const app = await create();
		await app.setPlacement('reader', 5);
		expect(app.lessonStatus('letters-3')).toBe('skipped');
		expect(app.nextLesson?.id).toBe('fatiha-1');
		expect(app.meta.dailyGoal).toBe(5);
	});
});

describe('lessons', () => {
	it('unlocks lessons in order', async () => {
		const app = await create();
		await app.setPlacement('beginner', 10);
		expect(app.lessonStatus('letters-1')).toBe('next');
		expect(app.lessonStatus('letters-2')).toBe('locked');
		await app.completeLesson('letters-1');
		expect(app.lessonStatus('letters-1')).toBe('done');
		expect(app.lessonStatus('letters-2')).toBe('next');
	});

	it('adds the lesson’s cards once, even if completed again', async () => {
		const app = await create();
		await app.setPlacement('beginner', 10);
		await app.completeLesson('letters-1');
		await app.completeLesson('letters-1');
		expect(app.cards).toHaveLength(lessonById('letters-1')!.cardIds.length);
		expect(app.dueCards).toHaveLength(app.cards.length);
	});

	it('schedules cards from how they went in the lesson', async () => {
		const app = await create();
		await app.setPlacement('beginner', 10);
		await app.completeLesson('letters-1', { 'lt:ba': true, 'lt:ta': false });
		const byId = (id: string) => app.cards.find((c) => c.id === id)!;
		expect(byId('lt:ba').reps).toBe(1);
		expect(byId('lt:ta').reps).toBe(1);
		expect(byId('lt:ba').due > byId('lt:ta').due).toBe(true);
		expect(app.dueCards.map((c) => c.id)).not.toContain('lt:ba');
		expect(byId('lt:tha').reps).toBe(0);
	});

	it('rejects unknown lessons', async () => {
		const app = await create();
		await expect(app.completeLesson('nope')).rejects.toThrow('Unknown lesson');
	});
});

describe('practice', () => {
	it('grades the card and counts the exercise toward today', async () => {
		const app = await create();
		await app.setPlacement('beginner', 3);
		await app.completeLesson('letters-1');
		await app.answer('lt:ba', true);
		expect(app.cards.find((c) => c.id === 'lt:ba')?.reps).toBe(1);
		expect(app.todayCount).toBe(1);
		expect(app.dueCards.find((c) => c.id === 'lt:ba')).toBeUndefined();
	});

	it('meets the daily goal and starts a streak', async () => {
		const app = await create();
		await app.setPlacement('beginner', 2);
		await app.answer(undefined, true);
		expect(app.goalMet).toBe(false);
		expect(app.streak.current).toBe(0);
		await app.answer(undefined, false);
		expect(app.goalMet).toBe(true);
		expect(app.streak.current).toBe(1);
	});

	it('keeps the streak across consecutive days', async () => {
		const app = await create();
		await app.setPlacement('beginner', 1);
		await app.answer(undefined, true);
		now = new Date(2026, 9, 4, 9, 0, 0);
		await app.answer(undefined, true);
		expect(app.streak.current).toBe(2);
	});

	it('brings cards back when they fall due', async () => {
		const app = await create();
		await app.setPlacement('beginner', 10);
		await app.completeLesson('letters-1');
		await app.answer('lt:ba', true);
		now = new Date(2026, 9, 20, 9, 0, 0);
		expect(app.dueCards.map((c) => c.id)).toContain('lt:ba');
	});
});

describe('persistence', () => {
	it('restores progress in a new session', async () => {
		const first = await create();
		await first.setPlacement('beginner', 10);
		await first.completeLesson('letters-1');
		await first.answer('lt:ba', true);

		const second = await create();
		expect(second.meta.completedLessons).toEqual(['letters-1']);
		expect(second.cards.find((c) => c.id === 'lt:ba')?.reps).toBe(1);
		expect(second.todayCount).toBe(1);
	});

	it('resets everything', async () => {
		const app = await create();
		await app.setPlacement('beginner', 10);
		await app.completeLesson('letters-1');
		await app.reset();
		expect(app.needsPlacement).toBe(true);
		expect(app.cards).toEqual([]);
		expect((await create()).needsPlacement).toBe(true);
	});
});
