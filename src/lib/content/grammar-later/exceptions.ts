import { verse as verseOf, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, buildPhrase, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * “Except” and “only”: illā. After a group it leaves someone out (“except those who believe”); after
 * a negative the two together mean “only” (“not … except” is “nothing but”). The corpus tags the two
 * uses differently, EXP and RES, and `exceptions.spec.ts` checks every illā the lesson shows against
 * that, along with the negative in. Every example comes from Juz Amma, all Arabic through
 * `w(surah, ayah, word)`. The explanations are drafts: keep them conservative and have a teacher
 * review them.
 */

const rng = rngFor('grammar-exceptions');

/** Tap illā in “none will burn in it except the most wretched”. */
const tapExcept: TapExercise = {
	kind: 'tap',
	id: 'except-8',
	question: 'Tap the word that means “except”.',
	words: verseOf(92, 15).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't2',
	explanation: `${w(92, 15, 3)} is “except”. ${w(92, 15, 1)} “not” comes before it, so together they mean “only”: only the most wretched will burn in it.`
};

export const exceptionsLesson: Lesson = {
	id: 'grammar-exceptions',
	unitId: 'grammar-later',
	title: 'Except, and only',
	subtitle: 'illā',
	kind: 'grammar',
	intro: [
		rule(
			'illā: “except”',
			`illā means “except”. It comes after a whole group has been spoken of, and then names who or what is left out. ${w(103, 2, 1)} ${w(103, 2, 2)} ${w(103, 2, 3)} ${w(103, 2, 4)} is “indeed the human being is in loss”. Then ${w(103, 3, 1)} leaves some out.`
		),
		phrase(
			103,
			3,
			1,
			5,
			'except those who believed and did the righteous deeds',
			'The ones left out of the loss are the believers who did good.'
		),
		phrase(
			88,
			22,
			1,
			3,
			'you are not over them a controller',
			'A negative: “you are not over them as a controller”.'
		),
		phrase(
			88,
			23,
			1,
			4,
			'except whoever turns away and disbelieves',
			'illā again, here followed by man “whoever”. In this verse man is not a condition word: it means “the one who”.'
		),
		rule(
			'“Not … except” means “only”',
			`When illā comes after a negative, the two together mean “only” or “nothing but”. ${w(92, 15, 1)} ${w(92, 15, 2)} ${w(92, 15, 3)} ${w(92, 15, 4)} is “not will he burn in it except the most wretched”: only the most wretched will burn in it.`
		),
		phrase(
			98,
			5,
			1,
			3,
			'and they were not commanded except',
			'wa-mā “and not”, the verb, then illā. What follows says the one thing they were commanded: that they worship Allah.'
		),
		text(
			'in can mean “not”',
			`${w(81, 27, 1)} ${w(81, 27, 2)} ${w(81, 27, 3)} ${w(81, 27, 4)} is “it is nothing but a reminder”. Here ${w(81, 27, 1)} means “not”, as another way to say it, and it is not the in “if” of the last lesson. The sense of the sentence tells you which. A negative followed by illā is the sign of “nothing but”.`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'except-1',
			'What does this word mean?',
			ar(w(103, 3, 1)),
			en('except'),
			[en('if'), en('indeed'), en('not')],
			'illā means “except”: it leaves someone out.',
			rng
		),
		handChoice(
			'except-2',
			'In “indeed the human being is in loss, except those who believed…”, who is left out of the loss?',
			undefined,
			en('Those who believed and did the righteous deeds'),
			[en('The human being'), en('Everyone')],
			`${w(103, 3, 1)} names who is left out: ${w(103, 3, 2)} ${w(103, 3, 3)}, “those who believed”.`,
			rng
		),
		buildPhrase(
			'except-3',
			'except those who believed',
			[w(103, 3, 1), w(103, 3, 2), w(103, 3, 3)],
			[w(103, 3, 4)],
			`${w(103, 3, 1)} ${w(103, 3, 2)} ${w(103, 3, 3)}: “except”, “those who”, “believed”.`,
			rng
		),
		handChoice(
			'except-4',
			'Which word means “except” in “except whoever turns away and disbelieves”?',
			undefined,
			ar(w(88, 23, 1)),
			[ar(w(88, 23, 2)), ar(w(88, 23, 3))],
			`${w(88, 23, 1)} is “except”. ${w(88, 23, 2)} is “whoever” and ${w(88, 23, 3)} is “turns away”.`,
			rng
		),
		handChoice(
			'except-5',
			`${w(98, 5, 1)} … ${w(98, 5, 3)} means “not … except”. Together they mean:`,
			undefined,
			en('only'),
			[en('never'), en('if')],
			'A negative followed by illā means “nothing but”, or “only”.',
			rng
		),
		handChoice(
			'except-6',
			`What does ${w(81, 27, 1)} mean in “it is nothing but a reminder”?`,
			ar(`${w(81, 27, 1)} ${w(81, 27, 2)} ${w(81, 27, 3)} ${w(81, 27, 4)}`),
			en('not'),
			[en('if'), en('indeed')],
			`${w(81, 27, 1)} is a negative here, and ${w(81, 27, 3)} “except” follows: “nothing but”.`,
			rng
		),
		handMatch(
			'except-7',
			'Match each small word with its meaning.',
			[
				{ arabic: w(103, 3, 1), english: 'except' },
				{ arabic: w(98, 5, 1), english: 'and not' },
				{ arabic: w(92, 15, 1), english: 'not' },
				{ arabic: w(103, 2, 1), english: 'indeed' }
			],
			'illā “except”, wa-mā “and not”, lā “not” and inna “indeed”.',
			rng
		),
		tapExcept
	]
};
