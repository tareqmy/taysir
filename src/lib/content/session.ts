import type { Exercise } from './types';

export interface RunSummary {
	total: number;
	/** Exercises answered right on the first attempt. */
	firstTryCorrect: number;
	/** For each card practised: true only if every exercise for it was right first time. */
	byCard: Record<string, boolean>;
}

/** `firstTry` maps exercise id → whether the first attempt was right. */
export function summarize(
	exercises: readonly Exercise[],
	firstTry: ReadonlyMap<string, boolean>
): RunSummary {
	const byCard: Record<string, boolean> = {};
	let firstTryCorrect = 0;
	for (const exercise of exercises) {
		const correct = firstTry.get(exercise.id) ?? false;
		if (correct) firstTryCorrect++;
		if (exercise.cardId) byCard[exercise.cardId] = (byCard[exercise.cardId] ?? true) && correct;
	}
	return { total: exercises.length, firstTryCorrect, byCard };
}
