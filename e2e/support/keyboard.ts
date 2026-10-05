import type { Locator, Page } from '@playwright/test';
import type { Exercise } from '../../src/lib/content/types';
import { expect } from './test';

/**
 * Driving the app with the keyboard alone, and checking what axe cannot: that the Tab key reaches
 * every control in a sensible order, that you can always see where you are and it is not hidden
 * behind something, and that you are never stuck. Everything here sends real key presses.
 */

interface Stop {
	name: string;
	/** Scrolled into the window, as the browser does for whatever takes focus. */
	inView: boolean;
	/** Something shows where focus is: an outline, here or on the label around it. */
	indicated: boolean;
	/** Another element is drawn over the middle of it, so it cannot be seen. */
	covered: boolean;
}

interface TabAudit {
	stops: Stop[];
	/** Focus went round again, or out of the page. False means the page kept handing out stops. */
	ended: boolean;
	/** Controls that are on the screen and could be used, that Tab never reached. */
	unreachable: string[];
	/** Elements with a tabindex above zero, which reorder the Tab key. */
	reordered: string[];
}

/**
 * The most Tab presses a screen is given before it counts as a trap. The longest page audited is
 * the home screen, with a stop for each of about a hundred and fifty lessons; the words page is
 * audited a third at a time (two stops for each word, the word and its speaker).
 */
const MAX_STOPS = 800;

/** Put the "where Tab starts from" mark at the top of the page, whatever has had focus before. */
async function startFromTop(page: Page) {
	await page.evaluate(() => {
		(document.activeElement as HTMLElement | null)?.blur();
		window.scrollTo(0, 0);
		const mark = document.createElement('span');
		mark.tabIndex = -1;
		document.body.prepend(mark);
		mark.focus();
		mark.remove();
		(window as unknown as { kbSeen: Set<Element> }).kbSeen = new Set();
	});
}

/** Describe what has focus now, or nothing when it is the page itself (focus has left). */
function describeFocus(page: Page) {
	return page.evaluate(() => {
		const el = document.activeElement as HTMLElement | null;
		if (!el || el === document.body || el === document.documentElement) return null;
		const seen = (window as unknown as { kbSeen: Set<Element> }).kbSeen;
		const again = seen.has(el);
		seen.add(el);

		const rect = el.getBoundingClientRect();
		const inView =
			rect.width > 0 &&
			rect.height > 0 &&
			rect.bottom > 0 &&
			rect.top < window.innerHeight &&
			rect.right > 0 &&
			rect.left < window.innerWidth;

		let indicated = false;
		let node: Element | null = el;
		for (let up = 0; node && up < 3 && !indicated; up++, node = node.parentElement) {
			const style = getComputedStyle(node);
			// A transparent outline is no sign at all.
			const colour = /rgba?\(([^)]*)\)/.exec(style.outlineColor)?.[1].split(',') ?? [];
			const seen = colour.length < 4 || Number(colour[3]) > 0;
			indicated =
				style.outlineStyle !== 'none' &&
				parseFloat(style.outlineWidth) >= 2 &&
				seen &&
				node.matches(':focus-visible, :focus-within');
		}

		const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1);
		const y = Math.min(Math.max(rect.top + rect.height / 2, 0), window.innerHeight - 1);
		const top = document.elementFromPoint(x, y);
		const covered = !top || !(el === top || el.contains(top) || top.contains(el));

		const name = (
			el.getAttribute('aria-label') ||
			el.textContent ||
			(el as HTMLInputElement).value ||
			el.tagName
		)
			.replace(/\s+/g, ' ')
			.trim()
			.slice(0, 60);
		return {
			stop: { name: `${el.tagName.toLowerCase()} “${name}”`, inView, indicated, covered },
			again
		};
	});
}

/** What could be used on the screen, and was not reached. */
function unreached(page: Page) {
	return page.evaluate(() => {
		const seen = (window as unknown as { kbSeen: Set<Element> }).kbSeen;
		const candidates = document.querySelectorAll<HTMLElement>(
			'a[href], button, input, select, textarea, summary, [tabindex], [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="menuitem"], [role="tab"]'
		);
		const missed: string[] = [];
		for (const el of candidates) {
			const disabled = (el as HTMLButtonElement).disabled === true;
			// A heading or panel with tabindex -1 is only for a script to focus. A button or link with
			// it can no longer be reached by Tab, which is exactly what this is here to find.
			const native = el.matches(
				'a[href], button, input, select, textarea, summary, [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="menuitem"], [role="tab"]'
			);
			if (disabled || (el.getAttribute('tabindex') === '-1' && !native)) continue;
			if (el.closest('[inert], [aria-hidden="true"]') || !el.checkVisibility()) continue;
			const rect = el.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) continue;
			// Tab visits one radio button of a group; the arrow keys move between them.
			if (el instanceof HTMLInputElement && el.type === 'radio') {
				const group = [...document.querySelectorAll<HTMLInputElement>(`input[name="${el.name}"]`)];
				if (group.some((radio) => seen.has(radio))) continue;
			}
			if (!seen.has(el)) {
				missed.push(
					`${el.tagName.toLowerCase()} “${(el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50)}”`
				);
			}
		}
		return missed;
	});
}

