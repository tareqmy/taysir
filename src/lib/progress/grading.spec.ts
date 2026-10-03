import { describe, expect, it } from 'vitest';
import { EASY_MS, gradeAnswer, HARD_MS } from './grading';

describe('gradeAnswer', () => {
	it('grades a wrong answer as Again however long it took', () => {
		expect(gradeAnswer(false)).toBe('again');
		expect(gradeAnswer(false, 500)).toBe('again');
		expect(gradeAnswer(false, 60_000)).toBe('again');
	});

	it('grades a quick right answer as Easy', () => {
		expect(gradeAnswer(true, 0)).toBe('easy');
		expect(gradeAnswer(true, 1200)).toBe('easy');
		expect(gradeAnswer(true, EASY_MS)).toBe('easy');
	});

	it('grades a right answer of ordinary speed as Good', () => {
		expect(gradeAnswer(true, EASY_MS + 1)).toBe('good');
		expect(gradeAnswer(true, 6000)).toBe('good');
		expect(gradeAnswer(true, HARD_MS)).toBe('good');
	});

	it('grades a slow right answer as Hard', () => {
		expect(gradeAnswer(true, HARD_MS + 1)).toBe('hard');
		expect(gradeAnswer(true, 45_000)).toBe('hard');
	});

	it('grades a right answer as Good when there is no usable time', () => {
		expect(gradeAnswer(true)).toBe('good');
		expect(gradeAnswer(true, undefined)).toBe('good');
		expect(gradeAnswer(true, Number.NaN)).toBe('good');
		expect(gradeAnswer(true, -5)).toBe('good');
	});
});
