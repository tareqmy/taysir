import { formatRoot, lexemeById, lexicon, wordText as w } from '../data';
import { rngFor } from '../random';
import { lexemeCardId } from './cards';
import { vocabularyExercises } from './exercises';
import type { Block, Lesson, Unit } from './types';

/**
 * Unit 5: the short surahs Al-Fil to An-Nas (105–114), taught word by word like Al-Fatiha.
 *
 * Arabic inside the prose always comes from the corpus through `w(surah, ayah, word)`.
 * The explanations are drafts: keep them conservative and have a teacher review them.
 */

const pool = lexicon.lexemes;

const verse = (surah: number, ayah: number, note?: string): Block => ({
	type: 'verse',
	surah,
	ayah,
	note
});

const phrase = (
	surah: number,
	ayah: number,
	from: number,
	to: number,
	translation: string,
	note?: string
): Block => ({ type: 'phrase', surah, ayah, from, to, translation, note });

const text = (title: string, body: string): Block => ({ type: 'text', title, body });
const rule = (title: string, body: string): Block => ({ type: 'rule', title, body });
const words = (title: string, ids: string[]): Block => ({ type: 'lexemes', title, ids });

/** A lexeme's root written with hyphens, e.g. `ع-ب-د`. */
const root = (id: string) => formatRoot(lexemeById(id).root!);

interface SurahLesson {
	id: string;
	title: string;
	subtitle: string;
	/** Vocabulary cards taught in this lesson. */
	ids: string[];
	intro: Block[];
}

