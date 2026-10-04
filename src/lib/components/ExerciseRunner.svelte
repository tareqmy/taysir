<script lang="ts">
	import { tick } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { summarize, type RunSummary } from '../content/session';
	import type { Exercise } from '../content/types';
	import AudioButton from './AudioButton.svelte';
	import BuildView from './BuildView.svelte';
	import ChooseView from './ChooseView.svelte';
	import ListenPrompt from './ListenPrompt.svelte';
	import MatchView from './MatchView.svelte';
	import TapView from './TapView.svelte';
	import RichText from './RichText.svelte';

	let {
		exercises,
		onanswer,
		onfinish
	}: {
		exercises: Exercise[];
		/**
		 * Called once per answer. `firstAttempt` is false when the exercise is a retry.
		 * `elapsedMs` is how long the question was on screen, or undefined if the learner left the
		 * page meanwhile and the time means nothing.
		 */
		onanswer?: (
			exercise: Exercise,
			correct: boolean,
			firstAttempt: boolean,
			elapsedMs?: number
		) => void;
		onfinish: (summary: RunSummary) => void;
	} = $props();

	interface Item {
		exercise: Exercise;
		retry: boolean;
	}

	// Audio is streamed, so with no connection the listening questions are left out. The exercise
	// list is otherwise fixed for the life of the runner.
	const online = typeof navigator === 'undefined' || navigator.onLine !== false;
	// svelte-ignore state_referenced_locally
	const active = exercises.filter((exercise) => online || !exercise.listening);
	let queue = $state<Item[]>(active.map((exercise) => ({ exercise, retry: false })));
	/** Listening questions the learner chose to skip: they count for nothing, right or wrong. */
	const skipped = new SvelteSet<string>();
	let index = $state(0);
	let feedback = $state<{ correct: boolean } | null>(null);
	const firstTry = new SvelteMap<string, boolean>();

	// Plain variables: they are read only when an answer comes in, so nothing needs to re-render.
	let shownAt = performance.now();
	let awayDuringQuestion = false;

	function onvisibilitychange() {
		if (document.hidden) awayDuringQuestion = true;
	}

	const current = $derived(queue[index]);
	const showAudioNow = $derived(
		current?.exercise.audioUrl &&
			(feedback !== null ||
				(!current.exercise.listening &&
					current.exercise.kind === 'choose' &&
					current.exercise.prompt?.lang === 'ar'))
	);

	function result(correct: boolean) {
		if (feedback) return;
		const item = queue[index];
		feedback = { correct };
		if (!item.retry) {
			firstTry.set(item.exercise.id, correct);
			if (!correct) queue.push({ exercise: item.exercise, retry: true });
		}
		onanswer?.(
			item.exercise,
			correct,
			!item.retry,
			// The time to listen is not a measure of how well the word is known.
			awayDuringQuestion || item.exercise.listening ? undefined : performance.now() - shownAt
		);
	}

	/** The question heading, which gets focus for each new question so keyboard users start there. */
	let heading = $state<HTMLElement>();

	function next() {
		return advance();
	}

	/** Moves past a listening question without answering it. */
	function skip() {
		const item = queue[index];
		if (!item.retry) skipped.add(item.exercise.id);
		return advance();
	}

	async function advance() {
		feedback = null;
		shownAt = performance.now();
		awayDuringQuestion = false;
		index++;
		if (index >= queue.length) {
			onfinish(
				summarize(
					active.filter((exercise) => !skipped.has(exercise.id)),
					firstTry
				)
			);
			return;
		}
		await tick();
		heading?.focus();
	}

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}
</script>

<svelte:document {onvisibilitychange} />

{#if current}
	<div class="runner">
		<div
			class="bar"
			role="progressbar"
			aria-valuemin="0"
			aria-valuemax={queue.length}
			aria-valuenow={index}
			aria-label="Progress"
		>
			<div class="fill" style:width="{(index / queue.length) * 100}%"></div>
		</div>

		<div class="question">
			<h2 tabindex="-1" bind:this={heading} use:focusOnMount>
				<RichText text={current.exercise.question} />
			</h2>
			{#if showAudioNow}
				<AudioButton url={current.exercise.audioUrl!} label="Hear the word" />
			{/if}
		</div>

		{#if current.exercise.listening && !feedback}
			{#key index}
				<ListenPrompt url={current.exercise.audioUrl!} onskip={skip} />
			{/key}
		{/if}

		{#key index}
			{#if current.exercise.kind === 'choose'}
				<ChooseView exercise={current.exercise} onresult={result} />
			{:else if current.exercise.kind === 'match'}
				<MatchView exercise={current.exercise} onresult={result} />
			{:else if current.exercise.kind === 'tap'}
				<TapView exercise={current.exercise} onresult={result} />
			{:else}
				<BuildView exercise={current.exercise} onresult={result} />
			{/if}
		{/key}

		{#if feedback}
			<div
				class="feedback"
				class:good={feedback.correct}
				class:bad={!feedback.correct}
				role="status"
			>
				<div class="text">
					<strong>{feedback.correct ? 'Correct' : 'Not quite'}</strong>
					{#if current.exercise.explanation}
						<p><RichText text={current.exercise.explanation} /></p>
					{/if}
				</div>
				<button type="button" class="btn" onclick={next} use:focusOnMount>Continue</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.runner {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding-bottom: 7rem;
	}
	.bar {
		height: 0.6rem;
		border-radius: 999px;
		background: var(--surface-2);
		overflow: hidden;
	}
	.fill {
		height: 100%;
		background: var(--primary);
		border-radius: 999px;
		transition: width 0.25s ease;
	}
	.question {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.question h2 {
		margin: 0;
	}
	.feedback {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem max(1rem, calc((100vw - 44rem) / 2 + 1rem));
		border-top: 2px solid;
	}
	.feedback.good {
		background: var(--good-soft);
		border-color: var(--good);
		color: var(--ink);
	}
	.feedback.bad {
		background: var(--bad-soft);
		border-color: var(--bad);
		color: var(--ink);
	}
	.feedback p {
		margin: 0.15rem 0 0;
		font-size: 0.95rem;
	}
	.feedback .text {
		flex: 1 1 10rem;
		min-width: 0;
	}
</style>
