import { lessons } from '../src/lib/content/course';
import { grammarFormsUnit } from '../src/lib/content/grammar-forms';
import { grammarLaterUnit } from '../src/lib/content/grammar-later';
import { answerAll, continueButton, startWithProgress } from './support/learner';
import { seededLearner } from './support/seed';
import { expect, test } from './support/test';

/**
 * Every lesson of the later-surahs grammar unit and of the verb forms and noun patterns unit, played
 * through the app as a learner does: it is the
 * next lesson once everything before it is done, it can be read and answered (every kind of question
 * it uses), and finishing it with every answer right says so. A lesson added to either unit is covered
 * by this without a change here.
 */

for (const unitLesson of [...grammarLaterUnit.lessons, ...grammarFormsUnit.lessons]) {
	const lesson = lessons.find((l) => l.id === unitLesson.id)!;

	test(`${lesson.title}: can be read, answered and finished`, async ({ page }) => {
		await startWithProgress(page, seededLearner({ lessonsDone: lessons.indexOf(lesson) }).backup);
		await page.getByRole('link', { name: `Continue: ${lesson.title}` }).click();
		await expect(page.getByRole('heading', { level: 1, name: lesson.title })).toBeVisible();

		for (let step = 1; step < lesson.intro.length; step++) await continueButton(page).click();
		await page.getByRole('button', { name: 'Start practice' }).click();
		await answerAll(page, lesson.exercises);

		await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
		await expect(page.getByText('100%')).toBeVisible();
	});
}
