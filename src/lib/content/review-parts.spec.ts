import { describe, expect, it } from 'vitest';
import { PARTS } from '../../../scripts/review-sheets';
import { units } from './course';

describe('review parts', () => {
	it('cover every course unit exactly once, so no unit is left out of the review', () => {
		const listed = PARTS.flatMap((p) => p.unitIds);
		expect(new Set(listed).size, 'a unit is in two parts').toBe(listed.length);
		expect([...listed].sort()).toEqual(units.map((u) => u.id).sort());
	});

	it('are numbered from 1 and have distinct file names', () => {
		expect(PARTS.map((p) => p.n)).toEqual(PARTS.map((_, i) => i + 1));
		expect(new Set(PARTS.map((p) => p.slug)).size).toBe(PARTS.length);
	});
});
