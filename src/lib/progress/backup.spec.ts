import { describe, expect, it } from 'vitest';
import { backupFileName, createBackup, parseBackup, summarize, type KnownIds } from './backup';
import { newCard } from './scheduler';
import { defaultMeta } from './store';

const now = new Date(2026, 9, 4, 9, 0, 0);
const known: KnownIds = {
	lessonIds: new Set(['letters-1', 'fatiha-1', 'fatiha-2']),
	cardIds: new Set(['lt:ba', 'lt:ta', 'lx:rabb'])
};

const meta = () => ({
	...defaultMeta(),
	placement: 'reader' as const,
	dailyGoal: 20,
	completedLessons: ['letters-1', 'fatiha-1'],
	skippedLessons: ['fatiha-2'],
	activity: { '2026-10-02': 12, '2026-10-03': 20 },
	metDays: ['2026-10-02', '2026-10-03']
});
const cards = () => [newCard('lt:ba', now), newCard('lx:rabb', now)];

/** A backup file as text, after `change` has had a go at the object. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the tests poke at arbitrary JSON
function file(change: (backup: Record<string, any>) => void = () => {}) {
	const backup = JSON.parse(JSON.stringify(createBackup(meta(), cards(), now)));
	change(backup);
	return JSON.stringify(backup);
}

describe('backup files', () => {
	it('restores exactly what was backed up', () => {
		const parsed = parseBackup(JSON.stringify(createBackup(meta(), cards(), now)), known);
		expect(parsed.ok).toBe(true);
		if (!parsed.ok) return;
		expect(parsed.backup.meta).toEqual(meta());
		expect(parsed.backup.cards).toEqual(cards());
		expect(parsed.skipped).toEqual({ lessons: 0, cards: 0 });
	});

	it('is named after the local date', () => {
		expect(backupFileName(now)).toBe('taysir-progress-2026-10-04.json');
	});

	it('describes what is in it', () => {
		const parsed = parseBackup(file(), known);
		if (!parsed.ok) throw new Error(parsed.error);
		expect(summarize(parsed.backup)).toEqual({
			exportedAt: now,
			lessonsCompleted: 2,
			cards: 2,
			daysPracticed: 2
		});
	});
});

describe('files that are not backups', () => {
	it.each([
		['text that is not JSON', 'hello'],
		['an empty file', ''],
		['a JSON array', '[]'],
		['a JSON number', '7'],
		['another kind of JSON', '{"format":"something-else","version":1}']
	])('rejects %s', (_label, text) => {
		const parsed = parseBackup(text, known);
		expect(parsed.ok).toBe(false);
	});

	it('says when a backup comes from a newer version', () => {
		const parsed = parseBackup(
			file((b) => (b.version = 2)),
			known
		);
		expect(parsed).toEqual({ ok: false, error: expect.stringContaining('newer version') });
	});

	it('rejects an old format it cannot read', () => {
		expect(
			parseBackup(
				file((b) => (b.version = 0)),
				known
			).ok
		).toBe(false);
	});

	it.each(['exportedAt', 'meta', 'cards'])('rejects a backup with no %s', (field) => {
		expect(
			parseBackup(
				file((b) => delete b[field]),
				known
			).ok
		).toBe(false);
	});
});

describe('cleaning what a backup holds', () => {
	it('leaves out lessons and cards this version does not have, and counts them', () => {
		const parsed = parseBackup(
			file((b) => {
				b.meta.completedLessons.push('lesson-from-the-future');
				b.meta.skippedLessons.push(42);
				b.cards.push({ ...b.cards[0], id: 'lx:from-the-future' });
			}),
			known
		);
		if (!parsed.ok) throw new Error(parsed.error);
		expect(parsed.backup.meta.completedLessons).toEqual(['letters-1', 'fatiha-1']);
		expect(parsed.backup.meta.skippedLessons).toEqual(['fatiha-2']);
		expect(parsed.backup.cards.map((c) => c.id)).toEqual(['lt:ba', 'lx:rabb']);
		expect(parsed.skipped).toEqual({ lessons: 2, cards: 1 });
	});

	it('falls back to safe settings', () => {
		const parsed = parseBackup(
			file((b) => {
				b.meta.dailyGoal = -3;
				b.meta.placement = 'expert';
			}),
			known
		);
		if (!parsed.ok) throw new Error(parsed.error);
		expect(parsed.backup.meta.dailyGoal).toBe(defaultMeta().dailyGoal);
		expect(parsed.backup.meta.placement).toBeUndefined();
	});

	it('keeps only real days with real counts', () => {
		const parsed = parseBackup(
			file((b) => {
				b.meta.activity = {
					'2026-10-03': 5,
					'2026-02-30': 5,
					yesterday: 5,
					'2026-10-04': -1,
					'2026-10-05': 1.5
				};
				b.meta.metDays = ['2026-10-03', 'nope', '2026-13-01', '2026-10-03'];
			}),
			known
		);
		if (!parsed.ok) throw new Error(parsed.error);
		expect(parsed.backup.meta.activity).toEqual({ '2026-10-03': 5 });
		expect(parsed.backup.meta.metDays).toEqual(['2026-10-03']);
	});

	it('cannot pollute prototypes through a crafted key', () => {
		const text = file().replace('"activity":{', '"activity":{"__proto__":{"polluted":9},');
		const parsed = parseBackup(text, known);
		if (!parsed.ok) throw new Error(parsed.error);
		expect(Object.keys(parsed.backup.meta.activity)).not.toContain('__proto__');
		expect(({} as Record<string, unknown>).polluted).toBeUndefined();
	});

	it('drops malformed and repeated cards and any extra fields', () => {
		const parsed = parseBackup(
			file((b) => {
				b.cards[0].junk = 'x';
				b.cards.push({ ...b.cards[0], reps: 99 }); // same id again: the first one wins
				b.cards.push({ ...b.cards[1], id: 'lt:ta', stability: 'lots' });
				b.cards.push({ ...b.cards[1], id: 'lt:ta', due: 'someday' });
				b.cards.push({ ...b.cards[1], id: 'lt:ta', state: 7 });
				b.cards.push('not a card');
			}),
			known
		);
		if (!parsed.ok) throw new Error(parsed.error);
		expect(parsed.backup.cards).toEqual(cards());
		expect(parsed.skipped.cards).toBe(5);
	});
});
