import { wordText as w } from '../data';
import { rngFor } from '../random';
import { ar, buildPhrase, en, handChoice, handMatch } from './exercises';
import type { Block, Lesson, Unit } from './types';

/**
 * Unit: more grammar from the short surahs. Four ideas that build on the first grammar units:
 * small words before a noun, sentences with no verb, the endings that show a noun's job, and
 * “when”, “then” and “O”.
 *
 * Every example is a word from Al-Fatiha or surahs 105–114, which the learner has already studied,
 * and all Arabic comes from the corpus through `w(surah, ayah, word)`. The case labels (nominative,
 * accusative, genitive) were checked against the corpus. The explanations are drafts: keep them
 * conservative and have a teacher review them.
 */

const phrase = (
	surah: number,
	ayah: number,
	from: number,
	to: number,
	translation: string,
	note?: string
): Block => ({ type: 'phrase', surah, ayah, from, to, translation, note });

const verse = (surah: number, ayah: number, note?: string): Block => ({
	type: 'verse',
	surah,
	ayah,
	note
});

const rule = (title: string, body: string): Block => ({ type: 'rule', title, body });
const text = (title: string, body: string): Block => ({ type: 'text', title, body });

// --- Lesson 1: small words before a noun ----------------------------------------------------

const prepositionsRng = rngFor('grammar-prepositions');

