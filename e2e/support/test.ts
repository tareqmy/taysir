import { expect, test as base } from '@playwright/test';

/**
 * `test` with two things every page test wants: the recitation audio is blocked, so no test
 * depends on a CDN being reachable, and any uncaught error in the page fails the test.
 */
export const test = base.extend({
	page: async ({ page, context }, use) => {
		const errors: string[] = [];
		// On the context, so a second tab a test opens is held to the same two rules.
		context.on('weberror', (webError) => errors.push(webError.error().message));
		await context.route(/\.mp3(\?.*)?$/, (route) => route.abort());
		await use(page);
		expect(errors, 'uncaught errors in the page').toEqual([]);
	}
});

export { expect };
