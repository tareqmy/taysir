import { describe, expect, it } from 'vitest';
import { weakLesson } from './weak';
import { choice, has, kindOf, rootOf, stringsOf, textAt } from '../testing/corpus';

/**
 * Checks `weak.ts` against the corpus roots and verb tags: doubled roots have identical 2nd and
 * 3rd root letters, wāw-initial roots start with و, hollow roots have و or ي in the middle, and
 * weak-ending roots end with و or ي.
 */

const strings = stringsOf(weakLesson).join('\n');

describe('the lesson on doubled and weak Form I verbs', () => {
	it('is right that the doubled verbs have identical 2nd and 3rd root letters in Form I', () => {
		for (const ref of ['68:7:6', '70:20:2', '95:5:2', '72:7:2', '72:7:4']) {
			expect(kindOf(ref), ref).toBe('verb');
			expect(has(ref, 'VF:1'), ref).toBe(true);
			const [, b, c] = [...rootOf(ref)!];
			expect(b, ref).toBe(c);
		}
	});

	it('is right that wajadnāhā and yajidū share a wāw-initial root in Form I', () => {
		expect(rootOf('72:8:4')).toBe('وجد');
		expect(rootOf('71:25:7')).toBe('وجد');
		expect(has('72:8:4', 'VF:1')).toBe(true);
		expect(has('71:25:7', 'VF:1')).toBe(true);
	});

	it('is right that the hollow verbs have a weak middle root letter (و or ي) in Form I', () => {
		for (const ref of ['79:40:3', '72:13:11', '67:9:1', '67:9:7', '67:23:1', '67:18:7']) {
			expect(kindOf(ref), ref).toBe('verb');
			expect(has(ref, 'VF:1'), ref).toBe(true);
			const [, b] = [...rootOf(ref)!];
			expect(['و', 'ي']).toContain(b);
		}
	});

	it('is right that the weak-ending verbs end their root with و or ي in Form I', () => {
		for (const ref of ['72:2:1', '1:6:1', '85:11:8', '80:9:2', '71:5:4']) {
			expect(kindOf(ref), ref).toBe('verb');
			expect(has(ref, 'VF:1'), ref).toBe(true);
			const [, , c] = [...rootOf(ref)!];
			expect(['و', 'ي']).toContain(c);
		}
	});

	it('asks for the present-tense partner of wajadnāhā', () => {
		const two = choice(weakLesson, 'weak-2');
		expect(two.answer.text).toBe(textAt('71:25:7'));
	});

	it('taps yajidū in verse 71:25, which is the seventh word', () => {
		const tap = weakLesson.exercises.find((e) => e.kind === 'tap');
		if (tap?.kind !== 'tap') throw new Error('no tap question');
		const tapped = tap.words.findIndex((w) => w.id === tap.answerId) + 1;
		expect(tapped).toBe(7);
		expect(rootOf(`71:25:${tapped}`)).toBe('وجد');
	});

	it('names all key words in the lesson strings', () => {
		for (const ref of [
			'68:7:6',
			'95:5:2',
			'72:7:2',
			'72:7:4',
			'72:8:4',
			'71:25:7',
			'79:40:3',
			'72:13:11',
			'67:9:1',
			'67:23:1',
			'72:2:1',
			'1:6:1',
			'85:11:8',
			'80:9:2',
			'71:5:4'
		]) {
			expect(strings).toContain(textAt(ref));
		}
	});
});
