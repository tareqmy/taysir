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

	// "Practise more" starts a new session.
	await page.getByRole('link', { name: 'Practise more' }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Extra practice' })).toBeVisible();
	await expect(page.getByRole('group', { name: 'Choices' })).toBeVisible();
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
