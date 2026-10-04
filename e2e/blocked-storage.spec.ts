import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';
import { lessons, readerSkippedLessonIds } from '../src/lib/content/course';
import { audit } from './support/axe';
import { answerAll, startAsReader } from './support/learner';
import { expect, test } from './support/test';

/**
 * Some browsers will not let a page keep anything (certain private or locked-down windows), and a
 * full disk can refuse a write. The app must still start, say plainly that progress is not being
 * saved, and keep working for the visit.
 */

// What a reader who skips the alphabet meets first.
const first = lessons.find((lesson) => !readerSkippedLessonIds.includes(lesson.id))!;

const notice = (page: Page) => page.getByRole('alert');

/** Read the first lesson through and answer it, as a learner does. */
async function finishFirstLesson(page: Page) {
	await page.getByRole('link', { name: `Continue: ${first.title}` }).click();
	for (let step = 1; step < first.intro.length; step++) {
		await page.getByRole('button', { name: 'Continue' }).click();
	}
	await page.getByRole('button', { name: 'Start practice' }).click();
	await answerAll(page, first.exercises);
	await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
}

test('starts, warns, and works for the visit when the browser refuses all storage', async ({
	page
}) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'indexedDB', {
			get() {
				throw new DOMException('The operation is insecure.', 'SecurityError');
			}
		});
	});

	// Not stuck on a loading screen: the app opens at the start, with a warning.
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Where would you like to start?' })).toBeVisible();
	await expect(notice(page)).toContainText('not letting Taysir save your progress');
	await audit(page, 'the storage warning');

	await startAsReader(page);
	await expect(notice(page)).toBeVisible();
	await finishFirstLesson(page);

	// What was done this visit can still be kept, by downloading it. The learner moves around the
	// app by its links: loading a page afresh would lose it, as the warning says.
	await page
		.getByRole('navigation', { name: 'Main' })
		.getByRole('link', { name: 'Settings' })
		.click();
	await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download backup' }).click();
	const saved = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
	expect(saved.meta.completedLessons).toEqual([first.id]);
	expect(saved.cards).toHaveLength(first.cardIds.length);

	// And the warning told the truth: a fresh page has forgotten it.
	await page.reload();
	await expect(page.getByRole('heading', { name: 'Where would you like to start?' })).toBeVisible();
});

test('keeps going, and warns, when saving starts to fail partway', async ({ page }) => {
	await page.addInitScript(() => {
		// Reading works, so the app starts normally; every write is refused, as by a full disk.
		IDBObjectStore.prototype.put = function () {
			throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
		};
	});

	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Where would you like to start?' })).toBeVisible();
	await expect(notice(page)).toHaveCount(0);

	// The first thing the app tries to save is the starting point.
	await startAsReader(page);
	await expect(notice(page)).toContainText('not letting Taysir save your progress');

	// The learner is not stopped: the lesson goes through and counts.
	await finishFirstLesson(page);
	await page.goto('/');
	await expect(notice(page)).toHaveCount(0); // a new page starts again from what was saved: nothing
});
