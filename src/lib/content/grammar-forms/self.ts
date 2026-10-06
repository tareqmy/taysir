import { verse as verseOf, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, buildPhrase, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * Forms V and VI: doing it to oneself, or to each other. Form V is Form II with ta- in front, and
 * Form VI has ta- and a long ā after the first root letter. The pairs are words the learner has met
 * as vocabulary cards, in verses of Juz Amma, and `self.spec.ts` checks each against the corpus's
 * verb-form tags. The explanations are drafts: keep them conservative and have a teacher review
 * them.
 */

const rng = rngFor('grammar-forms-self');

/** Tap the Form VI verb in “and you do not urge each other to feed the needy”. */
const tapUrge: TapExercise = {
	kind: 'tap',
	id: 'self-8',
	question: 'Tap the verb that means “you urge each other”.',
	words: verseOf(89, 18).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't1',
	explanation: `${w(89, 18, 2)} is “you urge each other”: Form VI, the “each other” shape. The plain verb of the same root is ${w(107, 3, 2)} “urge”.`
};

export const selfLesson: Lesson = {
	id: 'grammar-forms-self',
	unitId: 'grammar-forms',
	title: 'To yourself, or to each other',
	subtitle: 'Forms V and VI',
	kind: 'grammar',
	intro: [
		rule(
			'ta- before the doubled letter: Form V',
			`Form V is the Form II shape with ta- added in front. It often means doing the action to oneself, or the action happening to the thing. ${w(91, 9, 4)} is “he purified it”, a Form II verb, and ${w(92, 18, 4)} is “he purifies himself”, Form V of the same root. In the present, look for ya-ta-: ${w(79, 35, 2)} is “remembers”, from the root of ${w(87, 9, 1)} (“so remind”): remind, and remember oneself.`
		),
		phrase(
			92,
			18,
			1,
			4,
			'who gives his wealth, purifying himself',
			'The last verb is Form V: ya-ta-zakkā, “he purifies himself”.'
		),
		text(
			'In the past, Form V begins with ta-',
			`${w(80, 1, 2)} is “and turned away”, and ${w(84, 4, 4)} is “and empties itself”. Both are Form V in the past, so after the wa- “and” you see ta- before the doubled letter. The second one does the action to itself: the earth empties itself.`
		),
		phrase(
			84,
			4,
			1,
			4,
			'and casts out what is in it and empties itself',
			'wa-takhallat: wa- “and”, then ta-khallat, Form V in the past.'
		),
		text(
			'Form VI: a long ā after the first letter',
			`Form VI is ta- with a long ā after the first letter of the root. It often means doing the action to each other. ${w(79, 42, 1)} is “they ask you”, and ${w(78, 1, 2)} is “they ask one another”. ${w(89, 18, 2)} is “you urge each other”, from the root of ${w(107, 3, 2)} (“urge”).`
		),
		phrase(
			89,
			18,
			1,
			5,
			'and you do not urge each other to feed the needy',
			'taḥāḍḍūna, Form VI: the urging goes both ways.'
		),
		rule(
			'Not always “oneself”',
			`Many Form V and Form VI verbs simply have a meaning of their own, such as ${w(80, 1, 2)} (“and turned away”). Learn them as words, and use the shape as a clue.`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'self-1',
			'Which verb is Form V, with ya-ta- in front of the doubled letter?',
			undefined,
			ar(w(92, 18, 4)),
			[ar(w(91, 9, 4)), ar(w(79, 42, 1))],
			`${w(92, 18, 4)} is “he purifies himself”: ya-ta-zakkā. ${w(91, 9, 4)} “he purified it” is Form II, and ${w(79, 42, 1)} “they ask you” is the plain verb.`,
			rng
		),
		handChoice(
			'self-2',
			`${w(92, 18, 4)} (“he purifies himself”) and ${w(91, 9, 4)} (“he purified it”) share a root. What does the ta- add?`,
			undefined,
			en('The action is done to oneself'),
			[en('Someone else is made to do it'), en('It becomes a command')],
			'Form V often means doing the Form II action to oneself: purify becomes purify oneself.',
			rng
		),
		handChoice(
			'self-3',
			'Which verb means “they ask one another”?',
			undefined,
			ar(w(78, 1, 2)),
			[ar(w(79, 42, 1)), ar(w(107, 3, 2))],
			`${w(78, 1, 2)} is Form VI: “they ask one another”. ${w(79, 42, 1)} is “they ask you”, and ${w(107, 3, 2)} is “urge”.`,
			rng
		),
		handChoice(
			'self-4',
			'What does the long ā after the first root letter, in Form VI, often add?',
			undefined,
			en('Doing it to each other'),
			[en('Doing it to oneself'), en('Making someone else do it')],
			'Form VI often means two or more doing the action to each other: ask becomes ask one another.',
			rng
		),
		handMatch(
			'self-5',
			'Match each verb with its meaning.',
			[
				{ arabic: w(79, 42, 1), english: 'they ask you' },
				{ arabic: w(78, 1, 2), english: 'they ask one another' },
				{ arabic: w(107, 3, 2), english: 'urge' },
				{ arabic: w(89, 18, 2), english: 'you urge each other' }
			],
			'Two plain verbs, and their “each other” partners from Form VI.',
			rng
		),
		buildPhrase(
			'self-6',
			'and casts out what is in it and empties itself',
			[w(84, 4, 1), w(84, 4, 2), w(84, 4, 3), w(84, 4, 4)],
			[w(91, 9, 4)],
			`${w(84, 4, 4)} is Form V “and empties itself”. ${w(91, 9, 4)} is a Form II verb from another verse, which does not belong.`,
			rng
		),
		handChoice(
			'self-7',
			`${w(79, 35, 2)} (“remembers”) is built on the same root as which word?`,
			undefined,
			ar(w(87, 9, 1)),
			[ar(w(91, 9, 4)), ar(w(96, 4, 2))],
			`${w(87, 9, 1)} is “so remind”: the Form II partner of ${w(79, 35, 2)}. The other two are from other roots.`,
			rng
		),
		tapUrge
	]
};
