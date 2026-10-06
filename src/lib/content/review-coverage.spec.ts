import { describe, expect, it } from 'vitest';
import { lessons, units } from './course';
import { letters } from './alphabet';

/**
 * The review spreadsheets (`scripts/export-review.ts`) must hold every piece of English a learner can
 * read, or a teacher is asked to check less than is shown. The export reads a fixed list of things;
 * these tests fail when the course gains something it does not read, so that whoever adds it also
 * decides how it reaches the reviewer. (An earlier export left out how each letter sounds, the lesson
 * summaries and the unit descriptions, and nobody noticed for weeks.)
 */

/** The fields each kind of teaching block may have, and what the export does with the English in them. */
const BLOCK_FIELDS: Record<string, string[]> = {
	// “Lesson text”: title and body.
	text: ['type', 'title', 'body'],
	// “Lesson text”: a grammar rule's title and body.
	rule: ['type', 'title', 'body'],
	// “Letters”: the letters' own descriptions. The block's `title` is never used (checked below).
	letters: ['type', 'title', 'ids'],
	// “Vocabulary”: the cards' meanings. The `title` is a generic label such as “Five words to learn”.
	lexemes: ['type', 'title', 'ids'],
	// “Lesson text”: the body about the family of words.
	root: ['type', 'root', 'ids', 'body'],
	// “Verses” and “Words”: the verse itself. The note is in “Lesson text”. The `title` is never used.
	verse: ['type', 'surah', 'ayah', 'title', 'note'],
	// “Lesson text”: the translation and the note.
	phrase: ['type', 'surah', 'ayah', 'from', 'to', 'translation', 'note', 'split', 'highlight']
};

describe('what the review spreadsheets must cover', () => {
	const blocks = lessons.flatMap((lesson) => lesson.intro);

	it('knows every kind of teaching block in the course, and every field of each', () => {
		for (const block of blocks) {
			const known = BLOCK_FIELDS[block.type];
			expect(known, `an unknown kind of block: ${block.type}`).toBeDefined();
			for (const field of Object.keys(block)) {
				expect(
					known,
					`a ${block.type} block has a field the export does not read: ${field}`
				).toContain(field);
			}
		}
	});

	it('has no title on a verse or a letters block, which the export does not read', () => {
		for (const block of blocks) {
			if (block.type === 'verse' || block.type === 'letters') {
				expect(block.title, `a ${block.type} block has a title`).toBeUndefined();
			}
		}
	});

	it('has no lesson or unit field the export does not read', () => {
		// Titles and summaries are the “Titles and summaries” sheet; the rest is structure.
		const lessonFields = [
			'id',
			'unitId',
			'title',
			'subtitle',
			'kind',
			'intro',
			'cardIds',
			'exercises'
		];
		const unitFields = ['id', 'title', 'description', 'lessons', 'skippableForReaders'];
		for (const lesson of lessons) {
			for (const field of Object.keys(lesson))
				expect(lessonFields, `${lesson.id}: ${field}`).toContain(field);
		}
		for (const unit of units) {
			for (const field of Object.keys(unit))
				expect(unitFields, `${unit.id}: ${field}`).toContain(field);
		}
	});

	it('has no letter field the export does not read', () => {
		// Name, sound and whether it joins are in “Letters”; `example` is a place in the corpus.
		const known = ['id', 'glyph', 'name', 'sound', 'joins', 'example'];
		for (const letter of letters) {
			for (const field of Object.keys(letter))
				expect(known, `${letter.id}: ${field}`).toContain(field);
		}
	});

	it('writes by hand only the kinds of grammar exercise the export reads', () => {
		const read = ['choose', 'match', 'build', 'tap'];
		for (const lesson of lessons.filter((l) => l.kind === 'grammar')) {
			for (const exercise of lesson.exercises) {
				expect(read, `${exercise.id} is a ${exercise.kind} question in a grammar lesson`).toContain(
					exercise.kind
				);
			}
		}
	});

	it('gives a hint only to the exercises made from the verses’ own word-by-word English', () => {
		// Those hints are the “Words” sheet put in a line, so checking the words checks them. A hint
		// written by hand would need a place in the review.
		for (const lesson of lessons) {
			for (const exercise of lesson.exercises) {
				if (exercise.kind === 'choose' && exercise.hint) {
					expect(exercise.id, `a hint on ${exercise.id}`).toMatch(/^verse-fill:/);
				}
			}
		}
	});
});
