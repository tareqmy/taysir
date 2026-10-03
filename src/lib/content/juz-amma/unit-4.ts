import type { UnitSpec } from '../surah-lessons';

export const unitSpec: UnitSpec = {
	id: 'juz-amma-4',
	title: 'Juz Amma: Al-A’la to Al-Inshiqaq',
	description:
		'Four surahs, from the glorifying of the Lord Most High and the night-comer to the people of the trench and the splitting of the sky.',
	lessons: [
		// 87 Al-A'la
		{
			id: 'aala-1',
			title: 'Glorify the Most High',
			surah: 87,
			from: 1,
			to: 7,
			ids: ['qaddara', 'tansa', 'shaa', 'jahr', 'khafiya'],
			notes: [
				{
					type: 'rule',
					title: 'The ending -ka',
					body: 'The ending -ka speaks to one person. On a noun it means “your”, as in {87:1:3}, and on a verb it means “you”, as in {87:6:1}.'
				},
				{
					type: 'rule',
					title: 'Saying “will”',
					body: 'A short sa- at the start of a verb gives it the sense “will”. The verb {87:6:1} begins with sa- and means “We will make you recite”.'
				}
			]
		},
		{
			id: 'aala-2',
			title: 'The reminder and the fire',
			surah: 87,
			from: 8,
			to: 13,
			ids: ['nafaa', 'kubra', 'mata', 'hayya'],
			notes: [
				{
					type: 'text',
					title: 'One root, three words',
					body: 'The words {87:9:1}, {87:9:4} and {87:10:1} all come from the root {root:dhakara}, which is about remembering, mentioning and reminding.'
				}
			]
		},
		{
			id: 'aala-3',
			title: 'Success and the earlier scrolls',
			surah: 87,
			from: 14,
			to: 19,
			ids: ['dhakara', 'athara', 'dunya', 'abqa', 'ibrahim', 'musa'],
			notes: [
				{
					type: 'rule',
					title: '“More” and “most”',
					body: 'The word {87:17:3} “more lasting” has a pattern that is used for “more …” and “most …”. The words {87:1:4} “the Most High” and {87:11:2} “the most wretched” are built the same way.'
				}
			]
		},

		// 86 At-Tariq
		{
			id: 'tariq-1',
			title: 'The sky and the night-comer',
			surah: 86,
			from: 1,
			to: 4,
			ids: ['najm', 'lamma', 'hafiz'],
			notes: [
				{
					type: 'rule',
					title: 'wa- as “by”',
					body: 'At the start of a surah, wa- can mean “by”, as in an oath. In {86:1:1} it means “by”, so the word reads “by the sky”.'
				}
			]
		},
		{
			id: 'tariq-2',
			title: 'The human being’s creation',
			surah: 86,
			from: 5,
			to: 8,
			ids: ['mawh', 'kharaja', 'bayna', 'rajh', 'qadir'],
			notes: [
				{
					type: 'rule',
					title: 'Created: active and passive',
					body: 'The words {86:5:4} “he was created” and {87:2:2} “He created” come from the same root {root:khalaqa}. Only the vowels differ (khalaqa and khuliqa), and the change of vowels makes the verb passive.'
				}
			]
		},
		{
			id: 'tariq-3',
			title: 'The day secrets are tested',
			surah: 86,
			from: 9,
			to: 12,
			ids: ['balaa', 'quwwa', 'nasir']
		},
		{
			id: 'tariq-4',
			title: 'A decisive word and plots',
			surah: 86,
			from: 13,
			to: 17,
			ids: ['qawl', 'fasl', 'yakid']
		},

		// 85 Al-Buruj
		{
			id: 'buruj-1',
			title: 'The people of the trench',
			surah: 85,
			from: 1,
			to: 5,
			ids: ['buruj', 'shahid', 'mashhud', 'qatala', 'waqud'],
			notes: [
				{
					type: 'rule',
					title: 'Two words from one root',
					body: 'The words {85:3:1} “a witness” and {85:3:2} “one witnessed” come from the same root {root:shahid}. The first has the pattern for the one who does the action, and the second the pattern for the one to whom it is done.'
				}
			]
		},
		{
			id: 'buruj-2',
			title: 'Resenting the believers',
			surah: 85,
			from: 6,
			to: 8,
			ids: ['quud', 'mumin', 'naqama', 'aziz', 'hamid']
		},
		{
			id: 'buruj-3',
			title: 'Those who persecuted the believers',
			surah: 85,
			from: 9,
			to: 10,
			ids: ['shay', 'fatana', 'muminah', 'taba', 'hariq'],
			notes: [
				{
					type: 'rule',
					title: 'Masculine and feminine plural',
					body: 'The words {85:10:4} “the believing men” and {85:10:5} “the believing women” are the masculine and the feminine plural of the same word. Here the masculine plural ends in -īna and the feminine plural in -āt.'
				}
			]
		},
		{
			id: 'buruj-4',
			title: 'Gardens and the Lord’s grip',
			surah: 85,
			from: 11,
			to: 13,
			ids: ['fawz', 'kabir', 'batsh', 'yubdi', 'yuid']
		},
		{
			id: 'buruj-5',
			title: 'The Forgiving and the Loving',
			surah: 85,
			from: 14,
			to: 17,
			ids: ['ghafur', 'arsh', 'majid', 'arada', 'jund']
		},
		{
			id: 'buruj-6',
			title: 'Pharaoh, Thamud and a tablet',
			surah: 85,
			from: 18,
			to: 22,
			ids: ['waraa', 'muhit', 'quran', 'lawh']
		},

		// 84 Al-Inshiqaq
		{
			id: 'inshiqaq-1',
			title: 'The sky splits open',
			surah: 84,
			from: 1,
			to: 5,
			ids: ['inshaqqa', 'adhina', 'haqqa', 'madda', 'alqa'],
			notes: [
				{
					type: 'rule',
					title: 'Verbs ending in -at',
					body: 'Several verbs here end in -at: {84:1:3}, {84:2:1}, {84:3:3} and {84:4:1}. On a past-tense verb this ending means “she” or “it” for a feminine subject, and both “sky” and “earth” are feminine words in Arabic.'
				},
				{
					type: 'text',
					title: 'The same words twice',
					body: 'Verse 5 repeats the three words of verse 2: {84:2:1} {84:2:2} {84:2:3}. In {84:2:2} the ending -hā means “its” and points back to a feminine word.'
				}
			]
		},
		{
			id: 'inshiqaq-2',
			title: 'An easy account',
			surah: 84,
			from: 6,
			to: 9,
			ids: ['yamin', 'hasaba', 'yasir', 'inqalaba'],
			notes: [
				{
					type: 'text',
					title: '“As for …” and “then soon …”',
					body: 'The opening {84:7:1} “then as for …” is followed by {84:8:1} “then soon …”. The same two openings come again in verses 10 and 11, as {84:10:1} and {84:11:1}.'
				}
			]
		},
		{
			id: 'inshiqaq-3',
			title: 'The book behind the back',
			surah: 84,
			from: 10,
			to: 14,
			ids: ['thubur', 'sair', 'zanna']
		},
		{
			id: 'inshiqaq-4',
			title: 'Oaths and stage after stage',
			surah: 84,
			from: 15,
			to: 19,
			ids: ['bala', 'basir', 'rakiba', 'tabaq'],
			notes: [
				{
					type: 'rule',
					title: 'Emphasis at both ends',
					body: 'The verb {84:19:1} has an emphatic la- at the start and an emphatic -nna at the end. Together they give the sense “you will surely …”.'
				}
			]
		},
		{
			id: 'inshiqaq-5',
			title: 'Those who do not believe',
			surah: 84,
			from: 20,
			to: 25,
			ids: ['aalam', 'bashshara', 'aleem'],
			notes: [
				{
					type: 'text',
					title: 'A phrase you have met',
					body: 'The three words {84:25:3} {84:25:4} {84:25:5} (“believed and did the righteous deeds”) also appear in Al-Buruj, verse 11, as {85:11:3} {85:11:4} {85:11:5}.'
				}
			]
		}
	]
};
