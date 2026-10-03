import { describe, expect, it } from 'vitest';
import { formatRelative } from './time';

const now = new Date('2026-10-03T09:00:00Z');
const after = (ms: number) => new Date(now.getTime() + ms);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

describe('formatRelative', () => {
	it('never says zero minutes', () => {
		expect(formatRelative(after(10_000), now)).toBe('in 1 minute');
	});

	it('uses minutes, hours and days with correct plurals', () => {
		expect(formatRelative(after(8 * MINUTE), now)).toBe('in 8 minutes');
		expect(formatRelative(after(60 * MINUTE), now)).toBe('in 1 hour');
		expect(formatRelative(after(5 * HOUR), now)).toBe('in 5 hours');
		expect(formatRelative(after(24 * HOUR), now)).toBe('in 1 day');
		expect(formatRelative(after(72 * HOUR), now)).toBe('in 3 days');
	});
});
