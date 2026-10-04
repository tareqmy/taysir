import { readFile } from 'node:fs/promises';
import { dayKey } from '../src/lib/progress/streak';
import { wordKnowledge, wordsLearned } from '../src/lib/progress/stats';
import { chooseBackupFile, readStore, startAsReader } from './support/learner';
import { seededLearner } from './support/seed';
import { expect, test } from './support/test';

const tile = (page: Parameters<typeof startAsReader>[0], label: string) =>
	page.locator('.headline > div').filter({ hasText: label }).locator('dd');

test('progress restored from a saved file shows up everywhere, and stays after a reload', async ({
	page
}) => {
	const seed = seededLearner({ lessonsDone: 30 });
	await startAsReader(page);

	await chooseBackupFile(page, JSON.stringify(seed.backup));
	// The learner is shown what the file holds before anything is replaced.
	await expect(page.getByRole('group', { name: 'Confirm restore' })).toContainText(
		`${seed.meta.completedLessons.length} lessons completed`
	);
	await page.getByRole('button', { name: 'Replace my progress with this backup' }).click();
	await expect(page.getByText('Your progress has been restored.')).toBeVisible();

	await page.getByRole('link', { name: 'Back to lessons' }).click();
	await page.getByRole('link', { name: 'Your progress' }).click();
	const words = wordsLearned(wordKnowledge(seed.cards));
	await expect(tile(page, 'Lessons done')).toHaveText(String(seed.meta.completedLessons.length));
	await expect(tile(page, 'Words learned')).toHaveText(String(words));
	// The calendar shows the six weeks of practice the file held.
	const daysPracticed = Object.keys(seed.meta.activity).length;
	await expect(page.getByText(`practised on ${daysPracticed} days`)).toBeVisible();

	await page.reload();
	await expect(tile(page, 'Lessons done')).toHaveText(String(seed.meta.completedLessons.length));
	expect(((await readStore(page, 'cards')) as unknown[]).length).toBe(seed.cards.length);
});

test('a file that is not a progress backup is refused and changes nothing', async ({ page }) => {
	await startAsReader(page);
	const before = await readStore(page, 'cards');

	await chooseBackupFile(page, JSON.stringify({ hello: 'world' }));
	await expect(page.getByRole('alert')).toBeVisible();
	await expect(
		page.getByRole('button', { name: 'Replace my progress with this backup' })
	).toHaveCount(0);

	expect(await readStore(page, 'cards')).toEqual(before);
});

test('downloading a backup gives a file that restores to the same progress', async ({ page }) => {
	const seed = seededLearner({ lessonsDone: 12 });
	await startAsReader(page);
	await chooseBackupFile(page, JSON.stringify(seed.backup));
	await page.getByRole('button', { name: 'Replace my progress with this backup' }).click();
	await expect(page.getByText('Your progress has been restored.')).toBeVisible();

	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download backup' }).click();
	const file = await download;
	expect(file.suggestedFilename()).toBe(`taysir-progress-${dayKey(new Date())}.json`);

	const saved = JSON.parse(await readFile((await file.path())!, 'utf8'));
	expect(saved.format).toBe('taysir-progress');
	expect(saved.meta.completedLessons).toEqual(seed.meta.completedLessons);
	expect(saved.cards).toHaveLength(seed.cards.length);
});
