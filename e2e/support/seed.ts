import { lessons } from '../../src/lib/content/course';
import { createBackup, type Backup } from '../../src/lib/progress/backup';
import { newCard, reviewCard, type StoredCard } from '../../src/lib/progress/scheduler';
import { defaultMeta, type Meta } from '../../src/lib/progress/store';
import { addDays, dayKey } from '../../src/lib/progress/streak';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export interface Seed {
	meta: Meta;
	cards: StoredCard[];
	backup: Backup;
}

/**
 * A learner part-way through the course, built with the app's own scheduler so the saved progress
 * is what the app itself would have written. Their words are spread across the review schedule
 * (learning, familiar, well known), they have six weeks of practice behind them, and `due` of
 * their cards are due for review right now; the rest are not due for at least ten minutes.
 */
export function seededLearner({ lessonsDone = 40, due = 0, now = new Date() } = {}): Seed {
	const done = lessons.slice(0, lessonsDone);
	const iso = (offsetMs: number) => new Date(now.getTime() + offsetMs).toISOString();
	const cardIds = [...new Set(done.flatMap((lesson) => lesson.cardIds))];

	const cards: StoredCard[] = cardIds.map((id, i) => {
		if (i < due) return { ...reviewCard(newCard(id, now), 'good', now), due: iso(-HOUR) };
		switch (i % 3) {
			case 0: // still learning
				return reviewCard(newCard(id, now), 'good', now);
			case 1: // familiar
				return {
					...newCard(id, now),
					state: 2,
					reps: 4,
					scheduled_days: 7,
					stability: 7,
					last_review: iso(-2 * DAY),
					due: iso(5 * DAY)
				};
			default: // well known
				return {
					...newCard(id, now),
					state: 2,
					reps: 6,
					scheduled_days: 40,
					stability: 40,
					last_review: iso(-10 * DAY),
					due: iso(30 * DAY)
				};
		}
	});

	const today = dayKey(now);
	const activity: Meta['activity'] = {};
	const metDays: string[] = [];
	for (let daysAgo = 1; daysAgo <= 42; daysAgo++) {
		if (daysAgo % 4 === 0 || daysAgo % 7 === 3) continue; // days off
		const key = addDays(today, -daysAgo);
		const count = 5 + (daysAgo % 9);
		activity[key] = count;
		if (count >= 10) metDays.push(key);
	}

	const meta: Meta = {
		...defaultMeta(),
		placement: 'beginner',
		dailyGoal: 10,
		completedLessons: done.map((lesson) => lesson.id),
		activity,
		metDays
	};
	return { meta, cards, backup: createBackup(meta, cards, now) };
}
