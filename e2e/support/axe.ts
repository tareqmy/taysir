import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect } from './test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/**
 * Check the screen as it is now with axe-core. The check is soft, so a test goes on to check its
 * other screens and one report lists every problem.
 */
export async function audit(page: Page, screen: string) {
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
