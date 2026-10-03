import { formatRoot, lexemeById, lexicon, wordText } from '../data';
import { rngFor } from '../random';
import { letterCardId, lexemeCardId } from './cards';
import {
	ar,
	buildPhrase,
	en,
	handChoice,
	letterExercises,
	rootExercises,
	vocabularyExercises
} from './exercises';
import { shortSurahsUnit } from './short-surahs';
import type { Block, Lesson, Unit } from './types';

/** Text of word `n` in a verse of Al-Fatiha, straight from the corpus data. */
const word = (ayah: number, n: number) => wordText(1, ayah, n);

// --- Unit 1: Letters --------------------------------------------------------

const letterGroups: {
	id: string;
	title: string;
	subtitle: string;
	ids: string[];
	intro?: Block[];
}[] = [
	{
		id: 'letters-1',
		title: 'Alif and the bā’ family',
		subtitle: 'Six letters to start',
		ids: ['alif', 'ba', 'ta', 'tha', 'nun', 'ya'],
		intro: [
			{
				type: 'text',
				title: 'Arabic runs right to left',
				body: 'Arabic is written and read from right to left. Letters join to each other inside a word, so most letters have up to four shapes: on its own, at the start, in the middle and at the end. You will see all of them.'
			},
			{
				type: 'text',
				title: 'One shape, different dots',
				body: 'bā’, tā’, thā’, nūn and yā’ share nearly the same body. Only the dots tell them apart: one dot below, two above, three above, one above, two below.'
			}
		]
	},
	{
		id: 'letters-2',
		title: 'The jīm family',
		subtitle: 'Three throaty letters',
		ids: ['jim', 'ha', 'kha'],
		intro: [
			{
				type: 'text',
				title: 'Same body, new sounds',
				body: 'These three share one shape and differ by a dot: one below for jīm, none for ḥā’, one above for khā’. ḥā’ and khā’ come from the throat, so listen closely.'
			}
		]
	},
	{
		id: 'letters-3',
		title: 'Letters that stop',
		subtitle: 'They never join forward',
		ids: ['dal', 'dhal', 'ra', 'zay', 'waw'],
		intro: [
			{
				type: 'text',
				title: 'Six letters never join to the next one',
				body: 'alif, dāl, dhāl, rā’, zāy and wāw join to the letter before them but never to the letter after. The next letter starts fresh. That is why they have only two shapes.'
			}
		]
	},
	{
		id: 'letters-4',
		title: 'Sīn, shīn, ṣād and ḍād',
		subtitle: 'Light and heavy sounds',
		ids: ['sin', 'shin', 'sad', 'dad'],
		intro: [
			{
				type: 'text',
				title: 'Light and heavy',
				body: 'ṣād and ḍād are the “heavy” cousins of sīn and dāl. Say them with the back of the tongue raised, and the vowel next to them sounds deeper. This matters a lot in the Quran.'
			}
		]
	},
	{
		id: 'letters-5',
		title: 'Ṭā’, ẓā’, ʿayn and ghayn',
		subtitle: 'The deepest sounds',
		ids: ['tah', 'zah', 'ayn', 'ghayn'],
		intro: [
			{
				type: 'text',
				title: 'More heavy letters, and two from the throat',
				body: 'ṭā’ and ẓā’ are heavy like ṣād and ḍād. ʿayn and ghayn come from deep in the throat. ʿayn has no English equivalent, so lean on the audio and be patient with it.'
			}
		]
	},
	{
		id: 'letters-6',
		title: 'The rest of the alphabet',
		subtitle: 'Six more to finish',
		ids: ['fa', 'qaf', 'kaf', 'lam', 'mim', 'heh'],
		intro: [
			{
				type: 'text',
				title: 'Nearly there',
				body: 'qāf is a deep “k” from the back of the throat, and kāf is the ordinary “k”. Many learners mix these two up, so look at them side by side.'
			}
		]
	}
];

const lettersUnit: Unit = {
	id: 'letters',
	title: 'Letters and sounds',
	description: 'Read and recognise all 28 letters.',
	skippableForReaders: true,
	lessons: letterGroups.map((g): Lesson => ({
		id: g.id,
		unitId: 'letters',
		title: g.title,
		subtitle: g.subtitle,
		kind: 'letters',
		intro: [...(g.intro ?? []), { type: 'letters', ids: g.ids }],
		cardIds: g.ids.map(letterCardId),
		exercises: letterExercises(g.ids, rngFor(g.id))
	}))
};

