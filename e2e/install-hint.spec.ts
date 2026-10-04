import type { Page } from '@playwright/test';
import { audit } from './support/axe';
import { layoutProblems, useWideFonts, withBigText } from './support/layout';
import { startAsReader, startWithProgress } from './support/learner';
import { seededLearner } from './support/seed';
import { expect, test } from './support/test';

/**
 * The offer to put Taysir on a home screen: a card on the home screen once a first lesson is done,
 * and a section in Settings. A real browser decides for itself when to hand the page its install
 * prompt, which no test can wait for, so these send the page the same event Chrome does.
 */

const IPHONE =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const PHONE = { width: 375, height: 812 };

type Probe = { installPrompts: number; offered: Event };

/** The browser offers its install prompt, as Chrome does once it finds the app installable. */
async function offerInstall(page: Page) {
	await page.evaluate(() => {
		const event = new Event('beforeinstallprompt', { cancelable: true });
		const probe: Probe = { installPrompts: 0, offered: event };
		Object.assign(event, {
			prompt: async () => void probe.installPrompts++,
			userChoice: Promise.resolve({ outcome: 'accepted' })
		});
		(window as unknown as { probe: Probe }).probe = probe;
		window.dispatchEvent(event);
	});
}

/** How many times the app has brought up the browser's install prompt. */
const promptsShown = (page: Page) =>
	page.evaluate(() => (window as unknown as { probe: Probe }).probe.installPrompts);

/** Whether the app kept the browser from showing its own install banner. */
const heldBack = (page: Page) =>
	page.evaluate(() => (window as unknown as { probe: Probe }).probe.offered.defaultPrevented);

/** The learner starts, and has finished one lesson. */
const afterFirstLesson = (page: Page) =>
	startWithProgress(page, seededLearner({ lessonsDone: 1 }).backup);

const card = (page: Page) => page.getByRole('region', { name: 'Keep Taysir at hand' });
const section = (page: Page) => page.getByRole('region', { name: 'Install Taysir' });
const installButton = (page: Page) => page.getByRole('button', { name: 'Install Taysir' });

/** By its link, because loading Settings afresh would lose the event the browser sent. */
async function openSettings(page: Page) {
	await page
		.getByRole('navigation', { name: 'Main' })
		.getByRole('link', { name: 'Settings' })
		.click();
	await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
}

test.describe('where the browser offers to install', () => {
	test('waits for a first lesson before it puts a card on the home screen', async ({ page }) => {
		await startAsReader(page);
		await offerInstall(page);
		// Nothing has been learned yet, so there is nothing yet worth keeping close.
		await expect(card(page)).toHaveCount(0);
		// Settings has it for anyone who goes looking.
		await openSettings(page);
		await expect(section(page).getByRole('button', { name: 'Install Taysir' })).toBeVisible();
	});

	test('then offers a button that brings up the browser’s prompt', async ({ page }) => {
		await afterFirstLesson(page);
		await offerInstall(page);
		await expect(card(page)).toBeVisible();
		await expect(card(page)).toContainText('Install Taysir to open it like any other app');
		// The browser's own banner is held back, so it does not appear over a lesson.
		expect(await heldBack(page)).toBe(true);

		await card(page).getByRole('button', { name: 'Install Taysir' }).click();
		await expect.poll(() => promptsShown(page)).toBe(1);
		// The browser's prompt can be used once, so there is no second button.
		await expect(card(page)).toHaveCount(0);

		// Once the browser says it is installed, Settings says so rather than offering again.
		await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
		await openSettings(page);
		await expect(section(page)).toContainText('You are using Taysir as an installed app.');
		await expect(installButton(page)).toHaveCount(0);
	});

	test('"Not now" puts the card away for good, and Settings still has the button', async ({
		page
	}) => {
		await afterFirstLesson(page);
		await offerInstall(page);
		await card(page).getByRole('button', { name: 'Not now' }).click();
		await expect(card(page)).toHaveCount(0);

		await page.reload();
		await expect(page.getByRole('heading', { name: 'Your lessons' })).toBeAttached();
		await offerInstall(page);
		await expect(card(page)).toHaveCount(0);

		await openSettings(page);
		await expect(section(page).getByRole('button', { name: 'Install Taysir' })).toBeVisible();
	});
});

