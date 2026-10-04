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

/** Run `check` with the page's text scaled to 200%, as a learner who needs big text sees it. */
export async function withBigText<T>(page: Page, check: () => Promise<T>): Promise<T> {
	await page.evaluate(() => (document.documentElement.style.fontSize = '32px'));
	try {
		return await check();
	} finally {
		await page.evaluate(() => (document.documentElement.style.fontSize = ''));
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
