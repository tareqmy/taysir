<script lang="ts">
	import { isCorrect } from '../content/exercises';
	import type { TapExercise } from '../content/types';

	let { exercise, onresult }: { exercise: TapExercise; onresult: (correct: boolean) => void } =
		$props();

	let picked = $state<string>();

	function pick(id: string) {
		if (picked !== undefined) return;
		picked = id;
		onresult(isCorrect(exercise, id));
	}
</script>

<div class="verse card" dir="rtl" lang="ar" role="group" aria-label="The verse, word by word">
	{#each exercise.words as word (word.id)}
		{@const answered = picked !== undefined}
		<button
			type="button"
			class="word"
			class:right={answered && word.id === exercise.answerId}
			class:wrong={answered && word.id === picked && word.id !== exercise.answerId}
			disabled={answered}
			onclick={() => pick(word.id)}
		>
			<span class="ar ar-lg">{word.text}</span>
			{#if answered && word.id === exercise.answerId}
				<span class="visually-hidden">, correct answer</span>
			{:else if answered && word.id === picked}
				<span class="visually-hidden">, your answer, not correct</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.verse {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.75rem;
		justify-content: center;
		padding: 1rem;
	}
	.word {
		padding: 0.1rem 0.8rem;
		border: 2px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			background 0.15s ease;
	}
	.word:hover:not(:disabled) {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.word:disabled {
		cursor: default;
	}
	.word.right {
		border-color: var(--good);
		background: var(--good-soft);
	}
	.word.wrong {
		border-color: var(--bad);
		background: var(--bad-soft);
	}
	/* Forced colours drop the colours above, so the borders carry the difference. */
	@media (forced-colors: active) {
		.word.right {
			border-width: 5px;
		}
		.word.wrong {
			border-style: dashed;
		}
	}
</style>
