<script lang="ts">
	import type { ChooseExercise } from '../content/types';
	import { isCorrect } from '../content/exercises';
	import ChunkText from './ChunkText.svelte';

	let { exercise, onresult }: { exercise: ChooseExercise; onresult: (correct: boolean) => void } =
		$props();

	let picked = $state<string>();

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
		</div>
	{/if}

	<div class="choices" role="group" aria-label="Choices">
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
			</button>
		{/each}
	</div>
</div>

<style>
	.prompt {
		text-align: center;
		padding: 1rem;
	}
	.choices {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}
	.choice {
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
</style>
