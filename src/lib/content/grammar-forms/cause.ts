import { formatRoot, lexemeById, verse as verseOf, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, buildPhrase, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * The first lesson on verb forms: the same root in a new shape. Form II doubles the middle letter and
 * Form IV has an a- in the past, and both often mean making someone else do the plain action. The
 * pairs are verbs the learner has already met as words, one verse or surah apart, with the same root
 * and different forms in the corpus, and `cause.spec.ts` checks each. The explanations are drafts:
 * keep them conservative and have a teacher review them.
 */

const root = (lexemeId: string) => formatRoot(lexemeById(lexemeId).root!);

const rng = rngFor('grammar-forms-cause');

/** Tap the verb for “He taught” in “He taught the human being what he did not know”. */
const tapTaught: TapExercise = {
	kind: 'tap',
	id: 'cause-8',
	question: 'Tap the verb that means “He taught”.',
	words: verseOf(96, 5).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't0',
	explanation: `${w(96, 5, 1)} is “He taught”: Form II, with the middle letter doubled. ${w(96, 5, 5)} “know” is Form I of the same root.`
};

export const causeLesson: Lesson = {
	id: 'grammar-forms-cause',
	unitId: 'grammar-forms',
	title: 'The same root, a new shape',
	subtitle: 'A doubled middle letter, and a- in the past',
	kind: 'grammar',
	intro: [
		rule(
			'A root takes different shapes',
			`Many verbs in this course share a root, and one root can take several shapes. ${w(78, 4, 2)} (“they will know”) and ${w(96, 4, 2)} (“He taught”) are both built on ${root('alima')}: the same three letters in two shapes. A shape is a pattern, and it changes the meaning in a regular way. The plain shape is called Form I. The others are numbered up to Form X. This lesson takes the two that most often mean “make someone do it”.`
		),
		text(
			'Form II: the middle letter doubled',
			`Doubling the middle letter, which a shadda marks, makes Form II. It often means making someone else do the plain action. ${w(78, 4, 2)} is “they will know”, and ${w(96, 4, 2)} is “He taught”: made them know. ${w(80, 12, 3)} is “he remembers it”, and ${w(87, 9, 1)} is “so remind”: make someone remember.`
		),
		phrase(
			96,
			5,
			1,
			5,
			'He taught the human being what he did not know',
			'ʿallama “taught” is Form II, and yaʿlam “know” is Form I of the same root.'
		),
		text(
			'Form IV: a- in the past',
			`In the past, an a- at the front makes Form IV. It too often means causing something to happen. ${w(87, 13, 3)} is “he dies”, and ${w(80, 21, 2)} is “He caused him to die”. In the present, Form IV begins with a different vowel (nu-, yu-), and the idea is the same: ${w(87, 6, 1)} is “We will make you recite”, from the root of ${w(96, 1, 1)} (“read”).`
		),
		phrase(
			80,
			21,
			1,
			3,
			'then He caused him to die and put him in a grave',
			'The a- of Form IV on the verb for “die”.'
		),
		rule(
			'A clue, not a law',
			'These meanings are tendencies, not laws. Some Form II and Form IV verbs have no plain Form I partner you will meet, and some pairs have drifted apart in meaning. Use the shape as a clue, then check the meaning in the verse.'
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'cause-1',
			'Which verb has its middle letter doubled, which makes it Form II?',
			undefined,
			ar(w(96, 4, 2)),
			[ar(w(78, 4, 2)), ar(w(80, 12, 3))],
			`${w(96, 4, 2)} is “He taught”, with the doubled middle letter. ${w(78, 4, 2)} “they will know” and ${w(80, 12, 3)} “he remembers it” are the plain Form I.`,
			rng
		),
		handChoice(
			'cause-2',
			'Which verb starts with a- in the past, which makes it Form IV?',
			undefined,
			ar(w(80, 21, 2)),
			[ar(w(87, 13, 3)), ar(w(80, 12, 3))],
			`${w(80, 21, 2)} is “He caused him to die”, with the a- of Form IV. ${w(87, 13, 3)} “he dies” and ${w(80, 12, 3)} “he remembers it” are the plain Form I.`,
			rng
		),
		handChoice(
			'cause-3',
			`${w(96, 4, 2)} (“He taught”) and ${w(78, 4, 2)} (“they will know”) share a root. What does the doubled middle letter do?`,
			undefined,
			en('It often makes someone else do the action: “made them know”'),
			[en('It makes the verb a command'), en('It makes the verb passive')],
			'Form II often means causing someone to do the plain action: know becomes teach.',
			rng
		),
		handChoice(
			'cause-4',
			`${w(80, 21, 2)} (“He caused him to die”) and ${w(87, 13, 3)} (“he dies”) share a root. What does the a- do?`,
			undefined,
			en('It often makes someone else do the action: “caused to die”'),
			[en('It makes the verb a command'), en('It makes the verb passive')],
			'Form IV often means causing something to happen: die becomes cause to die.',
			rng
		),
		handMatch(
			'cause-5',
			'Match each verb with its meaning.',
			[
				{ arabic: w(87, 13, 3), english: 'he dies' },
				{ arabic: w(80, 21, 2), english: 'He caused him to die' },
				{ arabic: w(96, 4, 2), english: 'He taught' },
				{ arabic: w(87, 9, 1), english: 'so remind' }
			],
			'Two plain verbs’ partners: “die” and “cause to die”, “know” and “teach”, and “remember” and “remind”.',
			rng
		),
		buildPhrase(
			'cause-6',
			'so remind, if the reminder benefits',
			[w(87, 9, 1), w(87, 9, 2), w(87, 9, 3), w(87, 9, 4)],
			[w(80, 12, 3)],
			`${w(87, 9, 1)} is Form II “so remind”. ${w(80, 12, 3)} is the plain “he remembers it”, which does not belong.`,
			rng
		),
		handChoice(
			'cause-7',
			`${w(87, 6, 1)} (“We will make you recite”) is Form IV. Which verb is the plain Form I of the same root?`,
			undefined,
			ar(w(96, 1, 1)),
			[ar(w(96, 4, 2)), ar(w(87, 13, 3))],
			`${w(96, 1, 1)} is “read”: ${root('qaraa')}, the plain verb. ${w(87, 6, 1)} “We will make you recite” makes someone do it.`,
			rng
		),
		tapTaught
	]
};
