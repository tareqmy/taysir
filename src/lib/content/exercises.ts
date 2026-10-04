import { wordAudioFromLoc } from '../audio';
import { formatRoot, lexemeById } from '../data';
import type { Lexeme } from '../data/types';
import { shuffle, type Rng } from '../random';
import { letterById, letters } from './alphabet';
import { letterCardId, lexemeCardId, parseCardId } from './cards';
import type {
	BuildExercise,
	ChooseExercise,
	Chunk,
	Exercise,
	Letter,
	MatchExercise,
	TapExercise
} from './types';

export const ar = (text: string): Chunk => ({ text, lang: 'ar' });
export const en = (text: string): Chunk => ({ text, lang: 'en' });

/** Picks `n` wrong answers from `pool`, preferring ones that pass `similar`. */
function distractors<T extends { id: string }>(
	correct: T,
	pool: readonly T[],
	n: number,
	rng: Rng,
	similar: (item: T) => boolean = () => true
): T[] {
	const candidates = shuffle(
		pool.filter((item) => item.id !== correct.id),
		rng
	);
	const preferred = candidates.filter(similar);
	const rest = candidates.filter((item) => !similar(item));
	return [...preferred, ...rest].slice(0, n);
}

/** Keeps the first item for each key, so a list of choices never repeats the same text. */
function uniqueBy<T>(items: readonly T[], key: (item: T) => string): T[] {
	const seen = new Set<string>();
	return items.filter((item) => {
		const k = key(item);
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
}

// --- Vocabulary -------------------------------------------------------------

/** Arabic word → English meaning. */
export function meaningChoice(lexeme: Lexeme, pool: readonly Lexeme[], rng: Rng): ChooseExercise {
	const wrong = distractors(
		lexeme,
		// A word spelled the same as this one (such as the two uses of ما) would be a right answer too.
		pool.filter((l) => l.gloss !== lexeme.gloss && l.arabic !== lexeme.arabic),
		3,
		rng,
		(l) => l.pos === lexeme.pos
	);
	return {
		kind: 'choose',
		id: `meaning:${lexeme.id}`,
		question: 'What does this word mean?',
		prompt: ar(lexeme.arabic),
		choices: shuffle([lexeme, ...wrong], rng).map((l) => ({ id: l.id, chunk: en(l.gloss) })),
		answerId: lexeme.id,
		cardId: lexemeCardId(lexeme.id),
		audioUrl: wordAudioFromLoc(lexeme.sample.loc),
		explanation: `${lexeme.arabic} means “${lexeme.gloss}”.`
	};
}

/** Hear a word, then choose its meaning: nothing is shown in Arabic until after the answer. */
export function listenMeaning(lexeme: Lexeme, pool: readonly Lexeme[], rng: Rng): ChooseExercise {
	return {
		...meaningChoice(lexeme, pool, rng),
		id: `listen:${lexeme.id}`,
		question: 'Listen, then choose the meaning.',
		prompt: undefined,
		listening: true
	};
}

/** English meaning → Arabic word. */
export function arabicChoice(lexeme: Lexeme, pool: readonly Lexeme[], rng: Rng): ChooseExercise {
	const wrong = distractors(
		lexeme,
		uniqueBy(
			pool.filter((l) => l.arabic !== lexeme.arabic),
			(l) => l.arabic
		),
		3,
		rng,
		(l) => l.pos === lexeme.pos
	);
	return {
		kind: 'choose',
		id: `arabic:${lexeme.id}`,
		question: 'Which word means this?',
		prompt: en(lexeme.gloss),
		choices: shuffle([lexeme, ...wrong], rng).map((l) => ({ id: l.id, chunk: ar(l.arabic) })),
		answerId: lexeme.id,
		cardId: lexemeCardId(lexeme.id),
		audioUrl: wordAudioFromLoc(lexeme.sample.loc),
		explanation: `“${lexeme.gloss}” is ${lexeme.arabic}.`
	};
}

export function lexemeMatch(lexemes: readonly Lexeme[], rng: Rng): MatchExercise {
	return {
		kind: 'match',
		id: `match:${lexemes.map((l) => l.id).join('+')}`,
		question: 'Match each word with its meaning.',
		pairs: shuffle(lexemes, rng).map((l) => ({ id: l.id, left: ar(l.arabic), right: en(l.gloss) }))
	};
}

/** Standard vocabulary practice: recognise, then recall, then match. */
export function vocabularyExercises(ids: string[], pool: readonly Lexeme[], rng: Rng): Exercise[] {
	const lexemes = ids.map(lexemeById);
	return [
		...shuffle(lexemes, rng).map((l) => meaningChoice(l, pool, rng)),
		...shuffle(lexemes, rng).map((l) => arabicChoice(l, pool, rng)),
		...(lexemes.length >= 3 ? [lexemeMatch(lexemes, rng)] : [])
	];
}

// --- Roots -----------------------------------------------------------------

/** Arabic word → its three-letter root. */
export function rootOfChoice(lexeme: Lexeme, roots: readonly string[], rng: Rng): ChooseExercise {
	const root = lexeme.root!;
	const wrong = shuffle(
		roots.filter((r) => r !== root),
		rng
	).slice(0, 2);
	return {
		kind: 'choose',
		id: `rootof:${lexeme.id}`,
		question: 'Which root does this word come from?',
		prompt: ar(lexeme.arabic),
		choices: shuffle([root, ...wrong], rng).map((r) => ({ id: r, chunk: ar(formatRoot(r)) })),
		answerId: root,
		explanation: `${lexeme.arabic} is built on the root ${formatRoot(root)}.`
	};
}

/** A root → the word that belongs to it. */
export function belongsToRootChoice(
	lexeme: Lexeme,
	pool: readonly Lexeme[],
	rng: Rng
): ChooseExercise {
	const root = lexeme.root!;
	const wrong = distractors(
		lexeme,
		pool.filter((l) => l.root !== root),
		2,
		rng
	);
	return {
		kind: 'choose',
		id: `belongs:${lexeme.id}`,
		question: `Which word comes from the root ${formatRoot(root)}?`,
		prompt: ar(formatRoot(root)),
		choices: shuffle([lexeme, ...wrong], rng).map((l) => ({ id: l.id, chunk: ar(l.arabic) })),
		answerId: lexeme.id,
		explanation: `${lexeme.arabic} (“${lexeme.gloss}”) shares the root ${formatRoot(root)}.`
	};
}

export function rootExercises(
	ids: string[],
	pool: readonly Lexeme[],
	roots: readonly string[],
	rng: Rng
): Exercise[] {
	const lexemes = ids.map(lexemeById);
	const sample = shuffle(lexemes, rng);
	return [
		...sample.map((l) => meaningChoice(l, pool, rng)),
		...sample.slice(0, 3).map((l) => rootOfChoice(l, roots, rng)),
		...sample.slice(0, 2).map((l) => belongsToRootChoice(l, pool, rng))
	];
}

// --- Letters ----------------------------------------------------------------

/** Letter shape → its name. */
export function letterNameChoice(
	letter: Letter,
	pool: readonly Letter[],
	rng: Rng
): ChooseExercise {
	const wrong = distractors(letter, pool, 3, rng);
	return {
		kind: 'choose',
		id: `letter-name:${letter.id}`,
		question: 'What is this letter called?',
		prompt: ar(letter.glyph),
		choices: shuffle([letter, ...wrong], rng).map((l) => ({ id: l.id, chunk: en(l.name) })),
		answerId: letter.id,
		cardId: letterCardId(letter.id),
		explanation: `${letter.glyph} is ${letter.name}: ${letter.sound}.`
	};
}

/** Letter name → its shape. */
export function letterGlyphChoice(
	letter: Letter,
	pool: readonly Letter[],
	rng: Rng
): ChooseExercise {
	const wrong = distractors(letter, pool, 3, rng);
	return {
		kind: 'choose',
		id: `letter-glyph:${letter.id}`,
		question: 'Which letter is this?',
		prompt: en(letter.name),
		choices: shuffle([letter, ...wrong], rng).map((l) => ({ id: l.id, chunk: ar(l.glyph) })),
		answerId: letter.id,
		cardId: letterCardId(letter.id),
		explanation: `${letter.name} is written ${letter.glyph}.`
	};
}

export function letterMatch(group: readonly Letter[], rng: Rng): MatchExercise {
	return {
		kind: 'match',
		id: `letter-match:${group.map((l) => l.id).join('+')}`,
		question: 'Match each letter with its name.',
		pairs: shuffle(group, rng).map((l) => ({ id: l.id, left: ar(l.glyph), right: en(l.name) }))
	};
}

export function letterExercises(ids: string[], rng: Rng): Exercise[] {
	const group = ids.map(letterById);
	return [
		...shuffle(group, rng).map((l) => letterNameChoice(l, letters, rng)),
		...shuffle(group, rng).map((l) => letterGlyphChoice(l, letters, rng)),
		letterMatch(group, rng)
	];
}

// --- Grammar ----------------------------------------------------------------

/** A multiple-choice question written by hand, with the right answer listed first. */
export function handChoice(
	id: string,
	question: string,
	prompt: Chunk | undefined,
	correct: Chunk,
	wrong: Chunk[],
	explanation: string,
	rng: Rng
): ChooseExercise {
	const options = [correct, ...wrong].map((chunk, i) => ({ id: String(i), chunk }));
	return {
		kind: 'choose',
		id,
		question,
		prompt,
		choices: shuffle(options, rng),
		answerId: '0',
		explanation
	};
}

/** Match Arabic words with their English meanings, written by hand. */
export function handMatch(
	id: string,
	question: string,
	pairs: { arabic: string; english: string }[],
	explanation: string,
	rng: Rng
): MatchExercise {
	return {
		kind: 'match',
		id,
		question,
		pairs: shuffle(
			pairs.map((p, i) => ({ id: `p${i}`, left: ar(p.arabic), right: en(p.english) })),
			rng
		),
		explanation
	};
}

/** Arrange Arabic words into a phrase that matches an English meaning. */
export function buildPhrase(
	id: string,
	prompt: string,
	words: string[],
	extras: string[],
	explanation: string,
	rng: Rng
): BuildExercise {
	return {
		kind: 'build',
		id,
		question: 'Put the words in order.',
		prompt: en(prompt),
		answer: words.map((text, i) => ({ id: `w${i}`, chunk: ar(text) })),
		extras: shuffle(
			extras.map((text, i) => ({ id: `x${i}`, chunk: ar(text) })),
			rng
		),
		explanation
	};
}

// --- Reviews ----------------------------------------------------------------

/** About one word review in four is a listening question, when listening is allowed. */
const LISTEN_SHARE = 0.25;

/** One spaced-repetition question for a card, in a randomly chosen direction. */
export function reviewExercise(
	cardId: string,
	allLexemes: readonly Lexeme[],
	rng: Rng,
	/** Allow “hear the word” questions, which need the audio to load. */
	canListen = false
): Exercise {
	const parsed = parseCardId(cardId);
	const forward = rng() < 0.5;
	if (parsed.type === 'lexeme') {
		const lexeme = lexemeById(parsed.id);
		if (canListen && rng() < LISTEN_SHARE) return listenMeaning(lexeme, allLexemes, rng);
		return forward ? meaningChoice(lexeme, allLexemes, rng) : arabicChoice(lexeme, allLexemes, rng);
	}
	const letter = letterById(parsed.id);
	return forward ? letterNameChoice(letter, letters, rng) : letterGlyphChoice(letter, letters, rng);
}

/** Whether a response to a single-answer exercise is right. */
export function isCorrect(
	exercise: ChooseExercise | BuildExercise | TapExercise,
	response: string | string[]
): boolean {
	if (exercise.kind === 'choose' || exercise.kind === 'tap') return response === exercise.answerId;
	return (
		Array.isArray(response) &&
		response.length === exercise.answer.length &&
		response.every((id, i) => id === exercise.answer[i].id)
	);
}
