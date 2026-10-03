/**
 * Builds the app's Quran data from the Quranic Arabic Corpus morphology file.
 *
 *   npm run data:build
 *
 * Input:  data/source/quran-morphology.txt   (GPL, kept unchanged)
 *         data/lexicon-seeds.ts               (authored meanings, by corpus location)
 *         data/fatiha-glosses.ts              (authored word glosses, Al-Fatiha)
 *         data/juz-amma-glosses.ts            (authored word glosses, surahs 105–114)
 *         data/juz-amma/*.ts                  (authored glosses and meanings, surahs 78–104)
 * Output: src/lib/data/generated/verses.json
 *         src/lib/data/generated/lexicon.json
 *
 * Runs directly on Node (type stripping), so it uses explicit `.ts` imports.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fatihaWordGlosses } from '../data/fatiha-glosses.ts';
import { juzAmmaUnits } from '../data/juz-amma/index.ts';
import { juzAmmaWordGlosses } from '../data/juz-amma-glosses.ts';
import { lexemeSeeds as baseSeeds } from '../data/lexicon-seeds.ts';
import type {
	CorpusPos,
	Lexeme,
	LexiconData,
	Segment,
	Verse,
	VerseData,
	Word
} from '../src/lib/data/types.ts';

/** Surahs the app teaches from: Al-Fatiha, then all of Juz Amma (78–114). */
const SURAHS = [1, ...Array.from({ length: 37 }, (_, i) => 78 + i)];

const lexemeSeeds = [...baseSeeds, ...juzAmmaUnits.flatMap((unit) => unit.seeds)];

const wordGlosses: Record<string, string> = {};
for (const glosses of [
	fatihaWordGlosses,
	juzAmmaWordGlosses,
	...juzAmmaUnits.map((u) => u.glosses)
]) {
	for (const [loc, gloss] of Object.entries(glosses)) {
		if (loc in wordGlosses) throw new Error(`Word ${loc} is glossed in two files`);
		wordGlosses[loc] = gloss;
	}
}

const SOURCE =
	'Quranic Arabic Corpus v0.4 (GNU GPL), Kais Dukes, https://corpus.quran.com; ' +
	'corrected fork: https://github.com/mustafa0x/quran-morphology';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const inputPath = `${projectRoot}data/source/quran-morphology.txt`;
const outputDir = `${projectRoot}src/lib/data/generated`;

interface Row {
	loc: string;
	surah: number;
	ayah: number;
	word: number;
	text: string;
	pos: CorpusPos;
	tags: string[];
	lemma?: string;
	root?: string;
	isAffix: boolean;
}

function parseRows(): Row[] {
	const rows: Row[] = [];
	for (const line of readFileSync(inputPath, 'utf8').split('\n')) {
		if (!line) continue;
		const [loc, text, pos, features] = line.split('\t');
		const [surah, ayah, word] = loc.split(':').map(Number);
		const tags = features.split('|');
		rows.push({
			loc,
			surah,
			ayah,
			word,
			text,
			pos: pos as CorpusPos,
			tags,
			lemma: tags.find((t) => t.startsWith('LEM:'))?.slice(4),
			root: tags.find((t) => t.startsWith('ROOT:'))?.slice(5),
			isAffix: tags.includes('PREF') || tags.includes('SUFF')
		});
	}
	return rows;
}

/** Pronouns, relatives, demonstratives and “when” words behave like particles for a learner. */
const FUNCTION_TAGS = ['REL', 'DEM', 'T'];

function partOfSpeech(row: Row): Lexeme['pos'] {
	if (row.pos === 'V') return 'verb';
	if (row.pos === 'P' || row.tags.some((tag) => FUNCTION_TAGS.includes(tag))) return 'particle';
	return 'noun';
}

const lemmaKey = (row: Row) => `${row.root ?? ''}|${row.lemma}|${row.pos}`;

