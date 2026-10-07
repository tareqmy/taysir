/**
 * Applies a reviewer's corrections from the review spreadsheet to the data files.
 *
 *   npm run review:apply -- path/to/returned.xlsx [--dry]
 *
 * Rows marked Change with a Correction update the word glosses (sheet “Words”) and the vocabulary
 * meanings (sheet “Vocabulary”) in `data/`. Everything else the reviewer wrote (comments, rows
 * marked Unsure, corrections that could not be applied, and corrections beside any Status but
 * Change) goes into review/feedback-<file name>.md for a person to act on, in the reviewer's own
 * words. With --dry nothing is changed and only the report is written. If prettier cannot format
 * the changed files, they are put back as they were.
 *
 * Afterwards run `npm run data:build` and `npm test`.
 */
import ExcelJS from 'exceljs';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	cleanCorrection,
	decode,
	encode,
	replaceAt,
	statusOf,
	type Status
} from './review-corrections.ts';
import { COLUMNS, LATER_SHEETS, SHEETS, STATUSES } from './review-sheets.ts';

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
	// Without any one of these, every correction on the sheet would be passed over in silence.
	const needed: Record<string, string[]> = {
		[SHEETS.words]: [COLUMNS.key, COLUMNS.gloss, COLUMNS.correction],
		[SHEETS.vocabulary]: [COLUMNS.id, COLUMNS.meaning, COLUMNS.correction]
	};
	for (const column of [COLUMNS.status, ...(needed[sheetName] ?? [])]) {
		if (!titles.includes(column)) {
			throw new Error(`Sheet “${sheetName}” has no “${column}” column; was it renamed?`);
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

/** A data file's text: from `kept` when it has the file, otherwise from disk. */
const read = (path: string, kept?: Map<string, string>) =>
	kept?.get(path) ?? readFileSync(`${projectRoot}${path}`, 'utf8');
const unitFiles = ['juz-amma', 'juz-tabarak'].flatMap((dir) =>
	readdirSync(`${projectRoot}data/${dir}`)
		.filter((f) => /^\d+\.ts$/.test(f))
		.map((f) => `data/${dir}/${f}`)
);
const glossFiles = ['data/fatiha-glosses.ts', 'data/juz-amma-glosses.ts', ...unitFiles];
const seedFiles = ['data/lexicon-seeds.ts', ...unitFiles];

const sources = new Map<string, string>();
for (const path of new Set([...glossFiles, ...seedFiles])) sources.set(path, read(path));
/** The files as they were, to put back if the changed ones cannot be formatted. */
const originals = new Map(sources);

const STRING = String.raw`'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"`;
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
const skipped: { what: string; correction: string; reason: string }[] = [];
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
		sources.set(path, replaceAt(source, match.index, match[0], `${match[1]}${encode(next)}`));
		touched.add(path);
		return undefined;
	}
	return 'it was not found in the data files';
}

// --- Corrections --------------------------------------------------------------------------

const feedback: string[] = [];
const needsFollowUp: string[] = [];

for (const row of rowsBySheet.get(SHEETS.words)!) {
	const { status, correction } = marked(row);
	if (status !== 'change' || !correction) continue;
	const key = row.cells[COLUMNS.key];
	const current = row.cells[COLUMNS.gloss];
	const what = `word ${key} (${row.cells['Arabic']})`;
	if (ARABIC.test(correction)) {
		skipped.push({
			what,
			correction,
			reason: 'the correction contains Arabic; glosses are English only'
		});
		continue;
	}
	const problem = replaceValue(
		glossFiles,
		(string) => new RegExp(String.raw`('${escapeRegex(key)}':\s*)(${string})`),
		current,
		correction
	);
	if (problem) skipped.push({ what, correction, reason: problem });
	else {
		applied.push({ what, from: current, to: correction });
		appliedRows.add(`${row.sheet}:${row.line}`);
	}
}

