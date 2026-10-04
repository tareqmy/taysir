<script lang="ts">
	import type { ChooseExercise } from '../content/types';
	import { isCorrect } from '../content/exercises';
	import ChunkText from './ChunkText.svelte';

	let { exercise, onresult }: { exercise: ChooseExercise; onresult: (correct: boolean) => void } =
		$props();

	let picked = $state<string>();

	const hasArabic = $derived(exercise.choices.some((c) => c.chunk.lang === 'ar'));

	/** Long choices, such as whole verses, need the full width to stay readable. */
	const wide = $derived(
		exercise.choices.some((c) => c.chunk.text.length > (c.chunk.lang === 'ar' ? 26 : 38))
	);

	function pick(id: string) {
		if (picked !== undefined) return;
		picked = id;
		onresult(isCorrect(exercise, id));
	}
</script>

<div class="stack">
	{#if exercise.prompt}
		<div class="prompt card">
			<ChunkText chunk={exercise.prompt} size="xl" />
			{#if exercise.hint}<p class="hint muted" lang="en">{exercise.hint}</p>{/if}
		</div>
	{/if}

	<div class="choices" class:arabic={hasArabic} class:wide role="group" aria-label="Choices">
		{#each exercise.choices as choice (choice.id)}
			{@const answered = picked !== undefined}
			<button
				type="button"
				class="choice"
				class:right={answered && choice.id === exercise.answerId}
				class:wrong={answered && choice.id === picked && choice.id !== exercise.answerId}
				disabled={answered}
				onclick={() => pick(choice.id)}
			>
				<ChunkText chunk={choice.chunk} size="lg" />
				{#if answered && choice.id === exercise.answerId}
					<span class="visually-hidden">, correct answer</span>
				{:else if answered && choice.id === picked}
					<span class="visually-hidden">, your answer, not correct</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.prompt {
		text-align: center;
		padding: 1rem;
	}
	.hint {
		margin: 0.5rem 0 0;
		font-size: 1rem;
	}
	/* Two columns when there is room, one when large text leaves no room for two. */
	.choices {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
		gap: 0.75rem;
	}
	/* An Arabic word does not wrap, so the columns are wide enough for the widest word (about three
	   and a half times the font size) at the chosen Arabic size, plus the button's padding. At the
	   standard size that is the 10rem above. */
	.choices.arabic {
		grid-template-columns: repeat(
			auto-fit,
			minmax(min(100%, max(10rem, calc(8rem * var(--ar-scale, 1) + 2rem))), 1fr)
		);
	}
	.choices.wide {
		grid-template-columns: 1fr;
	}
	.choice {
		min-width: 0;
		overflow-wrap: anywhere;
		min-height: 4rem;
		padding: 0.6rem 1rem;
		border: 2px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		font-size: 1.05rem;
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			background 0.15s ease;
	}
	.choice:hover:not(:disabled) {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.choice:disabled {
		cursor: default;
	}
	.choice.right {
		border-color: var(--good);
		background: var(--good-soft);
	}
	.choice.wrong {
		border-color: var(--bad);
		background: var(--bad-soft);
	}
	/* Forced colours drop the colours above, so the borders carry the difference. */
	@media (forced-colors: active) {
		.choice.right {
			border-width: 5px;
		}
		.choice.wrong {
			border-style: dashed;
		}
	}
</style>
