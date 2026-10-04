<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RunSummary } from '../content/session';
	import type { Lesson } from '../content/types';
	import { app } from '../progress/instance';
	import BlockView from './BlockView.svelte';
	import ExerciseRunner from './ExerciseRunner.svelte';

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

<div class="stack">
	<header class="head">
		<a class="back muted" href={resolve('/')}>← All lessons</a>
		<h1>{lesson.title}</h1>
		<p class="muted">{lesson.subtitle}</p>
	</header>

	{#if phase === 'learn'}
		<p class="muted steps" aria-live="polite">Step {step + 1} of {lesson.intro.length}</p>
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
				onanswer={(_exercise, correct) => app.answer(undefined, correct)}
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
</div>

<style>
	.head h1 {
		margin-top: 0.25rem;
	}
	.back {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		font-size: 0.9rem;
		text-decoration: none;
	}
	.steps {
		margin: 0;
		font-size: 0.9rem;
	}
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
