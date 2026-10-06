import { verse as verseOf, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * Patterns of nouns: a place (ma- in front), a lasting quality (a long ī before the last root
 * letter) and “more” or “the most” (a- in front). Every example is a word the learner has met, and
 * `nouns.spec.ts` checks each shape against the letters of the word and its root in the corpus. The
 * explanations are drafts: keep them conservative and have a teacher review them.
 */

const rng = rngFor('grammar-forms-nouns');

/** Tap the “most” word in “then Allah punishes him with the greatest punishment”. */
const tapGreatest: TapExercise = {
	kind: 'tap',
	id: 'nouns-8',
	question: 'Tap the word that means “the greatest”.',
	words: verseOf(88, 24).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't3',
	explanation: `${w(88, 24, 4)} is “the greatest”: a- in front of the root letters, the “most” shape. It describes ${w(88, 24, 3)} “the punishment”.`
};

export const nounsLesson: Lesson = {
	id: 'grammar-forms-nouns',
	unitId: 'grammar-forms',
	title: 'Patterns of nouns',
	subtitle: 'A place, a quality, “the most”',
	kind: 'grammar',
	intro: [
		rule(
			'Nouns have patterns too',
			'You already know the shapes for the one who does it, the one it is done to, and the one who does it again and again. Many other nouns are built on a root in a regular shape, and the shape gives a clue to the meaning. This lesson takes three: a place, a lasting quality, and “the most”.'
		),
		text(
			'A place: ma- or mi- in front',
			`A ma- or mi- in front of a root's letters often names the place where the action happens. ${w(78, 22, 2)} is “a place of return”, ${w(79, 39, 4)} is “the abode”, ${w(78, 6, 4)} is “a resting place”, and ${w(79, 40, 4)} is “the standing before”: the place or act of standing. A few name a time instead, such as ${w(78, 17, 5)} (“an appointed time”).`
		),
		phrase(
			79,
			39,
			1,
			4,
			'then indeed the blazing fire is the abode',
			'The “place” shape: where one ends up.'
		),
		text(
			'A lasting quality: a long ī before the last letter',
			`A long ī before the last letter of the root often names a lasting quality. ${w(1, 3, 2)} is “the Most Merciful”, ${w(85, 8, 8)} is “the Mighty”, ${w(84, 15, 6)} is “Seeing”, and ${w(100, 11, 5)} is “surely all-aware”.`
		),
		text(
			'“More” and “the most”: a- in front',
			`An a- in front of the root letters often means “more” or “the most”. ${w(95, 4, 5)} is “the best of”, ${w(95, 5, 3)} is “the lowest of”, ${w(88, 24, 4)} is “the greatest”, and ${w(84, 23, 2)} is “knows best”, which is “more knowing”.`
		),
		phrase(
			88,
			24,
			3,
			4,
			'the punishment, the greatest',
			'The “most” shape on the describing word.'
		),
		rule(
			'A guide, not a rule',
			'Patterns like these are tendencies. A ma- word may name a place, a time or something else, and not every long ī names a quality. Learn each word, and use the shape to guess its kind.'
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'nouns-1',
			'Which word names a place, with ma- in front of the root letters?',
			undefined,
			ar(w(78, 22, 2)),
			[ar(w(78, 13, 2)), ar(w(78, 11, 2))],
			`${w(78, 22, 2)} is “a place of return”. ${w(78, 13, 2)} is “a lamp” and ${w(78, 11, 2)} is “the day”.`,
			rng
		),
		handChoice(
			'nouns-2',
			`What does ${w(79, 39, 4)} (“the abode”) name?`,
			undefined,
			en('A place'),
			[en('One who does it'), en('Someone it is done to')],
			'The ma- shape often names a place: here, the place one ends up.',
			rng
		),
		handChoice(
			'nouns-3',
			'Which word has a long ī before the last root letter, naming a quality?',
			undefined,
			ar(w(100, 11, 5)),
			[ar(w(78, 13, 2)), ar(w(78, 22, 2))],
			`${w(100, 11, 5)} is “surely all-aware”, with the long ī. ${w(78, 13, 2)} “a lamp” and ${w(78, 22, 2)} “a place of return” do not have it.`,
			rng
		),
		handMatch(
			'nouns-4',
			'Match each word naming a quality with its meaning.',
			[
				{ arabic: w(1, 3, 2), english: 'the Most Merciful' },
				{ arabic: w(85, 8, 8), english: 'the Mighty' },
				{ arabic: w(84, 15, 6), english: 'Seeing' },
				{ arabic: w(100, 11, 5), english: 'surely all-aware' }
			],
			'Four qualities, each with a long ī before the last root letter.',
			rng
		),
		handChoice(
			'nouns-5',
			'Which word means “the best of”, with a- in front of the root letters?',
			undefined,
			ar(w(95, 4, 5)),
			[ar(w(95, 4, 2)), ar(w(95, 4, 3))],
			`${w(95, 4, 5)} is “the best of”. ${w(95, 4, 2)} is “We created” and ${w(95, 4, 3)} is “the human being”.`,
			rng
		),
		handChoice(
			'nouns-6',
			`What does the a- in front of the root letters often mean, as in ${w(95, 5, 3)} (“the lowest of”)?`,
			undefined,
			en('More, or the most'),
			[en('A place'), en('A lasting quality')],
			'The a- shape often means “more” or “the most”: low becomes the lowest.',
			rng
		),
		handChoice(
			'nouns-7',
			`Which word is built the same way as ${w(95, 4, 5)}, with a- in front of the root letters?`,
			undefined,
			ar(w(84, 23, 2)),
			[ar(w(84, 15, 6)), ar(w(78, 22, 2))],
			`${w(84, 23, 2)} is “knows best”, “more knowing”. ${w(84, 15, 6)} has the long ī of a quality, and ${w(78, 22, 2)} has the ma- of a place.`,
			rng
		),
		tapGreatest
	]
};
