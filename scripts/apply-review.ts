/**
 * Applies a reviewer's corrections from the review spreadsheet to the data files.
 *
 *   npm run review:apply -- path/to/returned.xlsx [--dry]
 *
 * Rows marked Change with a Correction update the word glosses (sheet “Words”) and the vocabulary
 * meanings (sheet “Vocabulary”) in `data/`. Everything else the reviewer wrote (comments, rows
 * marked Unsure, corrections that could not be applied) goes into review/feedback-<file name>.md for a person
 * to act on. With --dry nothing is changed and only the report is written.
 *
 * Afterwards run `npm run data:build` and `npm test`.
 */
import ExcelJS from 'exceljs';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COLUMNS, LATER_SHEETS, SHEETS } from './review-sheets.ts';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
	console.error('Usage: npm run review:apply -- path/to/returned.xlsx [--dry]');
	process.exit(1);
}

// --- Reading the spreadsheet ------------------------------------------------------

/** A cell's text, whatever Excel stored: plain text, rich text, a formula result or a number. */
function cellText(value: ExcelJS.CellValue): string {
	if (value === null || value === undefined) return '';
	if (typeof value === 'object') {
		if ('richText' in value)
			return value.richText
				.map((part) => part.text)
				.join('')
				.trim();
		if ('result' in value) return String(value.result ?? '').trim();
		if ('text' in value) return String(value.text).trim();
		return '';
	}
	return String(value).trim();
}

interface Row {
	sheet: string;
	line: number;
	/** Every column of the row by its title. */
	cells: Record<string, string>;
}

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(file);

function readRows(sheetName: string): Row[] {
	const sheet = workbook.getWorksheet(sheetName);
	// A review file made before these sheets were added has nothing to read from them.
	if (!sheet && LATER_SHEETS.includes(sheetName)) return [];
	if (!sheet) throw new Error(`The spreadsheet has no sheet called “${sheetName}”`);
	const titles = (sheet.getRow(1).values as ExcelJS.CellValue[]).map(cellText);
	for (const needed of [COLUMNS.status, sheetName === SHEETS.vocabulary ? COLUMNS.id : undefined]) {
		if (needed && !titles.includes(needed)) {
			throw new Error(`Sheet “${sheetName}” has no “${needed}” column; was it renamed?`);
		}
	}
	const rows: Row[] = [];
	sheet.eachRow((row, line) => {
		if (line === 1) return;
		const cells: Record<string, string> = {};
		titles.forEach((title, i) => {
			if (title) cells[title] = cellText(row.getCell(i).value);
		});
		rows.push({ sheet: sheetName, line, cells });
	});
	return rows;
}

const allSheets = Object.values(SHEETS).filter((name) => name !== SHEETS.start);
const rowsBySheet = new Map(allSheets.map((name) => [name, readRows(name)]));

// --- Source files ---------------------------------------------------------------------

const read = (path: string) => readFileSync(`${projectRoot}${path}`, 'utf8');
const unitFiles = ['juz-amma', 'juz-tabarak'].flatMap((dir) =>
	readdirSync(`${projectRoot}data/${dir}`)
		.filter((f) => /^\d+\.ts$/.test(f))
		.map((f) => `data/${dir}/${f}`)
);
const glossFiles = ['data/fatiha-glosses.ts', 'data/juz-amma-glosses.ts', ...unitFiles];
const seedFiles = ['data/lexicon-seeds.ts', ...unitFiles];

const sources = new Map<string, string>();
for (const path of new Set([...glossFiles, ...seedFiles])) sources.set(path, read(path));

const STRING = String.raw`'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"`;
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The value of a string literal as written in source, quotes included. */
function decode(literal: string): string {
	const body = literal.slice(1, -1);
	return body.replace(/\\(.)/g, (_, ch: string) => (ch === 'n' ? '\n' : ch));
}

/** A single-quoted TypeScript string literal for `text`. */
const encode = (text: string) => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const ARABIC = /\p{Script=Arabic}/u;

