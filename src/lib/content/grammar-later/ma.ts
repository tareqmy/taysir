import { verse as verseOf, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, buildPhrase, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * The small word mā and its joined forms: asking “what?”, naming “what / that which”, saying “not”,
 * joining with inna to make innamā (“only”), joining to make ammā (“as for”) and immā (“whether”),
 * and dropping its ending alif after a preposition when asking a question (ʿamma, fīma, mimma).
 * Every example comes from Juz Amma, all Arabic through `w(surah, ayah, word)`.
 */

const rng = rngFor('grammar-ma');

/** Tap mimma (“from what”) in 86:5. */
const tapMimma: TapExercise = {
	kind: 'tap',
	id: 'ma-8',
	question: 'Tap the word that asks “from what”.',
	words: verseOf(86, 5).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't2',
	explanation: `${w(86, 5, 3)} is “from what”: min joined with the question word mā, which drops its ending alif.`
};

export const maLesson: Lesson = {
	id: 'grammar-ma',
	unitId: 'grammar-later',
	title: 'The many jobs of mā',
	subtitle: 'mā, innamā, ammā, and shortened “what?”',
	kind: 'grammar',
	intro: [
		rule(
			'Three everyday jobs of mā',
			`You have met ${w(101, 3, 3)} across Juz Amma doing three different jobs. At the start of a question, as in ${w(101, 3, 3)} ${w(101, 3, 4)}, it asks “what?”. Inside a statement, as in ${w(109, 2, 1)} ${w(109, 2, 2)} ${w(109, 2, 3)} ${w(109, 2, 4)}, it means “what” in the sense of “that which”. And before a verb in a negative sentence, as in ${w(98, 5, 1)} (“and not”), it means “not”.`
		),
		phrase(
			79,
			45,
			1,
			5,
			'you are only a warner of the one who fears it',
			'innamā at the start restricts the whole sentence to “only”.'
		),
		rule(
			'Joined with other small words: innamā, ammā, immā',
			`When mā joins onto the end of ${w(103, 2, 1)} (“indeed”), the two become ${w(79, 45, 1)} (“only”). Two other common compounds with mā set up parts of a thought: ${w(93, 9, 1)} (“so as for”) introduces who or what you are speaking of next, and ${w(76, 3, 4)} (“whether”) pairs with ${w(76, 3, 6)} (“and whether”) to give two possibilities.`
		),
		phrase(
			93,
			9,
			1,
			4,
			'so as for the orphan, so do not oppress',
			'fa-ammā sets up the topic, and fa-lā answers it.'
		),
		rule(
			'When a preposition joins question mā, the alif drops',
			`When a preposition joins mā meaning “what” (“that which”), mā keeps its long alif at the end: ${w(84, 23, 3)} is “of what” in ${w(84, 23, 3)} ${w(84, 23, 4)}, and ${w(77, 42, 2)} is “of what” in ${w(77, 42, 2)} ${w(77, 42, 3)}. When a preposition joins mā asking a question (“what?”), the ending alif is dropped! So ʿan + mā becomes ${w(78, 1, 1)} (“about what”), fī + mā becomes ${w(79, 43, 1)} (“in what”), and min + mā becomes ${w(86, 5, 3)} (“from what”).`
		),
		phrase(
			78,
			1,
			1,
			2,
			'about what do they ask one another?',
			'ʿamma has no alif at the end, showing right away that it is a question.'
		),
		text(
			'Spotting the shortened question',
			`Compare ${w(77, 42, 2)} (“of what”, with alif at the end) and ${w(86, 5, 3)} (“from what”, without alif). In ${w(86, 5, 1)} ${w(86, 5, 2)} ${w(86, 5, 3)} ${w(86, 5, 4)}, the missing alif tells you that ${w(86, 5, 3)} is asking a question: “from what he was created”.`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'ma-1',
			'What does this joined word mean at the start of a sentence?',
			ar(w(79, 45, 1)),
			en('only'),
			[en('about what'), en('whether'), en('and not')],
			`${w(79, 45, 1)} is “only”: inna joined with mā.`,
			rng
		),
		handChoice(
			'ma-2',
			'Which word asks “about what”, with the ending alif of mā dropped?',
			undefined,
			ar(w(78, 1, 1)),
			[ar(w(84, 23, 3)), ar(w(77, 42, 2))],
			`${w(78, 1, 1)} is “about what”. ${w(84, 23, 3)} and ${w(77, 42, 2)} keep the alif because they mean “of what” (“that which”), not a question.`,
			rng
		),
		handChoice(
			'ma-3',
			`Why does ${w(86, 5, 3)} (“from what”) end without an alif, unlike ${w(77, 42, 2)} (“of what”)?`,
			undefined,
			en('Because mā is asking a question after a preposition'),
			[en('Because it is in the plural'), en('Because it is in the past tense')],
			'When a preposition joins question mā (“what?”), the alif at the end of mā is dropped.',
			rng
		),
		buildPhrase(
			'ma-4',
			'so as for the orphan, so do not oppress',
			[w(93, 9, 1), w(93, 9, 2), w(93, 9, 3), w(93, 9, 4)],
			[w(78, 1, 1)],
			`${w(93, 9, 1)} ${w(93, 9, 2)} ${w(93, 9, 3)} ${w(93, 9, 4)}: “so as for”, “the orphan”, “so do not”, “oppress”.`,
			rng
		),
		handChoice(
			'ma-5',
			`What does ${w(76, 3, 4)} … ${w(76, 3, 6)} mean in “We guided him to the way, whether grateful and whether ungrateful”?`,
			ar(`${w(76, 3, 4)} ${w(76, 3, 5)} ${w(76, 3, 6)} ${w(76, 3, 7)}`),
			en('whether … and whether'),
			[en('about what … in what'), en('only … except')],
			`${w(76, 3, 4)} is “whether” and ${w(76, 3, 6)} is “and whether”.`,
			rng
		),
		handChoice(
			'ma-6',
			'Which word asks “in what”?',
			undefined,
			ar(w(79, 43, 1)),
			[ar(w(79, 45, 1)), ar(w(93, 9, 1))],
			`${w(79, 43, 1)} is “in what” (fī + question mā). ${w(79, 45, 1)} is “only” and ${w(93, 9, 1)} is “so as for”.`,
			rng
		),
		handMatch(
			'ma-7',
			'Match each joined form of mā with its meaning.',
			[
				{ arabic: w(78, 1, 1), english: 'about what' },
				{ arabic: w(86, 5, 3), english: 'from what' },
				{ arabic: w(79, 45, 1), english: 'only' },
				{ arabic: w(93, 9, 1), english: 'so as for' }
			],
			'ʿamma “about what”, mimma “from what”, innamā “only”, and fa-ammā “so as for”.',
			rng
		),
		tapMimma
	]
};
