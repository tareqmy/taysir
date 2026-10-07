import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { lessonById } from '../content/course';
import { AppState } from './app.svelte';
import { parseBackup } from './backup';
import { defaultMeta, IndexedDbStore, MemoryStore, type Meta, type ProgressStore } from './store';

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

	it('brings a slow answer back sooner than a quick one', async () => {
		const app = await create();
		await app.setPlacement('beginner', 10);
		await app.completeLesson('letters-1', { 'lt:ba': true, 'lt:ta': true });
		now = new Date(2026, 9, 20, 9, 0, 0);
		await app.answer('lt:ba', true, 2000);
		await app.answer('lt:ta', true, 15000);
		const due = (id: string) => app.cards.find((c) => c.id === id)!.due;
		expect(due('lt:ba') > due('lt:ta')).toBe(true);
	});

	it('grades a right answer as Good when its time is unknown', async () => {
		const app = await create();
		await app.setPlacement('beginner', 10);
		await app.completeLesson('letters-1', { 'lt:ba': true, 'lt:ta': true });
		now = new Date(2026, 9, 20, 9, 0, 0);
		await app.answer('lt:ba', true);
		await app.answer('lt:ta', true, 5000);
		const due = (id: string) => app.cards.find((c) => c.id === id)!.due;
		expect(due('lt:ba')).toBe(due('lt:ta'));
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

describe('backup', () => {
	it('moves progress to another device', async () => {
		const first = await create();
		await first.setPlacement('reader', 3);
		await first.completeLesson('fatiha-1', { 'lx:allah': true, 'lx:rabb': false });
		await first.answer('lx:allah', true, 1500);
		await first.answer(undefined, true);
		await first.answer(undefined, true);
		const file = JSON.stringify(first.exportBackup());

		const otherStore = new MemoryStore();
		const second = new AppState(otherStore, () => now);
		await second.init();
		expect(second.needsPlacement).toBe(true);
		const parsed = parseBackup(file, second.knownIds);
		if (!parsed.ok) throw new Error(parsed.error);
		expect(parsed.skipped).toEqual({ lessons: 0, cards: 0 });
		await second.restore(parsed.backup);

		expect(second.meta.completedLessons).toEqual(first.meta.completedLessons);
		expect(second.cards).toEqual(first.cards);
		expect(second.streak.current).toBe(first.streak.current);
		expect(second.todayCount).toBe(3);

		const reopened = new AppState(otherStore, () => now);
		await reopened.init();
		expect(reopened.cards).toEqual(first.cards);
		expect(reopened.meta.placement).toBe('reader');
	});

	it('restores a backup that is wrapped in reactive proxies', async () => {
		// Svelte state wraps objects in proxies that structuredClone and IndexedDB refuse to store.
		const wrap = <T>(value: T): T =>
			typeof value === 'object' && value !== null
				? new Proxy(value, {
						get: (target, key) => wrap(Reflect.get(target, key)),
						getPrototypeOf: (target) => Reflect.getPrototypeOf(target)
					})
				: value;

		const first = await create();
		await first.setPlacement('reader', 3);
		await first.completeLesson('fatiha-1');
		const backup = first.exportBackup();

		const second = new AppState(new MemoryStore(), () => now);
		await second.init();
		await second.restore(wrap(backup));
		expect(second.cards).toEqual(first.cards);
		expect(second.meta).toEqual(first.meta);
	});

	it('replaces what was on the device', async () => {
		const app = await create();
		await app.setPlacement('beginner', 10);
		await app.completeLesson('letters-1');
		const fresh = new AppState(new MemoryStore(), () => now);
		await fresh.init();
		await fresh.setPlacement('reader', 5);
		const parsed = parseBackup(JSON.stringify(fresh.exportBackup()), app.knownIds);
		if (!parsed.ok) throw new Error(parsed.error);
		await app.restore(parsed.backup);
		expect(app.cards).toEqual([]);
		expect(app.meta.completedLessons).toEqual([]);
		expect(app.meta.placement).toBe('reader');
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

/** What a browser that will not keep data does when the app asks it to. */
const refused = () => new DOMException('The operation is insecure.', 'SecurityError');

/** A store whose browser refuses: everything when `loads` is false, otherwise every save. */
class RefusingStore implements ProgressStore {
	loads: boolean;
	constructor(loads: boolean) {
		this.loads = loads;
	}
	async loadCards() {
		if (!this.loads) throw refused();
		return [];
	}
	async loadMeta() {
		if (!this.loads) throw refused();
		return defaultMeta();
	}
	async saveCards() {
		throw refused();
	}
	async saveMeta(): Promise<Meta> {
		throw refused();
	}
	async replaceAll() {
		throw refused();
	}
	async clear() {
		throw refused();
	}
}

/** A backup of a learner who has finished the first lesson, made on another device. */
async function someBackup() {
	const source = await create();
	await source.setPlacement('beginner', 10);
	await source.completeLesson('letters-1');
	const parsed = parseBackup(JSON.stringify(source.exportBackup()), source.knownIds);
	if (!parsed.ok) throw new Error(parsed.error);
	return parsed.backup;
}

describe('when the browser will not keep anything', () => {
	it('says nothing is wrong when it will', async () => {
		const app = await create();
		await app.setPlacement('beginner', 10);
		await app.completeLesson('letters-1');
		await app.answer(undefined, true);
		expect(app.storageProblem).toBe(false);
	});

	it('still starts, with an empty page of progress and a warning, when nothing can be loaded', async () => {
		const app = new AppState(new RefusingStore(false), () => now);
		await app.init();
		expect(app.ready).toBe(true);
		expect(app.storageProblem).toBe(true);
		expect(app.needsPlacement).toBe(true);
	});

	it('does not pretend to erase progress that the browser will not let it erase', async () => {
		// Reading works but nothing can be changed, so an erase that carried on would show an empty
		// app and get the old progress back at the next load.
		const app = new AppState(new RefusingStore(true), () => now);
		await app.init();
		await app.setPlacement('beginner', 10);
		await expect(app.reset()).rejects.toThrow();
		expect(app.needsPlacement).toBe(false);
	});

	it('keeps what the learner does for the visit, and lets them download it', async () => {
		const app = new AppState(new RefusingStore(false), () => now);
		await app.init();
		await app.setPlacement('beginner', 10);
		await app.completeLesson('letters-1');
		await app.answer(undefined, true);

		expect(app.lessonStatus('letters-1')).toBe('done');
		expect(app.nextLesson?.id).toBe('letters-2');
		expect(app.todayCount).toBe(1);
		const parsed = parseBackup(JSON.stringify(app.exportBackup()), app.knownIds);
		if (!parsed.ok) throw new Error(parsed.error);
		expect(parsed.backup.meta.completedLessons).toEqual(['letters-1']);
	});

	it('does not fail an answer or a lesson because a save was refused, and says so', async () => {
		const app = new AppState(new RefusingStore(true), () => now);
		await app.init();
		expect(app.storageProblem).toBe(false);

		await expect(app.setPlacement('beginner', 10)).resolves.toBeUndefined();
		expect(app.storageProblem).toBe(true);
		await expect(app.completeLesson('letters-1')).resolves.toBeUndefined();
		await expect(app.answer(undefined, true)).resolves.toBeUndefined();
		expect(app.lessonStatus('letters-1')).toBe('done');
		expect(app.todayCount).toBe(1);
	});

	it('can still restore a backup, into memory, after falling back', async () => {
		const backup = await someBackup();
		const app = new AppState(new RefusingStore(false), () => now);
		await app.init();
		await app.restore(backup);
		expect(app.meta.completedLessons).toEqual(['letters-1']);
	});

	it('refuses a restore the browser will not store, and changes nothing', async () => {
		const backup = await someBackup();
		const app = new AppState(new RefusingStore(true), () => now);
		await app.init();
		await expect(app.restore(backup)).rejects.toThrow();
		expect(app.meta.completedLessons).toEqual([]);
	});
});

describe('two tabs of the app on one device', () => {
	// Each tab has its own AppState and its own connection to the same saved data.
	let dbCount = 0;
	const tabs = async () => {
		const name = `two-tabs-${dbCount++}`;
		const open = async () => {
			const app = new AppState(new IndexedDbStore(name), () => now);
			await app.init();
			return app;
		};
		const first = await open();
		await first.setPlacement('beginner', 10);
		return { first, second: await open(), open };
	};

	it('does not lose a lesson, or the exercises, that the other tab saved', async () => {
		const { first, second, open } = await tabs();
		await first.completeLesson('letters-1');
		await first.answer(undefined, true);
		await first.answer(undefined, true);

		// The second tab was open before any of that and has not heard of it.
		expect(second.lessonStatus('letters-1')).toBe('next');
		await second.answer(undefined, true);

		const reloaded = await open();
		expect(reloaded.lessonStatus('letters-1')).toBe('done');
		expect(reloaded.lessonStatus('letters-2')).toBe('next');
		expect(reloaded.todayCount).toBe(2);
		expect(reloaded.cards).toHaveLength(lessonById('letters-1')!.cardIds.length);
		// And having saved, the second tab now knows too.
		expect(second.lessonStatus('letters-1')).toBe('done');
		expect(second.todayCount).toBe(2);
	});

	it('does not give a card the other tab reviewed back as new', async () => {
		const { first, second, open } = await tabs();
		await first.completeLesson('letters-1', { 'lt:ba': true });
		// The second tab finishes the same lesson without having seen the first one do it.
		await second.completeLesson('letters-1');
		expect((await open()).cards.find((c) => c.id === 'lt:ba')!.reps).toBe(1);
	});

	it('does not put back a daily goal that was changed in the other tab', async () => {
		const { first, second, open } = await tabs();
		await first.setDailyGoal(5);
		await second.answer(undefined, true);
		expect(second.meta.dailyGoal).toBe(5);
		expect((await open()).meta.dailyGoal).toBe(5);
	});

	it('lets a tab change a setting that the other tab changed before', async () => {
		const { first, second, open } = await tabs();
		await first.setDailyGoal(5);
		await second.setDailyGoal(20);
		expect((await open()).meta.dailyGoal).toBe(20);
		expect(second.meta.dailyGoal).toBe(20);
	});
});
