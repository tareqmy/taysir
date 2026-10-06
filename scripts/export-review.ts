/**
 * Writes the spreadsheets a teacher uses to review all the English in the course.
 *
 *   npm run review:export             all parts, plus one file with everything
 *   npm run review:export -- --part=2 only part 2
 *
 * Output goes to review/ (not committed; regenerate whenever the content changes):
 *   Taysir-review-part-N-….xlsx  one part of the course (see PARTS), a few hours of review each
 *   Taysir-review.xlsx           everything in one file
 *   Message-to-reviewer.md       a draft message to send with the files, with time estimates
 * Send the files, then apply what comes back with `npm run review:apply`.
 *
 * The lesson content is loaded through Vite, so the spreadsheet shows exactly what the app shows,
 * including the Arabic that lesson prose pulls in from the corpus.
 */
import ExcelJS from 'exceljs';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import type { Lesson, Letter, Unit } from '../src/lib/content/types.ts';
import type { Lexeme, LexiconData, Verse, VerseData } from '../src/lib/data/types.ts';
import {
	COLUMNS,
	PARTS,
	partFileName,
	SHEETS,
	STATUSES,
	WHOLE_FILE_NAME,
	type Part
} from './review-sheets.ts';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const outputDir = `${projectRoot}review`;

const onlyPart = process.argv
	.slice(2)
	.find((arg) => arg.startsWith('--part='))
	?.slice('--part='.length);
if (onlyPart !== undefined && !PARTS.some((p) => String(p.n) === onlyPart)) {
	console.error(`There is no part ${onlyPart}; the parts are 1 to ${PARTS.length}.`);
	process.exit(1);
}

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
const alphabet = (await server.ssrLoadModule('/src/lib/content/alphabet.ts')) as {
	letters: Letter[];
};
await server.close();

