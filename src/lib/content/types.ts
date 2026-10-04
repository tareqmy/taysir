/** Course schema: units contain lessons, lessons contain teaching blocks and exercises. */

/** A piece of text with its language, which drives the font and text direction. */
export interface Chunk {
	text: string;
	lang: 'ar' | 'en';
}

// --- Exercises -------------------------------------------------------------

interface ExerciseBase {
	id: string;
	/** The instruction shown above the exercise. */
	question: string;
	/** Spaced-repetition card this exercise tests; correct/incorrect grades it. */
	cardId?: string;
	/** Audio played alongside the prompt. */
	audioUrl?: string;
	/**
	 * The question has to be heard to be answered. Audio is streamed, so the runner leaves these
	 * out when the device is offline, and always lets the learner skip one without a penalty.
	 */
	listening?: boolean;
	/** Shown after the learner answers. */
	explanation?: string;
}

export interface ChooseExercise extends ExerciseBase {
	kind: 'choose';
	/** The thing being asked about; omitted when the question line says it all. */
	prompt?: Chunk;
	/** An English clue shown under the prompt, such as the meaning of the whole verse. */
	hint?: string;
	choices: { id: string; chunk: Chunk }[];
	answerId: string;
}

export interface MatchExercise extends ExerciseBase {
	kind: 'match';
	pairs: { id: string; left: Chunk; right: Chunk }[];
}

export interface BuildExercise extends ExerciseBase {
	kind: 'build';
	/** The meaning to express, shown in English. */
	prompt: Chunk;
	/** Tokens in the order the learner must arrange them. */
	answer: { id: string; chunk: Chunk }[];
	/** Extra tokens that do not belong in the answer. */
	extras: { id: string; chunk: Chunk }[];
}

/** Tap one word of a verse. */
export interface TapExercise extends ExerciseBase {
	kind: 'tap';
	/** The words of the verse, in reading order. */
	words: { id: string; text: string }[];
	/** The word the question asks for. */
	answerId: string;
}

export type Exercise = ChooseExercise | MatchExercise | BuildExercise | TapExercise;

// --- Teaching blocks --------------------------------------------------------

export type Block =
	| { type: 'text'; title?: string; body: string }
	| { type: 'rule'; title: string; body: string }
	| { type: 'letters'; title?: string; ids: string[] }
	| { type: 'lexemes'; title?: string; ids: string[] }
	| { type: 'root'; root: string; ids: string[]; body?: string }
	| { type: 'verse'; surah: number; ayah: number; title?: string; note?: string }
	| {
			type: 'phrase';
			surah: number;
			ayah: number;
			from: number;
			to: number;
			translation: string;
			note?: string;
			/** Show each word split into its parts (prefix, stem, suffix). */
			split?: boolean;
			/** Colour the prefixes and endings that are joined onto each word. */
			highlight?: 'affixes';
	  };

// --- Course structure -------------------------------------------------------

export type LessonKind = 'letters' | 'vocabulary' | 'roots' | 'grammar';

export interface Lesson {
	id: string;
	unitId: string;
	title: string;
	subtitle: string;
	kind: LessonKind;
	intro: Block[];
	/** Spaced-repetition cards added to the review queue on completion. */
	cardIds: string[];
	exercises: Exercise[];
}

export interface Unit {
	id: string;
	title: string;
	description: string;
	lessons: Lesson[];
	/** Skipped when the learner says they can already read Arabic script. */
	skippableForReaders?: boolean;
}

// --- Letters ----------------------------------------------------------------

export interface Letter {
	id: string;
	glyph: string;
	/** Transliterated name, e.g. `bāʾ`. */
	name: string;
	/** English hint for the sound. */
	sound: string;
	/** Whether the letter joins to the letter after it. */
	joins: boolean;
	/**
	 * A common Quran word that starts with the letter, as a corpus location `surah:ayah:word`.
	 * Its recitation is the letter's audio, so the sound is heard in a real word.
	 */
	example: string;
}
