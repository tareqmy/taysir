import { describe, expect, it } from 'vitest';
import { ISSUES_URL, SOURCE_URL } from './links';

describe('the About page’s links', () => {
	it('are secure web addresses', () => {
		for (const address of [SOURCE_URL, ISSUES_URL]) {
			expect(new URL(address).protocol, address).toBe('https:');
		}
	});

	it('send mistakes to the issues of the same repository that holds the source', () => {
		expect(ISSUES_URL).toBe(`${SOURCE_URL}/issues`);
	});
});
