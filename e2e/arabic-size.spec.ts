import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';
import { lessons } from '../src/lib/content/course';
import { surahName, verseData } from '../src/lib/data';
import { defaultMeta } from '../src/lib/progress/store';
import {
	answerExercise,
	continueButton,
	restoreProgress,
	startAsReader,
	startWithProgress
} from './support/learner';
import { layoutProblems, useWideFonts, widestWords, withBigText } from './support/layout';
import { seededLearner } from './support/seed';
import { expect, test } from './support/test';

/** Open Settings and wait for it to be drawn, so there is something to measure. */
async function openSettings(page: Page) {
	await page.goto('/settings');
	await expect(page.getByRole('heading', { level: 2, name: 'Arabic text size' })).toBeVisible();
}

const chooseSize = (page: Page, label: string) =>
	page.getByRole('radio', { name: new RegExp(`^${label}\\b`) }).check();

/** The size of the Arabic and of the English gloss under it, in the preview verse in Settings. */
async function previewSizes(page: Page) {
	return page.evaluate(() => {
		const preview = document.querySelector('section[aria-label$="verse 1"] .word')!;
		const px = (el: Element) => parseFloat(getComputedStyle(el).fontSize);
		return {
			arabic: px(preview.querySelector('.ar')!),
			english: px(preview.querySelector('.gloss')!)
		};
	});
}

/** Every piece of Arabic in the page's main content, with its size. */
async function arabicSizes(page: Page) {
	return page.evaluate(() =>
		[...document.querySelectorAll('main .ar')].map((el) => ({
			text: el.textContent!.trim(),
			kind: el.className,
			px: parseFloat(getComputedStyle(el).fontSize)
		}))
	);
}

test.describe('the Arabic text size', () => {
	test('makes the Arabic bigger or smaller, leaves the English alone, and stays after a reload', async ({
		page
	}) => {
		await startAsReader(page);
		await openSettings(page);
		const standard = await previewSizes(page);
		await expect(page.getByRole('radio', { name: /Standard/ })).toBeChecked();

		await chooseSize(page, 'Largest');
		const largest = await previewSizes(page);
		expect(largest.arabic / standard.arabic).toBeCloseTo(1.5, 2);
		expect(largest.english).toBe(standard.english);

		await chooseSize(page, 'Smaller');
		const smaller = await previewSizes(page);
		expect(smaller.arabic / standard.arabic).toBeCloseTo(0.9, 2);

		await chooseSize(page, 'Large');
		await page.reload();
		await expect(page.getByRole('heading', { level: 2, name: 'Arabic text size' })).toBeVisible();
		await expect(page.getByRole('radio', { name: /^Large\b/ })).toBeChecked();
		const reloaded = await previewSizes(page);
		expect(reloaded.arabic / standard.arabic).toBeCloseTo(1.25, 2);
		expect(reloaded.english).toBe(standard.english);
	});

	test('is also applied on the other screens, not just the preview', async ({ page }) => {
		await startAsReader(page);
		await openSettings(page);
		await chooseSize(page, 'Largest');
		// A different page, loaded fresh: the same scale reaches the whole app through one variable.
		await page.goto('/about');
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		const scale = await page.evaluate(() =>
			document.documentElement.style.getPropertyValue('--ar-scale')
		);
		expect(scale).toBe('1.5');
	});

	test('reaches every piece of Arabic in a lesson, the root letters and the Arabic in explanations too', async ({
		page
	}) => {
		// A lesson on a root, whose letters are shown large, and one whose rules quote Arabic words.
		const picked = ['root-rhm', 'grammar-definite'].map((id) => lessons.find((l) => l.id === id)!);
		const lessonsDone = Math.max(...picked.map((lesson) => lessons.indexOf(lesson))) + 1;
		await startWithProgress(page, seededLearner({ lessonsDone }).backup);

		const sizesAt = async (size: string | undefined) => {
			await page.evaluate((size) => {
				if (size) localStorage.setItem('taysir.arabicSize', size);
				else localStorage.removeItem('taysir.arabicSize');
			}, size);
			const sizes: (Awaited<ReturnType<typeof arabicSizes>>[number] & { where: string })[] = [];
			for (const lesson of picked) {
				await page.goto(`/lesson/${lesson.id}`);
				await expect(page.getByRole('heading', { level: 1, name: lesson.title })).toBeVisible();
				for (let step = 0; step < lesson.intro.length; step++) {
					const where = `${lesson.id}, reading step ${step + 1}`;
					sizes.push(...(await arabicSizes(page)).map((found) => ({ ...found, where })));
					if (step < lesson.intro.length - 1) {
						await page.getByRole('button', { name: 'Continue' }).click();
					}
				}
			}
			return sizes;
		};
		const standard = await sizesAt(undefined);
		const largest = await sizesAt('largest');

		expect(largest.map((found) => found.text)).toEqual(standard.map((found) => found.text));
		// Both kinds were found, so this cannot pass by measuring nothing.
		expect(standard.filter((found) => found.kind.includes('big'))).not.toHaveLength(0);
		expect(standard.filter((found) => found.kind.includes('inline-ar'))).not.toHaveLength(0);
		const unscaled = standard
			.filter((found, i) => Math.abs(largest[i].px / found.px - 1.5) > 0.01)
			.map((found) => `${found.where}: ${found.text} (${found.kind})`);
		expect(unscaled, 'Arabic that stays the same size at Largest').toEqual([]);
	});

	test('belongs to the device: a backup neither holds it nor changes it', async ({ page }) => {
		const seed = seededLearner({ lessonsDone: 12 });
		await startAsReader(page);
		await openSettings(page);
		await chooseSize(page, 'Largest');

		await restoreProgress(page, seed.backup);
		await expect(page.getByRole('radio', { name: /Largest/ })).toBeChecked();

		const download = page.waitForEvent('download');
		await page.getByRole('button', { name: 'Download backup' }).click();
		const saved = JSON.parse(await readFile((await (await download).path())!, 'utf8'));
		// Only the progress fields, which are the defaults and the starting-point choice.
		expect(Object.keys(saved.meta).sort()).toEqual(
			[...Object.keys(defaultMeta()), 'placement'].sort()
		);
		expect(JSON.stringify(saved)).not.toMatch(/largest/);
	});

	test('with the browser refusing storage, still works for the visit', async ({ page }) => {
		await page.addInitScript(() => {
			Object.defineProperty(window, 'localStorage', {
				get() {
					throw new Error('storage is blocked');
				}
			});
		});
		await startAsReader(page);
		await openSettings(page);
		await chooseSize(page, 'Largest');
		await expect(page.getByRole('radio', { name: /Largest/ })).toBeChecked();
		const scale = await page.evaluate(() =>
			document.documentElement.style.getPropertyValue('--ar-scale')
		);
		expect(scale).toBe('1.5');
	});
});

