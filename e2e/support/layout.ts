import type { Page } from '@playwright/test';
import { verseData } from '../../src/lib/data';

/**
 * What makes a screen hard to use when its text is big: the page scrolling sideways, an Arabic word
 * breaking across lines (it cannot be read that way), or a button whose contents spill out of it.
 * Returns a plain description of each, or nothing when the screen is fine.
 */
export async function layoutProblems(page: Page, width: number): Promise<string[]> {
	return page.evaluate((limit) => {
		const problems: string[] = [];
		const root = document.documentElement;
		if (root.scrollWidth > limit) {
			problems.push(`the page scrolls sideways by ${root.scrollWidth - limit}px`);
		}
		for (const el of document.querySelectorAll<HTMLElement>('.ar')) {
			const word = el.textContent?.trim() ?? '';
			if (word && !/\s/.test(word) && el.getClientRects().length > 1) {
				problems.push(`an Arabic word breaks across lines: ${word}`);
			}
		}
		for (const el of document.querySelectorAll<HTMLElement>('button')) {
			if (el.scrollWidth > el.clientWidth + 1) {
				const label = el.textContent?.trim().slice(0, 24);
				problems.push(`a button overflows by ${el.scrollWidth - el.clientWidth}px: ${label}`);
			}
		}
		return problems;
	}, width);
}

/**
 * Use wide fonts for the app's ordinary text, whatever the machine has. How text wraps depends on
 * how wide the fonts are, and the build machine's fonts are not the learner's: a test run on
 * narrow fonts can pass what wider ones would break. Verdana and DejaVu are about as wide as
 * common fonts get. (The Arabic keeps the font the app ships.)
 */
export async function useWideFonts(page: Page) {
	await page.addInitScript(() => {
		document.addEventListener('DOMContentLoaded', () => {
			const style = document.createElement('style');
			style.textContent =
				':root { --font-ui: Verdana, "DejaVu Sans", sans-serif !important; --font-display: Georgia, "DejaVu Serif", serif !important; }';
			document.head.append(style);
		});
	});
}

/**
 * Run `check` with the browser's own font size set to double, as a learner who needs big text has
 * it. That is not the same as setting the page's root font size: a `rem` in a media query means the
 * browser's setting, not the page's, so `@media (min-height: 36rem)` only stops matching on a phone
 * when the setting itself is doubled. Chromium-only; the default sizes are put back afterwards.
 */
export async function withBigText<T>(page: Page, check: () => Promise<T>): Promise<T> {
	const session = await page.context().newCDPSession(page);
	const setSizes = (standard: number, fixed: number) =>
		session.send('Page.setFontSizes' as never, { fontSizes: { standard, fixed } } as never);
	await setSizes(32, 26);
	try {
		return await check();
	} finally {
		await setSizes(16, 13);
		await session.detach();
	}
}

/**
 * The widest Arabic words in the course, measured in the real font in the real page, as `count`
 * distinct verse words. These are the ones that are first to stop fitting.
 */
export async function widestWords(page: Page, count: number): Promise<string[]> {
	const words = [...new Set(verseData.verses.flatMap((v) => v.words.map((w) => w.text)))];
	const widths = await page.evaluate(async (list) => {
		const holder = document.createElement('div');
		holder.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
		document.body.append(holder);
		const spans = list.map((text) => {
			const span = document.createElement('span');
			span.className = 'ar';
			span.style.fontSize = '100px';
			span.textContent = text;
			holder.append(span);
			return span;
		});
		// The font is fetched when it is first needed, so give it time to arrive.
		await document.fonts.ready;
		await new Promise((resolve) => setTimeout(resolve, 500));
		await document.fonts.ready;
		const measured = spans.map((span, i) => [list[i], span.getBoundingClientRect().width] as const);
		holder.remove();
		return measured;
	}, words);
	return widths
		.sort((a, b) => b[1] - a[1])
		.slice(0, count)
		.map(([word]) => word);
}