// --- Unit 2: Words of Al-Fatiha ---------------------------------------------

const pool = lexicon.lexemes;

const vocabLessons: {
	id: string;
	title: string;
	subtitle: string;
	ids: string[];
	intro: Block[];
}[] = [
	{
		id: 'fatiha-1',
		title: 'Allah, Lord, mercy',
		subtitle: 'Verses 1 and 2',
		ids: ['allah', 'rabb', 'rahman', 'rahim', 'hamd'],
		intro: [
			{
				type: 'text',
				title: 'Meet Al-Fatiha',
				body: 'Al-Fatiha is the opening chapter of the Quran, recited in every prayer. You may already know it by heart. Now you will learn what each word means, starting with the first two verses.'
			},
			{
				type: 'verse',
				surah: 1,
				ayah: 1,
				note: 'Tap a word to hear it. Under each word is its meaning.'
			},
			{ type: 'verse', surah: 1, ayah: 2 },
			{
				type: 'lexemes',
				title: 'Five words to learn',
				ids: ['allah', 'rabb', 'rahman', 'rahim', 'hamd']
			}
		]
	},
	{
		id: 'fatiha-2',
		title: 'Name, day, judgement',
		subtitle: 'Verses 1 to 4',
		ids: ['ism', 'yawm', 'din', 'maalik', 'alam'],
		intro: [
			{ type: 'verse', surah: 1, ayah: 3 },
			{
				type: 'verse',
				surah: 1,
				ayah: 4,
				note: 'Here is a new pattern: “Master of the Day of Judgement”.'
			},
			{ type: 'lexemes', title: 'Five more words', ids: ['ism', 'yawm', 'din', 'maalik', 'alam'] }
		]
	},
	{
		id: 'fatiha-3',
		title: 'Worship and guidance',
		subtitle: 'Verses 5 and 6',
		ids: ['abada', 'hada', 'sirat', 'mustaqim'],
		intro: [
			{ type: 'verse', surah: 1, ayah: 5 },
			{ type: 'verse', surah: 1, ayah: 6 },
			{
				type: 'text',
				title: 'Verbs change form',
				body: `In the verse, the verb appears as ${word(5, 2)} (“we worship”). The card shows the dictionary form, which is the basic form you would look up. Learning the dictionary form first helps you recognise all the others.`
			},
			{ type: 'lexemes', title: 'Four words to learn', ids: ['abada', 'hada', 'sirat', 'mustaqim'] }
		]
	},
	{
		id: 'fatiha-4',
		title: 'The two paths',
		subtitle: 'Verse 7',
		ids: ['anama', 'ghayr', 'maghdub', 'dall'],
		intro: [
			{ type: 'verse', surah: 1, ayah: 7 },
			{
				type: 'lexemes',
				title: 'Four words from the last verse',
				ids: ['anama', 'ghayr', 'maghdub', 'dall']
			}
		]
	}
];

const fatihaUnit: Unit = {
	id: 'fatiha',
	title: 'The words of Al-Fatiha',
	description: 'Learn the opening chapter word by word, with real recitation.',
	lessons: vocabLessons.map((l): Lesson => ({
		id: l.id,
		unitId: 'fatiha',
		title: l.title,
		subtitle: l.subtitle,
		kind: 'vocabulary',
		intro: l.intro,
		cardIds: l.ids.map(lexemeCardId),
		exercises: vocabularyExercises(l.ids, pool, rngFor(l.id))
	}))
};

// --- Unit 3: Roots ----------------------------------------------------------

const rootLessons: { id: string; root: string; ids: string[]; body: string }[] = [
	{
		id: 'root-rhm',
		root: 'رحم',
		ids: ['rahman', 'rahim', 'rahma', 'rahima'],
		body: 'Raḥmān and raḥīm from the first verse share a root with raḥma, “mercy”. The root carries the core meaning, and the pattern around it tells you the kind of word.'
	},
	{
		id: 'root-elm',
		root: 'علم',
		ids: ['alima', 'alim', 'ilm', 'allama', 'alam'],
		body: 'Knowing, the all-knowing, knowledge and teaching are one family. Even ʿālam (“world”) comes from this root.'
	},
	{
		id: 'root-abd',
		root: 'عبد',
		ids: ['abada', 'abd', 'abid', 'ibada'],
		body: 'To worship, a servant, a worshipper and worship itself. You met the verb in “we worship You alone”.'
	},
	{
		id: 'root-mlk',
		root: 'ملك',
		ids: ['maalik', 'malik', 'mulk', 'malak'],
		body: 'Owner, king, dominion and even angel share this root. Seeing the family helps you remember all four.'
	}
];

