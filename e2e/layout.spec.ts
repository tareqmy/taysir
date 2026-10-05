import type { Page } from '@playwright/test';
import { lessons } from '../src/lib/content/course';
import { layoutProblems, useWideFonts, withBigText } from './support/layout';
import {
	answerAll,
	answerExercise,
	chooseBackupFile,
	continueButton,
	runSession,
	startAsReader
} from './support/learner';
import { seededLearner } from './support/seed';
import { expect, test } from './support/test';

/**
 * Every screen on a 375px phone and in a 1280px window, at normal text and at 200%, with wide
 * fonts: nothing may scroll the page sideways, break an Arabic word across lines, or spill out of
 * a button. (Settings and the lessons that hold the widest Arabic words are also checked at the
 * Largest Arabic size, in `arabic-size.spec.ts`.) Every screen is still checked after one fails,
 * so a report lists them all.
 */

/** A phone, and a wide window, where a layout that holds for one can still fail the other. */
const SIZES = [
	{ name: 'phone', width: 375, height: 812 },
	{ name: 'desktop', width: 1280, height: 800 }
];

/** Check the screen as it is now, at the size it is shown and at twice the text size. */
async function fits(page: Page, screen: string) {
	const { width } = page.viewportSize()!;
	expect.soft(await layoutProblems(page, width), `${screen}: layout problems`).toEqual([]);
	expect
		.soft(
			await withBigText(page, () => layoutProblems(page, width)),
			`${screen}, at 200% text: layout problems`
		)
		.toEqual([]);
}

// A grammar lesson that uses every kind of reading block (rule, text, phrase and verse) and a
// word-building question.
const grammar = lessons.find((l) => l.id === 'grammar-when-o')!;
const buildAt = grammar.exercises.findIndex((e) => e.kind === 'build');

// A lesson with a listening question.
const listening = lessons.find((l) =>
	l.exercises.some((e) => e.listening && e.id.startsWith('listen:'))
)!;
const listenAt = listening.exercises.findIndex((e) => e.listening);

