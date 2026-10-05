import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { REPORT_URL, SOURCE_URL } from './links';

describe('the About page’s links', () => {
	it('are secure web addresses', () => {
		for (const address of [SOURCE_URL, REPORT_URL]) {
			expect(new URL(address).protocol, address).toBe('https:');
		}
	});

	it('send mistakes to the forms of the repository that holds the source', () => {
		expect(REPORT_URL).toBe(`${SOURCE_URL}/issues/new/choose`);
	});
});

describe('the forms a report is made on', () => {
	const folder = new URL('../../.github/ISSUE_TEMPLATE/', import.meta.url);
	const forms = readdirSync(folder).filter((name) => name.endsWith('.yml'));

	it('has one for a mistake in a lesson and one for something that does not work', () => {
		expect(forms.sort()).toEqual(['mistake.yml', 'problem.yml']);
	});

	it('asks for the details GitHub needs from each, and for where the trouble is', () => {
		for (const name of forms) {
			const text = readFileSync(new URL(name, folder), 'utf8');
			for (const key of ['name', 'description', 'title', 'body']) {
				expect(text, `${name} needs ${key}`).toMatch(new RegExp(`^${key}:`, 'm'));
			}
			// Without knowing where, a report cannot be acted on: that one field, not a later one.
			const fields = text.split(/^ {2}- type:/m);
			const where = fields.find((field) => /\bid: where\b/.test(field));
			expect(where, `${name} asks where`).toBeDefined();
			expect(where, `${name} requires an answer to where`).toMatch(/required: true/);
		}
	});

	it('tells the reader that the English is a draft, on the form for mistakes', () => {
		const text = readFileSync(new URL('mistake.yml', folder), 'utf8');
		expect(text).toContain('a draft that a');
	});
});
