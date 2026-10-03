export interface TextPart {
	text: string;
	ar: boolean;
}

const ARABIC = '\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF';
/** A run of Arabic letters, allowing single spaces between Arabic words. */
const RUN = new RegExp(`[${ARABIC}]+(?:[ \\u200D]+[${ARABIC}]+)*`, 'g');

/** Splits mixed English/Arabic text so each Arabic run can be set in the Arabic typeface. */
export function splitArabic(text: string): TextPart[] {
	const parts: TextPart[] = [];
	let last = 0;
	for (const match of text.matchAll(RUN)) {
		if (match.index > last) parts.push({ text: text.slice(last, match.index), ar: false });
		parts.push({ text: match[0], ar: true });
		last = match.index + match[0].length;
	}
	if (last < text.length) parts.push({ text: text.slice(last), ar: false });
	return parts;
}
