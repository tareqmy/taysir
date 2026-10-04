import type { Page } from '@playwright/test';
import type { Exercise } from '../../src/lib/content/types';
import type { Backup } from '../../src/lib/progress/backup';
import { expect } from './test';

/** Choose "I can read the Quran" and a daily goal, as a new learner does on the welcome page. */
export async function startAsReader(
	page: Page,
	goal: 'Relaxed' | 'Steady' | 'Committed' = 'Steady'
) {
	await page.goto('/');
	await expect(page).toHaveURL(/\/welcome$/);
	await page.getByRole('button', { name: /I can read the Quran/ }).click();
	await page.getByRole('radio', { name: new RegExp(goal) }).check();
	await page.getByRole('button', { name: 'Start learning' }).click();
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByRole('heading', { name: 'Your lessons' })).toBeAttached();
}

/** Open Settings and replace the progress on this device with `backup`, as a learner would. */
export async function restoreProgress(page: Page, backup: Backup) {
	await chooseBackupFile(page, JSON.stringify(backup));
	await page.getByRole('button', { name: 'Replace my progress with this backup' }).click();
	await expect(page.getByText('Your progress has been restored.')).toBeVisible();
}

/** Open Settings and hand it a file, without confirming anything. */
export async function chooseBackupFile(page: Page, contents: string) {
	await page.goto('/settings');
	await page.locator('input[type=file]').setInputFiles({
		name: 'taysir-progress.json',
		mimeType: 'application/json',
		buffer: Buffer.from(contents)
	});
}

/** Start with a seeded learner: pick a starting point, then restore their saved progress. */
export async function startWithProgress(page: Page, backup: Backup) {
	await startAsReader(page);
	await restoreProgress(page, backup);
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Your lessons' })).toBeAttached();
}

// --- Answering ------------------------------------------------------------------------------

/** Give the right answer to a lesson exercise, using the course data to know what it is. */
export async function answerExercise(page: Page, exercise: Exercise) {
	switch (exercise.kind) {
		case 'choose': {
			const answer = exercise.choices.find((choice) => choice.id === exercise.answerId)!;
			await page
				.getByRole('group', { name: 'Choices' })
				.getByRole('button', { name: answer.chunk.text, exact: true })
				.click();
			break;
		}
		case 'match': {
			const tiles = page.getByRole('group', { name: 'Match the pairs' });
			for (const pair of exercise.pairs) {
				await tiles.getByRole('button', { name: pair.left.text, exact: true }).click();
				await tiles.getByRole('button', { name: pair.right.text, exact: true }).click();
			}
			break;
		}
		case 'build': {
			const bank = page.getByRole('group', { name: 'Word bank' });
			for (const token of exercise.answer) {
				await bank.getByRole('button', { name: token.chunk.text, exact: true }).click();
			}
			await page.getByRole('button', { name: 'Check', exact: true }).click();
			break;
		}
		case 'tap': {
			const word = exercise.words.find((w) => w.id === exercise.answerId)!;
			await page
				.getByRole('group', { name: 'The verse, word by word' })
				.getByRole('button', { name: word.text, exact: true })
				.click();
			break;
		}
	}
}

export const continueButton = (page: Page) => page.getByRole('button', { name: 'Continue' });

/** Answer these exercises correctly, one after another, moving on after each. */
export async function answerAll(page: Page, exercises: readonly Exercise[]) {
	for (const exercise of exercises) {
		await answerExercise(page, exercise);
		await continueButton(page).click();
	}
}

/**
 * Work through a review or practice session whose questions are made on the spot, so their answers
 * cannot be known in advance: pick the first choice each time, until the summary heading appears.
 * Wrong answers come back once, so a session is at most twice as long as it started.
 */
export async function runSession(page: Page, summaryHeading: string) {
	const choices = page.getByRole('group', { name: 'Choices' });
	const summary = page.getByRole('heading', { name: summaryHeading });
	for (let questions = 0; questions < 40; questions++) {
		await expect(choices.or(summary)).toBeVisible();
		if (await summary.isVisible()) return;
		await choices.getByRole('button').first().click();
		await continueButton(page).click();
	}
	throw new Error(`The session never reached "${summaryHeading}"`);
}

// --- What the app has saved -----------------------------------------------------------------

/** Everything in one of the app's IndexedDB stores: the review cards, or the single progress record. */
export async function readStore(page: Page, store: 'cards' | 'meta'): Promise<unknown[]> {
	return page.evaluate(async (name) => {
		const db = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open('taysir');
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		const rows = await new Promise<unknown[]>((resolve, reject) => {
			const request = db.transaction(name).objectStore(name).getAll();
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		db.close();
		return rows;
	}, store);
}
