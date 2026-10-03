import { describe, expect, it } from 'vitest';
import { addDays, computeStreak, dayKey } from './streak';

const run = (start: string, length: number) => Array.from({ length }, (_, i) => addDays(start, i));

describe('dayKey and addDays', () => {
	it('formats local dates with zero padding', () => {
		expect(dayKey(new Date(2026, 9, 3))).toBe('2026-10-03');
		expect(dayKey(new Date(2026, 0, 9))).toBe('2026-01-09');
	});

	it('crosses month and year boundaries', () => {
		expect(addDays('2026-03-31', 1)).toBe('2026-04-01');
		expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
		expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
	});
});

describe('computeStreak', () => {
	it('is zero with no activity', () => {
		expect(computeStreak([], '2026-10-03')).toEqual({ current: 0, freezes: 0 });
	});

	it('counts consecutive days including today', () => {
		expect(computeStreak(run('2026-10-01', 3), '2026-10-03').current).toBe(3);
	});

	it('does not break when today is not yet met', () => {
		expect(computeStreak(run('2026-10-01', 2), '2026-10-03').current).toBe(2);
	});

	it('resets after a missed day with no freeze', () => {
		const met = ['2026-10-01', '2026-10-02', '2026-10-04'];
		expect(computeStreak(met, '2026-10-04').current).toBe(1);
	});

	it('earns a freeze every seventh day and spends it on one missed day', () => {
		const week = run('2026-10-01', 7);
		expect(computeStreak(week, '2026-10-07')).toEqual({ current: 7, freezes: 1 });

		const afterGap = [...week, '2026-10-09'];
		expect(computeStreak(afterGap, '2026-10-09')).toEqual({ current: 8, freezes: 0 });
	});

	it('caps freezes at two', () => {
		expect(computeStreak(run('2026-10-01', 21), '2026-10-21').freezes).toBe(2);
	});

	it('resets once a second consecutive day is missed', () => {
		const week = run('2026-10-01', 7);
		expect(computeStreak(week, '2026-10-10').current).toBe(0);
	});
});
