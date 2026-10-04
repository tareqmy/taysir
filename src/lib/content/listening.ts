import { lexemeById, lexicon } from '../data';
import { rngFor, shuffle } from '../random';
import { listenMeaning } from './exercises';
import type { Lesson } from './types';

/**
 * One “hear a word, choose its meaning” question for each vocabulary lesson, about one of the words
 * the lesson teaches. It is a different word from lesson to lesson, chosen with a generator seeded
 * from the lesson id so it stays the same between visits.
 */
export function withWordListening(lesson: Lesson): Lesson {
	if (lesson.kind !== 'vocabulary' || lesson.cardIds.length === 0) return lesson;
	const rng = rngFor(`listen:${lesson.id}`);
	const [cardId] = shuffle(lesson.cardIds, rng);
	const lexeme = lexemeById(cardId.replace(/^lx:/, ''));
	return {
		...lesson,
		exercises: [...lesson.exercises, listenMeaning(lexeme, lexicon.lexemes, rng)]
	};
}
