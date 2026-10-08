import { createBackup } from '../src/lib/progress/backup';
import { dayKey } from '../src/lib/progress/streak';
import { startWithProgress } from './support/learner';
import { seededLearner } from './support/seed';
import { expect, test } from './support/test';

test('a page left open moves on with the clock: cards fall due, and a new day starts', async ({
	page
}) => {
	// Ten minutes to midnight, with five exercises done today and nothing due yet: the cards still
	// being learned come due ten minutes after they were last answered.
	const now = new Date();
	now.setHours(23, 50, 0, 0);
	await page.clock.install({ time: now });
	const seed = seededLearner({ now });
	const meta = { ...seed.meta, activity: { ...seed.meta.activity, [dayKey(now)]: 5 } };
	await startWithProgress(page, createBackup(meta, seed.cards, now));

	const review = page.getByRole('link', { name: /^Review \d+ items?$/ });
	await expect(page.getByText('5 of 10 exercises today')).toBeVisible();
	await expect(review).toHaveCount(0);

	// The learner leaves the page open past midnight, without touching it.
	await page.clock.fastForward('20:00');
	await expect(page.getByText('0 of 10 exercises today')).toBeVisible();
	await expect(review).toBeVisible();
});
