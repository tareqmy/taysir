import type { UnitSpec } from '../surah-lessons';

export const unitSpec: UnitSpec = {
	id: 'juz-tabarak-3',
	title: 'The 29th juz: Nuh to Al-Haqqa',
	description:
		'Surahs 71, 70 and 69 in 23 lessons: Nuh calling his people, the Day when the sky is like molten metal and the believers who keep their trusts, and the Inevitable Reality.',
	lessons: [
		// 71 Nuh
		{
			id: 'nuh-1',
			title: 'Nuh warns his people',
			surah: 71,
			from: 1,
			to: 4,
			ids: ['nuh', 'qawm', 'qabl', 'ghafara', 'ajal'],
			notes: [
				{
					type: 'phrase',
					surah: 71,
					ayah: 2,
					from: 2,
					to: 6,
					translation: 'O my people, indeed I am a clear warner for you',
					note: 'The first word begins with ya-, which means ‘O’ and is used to call someone. The ending that means ‘my’ is only a short vowel here, so {71:2:2} is read yā qawmi.'
				},
				{
					type: 'text',
					title: 'A noun followed by a noun',
					body: '{71:4:10} {71:4:11} means ‘the term of Allah’: a noun followed by the noun it belongs to. The first noun does not take al- (‘the’) itself. You met the same pattern as ‘father of flame’, {111:1:3} {111:1:4}, in Al-Masad.'
				}
			]
		},
		{
			id: 'nuh-2',
			title: 'Night and day, openly and in secret',
			surah: 71,
			from: 5,
			to: 9,
			ids: ['duaa', 'kullama', 'udhun', 'alana', 'asarra'],
			notes: [
				{
					type: 'rule',
					title: 'The ending -tu',
					body: 'On a past-tense verb the ending -tu means ‘I’: {71:5:4} is ‘I called’, {71:9:3} is ‘I announced’ and {71:9:5} is ‘and I spoke in secret’. {71:7:3} adds the ending -hum (‘them’) after it: ‘I called them’. The same word appears again in verse 8.'
				},
				{
					type: 'text',
					title: 'Openly and in secret',
					body: 'Verse 8 says Nuh called ‘openly’ ({71:8:4}). Verse 9 says he both announced ({71:9:3}) and spoke in secret ({71:9:5}). The verb {71:9:5} and the noun {71:9:7} share the root {root:asarra}.'
				}
			]
		},
		{
			id: 'nuh-3',
			title: 'Ask forgiveness',
			surah: 71,
			from: 10,
			to: 14,
			ids: ['ghaffar', 'midrar', 'amadda'],
			notes: [
				{
					type: 'text',
					title: 'One root, three words',
					body: '{71:10:2} (‘ask forgiveness of’), {71:10:6} (‘ever-forgiving’) and {71:4:1} (‘He will forgive’) all come from the root {root:ghafara}. The doubled middle letter in {71:10:6} is the pattern for doing a thing again and again, like {110:3:7} in An-Nasr.'
				},
				{
					type: 'text',
					title: 'What follows the command',
					body: 'In verses 11 and 12 the verbs {71:11:1}, {71:12:1} and {71:12:4} all have y- at the start of the verb itself, the sign of ‘he’ in the present tense. {71:12:4} appears twice in verse 12. Each says what He will do: send, supply, make.'
				}
			]
		},
		{
			id: 'nuh-4',
			title: 'The heavens, the moon and the earth',
			surah: 71,
			from: 15,
			to: 20,
			ids: ['nur', 'bisat', 'fijaj'],
			notes: [
				{
					type: 'text',
					title: 'Sky and heavens',
					body: '{71:15:7} (‘heavens’) is the plural of the word {71:11:2} (‘the sky’). The number {71:15:6} (‘seven’) comes just before it.'
				},
				{
					type: 'text',
					title: 'The verb ‘made’ again',
					body: '{71:16:1} (which comes again as {71:16:5}) and {71:19:2} are forms of the verb you met as {78:9:1} (‘and We made’). Here it says what was made: the moon ‘a light’, the sun ‘a lamp’ and the earth ‘a carpet’.'
				}
			]
		},
		{
			id: 'nuh-5',
			title: 'They disobeyed and plotted',
			surah: 71,
			from: 21,
			to: 24,
			ids: ['khasar', 'makara', 'makr', 'kathir', 'dalal'],
			notes: [
				{
					type: 'text',
					title: 'A verb and its own noun',
					body: '{71:22:1} (‘and they plotted’) and {71:22:2} (‘a scheme’) come from the same root, {root:makara}. Placing a noun from the verb’s own root after it is a way to stress the action.'
				},
				{
					type: 'text',
					title: 'A list of five names',
					body: 'Verse 23 gives five names: {71:23:7}, {71:23:9}, {71:23:11}, {71:23:12} and {71:23:13}. They follow ‘do not leave’ ({71:23:3}) and are named alongside {71:23:4} (‘your gods’).'
				}
			]
		},
		{
			id: 'nuh-6',
			title: 'Drowned, and Nuh’s prayer',
			surah: 71,
			from: 25,
			to: 28,
			ids: ['khatia', 'ughriqa', 'kaffar', 'walidayn'],
			notes: [
				{
					type: 'text',
					title: 'Again and again',
					body: '{71:27:10} has a doubled middle letter and a long ā, like {71:10:6} (‘ever-forgiving’) and {110:3:7}. This pattern often names someone who does a thing again and again, or very much.'
				},
				{
					type: 'text',
					title: 'Two parents',
					body: 'Arabic has a special form for exactly two, called the dual. {71:28:4} (‘and for my two parents’) is a dual, with li- (‘for’) joined to the front and ‘my’ joined to the end.'
				}
			]
		},

		// 70 Al-Ma'arij
		{
			id: 'maarij-1',
			title: 'A punishment that will come',
			surah: 70,
			from: 1,
			to: 5,
			ids: ['dafi', 'maarij', 'araja', 'miqdar', 'sana'],
			notes: [
				{
					type: 'text',
					title: 'One root, two words',
					body: '{70:3:4} (‘the ways of ascent’) and {70:4:1} (‘ascend’) share the root {root:araja}.'
				},
				{
					type: 'text',
					title: 'A verb that comes first',
					body: '{70:4:1} begins with ta-, which marks ‘she’ or ‘it’, yet those who ascend are ‘the angels and the Spirit’ ({70:4:2}, {70:4:3}). When the verb comes before its doers, Arabic usually keeps it singular. Here we read it as ‘ascend’.'
				}
			]
		},
		{
			id: 'maarij-2',
			title: 'A day like molten metal',
			surah: 70,
			from: 6,
			to: 10,
			ids: ['baeed', 'muhl', 'ihn'],
			notes: [
				{
					type: 'text',
					title: 'Far and near',
					body: '{70:6:3} (‘far’) and {70:7:2} (‘near’) are opposites. {70:7:2} is the card ‘near, close’, which you met in An-Naba’.'
				},
				{
					type: 'text',
					title: 'One spelling, two meanings',
					body: '{70:10:3} and {70:10:4} are the same word as the card for ‘scalding water’ in An-Naba’ (verse 25). Here it means ‘close friend’. The verse tells you which meaning is meant.'
				}
			]
		},
		{
			id: 'maarij-3',
			title: 'Nothing to ransom with',
			surah: 70,
			from: 11,
			to: 14,
			ids: ['wadda', 'iftada', 'jamian', 'anja'],
			notes: [
				{
					type: 'text',
					title: 'What he would give',
					body: 'The criminal ‘would wish’ ({70:11:2}) that he could ransom himself ({70:11:5}) with his sons ({70:11:9}), his wife ({70:12:1}), his brother ({70:12:2}), his kin ({70:13:1}) and all who are on the earth ({70:14:4}). Each one after the first is joined to the one before it by wa- (‘and’).'
				}
			]
		},
		{
			id: 'maarij-4',
			title: 'The blazing flame and the restless human',
			surah: 70,
			from: 15,
			to: 21,
			ids: ['awaa', 'halu', 'massa', 'jazu', 'manu'],
			notes: [
				{
					type: 'text',
					title: 'Two matching verses',
					body: 'Verses 20 and 21 mirror each other. Both begin with ‘when’ and use the same verb, {70:20:2} (‘touches him’), once with {70:20:3} (‘the harm’) and once with {70:21:3} (‘the good’).'
				},
				{
					type: 'text',
					title: 'Words that describe the human being',
					body: '{70:19:4}, {70:20:4} and {70:21:4} (‘anxious’, ‘impatient’, ‘withholding’) all describe the human being, {70:19:2}. All three end in -an.'
				}
			]
		},
		{
			id: 'maarij-5',
			title: 'Those who pray',
			surah: 70,
			from: 22,
			to: 28,
			ids: ['daim', 'mahrum', 'mushfiq', 'mamun'],
			notes: [
				{
					type: 'text',
					title: 'Those who …',
					body: 'The surah now describes people by what they do. Each description begins with ‘those who’: {70:23:1} in verse 23, then {70:24:1} (‘and those who’) in verses 24, 26 and 27, and again in verses 29, 32, 33 and 34.'
				},
				{
					type: 'text',
					title: 'Words you have met',
					body: '{70:22:2} is the card for ‘one who prays’, from Al-Ma’un, and {70:23:4} (‘their prayer’) is the same word as in verse 5 of Al-Ma’un. {70:26:2} (‘they confirm the truth of’) has the same root as {92:6:1} in Al-Layl, and {70:26:4} (‘the Judgement’) is the word from Al-Fatiha.'
				}
			]
		},
		{
			id: 'maarij-6',
			title: 'Trusts, pledges and testimony',
			surah: 70,
			from: 29,
			to: 35,
			ids: ['farj', 'amanah', 'ahd', 'shahada', 'qaim'],
			notes: [
				{
					type: 'text',
					title: 'Guarding',
					body: '{70:29:4} (‘guardians’) and {70:34:5} (‘they guard’) come from the same root, {root:hafiz}. {70:29:4} is a plural of the word ‘guardian’ that you learned in At-Tariq, {86:4:6}.'
				},
				{
					type: 'text',
					title: 'Their right hands',
					body: '{70:30:7} (‘their right hands’) is a plural of the word for ‘right hand’, which is {70:37:2} in the singular. The words {70:30:5} {70:30:6} {70:30:7} make a set expression, ‘what their right hands possess’.'
				}
			]
		},
		{
			id: 'maarij-7',
			title: 'The disbelievers and the oath',
			surah: 70,
			from: 36,
			to: 41,
			ids: ['qibal', 'muhti', 'shimal', 'masbuq'],
			notes: [
				{
					type: 'text',
					title: 'Right and left',
					body: '{70:37:2} (‘the right’) and {70:37:4} (‘the left’) are opposites. Each follows the word for ‘from’, which is repeated: {70:37:1} and {70:37:3}.'
				},
				{
					type: 'text',
					title: '‘So no, I swear’',
					body: '{70:40:1} (‘so no’) comes right before {70:40:2} (‘I swear’). The same two words open verse 16 of Al-Inshiqaq. A later grammar lesson teaches oaths.'
				}
			]
		},
		{
			id: 'maarij-8',
			title: 'Leave them until that Day',
			surah: 70,
			from: 42,
			to: 44,
			ids: ['laiba', 'yulaqi', 'sira', 'dhilla'],
			notes: [
				{
					type: 'text',
					title: 'The same words again',
					body: 'The surah ends by repeating words from verse 42: {70:42:7} {70:42:8} (‘which they are promised’) returns in verse 44, ‘the day which they were promised’. The verb is passive: the one who promises is not named.'
				},
				{
					type: 'text',
					title: 'A plural of things',
					body: '{70:44:2} (‘their eyes’) is a plural, yet the word that describes it, {70:44:1} (‘humbled’), is a feminine singular. A plural of things is often treated as a feminine singular.'
				}
			]
		},

		// 69 Al-Haqqa
		{
			id: 'haqqa-1',
			title: 'The Inevitable Reality',
			surah: 69,
			from: 1,
			to: 6,
			ids: ['haqqah', 'rih', 'sarsar'],
			notes: [
				{
					type: 'text',
					title: 'A name, a question, a bigger question',
					body: 'Verses 1 to 3 name something, ask what it is, then ask ‘and what will make you know what it is?’. The same pattern opens {101:1:1} (‘the Striking Calamity’). Here the word is {69:1:1}.'
				},
				{
					type: 'text',
					title: 'Names you have met',
					body: '{69:4:2} is Thamud and {69:4:3} is Aad, the two peoples you met in Ash-Shams and Al-Fajr. {69:4:4} is the Striking Calamity again, the word {101:1:1} with bi- (‘with’) in front.'
				}
			]
		},
		{
			id: 'haqqa-2',
			title: 'Seven nights and eight days',
			surah: 69,
			from: 7,
			to: 10,
			ids: ['sakhkhara', 'thamaniya', 'khawiya', 'baqiya'],
			notes: [
				{
					type: 'rule',
					title: 'Numbers take the opposite gender',
					body: 'A number from three to ten takes the opposite gender to the thing it counts. {69:7:3} (‘seven’) has no feminine ending, although ‘nights’ ({69:7:4}) is a feminine word. {69:7:5} (‘eight’) has the feminine ending, although ‘days’ ({69:7:6}) is a masculine word.'
				}
			]
		},
		{
			id: 'haqqa-3',
			title: 'The ship, the blast and the split sky',
			surah: 69,
			from: 11,
			to: 16,
			ids: ['hamala', 'waa', 'nafkha', 'dukka', 'waqaa'],
			notes: [
				{
					type: 'text',
					title: 'An ending for two',
					body: 'Arabic has a special ending for exactly two things, called the dual; you met it in {111:1:2} (‘the two hands of’). The verb {69:14:4} ends in -tā, the dual ending for ‘the two of them’ (feminine): the earth and the mountains, named together in this verse, are both crushed. A later grammar lesson teaches the dual past tense in full.'
				},
				{
					type: 'text',
					title: 'The verb ‘to carry’',
					body: '{69:11:5} (‘We carried you’) and {69:14:1} (‘and are carried’) are the same verb. In {69:14:1} it is passive: the vowels inside the verb change and the one who carries is not named. {69:17:4} uses it again, in the active.'
				}
			]
		},
		{
			id: 'haqqa-4',
			title: 'Presented before the Lord',
			surah: 69,
			from: 17,
			to: 20,
			ids: ['arja', 'aradha', 'khafiyah'],
			notes: [
				{
					type: 'text',
					title: 'The ending that means ‘my’',
					body: '{69:19:9} (‘my book’) and {69:20:5} (‘my reckoning’) end in -iyah. This ending means ‘my’. The final h only helps the reader pause. You will see it again in verses 25 to 29.'
				},
				{
					type: 'text',
					title: 'A passive verb',
					body: '{69:19:3} (‘is given’) is passive: the vowels inside the verb change and the giver is not named.'
				}
			]
		},
		{
			id: 'haqqa-5',
			title: 'A pleasant life',
			surah: 69,
			from: 21,
			to: 24,
			ids: ['isha', 'aliya', 'aslafa', 'khaliya'],
			notes: [
				{
					type: 'text',
					title: 'A plural of things, a feminine singular',
					body: '{69:23:1} (‘its fruits’) is a plural, yet the word that describes it, {69:23:2} (‘within reach’), is a feminine singular. The same is true of {69:24:7} (‘the days’) and {69:24:8} (‘gone by’).'
				},
				{
					type: 'text',
					title: 'Commands ending in -ū',
					body: '{69:24:1} (‘eat’) and {69:24:2} (‘and drink’) are commands. Each ends in -ū, which means ‘you’ (more than one person).'
				}
			]
		},
		{
			id: 'haqqa-6',
			title: 'The book in the left hand',
			surah: 69,
			from: 25,
			to: 29,
			ids: ['qadiya', 'halaka', 'sultan'],
			notes: [
				{
					type: 'text',
					title: '‘If only’',
					body: '{69:25:7} and {69:27:1} both begin with ya- (‘O’) and layta (‘if only’), the word you met in Al-Fajr. After layta, an attached ending is the subject: -nī means ‘I’ in {69:25:7} and -hā means ‘it’ in {69:27:1}.'
				},
				{
					type: 'text',
					title: 'Like a verse you know',
					body: 'Verse 28 is built like {111:2:1} {111:2:2} {111:2:3} {111:2:4} in Al-Masad, with ‘me’ and ‘my’ in place of ‘him’ and ‘his’: {69:28:1} {69:28:2} {69:28:3} {69:28:4}.'
				}
			]
		},
		{
			id: 'haqqa-7',
			title: 'Fetter him',
			surah: 69,
			from: 30,
			to: 37,
			ids: ['ghalla', 'dhira', 'hadda', 'huna'],
			notes: [
				{
					type: 'text',
					title: 'Four commands',
					body: '{69:30:1}, {69:30:2}, {69:31:3} and {69:32:7} are commands. Each ends in -ū (‘you’, more than one person) followed by -hu (‘him’): ‘seize him’, ‘then fetter him’, ‘burn him’, ‘then insert him’.'
				},
				{
					type: 'text',
					title: 'A verse you know',
					body: 'Verse 34 uses the same five words as verse 3 of Al-Ma’un.'
				}
			]
		},
		{
			id: 'haqqa-8',
			title: 'Not the word of a poet',
			surah: 69,
			from: 38,
			to: 44,
			ids: ['absara', 'shair', 'kahin', 'taqawwala', 'badh'],
			notes: [
				{
					type: 'text',
					title: '‘So no, I swear’ again',
					body: 'Verse 38 opens with the same two words as verse 40 of Al-Ma’arij: ‘so no’ and ‘I swear’. The same verb, {69:38:4} (‘you see’), is used in verses 38 and 39; in verse 39 it is made negative with {69:39:2} (‘not’).'
				},
				{
					type: 'text',
					title: '‘If … then …’',
					body: 'Verse 44 begins with {69:44:1} (‘and if’). The answer comes in the next two verses, and each answer verb begins with la- (‘surely’): {69:45:1} and {69:46:2}, ‘We would surely have seized’ and ‘We would surely have cut’. A later grammar lesson teaches conditions.'
				}
			]
		},
		{
			id: 'haqqa-9',
			title: 'The certain truth',
			surah: 69,
			from: 45,
			to: 52,
			ids: ['qutia', 'hajiz', 'hasra'],
			notes: [
				{
					type: 'text',
					title: 'Three ‘and indeed it’ verses',
					body: 'Verses 48, 50 and 51 each begin with {69:48:1} (‘and indeed it’), which is wa- + inna + -hu. In each, the next word begins with la- (‘surely’): {69:48:2}, {69:50:2} and {69:51:2}.'
				},
				{
					type: 'text',
					title: 'Words you have met',
					body: 'Four cards you know return here: ‘reminder’ in {69:48:2} (also in Abasa), ‘righteous’ in {69:48:3} (also in An-Naba’), ‘truth’ in {69:51:2} (also in Al-Asr) and ‘certainty’ in {69:51:3} (also in At-Takathur).'
				}
			]
		}
	]
};
