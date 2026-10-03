<script lang="ts">
	import type { BuildExercise } from '../content/types';
	import { isCorrect } from '../content/exercises';
	import { hashString, seeded, shuffle } from '../random';
	import ChunkText from './ChunkText.svelte';

	let { exercise, onresult }: { exercise: BuildExercise; onresult: (correct: boolean) => void } =
		$props();

	const tokens = $derived(
		shuffle([...exercise.answer, ...exercise.extras], seeded(hashString(exercise.id)))
	);

	let chosen = $state<string[]>([]);
	let checked = $state(false);
	let right = $state(false);

	const byId = $derived(new Map(tokens.map((t) => [t.id, t])));

	function add(id: string) {
		if (checked || chosen.includes(id)) return;
		chosen = [...chosen, id];
	}

	function remove(id: string) {
		if (checked) return;
		chosen = chosen.filter((c) => c !== id);
	}

	function check() {
		if (checked || chosen.length === 0) return;
		checked = true;
		right = isCorrect(exercise, chosen);
		onresult(right);
	}
</script>

<div class="stack">
	<div class="prompt card">
		<ChunkText chunk={exercise.prompt} />
	</div>

	<div
		class="answer"
		class:right={checked && right}
		class:wrong={checked && !right}
		dir="rtl"
		aria-label="Your answer"
		aria-live="polite"
	>
		{#if chosen.length === 0}
			<span class="hint" dir="ltr">Tap the words below, in order</span>
		{/if}
		{#each chosen as id (id)}
			<button type="button" class="token" disabled={checked} onclick={() => remove(id)}>
				<ChunkText chunk={byId.get(id)!.chunk} size="lg" />
			</button>
		{/each}
	</div>

	<div class="pool" dir="rtl" role="group" aria-label="Word bank">
		{#each tokens as token (token.id)}
			<button
				type="button"
				class="token"
				disabled={checked || chosen.includes(token.id)}
				class:used={chosen.includes(token.id)}
				onclick={() => add(token.id)}
			>
				<ChunkText chunk={token.chunk} size="lg" />
			</button>
		{/each}
	</div>

	<button
		type="button"
		class="btn btn-block"
		disabled={checked || chosen.length === 0}
		onclick={check}
	>
		Check
	</button>
</div>

<style>
	.prompt {
		text-align: center;
		font-size: 1.25rem;
		padding: 1rem;
	}
	.answer {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		min-height: 5rem;
		padding: 0.5rem;
		border: 2px dashed var(--line);
		border-radius: var(--radius);
	}
	.answer.right {
		border: 2px solid var(--good);
		background: var(--good-soft);
	}
	.answer.wrong {
		border: 2px solid var(--bad);
		background: var(--bad-soft);
	}
	.hint {
		width: 100%;
		text-align: center;
		color: var(--ink-soft);
		font-size: 0.95rem;
	}
	.pool {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
	}
	.token {
		padding: 0.1rem 0.9rem;
		border: 2px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		cursor: pointer;
	}
	.token:hover:not(:disabled) {
		border-color: var(--primary);
	}
	.token.used {
		opacity: 0.3;
	}
	.token:disabled {
		cursor: default;
	}
</style>
