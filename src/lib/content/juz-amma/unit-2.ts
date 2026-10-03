import type { UnitSpec } from '../surah-lessons';

export const unitSpec: UnitSpec = {
	id: 'juz-amma-2',
	title: 'Juz Amma: Al-Alaq to Ash-Shams',
	description:
		'Six short surahs, from Al-Alaq to Ash-Shams, taught word by word with their vocabulary.',
	lessons: [
		// 96 Al-Alaq
		{
			id: 'alaq-1',
			title: 'Read in your Lord’s name',
			surah: 96,
			from: 1,
			to: 6,
			ids: ['qaraa', 'qalam', 'taghaa'],
			notes: [
				{
					type: 'rule',
					title: 'Your Lord',
					body: 'The ending -ka on {96:1:3} means “your”: “Lord” plus -ka makes “your Lord”. It speaks to one person.'
				}
			]
		},
		{
			id: 'alaq-2',
			title: 'One who forbids a servant',
			surah: 96,
			from: 7,
			to: 10,
			ids: ['ansub', 'istaghna', 'ila', 'naha'],
			notes: [
				{
					type: 'text',
					title: 'A verb of seeing',
					body: '{96:7:2} (“he saw”) and {96:9:1} (“have you seen”) come from the same root, {root:raa}, as the verb “to see” that you met in An-Nasr. The question “have you seen?” begins verses 9, 11 and 13.'
				}
			]
		},
		{
			id: 'alaq-3',
			title: 'Guidance, piety and denial',
			surah: 96,
			from: 11,
			to: 14,
			ids: ['in', 'huda', 'aw', 'taqwa', 'tawalla'],
			notes: [
				{
					type: 'phrase',
					surah: 96,
					ayah: 14,
					from: 1,
					to: 5,
					translation: 'Does he not know that Allah sees?',
					note: 'The first word is the question letter أ joined to {96:5:4}, “did not”, so it asks “does he not…?”.'
				}
			]
		},
		{
			id: 'alaq-4',
			title: 'If he does not desist',
			surah: 96,
			from: 15,
			to: 16,
			ids: ['intaha', 'nasiya', 'kadhib']
		},
		{
			id: 'alaq-5',
			title: 'Prostrate and draw near',
			surah: 96,
			from: 17,
			to: 19,
			ids: ['daa', 'atoa', 'sajada', 'iqtaraba'],
			notes: [
				{
					type: 'rule',
					title: 'Saying “do not”',
					body: 'Before a verb, {96:19:2} means “do not” and forbids something, as in {96:19:3}, “do not obey him”. Two more commands follow, {96:19:4} and {96:19:5}, each joined to “and”.'
				}
			]
		},

		// 95 At-Tin
		{
			id: 'tin-1',
			title: 'Fig, olive, mountain, city',
			surah: 95,
			from: 1,
			to: 3,
			ids: ['zaytun', 'tur', 'balad', 'amin'],
			notes: [
				{
					type: 'text',
					title: 'Starting with “by”',
					body: 'The word {95:1:1} begins with wa-, which here means “by” (swearing by something). The words {95:1:2} and {95:2:1} begin with wa- as well, here working like “and (by)”.'
				}
			]
		},
		{
			id: 'tin-2',
			title: 'The best, then the lowest',
			surah: 95,
			from: 4,
			to: 5,
			ids: ['qad', 'ahsan', 'radda', 'asfal', 'safil'],
			notes: [
				{
					type: 'rule',
					title: 'We, and him',
					body: 'The ending -nā on a verb means “we”: {95:4:2} is “We created”. In {95:5:2} the verb has -nā and then -hu, “him”: “We returned him”.'
				},
				{
					type: 'text',
					title: 'One root, two words',
					body: '{95:5:3} and {95:5:4} share one root, {root:asfal}. The first means “lowest” and the second “those who are low”.'
				}
			]
		},
		{
			id: 'tin-3',
			title: 'Reward, and the Judgement',
			surah: 95,
			from: 6,
			to: 8,
			ids: ['ajr', 'mamnun', 'laysa', 'hakim'],
			notes: [
				{
					type: 'text',
					title: 'Three pieces in one word',
					body: '{95:6:6} is made of three small pieces: fa- (“so”), la- (“for”) and -hum (“them”). Together they read “so for them”.'
				}
			]
		},

		// 94 Ash-Sharh
		{
			id: 'sharh-1',
			title: 'The chest and the burden',
			surah: 94,
			from: 1,
			to: 2,
			ids: ['sharaha', 'wada', 'wizr'],
			notes: [
				{
					type: 'rule',
					title: 'The ending -ka again',
					body: 'The ending -ka that meant “your” in Al-Alaq is on {94:1:4}, “your chest”. After a preposition it means “you”: {94:1:3} is “for you” and {94:2:2} is “from you”.'
				}
			]
		},
		{
			id: 'sharh-2',
			title: 'The back and the mention',
			surah: 94,
			from: 3,
			to: 4,
			ids: ['zahr', 'rafaa', 'dhikr']
		},
		{
			id: 'sharh-3',
			title: 'With hardship comes ease',
			surah: 94,
			from: 5,
			to: 8,
			ids: ['maa', 'usr', 'yusr', 'raghiba'],
			notes: [
				{
					type: 'phrase',
					surah: 94,
					ayah: 5,
					from: 2,
					to: 4,
					translation: 'with the hardship, ease',
					note: 'Verse 6 repeats these three words exactly, after its opening {94:6:1}.'
				}
			]
		},

		// 93 Ad-Duha
		{
			id: 'duha-1',
			title: 'The forenoon and the night',
			surah: 93,
			from: 1,
			to: 5,
			ids: ['duha', 'layl', 'akhir', 'awwal']
		},
		{
			id: 'duha-2',
			title: 'Found, sheltered, and three commands',
			surah: 93,
			from: 6,
			to: 11,
			ids: ['wajada', 'awa', 'sail', 'nima'],
			notes: [
				{
					type: 'text',
					title: 'Three times “as for”',
					body: '{93:9:1}, {93:10:1} and {93:11:1} each open a verse with “as for”. The person or thing comes next, then fa- and the command: “as for the orphan, so do not…”.'
				}
			]
		},

		// 92 Al-Layl
		{
			id: 'layl-1',
			title: 'Night, day and varied striving',
			surah: 92,
			from: 1,
			to: 4,
			ids: ['ghashi', 'nahar', 'dhakar', 'untha', 'say', 'shatta']
		},
		{
			id: 'layl-2',
			title: 'Who gives and is mindful',
			surah: 92,
			from: 5,
			to: 7,
			ids: ['ittaqa', 'saddaqa', 'husna', 'yassara'],
			notes: [
				{
					type: 'text',
					title: 'The root of ease',
					body: '{92:7:1} (“We will ease him”) and {92:7:2} (“to the easiest”) come from the root {root:yusr}, the same root as “ease” in {94:5:4}.'
				}
			]
		},
		{
			id: 'layl-3',
			title: 'Wealth, guidance and fire',
			surah: 92,
			from: 8,
			to: 15,
			ids: ['bakhila', 'aghnat', 'andhara', 'ashqa']
		},
		{
			id: 'layl-4',
			title: 'The most pious one',
			surah: 92,
			from: 16,
			to: 21,
			ids: ['tazakka', 'jaza', 'ibtigha', 'wajh', 'aala']
		},

		// 91 Ash-Shams
		{
			id: 'shams-1',
			title: 'Sun, moon, day, night, sky',
			surah: 91,
			from: 1,
			to: 5,
			ids: ['shams', 'qamar', 'sama', 'bana'],
			notes: [
				{
					type: 'rule',
					title: 'The ending -hā',
					body: 'Many words in this surah end in -hā, which is feminine and singular. On a noun it means “its” or “her”, as in {91:1:2}. On a verb it means “it” or “her” as the thing acted on, as in {91:2:3}, “it follows it”.'
				}
			]
		},
		{
			id: 'shams-2',
			title: 'The soul, success and failure',
			surah: 91,
			from: 6,
			to: 10,
			ids: ['nafs', 'sawwa', 'aflaha', 'zakka', 'khaba'],
			notes: [
				{
					type: 'text',
					title: 'To purify',
					body: '{91:9:4} (“he purified it”) shares the root {root:zakka} with {92:18:4} (“he purifies himself”) in Al-Layl.'
				}
			]
		},
		{
			id: 'shams-3',
			title: 'Thamud and the she-camel',
			surah: 91,
			from: 11,
			to: 15,
			ids: ['thamud', 'naqa', 'aqara', 'dhanb', 'khafa', 'uqba'],
			notes: [
				{
					type: 'text',
					title: 'Four pieces in one word',
					body: '{91:14:1} packs four pieces into one word: fa- (“so” or “but”), the verb “denied”, -ū (“they”) and -hu (“him”). {91:14:2} works the same way, with -hā (“her”) at the end.'
				}
			]
		}
	]
};
