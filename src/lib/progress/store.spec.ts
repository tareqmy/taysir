import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { newCard } from './scheduler';
import { defaultMeta, IndexedDbStore, MemoryStore, type ProgressStore } from './store';

const now = new Date('2026-10-03T09:00:00.000Z');
let dbCount = 0;

const stores: [string, () => ProgressStore][] = [
	['MemoryStore', () => new MemoryStore()],
	['IndexedDbStore', () => new IndexedDbStore(`test-${dbCount++}`)]
];

describe.each(stores)('%s', (_name, create) => {
	it('starts with default meta and no cards', async () => {
		const store = create();
		expect(await store.loadMeta()).toEqual(defaultMeta());
		expect(await store.loadCards()).toEqual([]);
	});

	it('round-trips meta', async () => {
		const store = create();
		const meta = {
			...defaultMeta(),
			placement: 'reader' as const,
			completedLessons: ['fatiha-1'],
			activity: { '2026-10-03': 4 }
		};
		await store.saveMeta(meta);
		expect(await store.loadMeta()).toEqual(meta);
	});

	it('saves cards and replaces them by id', async () => {
		const store = create();
		const card = newCard('lx:rabb', now);
		await store.saveCards([card, newCard('lt:ba', now)]);
		await store.saveCards([{ ...card, reps: 5 }]);
		const cards = await store.loadCards();
		expect(cards).toHaveLength(2);
		expect(cards.find((c) => c.id === 'lx:rabb')?.reps).toBe(5);
	});

	it('replaces everything at once', async () => {
		const store = create();
		await store.saveCards([newCard('lx:rabb', now), newCard('lt:ba', now)]);
		await store.saveMeta({ ...defaultMeta(), dailyGoal: 20, completedLessons: ['letters-1'] });
		const meta = { ...defaultMeta(), dailyGoal: 5, completedLessons: ['fatiha-1'] };
		await store.replaceAll(meta, [newCard('lt:ta', now)]);
		expect((await store.loadCards()).map((c) => c.id)).toEqual(['lt:ta']);
		expect(await store.loadMeta()).toEqual(meta);
	});

	describe('when a copy of the progress is out of date', () => {
		// What two tabs of the app do: both start from the same saved state, one moves on, then the
		// other, which has not heard about it, saves too.
		const saved = {
			...defaultMeta(),
			placement: 'beginner' as const,
			completedLessons: ['letters-1'],
			activity: { '2026-10-03': 3 },
			metDays: ['2026-10-02']
		};

		it('keeps the lessons, days and counts the other copy saved', async () => {
			const store = create();
			await store.saveMeta(saved);
			await store.saveMeta({
				...saved,
				completedLessons: ['letters-1', 'letters-2'],
				activity: { '2026-10-03': 7, '2026-10-04': 1 },
				metDays: ['2026-10-02', '2026-10-03']
			});

			const result = await store.saveMeta({ ...saved, activity: { '2026-10-03': 4 } });
			expect(result.completedLessons).toEqual(['letters-1', 'letters-2']);
			expect(result.activity).toEqual({ '2026-10-03': 7, '2026-10-04': 1 });
			expect(result.metDays).toEqual(['2026-10-02', '2026-10-03']);
			expect(await store.loadMeta()).toEqual(result);
		});

		it('keeps the stored settings unless the save changes them', async () => {
			const store = create();
			await store.saveMeta(saved);
			await store.saveMeta({ ...saved, dailyGoal: 5 }, { settings: true });

			// Answering a question in a tab that still thinks the goal is 10.
			const result = await store.saveMeta({ ...saved, activity: { '2026-10-03': 4 } });
			expect(result.dailyGoal).toBe(5);
			expect((await store.loadMeta()).dailyGoal).toBe(5);

			// Choosing a goal is a change, and wins.
			await store.saveMeta({ ...saved, dailyGoal: 20 }, { settings: true });
			expect((await store.loadMeta()).dailyGoal).toBe(20);
		});

		it('takes the settings of a save when nothing has chosen a starting point yet', async () => {
			const store = create();
			await store.saveMeta(defaultMeta());
			await store.saveMeta({ ...saved, dailyGoal: 15 });
			const meta = await store.loadMeta();
			expect(meta.placement).toBe('beginner');
			expect(meta.dailyGoal).toBe(15);
		});

		it('does not let a card that is behind replace the stored one', async () => {
			const store = create();
			const reviewed = { ...newCard('lx:rabb', now), reps: 3 };
			await store.saveCards([reviewed]);

			// A fresh card for a lesson finished in two tabs, and a card reviewed from an older copy.
			await store.saveCards([newCard('lx:rabb', now)]);
			await store.saveCards([{ ...reviewed, reps: 2 }]);
			expect((await store.loadCards())[0].reps).toBe(3);

			// One reviewed as often is the latest answer, and does replace it.
			await store.saveCards([{ ...reviewed, stability: 9 }]);
			expect((await store.loadCards())[0].stability).toBe(9);
		});
	});

	it('clears everything', async () => {
		const store = create();
		await store.saveCards([newCard('lx:rabb', now)]);
		await store.saveMeta({ ...defaultMeta(), dailyGoal: 20 });
		await store.clear();
		expect(await store.loadCards()).toEqual([]);
		expect((await store.loadMeta()).dailyGoal).toBe(defaultMeta().dailyGoal);
	});
});
