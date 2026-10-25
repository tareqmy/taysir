import type { Unit } from '../types';
import { agreementLesson } from './agreement';
import { conditionsLesson } from './conditions';
import { directionsLesson } from './directions';
import { exceptionsLesson } from './exceptions';
import { idhaLesson } from './idha';
import { maLesson } from './ma';
import { oathsLesson } from './oaths';
import { personsLesson } from './persons';
import { questionsLesson } from './questions';

/**
 * Unit: grammar from the later surahs. Nine ideas that Juz Amma shows again and again and that earlier
 * lessons only touched in a note: describing words matching their noun, the other persons of the
 * past tense, runs of “when”, conditions, exceptions, oaths, the many jobs of mā and its joined
 * forms, places/directions/possession, and questions with balā, kallā, lan and lammā.
 *
 * The unit comes after the last of the surahs it draws on, so every example is a word the learner
 * has studied. All Arabic comes from the corpus through `wordText(surah, ayah, word)`.
 */
export const grammarLaterUnit: Unit = {
	id: 'grammar-later',
	title: 'Grammar from the later surahs',
	description:
		'Describing words matching their noun, past-tense verbs for “she” and “they”, “when”, “if”, “except”, oaths, mā and its joined forms, directions, and questions. Every example is a word you have already met.',
	lessons: [
		agreementLesson,
		personsLesson,
		idhaLesson,
		conditionsLesson,
		exceptionsLesson,
		oathsLesson,
		maLesson,
		directionsLesson,
		questionsLesson
	]
};
