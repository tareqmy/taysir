/**
 * Authored English meanings for the vocabulary cards.
 *
 * Each seed points at ONE occurrence in the Quranic Arabic Corpus (`loc` is
 * `surah:ayah:word:segment`). The build script reads the lemma, root, part of
 * speech and frequency from the corpus itself, so no Arabic is typed by hand
 * and the Arabic can never drift from the source.
 *
 * STATUS: draft. Meanings are short learner glosses, not translations, and
 * should be checked by a qualified reviewer before public release.
 */
export interface LexemeSeed {
	id: string;
	loc: string;
	gloss: string;
}

export const lexemeSeeds: LexemeSeed[] = [
	// --- Al-Fatiha ---
	{ id: 'allah', loc: '1:1:2:1', gloss: 'Allah (God)' },
	{ id: 'rabb', loc: '1:2:3:1', gloss: 'Lord, master, sustainer' },
	{ id: 'rahman', loc: '1:1:3:2', gloss: 'the Most Gracious' },
	{ id: 'rahim', loc: '1:1:4:2', gloss: 'the Most Merciful' },
	{ id: 'hamd', loc: '1:2:1:2', gloss: 'praise' },
	{ id: 'ism', loc: '1:1:1:2', gloss: 'name' },
	{ id: 'yawm', loc: '1:4:2:1', gloss: 'day' },
	{ id: 'din', loc: '1:4:3:2', gloss: 'judgement; religion' },
	{ id: 'maalik', loc: '1:4:1:1', gloss: 'owner, master' },
	{ id: 'alam', loc: '1:2:4:2', gloss: 'world, all that exists' },
	{ id: 'abada', loc: '1:5:2:1', gloss: 'to worship, to serve' },
	{ id: 'hada', loc: '1:6:1:1', gloss: 'to guide' },
	{ id: 'sirat', loc: '1:6:2:2', gloss: 'path, way' },
	{ id: 'mustaqim', loc: '1:6:3:2', gloss: 'straight, upright' },
	{ id: 'anama', loc: '1:7:3:1', gloss: 'to bestow a favour' },
	{ id: 'ghayr', loc: '1:7:5:1', gloss: 'other than, not' },
	{ id: 'maghdub', loc: '1:7:6:2', gloss: 'one who has earned anger' },
	{ id: 'dall', loc: '1:7:9:2', gloss: 'one who goes astray' },

	// --- Root family: ر-ح-م (mercy) ---
	{ id: 'rahma', loc: '2:64:10:2', gloss: 'mercy' },
	{ id: 'rahima', loc: '2:286:43:2', gloss: 'to show mercy' },

	// --- Root family: ع-ل-م (knowledge) ---
	{ id: 'alima', loc: '2:13:19:1', gloss: 'to know' },
	{ id: 'alim', loc: '2:29:19:1', gloss: 'all-knowing' },
	{ id: 'ilm', loc: '2:32:4:1', gloss: 'knowledge' },
	{ id: 'allama', loc: '2:31:1:2', gloss: 'to teach' },

	// --- Root family: ع-ب-د (worship, servanthood) ---
	{ id: 'abd', loc: '2:23:8:1', gloss: 'servant (of God)' },
	{ id: 'abid', loc: '2:138:10:1', gloss: 'worshipper' },
	{ id: 'ibada', loc: '4:172:14:1', gloss: 'worship' },

	// --- Root family: م-ل-ك (ownership, kingship) ---
	{ id: 'mulk', loc: '2:102:6:1', gloss: 'dominion, kingdom' },
	{ id: 'malik', loc: '2:246:17:1', gloss: 'king' },
	{ id: 'malak', loc: '2:30:4:3', gloss: 'angel' }
];
