import { verse as verseOf, wordText as w } from '../../data';
import { rngFor } from '../../random';
import { ar, buildPhrase, en, handChoice } from '../exercises';
import { phrase, rule, text, verse } from '../grammar-blocks';
import type { Lesson, TapExercise } from '../types';

/**
 * A run of “when” clauses and the answer that comes after it. `grammar-when-o` teaches idhā “when”
 * once, with fa- “then” for the answer; Al-Infitar (82) and At-Takwir (81) pile the clauses up, each
 * joined to the last with wa-, and only then say what the point was. Every example is from those
 * two surahs, all Arabic through `w(surah, ayah, word)`, and `idha.spec.ts` checks the clauses, their
 * verbs and the answer against the corpus's tags. The explanations are drafts: keep them
 * conservative and have a teacher review them.
 */

const rng = rngFor('grammar-idha');

/** Tap “a soul” in the answer to At-Takwir's run of “when” clauses. */
const tapASoul: TapExercise = {
	kind: 'tap',
	id: 'idha-8',
	question: 'Tap the word that means “a soul”.',
	words: verseOf(81, 14).words.map((word, i) => ({ id: `t${i}`, text: word.text })),
	answerId: 't1',
	explanation: `${w(81, 14, 2)} is “a soul”. The verse is the answer to twelve “when” clauses: “a soul will know what it brought forward”.`
};

export const idhaLesson: Lesson = {
	id: 'grammar-idha',
	unitId: 'grammar-later',
	title: '“When”, again and again',
	subtitle: 'A run of “when” clauses and its answer',
	kind: 'grammar',
	intro: [
		rule(
			'A run of “when” clauses',
			`Some surahs begin with “when” over and over. ${w(82, 1, 1)} ${w(82, 1, 2)} ${w(82, 1, 3)} is “when the sky is split open”. Each next clause is joined to the one before it with wa-, so it begins ${w(82, 2, 1)}, “and when”. The sentence is not finished until the clauses stop and the answer comes.`
		),
		verse(82, 1, '“When” starts here.'),
		phrase(
			82,
			2,
			1,
			3,
			'and when the planets are scattered',
			'wa-idhā “and when”: the next clause.'
		),
		phrase(
			82,
			3,
			1,
			3,
			'and when the seas are made to burst forth',
			'Again wa-idhā, and again the noun, then the verb.'
		),
		phrase(
			82,
			4,
			1,
			3,
			'and when the graves are overturned',
			'The fourth and last “when” clause of the run.'
		),
		text(
			'In each clause, the noun and then the verb',
			`After “when”, the noun comes first and the verb follows it: ${w(82, 1, 2)} ${w(82, 1, 3)}, “the sky is split open”. Every verb here ends in -at, the “she” ending, because the nouns are feminine words or plurals of things: sky, planets, seas, graves.`
		),
		verse(82, 5, 'The answer to the run. Nothing begins with “when” here.'),
		text(
			'The answer comes last',
			`Only after the run does the main statement come: ${w(82, 5, 1)} ${w(82, 5, 2)} is “a soul will know”. The verb has a past form, but its meaning is still to come, as it was with the verbs after “when” in the earlier lesson. Then it says what the soul will know: what it sent ahead and what it left behind.`
		),
		phrase(
			81,
			14,
			1,
			4,
			'a soul will know what it brought forward',
			'The same answer, in the surah before. At-Takwir (81) has twelve “when” clauses before it.'
		),
		rule(
			'Reading a run',
			'When a sentence opens with “when”, hold the clauses in mind and wait. Each wa-idhā adds one more. The point is in the answer at the end of the run, and it begins with a verb, not with “when”.'
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'idha-1',
			'What does this word mean?',
			ar(w(82, 2, 1)),
			en('and when'),
			[en('and not'), en('then'), en('and indeed')],
			'wa- “and” joined to idhā “when”: it begins the next clause in the run.',
			rng
		),
		handChoice(
			'idha-2',
			`In ${w(82, 1, 2)} ${w(82, 1, 3)} (“the sky is split open”), which word is the verb?`,
			undefined,
			ar(w(82, 1, 3)),
			[ar(w(82, 1, 2)), ar(w(82, 1, 1))],
			`${w(82, 1, 3)} is the verb, and it comes after the noun ${w(82, 1, 2)}. ${w(82, 1, 1)} is “when”.`,
			rng
		),
		buildPhrase(
			'idha-3',
			'when the sky is split open',
			[w(82, 1, 1), w(82, 1, 2), w(82, 1, 3)],
			[w(82, 2, 1)],
			`${w(82, 1, 1)} ${w(82, 1, 2)} ${w(82, 1, 3)}: “when”, the noun, then the verb.`,
			rng
		),
		handChoice(
			'idha-4',
			'How many “when” clauses come before the answer in Al-Infitar (surah 82)?',
			undefined,
			en('four'),
			[en('one'), en('two'), en('five')],
			'Verses 1 to 4 each have one, and verse 5 is the answer.',
			rng
		),
		handChoice(
			'idha-5',
			'Which word begins the answer, after the run of “when” clauses in Al-Infitar?',
			undefined,
			ar(w(82, 5, 1)),
			[ar(w(82, 4, 3)), ar(w(82, 1, 3))],
			`${w(82, 5, 1)} is “will know”. The other two are verbs inside the “when” clauses: “are overturned” and “is split open”.`,
			rng
		),
		handChoice(
			'idha-6',
			`What does ${w(82, 5, 1)} mean here, in the answer?`,
			undefined,
			en('will know'),
			[en('knew'), en('did not know')],
			'It has the past form, but after a run of “when” about what is still to come its meaning is future: “will know”.',
			rng
		),
		handChoice(
			'idha-7',
			'Why do all the verbs in these “when” clauses end in -at?',
			undefined,
			en('The sky, planets, seas and graves are feminine words or plurals of things'),
			[en('They are all commands'), en('They are all in the future')],
			'-at is the “she” ending. A plural of things takes it too, as you saw in the last lesson.',
			rng
		),
		tapASoul
	]
};
