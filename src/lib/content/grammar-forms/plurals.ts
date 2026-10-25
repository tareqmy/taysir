import { verse as verseOf, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, buildPhrase, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * Broken plural shapes in the Quran: instead of adding -ūna or -āt at the end, many everyday nouns
 * form their plural by reshaping the vowels around the root letters—a- in front with a long ā before
 * the last letter (أَعْمَال, أَمْوَال, أَبْصَار, أَيَّام, أَبْوَاب), a long ū before the last letter
 * (قُلُوب, صُدُور, وُجُوه), a long ā after an i-vowel (جِبَال, عِبَاد), or two u-vowels (سُبُل, صُحُف).
 * All Arabic comes from the corpus through `w(surah, ayah, word)`.
 */

const rng = rngFor('grammar-forms-plurals');

/** Tap al-ṣudūr (“the chests”) in 100:10. */
const tapSudur: TapExercise = {
	kind: 'tap',
	id: 'plur-8',
	question: 'Tap the broken plural that means “the chests”.',
	words: verseOf(100, 10).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't3',
	explanation: `${w(100, 10, 4)} is “the chests”, the broken plural of ${w(94, 1, 4)} (“your chest”), built with a long ū before the last root letter.`
};

export const pluralsLesson: Lesson = {
	id: 'grammar-forms-plurals',
	unitId: 'grammar-forms',
	title: 'Broken plural patterns',
	subtitle: 'When a plural reshapes the word from inside',
	kind: 'grammar',
	intro: [
		rule(
			'Plurals that reshape the root instead of adding a suffix',
			'Just as English says “foot → feet” and “man → men” instead of adding -s, Arabic makes most of its everyday noun plurals by reshaping the vowels inside the three root letters. These are called broken plurals, and four shapes appear again and again across Juz Amma.'
		),
		text(
			'Shape 1: a- in front and a long ā before the last root letter',
			`One of the commonest plural shapes puts a- in front of the root and a long ā before the last root letter: ${w(67, 2, 8)} (“in deed”) becomes ${w(99, 6, 6)} (“their deeds”), ${w(68, 14, 4)} (“wealth”) becomes ${w(71, 12, 2)} (“with wealth”), ${w(67, 4, 3)} (“the sight”) becomes ${w(67, 23, 8)} (“and the eyes”), ${w(1, 4, 2)} (“Day of”) becomes ${w(69, 7, 6)} (“days”), and ${w(78, 19, 4)} is “doors”.`
		),
		phrase(
			78,
			19,
			1,
			4,
			'and the sky was opened and became doors',
			'abwāban (“doors”) has the a-…ā plural shape.'
		),
		text(
			'Shape 2: u- on the first letter and a long ū before the last root letter',
			`A second major plural shape puts u- on the first root letter and a long ū before the third: ${w(79, 8, 1)} is “hearts”, ${w(94, 1, 4)} (“your chest”) becomes ${w(100, 10, 4)} (“the chests”), and ${w(67, 22, 5)} (“his face”) becomes ${w(75, 22, 1)} (“faces”).`
		),
		phrase(
			79,
			8,
			1,
			3,
			'hearts on that day will be trembling',
			'qulūbun (“hearts”) has the u-…ū plural shape.'
		),
		text(
			'Shapes 3 and 4: i-…ā (jibāl, ʿibād) and u-…u (subul, ṣuḥuf)',
			`Two more shapes round out the most frequent broken plurals: i- on the first letter with a long ā before the third gives ${w(77, 10, 2)} (“the mountains”) and turns ${w(96, 10, 1)} (“a servant”) into ${w(76, 6, 4)} (“the servants of”). And two short u-vowels turn ${w(76, 3, 3)} (“the way”) into ${w(71, 20, 3)} (“paths”) and give ${w(80, 13, 2)} (“scrolls”).`
		),
		phrase(
			80,
			13,
			1,
			3,
			'in honoured scrolls',
			'ṣuḥufin (“scrolls”) has the short u-…u plural shape.'
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'plur-1',
			`Which word is the broken plural of the root of ${w(67, 2, 8)} (“in deed”), meaning “their deeds”?`,
			undefined,
			ar(w(99, 6, 6)),
			[ar(w(79, 8, 1)), ar(w(80, 13, 2))],
			`${w(99, 6, 6)} is “their deeds”, built on the same root as ${w(67, 2, 8)}.`,
			rng
		),
		handChoice(
			'plur-2',
			'Which plural is built with a long ū before the last root letter, like “hearts” and “faces”?',
			undefined,
			ar(w(79, 8, 1)),
			[ar(w(78, 19, 4)), ar(w(69, 7, 6))],
			`${w(79, 8, 1)} is “hearts”, with a long ū before the last root letter. ${w(78, 19, 4)} (“doors”) and ${w(69, 7, 6)} (“days”) have the a-…ā shape.`,
			rng
		),
		handChoice(
			'plur-3',
			`Which word is the singular partner sharing the root of ${w(75, 22, 1)} (“faces”)?`,
			undefined,
			ar(w(67, 22, 5)),
			[ar(w(94, 1, 4)), ar(w(96, 10, 1))],
			`${w(67, 22, 5)} is “his face”, sharing the root of ${w(75, 22, 1)} (“faces”).`,
			rng
		),
		buildPhrase(
			'plur-4',
			'and the sky was opened and became doors',
			[w(78, 19, 1), w(78, 19, 2), w(78, 19, 3), w(78, 19, 4)],
			[w(79, 8, 1)],
			`${w(78, 19, 1)} ${w(78, 19, 2)} ${w(78, 19, 3)} ${w(78, 19, 4)}: ending with the broken plural abwāban (“doors”).`,
			rng
		),
		handChoice(
			'plur-5',
			`Which word is the broken plural sharing the root of ${w(96, 10, 1)} (“a servant”)?`,
			undefined,
			ar(w(76, 6, 4)),
			[ar(w(71, 20, 3)), ar(w(100, 10, 4))],
			`${w(76, 6, 4)} is “the servants of”, from the same root as ${w(96, 10, 1)} (“a servant”).`,
			rng
		),
		handChoice(
			'plur-6',
			`Which word is the broken plural sharing the root of ${w(76, 3, 3)} (“the way”), meaning “paths”?`,
			undefined,
			ar(w(71, 20, 3)),
			[ar(w(77, 10, 2)), ar(w(75, 22, 1))],
			`${w(71, 20, 3)} is “paths”, the u-…u broken plural of ${w(76, 3, 3)} (“the way”).`,
			rng
		),
		handMatch(
			'plur-7',
			'Match each broken plural with its meaning.',
			[
				{ arabic: w(69, 7, 6), english: 'days' },
				{ arabic: w(79, 8, 1), english: 'hearts' },
				{ arabic: w(77, 10, 2), english: 'the mountains' },
				{ arabic: w(80, 13, 2), english: 'scrolls' }
			],
			'Four broken plural shapes: ayyām “days”, qulūb “hearts”, al-jibāl “the mountains”, and ṣuḥuf “scrolls”.',
			rng
		),
		tapSudur
	]
};