const prepositions: Lesson = {
	id: 'grammar-prepositions',
	unitId: 'grammar-structure',
	title: 'Small words that do big jobs',
	subtitle: 'From, in, on and about',
	kind: 'grammar',
	intro: [
		rule(
			'Words that come before a noun',
			'A small word placed before a noun, to say where, from where or about what, is called a preposition. Four of the most common are min “from”, fī “in”, ʿalā “on” and ʿan “about”. Each is a word of its own, written apart from the noun after it.'
		),
		phrase(
			114,
			4,
			1,
			3,
			'from the evil of the whisperer',
			'min “from” comes first, then the noun it belongs to.'
		),
		phrase(
			111,
			5,
			1,
			2,
			'in her neck',
			'fī “in”. The ending -hā “her” is joined on, as in the lesson on endings.'
		),
		phrase(
			107,
			3,
			3,
			5,
			'on the food of the needy',
			'ʿalā “on”. A verb often comes with its own preposition, so learn them together: here the verb is “urge”.'
		),
		phrase(107, 5, 3, 4, 'about their prayer', 'ʿan “about”.'),
		rule(
			'The noun after it ends in -i',
			`The noun after a preposition takes the genitive ending, the same “-i” sound you met on the second noun of an iḍāfa. ${w(114, 4, 2)} ends in -i after ${w(114, 4, 1)}, and so does ${w(111, 5, 2)} after ${w(111, 5, 1)}. A noun with tanwīn ends in -in instead, as ${w(105, 2, 5)} (“going astray”) does after ${w(105, 2, 4)} (“in”).`
		),
		text(
			'One small word, several meanings',
			`min is the most flexible. ${w(113, 2, 1)} is “from”. In ${w(105, 4, 3)} (“stones of baked clay”) it is “of”, and in ${w(106, 4, 3)} it is “against” (“fed them against hunger”). Learn each small word together with the phrase it appears in, not as one English word.`
		),
		rule(
			'Joined endings and one-letter prepositions',
			`You already know bi- “with, in”, li- “for, to” and ka- “like”, which join onto the front of a noun. A preposition can also take the joined endings. ${w(105, 3, 2)} is ʿalā plus -him, “upon them”, and ${w(109, 6, 1)} is li- plus -kum, “for you”. Notice that ʿalā becomes ʿalay- before an ending, and li- usually becomes la-. “For me” is the exception: ${w(109, 6, 3)} is wa- plus li- plus -ya, “and for me”.`
		),
		text(
			'A preposition can be a whole sentence',
			`Sometimes a preposition and a noun are all there is. ${w(109, 6, 1)} ${w(109, 6, 2)} is, word for word, “for you, your religion”, which English says as “you have your religion”. The next lesson looks at sentences like this.`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'preps-1',
			'Which word means “in”?',
			undefined,
			ar(w(111, 5, 1)),
			[ar(w(113, 2, 1)), ar(w(107, 3, 3)), ar(w(107, 5, 3))],
			`${w(111, 5, 1)} is fī, “in”. ${w(113, 2, 1)} is min (“from”), ${w(107, 3, 3)} is ʿalā (“on”) and ${w(107, 5, 3)} is ʿan (“about”).`,
			prepositionsRng
		),
		handChoice(
			'preps-2',
			'Which word means “from”?',
			undefined,
			ar(w(113, 2, 1)),
			[ar(w(111, 5, 1)), ar(w(107, 3, 3)), ar(w(107, 5, 3))],
			`${w(113, 2, 1)} is min, “from”, as in “from the evil of”.`,
			prepositionsRng
		),
		handMatch(
			'preps-3',
			'Match each small word with its meaning.',
			[
				{ arabic: w(113, 2, 1), english: 'from' },
				{ arabic: w(111, 5, 1), english: 'in' },
				{ arabic: w(107, 3, 3), english: 'on' },
				{ arabic: w(107, 5, 3), english: 'about' }
			],
			'min “from”, fī “in”, ʿalā “on” and ʿan “about”.',
			prepositionsRng
		),
		handChoice(
			'preps-4',
			'What does this phrase mean?',
			ar(`${w(114, 4, 1)} ${w(114, 4, 2)} ${w(114, 4, 3)}`),
			en('from the evil of the whisperer'),
			[
				en('in the evil of the whisperer'),
				en('on the evil of the whisperer'),
				en('about the evil of the whisperer')
			],
			`${w(114, 4, 1)} is min, “from”: “from the evil of the whisperer”.`,
			prepositionsRng
		),
		handChoice(
			'preps-5',
			'Which ending does the noun after a preposition take?',
			undefined,
			en('-i (kasra)'),
			[en('-u (ḍamma)'), en('-a (fatḥa)')],
			`After a preposition the noun is genitive: ${w(111, 5, 2)} ends in -i after ${w(111, 5, 1)}.`,
			prepositionsRng
		),
		buildPhrase(
			'preps-6',
			'in the chests of mankind',
			[w(114, 5, 3), w(114, 5, 4), w(114, 5, 5)],
			[w(113, 2, 1)],
			`${w(114, 5, 3)} ${w(114, 5, 4)} ${w(114, 5, 5)}: fī “in”, then the noun it belongs to, then “of mankind”.`,
			prepositionsRng
		),
		handChoice(
			'preps-7',
			'Which word means “and for me”?',
			undefined,
			ar(w(109, 6, 3)),
			[ar(w(109, 6, 1)), ar(w(112, 4, 3)), ar(w(108, 2, 2))],
			`${w(109, 6, 3)} is wa- plus li- plus -ya, “and for me”. ${w(109, 6, 1)} is “for you”, ${w(112, 4, 3)} is “to Him” and ${w(108, 2, 2)} is “to your Lord”.`,
			prepositionsRng
		),
		handChoice(
			'preps-8',
			`What does ${w(105, 3, 2)} mean?`,
			undefined,
			en('upon them'),
			[en('from them'), en('in them'), en('about them')],
			`${w(105, 3, 2)} is ʿalā plus the ending -him: “upon them”. ʿalā becomes ʿalay- before an ending.`,
			prepositionsRng
		)
	]
};

// --- Lesson 2: sentences with no verb -------------------------------------------------------

const nominalRng = rngFor('grammar-nominal');

