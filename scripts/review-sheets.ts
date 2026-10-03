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