for (const row of rowsBySheet.get(SHEETS.vocabulary)!) {
	const { status, correction } = marked(row);
	if (status !== 'change' || !correction) continue;
	const id = row.cells[COLUMNS.id];
	const current = row.cells[COLUMNS.meaning];
	const what = `card ${id} (${row.cells['Arabic (dictionary form)']})`;
	if (ARABIC.test(correction)) {
		skipped.push({
			what,
			correction,
			reason: 'the correction contains Arabic; meanings are English only'
		});
		continue;
	}
	const clash = meanings.get(correction.toLowerCase());
	if (clash && clash !== id) {
		skipped.push({ what, correction, reason: `it is already the meaning of the card ${clash}` });
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
	if (problem) skipped.push({ what, correction, reason: problem });
	else {
		meanings.delete(current.toLowerCase());
		meanings.set(correction.toLowerCase(), id);
		applied.push({ what, from: current, to: correction });
		appliedRows.add(`${row.sheet}:${row.line}`);
	}
}

/** How the reviewer marked a row, and their correction as it would go into the data. */
function marked(row: Row): { status: Status; correction: string } {
	return {
		status: statusOf(row.cells[COLUMNS.status]),
		correction: cleanCorrection(row.cells[COLUMNS.correction] ?? '')
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

const counts = { ok: 0, change: 0, unsure: 0, untouched: 0, unknown: 0 };
for (const [sheet, rows] of rowsBySheet) {
	for (const row of rows) {
		const { status, correction } = marked(row);
		const typed = row.cells[COLUMNS.status].trim();
		const comment = row.cells[COLUMNS.comment] ?? '';
		if (status === 'blank') counts.untouched++;
		else counts[status]++;
		const label = `**${sheet}**, row ${row.line}: ${describe(row)}`;
		const wasApplied = appliedRows.has(`${sheet}:${row.line}`);
		const applies = sheet === SHEETS.words || sheet === SHEETS.vocabulary;
		// The reviewer's own words, so a person can act on a row the import did not apply.
		const theirs = [
			correction ? ` Correction: “${correction}”.` : '',
			comment ? ` Comment: ${comment}` : ''
		].join('');
		if (status === 'unknown') {
			needsFollowUp.push(
				`- ${label}\n  Status “${typed}” is not one of ${STATUSES.join(', ')}, so nothing was applied.${theirs}`
			);
		} else if (correction && status !== 'change' && applies) {
			needsFollowUp.push(
				`- ${label}\n  Has a Correction, but Status is ${status === 'blank' ? 'blank' : `“${typed}”`}, not Change, so it was not applied.${theirs}`
			);
		} else if (status === 'change' && !correction && applies) {
			needsFollowUp.push(`- ${label}\n  Marked Change but no Correction.${theirs}`);
		} else if (status === 'change' && !applies) {
			needsFollowUp.push(`- ${label}\n  Marked Change.${theirs || ' (no comment)'}`);
		} else if (status === 'unsure') {
			needsFollowUp.push(`- ${label}\n  Marked Unsure.${theirs}`);
		} else if (correction && !applies) {
			needsFollowUp.push(`- ${label}\n  Has a Correction, but is not marked Change.${theirs}`);
		} else if (comment && !wasApplied) {
			feedback.push(`- ${label}\n  ${comment}`);
		} else if (comment) {
			feedback.push(`- ${label}\n  ${comment} (correction applied)`);
		}
	}
}

// --- Writing the files and the report ---------------------------------------------------------

/** Set when the changed files could not be formatted and were put back as they were. */
let formatFailed = false;
if (!dry) {
	for (const path of touched) writeFileSync(`${projectRoot}${path}`, sources.get(path)!);
	if (touched.size > 0) {
		try {
			execFileSync('npx', ['prettier', '--write', ...touched], {
				cwd: projectRoot,
				stdio: 'ignore'
			});
		} catch {
			// Prettier fails on a file it cannot parse. Leave no broken data file behind.
			for (const path of touched) writeFileSync(`${projectRoot}${path}`, read(path, originals));
			formatFailed = true;
		}
	}
}
const changed = !dry && !formatFailed;

const list = (items: string[]) => (items.length > 0 ? items.join('\n') : '_None._');
const report = [
	`# Review feedback from ${file}`,
	'',
	`Rows: ${counts.ok} OK, ${counts.change} Change, ${counts.unsure} Unsure, ${counts.untouched} not looked at` +
		(counts.unknown > 0 ? `, ${counts.unknown} with a Status the import does not know.` : '.'),
	dry ? '**Dry run: no data files were changed.**' : '',
	formatFailed
		? '**Prettier could not format the changed data files, so they were put back as they were: no data files were changed.** Run `npx prettier --check data` to see why.'
		: '',
	'',
	`## Corrections ${changed ? 'applied' : 'that would be applied'} (${applied.length})`,
	'',
	list(applied.map((a) => `- ${a.what}: “${a.from}” → “${a.to}”`)),
	'',
	`## Corrections that could not be applied (${skipped.length})`,
	'',
	list(skipped.map((s) => `- ${s.what}: “${s.correction}”: ${s.reason}`)),
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
	`${changed ? 'Applied' : 'Would apply'} ${applied.length} corrections, ${skipped.length} could not be applied, ` +
		`${needsFollowUp.length} need a person, ${feedback.length} other comments.\n` +
		`Report: ${reportPath}` +
		(changed && touched.size > 0 ? '\nNext: npm run data:build && npm test' : '')
);
if (formatFailed) {
	console.error('Prettier could not format the changed data files, so nothing was changed.');
	process.exit(1);
}
