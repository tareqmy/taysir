import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';
import { lessons, readerSkippedLessonIds } from '../src/lib/content/course';
import type { Exercise, Lesson } from '../src/lib/content/types';
import {
	answerAll,
	chooseBackupFile,
	continueButton,
	startAsReader,
	startWithProgress
} from './support/learner';
import { auditTabOrder, answerByKeyboard, press, tabTo } from './support/keyboard';
import { seededLearner } from './support/seed';
import { expect, test } from './support/test';

/**
 * The app used with the keyboard alone. Two kinds of test: an audit that presses Tab through every
 * screen (every control reachable, in the order of the page, with a visible focus that nothing
 * covers, and no trap), and journeys that do real things with Enter, Space and the arrow keys.
 */

const modes = [
	{ name: 'phone', viewport: { width: 375, height: 812 } },
	{ name: 'desktop', viewport: { width: 1280, height: 800 } }
] as const;

/** The most Tab presses it should take to get from one thing to the next on a screen. */
const REASONABLE_PRESSES = 30;

const firstLesson = lessons.find((lesson) => !readerSkippedLessonIds.includes(lesson.id))!;
const kindOf = (kind: Exercise['kind']) => (lesson: Lesson) =>
	lesson.exercises.some((exercise) => exercise.kind === kind);
/** The shortest lesson to use each kind of question in, so every kind is answered by keyboard. */
const lessonsByKind = [
	...new Set(
		(['choose', 'match', 'build', 'tap'] as const).map(
			(kind) =>
				lessons
					.slice(0, -1)
					.filter(kindOf(kind))
					.sort((a, b) => a.exercises.length - b.exercises.length)[0]
		)
	)
];

const listening = lessons.find((l) =>
	l.exercises.some((e) => e.listening && e.id.startsWith('listen:'))
)!;
const listenAt = listening.exercises.findIndex((e) => e.listening);
const grammar = lessons.find((l) => l.id === 'grammar-when-o')!;

/** Read a lesson through by keyboard: Continue stays where it is, so Enter is all it takes. */
async function readByKeyboard(page: Page, lesson: Lesson) {
	await expect(page.getByRole('heading', { level: 1, name: lesson.title })).toBeVisible();
	const next = page.getByRole('button', { name: /^(Continue|Start practice)$/ });
	await press(page, next);
	for (let step = 1; step < lesson.intro.length; step++) {
		// Still on the button after it was pressed: a keyboard user can just press it again.
		await expect(next).toBeFocused();
		await page.keyboard.press('Enter');
	}
	await expect(page.getByRole('progressbar', { name: 'Progress' })).toBeVisible();
}

/** Answer a whole lesson's questions by keyboard, moving on with Continue where focus lands. */
async function doLesson(page: Page, lesson: Lesson, exercises = lesson.exercises) {
	let most = 0;
	for (const [index, exercise] of exercises.entries()) {
		most = Math.max(most, await answerByKeyboard(page, exercise, index % 2 ? 'Space' : 'Enter'));
		// The page puts focus on Continue, so the next thing is a key press away.
		await expect(continueButton(page)).toBeFocused();
		await page.keyboard.press('Enter');
	}
	return most;
}

