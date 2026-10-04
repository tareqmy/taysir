<script lang="ts">
	import { surahName } from '../data';
	import type { Verse } from '../data/types';
	import VerseView from './VerseView.svelte';

	let { surah, total, known }: { surah: number; total: number; known: Verse[] } = $props();

	// The verses are only drawn while the surah is open: a long list of them is heavy.
	let open = $state(false);
</script>

{#if known.length === 0}
	<div class="row">
		<span>{surahName(surah)}</span>
		<span class="muted">0 of {total} verses</span>
	</div>
{:else}
	<details ontoggle={(event) => (open = event.currentTarget.open)}>
		<summary class="row">
			<span>{surahName(surah)}</span>
			<span class="muted">{known.length} of {total} verses</span>
		</summary>
		{#if open}
			<div class="verses">
				{#each known as verse (verse.ayah)}
					<VerseView surah={verse.surah} ayah={verse.ayah} />
				{/each}
			</div>
		{/if}
	</details>
{/if}

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0 1rem;
		min-height: 2.75rem;
		padding: 0.25rem 0;
	}
	summary {
		cursor: pointer;
		color: var(--primary);
	}
	.verses {
		display: grid;
		/* A bare grid column grows to fit its widest content; this lets the cards shrink and wrap. */
		grid-template-columns: minmax(0, 1fr);
		gap: 0.75rem;
		padding: 0.25rem 0 1rem;
	}
</style>
