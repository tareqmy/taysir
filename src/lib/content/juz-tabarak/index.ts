import { buildUnit } from '../surah-lessons';
import type { Unit } from '../types';
import { unitSpec as unit1 } from './unit-1';
import { unitSpec as unit2 } from './unit-2';
import { unitSpec as unit3 } from './unit-3';
import { unitSpec as unit4 } from './unit-4';

/** Surahs 77 down to 67, after Juz Amma, in the order they are taught. A unit not yet written has no lessons and is left out. */
export const juzTabarakUnits: Unit[] = [unit1, unit2, unit3, unit4]
	.map(buildUnit)
	.filter((unit) => unit.lessons.length > 0);
