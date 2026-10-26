<script lang="ts">
	import { playAudio, verseAudioUrl, wordAudioUrl } from '../audio';
	import { isSajdahVerse, surahName, verse as verseData } from '../data';
	import AudioButton from './AudioButton.svelte';

	let { surah, ayah, title, note }: { surah: number; ayah: number; title?: string; note?: string } =
		$props();

	const verse = $derived(verseData(surah, ayah));
	const name = $derived(surahName(surah));
	const sajdah = $derived(isSajdahVerse(surah, ayah));
	let offline = $state(false);

	async function playWord(n: number) {
		offline = !(await playAudio(wordAudioUrl(surah, ayah, n)));
	}
</script>

<section class="verse card" aria-label="{name} verse {ayah}">
	<header>
		<div>
			{#if title}<h3>{title}</h3>{/if}
			<div class="pills">
				<span class="pill">{name} {surah}:{ayah}</span>
				{#if sajdah}
					<span class="pill">Verse of prostration</span>
				{/if}
			</div>
		</div>
		<AudioButton url={verseAudioUrl(surah, ayah)} label="Listen to the whole verse" />
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

	{#if sajdah}
		<p class="sajdah small">
			<strong>Prostration of recitation (sajdah tilāwah):</strong> Reciting or hearing this verse in Arabic
			requires one prostration to Allah. With wuḍūʾ, face the qiblah, say Allāhu akbar without raising
			your hands, prostrate once and say Subḥāna Rabbiyal-Aʿlā three times, then say Allāhu akbar as you
			rise (without taslīm).
		</p>
	{/if}
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
	.pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.sajdah {
		margin: 0.5rem 0 0;
		padding: 0.6rem 0.75rem;
		border-left: 4px solid var(--accent);
		border-radius: 0 8px 8px 0;
		background: var(--surface-2);
		color: var(--ink);
		overflow-wrap: anywhere;
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
	/* Amiri Quran's tails and marks reach almost 0.9em below the line (yāʾ with two kasras), far
	   past the bottom of an ordinary line, so the room below is padding. The gold underline that
	   marks a word with a card is a border under that room, clear of every letter and mark. */
	.word .ar {
		line-height: 1.8;
		padding-bottom: 0.7em;
		border-bottom: 2px solid transparent;
	}
	.word.learn .ar {
		border-bottom-color: var(--accent);
	}
	.gloss {
		margin-top: 0.35rem;
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
