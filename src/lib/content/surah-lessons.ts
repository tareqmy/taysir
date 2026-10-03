import { formatRoot, lexemeById, lexicon, surahName, verse, wordText } from '../data';
import { rngFor } from '../random';
import { lexemeCardId } from './cards';
import { vocabularyExercises } from './exercises';
import type { Block, Lesson, Unit } from './types';

/**
 * Builds vocabulary units for the surahs of Juz Amma from plain-data specs.
 *
 * A spec never contains Arabic. Where lesson prose needs a Quranic word it writes
 * `{surah:ayah:word}`, which is replaced with that word's text from the corpus data, and
 * `{root:lexemeId}` for a lexeme's root written with hyphens.
 */

/** Extra teaching blocks a lesson can show after its verses. */
export type NoteSpec =
	| { type: 'text' | 'rule'; title: string; body: string }
	| {
			type: 'phrase';
			surah: number;
			ayah: number;
			from: number;
			to: number;
			translation: string;
			note?: string;
			split?: boolean;
	  };

export interface LessonSpec {
	/** Unique across the whole course, e.g. `humaza-1`. */
	id: string;
	title: string;
	surah: number;
	/** First and last verse of the lesson, inclusive. */
	from: number;
	to: number;
	/** Lexeme ids this lesson teaches (they join the review queue). */
	ids: string[];
	notes?: NoteSpec[];
}

export interface UnitSpec {
	id: string;
	title: string;
	description: string;
	lessons: LessonSpec[];
}

const NUMBER_WORDS = [
	'Zero',
	'One',
	'Two',
	'Three',
	'Four',
	'Five',
	'Six',
	'Seven',
	'Eight',
	'Nine'
];

/** Fills `{surah:ayah:word}` and `{root:id}` placeholders from the corpus data. */
export function expand(body: string): string {
	return body
		.replace(/\{(\d+):(\d+):(\d+)\}/g, (_, s, a, n) => wordText(Number(s), Number(a), Number(n)))
		.replace(/\{root:([a-z]+)\}/g, (_, id) => formatRoot(lexemeById(id).root ?? ''));
}

function verseRange(from: number, to: number): string {
	if (from === to) return `verse ${from}`;
	return to === from + 1 ? `verses ${from} and ${to}` : `verses ${from} to ${to}`;
}

function noteBlock(note: NoteSpec): Block {
	if (note.type === 'phrase') {
		const { surah, ayah, from, to, split } = note;
		return {
			type: 'phrase',
			surah,
			ayah,
			from,
			to,
			translation: note.translation,
			note: note.note && expand(note.note),
			split
		};
	}
	return { type: note.type, title: note.title, body: expand(note.body) };
}

function buildLesson(unitId: string, spec: LessonSpec): Lesson {
	const verses: Block[] = [];
	for (let ayah = spec.from; ayah <= spec.to; ayah++) {
		verse(spec.surah, ayah); // fail early on a verse that does not exist
		verses.push({ type: 'verse', surah: spec.surah, ayah });
	}
	const count = NUMBER_WORDS[spec.ids.length] ?? String(spec.ids.length);
	return {
		id: spec.id,
		unitId,
		title: spec.title,
		subtitle: `${surahName(spec.surah)}, ${verseRange(spec.from, spec.to)}`,
		kind: 'vocabulary',
		intro: [
			...verses,
			...(spec.notes ?? []).map(noteBlock),
			{ type: 'lexemes', title: `${count} words to learn`, ids: spec.ids }
		],
		cardIds: spec.ids.map(lexemeCardId),
		exercises: vocabularyExercises(spec.ids, lexicon.lexemes, rngFor(spec.id))
	};
}

export function buildUnit(spec: UnitSpec): Unit {
	return {
		id: spec.id,
		title: spec.title,
		description: spec.description,
		lessons: spec.lessons.map((lesson) => buildLesson(spec.id, lesson))
	};
}
