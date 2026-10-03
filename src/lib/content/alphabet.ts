import type { Letter } from './types';

const ZWJ = '‍';

/** Letters in traditional order. Six letters never join to the letter after them. */
export const letters: Letter[] = [
	{ id: 'alif', glyph: 'ا', name: 'alif', sound: 'a long “aa”, as in “father”', joins: false },
	{ id: 'ba', glyph: 'ب', name: 'bāʾ', sound: '“b” as in “book”', joins: true },
	{ id: 'ta', glyph: 'ت', name: 'tāʾ', sound: '“t” as in “tea”', joins: true },
	{ id: 'tha', glyph: 'ث', name: 'thāʾ', sound: '“th” as in “think”', joins: true },
	{ id: 'jim', glyph: 'ج', name: 'jīm', sound: '“j” as in “jam”', joins: true },
	{
		id: 'ha',
		glyph: 'ح',
		name: 'ḥāʾ',
		sound: 'a breathy “h” from the throat, like fogging a mirror',
		joins: true
	},
	{ id: 'kha', glyph: 'خ', name: 'khāʾ', sound: 'like the “ch” in Scottish “loch”', joins: true },
	{ id: 'dal', glyph: 'د', name: 'dāl', sound: '“d” as in “door”', joins: false },
	{ id: 'dhal', glyph: 'ذ', name: 'dhāl', sound: '“th” as in “this”', joins: false },
	{ id: 'ra', glyph: 'ر', name: 'rāʾ', sound: 'a lightly rolled “r”', joins: false },
	{ id: 'zay', glyph: 'ز', name: 'zāy', sound: '“z” as in “zoo”', joins: false },
	{ id: 'sin', glyph: 'س', name: 'sīn', sound: '“s” as in “sun”', joins: true },
	{ id: 'shin', glyph: 'ش', name: 'shīn', sound: '“sh” as in “ship”', joins: true },
	{ id: 'sad', glyph: 'ص', name: 'ṣād', sound: 'a heavy, deep “s”', joins: true },
	{ id: 'dad', glyph: 'ض', name: 'ḍād', sound: 'a heavy, deep “d”', joins: true },
	{ id: 'tah', glyph: 'ط', name: 'ṭāʾ', sound: 'a heavy, deep “t”', joins: true },
	{ id: 'zah', glyph: 'ظ', name: 'ẓāʾ', sound: 'a heavy “th”, as in “this”', joins: true },
	{
		id: 'ayn',
		glyph: 'ع',
		name: 'ʿayn',
		sound: 'a deep sound from the middle of the throat; English has none',
		joins: true
	},
	{
		id: 'ghayn',
		glyph: 'غ',
		name: 'ghayn',
		sound: 'a gargled “r”, like the French “r”',
		joins: true
	},
	{ id: 'fa', glyph: 'ف', name: 'fāʾ', sound: '“f” as in “fish”', joins: true },
	{
		id: 'qaf',
		glyph: 'ق',
		name: 'qāf',
		sound: 'a deep “k” from the back of the throat',
		joins: true
	},
	{ id: 'kaf', glyph: 'ك', name: 'kāf', sound: '“k” as in “king”', joins: true },
	{ id: 'lam', glyph: 'ل', name: 'lām', sound: '“l” as in “light”', joins: true },
	{ id: 'mim', glyph: 'م', name: 'mīm', sound: '“m” as in “moon”', joins: true },
	{ id: 'nun', glyph: 'ن', name: 'nūn', sound: '“n” as in “noon”', joins: true },
	{ id: 'heh', glyph: 'ه', name: 'hāʾ', sound: '“h” as in “hat”', joins: true },
	{ id: 'waw', glyph: 'و', name: 'wāw', sound: '“w” as in “water”, or a long “oo”', joins: false },
	{ id: 'ya', glyph: 'ي', name: 'yāʾ', sound: '“y” as in “yes”, or a long “ee”', joins: true }
];

const byId = new Map(letters.map((l) => [l.id, l]));

export function letterById(id: string): Letter {
	const letter = byId.get(id);
	if (!letter) throw new Error(`Unknown letter: ${id}`);
	return letter;
}

export interface LetterForms {
	isolated: string;
	initial?: string;
	medial?: string;
	final: string;
}

/**
 * The four written shapes of a letter. A zero-width joiner next to the letter
 * asks the font for the joined shape, so no shapes are typed by hand.
 */
export function letterForms(letter: Letter): LetterForms {
	const g = letter.glyph;
	return letter.joins
		? { isolated: g, initial: g + ZWJ, medial: ZWJ + g + ZWJ, final: ZWJ + g }
		: { isolated: g, final: ZWJ + g };
}
