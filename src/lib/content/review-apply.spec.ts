import ExcelJS from 'exceljs';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	cleanCorrection,
	decode,
	encode,
	replaceAt,
	statusOf
} from '../../../scripts/review-corrections';
import { COLUMNS, SHEETS } from '../../../scripts/review-sheets';

describe('a correction from the review spreadsheet', () => {
	it('becomes one line, without control characters', () => {
		expect(cleanCorrection('first line\nsecond line')).toBe('first line second line');
		expect(cleanCorrection('  a\r\n\tb  ')).toBe('a b');
		expect(cleanCorrection('to\u2028go')).toBe('to go');
		expect(cleanCorrection('bad\u0000char')).toBe('badchar');
		expect(cleanCorrection(' \n ')).toBe('');
	});

	it('is written as a string literal that reads back as itself', () => {
		for (const text of ["the Lord's", 'a\\b', 'line\nbreak', 'cost $& more', 'x\u2028y']) {
			const literal = encode(text);
			expect(literal).not.toMatch(/[\n\r\u2028\u2029]/);
			expect(decode(literal), literal).toBe(text);
		}
	});

	it('is put in place literally, even with a $ in it', () => {
		const source = "x: 'old', y: 'old'";
		expect(replaceAt(source, 3, "'old'", "'cost $& more'")).toBe("x: 'cost $& more', y: 'old'");
	});

	it('is only applied when the row is marked Change', () => {
		expect(statusOf('Change')).toBe('change');
		expect(statusOf(' change ')).toBe('change');
		expect(statusOf('OK')).toBe('ok');
		expect(statusOf('Unsure')).toBe('unsure');
		expect(statusOf('')).toBe('blank');
		expect(statusOf(undefined)).toBe('blank');
		expect(statusOf('Changed')).toBe('unknown');
	});
});

/**
 * The import itself, run on a copy of the data files with a spreadsheet made here, as a reviewer
 * might fill it in: the data files it changes, and the report it writes.
 */
