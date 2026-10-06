import { lessons, readerSkippedLessonIds } from '../src/lib/content/course';
import { surahName } from '../src/lib/data';
import { newCard } from '../src/lib/progress/scheduler';
import { verseCoverage, wordKnowledge, wordsLearned } from '../src/lib/progress/stats';
import { answerAll, startAsReader } from './support/learner';
import { expect, test } from './support/test';

// What a reader who skips the alphabet meets first.
const first = lessons.find((lesson) => !readerSkippedLessonIds.includes(lesson.id))!;

/** A count as the app writes it, with a thousands separator once it has four digits. */
const count = (n: number) => n.toLocaleString('en-US');

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('a new learner picks a starting point, finishes a lesson, and sees it in their progress', async ({
	page
}) => {
	// The daily goal is ten, and the lesson has to be enough to meet it on its own.
	expect(first.exercises.length).toBeGreaterThanOrEqual(10);
	const learned = first.cardIds.map((id) => newCard(id, new Date()));
	const words = wordsLearned(wordKnowledge(learned));
	const verses = verseCoverage(learned);
	expect(verses.known, 'the first lesson should unlock at least one verse').toBeGreaterThan(0);

	await test.step('choose a starting point and land on the lesson list', async () => {
		await startAsReader(page);
		await expect(page.getByText('0 of 10 exercises today')).toBeVisible();
	});

	await test.step('read the lesson, then answer every question', async () => {
		await page.getByRole('link', { name: `Continue: ${first.title}` }).click();
		await expect(page.getByRole('heading', { level: 1, name: first.title })).toBeVisible();
		for (let step = 1; step < first.intro.length; step++) {
			await page.getByRole('button', { name: 'Continue' }).click();
		}
		await page.getByRole('button', { name: 'Start practice' }).click();
		await answerAll(page, first.exercises);
	});

	await test.step('see the lesson complete, with every answer right first time', async () => {
		await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
		await expect(page.getByText('100%')).toBeVisible();
		await expect(
			page.getByText(`${first.cardIds.length} items were added to your review`)
		).toBeVisible();
		await expect(page.getByText(/goal is met/)).toBeVisible();
	});

	await test.step('find it saved on the lesson list after a fresh load', async () => {
		await page.goto('/');
		await expect(page.getByText('Goal met for today. Well done.')).toBeVisible();
		await expect(page.locator('.streak .num')).toHaveText('1');
		await expect(
			page.getByRole('link', { name: new RegExp(`${escape(first.title)}.*Completed`) })
		).toBeVisible();
	});

	await test.step('see the same lesson reflected on the progress page', async () => {
		await page.getByRole('link', { name: 'Your progress' }).click();
		await expect(page.getByRole('heading', { level: 1, name: 'Your progress' })).toBeVisible();
		const tile = (label: string) =>
			page.locator('.headline > div').filter({ hasText: label }).locator('dd');
		await expect(tile('Day streak')).toHaveText('1');
		await expect(tile('Longest streak')).toHaveText('1');
		await expect(tile('Words learned')).toHaveText(String(words));
		await expect(tile('Lessons done')).toHaveText('1');
		await expect(page.getByText(`${words} of`).first()).toBeVisible();
		// Today's square in the practice calendar says the goal was met.
		await expect(page.getByText(/\(today\)/)).toContainText('goal met');
	});

	await test.step('open the verses the lesson unlocked', async () => {
		await page
			.getByRole('link', {
				name: `Verses you know: ${count(verses.known)} of ${count(verses.total)}`
			})
			.click();
		await expect(page.getByRole('heading', { level: 1, name: 'Verses you know' })).toBeVisible();
		await expect(
			page.getByText(`${count(verses.known)} of ${count(verses.total)} verses`).first()
		).toBeVisible();

		const surah = verses.surahs.find((s) => s.known.length > 0)!;
		await page.locator('summary', { hasText: surahName(surah.surah) }).click();
		await expect(page.getByRole('region', { name: /verse \d+$/ })).toHaveCount(surah.known.length);
	});

	await test.step('keep all of it after reloading', async () => {
		await page.goto('/progress');
		await expect(
			page.locator('.headline > div').filter({ hasText: 'Lessons done' }).locator('dd')
		).toHaveText('1');
	});
});
