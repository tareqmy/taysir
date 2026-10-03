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

	it('clears everything', async () => {
		const store = create();
		await store.saveCards([newCard('lx:rabb', now)]);
		await store.saveMeta({ ...defaultMeta(), dailyGoal: 20 });
		await store.clear();
		expect(await store.loadCards()).toEqual([]);
		expect((await store.loadMeta()).dailyGoal).toBe(defaultMeta().dailyGoal);
	});
});
