<script lang="ts">
	import { playAudio, wordAudioUrl } from '../audio';
	import { phraseWords, segmentsOf, surahName } from '../data';
	import type { Segment } from '../data/types';

	let {
		surah,
		ayah,
		from,
		to,
		translation,
		note,
		split = false,
		highlight
	}: {
		surah: number;
		ayah: number;
		from: number;
		to: number;
		translation: string;
		note?: string;
		split?: boolean;
		highlight?: 'affixes';
	} = $props();

	const words = $derived(phraseWords(surah, ayah, from, to));
	const name = $derived(surahName(surah));
	let offline = $state(false);

	const isArticle = (s: Segment) => s.tags.includes('DET');
	/** Prefixes and joined endings, including a pronoun that is not marked as an ending. */
	const isAffix = (s: Segment, i: number) =>
		s.tags.includes('PREF') || s.tags.includes('SUFF') || (i > 0 && s.tags.includes('PRON'));

	async function play(n: number) {
		offline = !(await playAudio(wordAudioUrl(surah, ayah, n)));
	}
</script>

<section class="phrase card" aria-label="Example from {name} {surah}:{ayah}">
	<span class="pill">{name} {surah}:{ayah}</span>

	<ol class="words" dir="rtl" lang="ar">
		{#each words as word (word.n)}
			<li>
				<button
					type="button"
					class="word"
					onclick={() => play(word.n)}
					aria-label="{word.text}: {word.gloss}. Tap to hear."
				>
					{#if highlight === 'affixes'}
						<span class="parts ar ar-lg">
							{#each segmentsOf(word) as segment, i (i)}
								<span class="part" class:article={isAffix(segment, i)}>{segment.text}</span>
							{/each}
						</span>
						<span class="gloss" lang="en" dir="ltr">{word.gloss}</span>
					{:else if split}
						<span class="parts ar ar-lg">
							{#each segmentsOf(word) as segment, i (i)}
								<span class="part" class:article={isArticle(segment)}>{segment.text}</span>
							{/each}
						</span>
						<span class="legend" lang="en" dir="ltr">
							{#each segmentsOf(word) as segment, i (i)}
								<span class:article={isArticle(segment)}>
									{isArticle(segment)
										? 'the'
										: i === segmentsOf(word).length - 1
											? word.gloss.replace(/^the /i, '')
											: '·'}
								</span>
							{/each}
						</span>
					{:else}
						<span class="ar ar-lg">{word.text}</span>
						<span class="gloss" lang="en" dir="ltr">{word.gloss}</span>
					{/if}
				</button>
			</li>
		{/each}
	</ol>

	<p class="translation"><strong>{translation}</strong></p>
	{#if offline}
		<p class="muted small" role="status">Audio needs an internet connection.</p>
	{/if}
	{#if note}<p class="muted small">{note}</p>{/if}
</section>

<style>
	.words {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		list-style: none;
		margin: 0.5rem 0;
		padding: 0;
	}
	.word {
		display: grid;
		justify-items: center;
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
	/* Plain inline spans, so letters still join across the split; only the colour changes. */
	.parts {
		direction: rtl;
	}
	.part.article {
		color: var(--accent);
	}
	.legend {
		margin-top: 0.5rem;
		display: inline-flex;
		flex-direction: row-reverse;
		gap: 0.5rem;
		font-family: var(--font-ui);
		font-size: 0.85rem;
		color: var(--ink-soft);
	}
	.legend .article {
		color: var(--accent);
		font-weight: 600;
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
	.translation {
		margin: 0.25rem 0 0.25rem;
		font-size: 1.1rem;
	}
	.small {
		font-size: 0.85rem;
		margin: 0.25rem 0 0;
	}
</style>
