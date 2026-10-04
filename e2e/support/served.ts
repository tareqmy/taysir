import { startSite, type Site } from './site';
import { expect, test as base } from './test';

/**
 * `test` with the app served from its own copy of the build (`site.ts`), which can be redeployed
 * as a new version or taken offline. The page's `baseURL` is that site. A spec that wants the
 * service worker to run says `test.use({ serviceWorkers: 'allow' })`, as the default blocks it.
 */
export const test = base.extend<{ site: Site }>({
	// Playwright reads a fixture's needs from its first argument, so it must be written as a pattern.
	// eslint-disable-next-line no-empty-pattern
	site: async ({}, use) => {
		const site = await startSite();
		await use(site);
		await site.close();
	},
	baseURL: async ({ site }, use) => {
		await use(site.origin);
	}
});

export { expect };