test.describe('every screen, by the Tab key', () => {
	for (const mode of modes) {
		test(`${mode.name}: every control is reached, seen and not stuck`, async ({ page }) => {
			test.setTimeout(240_000);
			await page.setViewportSize(mode.viewport);
			// Every lesson but the last is done, so each can be opened and the lesson list still has a next one.
			const seed = seededLearner({ lessonsDone: lessons.length - 1, dueWords: 10 });

			await test.step('welcome and about', async () => {
				await page.goto('/');
				await expect(
					page.getByRole('heading', { name: 'Where would you like to start?' })
				).toBeVisible();
				await auditTabOrder(page, 'welcome: choose a starting point');
				await page.getByRole('button', { name: /I can read the Quran/ }).click();
				await expect(
					page.getByRole('heading', { name: 'How much would you like to do each day?' })
				).toBeVisible();
				await auditTabOrder(page, 'welcome: choose a goal');
				await page.goto('/about');
				await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
				await auditTabOrder(page, 'about');
			});

			await test.step('settings, while restoring saved progress', async () => {
				await startAsReader(page);
				await page.goto('/words');
				await expect(page.getByText('Finish a vocabulary lesson')).toBeVisible();
				await auditTabOrder(page, 'words: nothing learned yet');
				await chooseBackupFile(page, JSON.stringify(seed.backup));
				await expect(page.getByRole('group', { name: 'Confirm restore' })).toBeVisible();
				await auditTabOrder(page, 'settings: confirm restore');
				await page.getByRole('button', { name: 'Replace my progress with this backup' }).click();
				await expect(page.getByText('Your progress has been restored.')).toBeVisible();
				await auditTabOrder(page, 'settings: restored');
			});

			await test.step('lesson list', async () => {
				await page.goto('/');
				await expect(page.getByRole('heading', { name: 'Your lessons' })).toBeAttached();
				const { stops } = await auditTabOrder(page, 'home');
				// The first stop is the way past the menu, then the page itself in order.
				expect(stops[0].name).toContain('Skip to content');
				const names = stops.map((stop) => stop.name);
				const at = (text: string) => names.findIndex((name) => name.includes(text));
				expect(at('Review')).toBeLessThan(at('Settings'));
				expect(at('Settings')).toBeLessThan(at('Continue:'));
			});

			await test.step('a lesson, from the reading to the end', async () => {
				await page.goto(`/lesson/${listening.id}`);
				await expect(page.getByRole('heading', { level: 1, name: listening.title })).toBeVisible();
				await auditTabOrder(page, 'lesson: reading');
				for (let step = 1; step < listening.intro.length; step++) {
					await page.getByRole('button', { name: 'Continue' }).click();
				}
				await page.getByRole('button', { name: 'Start practice' }).click();
				await expect(page.getByRole('progressbar', { name: 'Progress' })).toBeVisible();
				await auditTabOrder(page, 'lesson: first question');
				await answerAll(page, listening.exercises.slice(0, listenAt));
				await expect(page.getByRole('region', { name: 'Listening question' })).toBeVisible();
				await auditTabOrder(page, 'lesson: listening question');
			});

			for (const lesson of lessonsByKind.concat(grammar)) {
				await test.step(`questions in ${lesson.id}, before and after answering`, async () => {
					await page.goto(`/lesson/${lesson.id}`);
					await expect(page.getByRole('heading', { level: 1, name: lesson.title })).toBeVisible();
					for (let step = 0; step < lesson.intro.length; step++) {
						await auditTabOrder(page, `${lesson.id}: reading step ${step + 1}`);
						if (step < lesson.intro.length - 1) {
							await page.getByRole('button', { name: 'Continue' }).click();
						}
					}
					await page.getByRole('button', { name: 'Start practice' }).click();
					const seen = new Set<string>();
					for (const exercise of lesson.exercises) {
						if (!seen.has(exercise.kind)) {
							seen.add(exercise.kind);
							await auditTabOrder(page, `${lesson.id}: a ${exercise.kind} question`);
							await answerByKeyboard(page, exercise);
							await auditTabOrder(page, `${lesson.id}: after a ${exercise.kind} answer`);
						} else {
							await answerByKeyboard(page, exercise);
						}
						await continueButton(page).click();
					}
					await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
					await auditTabOrder(page, `${lesson.id}: complete`);
				});
			}

			await test.step('review and extra practice', async () => {
				for (const [path, summary] of [
					['/review', 'Review complete'],
					['/practice', 'Practice complete']
				] as const) {
					await page.goto(path);
					const choices = page.getByRole('group', { name: 'Choices' });
					await expect(choices).toBeVisible();
					await auditTabOrder(page, `${path}: question`);
					await choices.getByRole('button').first().click();
					await expect(continueButton(page)).toBeVisible();
					await auditTabOrder(page, `${path}: answer feedback`);
					await continueButton(page).click();
					const done = page.getByRole('heading', { name: summary });
					for (let n = 0; n < 40 && !(await done.isVisible()); n++) {
						await choices.getByRole('button').first().click();
						await continueButton(page).click();
						await expect(choices.or(done)).toBeVisible();
					}
					await auditTabOrder(page, `${path}: summary`);
				}
				await page.goto('/review');
				await expect(page.getByRole('heading', { name: 'All caught up' })).toBeVisible();
				await auditTabOrder(page, 'review: all caught up');
			});

			await test.step('progress, verses, words and settings', async () => {
				await page.goto('/progress');
				await expect(page.getByRole('heading', { level: 1, name: 'Your progress' })).toBeVisible();
				await page.locator('summary', { hasText: 'Surah by surah' }).click();
				await auditTabOrder(page, 'progress');

				await page.goto('/verses');
				await expect(
					page.getByRole('heading', { level: 1, name: 'Verses you know' })
				).toBeVisible();
				await page.locator('.surahs summary').first().click();
				await expect(page.getByRole('region', { name: /verse \d+$/ }).first()).toBeVisible();
				await auditTabOrder(page, 'verses: a surah open');

				await page.goto('/words');
				await expect(page.getByRole('heading', { level: 1, name: 'Your words' })).toBeVisible();
				// A third of the list, so the audit is not over a thousand key presses long three times
				// over. The whole list is walked in the words journey below.
				await page.getByRole('radio', { name: /^Well known\b/ }).check();
				await auditTabOrder(page, 'words');
				await page.locator('ul.words button.toggle').first().click();
				await expect(page.locator('ul.words').getByRole('region').first()).toBeVisible();
				await auditTabOrder(page, 'words: a word open');
				await page.getByRole('searchbox', { name: 'Search your words' }).fill('zzzzqq');
				await expect(page.getByText('No words match.')).toBeVisible();
				await auditTabOrder(page, 'words: nothing found');

				await page.goto('/settings');
				await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
				await auditTabOrder(page, 'settings');
			});
		});
	}
});