const allRoots = [...new Set(rootLessons.map((l) => l.root))];

const rootsUnit: Unit = {
	id: 'roots',
	title: 'The root system',
	description: 'Arabic words grow from three-letter roots. Learn one root and you learn a family.',
	lessons: rootLessons.map((l): Lesson => ({
		id: l.id,
		unitId: 'roots',
		title: `The root ${formatRoot(l.root)}`,
		subtitle: lexemeById(l.ids[0]).gloss,
		kind: 'roots',
		intro: [
			...(l.id === 'root-rhm'
				? ([
						{
							type: 'text',
							title: 'Most Arabic words come from a root',
							body: 'A root is usually three consonants that carry a core idea. Add vowels, prefixes and patterns and you get a whole family of related words. Spotting the root is the fastest way to grow your vocabulary in the Quran.'
						}
					] satisfies Block[])
				: []),
			{ type: 'root', root: l.root, ids: l.ids, body: l.body }
		],
		cardIds: l.ids.map(lexemeCardId),
		exercises: rootExercises(l.ids, pool, allRoots, rngFor(l.id))
	}))
};

// --- Unit 4: Grammar --------------------------------------------------------

const definiteRng = rngFor('grammar-definite');
const idafaRng = rngFor('grammar-idafa');

const grammarUnit: Unit = {
	id: 'grammar',
	title: 'Grammar in Al-Fatiha',
	description: 'Two core ideas, learned from real verses.',
	lessons: [
		{
			id: 'grammar-definite',
			unitId: 'grammar',
			title: 'The word “the”',
			subtitle: 'The definite article ال',
			kind: 'grammar',
			intro: [
				{
					type: 'rule',
					title: 'One word for “the”',
					body: 'Arabic has a single word for “the”: ال. It is written attached to the front of the noun. There is no word for “a”. A bare noun is usually indefinite, with a few exceptions you will meet in the next lesson.'
				},
				{
					type: 'phrase',
					surah: 1,
					ayah: 1,
					from: 3,
					to: 4,
					translation: 'the Most Gracious, the Most Merciful',
					split: true,
					note: 'Each word is split into ال and the noun it belongs to.'
				},
				{
					type: 'rule',
					title: 'Sun letters and moon letters',
					body: 'Listen to the first word: it is said ar-Raḥmān, not al-Raḥmān. The ل of ال melts into the next letter when it is a “sun letter” (such as ر, د, س, ن, ص). The next letter is doubled, and the mark that shows this is the shadda ّ. With a “moon letter” (such as ح, م, ع, ب), the ل stays and is pronounced.'
				},
				{
					type: 'phrase',
					surah: 1,
					ayah: 2,
					from: 1,
					to: 1,
					translation: 'the praise',
					split: true,
					note: 'ح is a moon letter, so you hear al-ḥamd, with the ل clearly pronounced.'
				}
			],
			cardIds: [],
			exercises: [
				handChoice(
					'definite-1',
					'Which word starts with ال, “the”?',
					undefined,
					ar(word(6, 2)),
					[ar(word(2, 3)), ar(word(4, 2))],
					`${word(6, 2)} is “the path”. The other two words have no ال.`,
					definiteRng
				),
				handChoice(
					'definite-2',
					'Which word means “the worlds”?',
					undefined,
					ar(word(2, 4)),
					[ar(word(2, 3)), ar(word(4, 1))],
					`${word(2, 4)} is “the worlds”: ال plus the noun.`,
					definiteRng
				),
				handChoice(
					'definite-3',
					'Is the ل of ال pronounced in this word?',
					ar(word(1, 3)),
					en('No: it melts into ر, so it is said ar-Raḥmān'),
					[en('Yes: it is said al-Raḥmān')],
					'ر is a sun letter, so the ل is absorbed and ر is doubled, shown by the shadda.',
					definiteRng
				),
				handChoice(
					'definite-4',
					'Is the ل of ال pronounced in this word?',
					ar(word(2, 1)),
					en('Yes: it is said al-ḥamd'),
					[en('No: it melts into ح, so it is said aḥ-ḥamd')],
					'ح is a moon letter, so the ل stays. The small mark on the ل shows it is pronounced.',
					definiteRng
				),
				handChoice(
					'definite-5',
					'Which word has a shadda on its first letter after ال, showing a sun letter?',
					undefined,
					ar(word(1, 4)),
					[ar(word(2, 1)), ar(word(2, 4))],
					'ر is a sun letter, so it is doubled. ح and ع are moon letters.',
					definiteRng
				)
			]
		},
		{
			id: 'grammar-idafa',
			unitId: 'grammar',
			title: 'One noun owning another',
			subtitle: 'The iḍāfa construction',
			kind: 'grammar',
			intro: [
				{
					type: 'rule',
					title: 'X of Y without the word “of”',
					body: 'Put two nouns side by side and you get “X of Y”. This is called an iḍāfa. The first noun never takes ال. The second noun finishes the idea and is in the genitive case, which usually shows as the “-i” sound (kasra).'
				},
				{
					type: 'phrase',
					surah: 1,
					ayah: 2,
					from: 3,
					to: 4,
					translation: 'Lord of the worlds',
					split: true,
					note: 'The first noun has no ال. The second noun carries ال and is genitive (here shown by the plural ending -īna).'
				},
				{
					type: 'phrase',
					surah: 1,
					ayah: 4,
					from: 1,
					to: 3,
					translation: 'Master of the Day of Judgement',
					note: 'These can chain: Master of → Day of → Judgement. The middle noun is the second part of one pair and the first part of the next, so it has no ال.'
				},
				{
					type: 'text',
					title: 'One detail to notice',
					body: 'The second noun is always genitive. The first noun’s ending depends on its job in the sentence, so it can change. You will see this later in the Quran.'
				}
			],
			cardIds: [],
			exercises: [
				buildPhrase(
					'idafa-1',
					'Lord of the worlds',
					[word(2, 3), word(2, 4)],
					[word(4, 2)],
					`${word(2, 3)} ${word(2, 4)}: the first noun, then the second.`,
					idafaRng
				),
				buildPhrase(
					'idafa-2',
					'Master of the Day of Judgement',
					[word(4, 1), word(4, 2), word(4, 3)],
					[word(2, 3)],
					`${word(4, 1)} ${word(4, 2)} ${word(4, 3)}: each noun belongs to the next.`,
					idafaRng
				),
				handChoice(
					'idafa-3',
					'Which of these must NOT take ال?',
					undefined,
					ar(word(2, 3)),
					[ar(word(2, 4))],
					`${word(2, 3)} is the first noun of an iḍāfa, so it never takes ال.`,
					idafaRng
				),
				handChoice(
					'idafa-4',
					'Which ending does the second noun of an iḍāfa usually have?',
					undefined,
					en('-i (kasra)'),
					[en('-u (ḍamma)'), en('-a (fatḥa)')],
					`The second noun is in the genitive case, which usually ends in -i, as in ${word(4, 3)}.`,
					idafaRng
				),
				handChoice(
					'idafa-5',
					'What does this phrase mean?',
					ar(`${word(2, 3)} ${word(2, 4)}`),
					en('Lord of the worlds'),
					[en('The Lord and the worlds'), en('The Lord is the world')],
					'Two nouns side by side with no “and” and no “is” make “X of Y”.',
					idafaRng
				)
			]
		}
	]
};

// --- Whole course -----------------------------------------------------------

export const units: Unit[] = [lettersUnit, fatihaUnit, rootsUnit, grammarUnit, shortSurahsUnit];

export const lessons: Lesson[] = units.flatMap((u) => u.lessons);

const lessonMap = new Map(lessons.map((l) => [l.id, l]));

export function lessonById(id: string): Lesson | undefined {
	return lessonMap.get(id);
}

export function unitOfLesson(lesson: Lesson): Unit {
	return units.find((u) => u.id === lesson.unitId)!;
}

/** Ids of lessons a reader can skip (the alphabet). */
export const readerSkippedLessonIds = lessons
	.filter((l) => units.find((u) => u.id === l.unitId)?.skippableForReaders)
	.map((l) => l.id);
