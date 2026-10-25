import { describe, expect, it } from 'vitest';
import { pluralsLesson } from './plurals';
import { choice, has, kindOf, rootOf, stringsOf, textAt } from '../testing/corpus';

/**
 * Checks `plurals.ts` against the corpus: every singular-plural pair shares the same three-letter
 * root, and every plural word is tagged as a plural noun (`MP` or plural gloss).
 */

const strings = stringsOf(pluralsLesson).join('\n');

const pairs: [string, string][] = [
	['67:2:8', '99:6:6'],
	['68:14:4', '71:12:2'],
	['67:4:3', '67:23:8'],
	['1:4:2', '69:7:6'],
	['94:1:4', '100:10:4'],
	['67:22:5', '75:22:1'],
	['96:10:1', '76:6:4'],
	['76:3:3', '71:20:3']
];

describe('the lesson on broken plural patterns', () => {
	it.each(pairs)('singular %s and plural %s share the same root in the corpus', (sg, pl) => {
		expect(kindOf(sg)).toBe('noun');
		expect(kindOf(pl)).toBe('noun');
		expect(rootOf(sg)).toBe(rootOf(pl));
		expect(has(pl, 'MP')).toBe(true);
	});

	it('is right that abwāban, qulūbun, al-jibāl, and ṣuḥufin are plural nouns in the corpus', () => {
		for (const ref of ['78:19:4', '79:8:1', '77:10:2', '80:13:2']) {
			expect(kindOf(ref), ref).toBe('noun');
			expect(has(ref, 'MP') || has(ref, 'FP'), ref).toBe(true);
		}
	});

	it('asks for the plural of ʿamalan and the singular of wujūhun', () => {
		expect(choice(pluralsLesson, 'plur-1').answer.text).toBe(textAt('99:6:6'));
		expect(choice(pluralsLesson, 'plur-3').answer.text).toBe(textAt('67:22:5'));
	});

	it('taps al-ṣudūr in verse 100:10, which is the fourth word', () => {
		const tap = pluralsLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		expect(tap.words.map((w) => w.text)).toEqual([1, 2, 3, 4].map((n) => textAt(`100:10:${n}`)));
		const tapped = tap.words.findIndex((w) => w.id === tap.answerId) + 1;
		expect(tapped).toBe(4);
		expect(rootOf(`100:10:${tapped}`)).toBe('صدر');
	});

	it('names all key words in the lesson strings', () => {
		for (const [sg, pl] of pairs) {
			expect(strings).toContain(textAt(sg));
			expect(strings).toContain(textAt(pl));
		}
		for (const ref of ['78:19:4', '79:8:1', '77:10:2', '80:13:2']) {
			expect(strings).toContain(textAt(ref));
		}
	});
});
