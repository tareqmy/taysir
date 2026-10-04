import { shuffle, type Rng } from '../random';
import type { StoredCard } from './scheduler';
import { strengthOf, type Strength } from './stats';

/** Weakest first: what is still being learned, then what is familiar, then what is well known. */
const WEAKEST_FIRST: Strength[] = ['learning', 'familiar', 'wellKnown'];

/**
 * The cards to drill in extra practice. Practice does not move the review schedule, so the same
 * words would come back every time if they were simply ranked. Within each group they are drawn at
 * random, with the ones missed most often first, so a learner with many shaky words sees a
 * different handful each time.
 */
export function weakestCards(cards: readonly StoredCard[], rng: Rng, limit = 10): StoredCard[] {
	const picked: StoredCard[] = [];
	for (const strength of WEAKEST_FIRST) {
		const group = shuffle(
			cards.filter((card) => strengthOf(card) === strength),
			rng
		).sort((a, b) => b.lapses - a.lapses); // a stable sort, so equal lapses keep their random order
		picked.push(...group);
		if (picked.length >= limit) break;
	}
	return picked.slice(0, limit);
}
