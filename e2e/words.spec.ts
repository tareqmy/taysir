import type { Locator, Page } from '@playwright/test';
import { lessons } from '../src/lib/content/course';
import { lexicon, surahName, verseData } from '../src/lib/data';
import type { Lexeme } from '../src/lib/data/types';
import { wordKnowledge } from '../src/lib/progress/stats';
import { startAsReader, startWithProgress } from './support/learner';
import { seededLearner } from './support/seed';
import { expect, test } from './support/test';

/**
 * The words page: every word the learner has been given, found by searching, filtering and sorting,
 * and opened for its root and a verse it comes from. The learner here has done every lesson, so
 * every word in the course is theirs, spread across the three levels of how well it is known.
 */

const seed = seededLearner({ lessonsDone: lessons.length });
const ids = new Set(
	seed.cards.filter((card) => card.id.startsWith('lx:')).map((card) => card.id.slice(3))
);
const learned: Lexeme[] = lexicon.lexemes.filter((lexeme) => ids.has(lexeme.id));
const knowledge = wordKnowledge(seed.cards);

const versesInApp = new Set(verseData.verses.map((verse) => `${verse.surah}:${verse.ayah}`));
const inAppWords = new Set(
	verseData.verses.flatMap((verse) => verse.words.flatMap((w) => (w.lexemeId ? [w.lexemeId] : [])))
);
const sampleVerse = (lexeme: Lexeme) => lexeme.sample.loc.split(':').slice(0, 2).join(':');

/** A word that has a root and is seen in a verse the app has, to open. */
const withVerse = learned.find((l) => l.root && versesInApp.has(sampleVerse(l)))!;
/** A word that is in none of the app's verses, so only its reference can be shown. */
const withoutVerse = learned.find(
	(l) => !versesInApp.has(sampleVerse(l)) && !inAppWords.has(l.id)
)!;

const rows = (page: Page) => page.locator('ul.words > li');
const rowOf = (page: Page, lexeme: Lexeme) =>
	rows(page).filter({ hasText: lexeme.arabic }).filter({ hasText: lexeme.gloss }).first();
const toggle = (row: Locator) => row.locator('button.toggle');
const search = (page: Page) => page.getByRole('searchbox', { name: 'Search your words' });
const stripMarks = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '');