const nominal: Lesson = {
	id: 'grammar-nominal',
	unitId: 'grammar-structure',
	title: 'Sentences without verbs',
	subtitle: '“X is Y”, this, that, who and what',
	kind: 'grammar',
	intro: [
		rule(
			'No word for “is”',
			'Arabic often says “X is Y” by putting X and Y side by side, with no word for “is” between them. The “is” is understood. This is called a sentence without a verb.'
		),
		phrase(
			112,
			2,
			1,
			2,
			'Allah is the Self-Sufficient',
			'Two words and no verb: the one spoken about, then what is said of it. Both end in -u.'
		),
		phrase(
			1,
			2,
			1,
			2,
			'the praise is for Allah',
			'What is said of it can be a preposition and its noun: “for Allah”.'
		),
		phrase(
			108,
			3,
			3,
			4,
			'he is the one cut off',
			'A word like huwa “he” can be the one spoken about. “Is” is still understood.'
		),
		phrase(
			109,
			4,
			1,
			3,
			'and I am not a worshipper',
			'anā “I”, then a word for “a worshipper”. lā “not” in front makes it negative, and there is still no verb.'
		),
		text(
			'Either half can come first',
			`The order can be turned round. ${w(109, 6, 1)} ${w(109, 6, 2)} puts “for you” first and “your religion” second: “you have your religion”. In the same way ${w(107, 4, 1)} ${w(107, 4, 2)} is “so woe to those who pray”, with “woe” first.`
		),
		rule(
			'This and that',
			`hādhā means “this” and dhālika means “that”. The word for “this” comes first, and the noun after it has ال: ${w(106, 3, 3)} ${w(106, 3, 4)} is “this House”. dhālika can begin a sentence of its own: ${w(107, 2, 1)} is “so that is …”.`
		),
		phrase(
			107,
			2,
			1,
			4,
			'so that is the one who pushes away the orphan',
			'Three ideas together: dhālika “that is”, alladhī “the one who”, and the verb that describes him. Again no word for “is”.'
		),
		rule(
			'Who, which and what',
			`You have met alladhī “the one who” and alladhīna “those who”. A who-part can hold a sentence with no verb: ${w(107, 5, 1)} ${w(107, 5, 2)} ${w(107, 5, 3)} ${w(107, 5, 4)} ${w(107, 5, 5)} is “those who are heedless about their prayer”, with hum “they” and sāhūna “heedless”. For things rather than people, Arabic uses mā, “what” or “that which”: ${w(109, 2, 3)} ${w(109, 2, 4)} is “what you worship”.`
		),
		text(
			'Two jobs for mā',
			`mā is also the word for “not” before a past verb, as in ${w(111, 2, 1)} ${w(111, 2, 2)} (“did not avail”). The same spelling has two jobs, and the sense of the sentence tells you which. In ${w(111, 2, 5)} ${w(111, 2, 6)} it is “what”: “and what he earned”.`
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'nominal-1',
			'Which of these has no verb in it?',
			undefined,
			ar(`${w(112, 2, 1)} ${w(112, 2, 2)}`),
			[
				ar(`${w(112, 3, 1)} ${w(112, 3, 2)}`),
				ar(`${w(109, 2, 1)} ${w(109, 2, 2)}`),
				ar(`${w(105, 3, 1)} ${w(105, 3, 2)}`)
			],
			`${w(112, 2, 1)} ${w(112, 2, 2)} is “Allah is the Self-Sufficient”: two nouns and no verb. The others contain the verbs “beget”, “worship” and “sent”.`,
			nominalRng
		),
		handChoice(
			'nominal-2',
			'What does this sentence mean?',
			ar(`${w(112, 2, 1)} ${w(112, 2, 2)}`),
			en('Allah is the Self-Sufficient'),
			[
				en('Allah created the Self-Sufficient'),
				en('Allah and the Self-Sufficient'),
				en('Allah is not the Self-Sufficient')
			],
			'The “is” is understood: the one spoken about, then what is said of it.',
			nominalRng
		),
		handChoice(
			'nominal-3',
			'What does this mean?',
			ar(`${w(109, 6, 1)} ${w(109, 6, 2)}`),
			en('you have your religion'),
			[
				en('your religion is for me'),
				en('you worship your religion'),
				en('your religion and mine')
			],
			`${w(109, 6, 1)} is “for you” and ${w(109, 6, 2)} is “your religion”: literally “for you, your religion”.`,
			nominalRng
		),
		buildPhrase(
			'nominal-4',
			'the praise is for Allah',
			[w(1, 2, 1), w(1, 2, 2)],
			[w(1, 2, 3)],
			`${w(1, 2, 1)} ${w(1, 2, 2)}: “the praise”, then “for Allah”, with no word for “is”.`,
			nominalRng
		),
		handMatch(
			'nominal-5',
			'Match each word with its meaning.',
			[
				{ arabic: w(106, 3, 3), english: 'this' },
				{ arabic: w(107, 2, 1), english: 'so that is' },
				{ arabic: w(107, 2, 2), english: 'the one who' },
				{ arabic: w(109, 2, 3), english: 'what' }
			],
			'hādhā “this”, dhālika “that”, alladhī “the one who” and mā “what”.',
			nominalRng
		),
		handChoice(
			'nominal-6',
			'What does this phrase mean?',
			ar(`${w(113, 2, 3)} ${w(113, 2, 4)}`),
			en('what He created'),
			[en('He did not create'), en('and He created'), en('so He created')],
			`${w(113, 2, 3)} is mā, “what”, and ${w(113, 2, 4)} is “He created”: “what He created”.`,
			nominalRng
		),
		buildPhrase(
			'nominal-7',
			'so that is the one who pushes away the orphan',
			[w(107, 2, 1), w(107, 2, 2), w(107, 2, 3), w(107, 2, 4)],
			[w(107, 3, 2)],
			`${w(107, 2, 1)} ${w(107, 2, 2)} ${w(107, 2, 3)} ${w(107, 2, 4)}: “so that is”, “the one who”, “pushes away”, “the orphan”.`,
			nominalRng
		),
		handChoice(
			'nominal-8',
			'What does this mean?',
			ar(`${w(107, 5, 1)} ${w(107, 5, 2)} ${w(107, 5, 3)} ${w(107, 5, 4)} ${w(107, 5, 5)}`),
			en('those who are heedless about their prayer'),
			[
				en('those who show off in their prayer'),
				en('those who guard their prayer'),
				en('those who pray to their Lord')
			],
			`${w(107, 5, 5)} is “heedless”: “those who, they, about their prayer, are heedless”.`,
			nominalRng
		),
		handChoice(
			'nominal-9',
			`Which word in ${w(106, 3, 2)} ${w(106, 3, 3)} ${w(106, 3, 4)} means “this”?`,
			undefined,
			ar(w(106, 3, 3)),
			[ar(w(106, 3, 2)), ar(w(106, 3, 4))],
			`${w(106, 3, 3)} is hādhā, “this”. The phrase is “the Lord of this House”.`,
			nominalRng
		)
	]
};

