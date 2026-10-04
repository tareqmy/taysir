import type { StoredCard } from './scheduler';
import { dayKey } from './streak';
import { defaultMeta, type Meta, type Placement } from './store';

/**
 * Progress backups: a small JSON file the learner can keep, to move to another device or to
 * recover after browser data is cleared. A file is untrusted input, so `parseBackup` checks every
 * field and rebuilds the data from scratch, dropping anything it does not understand.
 */

export const BACKUP_FORMAT = 'taysir-progress';
export const BACKUP_VERSION = 1;

/** Far more than anyone will use (about 55 years of daily practice), but it bounds a hostile file. */
const MAX_ACTIVITY_DAYS = 20_000;
const MAX_DAILY_GOAL = 200;

export interface Backup {
	format: typeof BACKUP_FORMAT;
	version: typeof BACKUP_VERSION;
	/** When the backup was made, ISO 8601. */
	exportedAt: string;
	meta: Meta;
	cards: StoredCard[];
}

/** The lessons and cards this version of the app has, so a backup cannot point at ones it lacks. */
export interface KnownIds {
	lessonIds: ReadonlySet<string>;
	cardIds: ReadonlySet<string>;
}

/** What was left out of a backup because this version of the app cannot use it. */
export interface Skipped {
	lessons: number;
	cards: number;
}

export type ParsedBackup =
	{ ok: true; backup: Backup; skipped: Skipped } | { ok: false; error: string };

export function createBackup(meta: Meta, cards: readonly StoredCard[], now: Date): Backup {
	return {
		format: BACKUP_FORMAT,
		version: BACKUP_VERSION,
		exportedAt: now.toISOString(),
		meta: structuredClone(meta),
		cards: structuredClone([...cards])
	};
}

/** `taysir-progress-2026-10-04.json`, using the learner's local date. */
export const backupFileName = (now: Date) => `taysir-progress-${dayKey(now)}.json`;

/** A few facts about a backup, to show before it replaces anything. */
export function summarize(backup: Backup) {
	return {
		exportedAt: new Date(backup.exportedAt),
		lessonsCompleted: backup.meta.completedLessons.length,
		cards: backup.cards.length,
		daysPracticed: Object.keys(backup.meta.activity).length
	};
}

// --- Validation ---------------------------------------------------------------------------

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const isCount = (value: unknown): value is number =>
	typeof value === 'number' && Number.isInteger(value) && value >= 0;

const isAmount = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value) && value >= 0;

const isDate = (value: unknown): value is string =>
	typeof value === 'string' && !Number.isNaN(Date.parse(value));

const isDay = (value: unknown): value is string => {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const time = Date.parse(`${value}T00:00:00Z`);
	return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value;
};

/** The strings of an array that are known, without repeats, and how many were not usable. */
function knownStrings(value: unknown, known: ReadonlySet<string>) {
	const kept = new Set<string>();
	let dropped = 0;
	if (Array.isArray(value)) {
		for (const item of value) {
			if (typeof item === 'string' && known.has(item)) kept.add(item);
			else dropped++;
		}
	}
	return { kept: [...kept], dropped };
}

function cleanCard(value: unknown, known: ReadonlySet<string>): StoredCard | undefined {
	if (!isRecord(value)) return undefined;
	const { id, due, stability, difficulty, state, last_review: lastReview } = value;
	if (typeof id !== 'string' || !known.has(id)) return undefined;
	if (!isDate(due) || !isAmount(stability) || !isAmount(difficulty)) return undefined;
	if (!isAmount(value.elapsed_days) || !isAmount(value.scheduled_days)) return undefined;
	if (!isCount(value.learning_steps) || !isCount(value.reps) || !isCount(value.lapses)) {
		return undefined;
	}
	if (!isCount(state) || state > 3) return undefined;
	if (lastReview !== undefined && !isDate(lastReview)) return undefined;
	return {
		id,
		due,
		stability,
		difficulty,
		elapsed_days: value.elapsed_days,
		scheduled_days: value.scheduled_days,
		learning_steps: value.learning_steps,
		reps: value.reps,
		lapses: value.lapses,
		state,
		...(lastReview === undefined ? {} : { last_review: lastReview })
	};
}

/** Reads and checks the text of a backup file. Never throws. */
export function parseBackup(text: string, known: KnownIds): ParsedBackup {
	let raw: unknown;
	try {
		raw = JSON.parse(text);
	} catch {
		return { ok: false, error: 'This is not a Taysir backup: the file could not be read.' };
	}
	if (!isRecord(raw) || raw.format !== BACKUP_FORMAT) {
		return { ok: false, error: 'This is not a Taysir backup.' };
	}
	if (typeof raw.version !== 'number' || raw.version > BACKUP_VERSION) {
		return {
			ok: false,
			error: 'This backup was made by a newer version of Taysir. Update the app and try again.'
		};
	}
	if (raw.version !== BACKUP_VERSION) {
		return { ok: false, error: 'This backup is in a format Taysir no longer reads.' };
	}
	if (!isDate(raw.exportedAt) || !isRecord(raw.meta) || !Array.isArray(raw.cards)) {
		return { ok: false, error: 'This backup is incomplete, so it was not used.' };
	}

	const m = raw.meta;
	const completed = knownStrings(m.completedLessons, known.lessonIds);
	const skippedLessons = knownStrings(m.skippedLessons, known.lessonIds);

	const activity: Record<string, number> = {};
	if (isRecord(m.activity)) {
		for (const [day, count] of Object.entries(m.activity).slice(0, MAX_ACTIVITY_DAYS)) {
			if (isDay(day) && isCount(count)) activity[day] = count;
		}
	}
	const metDays = new Set<string>();
	if (Array.isArray(m.metDays)) {
		for (const day of m.metDays.slice(0, MAX_ACTIVITY_DAYS)) if (isDay(day)) metDays.add(day);
	}

	const meta: Meta = {
		...defaultMeta(),
		dailyGoal:
			isCount(m.dailyGoal) && m.dailyGoal >= 1 && m.dailyGoal <= MAX_DAILY_GOAL
				? m.dailyGoal
				: defaultMeta().dailyGoal,
		completedLessons: completed.kept,
		skippedLessons: skippedLessons.kept,
		activity,
		metDays: [...metDays].sort()
	};
	if (m.placement === 'beginner' || m.placement === 'reader') {
		meta.placement = m.placement satisfies Placement;
	}

	const cards = new Map<string, StoredCard>();
	let droppedCards = 0;
	for (const item of raw.cards) {
		const card = cleanCard(item, known.cardIds);
		if (card && !cards.has(card.id)) cards.set(card.id, card);
		else droppedCards++;
	}

	return {
		ok: true,
		backup: {
			format: BACKUP_FORMAT,
			version: BACKUP_VERSION,
			exportedAt: new Date(raw.exportedAt).toISOString(),
			meta,
			cards: [...cards.values()]
		},
		skipped: { lessons: completed.dropped + skippedLessons.dropped, cards: droppedCards }
	};
}
