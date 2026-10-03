import type { UnitSpec } from '../surah-lessons';

export const unitSpec: UnitSpec = {
	id: 'juz-amma-6',
	title: 'Juz Amma: Abasa and An-Nazi’at',
	description:
		'Two longer surahs, Abasa and An-Nazi’at, read word by word with their everyday and Quranic vocabulary.',
	lessons: [
		// --- 80 Abasa ---
		{
			id: 'abasa-1',
			title: 'The blind man who came',
			surah: 80,
			from: 1,
			to: 10,
			ids: ['aama', 'laalla', 'saa'],
			notes: [
				{
					type: 'text',
					title: 'Endings that mean “him” and “you”',
					body: 'On a verb, the ending -hu means “him” and the ending -ka means “you”. So {80:2:2} is “came to him” and {80:8:3} is “came to you”.'
				},
				{
					type: 'rule',
					title: '“As for … then …”',
					body: 'The word {80:5:1} means “as for”. In verses 5 and 6 its clause is answered by {80:6:1}, which begins with the particle fa- (“so, then”).'
				}
			]
		},
		{
			id: 'abasa-2',
			title: 'The reminder and human creation',
			surah: 80,
			from: 11,
			to: 20,
			ids: ['tadhkira', 'nutfa', 'sabil'],
			notes: [
				{
					type: 'text',
					title: 'One root, two words',
					body: 'The noun {80:11:3} and the verb {80:12:3} share the root {root:tadhkira}, so both have to do with remembering and reminding.'
				},
				{
					type: 'rule',
					title: 'Describing words match their noun',
					body: 'The noun {80:13:2} is followed by three describing words: {80:13:3}, {80:14:1} and {80:14:2}. Each matches the noun in case and in being indefinite, which is why all four end with the same sound.'
				}
			]
		},
		{
			id: 'abasa-3',
			title: 'Death and being raised',
			surah: 80,
			from: 21,
			to: 23,
			ids: ['amata', 'anshara', 'qada'],
			notes: [
				{
					type: 'text',
					title: 'Verbs that begin with a-',
					body: 'The verbs {80:21:2}, {80:21:3} and {80:22:4} all begin with a-. This is a common verb pattern, and it often gives the verb the sense of causing something: “caused to die”, “raised to life”.'
				}
			]
		},
		{
			id: 'abasa-4',
			title: 'Water, earth and growth',
			surah: 80,
			from: 24,
			to: 29,
			ids: ['anbata', 'habb', 'inab', 'nakhl'],
			notes: [
				{
					type: 'text',
					title: 'The ending -na means “we”',
					body: 'The verbs {80:25:2}, {80:26:2} and {80:27:1} each end in -na, which means “we” on a past-tense verb: “We poured”, “We split”, “We caused to grow”.'
				},
				{
					type: 'text',
					title: 'A verb and a noun from one root',
					body: 'The noun {80:25:4} (“a pouring”) comes from the same root as the verb {80:25:2}. The same is true of {80:26:4} (“a splitting”) and {80:26:2}.'
				}
			]
		},
		{
			id: 'abasa-5',
			title: 'Gardens, fruit and provision',
			surah: 80,
			from: 30,
			to: 32,
			ids: ['hadaiq', 'fakiha', 'mataa', 'anam'],
			notes: [
				{
					type: 'phrase',
					surah: 80,
					ayah: 32,
					from: 2,
					to: 3,
					translation: 'for you and for your livestock',
					note: 'The ending -kum means “you” (plural) after a preposition such as li- (“for”), and “your” on a noun.'
				}
			]
		},
		{
			id: 'abasa-6',
			title: 'The day a person flees',
			surah: 80,
			from: 33,
			to: 36,
			ids: ['farra', 'mar', 'akh', 'sahiba', 'bunayy'],
			notes: [
				{
					type: 'text',
					title: 'The ending for “his”',
					body: 'The ending that means “his” is usually -hu, but it is written -hi after an i-vowel, as in {80:34:5} (“his brother”), {80:35:1} (“and his mother”) and {80:36:1} (“and his wife”).'
				},
				{
					type: 'text',
					title: 'A word you may have met',
					body: 'The word for “father” in {80:35:2} is the same word as {111:1:3} in Surah Al-Masad.'
				}
			]
		},
		{
			id: 'abasa-7',
			title: 'Faces on that day',
			surah: 80,
			from: 37,
			to: 42,
			ids: ['imru', 'shan', 'rahiqa'],
			notes: [
				{
					type: 'text',
					title: '“On that day”',
					body: 'The word {80:37:4} means “on that day” and appears again as {80:38:2} and {80:40:2}. It is made of yawm (“day”) joined to idh (“then”).'
				}
			]
		},

		// --- 79 An-Nazi’at ---
		{
			id: 'naziat-1',
			title: 'Oaths, quaking and trembling hearts',
			surah: 79,
			from: 1,
			to: 11,
			ids: ['tabia', 'basar', 'izam'],
			notes: [
				{
					type: 'text',
					title: 'The ending -at',
					body: 'The first five verses each open with a word like {79:1:1}. The wa- at the start means “by” here (it begins an oath), and the ending -at marks a feminine plural describing noun.'
				},
				{
					type: 'text',
					title: 'A word you have met',
					body: 'The word {79:8:2} means “on that day”, the same word as {80:37:4} in Surah Abasa.'
				}
			]
		},
		{
			id: 'naziat-2',
			title: 'A return and a single shout',
			surah: 79,
			from: 12,
			to: 14,
			ids: ['idhan', 'karra', 'wahida', 'idhasudden'],
			notes: [
				{
					type: 'text',
					title: 'Two kinds of idha',
					body: 'The same spelling appears twice here. In {79:11:1} it means “when”. In {79:14:1} it points to something sudden and is read “then behold”.'
				},
				{
					type: 'text',
					title: 'inna + ma = “only”',
					body: 'The word {79:13:1} is fa- (“so”), inna (“indeed”) and ma. Together inna and ma mean “only”.'
				}
			]
		},
		{
			id: 'naziat-3',
			title: 'Musa and Pharaoh',
			surah: 79,
			from: 15,
			to: 22,
			ids: ['nada', 'asa', 'adbara'],
			notes: [
				{
					type: 'text',
					title: 'The ending -ka',
					body: 'The ending -ka means “you” on a verb and “your” on a noun: {79:15:2} (“come to you”), {79:19:1} (“and I guide you”) and {79:19:3} (“your Lord”).'
				},
				{
					type: 'text',
					title: 'A verb you have met',
					body: 'The verb {79:18:6} is a form of the same verb as {80:3:4} in Surah Abasa, “to purify oneself”.'
				}
			]
		},
		{
			id: 'naziat-4',
			title: 'Pharaoh is seized',
			surah: 79,
			from: 23,
			to: 26,
			ids: ['akhadha', 'nakal', 'ibra'],
			notes: [
				{
					type: 'rule',
					title: 'The emphatic la-',
					body: 'The prefix la- on {79:26:4} adds emphasis (“surely”). It often follows inna (“indeed”), as in {79:26:1}.'
				}
			]
		},
		{
			id: 'naziat-5',
			title: 'The sky and the earth',
			surah: 79,
			from: 27,
			to: 33,
			ids: ['ashadd', 'khalq', 'am'],
			notes: [
				{
					type: 'text',
					title: 'A question with “or”',
					body: 'The word {79:27:1} begins with the question particle a-, and {79:27:4} (“or”) then offers the second choice.'
				},
				{
					type: 'text',
					title: 'The ending -ha',
					body: 'The ending -ha means “it” on a verb and “its” on a noun, for a feminine word: {79:27:6} (“He built it”), {79:28:2} (“its height”) and {79:29:2} (“its night”).'
				}
			]
		},
		{
			id: 'naziat-6',
			title: 'The calamity and two outcomes',
			surah: 79,
			from: 34,
			to: 41,
			ids: ['mawa', 'maqam', 'hawa'],
			notes: [
				{
					type: 'text',
					title: '“As for … then indeed …”',
					body: 'As in Surah Abasa ({80:5:1}), the word {79:37:1} (“as for”) is answered by a clause that begins with fa-: see {79:39:1}.'
				},
				{
					type: 'phrase',
					surah: 79,
					ayah: 39,
					from: 1,
					to: 4,
					translation: 'then indeed the blazing fire, it is the abode',
					note: 'Verse 41 repeats this pattern with a different noun in the second place.'
				}
			]
		},
		{
			id: 'naziat-7',
			title: 'Questions about the Hour',
			surah: 79,
			from: 42,
			to: 44,
			ids: ['saah', 'ayyan', 'mursa', 'muntaha'],
			notes: [
				{
					type: 'text',
					title: 'A shared root',
					body: 'The word {79:42:5} has the same root, {root:mursa}, as {79:32:2} (“He anchored them”).'
				},
				{
					type: 'text',
					title: 'Referring to a feminine word',
					body: 'The Hour is a feminine word, so it is referred to with -ha: {79:42:5} (“its arrival”), {79:43:4} (“its mention”) and {79:44:3} (“its final end”).'
				}
			]
		},
		{
			id: 'naziat-8',
			title: 'A warner and a short stay',
			surah: 79,
			from: 45,
			to: 46,
			ids: ['mundhir', 'kaanna', 'labitha'],
			notes: [
				{
					type: 'text',
					title: 'kaanna + hum',
					body: 'The word {79:46:1} is kaanna (“as if”) with -hum attached. After kaanna, as after inna, an attached pronoun is the subject, so -hum means “they”.'
				},
				{
					type: 'rule',
					title: '“Did not” with a present-form verb',
					body: 'The particle {79:46:4} (“did not”) comes before a present-form verb, {79:46:5}, but gives it a past meaning: “they did not stay”.'
				}
			]
		}
	]
};
