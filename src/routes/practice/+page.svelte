<script lang="ts">
	import { resolve } from '$app/paths';
	import { reviewExercise } from '#lib/content/exercises';
	import type { RunSummary } from '#lib/content/session';
	import ExerciseRunner from '#lib/components/ExerciseRunner.svelte';
	import { lexicon } from '#lib/data';
	import { app } from '#lib/progress/instance';
	import { weakestCards } from '#lib/progress/practice';

	const BATCH = 10;

	// Chosen once when the page opens, so answering does not reshuffle it. Listening questions need
	// the audio, which is streamed, so they are only offered online.
	const online = navigator.onLine !== false;
	const exercises = weakestCards(app.cards, Math.random, BATCH).map((card) =>
		reviewExercise(card.id, lexicon.lexemes, Math.random, online)
	);

	let summary = $state<RunSummary>();

	/** Moves focus to an element when it appears, so keyboard users land on the new content. */
	function focusOnMount(node: HTMLElement) {
		node.focus();
	}
</script>

<svelte:head>
	<title>Extra practice · Taysir</title>
</svelte:head>

<main id="main" class="page stack">
	<header>
		<h1>Extra practice</h1>
		<p class="muted">
			Drills the words you are still learning first. It counts toward today’s goal, but it does not
			change when your words come due for review.
		</p>
	</header>

	{#if exercises.length === 0}
		<section class="card stack">
			<h2>Nothing to practise yet</h2>
			<p>Finish a lesson and the words and letters you learn will appear here.</p>
			<a class="btn" href={resolve('/')}>Back to lessons</a>
		</section>
	{:else if summary}
		<section class="card stack" aria-live="polite">
			<h2 tabindex="-1" use:focusOnMount>Practice complete</h2>
			<p>{summary.firstTryCorrect} of {summary.total} right first time.</p>
			<div class="buttons">
				<a class="btn btn-quiet" href={resolve('/')}>Back to lessons</a>
				<a class="btn" href={resolve('/practice')} data-sveltekit-reload>Practise more</a>
			</div>
		</section>
	{:else}
		<ExerciseRunner
			{exercises}
			onanswer={(_exercise, correct) => app.answer(undefined, correct)}
			onfinish={(result) => (summary = result)}
		/>
	{/if}
</main>

<style>
	.buttons {
		display: flex;
		gap: 0.75rem;
		justify-content: space-between;
	}
	.buttons .btn:last-child {
		flex: 1;
	}
</style>