// --- Lesson 3: case endings -----------------------------------------------------------------

const casesRng = rngFor('grammar-cases');

const cases: Lesson = {
	id: 'grammar-cases',
	unitId: 'grammar-structure',
	title: 'What the endings tell you',
	subtitle: 'The -u, -a and -i endings, and tanwīn',
	kind: 'grammar',
	intro: [
		rule(
			'A noun’s last vowel shows its job',
			'The last vowel of an Arabic noun usually shows the job the noun does in its sentence. There are three: -u (nominative), -a (accusative) and -i (genitive). These are the case endings, and they are why the same word is spelled a little differently in different places. Here are the most common jobs; there are more.'
		),
		rule(
			'-u: the one spoken about, or doing the action',
			`The nominative -u marks the one a sentence is about, and the one doing a verb. In ${w(112, 2, 1)} ${w(112, 2, 2)} (“Allah is the Self-Sufficient”) both words end in -u. In ${w(110, 1, 2)} ${w(110, 1, 3)} (“the help of … comes”) ${w(110, 1, 3)} is the one that comes.`
		),
		rule(
			'-a: what the action is done to',
			`The accusative -a marks what a verb is done to. In ${w(108, 1, 2)} ${w(108, 1, 3)} (“We have given you the Abundance”) ${w(108, 1, 3)} is what was given. In ${w(110, 2, 1)} ${w(110, 2, 2)} (“and you see the people”) ${w(110, 2, 2)} is what is seen. The noun straight after inna also ends in -a, as ${w(108, 3, 2)} does.`
		),
		phrase(
			108,
			1,
			2,
			3,
			'We have given you the Abundance',
			'The Abundance ends in -a: it is what was given.'
		),
		rule(
			'-i: after a preposition, and on the second noun of an iḍāfa',
			`The genitive -i is used in two places. After a preposition: ${w(113, 2, 2)} after ${w(113, 2, 1)} (“from the evil”). And on the second noun of an iḍāfa, “X of Y”.`
		),
		phrase(
			110,
			1,
			3,
			4,
			'the help of Allah',
			'Both endings in one phrase. The help is the one that comes, so it ends in -u. Allah is the second noun of the iḍāfa, so it ends in -i.'
		),
		rule(
			'The same word in three places',
			`The word “Lord” turns up with all three endings. ${w(105, 1, 5)} (“your Lord”) ends in -u: He is the one who acted. ${w(106, 3, 2)} (“the Lord of”) ends in -a: He is the one they are told to worship. ${w(113, 1, 3)} (“in the Lord of”) ends in -i, because it follows the preposition bi-.`
		),
		rule(
			'Tanwīn: “a …”',
			`A noun that ends in a doubled vowel sound, -un, -an or -in, is indefinite: “a …”. Compare ${w(112, 1, 4)} (“One”, -un), ${w(105, 3, 3)} (“birds”, -an) and ${w(105, 2, 5)} (“going astray”, -in, after the preposition ${w(105, 2, 4)}). A noun with ال has no tanwīn, and nor does the first noun of an iḍāfa: ${w(1, 6, 2)} (“the path”) and ${w(110, 1, 3)} (“the help of”) have none. A few kinds of word never take tanwīn at all; that is for later.`
		),
		text(
			'You have seen the plural endings already',
			'The plural endings follow the same idea. -ūna is the nominative form and -īna is used in the other cases, as the lesson on number said.'
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'cases-1',
			'Which ending marks what an action is done to?',
			undefined,
			en('-a (fatḥa)'),
			[en('-u (ḍamma)'), en('-i (kasra)')],
			`The accusative -a marks what a verb is done to, as on ${w(108, 1, 3)}, “the Abundance”.`,
			casesRng
		),
		handChoice(
			'cases-2',
			'Which ending does a noun take after a preposition?',
			undefined,
			en('-i (kasra)'),
			[en('-u (ḍamma)'), en('-a (fatḥa)')],
			`After a preposition the noun ends in -i: ${w(113, 2, 2)} after ${w(113, 2, 1)}.`,
			casesRng
		),
		handChoice(
			'cases-3',
			'Which ending does the one a sentence is about usually take?',
			undefined,
			en('-u (ḍamma)'),
			[en('-a (fatḥa)'), en('-i (kasra)')],
			`The nominative -u: both words of ${w(112, 2, 1)} ${w(112, 2, 2)} end in -u.`,
			casesRng
		),
		handChoice(
			'cases-4',
			`In ${w(108, 1, 1)} ${w(108, 1, 2)} ${w(108, 1, 3)}, which word is what was given?`,
			undefined,
			ar(w(108, 1, 3)),
			[ar(w(108, 1, 1)), ar(w(108, 1, 2))],
			`${w(108, 1, 3)} is “the Abundance”, in -a: it is what was given. ${w(108, 1, 2)} is the verb “have given you”.`,
			casesRng
		),
		handChoice(
			'cases-5',
			'Which form of “Lord” is the one who acted, as in “your Lord dealt”?',
			undefined,
			ar(w(105, 1, 5)),
			[ar(w(106, 3, 2)), ar(w(113, 1, 3))],
			`${w(105, 1, 5)} ends in -u: He is the one who acted. ${w(106, 3, 2)} ends in -a and ${w(113, 1, 3)} ends in -i.`,
			casesRng
		),
		handChoice(
			'cases-6',
			`What does the -a ending on ${w(106, 3, 2)} tell you?`,
			undefined,
			en('He is the one they are told to worship'),
			[
				en('it follows a preposition'),
				en('He is the one doing the action'),
				en('it is the second noun of an iḍāfa')
			],
			`${w(106, 3, 2)} is what “let them worship” is done to, so it ends in -a. It is the first noun of “Lord of this House”, so it is not the second noun of an iḍāfa.`,
			casesRng
		),
		handChoice(
			'cases-7',
			'Which word has tanwīn, so it is indefinite (“a …”)?',
			undefined,
			ar(w(105, 3, 3)),
			[ar(w(1, 6, 2)), ar(w(110, 2, 2)), ar(w(108, 1, 3))],
			`${w(105, 3, 3)} (“birds”) ends in -an. The other three have ال, so they take no tanwīn.`,
			casesRng
		),
		handChoice(
			'cases-8',
			`Why does ${w(113, 2, 2)} end in -i?`,
			undefined,
			en('it comes after the preposition min'),
			[
				en('it is the one doing the action'),
				en('it is what the action is done to'),
				en('it has tanwīn')
			],
			`${w(113, 2, 2)} follows ${w(113, 2, 1)}, a preposition, so it ends in -i.`,
			casesRng
		),
		handMatch(
			'cases-9',
			'Match each form of “Lord” with the job its ending shows.',
			[
				{ arabic: w(105, 1, 5), english: 'the one who acted (-u)' },
				{ arabic: w(106, 3, 2), english: 'what is worshipped (-a)' },
				{ arabic: w(113, 1, 3), english: 'after a preposition (-i)' }
			],
			'-u for the one acting, -a for what the action is done to, -i after a preposition.',
			casesRng
		)
	]
};

