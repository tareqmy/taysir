/**
 * How the import (`apply-review.ts`) reads what a reviewer typed, and how it writes a correction
 * into a data file. Kept apart from the script, which reads a spreadsheet and writes files, so that
 * it can be tested.
 */

const ESCAPES: Record<string, string> = {
	'\\': '\\\\',
	"'": "\\'",
	'\n': '\\n',
	'\r': '\\r',
	'\u2028': '\\u2028',
	'\u2029': '\\u2029'
};

/** A single-quoted TypeScript string literal for `text`, whatever characters it holds. */
export const encode = (text: string) =>
	`'${text.replace(/[\\'\n\r\u2028\u2029]/g, (ch) => ESCAPES[ch])}'`;

/** The value of a string literal as written in source, quotes included. */
export function decode(literal: string): string {
	return literal.slice(1, -1).replace(/\\(u[0-9a-fA-F]{4}|.)/g, (_, escape: string) => {
		if (escape === 'n') return '\n';
		if (escape === 'r') return '\r';
		if (escape.length === 5) return String.fromCharCode(parseInt(escape.slice(1), 16));
		return escape;
	});
}

/**
 * A correction as it goes into the data. A gloss or a meaning is one line, so a line break (Alt+Enter
 * in a cell, or a pasted paragraph) and any run of spaces become one space, and invisible control
 * characters are dropped. Empty when nothing is left.
 */
export const cleanCorrection = (text: string) =>
	text
		.replace(/\s+/g, ' ')
		.replace(/\p{Cc}/gu, '')
		.trim();

/** What a reviewer marked a row: one of the three choices, nothing, or something else typed in. */
export type Status = 'ok' | 'change' | 'unsure' | 'blank' | 'unknown';

export function statusOf(cell: string | undefined): Status {
	const status = (cell ?? '').trim().toLowerCase();
	if (!status) return 'blank';
	return status === 'ok' || status === 'change' || status === 'unsure' ? status : 'unknown';
}

/**
 * `source` with the text `match` found at `index` replaced by `replacement`, taken literally (a
 * correction such as “cost $& more” must not be read as a replacement pattern).
 */
export const replaceAt = (source: string, index: number, match: string, replacement: string) =>
	source.slice(0, index) + replacement + source.slice(index + match.length);