/** Every card meaning now in the data, lowercased, so a correction cannot create a duplicate. */
const meanings = new Map<string, string>();
for (const path of seedFiles) {
	for (const m of sources
		.get(path)!
		.matchAll(
			new RegExp(String.raw`id:\s*'([a-z]+)',\s*loc:\s*'[^']*',\s*gloss:\s*(${STRING})`, 'g')
		)) {
		meanings.set(decode(m[2]).toLowerCase(), m[1]);
	}
}

interface Applied {
	what: string;
	from: string;
	to: string;
}
const applied: Applied[] = [];
/** Spreadsheet rows whose correction went into the data, as `sheet:line`. */
const appliedRows = new Set<string>();
const skipped: { what: string; reason: string }[] = [];
const touched = new Set<string>();

/** Replaces one string value in the first file that has it. Returns why not if it could not. */
function replaceValue(
	files: string[],
	pattern: (value: string) => RegExp,
	current: string,
	next: string
) {
	for (const path of files) {
		const source = sources.get(path)!;
		const match = pattern(STRING).exec(source);
		if (!match) continue;
		const inSource = decode(match[2]);
		if (inSource !== current) {
			return `the data now says “${inSource}”, not “${current}” as in the spreadsheet, so it is out of date`;
		}
		sources.set(path, source.replace(match[0], `${match[1]}${encode(next)}`));
		touched.add(path);
		return undefined;
	}
	return 'it was not found in the data files';
}

// --- Corrections --------------------------------------------------------------------------

const feedback: string[] = [];
const needsFollowUp: string[] = [];

for (const row of rowsBySheet.get(SHEETS.words)!) {
	const { status, correction } = statusOf(row);
	if (status !== 'change' || !correction) continue;
	const key = row.cells[COLUMNS.key];
	const current = row.cells[COLUMNS.gloss];
	const what = `word ${key} (${row.cells['Arabic']})`;
	if (ARABIC.test(correction)) {
		skipped.push({ what, reason: 'the correction contains Arabic; glosses are English only' });
		continue;
	}
	const problem = replaceValue(
		glossFiles,
		(string) => new RegExp(String.raw`('${escapeRegex(key)}':\s*)(${string})`),
		current,
		correction
	);
	if (problem) skipped.push({ what, reason: problem });
	else {
		applied.push({ what, from: current, to: correction });
		appliedRows.add(`${row.sheet}:${row.line}`);
	}
}

for (const row of rowsBySheet.get(SHEETS.vocabulary)!) {
	const { status, correction } = statusOf(row);
	if (status !== 'change' || !correction) continue;
	const id = row.cells[COLUMNS.id];
	const current = row.cells[COLUMNS.meaning];
	const what = `card ${id} (${row.cells['Arabic (dictionary form)']})`;
	if (ARABIC.test(correction)) {
		skipped.push({ what, reason: 'the correction contains Arabic; meanings are English only' });
		continue;
	}
	const clash = meanings.get(correction.toLowerCase());
	if (clash && clash !== id) {
		skipped.push({ what, reason: `“${correction}” is already the meaning of the card ${clash}` });
		continue;
	}
	const problem = replaceValue(
		seedFiles,
		(string) =>
			new RegExp(
				String.raw`(id:\s*'${escapeRegex(id)}',\s*loc:\s*'[^']*',\s*gloss:\s*)(${string})`
			),
		current,
		correction
	);
	if (problem) skipped.push({ what, reason: problem });
	else {
		meanings.delete(current.toLowerCase());
		meanings.set(correction.toLowerCase(), id);
		applied.push({ what, from: current, to: correction });
		appliedRows.add(`${row.sheet}:${row.line}`);
	}
}

function statusOf(row: Row) {
	return {
		status: row.cells[COLUMNS.status].toLowerCase(),
		correction: row.cells[COLUMNS.correction] ?? ''
	};
}

// --- Everything else the reviewer wrote ----------------------------------------------------