test.describe('where the browser does not offer', () => {
	test('says so in Settings, and puts no card on the home screen', async ({ page }) => {
		await afterFirstLesson(page);
		await expect(card(page)).toHaveCount(0);
		await openSettings(page);
		await expect(section(page)).toContainText('not offering to install Taysir right now');
		await expect(installButton(page)).toHaveCount(0);
	});
});

test.describe('on an iPhone', () => {
	test.use({ userAgent: IPHONE, viewport: PHONE });

	test('gives the steps instead of a button, and warns that the home-screen app starts empty', async ({
		page
	}) => {
		await useWideFonts(page);
		await afterFirstLesson(page);
		await expect(card(page)).toBeVisible();
		await expect(card(page).getByRole('listitem')).toHaveText([
			'In Safari, tap the Share button, the square with an arrow.',
			'Choose “Add to Home Screen”.',
			'Tap “Add”.'
		]);
		await expect(installButton(page)).toHaveCount(0);
		await expect(card(page)).toContainText('starts empty');

		// It all fits a phone, even at twice the text size.
		expect(await withBigText(page, () => layoutProblems(page, PHONE.width))).toEqual([]);

		// The way out of the empty start is a link away on the home screen.
		await card(page).getByRole('link', { name: 'Download a backup in Settings' }).click();
		await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
		await expect(section(page)).toContainText('Download a backup below first');
		await expect(section(page).getByRole('listitem')).toHaveCount(3);
		expect(await withBigText(page, () => layoutProblems(page, PHONE.width))).toEqual([]);

		// "Not now" holds here too.
		await page.getByRole('link', { name: 'Taysir' }).click();
		await card(page).getByRole('button', { name: 'Not now' }).click();
		await expect(card(page)).toHaveCount(0);
		await page.reload();
		await expect(page.getByRole('heading', { name: 'Your lessons' })).toBeAttached();
		await expect(card(page)).toHaveCount(0);
	});

	test('has nothing to say in the app on its home screen', async ({ page }) => {
		await page.addInitScript(() =>
			Object.defineProperty(navigator, 'standalone', { value: true, configurable: true })
		);
		await afterFirstLesson(page);
		await expect(card(page)).toHaveCount(0);
		await openSettings(page);
		await expect(section(page)).toContainText('You are using Taysir as an installed app.');
		await expect(section(page).getByRole('listitem')).toHaveCount(0);
	});
});

test('has nothing to say in an installed app window, even if the browser offers', async ({
	page
}) => {
	await page.addInitScript(() => {
		const real = window.matchMedia.bind(window);
		window.matchMedia = (query) => {
			const list = real(query);
			if (!query.includes('display-mode: standalone')) return list;
			return Object.defineProperty(list, 'matches', { value: true });
		};
	});
	await afterFirstLesson(page);
	await offerInstall(page);
	await expect(card(page)).toHaveCount(0);
	await openSettings(page);
	await expect(section(page)).toContainText('You are using Taysir as an installed app.');
});

// Every way the offer appears, on a phone, in both colour schemes.
for (const colorScheme of ['light', 'dark'] as const) {
	test.describe(`accessibility, ${colorScheme}`, () => {
		test.use({ colorScheme, viewport: PHONE });

		test('the button, on the home screen and in Settings', async ({ page }) => {
			await afterFirstLesson(page);
			await offerInstall(page);
			await expect(card(page)).toBeVisible();
			await audit(page, `install card with a button, ${colorScheme}`);
			await openSettings(page);
			await expect(installButton(page)).toBeVisible();
			await audit(page, `install section with a button, ${colorScheme}`);
		});

		test.describe('the steps for an iPhone', () => {
			test.use({ userAgent: IPHONE });

			test('on the home screen and in Settings', async ({ page }) => {
				await afterFirstLesson(page);
				await expect(card(page)).toBeVisible();
				await audit(page, `install card with steps, ${colorScheme}`);
				await openSettings(page);
				await expect(section(page).getByRole('listitem')).toHaveCount(3);
				await audit(page, `install section with steps, ${colorScheme}`);
			});
		});
	});
}
