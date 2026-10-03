/** English names of the surahs the course teaches from. Transliterated names, not Quran text. */
const names: Record<number, string> = {
	1: 'Al-Fatiha',
	105: 'Al-Fil',
	106: 'Quraysh',
	107: 'Al-Ma’un',
	108: 'Al-Kawthar',
	109: 'Al-Kafirun',
	110: 'An-Nasr',
	111: 'Al-Masad',
	112: 'Al-Ikhlas',
	113: 'Al-Falaq',
	114: 'An-Nas'
};

export function surahName(surah: number): string {
	const name = names[surah];
	if (!name) throw new Error(`No name for surah ${surah}`);
	return name;
}
