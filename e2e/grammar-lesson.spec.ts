import { lessons } from '../src/lib/content/course';
import { answerAll, answerExercise, continueButton, startWithProgress } from './support/learner';
import { seededLearner } from './support/seed';
import { expect, test } from './support/test';

/**
 * The first grammar lesson, on the three kinds of word, played through the app as a learner does:
 * it is what comes next once everything before it is done, it can be read and answered, a wrong tap
 * is told so (the lesson has the only tap question written by hand), and finishing it unlocks the
 * lesson after it.
 */

const kinds = lessons.find((l) => l.id === 'grammar-kinds')!;
const after = lessons[lessons.indexOf(kinds) + 1];
const taps = kinds.exercises.filter((e) => e.kind === 'tap');

test('the lesson on the three kinds of word is next, can be played, and unlocks the one after', async ({
	page
}) => {
	expect(taps).toHaveLength(1);
	const tap = taps[0];
	if (tap.kind !== 'tap') throw new Error('not a tap question');
	const wrongWord = tap.words.find((w) => w.id !== tap.answerId)!;

	await test.step('it is the next lesson for a learner who has done everything before it', async () => {
		await startWithProgress(page, seededLearner({ lessonsDone: lessons.indexOf(kinds) }).backup);
		await page.getByRole('link', { name: `Continue: ${kinds.title}` }).click();
		await expect(page.getByRole('heading', { level: 1, name: kinds.title })).toBeVisible();
	});

	await test.step('read it: the three kinds are named, with the Arabic words once each', async () => {
		await expect(page.getByText('A noun (ism) names something')).toBeVisible();
		await expect(page.getByText('A verb (fiʿl) says what is done')).toBeVisible();
		await expect(page.getByText('A small word (ḥarf, also called a particle)')).toBeVisible();
		for (let step = 1; step < kinds.intro.length; step++) await continueButton(page).click();
		await page.getByRole('button', { name: 'Start practice' }).click();
	});

	await test.step('answer the questions with the words in front of them', async () => {
		await answerAll(page, kinds.exercises.slice(0, -1));
	});

	await test.step('a wrong tap says “Not quite” and explains, and the question comes back', async () => {
		await page
			.getByRole('group', { name: 'The verse, word by word' })
			.getByRole('button', { name: wrongWord.text, exact: true })
			.click();
		const feedback = page.getByRole('status').filter({ hasText: 'Not quite' });
		await expect(feedback).toBeVisible();
		await expect(feedback).toContainText('guide us');
		await continueButton(page).click();
		await answerExercise(page, tap);
		await expect(page.getByRole('status').filter({ hasText: 'Correct' })).toBeVisible();
		await continueButton(page).click();
	});

	await test.step('finish, and see the next lesson open', async () => {
		await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
		await page.goto('/');
		await expect(page.getByRole('link', { name: `Continue: ${after.title}` })).toBeVisible();
		await expect(
			page.getByRole('link', { name: new RegExp(`${kinds.title}.*Completed`) })
		).toBeVisible();
	});
});
