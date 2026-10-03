/**
 * Builds the app's Quran data from the Quranic Arabic Corpus morphology file.
 *
 *   npm run data:build
 *
 * Input:  data/source/quran-morphology.txt   (GPL, kept unchanged)
 *         data/lexicon-seeds.ts               (authored meanings, by corpus location)
 *         data/fatiha-glosses.ts              (authored word glosses)
 * Output: src/lib/data/generated/fatiha.json
 *         src/lib/data/generated/lexicon.json
 *
 * Runs directly on Node (type stripping), so it uses explicit `.ts` imports.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fatihaWordGlosses } from '../data/fatiha-glosses.ts';
import { lexemeSeeds } from '../data/lexicon-seeds.ts';
import type {
	CorpusPos,
	FatihaData,
	Lexeme,
	LexiconData,
	Segment,
	Verse,
	Word
} from '../src/lib/data/types.ts';

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
			pos: row.pos === 'V' ? 'verb' : row.pos === 'P' ? 'particle' : 'noun',
			gloss: seed.gloss,
			count: stats.get(key)!.count,
			rank: rankOf.get(key)!,
			sample: { loc: seed.loc, form: row.text }
		};
	});
	return { source: SOURCE, lexemes };
}

function buildFatiha(rows: Row[], lexicon: LexiconData): FatihaData {
	const byLemmaKey = new Map<string, string>();
	const byLoc = new Map(rows.map((row) => [row.loc, row]));
	for (const seed of lexemeSeeds) byLemmaKey.set(lemmaKey(byLoc.get(seed.loc)!), seed.id);
	if (byLemmaKey.size !== lexicon.lexemes.length) {
		throw new Error('Two seeds resolve to the same lemma; each lemma needs one id');
	}

	const verses = new Map<number, Map<number, Row[]>>();
	for (const row of rows) {
		if (row.surah !== 1) continue;
		const words = verses.get(row.ayah) ?? new Map<number, Row[]>();
		words.set(row.word, [...(words.get(row.word) ?? []), row]);
		verses.set(row.ayah, words);
	}

	const out: Verse[] = [...verses.entries()].map(([ayah, words]) => ({
		surah: 1,
		ayah,
		words: [...words.entries()].map(([n, segs]): Word => {
			const gloss = fatihaWordGlosses[`1:${ayah}:${n}`];
			if (!gloss) throw new Error(`Missing gloss for word 1:${ayah}:${n}`);
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
	}));
	return { source: SOURCE, verses: out };
}

function write(name: string, data: unknown) {
	mkdirSync(outputDir, { recursive: true });
	writeFileSync(`${outputDir}/${name}`, JSON.stringify(data, null, '\t') + '\n');
}

const rows = parseRows();
const lexicon = buildLexicon(rows);
const fatiha = buildFatiha(rows, lexicon);
write('lexicon.json', lexicon);
write('fatiha.json', fatiha);
console.log(
	`Parsed ${rows.length} segments. Wrote ${lexicon.lexemes.length} lexemes and ` +
		`${fatiha.verses.reduce((n, v) => n + v.words.length, 0)} Al-Fatiha words.`
);
for (const lx of lexicon.lexemes) {
	console.log(
		`${lx.id.padEnd(9)} ${lx.arabic.padEnd(10)} ${lx.root ?? '-'}  x${lx.count}  #${lx.rank}  ${lx.gloss}`
	);
}
