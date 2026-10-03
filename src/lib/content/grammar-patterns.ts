import { formatRoot, lexemeById, wordText as w } from '../data';
import { rngFor } from '../random';
import { ar, buildPhrase, en, handChoice, handMatch } from './exercises';
import type { Block, Lesson, Unit } from './types';

/**
 * Unit: grammar from the short surahs. Four ideas that unlock most of what a learner reads:
 * joined endings and prefixes, verbs, number and describing words, and sentence building.
 *
 * Every example is a word from Al-Fatiha or surahs 105–114, which the learner has already
 * studied, and all Arabic comes from the corpus through `w(surah, ayah, word)`. The explanations
 * are drafts: keep them conservative and have a teacher review them.
 */

const phrase = (
	ayah: number,
	from: number,
	to: number,
	translation: string,
	note?: string,
	surah = 105,
	highlight?: 'affixes'
): Block => ({ type: 'phrase', surah, ayah, from, to, translation, note, highlight });

const rule = (title: string, body: string): Block => ({ type: 'rule', title, body });
const text = (title: string, body: string): Block => ({ type: 'text', title, body });

const root = (lexemeId: string) => formatRoot(lexemeById(lexemeId).root!);

// --- Lesson 1: joined endings and prefixes --------------------------------------------------

const endingsRng = rngFor('grammar-endings');

const endings: Lesson = {
	id: 'grammar-endings',
	unitId: 'grammar-patterns',
	title: 'Endings and one-letter prefixes',
	subtitle: 'Small pieces that join onto words',
	kind: 'grammar',
	intro: [
		rule(
			'Pronouns that join onto the word',
			'To say “his”, “your” or “them”, Arabic usually joins a short pronoun onto the end of the word. The same endings work on nouns (“his wealth”), on verbs (“pelting them”) and after small words such as “upon” (“upon them”). In the examples the joined ending is coloured.'
		),
		phrase(
			1,
			5,
			5,
			'your Lord',
			'The ending -ka means “your” when speaking to one person.',
			105,
			'affixes'
		),
		phrase(
			5,
			2,
			2,
			'her neck',
			'The ending -hā means “her” (or “its”, for a feminine word).',
			111,
			'affixes'
		),
		phrase(
			2,
			3,
			3,
			'their plot',
			'The ending -hum means “their” on a noun and “them” on a verb.',
			105,
			'affixes'
		),
		text(
			'More endings',
			`Four more to know. -hu is “his” or “him”, as in ${w(111, 2, 4)} (“his wealth”). -kum is “your” for more than one person, as in ${w(109, 6, 2)} (“your religion”). -nā is “we”, “us” or “our”. A word can carry two endings: ${w(108, 1, 2)} is the verb “gave” plus -nā (“We”) plus -ka (“you”): “We gave you”.`
		),
		text(
			'The same ending after a verb or a small word',
			`The ending keeps its meaning wherever it sits. On a verb it is the thing the action reaches: ${w(105, 4, 1)} is “pelting them”. After a small word it follows it: ${w(105, 3, 2)} is “upon them”.`
		),
		rule(
			'One-letter prefixes',
			'Five tiny words are written joined to the front of the next word: wa- “and”, fa- “so, then”, bi- “with, by, in”, li- “for, to” and ka- “like”. They are coloured in the examples. For instance wa- starts the verb in ' +
				`${w(105, 3, 1)} (“and He sent”), fa- starts ${w(105, 5, 1)} (“so He made them”) and li- starts ${w(109, 6, 1)} (“for you”).`
		),
		phrase(4, 2, 2, 'with stones', 'bi- means “with”, “by” or “in”.', 105, 'affixes'),
		phrase(5, 2, 2, 'like husks', 'ka- means “like”.', 105, 'affixes')
	],
	cardIds: [],
	exercises: [
		handChoice(
			'ends-1',
			`What does the ending of ${w(105, 1, 5)} mean?`,
			undefined,
			en('your (to one person)'),
			[en('his'), en('their'), en('we')],
			`${w(105, 1, 5)} is “your Lord”: the ending -ka means “your”.`,
			endingsRng
		),
		handChoice(
			'ends-2',
			`What does the ending of ${w(111, 5, 2)} mean?`,
			undefined,
			en('her'),
			[en('your (to one person)'), en('their'), en('his')],
			`${w(111, 5, 2)} is “her neck”: the ending -hā means “her”.`,
			endingsRng
		),
		handChoice(
			'ends-3',
			`What does the ending of ${w(105, 2, 3)} mean?`,
			undefined,
			en('their'),
			[en('your (more than one person)'), en('her'), en('his')],
			`${w(105, 2, 3)} is “their plot”: the ending -hum means “their” on a noun.`,
			endingsRng
		),
		handChoice(
			'ends-4',
			`What does the ending of ${w(111, 2, 4)} mean?`,
			undefined,
			en('his'),
			[en('her'), en('their'), en('your (to one person)')],
			`${w(111, 2, 4)} is “his wealth”: the ending -hu means “his”.`,
			endingsRng
		),
		handMatch(
			'ends-5',
			'Match each word with its meaning.',
			[
				{ arabic: w(105, 1, 5), english: 'your Lord' },
				{ arabic: w(111, 2, 4), english: 'his wealth' },
				{ arabic: w(111, 5, 2), english: 'her neck' },
				{ arabic: w(105, 2, 3), english: 'their plot' }
			],
			'Each word is a noun plus a joined ending: -ka, -hu, -hā and -hum.',
			endingsRng
		),
		handChoice(
			'ends-6',
			'Which word ends in -hum, “them”?',
			undefined,
			ar(w(105, 3, 2)),
			[ar(w(105, 1, 5)), ar(w(111, 5, 2))],
			`${w(105, 3, 2)} is “upon them”: a small word plus -hum.`,
			endingsRng
		),
		handChoice(
			'ends-7',
			`What does the joined first letter of ${w(105, 5, 2)} mean?`,
			undefined,
			en('like'),
			[en('and'), en('for'), en('with')],
			`${w(105, 5, 2)} is “like husks”: ka- means “like”.`,
			endingsRng
		),
		handChoice(
			'ends-8',
			`What does the joined first letter of ${w(105, 4, 2)} mean?`,
			undefined,
			en('with (or by, in)'),
			[en('and'), en('like'), en('for')],
			`${w(105, 4, 2)} is “with stones”: bi- means “with”, “by” or “in”.`,
			endingsRng
		)
	]
};

