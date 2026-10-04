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

/** Where progress lives. Everything is local-first; a synced store could implement this later. */
export interface ProgressStore {
	loadCards(): Promise<StoredCard[]>;
	saveCards(cards: readonly StoredCard[]): Promise<void>;
	loadMeta(): Promise<Meta>;
	saveMeta(meta: Meta): Promise<void>;
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
		for (const card of cards) this.cards.set(card.id, structuredClone(card));
	}
	async loadMeta() {
		return structuredClone(this.meta);
	}
	async saveMeta(meta: Meta) {
		this.meta = structuredClone(meta);
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
		await Promise.all([...cards.map((card) => tx.store.put(card)), tx.done]);
	}
	async loadMeta() {
		return { ...defaultMeta(), ...(await (await this.open()).get('meta', META_KEY)) };
	}
	async saveMeta(meta: Meta) {
		await (await this.open()).put('meta', meta, META_KEY);
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
