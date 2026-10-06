import { verse, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * The past tense for “she” and “they”. `grammar-verbs` teaches I, we, you (one), you (many) and he,
 * which has no ending; this adds she (-at), they (-ū) and, in a line, “they” said of women (-na).
 * One root, kāna “was”, shows three persons side by side. Every example comes from Juz Amma, all
 * Arabic through `w(surah, ayah, word)`, and `persons.spec.ts` checks each verb's person and tense
 * against the corpus's tags. The explanations are drafts: keep them conservative and have a teacher
 * review them.
 */

const rng = rngFor('grammar-past-persons');

/** Tap the one verb in “and they denied Our signs with denial”. */
const tapTheyDenied: TapExercise = {
	kind: 'tap',
	id: 'persons-8',
	question: 'Tap the verb that means “they denied”.',
	words: verse(78, 28).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't0',
	explanation: `${w(78, 28, 1)} is “and they denied”: the verb, with the “they” ending -ū. The other two words are “Our signs” and “with denial”.`
};

export const personsLesson: Lesson = {
	id: 'grammar-past-persons',
	unitId: 'grammar-later',
	title: 'She and they, in the past',
	subtitle: 'Two more endings for a past verb',
	kind: 'grammar',
	intro: [
		rule(
			'He has no ending; she and they do',
			`You know the past endings for I, we and you. “He” has none: ${w(110, 3, 6)} is “He was”. For “she”, add -at: ${w(78, 21, 3)} is “she was”. For “they”, add -ū: ${w(78, 27, 2)} is “they were”. This is one verb, kāna “was”, in three persons.`
		),
		phrase(
			110,
			3,
			5,
			7,
			'indeed He has always been accepting of repentance',
			'No ending: “He was”.'
		),
		phrase(
			78,
			21,
			2,
			4,
			'indeed Hell was an ambush',
			'-at: “Hell” is a feminine word in Arabic, so the verb is “she was”.'
		),
		phrase(78, 27, 1, 5, 'indeed they did not expect a reckoning', '-ū: “they were”.'),
		text(
			'A verb matches its doer',
			`The ending follows who or what does the action. A feminine doer takes -at, as in ${w(82, 5, 1)} ${w(82, 5, 2)} (“a soul will know”): “soul” is a feminine word, so the verb is “she”.`
		),
		text(
			'Things in the plural count as “she”',
			`A plural of things is treated as a feminine singular, as you saw for describing words. So ${w(101, 6, 3)} ${w(101, 6, 4)} (“his scales became heavy”) has the “she” ending, although “scales” is plural.`
		),
		text(
			'The ending -ū',
			`The “they” ending is written with an extra alif after the wāw, which is not pronounced. You will see it often, as in ${w(103, 3, 3)} (“they believed”) and ${w(103, 3, 4)} (“and they did”). When the doers are a feminine plural there is a different “they” ending, -na, as in ${w(100, 4, 1)} (“then they raised”), said of “those that run” in verse 1.`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'persons-1',
			`Who is the doer in ${w(78, 21, 3)}?`,
			undefined,
			en('she (a feminine doer)'),
			[en('he'), en('they'), en('we')],
			'-at is the past ending for “she”, and for a feminine thing such as Hell.',
			rng
		),
		handChoice(
			'persons-2',
			`What does the ending of ${w(78, 27, 2)} mean?`,
			undefined,
			en('they'),
			[en('she'), en('he'), en('we')],
			'-ū is the past ending for “they”.',
			rng
		),
		handChoice(
			'persons-3',
			'Which verb means “they were”?',
			undefined,
			ar(w(78, 27, 2)),
			[ar(w(78, 21, 3)), ar(w(110, 3, 6))],
			`${w(78, 27, 2)} has the “they” ending. ${w(78, 21, 3)} is “she was” and ${w(110, 3, 6)} is “He was”.`,
			rng
		),
		handMatch(
			'persons-4',
			'Match each verb with its meaning.',
			[
				{ arabic: w(110, 3, 6), english: 'he was' },
				{ arabic: w(78, 21, 3), english: 'she was' },
				{ arabic: w(78, 27, 2), english: 'they were' }
			],
			'One verb, kāna, with no ending for “he”, -at for “she” and -ū for “they”.',
			rng
		),
		handChoice(
			'persons-5',
			`Why does ${w(82, 5, 1)} end in -at?`,
			undefined,
			en('Because its doer, “a soul”, is a feminine word'),
			[en('Because it is a command'), en('Because it is in the future')],
			`${w(82, 5, 2)} (“a soul”) is feminine, so its verb has the “she” ending.`,
			rng
		),
		handChoice(
			'persons-6',
			`${w(101, 6, 4)} (“his scales”) is plural, yet ${w(101, 6, 3)} ends in -at. Why?`,
			undefined,
			en('A plural of things is treated as a feminine singular'),
			[en('Because scales are people'), en('Because the verb is a command')],
			'A plural of things takes the same verb ending as “she”.',
			rng
		),
		handChoice(
			'persons-7',
			'Which verb has the “they” ending?',
			undefined,
			ar(w(103, 3, 3)),
			[ar(w(82, 5, 1)), ar(w(110, 3, 6))],
			`${w(103, 3, 3)} is “they believed”. ${w(82, 5, 1)} has -at, and ${w(110, 3, 6)} has no ending.`,
			rng
		),
		tapTheyDenied
	]
};
