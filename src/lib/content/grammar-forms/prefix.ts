import { verse as verseOf, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * Forms VII, VIII and X: in- (it just happens), a t after the first letter (for oneself) and ista-
 * (asking for, or considering). The pairs are words the learner has met as vocabulary cards, and
 * `prefix.spec.ts` checks each against the corpus's verb-form tags and roots. The explanations are
 * drafts: keep them conservative and have a teacher review them.
 */

const rng = rngFor('grammar-forms-prefix');

/** Tap the Form VIII verb in “those who, when they take measure from the people, take in full”. */
const tapMeasure: TapExercise = {
	kind: 'tap',
	id: 'prefix-8',
	question: 'Tap the verb that means “they take measure”.',
	words: verseOf(83, 2).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't2',
	explanation: `${w(83, 2, 3)} is “they take measure”: Form VIII, with a t after the first root letter. The last word, ${w(83, 2, 6)}, is a Form X verb.`
};

export const prefixLesson: Lesson = {
	id: 'grammar-forms-in',
	unitId: 'grammar-forms',
	title: 'in-, a t inside, and ist-',
	subtitle: 'Forms VII, VIII and X',
	kind: 'grammar',
	intro: [
		rule(
			'in- in front: it just happens (Form VII)',
			`Form VII has in- at the front. It usually means the action simply happens to the thing, with no doer mentioned. ${w(80, 26, 2)} is “We split”, and ${w(84, 1, 3)} is “splits open”: the same root, with and without a doer. Others in Juz Amma are ${w(82, 1, 3)} (“is split open”) and ${w(83, 31, 2)} (“they returned”).`
		),
		phrase(
			84,
			1,
			1,
			3,
			'when the sky splits open',
			'ʾin-shaqqat: Form VII, the sky is simply split.'
		),
		text(
			'A t after the first letter: Form VIII',
			`Form VIII puts a t after the first letter of the root, as in ${w(83, 2, 3)} (“they take measure”). It often means doing the action for or to oneself. ${w(83, 3, 2)} is “they measure for them”, the plain verb of the same root. ${w(96, 15, 4)} is “desist”, and ${w(79, 40, 6)} is “and restrained”: restrain, and restrain oneself.`
		),
		phrase(
			83,
			2,
			1,
			6,
			'those who, when they take measure from the people, take in full',
			'The Form VIII verb “take measure” is for themselves; the next verb, “take in full”, is Form X.'
		),
		text(
			'ista- in front: asking for something, or considering it so (Form X)',
			`Form X has ista- or ist- at the front. It often means asking for something, or considering something to be so. ${w(1, 5, 4)} is “we ask for help”, ${w(110, 3, 4)} is “and ask His forgiveness”, and ${w(80, 5, 3)} is “considers himself free of need”. ${w(78, 38, 2)} is “stands”, and ${w(81, 28, 5)} is “he goes straight”: seeks to stand upright.`
		),
		rule(
			'A clue, not a law',
			'As before, these meanings are tendencies. Many verbs in these forms have a meaning of their own, so learn each as a word. The shape tells you what kind of verb to expect, and which plain verb to look for in the same root.'
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'prefix-1',
			'Which verb has in- at the front, which makes it Form VII?',
			undefined,
			ar(w(84, 1, 3)),
			[ar(w(80, 26, 2)), ar(w(83, 2, 3))],
			`${w(84, 1, 3)} is “splits open”: Form VII. ${w(80, 26, 2)} “We split” is the plain verb, and ${w(83, 2, 3)} “they take measure” is Form VIII.`,
			rng
		),
		handChoice(
			'prefix-2',
			`${w(84, 1, 3)} (“splits open”) and ${w(80, 26, 2)} (“We split”) share a root. What does the in- do?`,
			undefined,
			en('The action just happens to the thing, with no doer'),
			[en('Someone else is made to do it'), en('It becomes a command')],
			'Form VII often means the action happens to the thing by itself: split becomes be split.',
			rng
		),
		handChoice(
			'prefix-3',
			'Which verb has a t after the first root letter, which makes it Form VIII?',
			undefined,
			ar(w(83, 2, 3)),
			[ar(w(83, 3, 2)), ar(w(84, 1, 3))],
			`${w(83, 2, 3)} is “they take measure”: Form VIII. ${w(83, 3, 2)} “they measure for them” is the plain verb, and ${w(84, 1, 3)} “splits open” is Form VII.`,
			rng
		),
		handChoice(
			'prefix-4',
			`${w(83, 2, 3)} (“they take measure”) and ${w(83, 3, 2)} (“they measure for them”) share a root. What does Form VIII often add?`,
			undefined,
			en('Doing it for oneself'),
			[en('Making someone else do it'), en('Doing it to each other')],
			'Form VIII often means doing the action for or to oneself: measure for them becomes take measure for oneself.',
			rng
		),
		handChoice(
			'prefix-5',
			'Which verb has ista- at the front, which makes it Form X?',
			undefined,
			ar(w(1, 5, 4)),
			[ar(w(1, 5, 2)), ar(w(84, 1, 3))],
			`${w(1, 5, 4)} is “we ask for help”: Form X. ${w(1, 5, 2)} “we worship” is the plain verb, and ${w(84, 1, 3)} is Form VII.`,
			rng
		),
		handMatch(
			'prefix-6',
			'Match each Form X verb with its meaning.',
			[
				{ arabic: w(80, 5, 3), english: 'considers himself free of need' },
				{ arabic: w(1, 5, 4), english: 'we ask for help' },
				{ arabic: w(110, 3, 4), english: 'and ask His forgiveness' },
				{ arabic: w(81, 28, 5), english: 'he goes straight' }
			],
			'Four Form X verbs: considering oneself so, and asking for.',
			rng
		),
		handChoice(
			'prefix-7',
			`${w(81, 28, 5)} (“he goes straight”) is built on the same root as which word?`,
			undefined,
			ar(w(78, 38, 2)),
			[ar(w(87, 13, 3)), ar(w(96, 15, 4))],
			`${w(78, 38, 2)} is “stands”, the plain verb of the same root. ${w(87, 13, 3)} “he dies” and ${w(96, 15, 4)} “desist” are from other roots.`,
			rng
		),
		tapMeasure
	]
};