const lessonSpecs: SurahLesson[] = [
	// --- Al-Ikhlas (112) ---
	{
		id: 'ikhlas',
		title: 'He is Allah, One',
		subtitle: 'Al-Ikhlas, verses 1 to 4',
		ids: ['qala', 'ahad', 'samad', 'lam', 'walada', 'kana'],
		intro: [
			text(
				'Ten short surahs',
				'You may already know several of these surahs by heart. As in Al-Fatiha, the meaning of every word sits under the verse. A gold underline marks a word that has a vocabulary card. A few words occur only once or twice in the whole Quran, so they are explained under the verse but have no card.'
			),
			verse(112, 1, 'Tap a word to hear it.'),
			verse(112, 2),
			verse(112, 3),
			verse(112, 4),
			text(
				'Saying “Say!”',
				`The surah opens with ${w(112, 1, 1)}, the command “Say!”. Four surahs in this unit begin that way. The card shows the dictionary form of the verb, which is the one you would look up. The word for “equal” in the last verse, ${w(112, 4, 4)}, occurs only here.`
			),
			rule(
				'Saying “did not”',
				`${w(112, 3, 1)} before a verb means “did not”. The last letter of the verb after it usually carries a sukūn, as in ${w(112, 3, 2)} (“beget”). It appears three times in this short surah.`
			),
			words('Six words to learn', ['qala', 'ahad', 'samad', 'lam', 'walada', 'kana'])
		]
	},

	// --- An-Nas (114) ---
	{
		id: 'nas-1',
		title: 'Seeking refuge',
		subtitle: 'An-Nas, verses 1 to 4',
		ids: ['audhu', 'nas', 'ilah', 'min', 'shar'],
		intro: [
			verse(114, 1),
			verse(114, 2),
			verse(114, 3),
			verse(114, 4),
			text(
				'A verb that looks different',
				`In the first verse the verb is ${w(114, 1, 2)}, “I seek refuge”. The card shows its dictionary form, which looks quite different. You will see the same verb again in Al-Falaq.`
			),
			phrase(
				114,
				2,
				1,
				2,
				'King of mankind',
				'The pattern from “Lord of the worlds” returns. The first noun has no ال, and the second noun, with ال, ends in kasra. The surah says it three times: Lord of, King of, God of mankind.'
			),
			text(
				'Two rare words',
				`${w(114, 4, 3)} and ${w(114, 4, 4)} in the fourth verse occur only here in the Quran, so they have no card. The meanings under the verse are enough.`
			),
			words('Five words to learn', ['audhu', 'nas', 'ilah', 'min', 'shar'])
		]
	},
	{
		id: 'nas-2',
		title: 'Whispers in the chests',
		subtitle: 'An-Nas, verses 5 and 6',
		ids: ['alladhi', 'waswasa', 'fi', 'sadr'],
		intro: [
			verse(114, 5),
			verse(114, 6),
			text(
				'“Who” starts a description',
				`${w(114, 5, 1)} means “who” and starts a clause that describes someone: “the whisperer, who whispers…”. It is a small word you will see everywhere, about 1,500 times in the Quran.`
			),
			text(
				'A whisper in the sound',
				`The verb ${w(114, 5, 2)} (“whispers”) and the noun ${w(114, 4, 3)} in the previous verse share the root ${root('waswasa')}. The sounds of the root repeat, like the whisper it describes.`
			),
			words('Four words to learn', ['alladhi', 'waswasa', 'fi', 'sadr'])
		]
	},

	// --- Al-Falaq (113) ---
	{
		id: 'falaq',
		title: 'Refuge from harm',
		subtitle: 'Al-Falaq, verses 1 to 5',
		ids: ['falaq', 'khalaqa', 'ma', 'idha', 'uqda', 'hasada'],
		intro: [
			verse(113, 1),
			verse(113, 2),
			verse(113, 3),
			verse(113, 4),
			verse(113, 5),
			phrase(
				113,
				2,
				2,
				4,
				'the evil of what He created',
				`${w(113, 2, 1)} ${w(113, 2, 2)}, “from the evil of”, comes four times in this surah. It is another iḍāfa: the evil of (something). Here the something is ${w(113, 2, 3)}, “what”.`
			),
			text(
				'“When” and the past tense',
				`${w(113, 3, 4)} means “when”. In verse 3 it is followed by a past-tense verb, ${w(113, 3, 5)}, yet the meaning is “when it settles”. After this word Arabic often uses the past tense for something that is expected to happen.`
			),
			text(
				'Rare words',
				`The words for darkness, “it settles”, those who blow and an envier occur only here, so they have no card. They are explained under the verses.`
			),
			words('Six words to learn', ['falaq', 'khalaqa', 'ma', 'idha', 'uqda', 'hasada'])
		]
	},

	// --- Al-Kawthar (108) ---
	{
		id: 'kawthar',
		title: 'A gift and two commands',
		subtitle: 'Al-Kawthar, verses 1 to 3',
		ids: ['inna', 'ata', 'kawthar', 'salla'],
		intro: [
			verse(108, 1),
			verse(108, 2),
			verse(108, 3),
			text(
				'“Indeed”',
				`${w(108, 1, 1)} opens the surah with emphasis: “Indeed We…”. The ending is the pronoun “we”, attached to the word. In verse 3, ${w(108, 3, 1)} comes again, this time before “the one who hates you”.`
			),
			text(
				'Many parts in one word',
				`${w(108, 1, 2)} packs three parts into one word: the verb “gave”, “we” and “you”. Arabic often joins pronouns to the verb like this.`
			),
			text(
				'Two commands',
				`${w(108, 2, 1)} (“pray!”) and ${w(108, 2, 3)} (“sacrifice!”) are commands to one person. The root of “pray” returns in Al-Ma’un. ${w(108, 2, 3)}, ${w(108, 3, 2)} and ${w(108, 3, 4)} are rare words, so they have no card.`
			),
			words('Four words to learn', ['inna', 'ata', 'kawthar', 'salla'])
		]
	},

	// --- Al-Kafirun (109) ---
	{
		id: 'kafirun',
		title: 'Your religion and mine',
		subtitle: 'Al-Kafirun, verses 1 to 6',
		ids: ['ayy', 'kafir', 'la'],
		intro: [
			verse(109, 1),
			verse(109, 2),
			verse(109, 3),
			verse(109, 4),
			verse(109, 5),
			verse(109, 6),
			text(
				'A root you already know',
				`You met the root ${root('abada')} in Al-Fatiha, in “we worship” (${w(1, 5, 2)}). This surah uses it in many forms: ${w(109, 2, 2)} “I worship”, ${w(109, 2, 4)} “you worship”, ${w(109, 3, 3)} “worshippers” and ${w(109, 4, 5)} “you worshipped”.`
			),
			phrase(
				109,
				2,
				1,
				4,
				'I do not worship what you worship',
				'The surah says this in four ways: present and past, “I” and “you”.'
			),
			text(
				'“O you…”',
				`The call ${w(109, 1, 1)} begins with ${w(109, 1, 2)}, built from three parts: the calling word yā, ayy (“which”) and hā. You will meet “O you who believe” in many other places.`
			),
			text(
				'Religion',
				`In the last verse ${w(109, 6, 4)} means “religion”. It is the other meaning of the word you met in “Day of Judgement”.`
			),
			words('Three words to learn', ['ayy', 'kafir', 'la'])
		]
	},

	// --- An-Nasr (110) ---
	{
		id: 'nasr-1',
		title: 'Help and victory',
		subtitle: 'An-Nasr, verses 1 and 2',
		ids: ['jaa', 'nasr', 'fath', 'raa', 'dakhala', 'fawj'],
		intro: [
			verse(110, 1),
			verse(110, 2),
			phrase(
				110,
				1,
				3,
				4,
				'the help of Allah',
				'The same pattern again. The first noun has no ال, and Allah, in the genitive, ends in kasra.'
			),
			text(
				'Seeing, coming, entering',
				`${w(110, 2, 1)} (“and you see”) holds the verb you will meet again in Al-Ma’un and Al-Fil as “have you seen?”. The ending ـونَ on ${w(110, 2, 3)} means “they”: “they enter”.`
			),
			words('Six words to learn', ['jaa', 'nasr', 'fath', 'raa', 'dakhala', 'fawj'])
		]
	},
	{
		id: 'nasr-2',
		title: 'Glorify and ask forgiveness',
		subtitle: 'An-Nasr, verse 3',
		ids: ['sabbaha', 'istaghfara', 'tawwab'],
		intro: [
			verse(110, 3),
			text(
				'Two commands',
				`${w(110, 3, 1)} and ${w(110, 3, 4)} are commands: “glorify!” and “ask forgiveness!”. The ending ـهُ on the second one means “Him”. ${w(110, 3, 6)} is the verb “to be” from Al-Ikhlas, here saying that He has always been accepting of repentance.`
			),
			rule(
				'An intensive pattern',
				`${w(110, 3, 7)} has a doubled middle letter and a long ā. This pattern, faʿʿāl, often names someone who does a thing again and again. Its root is ${root('tawwab')}.`
			),
			words('Three words to learn', ['sabbaha', 'istaghfara', 'tawwab'])
		]
	},

	// --- Al-Masad (111) ---
	{
		id: 'masad-1',
		title: 'Ruined hands',
		subtitle: 'Al-Masad, verses 1 and 2',
		ids: ['yad', 'ab', 'lahab', 'aghna', 'mal', 'kasaba'],
		intro: [
			verse(111, 1),
			verse(111, 2),
			text(
				'Two of something',
				`${w(111, 1, 2)} means “the two hands of”. Arabic has a special form for exactly two of something, called the dual. Together with ${w(111, 1, 3)} ${w(111, 1, 4)}, literally “father of flame”, it makes an iḍāfa.`
			),
			text(
				'Endings that mean “his”',
				`${w(111, 2, 4)} is “his wealth”. The ending ـهُ means “his” on a noun and “him” on a verb, as in “ask His forgiveness” in An-Nasr. The verb ${w(111, 1, 1)} is rare, so it has no card.`
			),
			words('Six words to learn', ['yad', 'ab', 'lahab', 'aghna', 'mal', 'kasaba'])
		]
	},
	{
		id: 'masad-2',
		title: 'The fire',
		subtitle: 'Al-Masad, verses 3 to 5',
		ids: ['yasla', 'nar', 'dhu', 'imraa', 'habl'],
		intro: [
			verse(111, 3),
			verse(111, 4),
			verse(111, 5),
			rule(
				'Having',
				`${w(111, 3, 3)} ${w(111, 3, 4)} is “having flames”. The word comes from ${lexemeById('dhu').arabic}, “owner of, having”. It takes the feminine form here because “fire” is a feminine word.`
			),
			text(
				'His and her',
				`${w(111, 4, 1)} is “and his wife” and ${w(111, 5, 2)} is “her neck”. The ending ـهَا means “her”, as ـهُ means “his”.`
			),
			text(
				'Look-alike roots',
				`Do not confuse the verb ${w(111, 3, 1)} (“burns in”) with ṣallā (“prayed”) from Al-Kawthar. The roots look alike but are different. The words for carrier, firewood, neck and palm fibre are rare, so they have no card.`
			),
			words('Five words to learn', ['yasla', 'nar', 'dhu', 'imraa', 'habl'])
		]
	},

	// --- Quraysh (106) ---
	{
		id: 'quraysh',
		title: 'Food and safety',
		subtitle: 'Quraysh, verses 1 to 4',
		ids: ['dha', 'bayt', 'atama', 'ju', 'amana', 'khawf'],
		intro: [
			verse(106, 1),
			verse(106, 2),
			verse(106, 3),
			verse(106, 4),
			text(
				'Their and them',
				`The ending ـهُمْ means “their” on a noun and “them” on a verb: ${w(106, 2, 1)} is “their familiar security” and ${w(106, 4, 2)} is “fed them”.`
			),
			text(
				'Safety and faith',
				`${w(106, 4, 5)} is a verb that here means “made them safe”. The same verb also means “to believe”: the idea of safety and the idea of faith share one root. The words for the winter and summer journey, and the name Quraysh, have no card.`
			),
			words('Six words to learn', ['dha', 'bayt', 'atama', 'ju', 'amana', 'khawf'])
		]
	},

	// --- Al-Ma'un (107) ---
	{
		id: 'maun-1',
		title: 'Denying the Judgement',
		subtitle: 'Al-Ma’un, verses 1 to 3',
		ids: ['kadhdhaba', 'yatim', 'ala', 'taam', 'miskin'],
		intro: [
			verse(107, 1),
			verse(107, 2),
			verse(107, 3),
			text(
				'“That”',
				`${w(107, 2, 1)} means “that is (the one)”. It is built on the word you learned in Quraysh, with the letters ل and ك added to say “that” (far) rather than “this” (near).`
			),
			text(
				'Two words, one root',
				`${w(107, 3, 4)} (“food”) comes from the same root as “fed them” in Quraysh. The root is ${root('taam')}. The two verbs for pushing away and urging are rare, so they have no card.`
			),
			words('Five words to learn', ['kadhdhaba', 'yatim', 'ala', 'taam', 'miskin'])
		]
	},
	{
		id: 'maun-2',
		title: 'Careless prayer',
		subtitle: 'Al-Ma’un, verses 4 to 7',
		ids: ['wayl', 'musalli', 'salat', 'an', 'manaa'],
		intro: [
			verse(107, 4),
			verse(107, 5),
			verse(107, 6),
			verse(107, 7),
			text(
				'A family from one root',
				`${w(107, 4, 2)} (“those who pray”), ${w(107, 5, 4)} (“their prayer”) and ${w(108, 2, 1)} (“pray!”, from Al-Kawthar) share the root ${root('salat')}. Spotting the root lets you read all three.`
			),
			text(
				'A warning word',
				`${w(107, 4, 1)} opens a warning: “So woe…”. The words for heedless, show off and small help are rare, so they have no card.`
			),
			words('Five words to learn', ['wayl', 'musalli', 'salat', 'an', 'manaa'])
		]
	},

	// --- Al-Fil (105) ---
	{
		id: 'fil-1',
		title: 'Companions of the Elephant',
		subtitle: 'Al-Fil, verse 1',
		ids: ['kayfa', 'faala', 'ashab'],
		intro: [
			verse(105, 1),
			text(
				'“Your Lord”',
				`Small endings attach to words. ${w(105, 1, 5)} is “Lord” with ـكَ, “your”: “your Lord”. On a verb the same ending means “you”, as in ${w(108, 1, 2)} (“We gave you”) in Al-Kawthar.`
			),
			text(
				'A question that expects “yes”',
				`The first letter أ makes the sentence a question. With ${w(105, 1, 1)}, “have you not…?”, it asks something the listener already knows. The word for “the Elephant”, ${w(105, 1, 7)}, occurs only here, so it has no card.`
			),
			words('Three words to learn', ['kayfa', 'faala', 'ashab'])
		]
	},
	{
		id: 'fil-2',
		title: 'Plot and birds',
		subtitle: 'Al-Fil, verses 2 and 3',
		ids: ['jaala', 'kayd', 'arsala', 'tayr'],
		intro: [
			verse(105, 2),
			verse(105, 3),
			text(
				'Them and their again',
				`${w(105, 2, 3)} is “their plot” and ${w(105, 3, 2)} is “upon them”. The ending ـهُمْ becomes ـهِمْ after an i-sound.`
			),
			text(
				'“Did not” again',
				`${w(105, 2, 2)} (“make”) comes after ${w(105, 2, 1)} (“did He not”) and ends with a sukūn, just like the verbs in Al-Ikhlas.`
			),
			words('Four words to learn', ['jaala', 'kayd', 'arsala', 'tayr'])
		]
	},
	{
		id: 'fil-3',
		title: 'Stones of baked clay',
		subtitle: 'Al-Fil, verses 4 and 5',
		ids: ['rama', 'hijara', 'sijjil', 'asf'],
		intro: [
			verse(105, 4),
			verse(105, 5),
			text(
				'“Like”',
				`The small prefix ك means “like”, and it is joined to the noun: ${w(105, 5, 2)} is “like husks”. The last word of the surah, ${w(105, 5, 3)}, occurs only here.`
			),
			words('Four words to learn', ['rama', 'hijara', 'sijjil', 'asf'])
		]
	}
];

export const shortSurahsUnit: Unit = {
	id: 'short-surahs',
	title: 'The short surahs',
	description:
		'Ten short surahs from the end of the Quran, taught word by word. You may know several by heart already.',
	lessons: lessonSpecs.map((l): Lesson => ({
		id: l.id,
		unitId: 'short-surahs',
		title: l.title,
		subtitle: l.subtitle,
		kind: 'vocabulary',
		intro: l.intro,
		cardIds: l.ids.map(lexemeCardId),
		exercises: vocabularyExercises(l.ids, pool, rngFor(l.id))
	}))
};
