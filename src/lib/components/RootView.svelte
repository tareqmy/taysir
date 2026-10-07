<script lang="ts">
	import { wordAudioFromLoc } from '../audio';
	import { formatRoot, lexemeById } from '../data';
	import AudioButton from './AudioButton.svelte';

	let { root, ids, body }: { root: string; ids: string[]; body?: string } = $props();

	const lexemes = $derived(ids.map(lexemeById));
</script>

<section class="root card" aria-label="Words from the root {formatRoot(root)}">
	<div class="big ar" lang="ar" dir="rtl">{formatRoot(root)}</div>
	{#if body}<p class="body">{body}</p>{/if}

	<ul class="family">
		{#each lexemes as lexeme (lexeme.id)}
			<li>
				<span class="ar ar-md" lang="ar" dir="rtl">{lexeme.arabic}</span>
				<span class="meaning">{lexeme.gloss}</span>
				<AudioButton small url={wordAudioFromLoc(lexeme.sample.loc)} label="Hear {lexeme.arabic}" />
			</li>
		{/each}
	</ul>
</section>

<style>
	/* The learner's Arabic size applies, with a limit like the .ar-* sizes have: a root cannot wrap. */
	.big {
		font-size: min(calc(3.5rem * var(--ar-scale, 1)), 22vw);
		text-align: center;
		color: var(--primary);
		background: var(--primary-soft);
		border-radius: var(--radius);
		margin-bottom: 0.75rem;
		letter-spacing: 0.1em;
	}
	.body {
		margin-bottom: 1rem;
	}
	.family {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.25rem;
	}
	/* One row when there is room; the meaning and the button drop below when large text leaves none. */
	.family li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 0.75rem;
		padding: 0.25rem 0;
		border-top: 1px solid var(--line);
	}
	.family li:first-child {
		border-top: 0;
	}
	.family .ar {
		flex: 0 0 min(calc(8rem * var(--ar-scale, 1)), 100%);
		text-align: right;
	}
	.meaning {
		flex: 1 1 4rem;
		min-width: 0;
		color: var(--ink-soft);
	}
</style>
