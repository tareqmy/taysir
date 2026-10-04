/**
 * Writes the spreadsheet a teacher uses to review all the English in the course.
 *
 *   npm run review:export
 *
 * Output: review/Taysir-review.xlsx (not committed; regenerate whenever the content changes).
 * Send it to the reviewer, then apply what comes back with `npm run review:apply`.
 *
 * The lesson content is loaded through Vite, so the spreadsheet shows exactly what the app shows,
 * including the Arabic that lesson prose pulls in from the corpus.
 */
import ExcelJS from 'exceljs';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { Lesson, Unit } from '../src/lib/content/types.ts';
import type { Lexeme, LexiconData, Verse, VerseData } from '../src/lib/data/types.ts';
import { COLUMNS, SHEETS, STATUSES } from './review-sheets.ts';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const outputDir = `${projectRoot}review`;
const outputFile = `${outputDir}/Taysir-review.xlsx`;

// The project's own config is needed: its tsconfig extends one that only SvelteKit's plugin resolves.
const server = await createServer({
	root: projectRoot,
	configFile: `${projectRoot}vite.config.ts`,
	appType: 'custom',
	logLevel: 'error',
	server: { middlewareMode: true, ws: false, watch: null },
	optimizeDeps: { noDiscovery: true, include: [] }
});
const course = (await server.ssrLoadModule('/src/lib/content/course.ts')) as {
	units: Unit[];
	lessons: Lesson[];
};
const data = (await server.ssrLoadModule('/src/lib/data/index.ts')) as {
	verseData: VerseData;
	lexicon: LexiconData;
	formatRoot: (root: string) => string;
	surahName: (surah: number) => string;
};
await server.close();

