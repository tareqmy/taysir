/** How a review answer went, in the four grades the spaced-repetition scheduler understands. */
export type Grade = 'again' | 'hard' | 'good' | 'easy';

/** A right answer given within this time was effortless: “Easy”, so it comes back later. */
export const EASY_MS = 3500;

/** A right answer that took longer than this was a struggle: “Hard”, so it comes back sooner. */
export const HARD_MS = 9000;

/**
 * Grades one answer to a review question. A wrong answer is always “Again”. A right answer is
 * graded by how long it took, measured from when the question appeared to when it was answered.
 * Without a usable time (for example the learner left the page mid-question) it is “Good”.
 */
export function gradeAnswer(correct: boolean, elapsedMs?: number): Grade {
	if (!correct) return 'again';
	if (elapsedMs === undefined || !(elapsedMs >= 0)) return 'good';
	if (elapsedMs <= EASY_MS) return 'easy';
	if (elapsedMs > HARD_MS) return 'hard';
	return 'good';
}