// --- Lesson 2: verbs ------------------------------------------------------------------------

const verbsRng = rngFor('grammar-verbs');

const verbs: Lesson = {
	id: 'grammar-verbs',
	unitId: 'grammar-patterns',
	title: 'Verbs: when and who',
	subtitle: 'Past, present, commands and the passive',
	kind: 'grammar',
	intro: [
		rule(
			'Past and present',
			`An Arabic verb has two basic forms. The past form describes something done. The present form describes something happening or still to come. Compare ${w(109, 4, 5)} (“you worshipped”) and ${w(109, 2, 2)} (“I worship”): they come from the same root, ${root('abada')}, in different shapes.`
		),
		rule(
			'Who is doing it',
			`The front and back of a verb say who does it. In the present, the front letter tells you: a- is “I”, na- is “we”, ta- is “you” and ya- is “he” or “they”. So ${w(109, 2, 2)} is “I worship”, ${w(1, 5, 2)} is “we worship” and ${w(109, 2, 4)} is “you worship” (the ending -ūna means more than one person). ta- can also mean “she” or “it”, and the sentence tells you which.`
		),
		text(
			'In the past, the ending changes',
			`In the past it is the ending that tells you who: -tu is “I”, -nā is “we”, -ta is “you” (one person) and -tum is “you” (more than one). Look at ${w(110, 2, 1)} (“and you saw”, ending -ta), ${w(109, 4, 5)} (“you worshipped”, ending -tum) and ${w(108, 1, 2)} (“We gave you”, -nā). “He” has no ending: ${w(105, 3, 1)} is “and He sent”.`
		),
		rule(
			'Will',
			`A tiny sa- at the front of a present verb makes it future. ${w(111, 3, 1)} is “he will burn in”.`
		),
		rule(
			'Commands',
			`A command to one person is the verb without a front letter, often ending in a sukūn: ${w(109, 1, 1)} “Say!”, ${w(108, 2, 1)} “so pray!”, ${w(108, 2, 3)} “and sacrifice!”, ${w(110, 3, 1)} “then glorify!”. To tell “them” to do something, li- is added at the front: ${w(106, 3, 1)} is “so let them worship”.`
		),
		rule(
			'The passive',
			`Changing the vowels inside a verb can make it passive, so that the doer is not mentioned. ${w(112, 3, 2)} “beget” becomes ${w(112, 3, 4)} “be born”.`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'verbs-1',
			'Which word is in the present tense (happening or still to come)?',
			undefined,
			ar(w(109, 2, 2)),
			[ar(w(109, 4, 5)), ar(w(110, 2, 1))],
			`${w(109, 2, 2)} is “I worship”: present. The other two are past: “you worshipped” and “and you saw”.`,
			verbsRng
		),
		handChoice(
			'verbs-2',
			`Who does the action in ${w(109, 2, 2)}?`,
			undefined,
			en('I'),
			[en('we'), en('you'), en('he')],
			'The front letter a- means “I”.',
			verbsRng
		),
		handChoice(
			'verbs-3',
			`Who does the action in ${w(1, 5, 2)}?`,
			undefined,
			en('we'),
			[en('I'), en('you'), en('they')],
			'The front letters na- mean “we”: “we worship”.',
			verbsRng
		),
		handChoice(
			'verbs-4',
			`What does the ending of ${w(109, 4, 5)} tell you?`,
			undefined,
			en('you (more than one person), in the past'),
			[en('I, in the past'), en('we, in the present'), en('he, in the present')],
			'-tum is the past-tense ending for “you” when speaking to more than one person.',
			verbsRng
		),
		handChoice(
			'verbs-5',
			`What does the sa- at the front of ${w(111, 3, 1)} do?`,
			undefined,
			en('makes it future (“will”)'),
			[en('makes it negative'), en('makes it a command'), en('makes it passive')],
			'sa- turns a present verb into the future: “he will burn in”.',
			verbsRng
		),
		handChoice(
			'verbs-6',
			'Which word is a command?',
			undefined,
			ar(w(108, 2, 1)),
			[ar(w(108, 1, 2)), ar(w(105, 4, 1))],
			`${w(108, 2, 1)} is “so pray!”. ${w(108, 1, 2)} says “We gave you”, and ${w(105, 4, 1)} says “pelting them”.`,
			verbsRng
		),
		handChoice(
			'verbs-7',
			'Which word means “be born”, the passive?',
			undefined,
			ar(w(112, 3, 4)),
			[ar(w(112, 3, 2)), ar(w(112, 4, 2))],
			`${w(112, 3, 4)} is the passive of ${w(112, 3, 2)} (“beget”): the vowels inside the verb change.`,
			verbsRng
		),
		handMatch(
			'verbs-8',
			'Match each verb with its meaning.',
			[
				{ arabic: w(109, 2, 2), english: 'I worship' },
				{ arabic: w(1, 5, 2), english: 'we worship' },
				{ arabic: w(109, 2, 4), english: 'you (all) worship' },
				{ arabic: w(109, 4, 5), english: 'you (all) worshipped' }
			],
			`The same root ${root('abada')} four ways: a- “I”, na- “we”, ta-…-ūna “you (all)” and the past ending -tum.`,
			verbsRng
		)
	]
};

