import type { UnitSpec } from '../surah-lessons';

export const unitSpec: UnitSpec = {
	id: 'juz-amma-7',
	title: 'Juz Amma: An-Naba’',
	description:
		'Surah 78 in eight lessons: the great news, the world described as a sign, the Day of Decision and what follows it.',
	lessons: [
		{
			id: 'naba-1',
			title: 'The great news',
			surah: 78,
			from: 1,
			to: 5,
			ids: ['tasaala', 'naba', 'mukhtalif'],
			notes: [
				{
					type: 'text',
					title: 'Two words in one',
					body: 'The first word, {78:1:1}, is two small words joined together: ‘about’ and ‘what’.'
				},
				{
					type: 'rule',
					title: 'The prefix sa-',
					body: 'The little prefix sa- at the start of {78:4:2} puts a present-tense verb into the future: ‘they will know’. The same word is repeated in verse 5 as {78:5:3}.'
				}
			]
		},
		{
			id: 'naba-2',
			title: 'Earth, sleep and night',
			surah: 78,
			from: 6,
			to: 11,
			ids: ['mihad', 'zawj', 'nawm', 'libas'],
			notes: [
				{
					type: 'text',
					title: 'The ending -kum',
					body: 'The ending -kum means ‘you’ (more than one person) on a verb and ‘your’ on a noun. {78:8:1} is ‘and We created you’ and {78:9:2} is ‘your sleep’.'
				},
				{
					type: 'text',
					title: 'And We made',
					body: '{78:9:1} is wa- ‘and’ + the verb ‘made’ + -nā ‘We’. The same word begins verses 9, 10, 11 and 13.'
				}
			]
		},
		{
			id: 'naba-3',
			title: 'Sky, rain and plants',
			surah: 78,
			from: 12,
			to: 16,
			ids: ['fawq', 'sabaa', 'siraj', 'nabat'],
			notes: [
				{
					type: 'text',
					title: 'Two look-alikes',
					body: '{78:2:2} (‘the news’) and {78:15:4} (‘and vegetation’) look alike but have different roots: {root:naba} and {root:nabat}.'
				}
			]
		},
		{
			id: 'naba-4',
			title: 'The Day of Decision',
			surah: 78,
			from: 17,
			to: 20,
			ids: ['miqat', 'nafakha', 'sur', 'fataha', 'bab'],
			notes: [
				{
					type: 'rule',
					title: 'Passive verbs',
					body: 'Arabic shows the passive by changing the short vowels inside the verb. {78:18:2} ‘is blown’, {78:19:1} ‘was opened’ and {78:20:1} ‘were set moving’ are all passive: the one who does the action is not named.'
				},
				{
					type: 'text',
					title: 'The verb ‘to be’ again',
					body: '{78:17:4}, {78:19:3} and {78:20:3} are all forms of the verb kana, ‘to be’, with the root {root:kana}. You met it in Al-Ikhlas. The ending -at in {78:19:3} marks ‘she’ or ‘it’ (feminine).'
				}
			]
		},
		{
			id: 'naba-5',
			title: 'What awaits the transgressors',
			surah: 78,
			from: 21,
			to: 26,
			ids: ['taghi', 'maab', 'dhaqa', 'sharab', 'hamim'],
			notes: [
				{
					type: 'text',
					title: 'For the transgressors',
					body: '{78:22:1} is built from three parts: li- ‘for’, al- ‘the’ and the noun ‘transgressors’.'
				},
				{
					type: 'rule',
					title: 'The plural ending -īn',
					body: '{78:22:1} and {78:23:1} both end in -īn, a masculine plural ending. The same plural ends in -ūn when the word is in the nominative, as {78:3:4} (‘differing’) does.'
				}
			]
		},
		{
			id: 'naba-6',
			title: 'Denial and the record',
			surah: 78,
			from: 27,
			to: 30,
			ids: ['raja', 'ahsa', 'zada'],
			notes: [
				{
					type: 'text',
					title: 'One root, two words',
					body: '{78:28:1} (‘and they denied’) and {78:28:3} (‘with denial’) share the root {root:kadhdhaba}. You met the same verb in {107:1:3}.'
				},
				{
					type: 'text',
					title: 'A command and its ending',
					body: '{78:30:1} (‘so taste’) is a command from the same verb as {78:24:2} (‘they taste’). Its ending -ū means ‘you’ (more than one person), while the same ending on {78:28:1} means ‘they’.'
				}
			]
		},
		{
			id: 'naba-7',
			title: 'Success for the righteous',
			surah: 78,
			from: 31,
			to: 36,
			ids: ['muttaqi', 'atrab', 'kas', 'laghw', 'ataa'],
			notes: [
				{
					type: 'text',
					title: 'And not',
					body: '{78:35:5} is wa- ‘and’ + la ‘not’, written together. The same word appears in verse 24 as {78:24:5}.'
				},
				{
					type: 'phrase',
					surah: 78,
					ayah: 36,
					from: 2,
					to: 3,
					translation: 'from your Lord',
					note: 'The ending -ka on a noun means ‘your’ when speaking to one person (masculine).'
				}
			]
		},
		{
			id: 'naba-8',
			title: 'The true Day and warning',
			surah: 78,
			from: 37,
			to: 40,
			ids: ['khitab', 'takallama', 'ittakhadha', 'qarib', 'turab'],
			notes: [
				{
					type: 'text',
					title: 'A word seen before',
					body: '{78:39:9} is the same word as {78:22:2}, the card for ‘place of return’.'
				},
				{
					type: 'text',
					title: 'A shared root',
					body: '{78:40:15} (‘dust’) has the root {root:turab}, the same root as {78:33:2} (‘of equal age’), which you met in an earlier lesson.'
				}
			]
		}
	]
};
