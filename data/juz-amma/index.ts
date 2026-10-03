/** The authored data for Juz Amma surahs 78–104, one module per course unit (see `src/lib/content/juz-amma`). */
import type { LexemeSeed } from '../lexicon-seeds.ts';
import * as unit1 from './1.ts';
import * as unit2 from './2.ts';
import * as unit3 from './3.ts';
import * as unit4 from './4.ts';
import * as unit5 from './5.ts';
import * as unit6 from './6.ts';
import * as unit7 from './7.ts';

export interface UnitData {
	/** Word-by-word glosses keyed `surah:ayah:word`. */
	glosses: Record<string, string>;
	seeds: LexemeSeed[];
}

export const juzAmmaUnits: UnitData[] = [unit1, unit2, unit3, unit4, unit5, unit6, unit7];
