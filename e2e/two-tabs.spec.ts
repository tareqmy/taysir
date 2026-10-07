import { lessons, readerSkippedLessonIds } from '../src/lib/content/course';
import type { Meta } from '../src/lib/progress/store';
import { answerAll, answerExercise, readStore, startAsReader } from './support/learner';
import { expect, test } from './support/test';

const first = lessons.find((lesson) => !readerSkippedLessonIds.includes(lesson.id))!;

/** Open `first` from the lesson list and read through to its first question. */
async function startLesson(page: Parameters<typeof startAsReader>[0]) {
	await page.getByRole('link', { name: `Continue: ${first.title}` }).click();
	for (let step = 1; step < first.intro.length; step++) {
		await page.getByRole('button', { name: 'Continue' }).click();
	}
	await page.getByRole('button', { name: 'Start practice' }).click();
}

test('a tab that is out of date does not wipe the lesson another tab finished', async ({
	page: tabA,
	context
}) => {
	// A whole lesson and part of another, in two tabs: more than the usual time when run alongside
	// the rest of the suite.
	test.slow();
	await startAsReader(tabA);

	// A second tab (an installed window, or an old tab left open) loads before anything is done.
	const tabB = await context.newPage();
	await tabB.goto('/');
	await expect(tabB.getByRole('link', { name: `Continue: ${first.title}` })).toBeVisible();

	await test.step('the first tab finishes the lesson', async () => {
		await startLesson(tabA);
		await answerAll(tabA, first.exercises);
		await expect(tabA.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
	});

	await test.step('the second tab, which has not heard of it, answers a question', async () => {
		await startLesson(tabB);
		await answerExercise(tabB, first.exercises[0]);
		await expect(tabB.getByRole('button', { name: 'Continue' })).toBeVisible();
	});

	await test.step('the lesson, its cards and the day’s count are all still saved', async () => {
		await tabA.goto('/');
		await expect(
			tabA.getByRole('link', { name: new RegExp(`${first.title}.*Completed`) })
		).toBeVisible();
		const meta = (await readStore(tabA, 'meta'))[0] as Meta;
		expect(meta.completedLessons).toContain(first.id);
		expect(Object.values(meta.activity)).toEqual([first.exercises.length]);
		expect(await readStore(tabA, 'cards')).toHaveLength(first.cardIds.length);
	});
});
