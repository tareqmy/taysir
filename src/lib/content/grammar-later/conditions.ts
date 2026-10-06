import { wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, buildPhrase, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson } from '../types';

/**
 * “If” and “whoever”: the words that start a condition (in, law and man) and the result that
 * follows. Juz Amma has them in short verses a learner can read whole: Al-Layl, Az-Zalzalah,
 * Al-Alaq, Abasa and At-Takathur. Every example comes from there, all Arabic through
 * `w(surah, ayah, word)`, and `conditions.spec.ts` checks each condition word and verb against the
 * corpus's tags. The explanations are drafts: keep them conservative and have a teacher review them.
 */

const rng = rngFor('grammar-conditions');

export const conditionsLesson: Lesson = {
	id: 'grammar-conditions',
	unitId: 'grammar-later',
	title: 'If, and whoever',
	subtitle: 'Condition words and their results',
	kind: 'grammar',
	intro: [
		rule(
			'A condition has two parts',
			'A condition says “if this, then that”. A few words start one: in “if”, law “if only” and man “whoever”. The first part is the condition. The second is the result, which sometimes begins with fa- “then”.'
		),
		phrase(
			87,
			9,
			1,
			4,
			'so remind, if the reminder benefits',
			'in “if” starts the condition: “if the reminder benefits”.'
		),
		phrase(
			96,
			15,
			2,
			6,
			'if indeed he does not desist, We will surely drag him by the forelock',
			'The condition is “if he does not desist”, and the result is “We will surely drag”. la- “surely” starts both: you met it as emphasis.'
		),
		phrase(
			99,
			7,
			1,
			6,
			'so whoever does the weight of a speck of good will see it',
			'man “whoever” starts a condition too: “whoever does good” is the condition, and “will see it” is the result.'
		),
		text(
			'A shortened verb',
			`After a condition word a present verb often loses its last -u. ${w(99, 7, 2)} (“does”) ends in a sukūn, not in -u, and so does ${w(99, 7, 6)} (“will see it”). It is the same shortening you saw after lam. When the verb is in the past form, as in ${w(80, 12, 1)} ${w(80, 12, 2)} ${w(80, 12, 3)} (“so whoever wills, remembers it”), nothing shows, and the meaning is still “whoever”.`
		),
		text(
			'in is not inna',
			`in “if” is short. inna “indeed” has a doubled n. Compare ${w(87, 9, 2)} (“if”) and ${w(78, 21, 1)} (“indeed”). They look alike, and their meanings are quite different, so look for the doubled n.`
		),
		text(
			'law: “if only”',
			`law also means “if”, but for something imagined or wished for, not something likely. ${w(102, 5, 1)} ${w(102, 5, 2)} ${w(102, 5, 3)} is “never! if you knew”. The verse stops after the condition, without saying what would follow.`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'cond-1',
			'What does this word mean?',
			ar(w(87, 9, 2)),
			en('if'),
			[en('indeed'), en('not'), en('and')],
			'in “if” starts a condition.',
			rng
		),
		handChoice(
			'cond-2',
			'Which of these means “indeed”, not “if”?',
			undefined,
			ar(w(78, 21, 1)),
			[ar(w(87, 9, 2)), ar(w(102, 5, 2))],
			`${w(78, 21, 1)} has the doubled n: “indeed”. ${w(87, 9, 2)} is in “if”, and ${w(102, 5, 2)} is law “if only”.`,
			rng
		),
		handChoice(
			'cond-3',
			'What does this mean?',
			ar(w(99, 7, 1)),
			en('so whoever'),
			[en('so whatever'), en('so if'), en('and not')],
			'fa- “so” and man “whoever”.',
			rng
		),
		buildPhrase(
			'cond-4',
			'so whoever does the weight of a speck of good will see it',
			[w(99, 7, 1), w(99, 7, 2), w(99, 7, 3), w(99, 7, 4), w(99, 7, 5), w(99, 7, 6)],
			[w(99, 8, 1), w(99, 8, 5)],
			`${w(99, 7, 1)} ${w(99, 7, 2)}: “so whoever does”, then what is done, and last the result, ${w(99, 7, 6)} “will see it”.`,
			rng
		),
		handChoice(
			'cond-5',
			'In “so whoever wills, remembers it”, which word is the result?',
			ar(`${w(80, 12, 1)} ${w(80, 12, 2)} ${w(80, 12, 3)}`),
			ar(w(80, 12, 3)),
			[ar(w(80, 12, 1)), ar(w(80, 12, 2))],
			`${w(80, 12, 1)} ${w(80, 12, 2)} is the condition, “so whoever wills”, and ${w(80, 12, 3)} is the result, “remembers it”.`,
			rng
		),
		handChoice(
			'cond-6',
			'Which word starts the condition in “never! if you knew the knowledge of certainty”?',
			ar(`${w(102, 5, 1)} ${w(102, 5, 2)} ${w(102, 5, 3)} ${w(102, 5, 4)} ${w(102, 5, 5)}`),
			ar(w(102, 5, 2)),
			[ar(w(102, 5, 1)), ar(w(102, 5, 4))],
			`${w(102, 5, 2)} is law “if”. ${w(102, 5, 1)} is “never!” and ${w(102, 5, 4)} is “knowledge of”.`,
			rng
		),
		handMatch(
			'cond-7',
			'Match each condition word with its meaning.',
			[
				{ arabic: w(87, 9, 2), english: 'if' },
				{ arabic: w(96, 15, 2), english: 'if indeed' },
				{ arabic: w(99, 7, 1), english: 'so whoever' },
				{ arabic: w(99, 8, 1), english: 'and whoever' }
			],
			'in “if” (with la- “indeed” in front of it in the second) and man “whoever” (with fa- “so” or wa- “and”).',
			rng
		),
		handChoice(
			'cond-8',
			'In “if indeed he does not desist, We will surely drag him by the forelock”, which word is the result?',
			ar(`${w(96, 15, 2)} ${w(96, 15, 3)} ${w(96, 15, 4)} ${w(96, 15, 5)} ${w(96, 15, 6)}`),
			ar(w(96, 15, 5)),
			[ar(w(96, 15, 2)), ar(w(96, 15, 4))],
			`${w(96, 15, 5)} is “We will surely drag”: the result. ${w(96, 15, 2)} is “if indeed” and ${w(96, 15, 4)} is “he desists”, which belong to the condition.`,
			rng
		)
	]
};
