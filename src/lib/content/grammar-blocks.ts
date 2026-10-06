import type { Block } from './types';

/** Teaching blocks the hand-written grammar lessons share. */

export const rule = (title: string, body: string): Block => ({ type: 'rule', title, body });
export const text = (title: string, body: string): Block => ({ type: 'text', title, body });

export const verse = (surah: number, ayah: number, note?: string): Block => ({
	type: 'verse',
	surah,
	ayah,
	note
});

/** Words `from` to `to` of a verse, with an English line and an optional note. */
export const phrase = (
	surah: number,
	ayah: number,
	from: number,
	to: number,
	translation: string,
	note?: string,
	options: { split?: boolean; highlight?: 'affixes' } = {}
): Block => ({ type: 'phrase', surah, ayah, from, to, translation, note, ...options });
