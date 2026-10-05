import { cardIds, lessonIds, lessons, readerSkippedLessonIds } from '../content/course';
import type { Lesson } from '../content/types';
import { createBackup, type Backup, type KnownIds } from './backup';
import { gradeAnswer } from './grading';
import { dueCards, newCard, reviewCard, type StoredCard } from './scheduler';
import { computeStreak, dayKey, type DayKey, type StreakResult } from './streak';
import { defaultMeta, MemoryStore, type Meta, type Placement, type ProgressStore } from './store';

export type LessonStatus = 'done' | 'skipped' | 'next' | 'locked';

/** Everything the interface needs to know about the learner, persisted after every change. */
export class AppState {
	ready = $state(false);
	/**
	 * The browser would not let progress be saved, so it will be lost when the page closes. Some
	 * private and locked-down windows refuse storage; a full disk can also refuse a write.
	 */
	storageProblem = $state(false);
	meta = $state<Meta>(defaultMeta());
	cards = $state<StoredCard[]>([]);
	/** Bumped after each change so time-based values (due cards, today) recompute. */
	private tick = $state(0);
	private store: ProgressStore;
	private clock: () => Date;

	// The clock hands out fresh, never-mutated dates, so a plain Date is right here.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	constructor(store: ProgressStore, clock: () => Date = () => new Date()) {
		this.store = store;
		this.clock = clock;
	}

	async init() {
		try {
			[this.meta, this.cards] = await Promise.all([this.store.loadMeta(), this.store.loadCards()]);
		} catch {
			// The browser will not let the app keep anything. Carry on with progress held in memory
			// for this visit, rather than leave the learner on a loading screen, and say so.
			this.store = new MemoryStore();
			this.storageProblem = true;
		}
		this.ready = true;
	}

	get needsPlacement() {
		return this.ready && !this.meta.placement;
	}

	get today(): DayKey {
		void this.tick;
		return dayKey(this.clock());
	}

	get todayCount(): number {
		return this.meta.activity[this.today] ?? 0;
	}

	get goalMet(): boolean {
		return this.todayCount >= this.meta.dailyGoal;
	}

	get streak(): StreakResult {
		return computeStreak(this.meta.metDays, this.today);
	}

	get dueCards(): StoredCard[] {
		void this.tick;
		return dueCards(this.cards, this.clock());
	}

	get nextLesson(): Lesson | undefined {
		return lessons.find((l) => this.lessonStatus(l.id) === 'next');
	}

	lessonStatus(lessonId: string): LessonStatus {
		if (this.meta.completedLessons.includes(lessonId)) return 'done';
		if (this.meta.skippedLessons.includes(lessonId)) return 'skipped';
		const firstOpen = lessons.find(
			(l) => !this.meta.completedLessons.includes(l.id) && !this.meta.skippedLessons.includes(l.id)
		);
		return firstOpen?.id === lessonId ? 'next' : 'locked';
	}

	async setPlacement(placement: Placement, dailyGoal: number) {
		this.meta.placement = placement;
		this.meta.dailyGoal = dailyGoal;
		this.meta.skippedLessons = placement === 'reader' ? [...readerSkippedLessonIds] : [];
		await this.persistMeta();
	}

	async setDailyGoal(dailyGoal: number) {
		this.meta.dailyGoal = dailyGoal;
		await this.persistMeta();
	}

	/**
	 * Marks a lesson done and puts the cards it introduced into the review queue.
	 * `results` says whether each card was answered right first time in the lesson,
	 * so words the learner just got right are not due again straight away.
	 */
	async completeLesson(lessonId: string, results: Record<string, boolean> = {}) {
		const lesson = lessons.find((l) => l.id === lessonId);
		if (!lesson) throw new Error(`Unknown lesson: ${lessonId}`);
		if (!this.meta.completedLessons.includes(lessonId)) this.meta.completedLessons.push(lessonId);

		const now = this.clock();
		const fresh = lesson.cardIds
			.filter((id) => !this.cards.some((card) => card.id === id))
			.map((id) =>
				id in results
					? reviewCard(newCard(id, now), results[id] ? 'good' : 'again', now)
					: newCard(id, now)
			);
		this.cards.push(...fresh);

		this.tick++;
		await Promise.all([
			this.persistMeta(),
			this.save(() => this.store.saveCards($state.snapshot(fresh)))
		]);
	}

	/**
	 * Records one answered exercise, and grades its card if it has one. A right answer is graded
	 * by `elapsedMs`, how long the question took (see `gradeAnswer`).
	 */
	async answer(cardId: string | undefined, correct: boolean, elapsedMs?: number) {
		const now = this.clock();
		const saved: StoredCard[] = [];
		if (cardId) {
			const index = this.cards.findIndex((c) => c.id === cardId);
			if (index >= 0) {
				this.cards[index] = reviewCard(
					$state.snapshot(this.cards[index]),
					gradeAnswer(correct, elapsedMs),
					now
				);
				saved.push($state.snapshot(this.cards[index]));
			}
		}
		const key = dayKey(now);
		const count = (this.meta.activity[key] ?? 0) + 1;
		this.meta.activity[key] = count;
		if (count >= this.meta.dailyGoal && !this.meta.metDays.includes(key)) {
			this.meta.metDays.push(key);
		}
		this.tick++;
		await Promise.all([this.persistMeta(), this.save(() => this.store.saveCards(saved))]);
	}

	/** The lessons and cards this version of the app has, for checking a backup against. */
	get knownIds(): KnownIds {
		return { lessonIds, cardIds };
	}

	/** Everything needed to restore this learner's progress later. */
	exportBackup(): Backup {
		return createBackup($state.snapshot(this.meta), $state.snapshot(this.cards), this.clock());
	}

	/** Replaces all progress on this device with a backup that `parseBackup` has accepted. */
	async restore(backup: Backup) {
		// A backup held in component state is a reactive proxy, which IndexedDB cannot store. A backup
		// is plain JSON by definition, so a round trip through JSON strips any proxy.
		const { meta, cards } = JSON.parse(JSON.stringify(backup)) as Backup;
		await this.store.replaceAll(meta, cards);
		this.meta = meta;
		this.cards = cards;
		this.tick++;
	}

	/**
	 * Erases everything. Like `restore`, this is something the learner asked for by name, so a
	 * browser that will not do it throws: carrying on would show an empty app that gets the old
	 * progress back at the next load.
	 */
	async reset() {
		await this.store.clear();
		this.meta = defaultMeta();
		this.cards = [];
		this.tick++;
	}

	private persistMeta() {
		return this.save(() => this.store.saveMeta($state.snapshot(this.meta)));
	}

	/**
	 * Saves, and notes it when the browser will not take the data. A learner's answer must never
	 * fail because it could not be stored: the progress is still in memory, and they are told.
	 */
	private async save(work: () => Promise<unknown>) {
		try {
			await work();
		} catch {
			this.storageProblem = true;
		}
	}
}
