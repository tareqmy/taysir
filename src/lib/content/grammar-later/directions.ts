import { verse as verseOf, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, buildPhrase, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * Words of place, direction, and possession: fawqa (“above”), taḥta (“beneath”), bayna (“between”),
 * warāʾa (“behind”), ʿinda and ladā (“with / in the presence of”), dhā / dhī / dhāt (“having /
 * possessor of”), and ahl (“the people of”). Every example comes from Juz Amma through `w(s, a, n)`.
 */

const rng = rngFor('grammar-directions');

/** Tap ʿinda (“with”) in 81:20. */
const tapInda: TapExercise = {
	kind: 'tap',
	id: 'dir-8',
	question: 'Tap the word that means “with” (in the presence of).',
	words: verseOf(81, 20).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't2',
	explanation: `${w(81, 20, 3)} is “with”: in the presence of the Owner of the Throne.`
};

export const directionsLesson: Lesson = {
	id: 'grammar-directions',
	unitId: 'grammar-later',
	title: 'Places, directions, and possession',
	subtitle: 'fawqa, taḥta, bayna, ʿinda, dhū and ahl',
	kind: 'grammar',
	intro: [
		rule(
			'Words for “above”, “beneath”, “between”, and “behind”',
			`Arabic uses special location words right before a noun or attached pronoun: ${w(78, 12, 2)} is “above you” in ${w(78, 12, 1)} ${w(78, 12, 2)} ${w(78, 12, 3)} ${w(78, 12, 4)}, and ${w(85, 11, 10)} is “beneath them” in ${w(85, 11, 8)} ${w(85, 11, 9)} ${w(85, 11, 10)} ${w(85, 11, 11)}. In the same way, ${w(86, 7, 3)} is “between” and ${w(85, 20, 3)} is “behind them”.`
		),
		phrase(
			86,
			7,
			1,
			5,
			'it comes out from between the backbone and the ribs',
			'min bayni: “from between”, followed by the two nouns.'
		),
		phrase(
			85,
			20,
			1,
			4,
			'and Allah from behind them is encompassing',
			'warāʾihim: “behind them”, with the pronoun -him attached.'
		),
		rule(
			'“With” and “possessor of”: ʿinda, ladā, dhū, dhāt, and ahl',
			`Two location words mean “with” or “in the presence of”: ${w(81, 20, 3)} is “with”, and ${w(73, 12, 2)} is “with Us”. To say “possessor of” or “having”, Arabic uses ${w(68, 14, 3)} (“having”, which becomes ${w(81, 20, 1)} meaning “possessor of” with an i-ending) and its feminine partner ${w(85, 1, 2)} (“having”). And ${w(98, 1, 6)} means “the people of”, as in ${w(98, 1, 6)} ${w(98, 1, 7)}.`
		),
		phrase(
			81,
			20,
			1,
			6,
			'possessor of strength, with the Possessor of the Throne, firmly established',
			'Both dhī (“possessor of”) and ʿinda (“with”) appear side by side in this verse.'
		),
		text(
			'Masculine dhī and feminine dhāt',
			`Compare ${w(81, 20, 1)} ${w(81, 20, 2)} (where ${w(81, 20, 1)} is “possessor of”) with ${w(85, 1, 1)} ${w(85, 1, 2)} ${w(85, 1, 3)} (where ${w(85, 1, 2)} is “having”, matching the feminine noun ${w(85, 1, 1)}).`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'dir-1',
			'What does this word mean?',
			ar(w(78, 12, 2)),
			en('above you'),
			[en('beneath them'), en('behind them'), en('with Us')],
			`${w(78, 12, 2)} is “above you”: fawqa (“above”) + -kum (“you”).`,
			rng
		),
		handChoice(
			'dir-2',
			'Which word means “between” in “it comes out from between the backbone and the ribs”?',
			undefined,
			ar(w(86, 7, 3)),
			[ar(w(86, 7, 1)), ar(w(86, 7, 4))],
			`${w(86, 7, 3)} is “between”. ${w(86, 7, 1)} is “it comes out” and ${w(86, 7, 4)} is “the backbone”.`,
			rng
		),
		buildPhrase(
			'dir-3',
			'and Allah from behind them is encompassing',
			[w(85, 20, 1), w(85, 20, 2), w(85, 20, 3), w(85, 20, 4)],
			[w(86, 7, 3)],
			`${w(85, 20, 1)} ${w(85, 20, 2)} ${w(85, 20, 3)} ${w(85, 20, 4)}: “and Allah”, “from”, “behind them”, “encompassing”.`,
			rng
		),
		handChoice(
			'dir-4',
			`What does ${w(81, 20, 1)} mean in ${w(81, 20, 1)} ${w(81, 20, 2)}?`,
			undefined,
			en('possessor of'),
			[en('between'), en('above you'), en('from')],
			`${w(81, 20, 1)} is “possessor of”, followed by ${w(81, 20, 2)} (“strength”).`,
			rng
		),
		handChoice(
			'dir-5',
			`Which word is the feminine partner of ${w(81, 20, 1)}, meaning “having” in ${w(85, 1, 1)} ${w(85, 1, 2)} ${w(85, 1, 3)}?`,
			undefined,
			ar(w(85, 1, 2)),
			[ar(w(85, 1, 1)), ar(w(85, 1, 3))],
			`${w(85, 1, 2)} is “having”, describing ${w(85, 1, 1)} (“by the sky”).`,
			rng
		),
		handChoice(
			'dir-6',
			`What does ${w(98, 1, 6)} mean in ${w(98, 1, 6)} ${w(98, 1, 7)}?`,
			undefined,
			en('the people of'),
			[en('behind them'), en('beneath them'), en('above you')],
			`${w(98, 1, 6)} is “the people of”, followed by ${w(98, 1, 7)} (“the Book”).`,
			rng
		),
		handMatch(
			'dir-7',
			'Match each location or possession word with its meaning.',
			[
				{ arabic: w(78, 12, 2), english: 'above you' },
				{ arabic: w(85, 11, 10), english: 'beneath them' },
				{ arabic: w(86, 7, 3), english: 'between' },
				{ arabic: w(73, 12, 2), english: 'with Us' }
			],
			'fawqakum “above you”, taḥtihā “beneath them”, bayni “between”, and ladaynā “with Us”.',
			rng
		),
		tapInda
	]
};
