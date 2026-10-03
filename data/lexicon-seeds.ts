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
	{ id: 'malak', loc: '2:30:4:3', gloss: 'angel' },

	// --- Short surahs (105–114) ---
	// Only words that recur in the Quran, plus a few that carry a famous surah (samad,
	// kawthar, falaq). Rarer words are glossed under the verse but get no card.
	// Al-Ikhlas
	{ id: 'qala', loc: '112:1:1:1', gloss: 'to say' },
	{ id: 'ahad', loc: '112:1:4:1', gloss: 'one, any one' },
	{ id: 'samad', loc: '112:2:2:2', gloss: 'self-sufficient; the one all turn to' },
	{ id: 'lam', loc: '112:3:1:1', gloss: 'did not' },
	{ id: 'walada', loc: '112:3:2:1', gloss: 'to give birth, to beget' },
	{ id: 'kana', loc: '112:4:2:1', gloss: 'to be, to have been' },
	// An-Nas
	{ id: 'audhu', loc: '114:1:2:1', gloss: 'to seek refuge' },
	{ id: 'nas', loc: '114:1:4:2', gloss: 'people, mankind' },
	{ id: 'ilah', loc: '114:3:1:1', gloss: 'god, deity' },
	{ id: 'min', loc: '114:4:1:1', gloss: 'from, of' },
	{ id: 'shar', loc: '114:4:2:1', gloss: 'evil, harm' },
	{ id: 'alladhi', loc: '114:5:1:1', gloss: 'who, which, that' },
	{ id: 'waswasa', loc: '114:5:2:1', gloss: 'to whisper evil thoughts' },
	{ id: 'fi', loc: '114:5:3:1', gloss: 'in' },
	{ id: 'sadr', loc: '114:5:4:1', gloss: 'chest, breast' },
	// Al-Falaq
	{ id: 'falaq', loc: '113:1:4:2', gloss: 'daybreak' },
	{ id: 'khalaqa', loc: '113:2:4:1', gloss: 'to create' },
	{ id: 'ma', loc: '113:2:3:1', gloss: 'what, that which' },
	{ id: 'idha', loc: '113:3:4:1', gloss: 'when' },
	{ id: 'uqda', loc: '113:4:5:2', gloss: 'knot' },
	{ id: 'hasada', loc: '113:5:5:1', gloss: 'to envy' },
	// Al-Kawthar
	{ id: 'inna', loc: '108:1:1:1', gloss: 'indeed' },
	{ id: 'ata', loc: '108:1:2:1', gloss: 'to give' },
	{ id: 'kawthar', loc: '108:1:3:2', gloss: 'abundance' },
	{ id: 'salla', loc: '108:2:1:2', gloss: 'to pray' },
	// Al-Kafirun
	{ id: 'ayy', loc: '109:1:2:2', gloss: 'which, any' },
	{ id: 'kafir', loc: '109:1:3:2', gloss: 'disbeliever' },
	{ id: 'la', loc: '109:2:1:1', gloss: 'not, no' },
	// An-Nasr
	{ id: 'jaa', loc: '110:1:2:1', gloss: 'to come' },
	{ id: 'nasr', loc: '110:1:3:1', gloss: 'help, victory' },
	{ id: 'fath', loc: '110:1:5:3', gloss: 'opening, conquest' },
	{ id: 'raa', loc: '110:2:1:2', gloss: 'to see' },
	{ id: 'dakhala', loc: '110:2:3:1', gloss: 'to enter' },
	{ id: 'fawj', loc: '110:2:7:1', gloss: 'crowd, group' },
	{ id: 'sabbaha', loc: '110:3:1:2', gloss: 'to glorify' },
	{ id: 'istaghfara', loc: '110:3:4:2', gloss: 'to ask forgiveness' },
	{ id: 'tawwab', loc: '110:3:7:1', gloss: 'one who accepts repentance' },
	// Al-Masad
	{ id: 'yad', loc: '111:1:2:1', gloss: 'hand' },
	{ id: 'ab', loc: '111:1:3:1', gloss: 'father' },
	{ id: 'lahab', loc: '111:1:4:1', gloss: 'flame' },
	{ id: 'aghna', loc: '111:2:2:1', gloss: 'to avail, to be of use' },
	{ id: 'mal', loc: '111:2:4:1', gloss: 'wealth, property' },
	{ id: 'kasaba', loc: '111:2:6:1', gloss: 'to earn' },
	{ id: 'yasla', loc: '111:3:1:2', gloss: 'to burn in a fire' },
	{ id: 'nar', loc: '111:3:2:1', gloss: 'fire' },
	{ id: 'dhu', loc: '111:3:3:1', gloss: 'owner of, having' },
	{ id: 'imraa', loc: '111:4:1:2', gloss: 'woman, wife' },
	{ id: 'habl', loc: '111:5:3:1', gloss: 'rope' },
	// Quraysh
	{ id: 'dha', loc: '106:3:3:2', gloss: 'this, that' },
	{ id: 'bayt', loc: '106:3:4:2', gloss: 'house' },
	{ id: 'atama', loc: '106:4:2:1', gloss: 'to feed' },
	{ id: 'ju', loc: '106:4:4:1', gloss: 'hunger' },
	{ id: 'amana', loc: '106:4:5:2', gloss: 'to believe; to make safe' },
	{ id: 'khawf', loc: '106:4:7:1', gloss: 'fear' },
	// Al-Ma'un
	{ id: 'kadhdhaba', loc: '107:1:3:1', gloss: 'to deny, to call false' },
	{ id: 'yatim', loc: '107:2:4:2', gloss: 'orphan' },
	{ id: 'ala', loc: '107:3:3:1', gloss: 'on, upon' },
	{ id: 'taam', loc: '107:3:4:1', gloss: 'food' },
	{ id: 'miskin', loc: '107:3:5:2', gloss: 'needy person' },
	{ id: 'wayl', loc: '107:4:1:2', gloss: 'woe' },
	{ id: 'musalli', loc: '107:4:2:3', gloss: 'one who prays' },
	{ id: 'an', loc: '107:5:3:1', gloss: 'from, about' },
	{ id: 'salat', loc: '107:5:4:1', gloss: 'prayer' },
	{ id: 'manaa', loc: '107:7:1:2', gloss: 'to withhold, to refuse' },
	// Al-Fil
	{ id: 'kayfa', loc: '105:1:3:1', gloss: 'how' },
	{ id: 'faala', loc: '105:1:4:1', gloss: 'to do' },
	{ id: 'ashab', loc: '105:1:6:2', gloss: 'companions, people of' },
	{ id: 'jaala', loc: '105:2:2:1', gloss: 'to make, to place' },
	{ id: 'kayd', loc: '105:2:3:1', gloss: 'plot, scheme' },
	{ id: 'arsala', loc: '105:3:1:2', gloss: 'to send' },
	{ id: 'tayr', loc: '105:3:3:1', gloss: 'birds' },
	{ id: 'rama', loc: '105:4:1:1', gloss: 'to throw, to pelt' },
	{ id: 'hijara', loc: '105:4:2:2', gloss: 'stones' },
	{ id: 'sijjil', loc: '105:4:4:1', gloss: 'baked clay' },
	{ id: 'asf', loc: '105:5:2:2', gloss: 'husks, chaff' }
];
