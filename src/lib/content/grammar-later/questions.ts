import { verse as verseOf, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, buildPhrase, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * Questions, strong denials, and strong affirmations in Juz Amma: a-laysa (“is not”), ayna (“where”),
 * ayyāna (“when”), lan (“never” in the future), lammā (“not yet”), balā (“yes indeed!” overturning a
 * negative question or claim), and kallā (“nay!”). All Arabic comes through `w(surah, ayah, word)`.
 */

const rng = rngFor('grammar-questions');

/** Tap lammā (“not yet”) in 80:23. */
const tapLamma: TapExercise = {
	kind: 'tap',
	id: 'quest-8',
	question: 'Tap the word that means “not yet”.',
	words: verseOf(80, 23).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't1',
	explanation: `${w(80, 23, 2)} is “not yet”, right after ${w(80, 23, 1)} (“nay”).`
};

export const questionsLesson: Lesson = {
	id: 'grammar-questions',
	unitId: 'grammar-later',
	title: 'Questions, “yes indeed”, and “never”',
	subtitle: 'alaysa, balā, kallā, lan and lammā',
	kind: 'grammar',
	intro: [
		rule(
			'Asking “where?”, “when?”, and “is not…?”',
			`Beyond “what?” and “who?”, Juz Amma asks about place and time: ${w(81, 26, 1)} is “so where” in ${w(81, 26, 1)} ${w(81, 26, 2)}, and ${w(79, 42, 4)} is “when” in ${w(79, 42, 4)} ${w(79, 42, 5)}. When the question prefix a- joins laysa (“is not”), it forms ${w(95, 8, 1)} (“is not”), inviting the listener to agree.`
		),
		phrase(
			95,
			8,
			1,
			4,
			'is not Allah the most just of the judges?',
			'alaysa asks a negative question whose answer is clearly “yes indeed!”.'
		),
		rule(
			'“Never” (lan) and “yes indeed!” (balā)',
			`To say something will never happen in the future, Arabic puts ${w(84, 14, 4)} (“never”) before a present-tense verb, as in ${w(84, 14, 1)} ${w(84, 14, 2)} ${w(84, 14, 3)} ${w(84, 14, 4)} ${w(84, 14, 5)} (“he will return”), or joins it with an (“that”) to make ${w(75, 3, 3)} (“that never”). And to overturn a negative claim or negative question with “yes indeed, on the contrary!”, Arabic answers with ${w(75, 4, 1)} (“yes indeed”).`
		),
		phrase(
			75,
			3,
			1,
			5,
			'does the human being think that We will never gather his bones?',
			'a-lan combines that (an) + never (lan).'
		),
		phrase(
			75,
			4,
			1,
			2,
			'yes indeed, able…',
			'balā (“yes indeed”) overturns the doubt in the verse before it.'
		),
		text(
			'“Nay!” (kallā) and “not yet” (lammā)',
			`While ${w(75, 4, 1)} (“yes indeed”) affirms what someone doubted, ${w(80, 23, 1)} (“nay”) sharply rejects a false thought. Right after it in ${w(80, 23, 1)} ${w(80, 23, 2)} ${w(80, 23, 3)} ${w(80, 23, 4)} ${w(80, 23, 5)} comes ${w(80, 23, 2)} (“not yet”) before the present-tense verb ${w(80, 23, 3)} (“he has fulfilled”).`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'quest-1',
			'What does this word mean when answering a negative question or doubt?',
			ar(w(75, 4, 1)),
			en('yes indeed'),
			[en('nay'), en('not yet'), en('never')],
			`${w(75, 4, 1)} is “yes indeed”: it overturns a negative question or claim.`,
			rng
		),
		handChoice(
			'quest-2',
			'Which word means “never” (for the future)?',
			undefined,
			ar(w(84, 14, 4)),
			[ar(w(80, 23, 1)), ar(w(75, 4, 1))],
			`${w(84, 14, 4)} is “never”. ${w(80, 23, 1)} is “nay” and ${w(75, 4, 1)} is “yes indeed”.`,
			rng
		),
		buildPhrase(
			'quest-3',
			'is not Allah the most just of the judges?',
			[w(95, 8, 1), w(95, 8, 2), w(95, 8, 3), w(95, 8, 4)],
			[w(80, 23, 1)],
			`${w(95, 8, 1)} ${w(95, 8, 2)} ${w(95, 8, 3)} ${w(95, 8, 4)}: “is not”, “Allah”, “the most just of”, “the judges”.`,
			rng
		),
		handChoice(
			'quest-4',
			`What does ${w(80, 23, 1)} mean at the start of ${w(80, 23, 1)} ${w(80, 23, 2)} ${w(80, 23, 3)}?`,
			undefined,
			en('nay'),
			[en('yes indeed'), en('so where'), en('when')],
			`${w(80, 23, 1)} is “nay”, a strong rejection.`,
			rng
		),
		handChoice(
			'quest-5',
			`Which word asks “when” in ${w(79, 42, 1)} ${w(79, 42, 2)} ${w(79, 42, 3)} ${w(79, 42, 4)} ${w(79, 42, 5)}?`,
			undefined,
			ar(w(79, 42, 4)),
			[ar(w(79, 42, 1)), ar(w(79, 42, 3))],
			`${w(79, 42, 4)} is “when”. ${w(79, 42, 1)} is “they ask you” and ${w(79, 42, 3)} is “the Hour”.`,
			rng
		),
		handChoice(
			'quest-6',
			`What does ${w(81, 26, 1)} mean in ${w(81, 26, 1)} ${w(81, 26, 2)}?`,
			undefined,
			en('so where'),
			[en('not yet'), en('is not'), en('yes indeed')],
			`${w(81, 26, 1)} is “so where”, followed by ${w(81, 26, 2)} (“are you going”).`,
			rng
		),
		handMatch(
			'quest-7',
			'Match each question or answer word with its meaning.',
			[
				{ arabic: w(95, 8, 1), english: 'is not' },
				{ arabic: w(75, 4, 1), english: 'yes indeed' },
				{ arabic: w(80, 23, 1), english: 'nay' },
				{ arabic: w(84, 14, 4), english: 'never' }
			],
			'alaysa “is not”, balā “yes indeed”, kallā “nay”, and lan “never”.',
			rng
		),
		tapLamma
	]
};