/** Entries the authors of the draft glosses said they were least sure of. */
const reviewNotes = readFileSync(`${projectRoot}data/juz-amma/REVIEW.md`, 'utf8');
const flagged = new Set([...reviewNotes.matchAll(/`([^`]+)`/g)].map((m) => m[1]));

const verseRef = (v: Verse) => `${data.surahName(v.surah)} ${v.surah}:${v.ayah}`;
const posNames = { noun: 'noun', verb: 'verb', particle: 'small word' } as const;

function verse(surah: number, ayah: number): Verse {
	const found = data.verseData.verses.find((v) => v.surah === surah && v.ayah === ayah);
	if (!found) throw new Error(`No verse ${surah}:${ayah}`);
	return found;
}

/** Which vocabulary lesson teaches each word, for the “Taught in lesson” column. */
const lessonOfCard = new Map<string, Lesson>();
for (const lesson of course.lessons) {
	if (lesson.kind !== 'vocabulary') continue;
	for (const cardId of lesson.cardIds) lessonOfCard.set(cardId.replace(/^lx:/, ''), lesson);
}

// --- What a file covers -------------------------------------------------------------------

interface Scope {
	title: string;
	/** What to say about the rest of the course. */
	elsewhere: string;
	units: Unit[];
}

/** The verses, words, cards and so on that belong to a scope. */
function contentOf(scope: Scope) {
	const lessons = scope.units.flatMap((u) => u.lessons);
	const surahs = new Set(
		lessons.flatMap((l) =>
			l.intro.flatMap((b) => (b.type === 'verse' || b.type === 'phrase' ? [b.surah] : []))
		)
	);
	const verses = data.verseData.verses.filter((v) => surahs.has(v.surah));
	const cardIds = new Set(lessons.flatMap((l) => l.cardIds.map((id) => id.replace(/^lx:/, ''))));
	const lexemes = data.lexicon.lexemes.filter((l) => cardIds.has(l.id));
	// The letters the lessons show, in the order they are first shown.
	const letterIds = [
		...new Set(lessons.flatMap((l) => l.intro.flatMap((b) => (b.type === 'letters' ? b.ids : []))))
	];
	const letters = letterIds.map((id) => alphabet.letters.find((l) => l.id === id)!);
	return { lessons, surahs: [...surahs].sort((a, b) => b - a), verses, lexemes, letters };
}

/** `Ash-Shams to Al-Humaza (surahs 91 to 104)`: the surahs in the order the sheets list them. */
function surahRange(surahs: number[]): string {
	const [first, last] = [surahs[surahs.length - 1], surahs[0]];
	return `${data.surahName(first)} to ${data.surahName(last)} (surahs ${first} to ${last})`;
}

function scopeOfPart(part: Part): Scope {
	const units = part.unitIds.map((id) => course.units.find((u) => u.id === id)!);
	const { surahs } = contentOf({ title: '', elsewhere: '', units });
	return {
		title: part.title ?? `Juz Amma: ${surahRange(surahs)}`,
		elsewhere: `This is part ${part.n} of ${PARTS.length}. The other parts are separate files; each can be reviewed on its own.`,
		units
	};
}

const wholeScope: Scope = {
	title: 'The whole course',
	elsewhere: 'This file has everything. The same content is also split into smaller parts.',
	units: course.units
};

// --- Building a workbook --------------------------------------------------------------------

const ARABIC_FONT = { name: 'Arial', size: 16 };
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F5C4A' } } as const;
const FLAG_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } } as const;

interface Column {
	header: string;
	width: number;
	arabic?: boolean;
	wrap?: boolean;
}

const statusColumns: Column[] = [
	{ header: COLUMNS.status, width: 12 },
	{ header: COLUMNS.comment, width: 50, wrap: true }
];

interface Counts {
	verses: number;
	words: number;
	cards: number;
	text: number;
	exercises: number;
	letters: number;
	titles: number;
}

/** Rough review time in minutes: my estimate, since reviewers differ. */
const estimateMinutes = (c: Counts) =>
	(c.words * 8 +
		c.cards * 15 +
		c.verses * 20 +
		c.text * 90 +
		c.exercises * 45 +
		c.letters * 120 +
		c.titles * 30) /
	60;

function buildWorkbook(scope: Scope): { workbook: ExcelJS.Workbook; counts: Counts } {
	const workbook = new ExcelJS.Workbook();
	workbook.creator = 'Taysir';
	workbook.created = new Date();
	const content = contentOf(scope);

	/** Adds a sheet with a frozen, filterable header row. `rows` hold one value per column. */
	function addTable(name: string, columns: Column[], rows: (string | number)[][]) {
		const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
		sheet.columns = columns.map((c) => ({ header: c.header, width: c.width }));
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
		const header = sheet.getRow(1);
		header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
		header.fill = HEADER_FILL;
		header.alignment = { vertical: 'middle', wrapText: true };
		header.height = 24;
		sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
		return sheet;
	}

	/** Turns one column into a Status dropdown. */
	function addStatusDropdown(sheet: ExcelJS.Worksheet, header: string) {
		const index = (sheet.getRow(1).values as (string | undefined)[]).indexOf(header);
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

	// Rows for each sheet, from the content of this scope only.
	const wordRows = content.verses.flatMap((v) =>
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
	);
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

	const lessonTextRows: string[][] = [];
	for (const unit of scope.units) {
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

	const exerciseRows: string[][] = [];
	for (const lesson of content.lessons.filter((l) => l.kind === 'grammar')) {
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

	// How each letter is described in English (the sounds), as the lessons show it.
	const letterRows = content.letters.map((l) => [
		l.id,
		l.glyph,
		l.name,
		l.sound,
		l.joins ? 'yes' : 'no',
		'',
		'',
		''
	]);

	// The one-line summaries on the lesson list, and the description of each unit.
	const titleRows = scope.units.flatMap((unit) => [
		[unit.title, 'Unit', unit.title, unit.description, '', '', ''],
		...unit.lessons.map((lesson) => [
			unit.title,
			'Lesson',
			lesson.title,
			lesson.subtitle,
			'',
			'',
			''
		])
	]);

	const counts: Counts = {
		verses: content.verses.length,
		words: wordRows.length,
		cards: content.lexemes.length,
		text: lessonTextRows.length,
		exercises: exerciseRows.length,
		letters: letterRows.length,
		titles: titleRows.length
	};

	// --- Start here
	const start = workbook.addWorksheet(SHEETS.start);
	start.getColumn(1).width = 110;
	const minutes = estimateMinutes(counts);
	const instructions: [string, boolean][] = [
		['Taysir: review of the English in the course', true],
		[scope.title, true],
		['', false],
		[
			`In this file: ${counts.verses} verses, ${counts.words} words, ${counts.cards} vocabulary cards, ${counts.text} pieces of lesson text, ${counts.exercises} grammar exercises${counts.letters > 0 ? `, ${counts.letters} letter descriptions` : ''} and ${counts.titles} titles and summaries. ${scope.elsewhere}`,
			false
		],
		[
			`A rough estimate of the time is ${formatDuration(minutes)}, but it varies a great deal from person to person, and you are welcome to review only part of it.`,
			false
		],
		['', false],
		[
			'Taysir teaches the Arabic of the Quran from real verses. The Arabic text, roots and grammar tags come from the Quranic Arabic Corpus and are not under review. Everything in English is: the word-by-word glosses under each verse, the meanings on vocabulary cards, and the short teaching notes. All of it is a draft written without a teacher, so your corrections matter.',
			false
		],
		['', false],
		['How to review', true],
		[
			'1. “Verses”: read each verse with its word-by-word English. Learners also see that English joined into one line, as the meaning of the whole verse, in questions such as “What does this verse say?”, so it should be understandable as a line. If a verse reads wrongly, note it in Comment, then fix the specific word on the “Words” sheet (filter its Verse column).',
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
		...(counts.letters > 0
			? ([
					[
						'5. “Letters”: how each letter is described to an English speaker, for example “a deep sound from the middle of the throat”. These are the first thing a learner reads, so please say whether each description would lead them to the right sound, and what you would say instead. Mark Change and put your wording in Correction.',
						false
					]
				] as [string, boolean][])
			: []),
		[
			`${counts.letters > 0 ? '6' : '5'}. “Titles and summaries”: the title and one-line summary of each lesson, as they appear on the lesson list, and a short description of each unit. Some summarise what the verses say, for example “A gift and two commands”. A quick skim is enough: please flag any that overstate or mislead.`,
			false
		],
		[
			'Use Status OK when you have checked a row and it is right, Unsure when you are not certain. A blank Status means not looked at.',
			false
		],
		['', false],
		['If you are short of time', true],
		[
			'Filter the Flagged column to yes on the Words and Vocabulary sheets. Those are the entries the authors of the draft were least sure of (disputed meanings, loose renderings), and they are shaded yellow. A few conventions to confirm: verbs after “when” or “whoever” are glossed in the present or future although the corpus tags them as past; capitalisation of titles such as the Hour or the Garden; wording of the oath verses of Ash-Shams and others.',
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

	// --- Verses
	const versesSheet = addTable(
		SHEETS.verses,
		[
			{ header: 'Verse', width: 22 },
			{ header: 'Arabic', width: 60, arabic: true },
			{ header: 'Word-by-word English, in reading order', width: 60, wrap: true },
			...statusColumns
		],
		content.verses.map((v) => [
			verseRef(v),
			v.words.map((w) => w.text).join(' '),
			v.words.map((w) => w.gloss).join(' | '),
			'',
			''
		])
	);
	addStatusDropdown(versesSheet, COLUMNS.status);

	// --- Words
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
		wordRows
	);
	addStatusDropdown(wordsSheet, COLUMNS.status);
	shadeFlagged(wordsSheet, 'Flagged');

	// --- Vocabulary
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
		content.lexemes.map(lexemeRow)
	);
	addStatusDropdown(vocabularySheet, COLUMNS.status);
	shadeFlagged(vocabularySheet, 'Flagged');

	// --- Lesson text
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

	// --- Grammar exercises
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

	// --- Letters
	const lettersSheet = addTable(
		SHEETS.letters,
		[
			{ header: COLUMNS.key, width: 10 },
			{ header: 'Letter', width: 10, arabic: true },
			{ header: 'Name', width: 12 },
			{ header: COLUMNS.gloss, width: 60, wrap: true },
			{ header: 'Joins the next letter', width: 12 },
			{ header: COLUMNS.status, width: 12 },
			{ header: COLUMNS.correction, width: 40, wrap: true },
			{ header: COLUMNS.comment, width: 40, wrap: true }
		],
		letterRows
	);
	addStatusDropdown(lettersSheet, COLUMNS.status);

	// --- Titles and summaries
	const titlesSheet = addTable(
		SHEETS.titles,
		[
			{ header: 'Unit', width: 28, wrap: true },
			{ header: 'Kind', width: 9 },
			{ header: 'Title', width: 34, wrap: true },
			{ header: 'Summary learners read', width: 70, wrap: true },
			{ header: COLUMNS.status, width: 12 },
			{ header: COLUMNS.correction, width: 40, wrap: true },
			{ header: COLUMNS.comment, width: 40, wrap: true }
		],
		titleRows
	);
	addStatusDropdown(titlesSheet, COLUMNS.status);

	return { workbook, counts };
}

/** “about 45 minutes”, “about 2½ hours”. */
function formatDuration(minutes: number): string {
	if (minutes < 60) return `about ${Math.max(15, Math.round(minutes / 15) * 15)} minutes`;
	const halves = Math.round(minutes / 30);
	const whole = Math.floor(halves / 2);
	const text = halves % 2 === 0 ? `${whole}` : whole === 0 ? '½' : `${whole}½`;
	return `about ${text} ${halves <= 2 ? 'hour' : 'hours'}`;
}

/** What a file holds, in a line. */
function countsText(c: Counts): string {
	return (
		`${c.verses} verses, ${c.words} words, ${c.cards} cards, ${c.text} lesson texts, ` +
		`${c.exercises} exercises, ${c.letters} letters, ${c.titles} titles`
	);
}

// --- Writing the files -------------------------------------------------------------------

mkdirSync(outputDir, { recursive: true });
const summary: { part: Part; title: string; counts: Counts; file: string }[] = [];

for (const part of PARTS) {
	if (onlyPart !== undefined && String(part.n) !== onlyPart) continue;
	const scope = scopeOfPart(part);
	const { workbook, counts } = buildWorkbook(scope);
	await workbook.xlsx.writeFile(`${outputDir}/${partFileName(part)}`);
	summary.push({ part, title: scope.title, counts, file: partFileName(part) });
	console.log(
		`${partFileName(part)}: ${countsText(counts)} (${formatDuration(estimateMinutes(counts))})`
	);
}

if (onlyPart === undefined) {
	const { workbook, counts } = buildWorkbook(wholeScope);
	await workbook.xlsx.writeFile(`${outputDir}/${WHOLE_FILE_NAME}`);
	console.log(
		`${WHOLE_FILE_NAME}: ${countsText(counts)} (${formatDuration(estimateMinutes(counts))})`
	);

	const rows = summary.map(
		({ part, title, counts, file }) =>
			`| ${part.n} | ${title} | ${counts.verses} verses, ${counts.words} words, ${counts.cards} cards, ${counts.text} pieces of lesson text, ${counts.exercises} exercises${counts.letters > 0 ? `, ${counts.letters} letter descriptions` : ''}, ${counts.titles} titles and summaries | ${formatDuration(estimateMinutes(counts))} | \`${file}\` |`
	);
	const message = [
		'# Draft message to a reviewer',
		'',
		'Fill in the names in square brackets, add your own greeting and closing, and adjust the tone to the person. Send it with the spreadsheet files you choose.',
		'',
		'---',
		'',
		'**Subject:** Could you check the English in a Quran-learning app?',
		'',
		'Dear [Name],',
		'',
		'I am building Taysir, a free, open-source app that teaches the Arabic of the Quran through real verses, starting with Juz Amma. The Arabic text, roots and grammar tags come from the Quranic Arabic Corpus. The English is a different matter: the word-by-word meanings under each verse, the vocabulary meanings, the descriptions of how each letter sounds, the short grammar explanations and the one-line lesson summaries were drafted with an AI assistant, not by a teacher, so they need checking by someone qualified before anyone relies on them.',
		'',
		'Would you be willing to look at some of it? It is a spreadsheet. For each row you mark OK, Change or Unsure, and type a better English wording where something is wrong or misleading. The Arabic text itself is not under review (it comes from the Quranic Arabic Corpus); it is shown beside each English line so you can judge the English against it. There is no code to look at. The first sheet in each file explains it step by step.',
		'',
		'It is split into parts so you can take as little or as much as you like, in any order. Parts 1 and 2 are what a learner meets first and matter most; the rest are the remaining surahs of Juz Amma, in the order the app teaches them.',
		'',
		'| Part | What it covers | What is in it | Rough time | File |',
		'| --- | --- | --- | --- | --- |',
		...rows,
		'',
		'These times are only my estimate. If you are short of time, filtering the "Flagged" column to "yes" on the Words and Vocabulary sheets shows the entries I am least sure of.',
		'',
		'[Optional: say what you can offer in return, for example a credit in the app, and how you will handle the corrections.]',
		'',
		'Thank you for considering it,',
		'[Your name]',
		''
	].join('\n');
	writeFileSync(`${outputDir}/Message-to-reviewer.md`, message);
	console.log('Message-to-reviewer.md written.');
}
