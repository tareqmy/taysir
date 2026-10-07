import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';
import { lessons, readerSkippedLessonIds } from '../src/lib/content/course';
import { audit } from './support/axe';
import { answerAll, runSession, startAsReader } from './support/learner';
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

test('keeps the visit’s progress through “Practise more”, which opens the same page again', async ({
	page
}) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'indexedDB', {
			get() {
				throw new DOMException('The operation is insecure.', 'SecurityError');
			}
		});
	});
	// A lesson and two or three sessions of questions: more than the usual time in a full run.
	test.slow();
	await startAsReader(page);
	await finishFirstLesson(page);
	// A mark on this page, which a fresh load would not have.
	await page.evaluate(() => Object.assign(window, { visit: 'this one' }));

	// To extra practice by the app's own links, through a review if anything is due.
	await page
		.getByRole('navigation', { name: 'Main' })
		.getByRole('link', { name: /^Review/ })
		.click();
	const choices = page.getByRole('group', { name: 'Choices' });
	const practise = page.getByRole('link', { name: /^Practise (your weakest words|more)$/ });
	await expect(choices.or(practise)).toBeVisible();
	if (await choices.isVisible()) await runSession(page, 'Review complete');
	await practise.click();
	await runSession(page, 'Practice complete');

	await page.getByRole('link', { name: 'Practise more' }).click();
	await expect(choices).toBeVisible();
	expect(await page.evaluate(() => (window as { visit?: string }).visit)).toBe('this one');

	// The lesson finished this visit is still there to download.
	await page
		.getByRole('navigation', { name: 'Main' })
		.getByRole('link', { name: 'Settings' })
		.click();
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Download backup' }).click();
	const saved = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
	expect(saved.meta.completedLessons).toEqual([first.id]);
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
	// Once the app has started and read what was saved, which is nothing; not before, or an alert
	// that has yet to be drawn would be missed.
	await expect(page.getByRole('heading', { name: 'Where would you like to start?' })).toBeVisible();
	await expect(notice(page)).toHaveCount(0);
});

test('does not pretend to have erased progress when the browser will not erase it', async ({
	page
}) => {
	await page.addInitScript(() => {
		// Saving works, so there is progress; only erasing is refused.
		IDBObjectStore.prototype.clear = function () {
			throw new DOMException('The operation is insecure.', 'SecurityError');
		};
	});
	await startAsReader(page);
	await page.goto('/settings');
	await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();

	page.once('dialog', (dialog) => void dialog.accept());
	await page.getByRole('button', { name: 'Erase all progress' }).click();
	await expect(notice(page)).toContainText('could not be erased');
	await expect(page).toHaveURL(/\/settings$/);

	// It told the truth: what was saved is still there, so a fresh page does not ask where to start.
	await page.reload();
	await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
});
