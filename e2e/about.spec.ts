import { ISSUES_URL, SOURCE_URL } from '../src/lib/links';
import { expect, test } from './support/test';

/** The About page: where to send a mistake, where the source is, and what leaves the device. */

test('says where to report a mistake, where the source is, and what leaves the device', async ({
	page
}) => {
	await page.goto('/about');
	await expect(page.getByRole('heading', { level: 1, name: 'About Taysir' })).toBeVisible();

	const mistakes = page.getByRole('region', { name: 'Found a mistake?' });
	await expect(mistakes.getByRole('link', { name: 'Report a mistake on GitHub' })).toHaveAttribute(
		'href',
		ISSUES_URL
	);

	await expect(page.getByRole('link', { name: 'the Taysir repository on GitHub' })).toHaveAttribute(
		'href',
		SOURCE_URL
	);
	// The old wording pointed at a link above that was not Taysir's own.
	await expect(page.getByText('the source link above')).toHaveCount(0);

	const privacy = page.getByRole('region', { name: 'Your privacy' });
	await expect(privacy).toContainText('no accounts and no analytics');
	await expect(privacy).toContainText('EveryAyah or Quran.com');
	await expect(privacy).toContainText('can see your internet address');
});