async function openWords(page: Page) {
	await startWithProgress(page, seed.backup);
	await page.goto('/progress');
	await page.getByRole('link', { name: /^Browse your words/ }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Your words' })).toBeVisible();
}

test('shows nothing to browse until a word has been learned, and offers no link to it', async ({
	page
}) => {
	await startAsReader(page);
	await page.goto('/progress');
	await expect(page.getByRole('heading', { level: 1, name: 'Your progress' })).toBeVisible();
	await expect(page.getByRole('link', { name: /Browse your words/ })).toHaveCount(0);

	await page.goto('/words');
	await expect(page.getByRole('heading', { level: 1, name: 'Your words' })).toBeVisible();
	await expect(page.getByText('Finish a vocabulary lesson')).toBeVisible();
	await expect(search(page)).toHaveCount(0);
});

test('lists every word learned, and counts them by how well they are known', async ({ page }) => {
	await openWords(page);
	expect(learned.length, 'the learner should know a good many words').toBeGreaterThan(100);
	await expect(rows(page)).toHaveCount(learned.length);
	await expect(
		page.getByText(`${learned.length.toLocaleString('en-US')} words`, { exact: true })
	).toBeVisible();

	for (const [name, count] of [
		['Learning', knowledge.learning],
		['Familiar', knowledge.familiar],
		['Well known', knowledge.wellKnown]
	] as const) {
		await page.getByRole('radio', { name: new RegExp(`^${name}\\b`) }).check();
		await expect(rows(page)).toHaveCount(count);
		// Every row on show says so, in words and not only in colour.
		for (const label of await rows(page).locator('.strength').allTextContents()) {
			expect(label.trim()).toBe(name);
		}
		await expect(
			page.getByText(
				`${count.toLocaleString('en-US')} of ${learned.length.toLocaleString('en-US')} words`
			)
		).toBeVisible();
	}
	await page.getByRole('radio', { name: /^All\b/ }).check();
	await expect(rows(page)).toHaveCount(learned.length);
});

test('sorts by newest, weakest or most common', async ({ page }) => {
	await openWords(page);
	const gloss = (row: Locator) => row.locator('.gloss');

	// Newest first is the order the course taught them, backwards.
	const taught = [...new Set(lessons.flatMap((lesson) => lesson.cardIds))]
		.filter((id) => id.startsWith('lx:'))
		.map((id) => learned.find((l) => l.id === id.slice(3))!)
		.filter(Boolean);
	await expect(gloss(rows(page).first())).toHaveText(taught.at(-1)!.gloss);

	const common = [...learned].sort((a, b) => b.count - a.count || a.rank - b.rank);
	await page.getByLabel('Sort by').selectOption({ label: 'Most common first' });
	await expect(gloss(rows(page).first())).toHaveText(common[0].gloss);
	await expect(gloss(rows(page).nth(1))).toHaveText(common[1].gloss);

	await page.getByLabel('Sort by').selectOption({ label: 'Weakest first' });
	await expect(rows(page).first().locator('.strength')).toHaveText(/Learning/);
	await expect(rows(page).last().locator('.strength')).toHaveText(/Well known/);

	await page.getByLabel('Sort by').selectOption({ label: 'Newest first' });
	await expect(gloss(rows(page).first())).toHaveText(taught.at(-1)!.gloss);
});

test('finds a word by its meaning, its Arabic with or without vowels, or its root', async ({
	page
}) => {
	await openWords(page);
	const target = withVerse;
	const found = async (typed: string) => {
		await search(page).fill(typed);
		await expect(rowOf(page, target)).toBeVisible();
		// Narrowed down: not the whole list.
		expect(await rows(page).count()).toBeLessThan(learned.length);
	};

	await found(target.gloss);
	await found(target.gloss.toUpperCase());
	await found(target.arabic);
	await found(stripMarks(target.arabic));
	await found(target.root!);
	await found([...target.root!].join('-'));
	await found(stripMarks(target.sample.form));

	await test.step('a search that matches nothing says so, and one tap clears it', async () => {
		await search(page).fill('zzzzqq');
		await expect(page.getByText('No words match.')).toBeVisible();
		await expect(rows(page)).toHaveCount(0);
		await page.getByRole('button', { name: 'Show all my words' }).click();
		await expect(search(page)).toHaveValue('');
		await expect(rows(page)).toHaveCount(learned.length);
	});

	await test.step('a search and a level together', async () => {
		await search(page).fill(target.gloss);
		const row = rowOf(page, target);
		const level = (await row.locator('.strength').innerText()).trim();
		const other = ['Learning', 'Familiar', 'Well known'].find((name) => name !== level)!;
		await page.getByRole('radio', { name: new RegExp(`^${level}\\b`) }).check();
		await expect(row).toBeVisible();
		await page.getByRole('radio', { name: new RegExp(`^${other}\\b`) }).check();
		await expect(rowOf(page, target)).toHaveCount(0);
	});
});

test('opens a word to show its root and a verse it comes from', async ({ page }) => {
	await openWords(page);
	const target = withVerse;
	const [surah, ayah] = sampleVerse(target).split(':').map(Number);
	const row = rowOf(page, target);
	const verse = row.getByRole('region', { name: `${surahName(surah)} verse ${ayah}` });

	await expect(toggle(row)).toHaveAttribute('aria-expanded', 'false');
	await expect(verse).toHaveCount(0);
	// A closed word takes up no room of its own: its panel is not drawn at all, so a list of hundreds
	// is not hundreds of empty padded boxes.
	const panel = row.locator('.panel');
	await expect(panel).toBeHidden();
	const closedHeight = await row.evaluate((el) => el.getBoundingClientRect().height);
	expect(await panel.evaluate((el) => getComputedStyle(el).display)).toBe('none');

	await toggle(row).click();
	await expect(toggle(row)).toHaveAttribute('aria-expanded', 'true');
	expect(await row.evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(
		closedHeight
	);
	await expect(row.getByText(/^root/)).toBeVisible();
	await expect(row.getByText(/appears .* in the Quran/)).toBeVisible();
	await expect(row.getByText(/Seen as/)).toContainText(`${surahName(surah)} ${surah}:${ayah}`);
	await expect(verse).toBeVisible();

	await toggle(row).click();
	await expect(toggle(row)).toHaveAttribute('aria-expanded', 'false');
	await expect(verse).toHaveCount(0);
	expect(await row.evaluate((el) => el.getBoundingClientRect().height)).toBe(closedHeight);
});

test('names only the reference for a word that is in none of the verses the app has', async ({
	page
}) => {
	await openWords(page);
	const [surah, ayah] = sampleVerse(withoutVerse).split(':').map(Number);
	const row = rowOf(page, withoutVerse);
	await toggle(row).click();
	await expect(row.getByText(/Seen as/)).toContainText(`${surah}:${ayah}`);
	await expect(row.getByRole('region')).toHaveCount(0);
});
