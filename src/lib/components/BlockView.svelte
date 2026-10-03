<script lang="ts">
	import type { Block } from '../content/types';
	import LetterCard from './LetterCard.svelte';
	import LexemeCard from './LexemeCard.svelte';
	import PhraseView from './PhraseView.svelte';
	import RichText from './RichText.svelte';
	import RootView from './RootView.svelte';
	import VerseView from './VerseView.svelte';

	let { block }: { block: Block } = $props();
</script>

{#if block.type === 'text'}
	<section class="card">
		{#if block.title}<h2>{block.title}</h2>{/if}
		<p><RichText text={block.body} /></p>
	</section>
{:else if block.type === 'rule'}
	<section class="card rule">
		<span class="pill">Key idea</span>
		<h2>{block.title}</h2>
		<p><RichText text={block.body} /></p>
	</section>
{:else if block.type === 'letters'}
	<div class="stack">
		{#if block.title}<h2>{block.title}</h2>{/if}
		{#each block.ids as id (id)}<LetterCard {id} />{/each}
	</div>
{:else if block.type === 'lexemes'}
	<div class="stack">
		{#if block.title}<h2>{block.title}</h2>{/if}
		{#each block.ids as id (id)}<LexemeCard {id} />{/each}
	</div>
{:else if block.type === 'root'}
	<RootView root={block.root} ids={block.ids} body={block.body} />
{:else if block.type === 'verse'}
	<VerseView surah={block.surah} ayah={block.ayah} title={block.title} note={block.note} />
{:else}
	<PhraseView
		surah={block.surah}
		ayah={block.ayah}
		from={block.from}
		to={block.to}
		translation={block.translation}
		note={block.note}
		split={block.split}
	/>
{/if}

<style>
	.rule {
		border-left: 6px solid var(--accent);
	}
	.rule .pill {
		margin-bottom: 0.5rem;
	}
	section p {
		font-size: 1.05rem;
		line-height: 1.7;
	}
</style>
