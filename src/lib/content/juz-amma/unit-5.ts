import type { UnitSpec } from '../surah-lessons';

export const unitSpec: UnitSpec = {
	id: 'juz-amma-5',
	title: 'Juz Amma: Al-Mutaffifin to At-Takwir',
	description:
		'Surahs 83, 82 and 81 in thirteen lessons: those who give short measure, the sky splitting open, and the sun being wrapped up.',
	lessons: [
		{
			id: 'mutaffifin-1',
			title: 'Giving short measure',
			surah: 83,
			from: 1,
			to: 6,
			ids: ['wazana', 'mabuth', 'azim', 'qama'],
			notes: [
				{
					type: 'rule',
					title: 'The ending -hum',
					body: 'The ending -hum means ‘them’ on a verb and ‘their’ on a noun. {83:3:2} is ‘they measure for them’ and {83:3:4} is ‘they weigh for them’.'
				}
			]
		},
		{
			id: 'mutaffifin-2',
			title: 'The record of the wicked',
			surah: 83,
			from: 7,
			to: 13,
			ids: ['fujjar', 'mukadhdhib', 'mutadi', 'athim', 'asatir'],
			notes: [
				{
					type: 'phrase',
					surah: 83,
					ayah: 8,
					from: 1,
					to: 4,
					translation: 'And what will make you know what Sijjin is?',
					note: 'The same question returns in verse 19, and twice in Al-Infitar (verses 17 and 18).'
				}
			]
		},
		{
			id: 'mutaffifin-3',
			title: 'The veiled and the righteous',
			surah: 83,
			from: 14,
			to: 22,
			ids: ['qalb', 'barr', 'shahida', 'muqarrab'],
			notes: [
				{
					type: 'text',
					title: 'Nay',
					body: '{83:14:1} (‘nay’) begins verses 14, 15 and 18 here, and verse 7 in the previous lesson.'
				},
				{
					type: 'rule',
					title: 'Two endings for one word',
					body: '{83:18:6} and {83:19:4} are the same word with two different endings. A masculine plural ends in -īna after a preposition such as {83:18:5} (‘surely in’) and in -ūna when it is the subject or predicate, as in the next verse.'
				}
			]
		},
		{
			id: 'mutaffifin-4',
			title: 'The drink of the righteous',
			surah: 83,
			from: 23,
			to: 28,
			ids: ['araik', 'arafa', 'asqa', 'mizaj', 'shariba']
		},
		{
			id: 'mutaffifin-5',
			title: 'Laughing at the believers',
			surah: 83,
			from: 29,
			to: 36,
			ids: ['ajrama', 'dahika', 'marra'],
			notes: [
				{
					type: 'text',
					title: 'A plural of kafir',
					body: '{83:34:5} is a plural of the word for ‘disbeliever’ that you met in Al-Kafirun as {109:1:3}.'
				}
			]
		},
		{
			id: 'infitar-1',
			title: 'When the sky splits open',
			surah: 82,
			from: 1,
			to: 5,
			ids: ['kawkab', 'bahr', 'fujjirat', 'akhkhara']
		},
		{
			id: 'infitar-2',
			title: 'The Lord who created you',
			surah: 82,
			from: 6,
			to: 10,
			ids: ['gharra', 'karim', 'adala', 'sura'],
			notes: [
				{
					type: 'rule',
					title: 'The ending -ka',
					body: 'The ending -ka means ‘you’ (one person) on a verb and ‘your’ on a noun. {82:6:4} is ‘deceived you’, {82:7:2} is ‘created you’ and {82:6:5} is ‘about your Lord’.'
				}
			]
		},
		{
			id: 'infitar-3',
			title: 'The Day of Judgement',
			surah: 82,
			from: 11,
			to: 19,
			ids: ['katib', 'ghaib', 'malaka'],
			notes: [
				{
					type: 'phrase',
					surah: 82,
					ayah: 17,
					from: 4,
					to: 5,
					translation: 'the Day of Judgement',
					note: 'You first met this phrase in Al-Fatiha. Here it occurs in verses 15, 17 and 18.'
				}
			]
		},
		{
			id: 'takwir-1',
			title: 'The sun, stars and mountains',
			surah: 81,
			from: 1,
			to: 7,
			ids: ['kuwwirat', 'suyyirat', 'hashara', 'zuwwijat'],
			notes: [
				{
					type: 'rule',
					title: 'Verbs ending in -at',
					body: 'Most verbs in these verses end in -at, as in {81:1:3}, {81:3:3} and {81:7:3}. This ending marks a feminine subject (‘it’). These three verbs are also passive: ‘is wrapped up’, ‘are set in motion’, ‘are paired’.'
				}
			]
		},
		{
			id: 'takwir-2',
			title: 'The pages are spread out',
			surah: 81,
			from: 8,
			to: 14,
			ids: ['nushirat', 'uzlifat', 'ahdarat'],
			notes: [
				{
					type: 'phrase',
					surah: 81,
					ayah: 14,
					from: 1,
					to: 4,
					translation: 'a soul will know what it has brought forward',
					note: 'The first three words also occur together in Al-Infitar, verse 5: {82:5:1} {82:5:2} {82:5:3}.'
				}
			]
		},
		{
			id: 'takwir-3',
			title: 'Oaths and a noble messenger',
			surah: 81,
			from: 15,
			to: 21,
			ids: ['jawar', 'makin', 'thamma']
		},
		{
			id: 'takwir-4',
			title: 'Your companion is not mad',
			surah: 81,
			from: 22,
			to: 24,
			ids: ['sahib', 'majnun', 'ufuq', 'mubin', 'ghayb']
		},
		{
			id: 'takwir-5',
			title: 'Where are you going?',
			surah: 81,
			from: 25,
			to: 29,
			ids: ['shaytan', 'rajim', 'ayna', 'dhahaba', 'istaqama']
		}
	]
};
