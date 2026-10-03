<script lang="ts">
	import { wordAudioFromLoc } from '../audio';
	import { formatRoot, lexemeById } from '../data';
	import AudioButton from './AudioButton.svelte';

	let { id }: { id: string } = $props();

	const lexeme = $derived(lexemeById(id));
	const ref = $derived(lexeme.sample.loc.split(':').slice(0, 2).join(':'));
	/** Only mention frequency when it says something useful to a learner. */
	const common = $derived(lexeme.count >= 20);
</script>

<article class="lexeme card">
	<div class="head">
		<div class="word ar ar-lg" lang="ar" dir="rtl">{lexeme.arabic}</div>
		<AudioButton url={wordAudioFromLoc(lexeme.sample.loc)} label="Hear {lexeme.arabic}" />
	</div>
	<h3>{lexeme.gloss}</h3>
	<div class="meta">
		{#if lexeme.root}
			<span class="pill"
				>root <span class="ar" lang="ar" dir="rtl">{formatRoot(lexeme.root)}</span></span
			>
		{/if}
		<span class="muted">
			{#if common}
				Appears {lexeme.count.toLocaleString()} times in the Quran.
			{:else}
				Less common, but you will meet it.
			{/if}
		</span>
	</div>
	<p class="seen muted">
		Seen as <span class="ar ar-md" lang="ar" dir="rtl">{lexeme.sample.form}</span> in {ref}
	</p>
</article>

<style>
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	h3 {
		margin: 0.25rem 0 0.5rem;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.75rem;
		align-items: center;
	}
	.pill .ar {
		font-size: 1.35em;
		line-height: 1;
		vertical-align: middle;
	}
	.seen {
		margin: 0.75rem 0 0;
		font-size: 0.9rem;
	}
	.seen .ar {
		line-height: 1;
		vertical-align: middle;
		color: var(--ink);
	}
</style>
