import fatihaJson from './generated/fatiha.json';
import lexiconJson from './generated/lexicon.json';
import type { FatihaData, Lexeme, LexiconData, Verse, Word } from './types';

export const fatiha = fatihaJson as unknown as FatihaData;
export const lexicon = lexiconJson as unknown as LexiconData;

const lexemes = new Map(lexicon.lexemes.map((l) => [l.id, l]));

export function lexemeById(id: string): Lexeme {
	const lexeme = lexemes.get(id);
	if (!lexeme) throw new Error(`Unknown lexeme: ${id}`);
	return lexeme;
}

export function verse(ayah: number): Verse {
	const found = fatiha.verses.find((v) => v.ayah === ayah);
	if (!found) throw new Error(`Unknown verse: 1:${ayah}`);
	return found;
}

/** Words `from`..`to` (1-based, inclusive) of a verse of Al-Fatiha. */
export function phraseWords(ayah: number, from: number, to: number): Word[] {
	const words = verse(ayah).words.filter((w) => w.n >= from && w.n <= to);
	if (words.length !== to - from + 1) throw new Error(`Bad phrase range 1:${ayah}:${from}-${to}`);
	return words;
}

/** `رحم` → `ر-ح-م`. Hyphens keep the letters unjoined, the traditional way to show a root. */
export function formatRoot(root: string): string {
	return [...root].join('-');
}

export const DATA_ATTRIBUTION = {
	corpus: 'Quranic Arabic Corpus v0.4 by Kais Dukes (GNU GPL), https://corpus.quran.com',
	fork: 'Corrected fork by mustafa0x, https://github.com/mustafa0x/quran-morphology'
};
