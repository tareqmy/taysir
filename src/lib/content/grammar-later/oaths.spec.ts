import { describe, expect, it } from 'vitest';
import { oathsLesson } from './oaths';
import { anyPiece, choice, has, kindOf, pieces, stringsOf, textAt } from '../testing/corpus';

/**
 * What the lesson on oaths says about each word, checked against the corpus's tags: the wa- that
 * begins an oath is a preposition and the later ones are “and”, the noun sworn by is genitive, and
 * the answer starts with a word of emphasis.
 */

const strings = stringsOf(oathsLesson).join('\n');

/** The first piece of the word, which is where a prefix like wa- is. */
const firstPiece = (ref: string) => pieces(ref)[0];

/** The first words of oaths the lesson shows, where wa- swears. */
const oathStarts = ['103:1:1', '91:1:1', '95:1:1', '89:1:1'];
/** Words that continue an oath with wa- “and”. */
const oathContinues = ['91:2:1', '91:3:1', '91:5:1', '95:2:1'];

describe('the lesson on oaths', () => {
	it.each(oathStarts)(
		'%s starts an oath: wa- is a preposition, and the noun is genitive',
		(ref) => {
			expect(firstPiece(ref).features).toContain('PREF');
			expect(firstPiece(ref).features).not.toContain('CONJ');
			expect(firstPiece(ref).pos).toBe('P');
			expect(kindOf(ref)).toBe('noun');
			expect(has(ref, 'GEN')).toBe(true);
		}
	);

	it.each(oathContinues)('%s goes on with wa- “and”, and its noun is genitive too', (ref) => {
		expect(firstPiece(ref).features).toContain('CONJ');
		expect(has(ref, 'GEN')).toBe(true);
	});

	it('is right that the answer starts with a word of emphasis', () => {
		expect(has('91:9:1', 'CERT')).toBe(true); // qad
		expect(has('103:2:1', 'ACC')).toBe(true); // inna
		expect(anyPiece('95:4:1', 'EMPH') && anyPiece('95:4:1', 'CERT')).toBe(true); // la-qad
		expect(anyPiece('103:2:3', 'EMPH')).toBe(true); // la-: emphasis at the other end
	});

	it('asks which of three starts the oath, and it is the only one with the wa- of an oath', () => {
		const { answer, others } = choice(oathsLesson, 'oath-2');
		expect(answer.text).toBe(textAt('91:1:1'));
		expect(others.map((o) => o.text).sort()).toEqual([textAt('91:2:1'), textAt('91:3:1')].sort());
		for (const ref of ['91:2:1', '91:3:1']) expect(firstPiece(ref).features).toContain('CONJ');
	});

	it('asks which word begins the answer, and it is not a wa- of an oath', () => {
		const { answer, others } = choice(oathsLesson, 'oath-5');
		expect(answer.text).toBe(textAt('91:9:1'));
		expect(has('91:9:1', 'CERT')).toBe(true);
		expect(others.map((o) => o.text).sort()).toEqual([textAt('91:3:1'), textAt('91:5:1')].sort());
		for (const ref of ['91:3:1', '91:5:1']) expect(firstPiece(ref).features).toContain('CONJ');
	});

	it('asks what the first word of the answer to “by time” means', () => {
		const six = choice(oathsLesson, 'oath-6');
		expect(six.answer.text).toBe('indeed');
		expect(has('103:2:1', 'ACC')).toBe(true);
		expect(six.exercise.prompt?.text).toBe(textAt('103:2:1'));
	});

	it('asks for the genitive ending, and every noun sworn by is genitive', () => {
		expect(choice(oathsLesson, 'oath-4').answer.text).toBe('-i (genitive)');
		for (const ref of oathStarts) expect(has(ref, 'GEN'), ref).toBe(true);
	});

	it('matches only the openings of oaths', () => {
		const match = oathsLesson.exercises.find((e) => e.id === 'oath-7');
		if (match?.kind !== 'match') throw new Error('no match question');
		expect(match.pairs.map((p) => p.left.text).sort()).toEqual(oathStarts.map(textAt).sort());
	});

	it('taps la-qad, the start of the answer to At-Tin’s three oaths', () => {
		const tap = oathsLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		expect(tap.words.map((w) => w.text)).toEqual(
			[1, 2, 3, 4, 5, 6].map((n) => textAt(`95:4:${n}`))
		);
		expect(tap.words.findIndex((w) => w.id === tap.answerId)).toBe(0);
		expect(anyPiece('95:4:1', 'CERT')).toBe(true);
		// The oaths it answers are verses 1 to 3 of the same surah.
		for (const ref of ['95:1:1', '95:2:1', '95:3:1']) expect(pieces(ref).length).toBeGreaterThan(0);
	});

	it('names the words it points at', () => {
		for (const ref of ['103:1:1', '91:1:1', '91:2:1', '91:9:1', '103:2:1', '95:4:1']) {
			expect(strings).toContain(textAt(ref));
		}
	});
});
