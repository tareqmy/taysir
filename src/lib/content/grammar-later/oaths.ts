import { verse as verseOf, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, buildPhrase, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * Swearing by something: wa- at the start of an oath means “by”, the next things sworn by are joined
 * with wa- “and”, and the answer, what is sworn to, begins with a word of emphasis. Many Juz Amma
 * surahs open this way. The corpus tags the first wa- of an oath as a preposition and the later ones
 * as “and”, and `oaths.spec.ts` checks that for every oath the lesson shows. Every example comes
 * from Juz Amma, all Arabic through `w(surah, ayah, word)`. The explanations are drafts: keep them
 * conservative and have a teacher review them.
 */

const rng = rngFor('grammar-oaths');

/** Tap la-qad “certainly”, which begins the answer to the oaths of At-Tin. */
const tapCertainly: TapExercise = {
	kind: 'tap',
	id: 'oath-8',
	question: 'Tap the word that means “certainly”.',
	words: verseOf(95, 4).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't0',
	explanation: `${w(95, 4, 1)} is “certainly”: la- and qad, both words of emphasis. It begins what the three oaths of verses 1 to 3 are sworn to: “We created the human being in the best of form”.`
};

export const oathsLesson: Lesson = {
	id: 'grammar-oaths',
	unitId: 'grammar-later',
	title: 'Swearing by something',
	subtitle: 'wa- “by”, and what the oath is for',
	kind: 'grammar',
	intro: [
		rule(
			'wa- can mean “by”',
			`At the start of many surahs, wa- does not mean “and”. It swears: “by …”. ${w(103, 1, 1)} is “by time”, and ${w(91, 1, 1)} is “by the sun”. The thing sworn by ends in -i, like a noun after a small word.`
		),
		phrase(103, 1, 1, 1, 'by time', 'wa- “by” and the noun it swears by, with ال.'),
		phrase(91, 1, 1, 1, 'by the sun', 'The same: wa- “by”, then “the sun”.'),
		text(
			'The next ones are “and”',
			`After the first, the oath goes on with more things, each joined with wa- “and”: ${w(91, 2, 1)} ${w(91, 2, 2)} ${w(91, 2, 3)} is “and the moon when it follows it”. The two wa- look the same. The one at the very start of the oath is “by”, and the ones later in the run are “and”.`
		),
		phrase(
			91,
			2,
			1,
			3,
			'and the moon when it follows it',
			'wa- “and” continues the oath, then idhā “when”, as in the lesson on runs of “when”.'
		),
		rule(
			'What the oath is for',
			`An oath is followed by what is sworn to, the answer. It often begins with a word of emphasis: qad “certainly”, inna “indeed”, or la- on the front of a word. After the long run of oaths in Ash-Shams comes ${w(91, 9, 1)} ${w(91, 9, 2)} ${w(91, 9, 3)} ${w(91, 9, 4)}, “he has certainly succeeded who purified it”. After “by time” comes ${w(103, 2, 1)}, “indeed”.`
		),
		phrase(
			91,
			9,
			1,
			4,
			'he has certainly succeeded who purified it',
			'qad “certainly” begins the answer.'
		),
		phrase(
			103,
			2,
			1,
			4,
			'indeed the human being is surely in loss',
			`inna “indeed” at the front and la- “surely” on the word ${w(103, 2, 3)}: emphasis at both ends, as the Juz Amma lessons showed.`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'oath-1',
			'What does the first small word of this mean here?',
			ar(w(103, 1, 1)),
			en('by'),
			[en('and'), en('then'), en('for')],
			'At the start of an oath wa- swears: “by time”.',
			rng
		),
		handChoice(
			'oath-2',
			'Which of these starts the oath, with wa- meaning “by”?',
			undefined,
			ar(w(91, 1, 1)),
			[ar(w(91, 2, 1)), ar(w(91, 3, 1))],
			`${w(91, 1, 1)} is “by the sun”, the start of the oath. The other two, “and the moon” and “and the day”, are joined to it with wa- “and”.`,
			rng
		),
		buildPhrase(
			'oath-3',
			'and the moon when it follows it',
			[w(91, 2, 1), w(91, 2, 2), w(91, 2, 3)],
			[w(91, 3, 3)],
			`${w(91, 2, 1)} ${w(91, 2, 2)} ${w(91, 2, 3)}: “and the moon”, “when”, “it follows it”.`,
			rng
		),
		handChoice(
			'oath-4',
			'Which ending does the noun sworn by have, as in “by the sun”?',
			undefined,
			en('-i (genitive)'),
			[en('-u (nominative)'), en('-a (accusative)')],
			`The noun after oath wa- ends in -i, as ${w(91, 1, 1)} and ${w(103, 1, 1)} do.`,
			rng
		),
		handChoice(
			'oath-5',
			'Which of these begins the answer to the oaths, not an oath itself?',
			undefined,
			ar(w(91, 9, 1)),
			[ar(w(91, 3, 1)), ar(w(91, 5, 1))],
			`${w(91, 9, 1)} is qad “certainly”, which begins what is sworn to. ${w(91, 3, 1)} is “and the day” and ${w(91, 5, 1)} is “and the sky”: more things sworn by.`,
			rng
		),
		handChoice(
			'oath-6',
			'After “by time”, the answer begins with this word. What does it mean?',
			ar(w(103, 2, 1)),
			en('indeed'),
			[en('except'), en('if'), en('not')],
			`${w(103, 2, 1)} is inna “indeed”: a word of emphasis, as the answer to an oath often begins.`,
			rng
		),
		handMatch(
			'oath-7',
			'Match each oath with its meaning.',
			[
				{ arabic: w(103, 1, 1), english: 'by time' },
				{ arabic: w(91, 1, 1), english: 'by the sun' },
				{ arabic: w(95, 1, 1), english: 'by the fig' },
				{ arabic: w(89, 1, 1), english: 'by the dawn' }
			],
			'Four oaths: wa- “by”, then the thing sworn by.',
			rng
		),
		tapCertainly
	]
};
