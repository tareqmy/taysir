/** Day keys are local calendar dates, `YYYY-MM-DD`. */
export type DayKey = string;

export const DAYS_PER_FREEZE = 7;
export const MAX_FREEZES = 2;

export function dayKey(date: Date): DayKey {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

/** Calendar arithmetic in UTC so daylight-saving changes cannot skip or repeat a day. */
export function addDays(key: DayKey, n: number): DayKey {
	const [y, m, d] = key.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export interface StreakResult {
	/** Consecutive days the daily goal was met, counting today once it is met. */
	current: number;
	/** Streak freezes in hand. A freeze covers one missed day. */
	freezes: number;
}

/**
 * Walks the history day by day. Meeting the goal extends the streak, and every
 * seventh day earns a freeze (up to two). Missing a day spends a freeze if there
 * is one and otherwise resets the streak. Today never breaks the streak: it can
 * still be met.
 */
export function computeStreak(metDays: readonly DayKey[], today: DayKey): StreakResult {
	if (metDays.length === 0) return { current: 0, freezes: 0 };
	const met = new Set(metDays);
	let day = [...met].sort()[0];
	let current = 0;
	let freezes = 0;

	for (; day <= today; day = addDays(day, 1)) {
		if (met.has(day)) {
			current++;
			if (current % DAYS_PER_FREEZE === 0) freezes = Math.min(MAX_FREEZES, freezes + 1);
		} else if (day < today && current > 0) {
			if (freezes > 0) freezes--;
			else current = 0;
		}
	}
	return { current, freezes };
}
