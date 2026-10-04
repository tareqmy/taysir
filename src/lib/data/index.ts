import lexiconJson from './generated/lexicon.json';
import versesJson from './generated/verses.json';
import type { Lexeme, LexiconData, Segment, Verse, VerseData, Word } from './types';

export const verseData = versesJson as unknown as VerseData;
export const lexicon = lexiconJson as unknown as LexiconData;

const lexemes = new Map(lexicon.lexemes.map((l) => [l.id, l]));

export function lexemeById(id: string): Lexeme {
	const lexeme = lexemes.get(id);
	if (!lexeme) throw new Error(`Unknown lexeme: ${id}`);
	return lexeme;
}

const verses = new Map(verseData.verses.map((v) => [`${v.surah}:${v.ayah}`, v]));

export function verse(surah: number, ayah: number): Verse {
	const found = verses.get(`${surah}:${ayah}`);
	if (!found) throw new Error(`Unknown verse: ${surah}:${ayah}`);
	return found;
}

/** Words `from`..`to` (1-based, inclusive) of a verse. */
export function phraseWords(surah: number, ayah: number, from: number, to: number): Word[] {
	const words = verse(surah, ayah).words.filter((w) => w.n >= from && w.n <= to);
	if (words.length !== to - from + 1) {
		throw new Error(`Bad phrase range ${surah}:${ayah}:${from}-${to}`);
	}
	return words;
}

/** The pieces a word is made of: one piece, its whole text, when the data lists none. */
export function segmentsOf(word: Word): Segment[] {
	return word.segments ?? [{ text: word.text, tags: [] }];
}

/** The Arabic text of one word, straight from the corpus, for use inside lesson prose. */
export function wordText(surah: number, ayah: number, n: number): string {
	const found = verse(surah, ayah).words.find((w) => w.n === n);
	if (!found) throw new Error(`No word ${surah}:${ayah}:${n}`);
	return found.text;
}

/** `رحم` → `ر-ح-م`. Hyphens keep the letters unjoined, the traditional way to show a root. */
export function formatRoot(root: string): string {
	return [...root].join('-');
}

export { surahName } from './surahs';

export const DATA_ATTRIBUTION = {
	corpus: 'Quranic Arabic Corpus v0.4 by Kais Dukes (GNU GPL), https://corpus.quran.com',
	fork: 'Corrected fork by mustafa0x, https://github.com/mustafa0x/quran-morphology'
};
