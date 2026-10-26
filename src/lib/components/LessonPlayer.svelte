<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RunSummary } from '../content/session';
	import type { Lesson } from '../content/types';
	import { app } from '../progress/instance';
	import BlockView from './BlockView.svelte';
	import ExerciseRunner from './ExerciseRunner.svelte';
	import LessonBar, { type LessonProgress } from './LessonBar.svelte';

	let { lesson }: { lesson: Lesson } = $props();

	type Phase = 'learn' | 'practice' | 'done';
	let phase = $state<Phase>('learn');
	let step = $state(0);
	let summary = $state<RunSummary>();
	/** Bumped to restart practice with a fresh runner. */
	let attempt = $state(0);

	const block = $derived(lesson.intro[step]);
	const last = $derived(step === lesson.intro.length - 1);
	const next = $derived(app.nextLesson);
	const percent = $derived(
		summary && summary.total > 0 ? Math.round((summary.firstTryCorrect / summary.total) * 100) : 0
	);

	/** Questions answered and how many there are, as the runner reports them. */
	// svelte-ignore state_referenced_locally
	let practice = $state({ done: 0, total: lesson.exercises.length });
	/** One bar for the whole lesson: the reading steps first, then the questions. */
	const progress = $derived.by((): LessonProgress => {
		const reading = lesson.intro.length;
		const total = reading + practice.total;
		if (phase === 'learn') {
			return { done: step, total, text: `Step ${step + 1} of ${reading}` };
		}
		if (phase === 'practice') {
			const question = Math.min(practice.done + 1, practice.total);
			return {
				done: reading + practice.done,
				total,
				text: `Question ${question} of ${practice.total}`
			};
		}
		return { done: total, total, text: 'Lesson complete' };
	});

	function forward() {
		if (last) phase = 'practice';
		else step++;
	}

	async function finished(result: RunSummary) {
		summary = result;
		await app.completeLesson(lesson.id, result.byCard);
		phase = 'done';
	}

	function again() {
		attempt++;
		phase = 'practice';
	}

	/** Moves focus to an element when it appears, so keyboard users land on the new content. */
	function focusOnMount(node: HTMLElement) {
		node.focus();
	}
</script>

<LessonBar {progress} step={phase === 'learn' ? progress.text : undefined} />

<main id="main" class="page stack">
	<header class="head">
		<h1>{lesson.title}</h1>
		<p class="muted">{lesson.subtitle}</p>
	</header>

	{#if phase === 'learn'}
		{#key step}
			<BlockView {block} />
		{/key}
		<div class="nav">
			<button type="button" class="btn btn-quiet" disabled={step === 0} onclick={() => step--}>
				Back
			</button>
			<button type="button" class="btn" onclick={forward}>
				{last ? 'Start practice' : 'Continue'}
			</button>
		</div>
	{:else if phase === 'practice'}
		{#key attempt}
			<ExerciseRunner
				exercises={lesson.exercises}
				progressBar={false}
				onanswer={(_exercise, correct) => app.answer(undefined, correct)}
				onprogress={(done, total) => (practice = { done, total })}
				onfinish={finished}
			/>
		{/key}
	{:else if summary}
		<section class="card done stack" aria-live="polite">
			<h2 tabindex="-1" use:focusOnMount>Lesson complete</h2>
			<p class="score">
				<span class="num">{percent}%</span>
				<span class="muted">right first time ({summary.firstTryCorrect} of {summary.total})</span>
			</p>
			{#if lesson.cardIds.length > 0}
				<p>
					{lesson.cardIds.length}
					{lesson.cardIds.length === 1 ? 'item was' : 'items were'} added to your review. You will see
					them again just before you would forget them.
				</p>
			{/if}
			<p class="muted">
				{#if app.goalMet}
					Today’s goal is met. Come back tomorrow to keep your streak.
				{:else}
					{app.todayCount} of {app.meta.dailyGoal} exercises done today.
				{/if}
			</p>
			<div class="nav">
				<button type="button" class="btn btn-quiet" onclick={again}>Practise again</button>
				{#if next}
					<a class="btn" href={resolve('/lesson/[id]', { id: next.id })}>Next: {next.title}</a>
				{:else}
					<a class="btn" href={resolve('/')}>Back to lessons</a>
				{/if}
			</div>
		</section>
	{/if}
</main>

<style>
	.nav {
		display: flex;
		gap: 0.75rem;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	.nav .btn:last-child {
		flex: 1;
	}
	.score {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.num {
		font-family: var(--font-display);
		/* Stops growing with very large text once it would no longer fit a phone screen. */
		font-size: min(2.5rem, 16vw);
		color: var(--primary);
	}
</style>
