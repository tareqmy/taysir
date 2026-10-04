<script lang="ts">
	import type { MatchExercise } from '../content/types';
	import { hashString, seeded, shuffle } from '../random';
	import ChunkText from './ChunkText.svelte';

	let { exercise, onresult }: { exercise: MatchExercise; onresult: (correct: boolean) => void } =
		$props();

	const rightOrder = $derived(shuffle(exercise.pairs, seeded(hashString(exercise.id))));

	let matched = $state<string[]>([]);
	let selected = $state<string>();
	let mistakes = $state(0);
	let flash = $state<string>();
	/** Spoken by screen readers, since the colours alone say nothing to them. */
	let announcement = $state('');

	function announce(message: string) {
		announcement = '';
		setTimeout(() => (announcement = message), 50);
	}

	function chooseLeft(id: string) {
		if (matched.includes(id)) return;
		selected = selected === id ? undefined : id;
	}

	function chooseRight(id: string) {
		if (selected === undefined || matched.includes(id)) return;
		if (selected === id) {
			matched = [...matched, id];
			selected = undefined;
			announce(`Matched, ${matched.length} of ${exercise.pairs.length}`);
			if (matched.length === exercise.pairs.length) onresult(mistakes === 0);
		} else {
			mistakes++;
			announce('Not a match, try again');
			flash = id;
			setTimeout(() => (flash = undefined), 450);
		}
	}
</script>

<div class="match" role="group" aria-label="Match the pairs">
	<div class="col">
		{#each exercise.pairs as pair (pair.id)}
			<button
				type="button"
				class="tile"
				class:selected={selected === pair.id}
				class:done={matched.includes(pair.id)}
				aria-pressed={selected === pair.id}
				disabled={matched.includes(pair.id)}
				onclick={() => chooseLeft(pair.id)}
			>
				<ChunkText chunk={pair.left} size="lg" />
				{#if matched.includes(pair.id)}<span class="visually-hidden">, matched</span>{/if}
			</button>
		{/each}
	</div>
	<div class="col">
		{#each rightOrder as pair (pair.id)}
			<button
				type="button"
				class="tile"
				class:done={matched.includes(pair.id)}
				class:shake={flash === pair.id}
				disabled={matched.includes(pair.id)}
				onclick={() => chooseRight(pair.id)}
			>
				<ChunkText chunk={pair.right} />
				{#if matched.includes(pair.id)}<span class="visually-hidden">, matched</span>{/if}
			</button>
		{/each}
	</div>
	<p class="visually-hidden" role="status">{announcement}</p>
</div>

<style>
	/* Two columns when there is room, one when large text or a large Arabic size leaves no room for
	   two: each column is wide enough for the widest Arabic word at the chosen size. */
	.match {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(min(100%, max(9rem, calc(8rem * var(--ar-scale, 1) + 1.5rem))), 1fr)
		);
		gap: 1rem;
	}
	.col {
		display: grid;
		gap: 0.6rem;
		align-content: start;
	}
	.tile {
		min-width: 0;
		overflow-wrap: anywhere;
		min-height: 3.75rem;
		padding: 0.4rem 0.75rem;
		border: 2px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		cursor: pointer;
	}
	.tile:hover:not(:disabled) {
		border-color: var(--primary);
	}
	.tile.selected {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.tile.done {
		border-color: var(--good);
		background: var(--good-soft);
		opacity: 0.7;
	}
	.tile.shake {
		border-color: var(--bad);
		background: var(--bad-soft);
	}
</style>
