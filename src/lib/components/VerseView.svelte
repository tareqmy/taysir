<script lang="ts">
	import { playAudio, verseAudioUrl, wordAudioUrl } from '../audio';
	import { verse as verseData } from '../data';
	import AudioButton from './AudioButton.svelte';

	let { ayah, title, note }: { ayah: number; title?: string; note?: string } = $props();

	const verse = $derived(verseData(ayah));
	let offline = $state(false);

	async function playWord(n: number) {
		offline = !(await playAudio(wordAudioUrl(1, ayah, n)));
	}
</script>

<section class="verse card" aria-label="Al-Fatiha verse {ayah}">
	<header>
		<div>
			{#if title}<h3>{title}</h3>{/if}
			<span class="pill">Al-Fatiha 1:{ayah}</span>
		</div>
		<AudioButton url={verseAudioUrl(1, ayah)} label="Listen to the whole verse" />
	</header>

	<ol class="words" dir="rtl" lang="ar">
		{#each verse.words as word (word.n)}
			<li>
				<button
					type="button"
					class="word"
					class:learn={word.lexemeId}
					onclick={() => playWord(word.n)}
					aria-label="{word.text}: {word.gloss}. Tap to hear."
				>
					<span class="ar ar-lg">{word.text}</span>
					<span class="gloss" lang="en" dir="ltr">{word.gloss}</span>
				</button>
			</li>
		{/each}
	</ol>

	{#if offline}
		<p class="muted small" role="status">Audio needs an internet connection.</p>
	{/if}
	{#if note}<p class="muted small">{note}</p>{/if}
</section>

<style>
	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}
	header h3 {
		margin-bottom: 0.25rem;
	}
	.words {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.75rem;
		list-style: none;
		margin: 0.5rem 0;
		padding: 0;
	}
	.word {
		display: grid;
		justify-items: center;
		gap: 0;
		padding: 0.25rem 0.6rem 0.5rem;
		border: 1px solid transparent;
		border-radius: 12px;
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	.word:hover {
		background: var(--surface-2);
	}
	.word.learn .ar {
		text-decoration: underline;
		text-decoration-color: var(--accent);
		text-decoration-thickness: 2px;
		text-underline-offset: 0.45em;
	}
	.gloss {
		margin-top: 0.5rem;
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--ink-soft);
		max-width: 7rem;
		text-align: center;
		line-height: 1.25;
	}
	.small {
		font-size: 0.85rem;
		margin: 0.25rem 0 0;
	}
</style>
