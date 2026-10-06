import { describe, expect, it } from 'vitest';
import { nounsLesson } from './nouns';
import {
	choice,
	glossAt,
	kindOf,
	lemmaOf,
	plainEnglish,
	refsOf,
	rootOf,
	stringsOf,
	studiedBeforeLaterGrammar as studied,
	textAt
} from '../testing/corpus';

/**
 * What the lesson on noun patterns says, checked against the letters of each word and its root in
 * the corpus: the words it gives as a quality have a long ī before the last root letter, the “most”
 * words begin with a- followed by the root letters, and the place words begin with ma- or mi-.
 */

/** A word's dictionary form without its vowel marks, so its letters can be compared. */
const letters = (ref: string) => lemmaOf(ref)!.replace(/[ً-ٰٟۖ-ۭـ]/g, '');

/** A root's three letters, as the corpus stores them. */
const root = (ref: string) => [...rootOf(ref)!];

/** A quality: the first two root letters, a long ī, then the last root letter. */
const isQuality = (ref: string) => {
	const [a, b, c] = root(ref);
	return letters(ref) === `${a}${b}ي${c}`;
};

/** “More” or “the most”: a- in front of the three root letters. */
const isMost = (ref: string) => letters(ref) === `أ${root(ref).join('')}`;

/** A place: ma- or mi- in front of the word, and a meaning that is a place. */
const isPlaceShape = (ref: string) => letters(ref).startsWith('م');

const places = ['78:22:2', '79:39:4', '78:6:4', '79:40:4'];
const qualities = ['1:3:2', '85:8:8', '84:15:6', '100:11:5'];
const most = ['95:4:5', '95:5:3', '88:24:4', '84:23:2'];

const strings = stringsOf(nounsLesson).join('\n');

describe('the lesson on noun patterns', () => {
	it.each(places)('%s starts with ma- or mi-, and is a noun', (ref) => {
		expect(kindOf(ref)).toBe('noun');
		expect(isPlaceShape(ref)).toBe(true);
	});

	it('glosses each place word as a place, and the time word as a time', () => {
		for (const ref of places) {
			expect(plainEnglish(glossAt(ref)), ref).toMatch(/place|abode|standing|resting/);
		}
		expect(plainEnglish(glossAt('78:17:5'))).toMatch(/time/);
		expect(isPlaceShape('78:17:5')).toBe(true);
	});

	it.each(qualities)('%s has the long ī before the last root letter', (ref) => {
		expect(kindOf(ref)).toBe('noun');
		expect(isQuality(ref)).toBe(true);
	});

	it.each(most)('%s is a- followed by the root letters', (ref) => {
		expect(kindOf(ref)).toBe('noun');
		expect(isMost(ref)).toBe(true);
	});

	it.each([...places, ...qualities, ...most, '78:17:5'])('names %s in the lesson', (ref) => {
		expect(strings).toContain(textAt(ref));
	});

	it('asks which word names a place, with no wrong answer that has the shape', () => {
		const { answer, others } = choice(nounsLesson, 'nouns-1');
		expect(refsOf(answer.text, studied).some(isPlaceShape)).toBe(true);
		for (const o of others) {
			for (const ref of refsOf(o.text, studied).filter((r) => kindOf(r) === 'noun')) {
				expect(isPlaceShape(ref), `${o.text} at ${ref}`).toBe(false);
			}
		}
	});

	it('asks which word is a quality, with no wrong answer that is one', () => {
		const { answer, others } = choice(nounsLesson, 'nouns-3');
		expect(refsOf(answer.text, studied).some((r) => kindOf(r) === 'noun' && isQuality(r))).toBe(
			true
		);
		for (const o of others) {
			for (const ref of refsOf(o.text, studied).filter((r) => kindOf(r) === 'noun')) {
				expect(isQuality(ref), `${o.text} at ${ref}`).toBe(false);
			}
		}
	});

	it('asks for a “most” word twice, and the wrong answers are not “most” words', () => {
		for (const id of ['nouns-5', 'nouns-7']) {
			const { answer, others } = choice(nounsLesson, id);
			expect(
				refsOf(answer.text, studied).some((r) => kindOf(r) === 'noun' && isMost(r)),
				id
			).toBe(true);
			for (const o of others) {
				for (const ref of refsOf(o.text, studied).filter((r) => kindOf(r) === 'noun')) {
					expect(isMost(ref), `${id}: ${o.text} at ${ref}`).toBe(false);
				}
			}
		}
	});

	it('matches only qualities', () => {
		const match = nounsLesson.exercises.find((e) => e.id === 'nouns-4');
		if (match?.kind !== 'match') throw new Error('no match question');
		expect(match.pairs.map((p) => p.left.text).sort()).toEqual(qualities.map(textAt).sort());
	});

	it('taps the “greatest” of verse 88:24, the fourth word', () => {
		const tap = nounsLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		expect(tap.words.map((w) => w.text)).toEqual([1, 2, 3, 4].map((n) => textAt(`88:24:${n}`)));
		const tapped = tap.words.findIndex((w) => w.id === tap.answerId) + 1;
		expect(tapped).toBe(4);
		expect(isMost(`88:24:${tapped}`)).toBe(true);
	});
});
