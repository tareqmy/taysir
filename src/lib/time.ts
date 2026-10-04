import type { DayKey } from './progress/streak';

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;

/** “in 8 minutes”, “in 3 days”: when something comes due, in friendly words. */
export function formatRelative(target: Date, now: Date): string {
	const minutes = Math.max(1, Math.round((target.getTime() - now.getTime()) / 60_000));
	if (minutes < 60) return `in ${plural(minutes, 'minute')}`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `in ${plural(hours, 'hour')}`;
	return `in ${plural(Math.round(hours / 24), 'day')}`;
}

/** A day key such as `2026-10-03`, written the way the reader's own language writes dates. */
export function formatDayKey(
	key: DayKey,
	options: Intl.DateTimeFormatOptions,
	locale?: string
): string {
	const [y, m, d] = key.split('-').map(Number);
	// Noon, so that a daylight-saving change can never move it to another day.
	return new Date(y, m - 1, d, 12).toLocaleDateString(locale, options);
}