// --- Lesson 4: when, then and O -------------------------------------------------------------

const whenRng = rngFor('grammar-when-o');

const whenAndO: Lesson = {
	id: 'grammar-when-o',
	unitId: 'grammar-structure',
	title: 'Time, results and calling out',
	subtitle: '“When”, “then” and “O”',
	kind: 'grammar',
	intro: [
		rule(
			'“When” starts a time clause',
			'idhā means “when”. It opens a clause that says the time something happens. You met it in the lesson on building sentences; here it turns up twice more.'
		),
		phrase(
			113,
			3,
			3,
			5,
			'darkness when it settles',
			'idhā “when”, then the verb “it settles”. The clause says when the evil is meant.'
		),
		phrase(113, 5, 3, 5, 'an envier when he envies', 'The same pattern: idhā, then a verb.'),
		text(
			'The verb after idhā',
			`The verb after idhā has the past form: ${w(113, 3, 5)} and ${w(113, 5, 5)}. English says “when it settles” and “when he envies”, because the sentence is about something that is still to happen. The English follows the sense, not the form.`
		),
		rule(
			'The verb often comes first',
			`Arabic often puts the verb first and the one doing it after: ${w(110, 1, 2)} ${w(110, 1, 3)} is “comes the help of”, and ${w(105, 1, 4)} ${w(105, 1, 5)} is “dealt your Lord”. English turns them round. The one doing the verb ends in -u, as the last lesson showed.`
		),
		rule(
			'“Then”: the answer to a “when”',
			`After a “when” sentence, the answer often begins with fa-, “then”. Surah An-Nasr is built this way. The “when” part runs over its first two verses, and ${w(110, 3, 1)} (“then glorify”) begins the answer.`
		),
		verse(110, 1, '“When” starts here.'),
		verse(110, 2, 'The “when” sentence goes on.'),
		verse(110, 3, 'fa- “then” begins the answer.'),
		rule(
			'“O …”: calling someone',
			`yā means “O”, and it is how someone is called. ${w(109, 1, 2)} joins yā with ayyuhā in one word, and the ones called follow, with ال: ${w(109, 1, 2)} ${w(109, 1, 3)} is “O disbelievers”. The ones called end in -u, here the plural -ūna.`
		),
		phrase(
			109,
			1,
			1,
			3,
			'Say: O disbelievers',
			'qul “Say” is a command, then the call, then the ones being called.'
		)
	],
	cardIds: [],
	exercises: [
		handChoice(
			'when-1',
			'What does this mean?',
			ar(`${w(113, 3, 4)} ${w(113, 3, 5)}`),
			en('when it settles'),
			[en('and it settles'), en('it did not settle'), en('so it settles')],
			`${w(113, 3, 4)} is idhā, “when”, and ${w(113, 3, 5)} is “it settles”.`,
			whenRng
		),
		handChoice(
			'when-2',
			'What does this mean?',
			ar(`${w(113, 5, 4)} ${w(113, 5, 5)}`),
			en('when he envies'),
			[en('he did not envy'), en('and he envies'), en('then he envies')],
			`${w(113, 5, 4)} is idhā, “when”, and ${w(113, 5, 5)} is “he envies”.`,
			whenRng
		),
		buildPhrase(
			'when-3',
			'and from the evil of an envier when he envies',
			[w(113, 5, 1), w(113, 5, 2), w(113, 5, 3), w(113, 5, 4), w(113, 5, 5)],
			[w(113, 3, 3)],
			`${w(113, 5, 1)} ${w(113, 5, 2)} ${w(113, 5, 3)} ${w(113, 5, 4)} ${w(113, 5, 5)}: “and from”, “the evil of”, “an envier”, “when”, “he envies”.`,
			whenRng
		),
		handChoice(
			'when-4',
			`In ${w(110, 1, 2)} ${w(110, 1, 3)} ${w(110, 1, 4)} (“the help of Allah comes”), which word is the verb?`,
			undefined,
			ar(w(110, 1, 2)),
			[ar(w(110, 1, 3)), ar(w(110, 1, 4))],
			`${w(110, 1, 2)} is “comes”. It comes first, and the one that comes, ${w(110, 1, 3)}, follows it.`,
			whenRng
		),
		handChoice(
			'when-5',
			`Which small letter at the front of ${w(110, 3, 1)} (“then glorify”) shows that it is the answer to the “when”?`,
			undefined,
			en('fa- “then”'),
			[en('wa- “and”'), en('bi- “with”'), en('li- “for”')],
			`${w(110, 3, 1)} begins with fa-, “then”: after the “when” sentences, it starts the answer.`,
			whenRng
		),
		handChoice(
			'when-6',
			'Which word means “O”?',
			undefined,
			ar(w(109, 1, 2)),
			[ar(w(109, 1, 1)), ar(w(109, 1, 3)), ar(w(109, 2, 1))],
			`${w(109, 1, 2)} is yā plus ayyuhā, “O”. ${w(109, 1, 1)} is “Say”, ${w(109, 1, 3)} is “disbelievers” and ${w(109, 2, 1)} is “not”.`,
			whenRng
		),
		buildPhrase(
			'when-7',
			'Say: O disbelievers',
			[w(109, 1, 1), w(109, 1, 2), w(109, 1, 3)],
			[w(109, 2, 1)],
			`${w(109, 1, 1)} ${w(109, 1, 2)} ${w(109, 1, 3)}: “Say”, “O”, then the ones being called.`,
			whenRng
		),
		handChoice(
			'when-8',
			`In ${w(109, 1, 1)} ${w(109, 1, 2)} ${w(109, 1, 3)}, which word names the ones being called?`,
			undefined,
			ar(w(109, 1, 3)),
			[ar(w(109, 1, 1)), ar(w(109, 1, 2))],
			`${w(109, 1, 3)} is “disbelievers”, the ones being called. ${w(109, 1, 2)} is the “O” that calls them.`,
			whenRng
		)
	]
};

export const grammarStructureUnit: Unit = {
	id: 'grammar-structure',
	title: 'Sentences and small words',
	description:
		'Small words before a noun, sentences with no verb, the endings that show a noun’s job, and “when” and “O”. Every example is a word you have already met.',
	lessons: [prepositions, nominal, cases, whenAndO]
};
