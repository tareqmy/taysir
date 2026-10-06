import { describe, expect, it } from 'vitest';
import { agreementLesson } from './agreement';
import {
	choice,
	has,
	hasArticle,
	refOf,
	refsOf,
	neighbours,
	sideBySide,
	stringsOf,
	studiedBeforeLaterGrammar as studied,
	textAt
} from '../testing/corpus';

/**
 * What the lesson on describing words says about each pair of words, checked against the
 * corpus's tags: the pairs it calls matching really match in whether they have ال, gender, number
 * and case, and the questions' right and wrong answers are what they are said to be.
 */

const gender = (ref: string) => (['F', 'FS', 'FP', 'FD'].some((t) => has(ref, t)) ? 'F' : 'M');
const number = (ref: string) =>
	['MP', 'FP'].some((t) => has(ref, t))
		? 'many'
		: ['MD', 'FD'].some((t) => has(ref, t))
			? 'two'
			: 'one';
const caseOf = (ref: string) => ['NOM', 'ACC', 'GEN'].find((t) => has(ref, t));

/** The noun and the word that describes it, in each example the lesson gives. */
const matching = [
	['1:6:2', '1:6:3'],
	['78:13:2', '78:13:3'],
	['88:12:2', '88:12:3'],
	['89:27:2', '89:27:3'],
	['80:42:3', '80:42:4'],
	['83:9:1', '83:9:2'],
	['105:5:2', '105:5:3']
];

const strings = stringsOf(agreementLesson).join('\n');

describe('the lesson on describing words', () => {
	it.each(matching)('%s and %s match in ال, gender, number and case', (noun, describing) => {
		expect(has(describing, 'ADJ'), 'the second word describes the first').toBe(true);
		expect(hasArticle(describing)).toBe(hasArticle(noun));
		expect(gender(describing)).toBe(gender(noun));
		expect(number(describing)).toBe(number(noun));
		expect(caseOf(describing)).toBeDefined();
		expect(caseOf(describing)).toBe(caseOf(noun));
	});

	it.each(matching)('shows %s and %s together, one after the other', (noun, describing) => {
		expect(strings).toContain(`${textAt(noun)} ${textAt(describing)}`);
	});

	it('only writes two Arabic words side by side when they stand so in a verse and match there', () => {
		const pairs = sideBySide(strings);
		expect(pairs.length).toBeGreaterThan(8);
		for (const [noun, describing] of pairs) {
			const where = neighbours(noun, describing, studied);
			expect(where.length, `${noun} ${describing} is a pair in the Quran`).toBeGreaterThan(0);
			// Every pair matches in all four, except a plural of things, which takes a feminine singular.
			const matches = ([a, b]: readonly [string, string]) =>
				(has(b, 'ADJ') || has(b, 'PASS_PCPL')) &&
				hasArticle(a) === hasArticle(b) &&
				caseOf(a) === caseOf(b) &&
				(gender(a) === gender(b) ||
					(number(a) === 'many' && number(b) === 'one' && gender(b) === 'F'));
			expect(where.some(matches), `${noun} ${describing} matches`).toBe(true);
		}
	});

	it('is right that a feminine noun has a feminine describing word, and a masculine one does not', () => {
		expect(gender('88:12:2')).toBe('F');
		expect(gender('88:12:3')).toBe('F');
		expect(gender('83:9:1')).toBe('M');
		expect(gender('83:9:2')).toBe('M');
	});

	it('is right that a plural of things takes a feminine singular describing word', () => {
		expect(number('88:13:2')).toBe('many');
		expect(number('88:13:3')).toBe('one');
		expect(gender('88:13:3')).toBe('F');
		expect(has('88:13:3', 'ADJ') || has('88:13:3', 'PASS_PCPL')).toBe(true);
	});

	it('asks which word fits the spring, with the right word and two that do not fit', () => {
		const { answer, others } = choice(agreementLesson, 'agree-3');
		expect(refsOf(answer.text, studied)).toContain('88:12:3');
		// The wrong words are not feminine nouns' describing words in the spring's case, wherever they appear.
		for (const o of others) {
			for (const ref of refsOf(o.text, studied)) {
				expect(
					gender(ref) === 'F' && caseOf(ref) === caseOf('88:12:3'),
					`${o.text} at ${ref}`
				).toBe(false);
			}
		}
		// One is masculine in the same case, so it can only be wrong for its gender.
		const sameCaseMasculine = others.some((o) =>
			refsOf(o.text, studied).every(
				(ref) => gender(ref) === 'M' && caseOf(ref) === caseOf('88:12:3')
			)
		);
		expect(sameCaseMasculine).toBe(true);
	});

	it('asks for the phrase with ال on both words, and only one has it', () => {
		const { answer, others } = choice(agreementLesson, 'agree-8');
		const words = (phrase: string) => phrase.split(' ').map((t) => refOf(t, studied));
		expect(words(answer.text).every(hasArticle)).toBe(true);
		for (const o of others) expect(words(o.text).some(hasArticle), o.text).toBe(false);
	});

	it('says the disbelievers and the wicked are plural and have ال', () => {
		expect(number('80:42:3')).toBe('many');
		expect(number('80:42:4')).toBe('many');
		expect(hasArticle('80:42:3') && hasArticle('80:42:4')).toBe(true);
	});

	it('says ال on the noun means ال on its describing word', () => {
		expect(hasArticle('1:6:2')).toBe(true);
		expect(hasArticle('1:6:3')).toBe(true);
		expect(hasArticle('78:13:2') || hasArticle('78:13:3')).toBe(false);
	});
});
