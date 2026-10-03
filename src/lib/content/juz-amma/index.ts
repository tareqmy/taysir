import { buildUnit } from '../surah-lessons';
import type { Unit } from '../types';
import { unitSpec as unit1 } from './unit-1';
import { unitSpec as unit2 } from './unit-2';
import { unitSpec as unit3 } from './unit-3';
import { unitSpec as unit4 } from './unit-4';
import { unitSpec as unit5 } from './unit-5';
import { unitSpec as unit6 } from './unit-6';
import { unitSpec as unit7 } from './unit-7';

/** Surahs 104 down to 78, after the short surahs 105–114, in the order they are taught. */
export const juzAmmaUnits: Unit[] = [unit1, unit2, unit3, unit4, unit5, unit6, unit7].map(
	buildUnit
);