/** Everything with a tabindex above zero, which makes the Tab key skip around the page. */
function reorderers(page: Page) {
	return page.evaluate(() =>
		[...document.querySelectorAll<HTMLElement>('[tabindex]')]
			.filter((el) => Number(el.getAttribute('tabindex')) > 0)
			.map((el) => el.tagName.toLowerCase())
	);
}

/**
 * Press Tab from the top of the page until focus goes round or out, and report each stop. Checks
 * that apply to every screen are made here, softly, so one report lists every screen's problems.
 */
export async function auditTabOrder(page: Page, screen: string): Promise<TabAudit> {
	await startFromTop(page);
	const stops: Stop[] = [];
	let ended = false;
	for (let press = 0; press < MAX_STOPS; press++) {
		await page.keyboard.press('Tab');
		const found = await describeFocus(page);
		if (!found || found.again) {
			ended = true;
			break;
		}
		stops.push(found.stop);
	}
	const audit: TabAudit = {
		stops,
		ended,
		unreachable: await unreached(page),
		reordered: await reorderers(page)
	};

	const named = (list: Stop[]) => list.map((stop) => stop.name);
	expect.soft(audit.ended, `${screen}: Tab never leaves the page or comes back round`).toBe(true);
	expect.soft(audit.stops.length, `${screen}: something should take focus`).toBeGreaterThan(0);
	expect.soft(audit.reordered, `${screen}: a tabindex above zero reorders the Tab key`).toEqual([]);
	expect.soft(audit.unreachable, `${screen}: Tab never reaches these`).toEqual([]);
	expect.soft(named(stops.filter((s) => !s.inView)), `${screen}: focus is out of view`).toEqual([]);
	expect
		.soft(named(stops.filter((s) => !s.indicated)), `${screen}: no sign of where focus is`)
		.toEqual([]);
	expect
		.soft(named(stops.filter((s) => s.covered)), `${screen}: focus is under something else`)
		.toEqual([]);
	return audit;
}

// --- Using the app by keyboard --------------------------------------------------------------

/** Tab until `target` has focus. Says how many presses it took; fails if it is never reached. */
export async function tabTo(page: Page, target: Locator, { max = 40 } = {}): Promise<number> {
	// Without this a control that is not there would be waited for until the whole test timed out.
	await expect(target, 'the control to Tab to').toBeAttached();
	const focused = () => target.evaluate((el) => el === document.activeElement);
	for (let presses = 0; presses < max; presses++) {
		if (await focused()) return presses;
		await page.keyboard.press('Tab');
	}
	if (await focused()) return max;
	const now = await page.evaluate(() => {
		const el = document.activeElement;
		return el
			? `${el.tagName.toLowerCase()} ${el.textContent?.trim().slice(0, 40) ?? ''}`
			: 'nothing';
	});
	throw new Error(`Tab did not reach ${target} in ${max} presses (focus is on ${now})`);
}

/** Tab to a control and press it with Enter, or with Space, as people do. */
export async function press(
	page: Page,
	target: Locator,
	key: 'Enter' | 'Space' = 'Enter'
): Promise<number> {
	const presses = await tabTo(page, target);
	await page.keyboard.press(key);
	return presses;
}

/**
 * Answer a lesson question with the keyboard alone, using the course data to know the answer.
 * Says the most Tab presses it took to reach any one control.
 */
export async function answerByKeyboard(
	page: Page,
	exercise: Exercise,
	key: 'Enter' | 'Space' = 'Enter'
): Promise<number> {
	const most: number[] = [0];
	const go = async (target: Locator) => most.push(await press(page, target, key));
	switch (exercise.kind) {
		case 'choose': {
			const answer = exercise.choices.find((choice) => choice.id === exercise.answerId)!;
			await go(
				page
					.getByRole('group', { name: 'Choices' })
					.getByRole('button', { name: answer.chunk.text, exact: true })
			);
			break;
		}
		case 'match': {
			const tiles = page.getByRole('group', { name: 'Match the pairs' });
			for (const pair of exercise.pairs) {
				await go(tiles.getByRole('button', { name: pair.left.text, exact: true }));
				await go(tiles.getByRole('button', { name: pair.right.text, exact: true }));
			}
			break;
		}
		case 'build': {
			const bank = page.getByRole('group', { name: 'Word bank' });
			for (const token of exercise.answer) {
				await go(bank.getByRole('button', { name: token.chunk.text, exact: true }));
			}
			await go(page.getByRole('button', { name: 'Check', exact: true }));
			break;
		}
		case 'tap': {
			const word = exercise.words.find((w) => w.id === exercise.answerId)!;
			await go(
				page
					.getByRole('group', { name: 'The verse, word by word' })
					.getByRole('button', { name: word.text, exact: true })
			);
			break;
		}
	}
	return Math.max(...most);
}
