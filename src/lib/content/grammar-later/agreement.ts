import { wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, buildPhrase, en, handChoice, handMatch } from '../exercises';
import { phrase, rule, text } from '../grammar-blocks';
import type { Lesson } from '../types';

/**
 * A describing word matches its noun in four things: whether it has ال, masculine or feminine, one
 * or many, and the ending that shows its job. Until now this was only a note on two examples in
 * `grammar-plurals`. Every example comes from Juz Amma or Al-Fatiha, all Arabic through
 * `w(surah, ayah, word)`, and `grammar-later.spec.ts` checks each pair against the corpus's tags.
 * The explanations are drafts: keep them conservative and have a teacher review them.
 */

const rng = rngFor('grammar-agreement');

export const agreementLesson: Lesson = {
	id: 'grammar-agreement',
	unitId: 'grammar-later',
	title: 'Describing words match their noun',
	subtitle: 'Four things that agree',
	kind: 'grammar',
	intro: [
		rule(
			'It comes after its noun, and matches it',
			'In Arabic a word that describes a noun comes after it: “a lamp blazing”, not “a blazing lamp”. It also matches the noun in four things: whether it has ال, whether it is masculine or feminine, whether it is one or many, and the ending that shows its job. The next steps take them one at a time.'
		),
		phrase(
			1,
			6,
			2,
			3,
			'the straight path',
			'Both words have ال, both are masculine and singular, and both end in -a. This is a noun and its describing word agreeing in everything.'
		),
		phrase(
			78,
			13,
			2,
			3,
			'a blazing lamp',
			'Neither word has ال, and both end in -an. If the noun has ال, its describing word has it too. If the noun has none, neither does the describing word.'
		),
		text(
			'Masculine and feminine',
			`A feminine noun has a feminine describing word, which usually carries the feminine ending. ${w(88, 12, 2)} ${w(88, 12, 3)} is “a flowing spring”: “spring” is feminine, so “flowing” ends in -atun. Compare ${w(83, 9, 1)} ${w(83, 9, 2)}, “an inscribed record”: “record” is masculine, and its describing word has no -at.`
		),
		text(
			'One or many',
			`The describing word matches in number too. ${w(80, 42, 3)} ${w(80, 42, 4)} is “the disbelievers, the wicked”: both are plural. A plural of things, not people, is a special case. It is usually described by a feminine singular word, as in ${w(88, 13, 2)} ${w(88, 13, 3)} (“raised couches”): “couches” is plural, but “raised” is feminine singular.`
		),
		text(
			'The same ending',
			`The describing word is in the same case as its noun, so the two end alike. ${w(83, 9, 1)} ${w(83, 9, 2)} end in -un and -un (nominative), ${w(78, 13, 2)} ${w(78, 13, 3)} in -an and -an (accusative), and ${w(105, 5, 2)} ${w(105, 5, 3)} (“like husks eaten up”) in -in and -in (genitive).`
		),
		rule(
			'Four things to check',
			'Does the noun have ال? Then so does its describing word. Is the noun masculine or feminine? The describing word is the same. Is it one or many? The describing word is the same, except that a plural of things takes a feminine singular. Does the noun end in -u, -a or -i? The describing word ends the same way.'
		)
	],
	cardIds: [],
	exercises: [
		buildPhrase(
			'agree-1',
			'a blazing lamp',
			[w(78, 13, 2), w(78, 13, 3)],
			[w(78, 13, 1)],
			`${w(78, 13, 2)} ${w(78, 13, 3)}: the noun, then the word that describes it.`,
			rng
		),
		handChoice(
			'agree-2',
			`Why does ${w(1, 6, 3)} (“the straight”) have ال?`,
			undefined,
			en('Because the noun it describes, “the path”, has ال too'),
			[en('Because it is a verb'), en('Because it is plural')],
			`${w(1, 6, 2)} ${w(1, 6, 3)}: the noun has ال, so its describing word has it as well.`,
			rng
		),
		handChoice(
			'agree-3',
			`Which word describes ${w(88, 12, 2)} (“a spring”, a feminine noun)?`,
			undefined,
			ar(w(88, 12, 3)),
			[ar(w(83, 9, 2)), ar(w(78, 13, 3))],
			`${w(88, 12, 3)} has the feminine ending -atun. ${w(83, 9, 2)} is masculine, and ${w(78, 13, 3)} ends in -an, not -un.`,
			rng
		),
		handChoice(
			'agree-4',
			`${w(83, 9, 1)} and ${w(83, 9, 2)} both end in -un. What does that show?`,
			undefined,
			en('They are in the same case'),
			[en('They are both verbs'), en('They are both plural')],
			'A describing word is in the same case as its noun, so the two endings match.',
			rng
		),
		handChoice(
			'agree-5',
			`${w(80, 42, 4)} (“the wicked”) describes ${w(80, 42, 3)} (“the disbelievers”). What do the two match in?`,
			undefined,
			en('Both are plural, and both have ال'),
			[en('Both are singular'), en('Neither has ال')],
			`${w(80, 42, 3)} ${w(80, 42, 4)}: two plurals, each with ال.`,
			rng
		),
		handChoice(
			'agree-6',
			`${w(88, 13, 2)} (“couches”) is plural, but its describing word ${w(88, 13, 3)} is feminine singular. When does Arabic usually do this?`,
			undefined,
			en('When the plural noun names things, not people'),
			[en('When the noun is masculine'), en('Always, for any plural')],
			'A plural of things is usually described by a feminine singular word. A plural of people matches in number, as in “the disbelievers, the wicked”.',
			rng
		),
		handMatch(
			'agree-7',
			'Match each noun and its describing word with its meaning.',
			[
				{ arabic: `${w(1, 6, 2)} ${w(1, 6, 3)}`, english: 'the straight path' },
				{ arabic: `${w(78, 13, 2)} ${w(78, 13, 3)}`, english: 'a blazing lamp' },
				{ arabic: `${w(88, 12, 2)} ${w(88, 12, 3)}`, english: 'a flowing spring' },
				{ arabic: `${w(83, 9, 1)} ${w(83, 9, 2)}`, english: 'an inscribed record' }
			],
			'Each is a noun followed by the word that describes it.',
			rng
		),
		handChoice(
			'agree-8',
			'In which phrase do both words have ال?',
			undefined,
			ar(`${w(89, 27, 2)} ${w(89, 27, 3)}`),
			[ar(`${w(78, 13, 2)} ${w(78, 13, 3)}`), ar(`${w(88, 12, 2)} ${w(88, 12, 3)}`)],
			`${w(89, 27, 2)} ${w(89, 27, 3)} is “the tranquil soul”: ال on both. The other two have it on neither.`,
			rng
		)
	]
};
