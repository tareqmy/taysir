import type { Page } from '@playwright/test';
import { audit } from './support/axe';
import { layoutProblems, useWideFonts, withBigText } from './support/layout';
import { startAsReader } from './support/learner';
import { expect, test } from './support/served';
import type { Site } from './support/site';

/**
 * The offer to update the app, with the real service worker taking the real steps: a first install,
 * a redeploy at the same address, the new version downloading in the background, and the learner
 * choosing to switch. The app is served from `support/site.ts`, which can publish a new version.
 */

// These tests are about the worker, which every other test keeps out of the way.
test.use({ serviceWorkers: 'allow' });
// A service worker to install and a redeploy to find, twice over in places: allow for a slower machine.
test.describe.configure({ timeout: 90_000 });

const banner = (page: Page) => page.getByRole('complementary', { name: 'Update available' });
const updateNow = (page: Page) => banner(page).getByRole('button', { name: 'Update now' });

/** The version caches the offline worker holds, which are named for the version. */
const cacheNames = (page: Page) =>
	page.evaluate(async () => (await caches.keys()).filter((k) => k.startsWith('taysir-')).sort());

/** The version this page was built as, which the page itself carries. */
const pageVersion = (page: Page) =>
	page.evaluate(() => {
		const key = Object.keys(window).find((k) => k.startsWith('__sveltekit_'))!;
		return (window as unknown as Record<string, { version: string }>)[key].version;
	});

/** As the app does when a page left open comes back into view: it asks for a new version. */
const checkForUpdate = (page: Page) =>
	page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));

/** An installed app: the learner has started, and the worker has installed and taken control. */
async function openInstalled(page: Page, site: Site) {
	await startAsReader(page);
	await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
	await expect.poll(() => cacheNames(page)).toEqual([`taysir-${site.version}`]);
}

/** Publish a new version and let the open page find out about it. Says what the new version is. */
async function deployAndNotice(page: Page, site: Site) {
	const next = await site.deploy();
	await checkForUpdate(page);
	await expect(banner(page)).toBeVisible({ timeout: 15_000 });
	return next;
}

/**
 * Switch the colour scheme and wait for the buttons' colour fade to finish. Checked halfway through
 * the fade, a button's colours are neither scheme's and contrast is measured on that.
 */
async function useColorScheme(page: Page, colorScheme: 'light' | 'dark') {
	await page.emulateMedia({ colorScheme });
	await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
}

/** Mark a page, so that a test can tell afterwards whether it has been reloaded. */
const mark = (page: Page) =>
	page.evaluate(() => ((window as unknown as { marked: boolean }).marked = true));
const isMarked = (page: Page) =>
	page.evaluate(() => (window as unknown as { marked?: boolean }).marked === true);

test('says nothing on a first visit, or when nothing new has been deployed', async ({
	page,
	site
}) => {
	await openInstalled(page, site);
	await expect(banner(page)).toHaveCount(0);

	await page.reload();
	await expect(page.getByRole('heading', { name: 'Your lessons' })).toBeAttached();
	await checkForUpdate(page);
	// The browser looked again and found the same worker: nothing is waiting.
	const waiting = await page.evaluate(async () => {
		const registration = (await navigator.serviceWorker.getRegistration())!;
		await registration.update();
		return registration.waiting !== null || registration.installing !== null;
	});
	expect(waiting).toBe(false);
	await expect(banner(page)).toHaveCount(0);
});