// --- Lesson 3: number and describing words -------------------------------------------------

const pluralsRng = rngFor('grammar-plurals');

const plurals: Lesson = {
	id: 'grammar-plurals',
	unitId: 'grammar-patterns',
	title: 'Number and describing words',
	subtitle: 'Dual, plural, doers and agreement',
	kind: 'grammar',
	intro: [
		rule(
			'One, two or many',
			`Arabic has three numbers: one, exactly two (the dual) and three or more (the plural). ${w(111, 1, 2)} is a dual: “the two hands of”.`
		),
		rule(
			'Regular plurals',
			`A masculine plural ends in -ūna or -īna. -ūna is the nominative form (for example for the subject, or when someone is addressed), as in ${w(109, 1, 3)} (“O disbelievers”). -īna is used in the other cases, for example after a small word such as li-, as in ${w(107, 4, 2)} (“to those who pray”). A feminine plural ends in -āt, as in ${w(113, 4, 3)} (“those who blow”).`
		),
		rule(
			'Plurals that change inside',
			`Many nouns have a “broken” plural, where the letters inside the word change, not just the ending. ${w(114, 5, 4)} (“chests”) is the plural of the word sadr, and ${w(113, 4, 5)} (“the knots”) is the plural of uqda. These are learned one by one, together with the word.`
		),
		rule(
			'The doer',
			`A word with the shape fāʿil names the one who does the action. ${w(109, 4, 3)} (“a worshipper”) is the doer of “to worship”, and ${w(113, 5, 3)} (“an envier”) is the doer of “to envy”. Its plural is what you see in ${w(109, 3, 3)}: “worshippers”.`
		),
		rule(
			'The one it is done to',
			`The shape mafʿūl names what the action was done to. ${w(105, 5, 3)} (“eaten up”) comes from “to eat”.`
		),
		text(
			'Doing it again and again',
			`A shape with a doubled middle letter and a long ā, such as ${w(110, 3, 7)} (“accepting of repentance”) and ${w(111, 4, 2)} (“carrier of”), often names someone who does a thing again and again, or very much.`
		),
		phrase(
			5,
			2,
			3,
			'like husks eaten up',
			'A describing word follows its noun and matches it. Here both are masculine, singular, indefinite and in the same case.',
			105
		),
		text(
			'Matching in gender too',
			`“Fire” is a feminine word in Arabic, so its describing word is feminine as well: ${w(111, 3, 2)} ${w(111, 3, 3)} ${w(111, 3, 4)} is “a fire having flames”, with the feminine ${w(111, 3, 3)}.`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'plurals-1',
			`How many does ${w(111, 1, 2)} mean?`,
			undefined,
			en('exactly two'),
			[en('one'), en('three or more')],
			`${w(111, 1, 2)} is a dual: “the two hands of”.`,
			pluralsRng
		),
		handChoice(
			'plurals-2',
			'Which word is a feminine plural?',
			undefined,
			ar(w(113, 4, 3)),
			[ar(w(109, 1, 3)), ar(w(111, 1, 2))],
			`${w(113, 4, 3)} ends in -āt, the feminine plural. ${w(109, 1, 3)} is a masculine plural and ${w(111, 1, 2)} is a dual.`,
			pluralsRng
		),
		handChoice(
			'plurals-3',
			`Which ending makes ${w(109, 3, 3)} a plural?`,
			undefined,
			en('-ūna (masculine plural)'),
			[en('-āt (feminine plural)'), en('a dual ending')],
			`${w(109, 3, 3)} is “worshippers”, a masculine plural ending in -ūna.`,
			pluralsRng
		),
		handChoice(
			'plurals-4',
			'Which word is a plural that changes inside the word (“chests”)?',
			undefined,
			ar(w(114, 5, 4)),
			[ar(w(114, 2, 1)), ar(w(114, 4, 3))],
			`${w(114, 5, 4)} is the broken plural of sadr. The other two are singular.`,
			pluralsRng
		),
		handChoice(
			'plurals-5',
			'Which word means “a worshipper”, the one who does it?',
			undefined,
			ar(w(109, 4, 3)),
			[ar(w(109, 2, 2)), ar(w(109, 4, 5))],
			`${w(109, 4, 3)} names the doer. ${w(109, 2, 2)} is “I worship” and ${w(109, 4, 5)} is “you worshipped”: verbs.`,
			pluralsRng
		),
		handChoice(
			'plurals-6',
			'Which word means “eaten up”, what the action was done to?',
			undefined,
			ar(w(105, 5, 3)),
			[ar(w(105, 5, 2)), ar(w(105, 4, 4))],
			`${w(105, 5, 3)} has the shape mafʿūl, “eaten up”.`,
			pluralsRng
		),
		buildPhrase(
			'plurals-7',
			'like husks eaten up',
			[w(105, 5, 2), w(105, 5, 3)],
			[w(105, 4, 4)],
			`${w(105, 5, 2)} ${w(105, 5, 3)}: the noun, then the word that describes it.`,
			pluralsRng
		),
		handChoice(
			'plurals-8',
			`The shape of ${w(110, 3, 7)} (a doubled middle letter and a long ā) often means someone who…`,
			undefined,
			en('does a thing again and again, or very much'),
			[en('had the action done to them'), en('does it only once'), en('is exactly two')],
			`${w(110, 3, 7)} is “accepting of repentance”: one who accepts it again and again.`,
			pluralsRng
		)
	]
};

