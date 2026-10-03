/** Spaced-repetition card ids: `lx:<lexemeId>` for words, `lt:<letterId>` for letters. */

export const lexemeCardId = (id: string) => `lx:${id}`;
export const letterCardId = (id: string) => `lt:${id}`;

export type ParsedCardId = { type: 'lexeme' | 'letter'; id: string };

export function parseCardId(cardId: string): ParsedCardId {
	const [prefix, ...rest] = cardId.split(':');
	const id = rest.join(':');
	if (prefix === 'lx') return { type: 'lexeme', id };
	if (prefix === 'lt') return { type: 'letter', id };
	throw new Error(`Unknown card id: ${cardId}`);
}
