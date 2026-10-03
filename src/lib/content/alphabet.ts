import { wordAudioFromLoc } from '../audio';
import { verse } from '../data';
import type { Letter } from './types';

const ZWJ = '‍';

/** Letters in traditional order. Six letters never join to the letter after them. */
export const letters: Letter[] = [
	{
		id: 'alif',
		glyph: 'ا',
		name: 'alif',
		sound: 'a long “aa”, as in “father”',
		joins: false,
		example: '112:1:4'
	},
	{ id: 'ba', glyph: 'ب', name: 'bāʾ', sound: '“b” as in “book”', joins: true, example: '79:30:2' },
	{ id: 'ta', glyph: 'ت', name: 'tāʾ', sound: '“t” as in “tea”', joins: true, example: '89:6:2' },
	{
		id: 'tha',
		glyph: 'ث',
		name: 'thāʾ',
		sound: '“th” as in “think”',
		joins: true,
		example: '91:11:2'
	},
	{ id: 'jim', glyph: 'ج', name: 'jīm', sound: '“j” as in “jam”', joins: true, example: '110:1:2' },
	{
		id: 'ha',
		glyph: 'ح',
		name: 'ḥāʾ',
		sound: 'a breathy “h” from the throat, like fogging a mirror',
		joins: true,
		example: '97:5:3'
	},
	{
		id: 'kha',
		glyph: 'خ',
		name: 'khāʾ',
		sound: 'like the “ch” in Scottish “loch”',
		joins: true,
		example: '87:2:2'
	},
	{
		id: 'dal',
		glyph: 'د',
		name: 'dāl',
		sound: '“d” as in “door”',
		joins: false,
		example: '110:2:5'
	},
	{
		id: 'dhal',
		glyph: 'ذ',
		name: 'dhāl',
		sound: '“th” as in “this”',
		joins: false,
		example: '90:15:2'
	},
	{
		id: 'ra',
		glyph: 'ر',
		name: 'rāʾ',
		sound: 'a lightly rolled “r”',
		joins: false,
		example: '1:2:3'
	},
	{
		id: 'zay',
		glyph: 'ز',
		name: 'zāy',
		sound: '“z” as in “zoo”',
		joins: false,
		example: '79:13:3'
	},
	{ id: 'sin', glyph: 'س', name: 'sīn', sound: '“s” as in “sun”', joins: true, example: '97:5:1' },
	{
		id: 'shin',
		glyph: 'ش',
		name: 'shīn',
		sound: '“sh” as in “ship”',
		joins: true,
		example: '78:29:2'
	},
	{
		id: 'sad',
		glyph: 'ص',
		name: 'ṣād',
		sound: 'a heavy, deep “s”',
		joins: true,
		example: '96:10:3'
	},
	{
		id: 'dad',
		glyph: 'ض',
		name: 'ḍād',
		sound: 'a heavy, deep “d”',
		joins: true,
		example: '80:39:1'
	},
	{
		id: 'tah',
		glyph: 'ط',
		name: 'ṭāʾ',
		sound: 'a heavy, deep “t”',
		joins: true,
		example: '88:6:3'
	},
	{
		id: 'zah',
		glyph: 'ظ',
		name: 'ẓāʾ',
		sound: 'a heavy “th”, as in “this”',
		joins: true,
		example: '84:14:2'
	},
	{
		id: 'ayn',
		glyph: 'ع',
		name: 'ʿayn',
		sound: 'a deep sound from the middle of the throat; English has none',
		joins: true,
		example: '78:2:1'
	},
	{
		id: 'ghayn',
		glyph: 'غ',
		name: 'ghayn',
		sound: 'a gargled “r”, like the French “r”',
		joins: true,
		example: '1:7:5'
	},
	{ id: 'fa', glyph: 'ف', name: 'fāʾ', sound: '“f” as in “fish”', joins: true, example: '89:6:4' },
	{
		id: 'qaf',
		glyph: 'ق',
		name: 'qāf',
		sound: 'a deep “k” from the back of the throat',
		joins: true,
		example: '83:13:5'
	},
	{
		id: 'kaf',
		glyph: 'ك',
		name: 'kāf',
		sound: '“k” as in “king”',
		joins: true,
		example: '78:17:4'
	},
	{
		id: 'lam',
		glyph: 'ل',
		name: 'lām',
		sound: '“l” as in “light”',
		joins: true,
		example: '79:46:4'
	},
	{
		id: 'mim',
		glyph: 'م',
		name: 'mīm',
		sound: '“m” as in “moon”',
		joins: true,
		example: '78:40:8'
	},
	{
		id: 'nun',
		glyph: 'ن',
		name: 'nūn',
		sound: '“n” as in “noon”',
		joins: true,
		example: '81:14:2'
	},
	{ id: 'heh', glyph: 'ه', name: 'hāʾ', sound: '“h” as in “hat”', joins: true, example: '79:15:1' },
	{
		id: 'waw',
		glyph: 'و',
		name: 'wāw',
		sound: '“w” as in “water”, or a long “oo”',
		joins: false,
		example: '92:20:3'
	},
	{
		id: 'ya',
		glyph: 'ي',
		name: 'yāʾ',
		sound: '“y” as in “yes”, or a long “ee”',
		joins: true,
		example: '1:4:2'
	}
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

export interface LetterExample {
	/** The Quran word, straight from the corpus data. */
	text: string;
	/** Its short English gloss. */
	gloss: string;
	/** Recitation of that word, streamed from the Quran.com word-audio CDN. */
	audioUrl: string;
}

/** The Quran word that stands in for a letter's audio: a real recitation, not a synthetic voice. */
export function letterExample(letter: Letter): LetterExample {
	const [surah, ayah, n] = letter.example.split(':').map(Number);
	const word = verse(surah, ayah).words.find((w) => w.n === n);
	if (!word) throw new Error(`No word ${letter.example} for letter ${letter.id}`);
	return { text: word.text, gloss: word.gloss, audioUrl: wordAudioFromLoc(letter.example) };
}