/** Entries the authors of the draft glosses said they were least sure of. */
const reviewNotes = readFileSync(`${projectRoot}data/juz-amma/REVIEW.md`, 'utf8');
const flagged = new Set([...reviewNotes.matchAll(/`([^`]+)`/g)].map((m) => m[1]));

const verseRef = (v: Verse) => `${data.surahName(v.surah)} ${v.surah}:${v.ayah}`;
const posNames = { noun: 'noun', verb: 'verb', particle: 'small word' } as const;

// --- Workbook helpers -----------------------------------------------------------

const workbook = new ExcelJS.Workbook();
workbook.creator = 'Taysir';
workbook.created = new Date();

const ARABIC_FONT = { name: 'Arial', size: 16 };
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F5C4A' } } as const;
const FLAG_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } } as const;

interface Column {
	header: string;
	width: number;
	arabic?: boolean;
	wrap?: boolean;
}

/** Adds a sheet with a frozen, filterable header row. `rows` hold one value per column. */
function addTable(name: string, columns: Column[], rows: (string | number)[][]) {
	const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
	sheet.columns = columns.map((c) => ({ header: c.header, width: c.width }));
	const header = sheet.getRow(1);
	header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
	header.fill = HEADER_FILL;
	header.alignment = { vertical: 'middle', wrapText: true };
	header.height = 24;
	for (const values of rows) sheet.addRow(values);
	columns.forEach((column, i) => {
		const cells = sheet.getColumn(i + 1);
		if (column.arabic) {
			cells.font = ARABIC_FONT;
			cells.alignment = {
				horizontal: 'right',
				vertical: 'top',
				readingOrder: 'rtl',
				wrapText: true
			};
		} else {
			cells.alignment = { vertical: 'top', wrapText: column.wrap ?? false };
		}
	});
	header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
	header.alignment = { vertical: 'middle', wrapText: true };
	sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
	return sheet;
}

/** Turns one column into a Status dropdown. */
function addStatusDropdown(sheet: ExcelJS.Worksheet, header: string) {
	const column = sheet.getRow(1).values as (string | undefined)[];
	const index = column.indexOf(header);
	for (let r = 2; r <= sheet.rowCount; r++) {
		sheet.getCell(r, index).dataValidation = {
			type: 'list',
			allowBlank: true,
			formulae: [`"${STATUSES.join(',')}"`]
		};
	}
}

function shadeFlagged(sheet: ExcelJS.Worksheet, flaggedColumn: string) {
	const index = (sheet.getRow(1).values as (string | undefined)[]).indexOf(flaggedColumn);
	for (let r = 2; r <= sheet.rowCount; r++) {
		if (sheet.getCell(r, index).value === 'yes') sheet.getCell(r, index).fill = FLAG_FILL;
	}
}

// --- Start here -------------------------------------------------------------------

const start = workbook.addWorksheet(SHEETS.start);
start.getColumn(1).width = 110;
const instructions: [string, boolean][] = [
	['Taysir: review of the English in the course', true],
	['', false],
	[
		'Taysir teaches the Arabic of the Quran from real verses. The Arabic text, roots and grammar tags come from the Quranic Arabic Corpus and are not under review. Everything in English is: the word-by-word glosses under each verse, the meanings on vocabulary cards, and the short teaching notes. All of it is a draft written without a teacher, so your corrections matter.',
		false
	],
	['', false],
	['How to review', true],
	[
		'1. “Verses”: read each verse with its word-by-word English. If something reads wrongly, say so in Comment. Learners also see that English joined into one line, as the meaning of the whole verse, in questions such as “What does this verse say?”, so it should be understandable as a line.',
		false
	],
	[
		'2. “Words”: one row per word. If a gloss is wrong, set Status to Change and type the replacement in Correction. Glosses are short interlinear aids (usually one to four words), not translations of the verse, and they include attached prefixes and endings, for example “and He sent” or “your Lord”.',
		false
	],
	[
		'3. “Vocabulary”: one row per vocabulary card, with the meaning of the dictionary form. Same rule: Status Change plus Correction. Each meaning must be different from every other card’s meaning.',
		false
	],
	[
		'4. “Lesson text” and “Grammar exercises”: the explanations learners read. Say in Comment what is wrong or misleading. Please flag anything that states a rule too broadly.',
		false
	],
	[
		'Use Status OK when you have checked a row and it is right, Unsure when you are not certain. A blank Status means not looked at.',
		false
	],
	['', false],
	['Where to look first', true],
	[
		'Rows marked Flagged = yes are entries the authors of the draft were least sure of (disputed meanings, loose renderings). They are shaded yellow. A few conventions to confirm: verbs after “when” or “whoever” are glossed in the present or future although the corpus tags them as past; capitalisation of titles such as the Hour or the Garden; wording of the oath verses of Ash-Shams and others.',
		false
	],
	['', false],
	['Returning it', true],
	[
		'Save the file and send it back. Do not rename the sheets or the column titles, and do not insert columns before Status, because corrections are applied by reading those titles.',
		false
	]
];
instructions.forEach(([text, bold], i) => {
	const cell = start.getCell(i + 1, 1);
	cell.value = text;
	cell.font = bold ? { bold: true, size: 14 } : { size: 12 };
	cell.alignment = { wrapText: true, vertical: 'top' };
});

// --- Verses -------------------------------------------------------------------------

const statusColumns: Column[] = [
	{ header: COLUMNS.status, width: 12 },
	{ header: COLUMNS.comment, width: 50, wrap: true }
];

const versesSheet = addTable(
	SHEETS.verses,
	[
		{ header: 'Verse', width: 22 },
		{ header: 'Arabic', width: 60, arabic: true },
		{ header: 'Word-by-word English, in reading order', width: 60, wrap: true },
		...statusColumns
	],
	data.verseData.verses.map((v) => [
		verseRef(v),
		v.words.map((w) => w.text).join(' '),
		v.words.map((w) => w.gloss).join(' | '),
		'',
		''
	])
);
addStatusDropdown(versesSheet, COLUMNS.status);

// --- Words --------------------------------------------------------------------------

const wordsSheet = addTable(
	SHEETS.words,
	[
		{ header: COLUMNS.key, width: 11 },
		{ header: 'Verse', width: 22 },
		{ header: 'Arabic', width: 22, arabic: true },
		{ header: COLUMNS.gloss, width: 30, wrap: true },
		{ header: 'Vocabulary card', width: 14 },
		{ header: 'Flagged', width: 9 },
		{ header: COLUMNS.status, width: 12 },
		{ header: COLUMNS.correction, width: 30, wrap: true },
		{ header: COLUMNS.comment, width: 40, wrap: true }
	],
	data.verseData.verses.flatMap((v) =>
		v.words.map((w) => {
			const key = `${v.surah}:${v.ayah}:${w.n}`;
			return [
				key,
				verseRef(v),
				w.text,
				w.gloss,
				w.lexemeId ?? '',
				flagged.has(key) ? 'yes' : '',
				'',
				'',
				''
			];
		})
	)
);
addStatusDropdown(wordsSheet, COLUMNS.status);
shadeFlagged(wordsSheet, 'Flagged');

// --- Vocabulary ---------------------------------------------------------------------

const lessonOfCard = new Map<string, Lesson>();
for (const lesson of course.lessons) {
	if (lesson.kind !== 'vocabulary') continue;
	for (const cardId of lesson.cardIds) lessonOfCard.set(cardId.replace(/^lx:/, ''), lesson);
}
const lexemeRow = (l: Lexeme) => [
	l.id,
	l.arabic,
	l.root ? data.formatRoot(l.root) : '',
	posNames[l.pos],
	l.count,
	l.gloss,
	`${l.sample.form} (${l.sample.loc.split(':').slice(0, 3).join(':')})`,
	lessonOfCard.get(l.id)?.title ?? '',
	flagged.has(l.id) ? 'yes' : '',
	'',
	'',
	''
];
const vocabularySheet = addTable(
	SHEETS.vocabulary,
	[
		{ header: COLUMNS.id, width: 12 },
		{ header: 'Arabic (dictionary form)', width: 20, arabic: true },
		{ header: 'Root', width: 10, arabic: true },
		{ header: 'Type', width: 10 },
		{ header: 'Times in the Quran', width: 11 },
		{ header: COLUMNS.meaning, width: 34, wrap: true },
		{ header: 'Seen as', width: 24 },
		{ header: 'Taught in lesson', width: 28 },
		{ header: 'Flagged', width: 9 },
		{ header: COLUMNS.status, width: 12 },
		{ header: COLUMNS.correction, width: 30, wrap: true },
		{ header: COLUMNS.comment, width: 40, wrap: true }
	],
	data.lexicon.lexemes.map(lexemeRow)
);
addStatusDropdown(vocabularySheet, COLUMNS.status);
shadeFlagged(vocabularySheet, 'Flagged');

// --- Lesson text ----------------------------------------------------------------------

const lessonTextRows: string[][] = [];
for (const unit of course.units) {
	for (const lesson of unit.lessons) {
		for (const block of lesson.intro) {
			const where = [unit.title, `${lesson.title} (${lesson.id})`];
			if (block.type === 'text')
				lessonTextRows.push([...where, 'Note', block.title ?? '', block.body, '', '']);
			else if (block.type === 'rule')
				lessonTextRows.push([...where, 'Grammar rule', block.title, block.body, '', '']);
			else if (block.type === 'root' && block.body)
				lessonTextRows.push([...where, 'Root family', '', block.body, '', '']);
			else if (block.type === 'phrase') {
				const words = verse(block.surah, block.ayah)
					.words.filter((w) => w.n >= block.from && w.n <= block.to)
					.map((w) => w.text)
					.join(' ');
				lessonTextRows.push([
					...where,
					'Phrase',
					`${data.surahName(block.surah)} ${block.surah}:${block.ayah}: ${words}`,
					[`“${block.translation}”`, block.note].filter(Boolean).join('\n'),
					'',
					''
				]);
			} else if (block.type === 'verse' && block.note) {
				lessonTextRows.push([
					...where,
					'Verse note',
					`${data.surahName(block.surah)} ${block.surah}:${block.ayah}`,
					block.note,
					'',
					''
				]);
			}
		}
	}
}
function verse(surah: number, ayah: number): Verse {
	const found = data.verseData.verses.find((v) => v.surah === surah && v.ayah === ayah);
	if (!found) throw new Error(`No verse ${surah}:${ayah}`);
	return found;
}
const lessonTextSheet = addTable(
	SHEETS.lessonText,
	[
		{ header: 'Unit', width: 26, wrap: true },
		{ header: 'Lesson', width: 30, wrap: true },
		{ header: 'Kind', width: 13 },
		{ header: 'Heading', width: 28, wrap: true },
		{ header: 'Text learners read', width: 80, wrap: true },
		...statusColumns
	],
	lessonTextRows
);
addStatusDropdown(lessonTextSheet, COLUMNS.status);

// --- Grammar exercises ------------------------------------------------------------------

const exerciseRows: string[][] = [];
for (const lesson of course.lessons.filter((l) => l.kind === 'grammar')) {
	for (const ex of lesson.exercises) {
		if (ex.kind === 'choose') {
			const correct = ex.choices.find((c) => c.id === ex.answerId)!.chunk.text;
			const others = ex.choices.filter((c) => c.id !== ex.answerId).map((c) => c.chunk.text);
			exerciseRows.push([
				lesson.title,
				ex.question,
				ex.prompt?.text ?? '',
				correct,
				others.join(' | '),
				ex.explanation ?? '',
				'',
				''
			]);
		} else if (ex.kind === 'match') {
			exerciseRows.push([
				lesson.title,
				ex.question,
				'',
				ex.pairs.map((p) => `${p.left.text} = ${p.right.text}`).join('\n'),
				'',
				ex.explanation ?? '',
				'',
				''
			]);
		} else if (ex.kind === 'build') {
			exerciseRows.push([
				lesson.title,
				ex.question,
				ex.prompt.text,
				ex.answer.map((t) => t.chunk.text).join(' '),
				ex.extras.map((t) => t.chunk.text).join(' | '),
				ex.explanation ?? '',
				'',
				''
			]);
		}
	}
}
const exercisesSheet = addTable(
	SHEETS.exercises,
	[
		{ header: 'Lesson', width: 26, wrap: true },
		{ header: 'Question', width: 40, wrap: true },
		{ header: 'Shown to the learner', width: 28, wrap: true, arabic: true },
		{ header: 'Marked correct', width: 36, wrap: true },
		{ header: 'Marked wrong', width: 36, wrap: true },
		{ header: 'Explanation shown after answering', width: 50, wrap: true },
		...statusColumns
	],
	exerciseRows
);
addStatusDropdown(exercisesSheet, COLUMNS.status);

mkdirSync(outputDir, { recursive: true });
await workbook.xlsx.writeFile(outputFile);
console.log(
	`Wrote ${outputFile}\n` +
		`  ${data.verseData.verses.length} verses, ` +
		`${data.verseData.verses.reduce((n, v) => n + v.words.length, 0)} words, ` +
		`${data.lexicon.lexemes.length} vocabulary cards, ${lessonTextRows.length} pieces of lesson text, ` +
		`${exerciseRows.length} grammar exercises`
);
