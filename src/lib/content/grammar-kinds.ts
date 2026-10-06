import { verse, wordText as w } from '../data';
import { rngFor } from '../random';
import { ar, en, handChoice } from './exercises';
import type { Block, Lesson, TapExercise } from './types';

/**
 * The first grammar lesson: the three kinds of word, noun, verb and small word. Later lessons use
 * these names, and the Words page names each word's kind, so the idea is taught before either.
 *
 * Every example is a word from Al-Fatiha, the only surah the learner has met at this point, and all
 * Arabic comes from the corpus through `w(surah, ayah, word)`. Pronouns, “who” and “this” are
 * nouns in Arabic grammar (the corpus tags them as nouns too), but they are only named in one
 * line and never asked about. The explanations are drafts: keep them conservative and have a
 * teacher review them.
 */

const rule = (title: string, body: string): Block => ({ type: 'rule', title, body });
const text = (title: string, body: string): Block => ({ type: 'text', title, body });

const rng = rngFor('grammar-kinds');

const noun = en('A noun');
const verb = en('A verb');
const smallWord = en('A small word');

/** Tap the one verb in verse 6 of Al-Fatiha. */
const tapTheVerb: TapExercise = {
	kind: 'tap',
	id: 'kinds-8',
	question: 'Tap the verb.',
	words: verse(1, 6).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't0',
	explanation: `${w(1, 6, 1)} is “guide us”: it says what is done. The other two words are nouns, “the path” and “the straight”.`
};

export const kindsLesson: Lesson = {
	id: 'grammar-kinds',
	unitId: 'grammar',
	title: 'Three kinds of word',
	subtitle: 'Nouns, verbs and small words',
	kind: 'grammar',
	intro: [
		rule(
			'Every word is one of three kinds',
			'Arabic grammar sorts every word into one of three kinds. A noun (ism) names something: a person, a thing, an idea, or a quality such as “Merciful”. A verb (fiʿl) says what is done, and when. A small word (ḥarf, also called a particle) is a short word that does its work next to other words, such as “and”, “for” and “not”.'
		),
		{
			type: 'phrase',
			surah: 1,
			ayah: 6,
			from: 2,
			to: 3,
			translation: 'the straight path',
			note: 'Both words are nouns. “Path” names a thing, and “straight” describes it: in Arabic grammar a word that describes a noun is a noun too. Both have ال in front, which is a sign of a noun.'
		},
		{
			type: 'phrase',
			surah: 1,
			ayah: 5,
			from: 2,
			to: 2,
			translation: 'we worship',
			note: 'A verb: it says what is done. The word already says who does it, so “we” is inside it. You have also met the verbs in “guide us” and “You have favoured”.'
		},
		{
			type: 'phrase',
			surah: 1,
			ayah: 2,
			from: 2,
			to: 2,
			translation: 'is for Allah',
			split: true,
			note: 'li- “for” is a small word. It does not name a thing or an action: it joins onto the noun after it.'
		},
		text(
			'More small words',
			`Several small words are written joined to the front of the next word. You have met bi- “in, with” in ${w(1, 1, 1)} (“in the name of”) and wa- “and” in ${w(1, 5, 3)} (“and You alone”). ${w(1, 7, 8)} is wa- “and” plus lā “not”: two small words in one. The ال you saw on the nouns is a small word too.`
		),
		text(
			'A few special words',
			'A few special words, such as “you”, “who” and “this”, are counted as nouns in Arabic grammar. You will meet them later. For now, sort the clear cases.'
		),
		rule(
			'How to tell them apart',
			`Ask what the word does. If it names something or describes it, it is a noun. If it says what is done, it is a verb. If it only joins, adds to or turns another word, such as “and”, “for” or “not”, it is a small word. A word with ال in front is a noun. A word like ${w(1, 5, 2)}, one action with the doer built in, is a verb.`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'kinds-1',
			'What kind of word is this?',
			ar(w(1, 6, 2)),
			noun,
			[verb, smallWord],
			`${w(1, 6, 2)} is “the path”: it names a thing, and it has ال in front.`,
			rng
		),
		handChoice(
			'kinds-2',
			'What kind of word is this?',
			ar(w(1, 5, 2)),
			verb,
			[noun, smallWord],
			`${w(1, 5, 2)} is “we worship”: it says what is done, and “we” is inside the word.`,
			rng
		),
		handChoice(
			'kinds-3',
			`In ${w(1, 2, 2)} (“is for Allah”), li- means “for”. What kind of word is li-?`,
			undefined,
			smallWord,
			[noun, verb],
			'li- “for” does not name a thing or an action. It joins onto the noun after it, so it is a small word.',
			rng
		),
		handChoice(
			'kinds-4',
			`${w(1, 6, 3)} means “the straight”. It describes the path. What kind of word is it?`,
			undefined,
			noun,
			[verb, smallWord],
			'In Arabic grammar a word that describes a noun is a noun too. This one also has ال in front.',
			rng
		),
		handChoice(
			'kinds-5',
			'Which of these is a verb?',
			undefined,
			ar(w(1, 7, 3)),
			[ar(w(1, 2, 3)), ar(w(1, 4, 2))],
			`${w(1, 7, 3)} is “You have favoured”, an action. ${w(1, 2, 3)} is “Lord of” and ${w(1, 4, 2)} is “Day of”, which are nouns.`,
			rng
		),
		handChoice(
			'kinds-6',
			'Which of these must be a noun, because it has ال in front?',
			undefined,
			ar(w(1, 4, 3)),
			[ar(w(1, 5, 2)), ar(w(1, 6, 1))],
			`${w(1, 4, 3)} is “the Judgement”, and ال goes in front of nouns. ${w(1, 5, 2)} and ${w(1, 6, 1)} are verbs, which do not take it.`,
			rng
		),
		handChoice(
			'kinds-7',
			'Which of these is a small word?',
			undefined,
			en('wa- “and”'),
			[en('naʿbudu “we worship”'), en('rabb “Lord”')],
			'wa- “and” only joins one thing to another. “We worship” is a verb, and “Lord” is a noun.',
			rng
		),
		tapTheVerb
	]
};
