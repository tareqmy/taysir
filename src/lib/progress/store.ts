import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { StoredCard } from './scheduler';
import type { DayKey } from './streak';

export type Placement = 'beginner' | 'reader';

export interface Meta {
	version: 1;
	placement?: Placement;
	/** Exercises to complete per day. */
	dailyGoal: number;
	completedLessons: string[];
	skippedLessons: string[];
	/** Exercises completed per day. */
	activity: Record<DayKey, number>;
	/** Days on which the goal that applied at the time was met. */
	metDays: DayKey[];
}

export const defaultMeta = (): Meta => ({
	version: 1,
	dailyGoal: 10,
	completedLessons: [],
	skippedLessons: [],
	activity: {},
	metDays: []
});

export interface SaveMetaOptions {
	/** The writer is changing the settings (starting point, daily goal), so its values are kept. */
	settings?: boolean;
}

const union = <T>(first: readonly T[], second: readonly T[]) => [...new Set([...first, ...second])];

/**
 * What a save leaves in the store. Two tabs of the app (an installed window and a browser tab, or
 * an old tab left open) each hold their own copy of the progress, and a copy that is out of date
 * must not wipe what the other one saved. Finished lessons, days that met the goal and the count of
 * exercises per day only ever grow, so they are joined with what is stored. The settings (starting
 * point, daily goal, skipped lessons) are the writer's only when it says it is changing them, so an
 * old tab answering a question cannot put back a goal that was changed in another.
 */
export function mergeMeta(
	stored: Meta | undefined,
	mine: Meta,
	{ settings = false }: SaveMetaOptions = {}
): Meta {
	if (!stored) return structuredClone(mine);
	const base = { ...defaultMeta(), ...stored };
	// A store that has no starting point yet has no settings of its own to protect.
	const own = settings || !base.placement ? mine : base;
	const activity = { ...base.activity };
	for (const [day, count] of Object.entries(mine.activity)) {
		activity[day] = Math.max(activity[day] ?? 0, count);
	}
	return structuredClone({
		version: 1,
		placement: own.placement,
		dailyGoal: own.dailyGoal,
		skippedLessons: own.skippedLessons,
		completedLessons: union(base.completedLessons, mine.completedLessons),
		activity,
		metDays: union(base.metDays, mine.metDays)
	});
}

/**
 * A card that was worked out from a copy of the progress that is out of date (a lesson finished in
 * another tab, say) has been reviewed fewer times than the one stored, and must not replace it.
 */
const isBehind = (card: StoredCard, stored: StoredCard | undefined) =>
	stored !== undefined && stored.reps > card.reps;

/** Where progress lives. Everything is local-first; a synced store could implement this later. */
export interface ProgressStore {
	loadCards(): Promise<StoredCard[]>;
	/** Saves cards by id, except one that is behind the stored card (see `isBehind`). */
	saveCards(cards: readonly StoredCard[]): Promise<void>;
	loadMeta(): Promise<Meta>;
	/** Saves meta by joining it with what is stored (see `mergeMeta`) and returns the result. */
	saveMeta(meta: Meta, options?: SaveMetaOptions): Promise<Meta>;
	/** Replaces everything at once, so a failure part-way cannot leave half of the old progress. */
	replaceAll(meta: Meta, cards: readonly StoredCard[]): Promise<void>;
	clear(): Promise<void>;
}

export class MemoryStore implements ProgressStore {
	private cards = new Map<string, StoredCard>();
	private meta: Meta = defaultMeta();

	async loadCards() {
		return structuredClone([...this.cards.values()]);
	}
	async saveCards(cards: readonly StoredCard[]) {
		for (const card of cards) {
			if (!isBehind(card, this.cards.get(card.id))) this.cards.set(card.id, structuredClone(card));
		}
	}
	async loadMeta() {
		return structuredClone(this.meta);
	}
	async saveMeta(meta: Meta, options?: SaveMetaOptions) {
		this.meta = mergeMeta(this.meta, meta, options);
		return structuredClone(this.meta);
	}
	async replaceAll(meta: Meta, cards: readonly StoredCard[]) {
		this.cards = new Map(cards.map((card) => [card.id, structuredClone(card)]));
		this.meta = structuredClone(meta);
	}
	async clear() {
		this.cards.clear();
		this.meta = defaultMeta();
	}
}

interface TaysirDb extends DBSchema {
	cards: { key: string; value: StoredCard };
	meta: { key: string; value: Meta };
}

const META_KEY = 'meta';

export class IndexedDbStore implements ProgressStore {
	private db?: Promise<IDBPDatabase<TaysirDb>>;
	private name: string;

	constructor(name = 'taysir') {
		this.name = name;
	}

	private open() {
		this.db ??= openDB<TaysirDb>(this.name, 1, {
			upgrade(db) {
				db.createObjectStore('cards', { keyPath: 'id' });
				db.createObjectStore('meta');
			}
		});
		return this.db;
	}

	async loadCards() {
		return (await this.open()).getAll('cards');
	}
	async saveCards(cards: readonly StoredCard[]) {
		const tx = (await this.open()).transaction('cards', 'readwrite');
		await Promise.all([
			...cards.map(async (card) => {
				if (!isBehind(card, await tx.store.get(card.id))) await tx.store.put(card);
			}),
			tx.done
		]);
	}
	async loadMeta() {
		return { ...defaultMeta(), ...(await (await this.open()).get('meta', META_KEY)) };
	}
	async saveMeta(meta: Meta, options?: SaveMetaOptions) {
		// Read and write in one transaction, so a save from another tab cannot land in between.
		const tx = (await this.open()).transaction('meta', 'readwrite');
		const merged = mergeMeta(await tx.store.get(META_KEY), meta, options);
		await Promise.all([tx.store.put(merged, META_KEY), tx.done]);
		return merged;
	}
	async replaceAll(meta: Meta, cards: readonly StoredCard[]) {
		const tx = (await this.open()).transaction(['cards', 'meta'], 'readwrite');
		const store = tx.objectStore('cards');
		await store.clear();
		await Promise.all([
			...cards.map((card) => store.put(card)),
			tx.objectStore('meta').put(meta, META_KEY),
			tx.done
		]);
	}
	async clear() {
		const db = await this.open();
		await Promise.all([db.clear('cards'), db.clear('meta')]);
	}
}