describe('applying a returned spreadsheet', () => {
	const root = fileURLToPath(new URL('../../../', import.meta.url));
	let dir: string;

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), 'taysir-apply-'));
		for (const path of ['scripts', 'package.json', 'prettier.config.js']) {
			cpSync(join(root, path), join(dir, path), { recursive: true });
		}
		cpSync(join(root, 'data'), join(dir, 'data'), {
			recursive: true,
			filter: (path) => !path.includes(`${join('data', 'source')}`)
		});
		symlinkSync(join(root, 'node_modules'), join(dir, 'node_modules'));
	});
	afterEach(() => rmSync(dir, { recursive: true, force: true }));

	type Cells = Record<string, string>;
	async function workbook(words: Cells[], vocabulary: Cells[]) {
		const book = new ExcelJS.Workbook();
		const sheet = (name: string, columns: string[], rows: Cells[]) => {
			const added = book.addWorksheet(name);
			added.addRow(columns);
			for (const row of rows) added.addRow(columns.map((column) => row[column] ?? ''));
		};
		const marks = [COLUMNS.status, COLUMNS.correction, COLUMNS.comment];
		sheet(SHEETS.words, [COLUMNS.key, 'Arabic', COLUMNS.gloss, ...marks], words);
		sheet(
			SHEETS.vocabulary,
			[COLUMNS.id, 'Arabic (dictionary form)', COLUMNS.meaning, ...marks],
			vocabulary
		);
		for (const name of [SHEETS.verses, SHEETS.lessonText, SHEETS.exercises]) {
			sheet(name, ['Lesson', COLUMNS.status, COLUMNS.comment], []);
		}
		await book.xlsx.writeFile(join(dir, 'returned.xlsx'));
	}

	const run = (...args: string[]) =>
		spawnSync('node', ['scripts/apply-review.ts', 'returned.xlsx', ...args], {
			cwd: dir,
			encoding: 'utf8'
		});
	const file = (path: string) => readFileSync(join(dir, path), 'utf8');
	const report = () => file('review/feedback-returned.md');

	it('applies a correction typed over two lines, or with a $, as written', async () => {
		await workbook(
			[
				{
					Key: '1:2:1',
					'Current English': 'the praise',
					Status: 'Change',
					Correction: 'all\npraise'
				},
				{
					Key: '1:2:2',
					'Current English': 'is for Allah',
					Status: 'Change',
					Correction: 'cost $& more'
				}
			],
			[
				{
					ID: 'hamd',
					'Current meaning': 'praise',
					Status: 'Change',
					Correction: 'praise,\r\nthanks'
				}
			]
		);
		const result = run();
		expect(result.status, result.stderr).toBe(0);
		const glosses = file('data/fatiha-glosses.ts');
		expect(glosses).toContain("'1:2:1': 'all praise',");
		expect(glosses).toContain("'1:2:2': 'cost $& more',");
		expect(glosses).toContain("'1:2:3': 'Lord of',");
		expect(file('data/lexicon-seeds.ts')).toContain(
			"{ id: 'hamd', loc: '1:2:1:2', gloss: 'praise, thanks' }"
		);
		expect(report()).toContain('Corrections applied (3)');
	});

	it('reports a correction it does not apply, with the reviewer’s own words', async () => {
		await workbook(
			[
				{ Key: '1:2:1', 'Current English': 'the praise', Correction: 'typed, but no status' },
				{
					Key: '1:2:2',
					'Current English': 'is for Allah',
					Status: 'Changed',
					Correction: 'a status typed in'
				},
				{ Key: '1:2:3', 'Current English': 'Lord of', Status: 'OK', Correction: 'marked OK' },
				{
					Key: '1:2:4',
					'Current English': 'the old English',
					Status: 'Change',
					Correction: 'out of date'
				}
			],
			[]
		);
		const before = file('data/fatiha-glosses.ts');
		const result = run();
		expect(result.status, result.stderr).toBe(0);
		expect(file('data/fatiha-glosses.ts')).toBe(before);

		const written = report();
		expect(written).toContain('Corrections applied (0)');
		for (const correction of [
			'typed, but no status',
			'a status typed in',
			'marked OK',
			'out of date'
		]) {
			expect(written).toContain(`“${correction}”`);
		}
		expect(written).toContain('Status is blank, not Change');
		expect(written).toContain('Status “Changed” is not one of OK, Change, Unsure');
		expect(written).toContain('1 with a Status the import does not know');
	});

	it('refuses a sheet whose Correction column was renamed, rather than apply nothing', async () => {
		await workbook([{ Key: '1:2:1', Status: 'Change', Correction: 'x' }], []);
		const book = new ExcelJS.Workbook();
		await book.xlsx.readFile(join(dir, 'returned.xlsx'));
		book.getWorksheet(SHEETS.words)!.getCell('E1').value = 'My correction';
		await book.xlsx.writeFile(join(dir, 'returned.xlsx'));

		const result = run();
		expect(result.status).not.toBe(0);
		expect(result.stderr).toContain('Sheet “Words” has no “Correction” column');
	});

	it('changes nothing, and says so, when the changed files cannot be formatted', async () => {
		await workbook(
			[
				{
					Key: '1:2:1',
					'Current English': 'the praise',
					Status: 'Change',
					Correction: 'all praise'
				}
			],
			[]
		);
		// A data file the formatter cannot read, as any problem with a data file would be.
		writeFileSync(join(dir, 'prettier.config.js'), 'throw new Error("no formatting today");\n');
		const before = file('data/fatiha-glosses.ts');

		const result = run();
		expect(result.status).not.toBe(0);
		expect(file('data/fatiha-glosses.ts')).toBe(before);
		expect(report()).toContain('so they were put back as they were: no data files were changed');
		expect(report()).toContain('Corrections that would be applied (1)');
	});
});
