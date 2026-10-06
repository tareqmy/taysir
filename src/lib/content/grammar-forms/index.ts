import type { Unit } from '../types';
import { causeLesson } from './cause';
import { nounsLesson } from './nouns';
import { prefixLesson } from './prefix';
import { selfLesson } from './self';

/**
 * Unit: verb forms and noun patterns. A root takes different shapes, and a shape changes the
 * meaning in a regular way: a doubled middle letter, an a- in the past, ta-, in-, it- and ist- in
 * front, and the patterns behind nouns that name a place, a quality or “the most”.
 *
 * Every example is a word the learner has already met, usually as a vocabulary card, and all Arabic
 * comes from the corpus through `wordText(surah, ayah, word)`.
 */
export const grammarFormsUnit: Unit = {
	id: 'grammar-forms',
	title: 'Verb forms and noun patterns',
	description:
		'The same root in different shapes: a doubled middle letter, a- and ta- in front, and the patterns behind words for a place, a quality and “the most”. Every example is a word you have already met.',
	lessons: [causeLesson, selfLesson, prefixLesson, nounsLesson]
};
