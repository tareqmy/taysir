import type { UnitSpec } from '../surah-lessons';

export const unitSpec: UnitSpec = {
	id: 'juz-amma-3',
	title: 'Juz Amma: Al-Balad to Al-Ghashiyah',
	description:
		'Learn the words of Al-Balad, Al-Fajr and Al-Ghashiyah from the verses themselves, one short passage at a time.',
	lessons: [
		// 90 Al-Balad
		{
			id: 'balad-1',
			title: 'An oath by this city',
			surah: 90,
			from: 1,
			to: 5,
			ids: ['aqsama', 'hill', 'walid', 'lan', 'qadara'],
			notes: [
				{
					type: 'text',
					title: 'One root, two words',
					body: '{90:3:1} (“parent”) and {90:3:3} (“he begot”) come from the same root, {root:walid}. The verb {90:3:3} is the one on the card “to give birth, to beget”, which you met in {112:3:2}.'
				}
			]
		},
		{
			id: 'balad-2',
			title: 'Wealth, gifts and the steep path',
			surah: 90,
			from: 6,
			to: 14,
			ids: ['ahlaka', 'lisan', 'raqaba', 'itaam'],
			notes: [
				{
					type: 'rule',
					title: 'Two of something: the -ayni ending',
					body: 'Arabic has a special ending for exactly two. {90:8:4} (“two eyes”), {90:9:2} (“and two lips”) and {90:10:2} (“the two ways”) all end in -ayni. The idea of “two” is not a separate word; it is built into the ending.'
				}
			]
		},
		{
			id: 'balad-3',
			title: 'The right and the left',
			surah: 90,
			from: 15,
			to: 20,
			ids: ['maymana', 'aya', 'mashama']
		},

		// 89 Al-Fajr
		{
			id: 'fajr-1',
			title: 'Oaths by dawn and night',
			surah: 89,
			from: 1,
			to: 5,
			ids: ['ashr', 'hal', 'hijr']
		},
		{
			id: 'fajr-2',
			title: 'Aad, Thamud and Pharaoh',
			surah: 89,
			from: 6,
			to: 10,
			ids: ['aad', 'mithl', 'wad', 'firawn', 'awtad'],
			notes: [
				{
					type: 'rule',
					title: 'The word for “having”',
					body: '{89:7:2} and {89:10:2} are two forms of the word on the card “owner of, having”, which you met as {111:3:3}. {89:7:2} is the feminine form, used here after Iram; {89:10:2} is the masculine form. The thing owned follows straight after it, as {89:7:3} follows {89:7:2}.'
				}
			]
		},
		{
			id: 'fajr-3',
			title: 'Spreading corruption',
			surah: 89,
			from: 11,
			to: 14,
			ids: ['fasad', 'sabba', 'adhab'],
			notes: [
				{
					type: 'rule',
					title: 'After “inna”',
					body: '{89:14:1} means “indeed”. The noun that follows it ends in -a, not -u. That is why “your Lord” is {89:14:2} here but {89:13:3} in the verse before, where it is the subject of the verb.'
				}
			]
		},
		{
			id: 'fajr-4',
			title: 'Tested with ease and want',
			surah: 89,
			from: 15,
			to: 16,
			ids: ['ibtala', 'akrama', 'rizq']
		},
		{
			id: 'fajr-5',
			title: 'The orphan and the needy',
			surah: 89,
			from: 17,
			to: 20,
			ids: ['bal', 'akala', 'akl', 'ahabba'],
			notes: [
				{
					type: 'phrase',
					surah: 89,
					ayah: 18,
					from: 3,
					to: 5,
					translation: 'on the food of the needy',
					note: 'The same three words end verse 3 of Al-Ma’un: {107:3:3} {107:3:4} {107:3:5}.'
				}
			]
		},
		{
			id: 'fajr-6',
			title: 'The crushing of the earth',
			surah: 89,
			from: 21,
			to: 23,
			ids: ['dakk', 'saff', 'tadhakkara', 'anna', 'dhikra']
		},
		{
			id: 'fajr-7',
			title: 'Regret and the tranquil soul',
			surah: 89,
			from: 24,
			to: 30,
			ids: ['layta', 'qaddama', 'hayat', 'adhdhaba', 'rajaa'],
			notes: [
				{
					type: 'rule',
					title: 'Commands to a feminine “you”',
					body: 'The commands {89:28:1}, {89:29:1} and {89:30:1} all end in the sound -ī. This ending marks a command to a feminine “you”; here the soul, {89:27:2}, is grammatically feminine. In the same way {89:28:3} ends in -ki, “your” for a feminine, where a masculine would end in -ka.'
				}
			]
		},

		// 88 Al-Ghashiyah
		{
			id: 'ghashiyah-1',
			title: 'The report of the Overwhelming',
			surah: 88,
			from: 1,
			to: 7,
			ids: ['hadith', 'ghashiyah', 'khashi', 'saqa']
		},
		{
			id: 'ghashiyah-2',
			title: 'Faces and a lofty garden',
			surah: 88,
			from: 8,
			to: 16,
			ids: ['sami', 'jariya', 'surur', 'marfua', 'akwab'],
			notes: [
				{
					type: 'rule',
					title: '“Raised”, “set down”, “lined up”, “spread out”',
					body: 'The four describing words {88:13:3}, {88:14:2}, {88:15:2} and {88:16:2} all have the shape maf‘ūla. This shape names something that has had the action done to it: raised, set down, lined up, spread out. Here each one is in the feminine and describes the noun just before it.'
				}
			]
		},
		{
			id: 'ghashiyah-3',
			title: 'Look around, and remind',
			surah: 88,
			from: 17,
			to: 26,
			ids: ['nazara', 'dhakkara', 'akbar', 'hisab'],
			notes: [
				{
					type: 'text',
					title: '“How” four times',
					body: '{88:17:5}, {88:18:3}, {88:19:3} and {88:20:3} are all the word “how”, which you met in {105:1:3}. Each is followed by a passive verb: {88:17:6}, {88:18:4}, {88:19:4} and {88:20:4}. In these verbs the vowels u–i–a mark the passive, and the ending -at shows a feminine subject.'
				}
			]
		}
	]
};
