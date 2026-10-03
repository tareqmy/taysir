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
	.big {
		font-size: 3.5rem;
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
	.family li {
		display: grid;
		grid-template-columns: 8rem 1fr auto;
		align-items: center;
		gap: 0.75rem;
		padding: 0.25rem 0;
		border-top: 1px solid var(--line);
	}
	.family li:first-child {
		border-top: 0;
	}
	.family .ar {
		text-align: right;
	}
	.meaning {
		color: var(--ink-soft);
	}
</style>