test.describe('doing things by keyboard', () => {
	test('the skip link takes the next Tab into the page, past the menu', async ({ page }) => {
		await page.goto('/about');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await page.keyboard.press('Tab');
		const skip = page.getByRole('link', { name: 'Skip to content' });
		await expect(skip).toBeFocused();
		await expect(skip).toBeInViewport();

		await page.keyboard.press('Enter');
		await page.keyboard.press('Tab');
		const inPage = await page.evaluate(() => document.activeElement?.closest('main#main') !== null);
		expect(inPage, 'the next Tab should land inside the main part of the page').toBe(true);
	});

	test('a new learner starts and finishes a lesson with no mouse', async ({ page }) => {
		test.setTimeout(120_000);
		const presses: number[] = [];

		await test.step('choose a starting point and a goal', async () => {
			await page.goto('/');
			await expect(page).toHaveURL(/\/welcome$/);
			presses.push(await press(page, page.getByRole('button', { name: /I can read the Quran/ })));
			// Tab reaches the checked radio button of the group; the arrow keys move within it.
			presses.push(await tabTo(page, page.getByRole('radio', { name: /Steady/ })));
			await page.keyboard.press('ArrowUp');
			await expect(page.getByRole('radio', { name: /Relaxed/ })).toBeChecked();
			await expect(page.getByRole('radio', { name: /Relaxed/ })).toBeFocused();
			presses.push(await press(page, page.getByRole('button', { name: 'Start learning' })));
			await expect(page).toHaveURL(/\/$/);
			await expect(page.getByText('0 of 5 exercises today')).toBeVisible();
		});

		await test.step('open the lesson, read it, and answer every question', async () => {
			presses.push(
				await press(page, page.getByRole('link', { name: `Continue: ${firstLesson.title}` }))
			);
			await readByKeyboard(page, firstLesson);
			presses.push(await doLesson(page, firstLesson));
		});

		await test.step('land on the result, and carry on from there', async () => {
			// The page puts focus on the heading that says the lesson is done.
			await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeFocused();
			presses.push(await press(page, page.getByRole('link', { name: /^Next: |^Back to lessons/ })));
			await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(firstLesson.title);
		});

		expect(Math.max(...presses), 'Tab presses to reach a control').toBeLessThanOrEqual(
			REASONABLE_PRESSES
		);
	});

	test('every kind of question can be answered with Enter and Space', async ({ page }) => {
		test.setTimeout(240_000);
		const seed = seededLearner({ lessonsDone: lessons.length });
		await startWithProgress(page, seed.backup);

		const answered = new Set<string>();
		let most = 0;
		for (const lesson of lessonsByKind) {
			await page.goto(`/lesson/${lesson.id}`);
			await readByKeyboard(page, lesson);
			most = Math.max(most, await doLesson(page, lesson));
			await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeFocused();
			for (const exercise of lesson.exercises) answered.add(exercise.kind);
		}
		expect([...answered].sort(), 'every kind of question was answered').toEqual([
			'build',
			'choose',
			'match',
			'tap'
		]);
		expect(most, 'Tab presses to reach a control').toBeLessThanOrEqual(REASONABLE_PRESSES);
	});

	test('a listening question can be skipped from the keyboard', async ({ page }) => {
		await startWithProgress(page, seededLearner({ lessonsDone: lessons.length }).backup);

		await page.goto(`/lesson/${listening.id}`);
		await readByKeyboard(page, listening);
		await doLesson(page, listening, listening.exercises.slice(0, listenAt));
		await expect(page.getByRole('region', { name: 'Listening question' })).toBeVisible();

		// This lesson asks two listening questions one after the other: skip each.
		const ahead = listening.exercises.slice(listenAt);
		const skipped = ahead.findIndex((e) => !e.listening);
		for (let n = 0; n < skipped; n++) {
			await expect(page.getByRole('region', { name: 'Listening question' })).toBeVisible();
			await press(page, page.getByRole('button', { name: 'I can’t listen right now' }));
		}
		await expect(page.getByRole('region', { name: 'Listening question' })).toHaveCount(0);
		// On to the next question, which can be answered as usual.
		await answerByKeyboard(page, ahead[skipped]);
		await expect(continueButton(page)).toBeFocused();
	});

	test('a review is done from the menu to the summary, with no mouse', async ({ page }) => {
		test.setTimeout(120_000);
		await startWithProgress(page, seededLearner({ dueWords: 10 }).backup);

		await press(
			page,
			page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /^Review/ })
		);
		const choices = page.getByRole('group', { name: 'Choices' });
		const summary = page.getByRole('heading', { name: 'Review complete' });
		let most = 0;
		for (let questions = 0; questions < 40; questions++) {
			await expect(choices.or(summary)).toBeVisible();
			if (await summary.isVisible()) break;
			most = Math.max(most, await press(page, choices.getByRole('button').first()));
			await expect(continueButton(page)).toBeFocused();
			await page.keyboard.press('Enter');
		}
		await expect(summary).toBeFocused();
		expect(most, 'Tab presses to reach a choice').toBeLessThanOrEqual(REASONABLE_PRESSES);
	});

	test('the words page: search, narrow, and open a word', async ({ page }) => {
		await startWithProgress(page, seededLearner().backup);
		await page.goto('/words');
		await expect(page.getByRole('heading', { level: 1, name: 'Your words' })).toBeVisible();

		const rows = page.locator('ul.words > li');
		const all = await rows.count();

		await tabTo(page, page.getByRole('searchbox', { name: 'Search your words' }));
		await page.keyboard.type('zzzzqq');
		await expect(page.getByText('No words match.')).toBeVisible();
		await press(page, page.getByRole('button', { name: 'Show all my words' }));
		await expect(rows).toHaveCount(all);

		// The level filter is a radio group: Tab enters it, the arrow keys choose.
		await tabTo(page, page.getByRole('radio', { name: /^All\b/ }));
		await page.keyboard.press('ArrowRight');
		await expect(page.getByRole('radio', { name: /^Learning\b/ })).toBeChecked();
		await expect(rows).not.toHaveCount(all);
		await page.keyboard.press('ArrowLeft');
		await expect(rows).toHaveCount(all);

		// A word opens with Enter and closes with Space, and the next Tab goes into what opened.
		const first = rows.first();
		const toggle = first.locator('button.toggle');
		await tabTo(page, toggle);
		await page.keyboard.press('Enter');
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		await expect(first.getByRole('region')).toBeVisible();
		await page.keyboard.press('Tab'); // the speaker for the word
		await page.keyboard.press('Tab'); // into the verse
		const inside = await page.evaluate(
			() => document.activeElement?.closest('ul.words > li .panel') !== null
		);
		expect(inside, 'Tab should go into the opened word').toBe(true);
		// Back out of it with Shift+Tab, to the word itself.
		for (
			let back = 0;
			back < 10 && !(await toggle.evaluate((el) => el === document.activeElement));
			back++
		) {
			await page.keyboard.press('Shift+Tab');
		}
		await expect(toggle).toBeFocused();
		await page.keyboard.press('Space');
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect(first.getByRole('region')).toHaveCount(0);
	});

	test('settings: the choices, the download and the file chooser', async ({ page }) => {
		await startAsReader(page);
		await page.goto('/settings');
		await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();

		await tabTo(page, page.getByRole('radio', { name: /Standard/ }));
		await page.keyboard.press('ArrowRight');
		await expect(page.getByRole('radio', { name: /^Large\b/ })).toBeChecked();
		const scale = () =>
			page.evaluate(() =>
				getComputedStyle(document.documentElement).getPropertyValue('--ar-scale')
			);
		expect(Number(await scale())).toBeCloseTo(1.25, 2);

		const download = page.waitForEvent('download');
		await press(page, page.getByRole('button', { name: 'Download backup' }));
		expect(JSON.parse(await readFile((await (await download).path())!, 'utf8'))).toBeTruthy();

		const chooser = page.waitForEvent('filechooser');
		await tabTo(page, page.locator('input[type=file]'));
		await page.keyboard.press('Space');
		await chooser;
	});
});
