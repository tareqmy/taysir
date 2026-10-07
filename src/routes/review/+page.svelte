<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { reviewExercise } from '#lib/content/exercises';
	import type { RunSummary } from '#lib/content/session';
	import ExerciseRunner from '#lib/components/ExerciseRunner.svelte';
	import { lexicon } from '#lib/data';
	import { app } from '#lib/progress/instance';
	import { formatRelative } from '#lib/time';

	const BATCH = 10;

	/**
	 * The next due cards, chosen once so that answering does not reshuffle them. Listening questions
	 * need the audio, which is streamed, so they are only offered online.
	 */
	function nextBatch() {
		const online = navigator.onLine !== false;
		const exercises = app.dueCards
			.slice(0, BATCH)
			.map((card) => reviewExercise(card.id, lexicon.lexemes, Math.random, online));
		return { exercises, remaining: app.dueCards.length - exercises.length };
	}

	let batch = $state.raw(nextBatch());
	let summary = $state<RunSummary>();

	// "Keep going" and the Review link at the top open this same page, where SvelteKit keeps the page
	// as it is, so start the next batch here. Loading the page afresh instead would lose the visit's
	// progress when the browser is not saving it.
	afterNavigate(({ from, to }) => {
		if (from?.url.pathname !== to?.url.pathname) return;
		batch = nextBatch();
		summary = undefined;
	});

	const nextDue = $derived.by(() => {
		const upcoming = app.cards
			.map((c) => new Date(c.due))
			.sort((a, b) => a.getTime() - b.getTime());
		return upcoming[0];
	});

	/** Moves focus to an element when it appears, so keyboard users land on the new content. */
	function focusOnMount(node: HTMLElement) {
		node.focus();
	}
</script>

<svelte:head>
	<title>Review · Taysir</title>
</svelte:head>

<main id="main" class="page stack">
	<header>
		<h1>Review</h1>
		<p class="muted">
			Short practice on what you have learned, timed to when you are about to forget it. A quick
			right answer waits longer before it returns, and a slow one comes back sooner.
		</p>
	</header>

	{#if batch.exercises.length === 0}
		<section class="card stack">
			<h2>All caught up</h2>
			{#if nextDue}
				<p>Your next review is due {formatRelative(nextDue, new Date())}.</p>
			{:else}
				<p>Finish a lesson and the words and letters you learn will appear here.</p>
			{/if}
			<div class="buttons">
				<a class="btn btn-quiet" href={resolve('/')}>Back to lessons</a>
				{#if app.cards.length > 0}
					<a class="btn" href={resolve('/practice')}>Practise your weakest words</a>
				{/if}
			</div>
		</section>
	{:else if summary}
		<section class="card stack" aria-live="polite">
			<h2 tabindex="-1" use:focusOnMount>Review complete</h2>
			<p>
				{summary.firstTryCorrect} of {summary.total} right first time.
				{#if batch.remaining > 0}
					{batch.remaining} more {batch.remaining === 1 ? 'item is' : 'items are'} waiting.
				{/if}
			</p>
			<div class="buttons">
				<a class="btn btn-quiet" href={resolve('/')}>Back to lessons</a>
				{#if batch.remaining > 0}
					<a class="btn" href={resolve('/review')}>Keep going</a>
				{:else}
					<a class="btn" href={resolve('/practice')}>Practise more</a>
				{/if}
			</div>
		</section>
	{:else}
		{#key batch}
			<ExerciseRunner
				exercises={batch.exercises}
				onanswer={(exercise, correct, first, elapsedMs) =>
					app.answer(first ? exercise.cardId : undefined, correct, elapsedMs)}
				onfinish={(result) => (summary = result)}
			/>
		{/key}
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
