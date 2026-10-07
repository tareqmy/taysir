import type { StoredCard } from '../src/lib/progress/scheduler';
import { dayKey } from '../src/lib/progress/streak';
import type { Meta } from '../src/lib/progress/store';
import { readStore, runSession, startWithProgress } from './support/learner';
import { seededLearner } from './support/seed';
import { expect, test } from './support/test';

const cardsOf = async (page: Parameters<typeof readStore>[0]) =>
	(await readStore(page, 'cards')) as StoredCard[];
const metaOf = async (page: Parameters<typeof readStore>[0]) =>
	(await readStore(page, 'meta'))[0] as Meta;
const byId = (cards: StoredCard[]) => new Map(cards.map((card) => [card.id, card]));

/** Marks the page, so `isSamePage` can tell whether it has since been loaded afresh. */
const markPage = (page: Parameters<typeof readStore>[0]) =>
	page.evaluate(() => Object.assign(window, { visit: 'this one' }));
const isSamePage = (page: Parameters<typeof readStore>[0]) =>
	page.evaluate(() => (window as { visit?: string }).visit === 'this one');

test('extra practice counts toward today but leaves the review schedule alone', async ({
	page
}) => {
	await startWithProgress(page, seededLearner({ due: 0 }).backup);

	// Nothing is due, so the home page offers practice instead of a dead end.
	await expect(page.getByRole('link', { name: /Review \d+ items?/ })).toHaveCount(0);
	const before = { cards: await cardsOf(page), meta: await metaOf(page) };
	const today = dayKey(new Date());
	expect(before.meta.activity[today] ?? 0).toBe(0);

	await page.getByRole('link', { name: 'Nothing due: practise your weakest words' }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Extra practice' })).toBeVisible();
	await runSession(page, 'Practice complete');
	await expect(page.getByText(/\d+ of \d+ right first time/)).toBeVisible();

	const after = { cards: await cardsOf(page), meta: await metaOf(page) };
	expect(after.cards, 'practice must not change any card').toEqual(before.cards);
	expect(after.meta.activity[today], 'every answer counts toward today').toBeGreaterThanOrEqual(10);

	// "Practise more" starts a new session, without loading the page afresh, which would lose a
	// visit's progress in a browser that is not saving it.
	await markPage(page);
	await page.getByRole('link', { name: 'Practise more' }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Extra practice' })).toBeVisible();
	await expect(page.getByRole('group', { name: 'Choices' })).toBeVisible();
	await expect(page.locator('.question h2')).toBeFocused();
	expect(await isSamePage(page)).toBe(true);
});

test('a long review goes on in batches of ten, by “Keep going” or the Review link', async ({
	page
}) => {
	await startWithProgress(page, seededLearner({ due: 22 }).backup);
	const progress = page.getByRole('progressbar', { name: 'Progress' });

	await page.getByRole('link', { name: 'Review 22 items' }).click();
	await expect(progress).toHaveAttribute('aria-valuemax', '10');
	await runSession(page, 'Review complete');
	await expect(page.getByText('12 more items are waiting.')).toBeVisible();

	await markPage(page);
	await page.getByRole('link', { name: 'Keep going' }).click();
	await expect(progress).toHaveAttribute('aria-valuemax', '10');
	await expect(page.locator('.question h2')).toBeFocused();
	expect(await isSamePage(page)).toBe(true);
	await runSession(page, 'Review complete');
	await expect(page.getByText('2 more items are waiting.')).toBeVisible();

	// The Review link at the top opens the same page, and starts the next batch too.
	await page
		.getByRole('navigation', { name: 'Main' })
		.getByRole('link', { name: /^Review/ })
		.click();
	await expect(progress).toBeVisible();
	await runSession(page, 'Review complete');
	expect(await isSamePage(page)).toBe(true);
});

test('a review brings back what is due, letters and words, and moves it out of the way', async ({
	page
}) => {
	// Three letters and three words: the first cards learned are letters, so words are asked for apart.
	const seed = seededLearner({ due: 3, dueWords: 3 });
	await startWithProgress(page, seed.backup);

	const dueIds = seed.cards
		.filter((card) => new Date(card.due).getTime() <= Date.now())
		.map((card) => card.id);
	const due = dueIds.length;
	expect(due).toBe(6);
	expect(dueIds.filter((id) => id.startsWith('lt:'))).toHaveLength(3);
	expect(dueIds.filter((id) => id.startsWith('lx:'))).toHaveLength(3);
	await page.getByRole('link', { name: `Review ${due} items` }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Review' })).toBeVisible();
	await expect(page.getByRole('progressbar', { name: 'Progress' })).toHaveAttribute(
		'aria-valuemax',
		String(due)
	);
	await runSession(page, 'Review complete');
	await expect(page.getByText(/\d+ of \d+ right first time/)).toBeVisible();

	const before = byId(seed.cards);
	const after = byId(await cardsOf(page));
	const now = Date.now();
	for (const id of dueIds) {
		expect(after.get(id)!.reps, `${id} was reviewed`).toBeGreaterThan(before.get(id)!.reps);
		expect(new Date(after.get(id)!.due).getTime(), `${id} is no longer due`).toBeGreaterThan(now);
	}
	// Cards that were not due are left exactly as they were.
	for (const [id, card] of before) {
		if (!dueIds.includes(id)) expect(after.get(id), id).toEqual(card);
	}

	// With nothing left due, the home page goes back to offering practice.
	await page.goto('/');
	await expect(
		page.getByRole('link', { name: 'Nothing due: practise your weakest words' })
	).toBeVisible();
});