test.describe('at the largest Arabic size on a phone', () => {
	test.use({ viewport: { width: 375, height: 812 } });

	// Nothing may scroll sideways or break a word, at normal text and with text scaled to 200%.
	test('nothing overflows, even in the lessons with the widest words', async ({ page }) => {
		test.setTimeout(240_000);
		await page.addInitScript(() => localStorage.setItem('taysir.arabicSize', 'largest'));
		await useWideFonts(page);

		await page.goto('/about');
		const widest = await widestWords(page, 8);
		const refs = new Set(
			verseData.verses
				.filter((v) => v.words.some((w) => widest.includes(w.text)))
				.map((v) => `${v.surah}:${v.ayah}`)
		);
		const showWidest = lessons.filter((l) =>
			l.intro.some(
				(b) => (b.type === 'verse' || b.type === 'phrase') && refs.has(`${b.surah}:${b.ayah}`)
			)
		);
		const picked = [
			...new Set([
				...showWidest.slice(0, 4),
				...lessons.filter((l) =>
					['letters-1', 'letters-4', 'root-rhm', 'fatiha-1', 'grammar-prepositions'].includes(l.id)
				)
			])
		];
		expect(showWidest.length, 'some lesson should show the widest words').toBeGreaterThan(0);

		await startWithProgress(page, seededLearner({ lessonsDone: lessons.length - 1 }).backup);

		const problems: string[] = [];
		const check = async (screen: string) => {
			const normal = await layoutProblems(page, 375);
			const big = await withBigText(page, () => layoutProblems(page, 375));
			problems.push(
				...normal.map((p) => `${screen}: ${p}`),
				...big.map((p) => `${screen} (text 200%): ${p}`)
			);
		};

		for (const lesson of picked) {
			await page.goto(`/lesson/${lesson.id}`);
			await expect(page.getByRole('heading', { level: 1, name: lesson.title })).toBeVisible();
			for (let step = 0; step < lesson.intro.length; step++) {
				await check(`${lesson.id}, reading step ${step + 1}`);
				if (step < lesson.intro.length - 1) {
					await page.getByRole('button', { name: 'Continue' }).click();
				}
			}
			await page.getByRole('button', { name: 'Start practice' }).click();
			for (const [i, exercise] of lesson.exercises.entries()) {
				await expect(page.getByRole('progressbar', { name: 'Progress' })).toBeVisible();
				await check(`${lesson.id}, question ${i + 1} (${exercise.id})`);
				await answerExercise(page, exercise);
				await continueButton(page).click();
			}
		}

		// The page that lists verses, with the surah that holds a widest word open.
		const [surah] = [...refs].map((ref) => Number(ref.split(':')[0]));
		await page.goto('/verses');
		await page
			.locator('.surahs summary', { hasText: surahName(surah) })
			.first()
			.click();
		await check(`the verses page, with ${surahName(surah)} open`);
		await page.goto('/settings');
		await check('settings, with its preview verse');

		expect(problems, 'screens where the Arabic does not fit').toEqual([]);
	});
});