function buildLexicon(rows: Row[]): LexiconData {
	const stats = new Map<string, { count: number; first: Row }>();
	for (const row of rows) {
		if (row.isAffix || !row.lemma) continue;
		const key = lemmaKey(row);
		const entry = stats.get(key);
		if (entry) entry.count++;
		else stats.set(key, { count: 1, first: row });
	}
	const ranked = [...stats.keys()].sort((a, b) => stats.get(b)!.count - stats.get(a)!.count);
	const rankOf = new Map(ranked.map((key, i) => [key, i + 1]));
	const byLoc = new Map(rows.map((row) => [row.loc, row]));

	const seen = new Set<string>();
	const lexemes: Lexeme[] = lexemeSeeds.map((seed) => {
		if (seen.has(seed.id)) throw new Error(`Duplicate lexeme id: ${seed.id}`);
		seen.add(seed.id);
		const row = byLoc.get(seed.loc);
		if (!row || row.isAffix || !row.lemma) {
			throw new Error(`Seed "${seed.id}" points at ${seed.loc}, which is not a lemma segment`);
		}
		const key = lemmaKey(row);
		return {
			id: seed.id,
			arabic: row.lemma,
			root: row.root,
			pos: partOfSpeech(row),
			gloss: seed.gloss,
			count: stats.get(key)!.count,
			rank: rankOf.get(key)!,
			sample: { loc: seed.loc, form: row.text }
		};
	});
	return { source: SOURCE, lexemes };
}

function buildVerses(rows: Row[], lexicon: LexiconData): VerseData {
	const byLemmaKey = new Map<string, string>();
	const byLoc = new Map(rows.map((row) => [row.loc, row]));
	for (const seed of lexemeSeeds) byLemmaKey.set(lemmaKey(byLoc.get(seed.loc)!), seed.id);
	if (byLemmaKey.size !== lexicon.lexemes.length) {
		throw new Error('Two seeds resolve to the same lemma; each lemma needs one id');
	}

	// Keyed by `surah:ayah`; insertion order follows the corpus, which is already in reading order.
	const verses = new Map<string, Map<number, Row[]>>();
	for (const row of rows) {
		if (!SURAHS.includes(row.surah)) continue;
		const key = `${row.surah}:${row.ayah}`;
		const words = verses.get(key) ?? new Map<number, Row[]>();
		words.set(row.word, [...(words.get(row.word) ?? []), row]);
		verses.set(key, words);
	}

	const out: Verse[] = [...verses.entries()].map(([key, words]) => {
		const [surah, ayah] = key.split(':').map(Number);
		return {
			surah,
			ayah,
			words: [...words.entries()].map(([n, segs]): Word => {
				const gloss = wordGlosses[`${key}:${n}`];
				if (!gloss) throw new Error(`Missing gloss for word ${key}:${n}`);
				const segments: Segment[] = segs.map((s) => ({
					text: s.text,
					pos: s.pos,
					lemma: s.lemma,
					root: s.root,
					tags: s.tags
				}));
				const content = segs.find((s) => !s.isAffix && s.lemma);
				return {
					n,
					text: segs.map((s) => s.text).join(''),
					gloss,
					lexemeId: content ? byLemmaKey.get(lemmaKey(content)) : undefined,
					segments
				};
			})
		};
	});

	const known = new Set(out.flatMap((v) => v.words.map((w) => `${v.surah}:${v.ayah}:${w.n}`)));
	const stale = Object.keys(wordGlosses).filter((loc) => !known.has(loc));
	if (stale.length > 0) throw new Error(`Glosses for words that do not exist: ${stale.join(', ')}`);

	return { source: SOURCE, verses: out };
}

function write(name: string, data: unknown) {
	mkdirSync(outputDir, { recursive: true });
	writeFileSync(`${outputDir}/${name}`, JSON.stringify(data, null, '\t') + '\n');
}

const rows = parseRows();
const lexicon = buildLexicon(rows);
const verseData = buildVerses(rows, lexicon);
write('lexicon.json', lexicon);
write('verses.json', verseData);
console.log(
	`Parsed ${rows.length} segments. Wrote ${lexicon.lexemes.length} lexemes and ` +
		`${verseData.verses.reduce((n, v) => n + v.words.length, 0)} words in ` +
		`${verseData.verses.length} verses of ${SURAHS.length} surahs.`
);
for (const lx of lexicon.lexemes) {
	console.log(
		`${lx.id.padEnd(9)} ${lx.arabic.padEnd(10)} ${lx.root ?? '-'}  x${lx.count}  #${lx.rank}  ${lx.gloss}`
	);
}
