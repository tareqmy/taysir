import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { lessons } from '../src/lib/content/course';
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
 * Every screen, checked with axe-core in a phone and a desktop window, in light and dark mode.
 * Nothing is allowed to fail: a problem anywhere fails the test, and every screen is still
 * checked, so one report lists them all.
 */

const modes = [
	{ name: 'phone, light', viewport: { width: 375, height: 812 }, colorScheme: 'light' },
	{ name: 'phone, dark', viewport: { width: 375, height: 812 }, colorScheme: 'dark' },
	{ name: 'desktop, light', viewport: { width: 1280, height: 800 }, colorScheme: 'light' },
	{ name: 'desktop, dark', viewport: { width: 1280, height: 800 }, colorScheme: 'dark' }
] as const;

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function audit(page: Page, screen: string) {
	const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
	expect
		.soft(
			violations.map(
				(v) =>
					`${v.id} (${v.impact}): ${v.help}. ${v.nodes.length} place(s), first at ${v.nodes[0].target.join(' ')}`
			),
			`${screen}: accessibility problems`
		)
		.toEqual([]);
}

// A lesson with a listening question, so that screen is checked too.
const lesson = lessons.find((l) =>
	l.exercises.some((e) => e.listening && e.id.startsWith('listen:'))
)!;
const listenAt = lesson.exercises.findIndex((e) => e.listening);

for (const mode of modes) {
	test.describe(mode.name, () => {
		test.use({ viewport: mode.viewport, colorScheme: mode.colorScheme });

		test('every screen has no accessibility problems', async ({ page }) => {
			test.setTimeout(120_000);
			const seed = seededLearner({ due: 3 });

			await test.step('welcome and about, before a starting point is chosen', async () => {
				await page.goto('/');
				await expect(
					page.getByRole('heading', { name: 'Where would you like to start?' })
				).toBeVisible();
				await audit(page, 'welcome: choose a starting point');
				await page.getByRole('button', { name: /I can read the Quran/ }).click();
				await expect(
					page.getByRole('heading', { name: 'How much would you like to do each day?' })
				).toBeVisible();
				await audit(page, 'welcome: choose a goal');
				await page.goto('/about');
				await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
				await audit(page, 'about');
			});

			await test.step('settings, while restoring saved progress', async () => {
				await startAsReader(page);
				await chooseBackupFile(page, JSON.stringify(seed.backup));
				await expect(page.getByRole('group', { name: 'Confirm restore' })).toBeVisible();
				await audit(page, 'settings: confirm restore');
				await page.getByRole('button', { name: 'Replace my progress with this backup' }).click();
				await expect(page.getByText('Your progress has been restored.')).toBeVisible();
				await audit(page, 'settings: restored');
			});

			await test.step('lesson list', async () => {
				await page.goto('/');
				await expect(page.getByRole('heading', { name: 'Your lessons' })).toBeAttached();
				await audit(page, 'home');
			});

			await test.step('a lesson, from the reading to the end', async () => {
				await page.goto(`/lesson/${lesson.id}`);
				await expect(page.getByRole('heading', { level: 1, name: lesson.title })).toBeVisible();
				await audit(page, 'lesson: reading');
				for (let step = 1; step < lesson.intro.length; step++) {
					await page.getByRole('button', { name: 'Continue' }).click();
				}
				await page.getByRole('button', { name: 'Start practice' }).click();
				await expect(page.getByRole('progressbar', { name: 'Progress' })).toBeVisible();
				await audit(page, 'lesson: first question');

				await answerAll(page, lesson.exercises.slice(0, listenAt));
				await expect(page.getByRole('region', { name: 'Listening question' })).toBeVisible();
				await audit(page, 'lesson: listening question');
				await answerExercise(page, lesson.exercises[listenAt]);
				await expect(continueButton(page)).toBeVisible();
				await audit(page, 'lesson: answer feedback');
				await continueButton(page).click();
				await answerAll(page, lesson.exercises.slice(listenAt + 1));
				await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
				await audit(page, 'lesson: complete');
			});

			await test.step('review, from a question to the summary', async () => {
				await page.goto('/review');
				const choices = page.getByRole('group', { name: 'Choices' });
				await expect(choices).toBeVisible();
				await audit(page, 'review: question');
				await choices.getByRole('button').first().click();
				await expect(continueButton(page)).toBeVisible();
				await audit(page, 'review: answer feedback');
				await continueButton(page).click();
				await runSession(page, 'Review complete');
				await audit(page, 'review: summary');
				await page.goto('/review');
				await expect(page.getByRole('heading', { name: 'All caught up' })).toBeVisible();
				await audit(page, 'review: all caught up');
			});

			await test.step('extra practice, from a question to the summary', async () => {
				await page.goto('/practice');
				await expect(page.getByRole('group', { name: 'Choices' })).toBeVisible();
				await audit(page, 'practice: question');
				await runSession(page, 'Practice complete');
				await audit(page, 'practice: summary');
			});

			await test.step('progress and verses', async () => {
				await page.goto('/progress');
				await expect(page.getByRole('heading', { level: 1, name: 'Your progress' })).toBeVisible();
				await page.locator('summary', { hasText: 'Surah by surah' }).click();
				await audit(page, 'progress');

				await page.goto('/verses');
				await expect(
					page.getByRole('heading', { level: 1, name: 'Verses you know' })
				).toBeVisible();
				await page.locator('.surahs summary').first().click();
				await expect(page.getByRole('region', { name: /verse \d+$/ }).first()).toBeVisible();
				await audit(page, 'verses: a surah open');
			});
		});
	});
}
