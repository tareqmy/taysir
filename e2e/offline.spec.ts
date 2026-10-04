import type { BrowserContext, Page } from '@playwright/test';
import { lessons } from '../src/lib/content/course';
import {
	answerAll,
	answerExercise,
	continueButton,
	readStore,
	startWithProgress
} from './support/learner';
import { expect, test } from './support/served';
import type { Site } from './support/site';
import { seededLearner } from './support/seed';

/**
 * What the app promises a learner with no connection: it opens, every screen works, lessons and
 * reviews can be done and are kept, and the questions that need the recitation are left out. The
 * real service worker is running, and "no connection" is real: the server stops answering, and the
 * browser is told it is offline too, so `navigator.onLine` is false as it is on a phone.
 */

// These tests are about the worker, which every other test keeps out of the way.
test.use({ serviceWorkers: 'allow' });

// A lesson with a listening question, and what a learner who has done everything before it meets.
const lesson = lessons.find((l) =>
	l.exercises.some((e) => e.listening && e.id.startsWith('listen:'))
)!;
const learner = () => seededLearner({ lessonsDone: lessons.indexOf(lesson) });
const heardLess = lesson.exercises.filter((e) => !e.listening);
const listenAt = lesson.exercises.findIndex((e) => e.listening);

/** The worker has installed and taken control, which is when every file it needs is kept. */
const installed = (page: Page) =>
	page.waitForFunction(() => navigator.serviceWorker.controller !== null);

async function goOffline(context: BrowserContext, site: Site) {
	await context.setOffline(true);
	await site.down();
}

async function goOnline(context: BrowserContext, site: Site) {
	await site.up();
	await context.setOffline(false);
}

test('a lesson can be done with no connection, without the listening, and is kept; the listening returns with the connection', async ({
	page,
	context,
	site
}) => {
	expect(listenAt, 'the lesson should have a listening question').toBeGreaterThan(-1);
	await startWithProgress(page, learner().backup);
	await installed(page);

	await test.step('open the app with no connection', async () => {
		await goOffline(context, site);
		await page.reload();
		await expect(page.getByRole('heading', { name: 'Your lessons' })).toBeAttached();
		await expect(page.getByRole('link', { name: `Continue: ${lesson.title}` })).toBeVisible();
	});

	await test.step('read the lesson: the Arabic font is there too', async () => {
		await page.getByRole('link', { name: `Continue: ${lesson.title}` }).click();
		await expect(page.getByRole('heading', { level: 1, name: lesson.title })).toBeVisible();
		const fonts = await page.evaluate(async () => {
			await document.fonts.ready;
			return [...document.fonts].filter((f) => f.family.includes('Amiri')).map((f) => f.status);
		});
		expect(fonts).toContain('loaded');
		expect(fonts).not.toContain('error');
	});

	await test.step('answer every question that does not need to be heard', async () => {
		for (let step = 1; step < lesson.intro.length; step++) {
			await page.getByRole('button', { name: 'Continue' }).click();
		}
		await page.getByRole('button', { name: 'Start practice' }).click();
		for (const exercise of heardLess) {
			await expect(page.getByRole('progressbar', { name: 'Progress' })).toBeVisible();
			await expect(page.getByRole('region', { name: 'Listening question' })).toHaveCount(0);
			await answerExercise(page, exercise);
			await continueButton(page).click();
		}
		await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
	});

	await test.step('find it kept, still with no connection', async () => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Your lessons' })).toBeAttached();
		const meta = (await readStore(page, 'meta')) as { completedLessons: string[] }[];
		expect(meta[0].completedLessons).toContain(lesson.id);
	});

	await test.step('with the connection back, the same lesson asks the listening question', async () => {
		await goOnline(context, site);
		await page.goto(`/lesson/${lesson.id}`);
		await expect(page.getByRole('heading', { level: 1, name: lesson.title })).toBeVisible();
		for (let step = 1; step < lesson.intro.length; step++) {
			await page.getByRole('button', { name: 'Continue' }).click();
		}
		await page.getByRole('button', { name: 'Start practice' }).click();
		await answerAll(page, lesson.exercises.slice(0, listenAt));
		await expect(page.getByRole('region', { name: 'Listening question' })).toBeVisible();
	});
});

test('every screen opens from its address with no connection, and a review can be done', async ({
	page,
	context,
	site
}) => {
	await startWithProgress(page, seededLearner({ dueWords: 10 }).backup);
	await installed(page);
	await goOffline(context, site);

	const screens = [
		['/', 'Your lessons'],
		['/review', 'Review'],
		['/practice', 'Extra practice'],
		['/progress', 'Your progress'],
		['/verses', 'Verses you know'],
		['/settings', 'Settings'],
		['/about', 'About Taysir'],
		[`/lesson/${lessons[0].id}`, lessons[0].title]
	] as const;
	for (const [path, heading] of screens) {
		await test.step(`${path} opens`, async () => {
			await page.goto(path);
			await expect(
				page.getByRole('heading', { name: heading, exact: true }).first()
			).toBeAttached();
		});
	}

	await test.step('a review runs to the end, with no question that has to be heard', async () => {
		await page.goto('/review');
		const choices = page.getByRole('group', { name: 'Choices' });
		const summary = page.getByRole('heading', { name: 'Review complete' });
		for (let questions = 0; questions < 40; questions++) {
			await expect(choices.or(summary)).toBeVisible();
			if (await summary.isVisible()) return;
			await expect(page.getByRole('region', { name: 'Listening question' })).toHaveCount(0);
			await choices.getByRole('button').first().click();
			await continueButton(page).click();
		}
		throw new Error('The review never finished');
	});
});

/** What became of each time the page asked the server for a new version of the app. */
type Asks = { settled: boolean; failed: boolean }[];

test('looking for a new version with no connection is not an error, and finds it once back', async ({
	page,
	context,
	site
}) => {
	// Watch the app's own questions to the server, without changing what it gets back.
	await page.addInitScript(() => {
		const asks: Asks = [];
		(window as unknown as { asks: Asks }).asks = asks;
		const real = ServiceWorkerRegistration.prototype.update;
		ServiceWorkerRegistration.prototype.update = function () {
			const ask = { settled: false, failed: false };
			asks.push(ask);
			const answer = real.call(this);
			answer.then(
				() => (ask.settled = true),
				() => ((ask.settled = true), (ask.failed = true))
			);
			return answer;
		};
	});
	await startWithProgress(page, seededLearner().backup);
	await installed(page);
	const asks = () => page.evaluate(() => (window as unknown as { asks: Asks }).asks);
	const banner = page.getByRole('complementary', { name: 'Update available' });

	await goOffline(context, site);
	const before = (await asks()).length;
	// As the app does when a page left open comes back into view.
	await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
	await expect
		.poll(async () => (await asks()).slice(before))
		.toEqual([{ settled: true, failed: true }]);
	// It could not be reached, and that is all: the app carries on, with nothing said, and an error
	// it let escape would fail the test, as any uncaught error in the page does.
	await expect(page.getByRole('heading', { name: 'Your lessons' })).toBeAttached();
	await expect(banner).toHaveCount(0);

	await site.deploy();
	await goOnline(context, site);
	await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
	await expect(banner).toBeVisible({ timeout: 15_000 });
});
