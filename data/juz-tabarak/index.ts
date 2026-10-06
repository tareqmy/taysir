/** The authored data for the 29th juz (surahs 77 down to 67), one module per course unit (see `src/lib/content/juz-tabarak`). */
import type { UnitData } from '../juz-amma/index.ts';
import * as unit1 from './1.ts';
import * as unit2 from './2.ts';
import * as unit3 from './3.ts';
import * as unit4 from './4.ts';

export interface TabarakUnitData extends UnitData {
	/** The surahs of the unit, so the build knows which verses to include. */
	surahs: number[];
}

export const juzTabarakUnits: TabarakUnitData[] = [unit1, unit2, unit3, unit4];
