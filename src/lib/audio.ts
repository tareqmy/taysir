/** Streams human recitation from public Quran audio CDNs; nothing is bundled. */

const pad = (n: number) => String(n).padStart(3, '0');

export const verseAudioUrl = (surah: number, ayah: number) =>
	`https://everyayah.com/data/Alafasy_128kbps/${pad(surah)}${pad(ayah)}.mp3`;

export const wordAudioUrl = (surah: number, ayah: number, word: number) =>
	`https://audio.qurancdn.com/wbw/${pad(surah)}_${pad(ayah)}_${pad(word)}.mp3`;

/** Word audio for a corpus location such as `2:64:10:2` (the segment is ignored). */
export function wordAudioFromLoc(loc: string): string {
	const [surah, ayah, word] = loc.split(':').map(Number);
	return wordAudioUrl(surah, ayah, word);
}

let current: HTMLAudioElement | undefined;

/** Plays one clip at a time. Resolves false if the clip could not be played (e.g. offline). */
export async function playAudio(url: string): Promise<boolean> {
	if (typeof Audio === 'undefined') return false;
	current?.pause();
	const clip = new Audio(url);
	current = clip;
	try {
		await clip.play();
		return true;
	} catch (error) {
		// A clip still loading when another is started is stopped on purpose, which the browser
		// reports as an interrupted play. That is not a clip that cannot be played.
		return clip !== current || (error instanceof DOMException && error.name === 'AbortError');
	}
}