for (const size of SIZES) {
	test.describe(size.name, () => {
		test.use({ viewport: { width: size.width, height: size.height } });

		test('every screen fits, at normal and at double text size', async ({ page }) => {
			test.setTimeout(120_000);
			await useWideFonts(page);
			const seed = seededLearner({ dueWords: 10 });

			await test.step('welcome and about, before a starting point is chosen', async () => {
				await page.goto('/');
				await expect(
					page.getByRole('heading', { name: 'Where would you like to start?' })
				).toBeVisible();
				await fits(page, 'welcome: choose a starting point');
				await page.getByRole('button', { name: /I can read the Quran/ }).click();
				await expect(
					page.getByRole('heading', { name: 'How much would you like to do each day?' })
				).toBeVisible();
				await fits(page, 'welcome: choose a goal');
				await page.goto('/about');
				await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
				await fits(page, 'about');
			});

			await test.step('settings, while restoring saved progress', async () => {
				await startAsReader(page);
				await page.goto('/words');
				await expect(page.getByText('Finish a vocabulary lesson')).toBeVisible();
				await fits(page, 'words: nothing learned yet');
				await chooseBackupFile(page, JSON.stringify(seed.backup));
				await expect(page.getByRole('group', { name: 'Confirm restore' })).toBeVisible();
				await fits(page, 'settings: confirm restore');
				await page.getByRole('button', { name: 'Replace my progress with this backup' }).click();
				await expect(page.getByText('Your progress has been restored.')).toBeVisible();
				await fits(page, 'settings: restored');
			});

			await test.step('lesson list', async () => {
				await page.goto('/');
				await expect(page.getByRole('heading', { name: 'Your lessons' })).toBeAttached();
				await fits(page, 'home');
			});

			await test.step('a lesson, from the reading to the end', async () => {
				await page.goto(`/lesson/${listening.id}`);
				await expect(page.getByRole('heading', { level: 1, name: listening.title })).toBeVisible();
				await fits(page, 'lesson: reading');
				for (let step = 1; step < listening.intro.length; step++) {
					await page.getByRole('button', { name: 'Continue' }).click();
				}
				await page.getByRole('button', { name: 'Start practice' }).click();
				await expect(page.getByRole('progressbar', { name: 'Progress' })).toBeVisible();
				await fits(page, 'lesson: first question');

				await answerAll(page, listening.exercises.slice(0, listenAt));
				await expect(page.getByRole('region', { name: 'Listening question' })).toBeVisible();
				await fits(page, 'lesson: listening question');
				await answerExercise(page, listening.exercises[listenAt]);
				await expect(continueButton(page)).toBeVisible();
				await fits(page, 'lesson: answer feedback');
				await continueButton(page).click();
				await answerAll(page, listening.exercises.slice(listenAt + 1));
				await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
				await fits(page, 'lesson: complete');
			});

			await test.step('a grammar lesson: every kind of reading block, and a word-building question', async () => {
				await page.goto(`/lesson/${grammar.id}`);
				for (let step = 0; step < grammar.intro.length; step++) {
					await expect(page.getByText(`Step ${step + 1} of ${grammar.intro.length}`)).toBeVisible();
					await fits(
						page,
						`grammar lesson: reading step ${step + 1} (${grammar.intro[step].type})`
					);
					if (step < grammar.intro.length - 1) {
						await page.getByRole('button', { name: 'Continue' }).click();
					}
				}
				await page.getByRole('button', { name: 'Start practice' }).click();
				await answerAll(page, grammar.exercises.slice(0, buildAt));
				await expect(page.getByRole('group', { name: 'Word bank' })).toBeVisible();
				await fits(page, 'grammar lesson: word-building question');
			});

			await test.step('review, from a question to the summary', async () => {
				await page.goto('/review');
				const choices = page.getByRole('group', { name: 'Choices' });
				await expect(choices).toBeVisible();
				await fits(page, 'review: question');
				await choices.getByRole('button').first().click();
				await expect(continueButton(page)).toBeVisible();
				await fits(page, 'review: answer feedback');
				await continueButton(page).click();
				await runSession(page, 'Review complete');
				await fits(page, 'review: summary');
				await page.goto('/review');
				await expect(page.getByRole('heading', { name: 'All caught up' })).toBeVisible();
				await fits(page, 'review: all caught up');
			});

			await test.step('extra practice, from a question to the summary', async () => {
				await page.goto('/practice');
				await expect(page.getByRole('group', { name: 'Choices' })).toBeVisible();
				await fits(page, 'practice: question');
				await runSession(page, 'Practice complete');
				await fits(page, 'practice: summary');
			});

			await test.step('progress and verses', async () => {
				await page.goto('/progress');
				await expect(page.getByRole('heading', { level: 1, name: 'Your progress' })).toBeVisible();
				await fits(page, 'progress');
				await page.locator('summary', { hasText: 'Surah by surah' }).click();
				await fits(page, 'progress: surah by surah');

				await page.goto('/verses');
				await expect(
					page.getByRole('heading', { level: 1, name: 'Verses you know' })
				).toBeVisible();
				await page.locator('.surahs summary').first().click();
				await expect(page.getByRole('region', { name: /verse \d+$/ }).first()).toBeVisible();
				await fits(page, 'verses: a surah open');
			});

			await test.step('words: the list, a word open, and a search that finds nothing', async () => {
				await page.goto('/words');
				await expect(page.getByRole('heading', { level: 1, name: 'Your words' })).toBeVisible();
				await fits(page, 'words');
				await page.locator('ul.words button.toggle').first().click();
				await expect(page.locator('ul.words').getByRole('region').first()).toBeVisible();
				await fits(page, 'words: a word open');
				await page.getByRole('searchbox', { name: 'Search your words' }).fill('zzzzqq');
				await expect(page.getByText('No words match.')).toBeVisible();
				await fits(page, 'words: nothing found');
			});

			await test.step('settings', async () => {
				await page.goto('/settings');
				await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
				await fits(page, 'settings');
			});
		});

		test('the warning that progress is not being saved fits', async ({ page }) => {
			await useWideFonts(page);
			await page.addInitScript(() => {
				Object.defineProperty(window, 'indexedDB', {
					get() {
						throw new DOMException('The operation is insecure.', 'SecurityError');
					}
				});
			});
			await page.goto('/');
			await expect(page.getByRole('alert')).toContainText('not letting Taysir save your progress');
			await fits(page, 'the storage warning, on the welcome screen');
			await startAsReader(page);
			await fits(page, 'the storage warning, on the lesson list');
		});
	});
}