// --- Lesson 4: building sentences -----------------------------------------------------------

const sentencesRng = rngFor('grammar-sentences');

const sentences: Lesson = {
	id: 'grammar-sentences',
	unitId: 'grammar-patterns',
	title: 'Building sentences',
	subtitle: 'No, indeed, who and questions',
	kind: 'grammar',
	intro: [
		rule(
			'Three ways to say “not”',
			'Which small word you use depends on the verb. lā with a present verb means “do not” or “does not”. lam with a present verb means “did not”. mā with a past verb also means “did not”. Here are all three.'
		),
		phrase(2, 1, 2, 'I do not worship', 'lā + a present verb: “do not”.', 109),
		phrase(3, 1, 2, 'did not beget', 'lam + a present verb: “did not”.', 112),
		phrase(2, 1, 2, 'did not avail', 'mā + a past verb: “did not”.', 111),
		rule(
			'“Indeed”',
			`inna at the start of a sentence stresses what follows: “indeed”. A joined ending can come straight after it: ${w(108, 1, 1)} is inna plus -nā, “Indeed We”, and ${w(110, 3, 5)} is inna plus -hu, “indeed He”. The noun right after inna usually ends in -a, as ${w(108, 3, 2)} does (“the one who hates you”).`
		),
		rule(
			'“Who” and “which”',
			`alladhī joins a description to a noun: “the one who …”. ${w(107, 1, 2)} ${w(107, 1, 3)} is “the one who denies”. For more than one person it is alladhīna: ${w(107, 5, 1)} is “those who”.`
		),
		rule(
			'Asking a question',
			`The letter أ at the front of a sentence turns it into a question. ${w(107, 1, 1)} is “Have you seen?”. With lam it asks something the listener already knows: ${w(105, 1, 1)} is “Have you not …?”.`
		),
		phrase(
			1,
			1,
			4,
			'when the help of Allah comes',
			'idhā means “when”. After it Arabic often uses a past verb for something that is still to come: “when … comes”.',
			110
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'sentences-1',
			'Which word means “did not” before a present-form verb?',
			undefined,
			ar(w(112, 3, 1)),
			[ar(w(109, 2, 1)), ar(w(111, 2, 1))],
			`${w(112, 3, 1)} is lam: “did not”. ${w(109, 2, 1)} is lā (“do not”) and ${w(111, 2, 1)} is mā (used with a past verb).`,
			sentencesRng
		),
		handChoice(
			'sentences-2',
			'What does this mean?',
			ar(`${w(109, 2, 1)} ${w(109, 2, 2)}`),
			en('I do not worship'),
			[en('I did not worship'), en('I worship'), en('I will worship')],
			'lā with a present verb: “I do not worship”.',
			sentencesRng
		),
		handChoice(
			'sentences-3',
			'What does this mean?',
			ar(`${w(111, 2, 1)} ${w(111, 2, 2)}`),
			en('did not avail'),
			[en('will not avail'), en('avails'), en('does not avail')],
			'mā with a past verb: “did not avail”.',
			sentencesRng
		),
		handChoice(
			'sentences-4',
			'What does this word do at the start of a sentence?',
			ar(w(108, 3, 1)),
			en('stresses what follows (“indeed”)'),
			[en('makes it a question'), en('makes it negative'), en('makes it a command')],
			'inna means “indeed”: it stresses the sentence.',
			sentencesRng
		),
		handChoice(
			'sentences-5',
			'Which word means “the one who”?',
			undefined,
			ar(w(107, 1, 2)),
			[ar(w(107, 5, 1)), ar(w(110, 1, 1))],
			`${w(107, 1, 2)} is alladhī, “the one who”. ${w(107, 5, 1)} is alladhīna, “those who”.`,
			sentencesRng
		),
		handChoice(
			'sentences-6',
			`What does the first letter of ${w(107, 1, 1)} do?`,
			undefined,
			en('turns the sentence into a question'),
			[en('makes it negative'), en('makes it future'), en('makes it a command')],
			`${w(107, 1, 1)} is “Have you seen?”: the first letter asks the question.`,
			sentencesRng
		),
		buildPhrase(
			'sentences-7',
			'Have you not seen how',
			[w(105, 1, 1), w(105, 1, 2), w(105, 1, 3)],
			[w(105, 1, 4)],
			`${w(105, 1, 1)} ${w(105, 1, 2)} ${w(105, 1, 3)}: the question with lam, the verb “see”, then “how”.`,
			sentencesRng
		),
		handChoice(
			'sentences-8',
			'Which word means “when”?',
			undefined,
			ar(w(110, 1, 1)),
			[ar(w(108, 3, 1)), ar(w(112, 3, 1))],
			`${w(110, 1, 1)} is idhā, “when”. ${w(108, 3, 1)} is inna (“indeed”) and ${w(112, 3, 1)} is lam (“did not”).`,
			sentencesRng
		)
	]
};

export const grammarPatternsUnit: Unit = {
	id: 'grammar-patterns',
	title: 'Grammar from the short surahs',
	description:
		'Four ideas that unlock most of what you read: joined endings, verbs, number and sentence building. Every example is a word you have already met.',
	lessons: [endings, verbs, plurals, sentences]
};