/** A short description of a row for the report: the first cells that identify it. */
function describe(row: Row): string {
	const c = row.cells;
	if (row.sheet === SHEETS.words) return `${c[COLUMNS.key]} ${c['Arabic']} “${c[COLUMNS.gloss]}”`;
	if (row.sheet === SHEETS.vocabulary)
		return `${c[COLUMNS.id]} ${c['Arabic (dictionary form)']} “${c[COLUMNS.meaning]}”`;
	if (row.sheet === SHEETS.verses)
		return `${c['Verse']}: ${c['Word-by-word English, in reading order']}`;
	if (row.sheet === SHEETS.lessonText) return `${c['Lesson']}, “${c['Heading'] || c['Kind']}”`;
	if (row.sheet === SHEETS.letters) return `${c['Letter']} ${c['Name']}: “${c[COLUMNS.gloss]}”`;
	if (row.sheet === SHEETS.titles)
		return `${c['Kind']} “${c['Title']}”: ${c['Summary learners read']}`;
	return `${c['Lesson']}: ${c['Question']}`;
}

const counts = { ok: 0, change: 0, unsure: 0, untouched: 0 };
for (const [sheet, rows] of rowsBySheet) {
	for (const row of rows) {
		const status = row.cells[COLUMNS.status].toLowerCase();
		const comment = row.cells[COLUMNS.comment] ?? '';
		if (status === 'ok') counts.ok++;
		else if (status === 'change') counts.change++;
		else if (status === 'unsure') counts.unsure++;
		else counts.untouched++;
		const label = `**${sheet}**, row ${row.line}: ${describe(row)}`;
		const wasApplied = appliedRows.has(`${sheet}:${row.line}`);
		if (
			status === 'change' &&
			!row.cells[COLUMNS.correction] &&
			(sheet === SHEETS.words || sheet === SHEETS.vocabulary)
		) {
			needsFollowUp.push(
				`- ${label}\n  Marked Change but no Correction.${comment ? ` Comment: ${comment}` : ''}`
			);
		} else if (status === 'change' && sheet !== SHEETS.words && sheet !== SHEETS.vocabulary) {
			needsFollowUp.push(
				`- ${label}\n  Marked Change.${comment ? ` ${comment}` : ' (no comment)'}`
			);
		} else if (status === 'unsure') {
			needsFollowUp.push(`- ${label}\n  Marked Unsure.${comment ? ` ${comment}` : ''}`);
		} else if (comment && !wasApplied) {
			feedback.push(`- ${label}\n  ${comment}`);
		} else if (comment) {
			feedback.push(`- ${label}\n  ${comment} (correction applied)`);
		}
	}
}

// --- Writing the files and the report ---------------------------------------------------------

if (!dry) {
	for (const path of touched) writeFileSync(`${projectRoot}${path}`, sources.get(path)!);
	if (touched.size > 0) {
		execFileSync('npx', ['prettier', '--write', ...touched], { cwd: projectRoot, stdio: 'ignore' });
	}
}

const list = (items: string[]) => (items.length > 0 ? items.join('\n') : '_None._');
const report = [
	`# Review feedback from ${file}`,
	'',
	`Rows: ${counts.ok} OK, ${counts.change} Change, ${counts.unsure} Unsure, ${counts.untouched} not looked at.`,
	dry ? '**Dry run: no data files were changed.**' : '',
	'',
	`## Corrections ${dry ? 'that would be applied' : 'applied'} (${applied.length})`,
	'',
	list(applied.map((a) => `- ${a.what}: “${a.from}” → “${a.to}”`)),
	'',
	`## Corrections that could not be applied (${skipped.length})`,
	'',
	list(skipped.map((s) => `- ${s.what}: ${s.reason}`)),
	'',
	`## Needs a person (${needsFollowUp.length})`,
	'',
	list(needsFollowUp),
	'',
	`## Other comments (${feedback.length})`,
	'',
	list(feedback),
	''
].join('\n');
mkdirSync(`${projectRoot}review`, { recursive: true });
const reportPath = `review/feedback-${basename(file, '.xlsx')}.md`;
writeFileSync(`${projectRoot}${reportPath}`, report);

console.log(
	`${dry ? 'Would apply' : 'Applied'} ${applied.length} corrections, ${skipped.length} could not be applied, ` +
		`${needsFollowUp.length} need a person, ${feedback.length} other comments.\n` +
		`Report: ${reportPath}` +
		(!dry && touched.size > 0 ? '\nNext: npm run data:build && npm test' : '')
);
