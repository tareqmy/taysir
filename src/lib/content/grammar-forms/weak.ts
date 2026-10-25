import { verse as verseOf, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, buildPhrase, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * Doubled and weak Form I verbs: roots whose 2nd and 3rd letters are the same (ضَلَّ, ظَنُّوا /
 * ظَنَنتُمْ, رَدَدْنَاهُ), roots starting with wāw that drop the wāw in the present (وَجَدَ / يَجِدُوا),
 * hollow roots with a weak middle letter (قَالُوا / قُلْ, خَافَ / يَخَافُ, كَانَ), and roots with a
 * weak last letter (يَهْدِى / ٱهْدِنَا, تَجْرِى, يَخْشَىٰ, دَعَوْتُ). All Arabic comes from the corpus
 * through `w(surah, ayah, word)`.
 */

const rng = rngFor('grammar-forms-weak');

/** Tap yajidū (“they find”) in 71:25. */
const tapYajidu: TapExercise = {
	kind: 'tap',
	id: 'weak-8',
	question: 'Tap the verb that means “they find”, where the starting wāw of the root has dropped.',
	words: verseOf(71, 25).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't6',
	explanation: `${w(71, 25, 7)} is “they find”: in the present tense, the starting wāw of the root drops out.`
};

export const weakLesson: Lesson = {
	id: 'grammar-forms-weak',
	unitId: 'grammar-forms',
	title: 'Doubled and weak roots',
	subtitle: 'When a root letter merges, changes, or drops',
	kind: 'grammar',
	intro: [
		rule(
			'Not every three-letter root stays three clear consonants',
			'Most roots keep three steady consonants in every tense. Four common kinds of Form I verbs look shorter or shift a vowel because two of their root letters are identical, or because one of the three root letters is a weak glide (wāw or yāʾ).'
		),
		text(
			'Doubled roots: the 2nd and 3rd letters are the same',
			`When the second and third letters of a root are identical, they merge under a shadda whenever a vowel follows, as in ${w(68, 7, 6)} (“has gone astray”) and ${w(70, 20, 2)} (“touches him”). Before consonant endings like -nā (“we”) or -tum (“you”), the two identical letters unmerge and stand side by side: ${w(95, 5, 2)} is “We returned him”, and verse 72:7 shows both shapes side by side in ${w(72, 7, 2)} ${w(72, 7, 3)} ${w(72, 7, 4)} (“thought just as you thought”).`
		),
		phrase(
			72,
			7,
			1,
			4,
			'and that they thought just as you thought',
			'ẓannū merges the two nūn letters under a shadda; ẓanantum separates them before -tum.'
		),
		text(
			'Starting with wāw, or hollow in the middle',
			`When a root begins with wāw, the wāw is plain in the past—${w(72, 8, 4)} is “and we found it”—but often drops out in the present: ${w(71, 25, 7)} is “they find”. When the middle root letter is weak (“hollow”), it stretches into a long alif in the past, as in ${w(79, 40, 3)} (“he feared”), ${w(67, 18, 7)} (“was”), and ${w(67, 9, 1)} (“they said”), and shortens when the end of the verb is closed, as in ${w(67, 9, 7)} (“and we said”) and the command ${w(67, 23, 1)} (“Say”).`
		),
		phrase(
			79,
			40,
			1,
			5,
			'and as for whoever feared the standing before his Lord',
			'khāfa (“he feared”) is a hollow verb; its present tense is yakhāfu (“he fears”).'
		),
		text(
			'Weak at the end',
			`When the third root letter is weak, the verb ends in a long vowel—ī, ā, or ū—or changes before an ending: ${w(72, 2, 1)} is “it guides”, ${w(85, 11, 8)} is “flow”, ${w(80, 9, 2)} is “he fears”, and ${w(71, 5, 4)} is “I called”. In the command, the weak ending shortens, as in ${w(1, 6, 1)} (“guide us”).`
		),
		phrase(
			1,
			6,
			1,
			3,
			'guide us to the straight path',
			'ihdinā: the command of the weak-ending verb hadā / yahdī.'
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'weak-1',
			`Why does ${w(72, 7, 2)} (“thought”) have a shadda on its nūn while ${w(72, 7, 4)} (“you thought”) writes two nūns?`,
			ar(`${w(72, 7, 2)} ${w(72, 7, 3)} ${w(72, 7, 4)}`),
			en(
				'The root’s 2nd and 3rd letters are both nūn, which merge before a vowel and separate before -tum'
			),
			[
				en('Because one is Form II and the other is Form I'),
				en('Because one is passive and the other is active')
			],
			'Doubled roots merge their two identical letters before a vowel and split them apart before consonant pronouns like -tum and -nā.',
			rng
		),
		handChoice(
			'weak-2',
			`Which verb comes from the same wāw-initial root as ${w(72, 8, 4)} (“and we found it”), dropping its wāw in the present?`,
			undefined,
			ar(w(71, 25, 7)),
			[ar(w(68, 7, 6)), ar(w(80, 9, 2))],
			`${w(71, 25, 7)} is “they find”, from the root of ${w(72, 8, 4)}. ${w(68, 7, 6)} is “has gone astray” and ${w(80, 9, 2)} is “he fears”.`,
			rng
		),
		handChoice(
			'weak-3',
			`What happens to the middle weak letter of ${w(67, 9, 1)} (“they said”) in the command ${w(67, 23, 1)} (“Say”)?`,
			undefined,
			en('It drops out when the last root letter has no vowel'),
			[en('It doubles with a shadda'), en('It moves to the front of the word')],
			'In a hollow verb, the long middle vowel drops when the final consonant is vowelless, giving qul (“Say”).',
			rng
		),
		buildPhrase(
			'weak-4',
			'and as for whoever feared the standing before his Lord',
			[w(79, 40, 1), w(79, 40, 2), w(79, 40, 3), w(79, 40, 4), w(79, 40, 5)],
			[w(72, 13, 11)],
			`${w(79, 40, 1)} ${w(79, 40, 2)} ${w(79, 40, 3)} ${w(79, 40, 4)} ${w(79, 40, 5)}: past-tense khāfa (“he feared”), not present-tense yakhāfu.`,
			rng
		),
		handChoice(
			'weak-5',
			`Which verb is the present-tense partner of ${w(79, 40, 3)} (“he feared”)?`,
			undefined,
			ar(w(72, 13, 11)),
			[ar(w(72, 2, 1)), ar(w(85, 11, 8))],
			`${w(72, 13, 11)} is “he fears”. ${w(72, 2, 1)} is “it guides” and ${w(85, 11, 8)} is “flow”.`,
			rng
		),
		handChoice(
			'weak-6',
			`Which verb has a weak third root letter and is the present-tense partner of ${w(1, 6, 1)} (“guide us”)?`,
			undefined,
			ar(w(72, 2, 1)),
			[ar(w(95, 5, 2)), ar(w(67, 18, 7))],
			`${w(72, 2, 1)} is “it guides”, from the same weak-ending root as ${w(1, 6, 1)} (“guide us”).`,
			rng
		),
		handMatch(
			'weak-7',
			'Match each doubled or weak verb with its meaning.',
			[
				{ arabic: w(68, 7, 6), english: 'has gone astray' },
				{ arabic: w(95, 5, 2), english: 'We returned him' },
				{ arabic: w(85, 11, 8), english: 'flow' },
				{ arabic: w(71, 5, 4), english: 'I called' }
			],
			'Two doubled-root verbs (ḍalla, radadnāhu) and two weak-ending verbs (tajrī, daʿawtu).',
			rng
		),
		tapYajidu
	]
};
