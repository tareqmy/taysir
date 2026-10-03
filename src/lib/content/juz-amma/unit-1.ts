import type { UnitSpec } from '../surah-lessons';

export const unitSpec: UnitSpec = {
	id: 'juz-amma-1',
	title: 'Juz Amma: Al-Humaza to Al-Qadr',
	description:
		'Eight short surahs, from Al-Humaza back to Al-Qadr, taught word by word with the vocabulary they share.',
	lessons: [
		// --- 104 Al-Humaza ---
		{
			id: 'humaza-1',
			title: 'Woe to every slanderer',
			surah: 104,
			from: 1,
			to: 3,
			ids: ['kull', 'jamaa', 'hasiba', 'annaa'],
			notes: [
				{
					type: 'rule',
					title: 'The ending -hu',
					body: 'The ending -hu means “his” on a noun and “it” or “him” on a verb. In {104:3:3} it gives “his wealth”, in {104:2:4} “and counted it” and in {104:3:4} “has made him immortal”.'
				},
				{
					type: 'text',
					title: 'Wealth again',
					body: 'The word for “wealth” in {104:2:3} and {104:3:3} is the one you met in Al-Masad, {111:2:4}.'
				}
			]
		},
		{
			id: 'humaza-2',
			title: 'The Crusher and its fire',
			surah: 104,
			from: 4,
			to: 6,
			ids: ['kalla', 'nabadha', 'adra'],
			notes: [
				{
					type: 'phrase',
					surah: 104,
					ayah: 5,
					from: 1,
					to: 4,
					translation: 'And what made you know what the Crusher is?',
					note: 'The ending -ka on the verb means “you”. This question comes back in Al-Qari‘a and Al-Qadr.'
				}
			]
		},
		{
			id: 'humaza-3',
			title: 'The fire closed over them',
			surah: 104,
			from: 7,
			to: 9,
			ids: ['talaa', 'fuad', 'amad']
		},

		// --- 103 Al-Asr ---
		{
			id: 'asr-1',
			title: 'Time and loss',
			surah: 103,
			from: 1,
			to: 3,
			ids: ['insan', 'illa', 'amila', 'salihah']
		},
		{
			id: 'asr-2',
			title: 'Urging truth and patience',
			surah: 103,
			from: 3,
			to: 3,
			ids: ['tawasa', 'haqq', 'sabr']
		},

		// --- 102 At-Takathur ---
		{
			id: 'takathur-1',
			title: 'Competing for more',
			surah: 102,
			from: 1,
			to: 3,
			ids: ['alha', 'hatta', 'sawfa']
		},
		{
			id: 'takathur-2',
			title: 'Knowledge of certainty',
			surah: 102,
			from: 4,
			to: 6,
			ids: ['thumma', 'law', 'yaqin', 'jahim'],
			notes: [
				{
					type: 'text',
					title: 'One root, two words',
					body: 'The verb {102:5:3} (“you knew”) and the noun {102:5:4} (“knowledge of”) come from the same root, {root:alima}.'
				}
			]
		},
		{
			id: 'takathur-3',
			title: 'Seeing and being asked',
			surah: 102,
			from: 7,
			to: 8,
			ids: ['ayn', 'saala', 'idh', 'naim'],
			notes: [
				{
					type: 'rule',
					title: 'Emphasis at both ends',
					body: 'The verbs {102:7:2} and {102:8:2} begin with la- and end with -nna. Together they make the verb emphatic: “you will surely see it”, “you will surely be asked”.'
				},
				{
					type: 'text',
					title: 'On that day',
					body: 'The word {102:8:3} is yawm (“day”) and idh (“then”) written as one word. It comes back in {99:4:1} and {100:11:4}.'
				}
			]
		},

		// --- 101 Al-Qari'a ---
		{
			id: 'qaria-1',
			title: 'The calamity and the scales',
			surah: 101,
			from: 1,
			to: 6,
			ids: ['qaria', 'jabal', 'amma', 'man', 'thaqula', 'mizan']
		},
		{
			id: 'qaria-2',
			title: 'A pleasant life, or an abyss',
			surah: 101,
			from: 7,
			to: 11,
			ids: ['radiyah', 'khaffa', 'umm'],
			notes: [
				{
					type: 'rule',
					title: '“As for … then …”',
					body: 'In this surah “as for” appears twice, in {101:6:1} and {101:8:1}. Each time the answer starts with fa- (“then”): {101:7:1} and {101:9:1}.'
				}
			]
		},

		// --- 100 Al-Adiyat ---
		{
			id: 'adiyat-1',
			title: 'Those that run and strike',
			surah: 100,
			from: 1,
			to: 5,
			ids: ['subh', 'athaara', 'jam'],
			notes: [
				{
					type: 'rule',
					title: 'wa- meaning “by”',
					body: 'Verse 1 starts with wa-, which here means “by”: it swears by something, as in {103:1:1} in Al-Asr. Verses 2 to 5 each carry on with fa- (“then”).'
				}
			]
		},
		{
			id: 'adiyat-2',
			title: 'The human being and his Lord',
			surah: 100,
			from: 6,
			to: 11,
			ids: ['shaheed', 'hubb', 'khayr', 'shadid', 'qabr', 'khabir']
		},

		// --- 99 Az-Zalzala ---
		{
			id: 'zalzala-1',
			title: 'The shaking of the earth',
			surah: 99,
			from: 1,
			to: 3,
			ids: ['zulzila', 'ard', 'akhraja', 'thaqal']
		},
		{
			id: 'zalzala-2',
			title: 'The earth tells its news',
			surah: 99,
			from: 4,
			to: 5,
			ids: ['haddatha', 'akhbar', 'awha'],
			notes: [
				{
					type: 'text',
					title: 'A root you know',
					body: 'The noun {99:4:3} (“its news”) has the same root as {100:11:5} (“all-aware”) from Al-Adiyat: {root:akhbar}.'
				}
			]
		},
		{
			id: 'zalzala-3',
			title: 'Shown their deeds',
			surah: 99,
			from: 6,
			to: 8,
			ids: ['ara', 'amal', 'mithqal', 'dharra']
		},

		// --- 98 Al-Bayyina ---
		{
			id: 'bayyina-1',
			title: 'The clear proof',
			surah: 98,
			from: 1,
			to: 1,
			ids: ['kafara', 'ahl', 'kitab', 'mushrik', 'ataya', 'bayyina'],
			notes: [
				{
					type: 'rule',
					title: 'Noun and noun',
					body: 'Two nouns side by side, like {98:1:6} and {98:1:7}, mean “the people of the Book”. The first noun has no ال and the second says whose it is, so the English “of” is understood without being written.'
				}
			]
		},
		{
			id: 'bayyina-2',
			title: 'A messenger and purified scrolls',
			surah: 98,
			from: 2,
			to: 3,
			ids: ['rasul', 'tala', 'suhuf', 'mutahhara']
		},
		{
			id: 'bayyina-3',
			title: 'Divided after the proof',
			surah: 98,
			from: 4,
			to: 4,
			ids: ['manafiya', 'tafarraqa', 'aata', 'baad'],
			notes: [
				{
					type: 'text',
					title: 'Two forms of one root',
					body: 'The verbs {98:4:4} (“were given”) and {98:1:11} (“comes to them”) share the root {root:ataya}. The verb {98:4:10} (“came to them”) is a different verb: the one for “to come” that you met in An-Nasr.'
				}
			]
		},
		{
			id: 'bayyina-4',
			title: 'What they were commanded',
			surah: 98,
			from: 5,
			to: 5,
			ids: ['amara', 'mukhlis', 'hanif', 'aqama', 'zakat'],
			notes: [
				{
					type: 'text',
					title: '“So that”',
					body: 'The prefix li- at the start of {98:5:4} means “so that”. You met it in {99:6:5}, “so that they are shown”.'
				},
				{
					type: 'phrase',
					surah: 98,
					ayah: 5,
					from: 10,
					to: 13,
					translation: 'and they establish the prayer and give the zakat',
					note: 'The word for prayer is the salat you already know.'
				}
			]
		},
		{
			id: 'bayyina-5',
			title: 'The worst and the best',
			surah: 98,
			from: 6,
			to: 8,
			ids: ['jahannam', 'khalid', 'jazaa', 'ind', 'janna'],
			notes: [
				{
					type: 'text',
					title: 'Worst and best',
					body: '{98:6:15} and {98:7:8} are the words you know as “evil” and “good”. Followed by “the creatures”, they mean “the worst of” and “the best of”.'
				}
			]
		},
		{
			id: 'bayyina-6',
			title: 'Gardens with rivers',
			surah: 98,
			from: 8,
			to: 8,
			ids: ['adn', 'jara', 'taht', 'nahr']
		},
		{
			id: 'bayyina-7',
			title: 'Abiding, pleased, and in awe',
			surah: 98,
			from: 8,
			to: 8,
			ids: ['abadan', 'radiya', 'khashiya']
		},

		// --- 97 Al-Qadr ---
		{
			id: 'qadr-1',
			title: 'The night of the decree',
			surah: 97,
			from: 1,
			to: 3,
			ids: ['anzala', 'layla', 'qadr', 'alf', 'shahr'],
			notes: [
				{
					type: 'phrase',
					surah: 97,
					ayah: 1,
					from: 4,
					to: 5,
					translation: 'the night of the decree',
					note: 'The same two words come again in verses 2 and 3.'
				},
				{
					type: 'rule',
					title: 'The ending -nā, “we”',
					body: 'The ending -nā means “we”. It is joined to “indeed” in {97:1:1} and to the verb in {97:1:2}, which also has -hu, “it”: “We sent it down”.'
				}
			]
		},
		{
			id: 'qadr-2',
			title: 'Peace until the dawn',
			surah: 97,
			from: 4,
			to: 5,
			ids: ['tanazzala', 'ruh', 'idhn', 'amr', 'salam', 'fajr'],
			notes: [
				{
					type: 'text',
					title: 'Sent down and descend',
					body: 'The verb {97:4:1} (“descend”) has the same root as {97:1:2} (“sent down”): {root:anzala}.'
				},
				{
					type: 'rule',
					title: 'Saying “every”',
					body: 'The word {97:4:8} is kull, “every”, which you met in Al-Humaza. Here it is followed by one noun, {97:4:9}, giving “every matter”.'
				}
			]
		}
	]
};
