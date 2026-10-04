/** Layout shared by the review export and the import that applies corrections. */

export const SHEETS = {
	start: 'Start here',
	verses: 'Verses',
	words: 'Words',
	vocabulary: 'Vocabulary',
	lessonText: 'Lesson text',
	exercises: 'Grammar exercises'
} as const;

/** What a reviewer can mark a row. Blank means not looked at yet. */
export const STATUSES = ['OK', 'Change', 'Unsure'] as const;

/** Column titles the import looks up by name, so the sheets can be reordered without breaking it. */
export const COLUMNS = {
	key: 'Key',
	id: 'ID',
	gloss: 'Current English',
	meaning: 'Current meaning',
	status: 'Status',
	correction: 'Correction',
	comment: 'Comment'
} as const;

/**
 * The review is offered in parts a reviewer can take one at a time, in the order a learner meets
 * the material. Every course unit belongs to exactly one part (a test checks this).
 */
export interface Part {
	n: number;
	/** Used in the file name. */
	slug: string;
	/** Left out for parts of Juz Amma, which are named from their surahs. */
	title?: string;
	unitIds: string[];
}

export const PARTS: Part[] = [
	{
		n: 1,
		slug: 'first-steps',
		title: 'The first steps: the letters, Al-Fatiha, roots and grammar',
		unitIds: ['letters', 'fatiha', 'roots', 'grammar']
	},
	{
		n: 2,
		slug: 'short-surahs',
		title: 'The short surahs (105 to 114) and grammar from them',
		unitIds: ['short-surahs', 'grammar-patterns']
	},
	{ n: 3, slug: 'juz-amma-a', unitIds: ['juz-amma-1', 'juz-amma-2'] },
	{ n: 4, slug: 'juz-amma-b', unitIds: ['juz-amma-3', 'juz-amma-4'] },
	{ n: 5, slug: 'juz-amma-c', unitIds: ['juz-amma-5', 'juz-amma-6', 'juz-amma-7'] }
];

export const partFileName = (part: Part) => `Taysir-review-part-${part.n}-${part.slug}.xlsx`;
export const WHOLE_FILE_NAME = 'Taysir-review.xlsx';