test('offers a new version without disturbing the page, then switches when asked', async ({
	page,
	site
}) => {
	await openInstalled(page, site);
	const first = site.version;

	const next = await deployAndNotice(page, site);
	expect(next).not.toBe(first);
	await expect(banner(page)).toContainText('A new version of Taysir is ready.');
	await expect(page.getByText('A new version of Taysir is ready.').first()).toBeVisible();

	// The page that is open still runs the old version, and its offline files are still the old ones.
	expect(await pageVersion(page)).toBe(first);
	await expect.poll(() => cacheNames(page)).toEqual([`taysir-${first}`, `taysir-${next}`].sort());

	// The old page keeps working: moving around the app loads what it needs, and the offer follows.
	await page.getByRole('link', { name: 'Settings' }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
	await expect(banner(page)).toBeVisible();

	// Partway through a lesson, the offer says what updating costs.
	await page.goto('/');
	await page.getByRole('link', { name: /^Continue:/ }).click();
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	await expect(banner(page)).toContainText('Updating restarts what you are doing now.');

	// It is accessible in both colour schemes.
	await useColorScheme(page, 'light');
	await audit(page, 'update offer, light');
	await useColorScheme(page, 'dark');
	await audit(page, 'update offer, dark');
	await useColorScheme(page, 'light');

	// Switching reloads the page onto the new version, and the old files are cleared away.
	await mark(page);
	await updateNow(page).click();
	await page.waitForFunction(() => !(window as unknown as { marked?: boolean }).marked);
	await expect.poll(() => pageVersion(page)).toBe(next);
	await expect(banner(page)).toHaveCount(0);
	await expect.poll(() => cacheNames(page)).toEqual([`taysir-${next}`]);
	// And it is a working app, not just a reloaded page.
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('"Later" puts the offer away, and it comes back on the next visit', async ({ page, site }) => {
	await openInstalled(page, site);
	const first = site.version;
	await deployAndNotice(page, site);

	await banner(page).getByRole('button', { name: 'Later' }).click();
	await expect(banner(page)).toHaveCount(0);
	// Putting it off changes nothing: this page is still on the old version.
	expect(await pageVersion(page)).toBe(first);

	await page.reload();
	await expect(banner(page)).toBeVisible({ timeout: 15_000 });
});

test('switching in one tab leaves another open tab alone, which can still switch', async ({
	page,
	context,
	site
}) => {
	await openInstalled(page, site);
	const other = await context.newPage();
	await other.goto('/about');
	await other.waitForFunction(() => navigator.serviceWorker.controller !== null);
	await expect(other.getByRole('heading', { level: 1 })).toBeVisible();

	const next = await deployAndNotice(page, site);
	await expect(banner(other)).toBeVisible({ timeout: 15_000 });
	await mark(page);
	await mark(other);

	await updateNow(page).click();
	await page.waitForFunction(() => !(window as unknown as { marked?: boolean }).marked);

	// The worker has switched for every tab, but the other tab was not reloaded under the learner.
	await expect
		.poll(() =>
			other.evaluate(
				async () => (await navigator.serviceWorker.getRegistration())!.waiting === null
			)
		)
		.toBe(true);
	expect(await isMarked(other)).toBe(true);
	await expect(banner(other)).toBeVisible();

	// It runs old code under the new worker, so it offers the switch, and taking it reloads it.
	await updateNow(other).click();
	await other.waitForFunction(() => !(window as unknown as { marked?: boolean }).marked);
	await expect.poll(() => pageVersion(other)).toBe(next);
	await expect(banner(other)).toHaveCount(0);
	await expect.poll(() => cacheNames(other)).toEqual([`taysir-${next}`]);
});

test('at twice the text size on a phone, the offer fits and leaves the page to be read', async ({
	page,
	site
}) => {
	const phone = { width: 375, height: 812 };
	await page.setViewportSize(phone);
	await useWideFonts(page);
	await openInstalled(page, site);
	await deployAndNotice(page, site);
	// Partway through a lesson it says the most, so check it there.
	await page.getByRole('link', { name: /^Continue:/ }).click();
	await expect(banner(page)).toContainText('Updating restarts what you are doing now.');

	/** Nothing sideways, and if it follows the learner down the page it may not take much of it. */
	const fits = async () => {
		expect(await layoutProblems(page, phone.width)).toEqual([]);
		const offer = await page.evaluate(() => {
			const el = document.querySelector('aside.update')!;
			return {
				height: el.getBoundingClientRect().height,
				follows: getComputedStyle(el).position === 'sticky',
				window: window.innerHeight
			};
		});
		if (offer.follows) expect(offer.height).toBeLessThanOrEqual(offer.window / 3);
	};
	await fits();
	await withBigText(page, fits);
});
