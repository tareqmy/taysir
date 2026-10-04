<script lang="ts">
	import { letterById, letterExample, letterForms } from '../content/alphabet';
	import AudioButton from './AudioButton.svelte';

	let { id }: { id: string } = $props();

	const letter = $derived(letterById(id));
	const forms = $derived(letterForms(letter));
	const example = $derived(letterExample(letter));
	/** The word's first letter with its vowel marks, and the rest, so the letter can be highlighted. */
	const exampleParts = $derived(
		/^(\P{M}\p{M}*)([\s\S]*)$/u.exec(example.text)?.slice(1) ?? [example.text, '']
	);
	const shapes = $derived(
		[
			['alone', forms.isolated],
			['start', forms.initial],
			['middle', forms.medial],
			['end', forms.final]
		].filter((shape): shape is [string, string] => shape[1] !== undefined)
	);
</script>

<article class="letter card">
	<div class="glyph ar" lang="ar" aria-hidden="true">{letter.glyph}</div>
	<div class="info">
		<h2>{letter.name}</h2>
		<p class="muted">{letter.sound}</p>
		<div class="example">
			<AudioButton
				url={example.audioUrl}
				label="Hear {letter.name} in the word {example.text}"
				small
			/>
			<span class="word ar" lang="ar" dir="rtl"
				><span class="first">{exampleParts[0]}</span>{exampleParts[1]}</span
			>
			<span class="muted gloss">“{example.gloss}”</span>
		</div>
		<ul class="forms" aria-label="Shapes of {letter.name}">
			{#each shapes as [label, shape] (label)}
				<li>
					<span class="ar shape" lang="ar" aria-hidden="true">{shape}</span>
					<span class="label">{label}</span>
				</li>
			{/each}
		</ul>
		{#if !letter.joins}
			<p class="note">Never joins to the letter after it.</p>
		{/if}
	</div>
</article>

<style>
	/* Glyph beside the details when there is room; stacked when large text leaves none. */
	.letter {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
	}
	.glyph {
		flex: 0 0 6rem;
		max-width: 100%;
		display: grid;
		place-items: center;
		min-height: 7rem;
		font-size: 4.5rem;
		line-height: 1.7;
		background: var(--primary-soft);
		border-radius: var(--radius);
	}
	.info {
		flex: 1 1 10rem;
		/* Lets the column shrink to the card instead of pushing the page sideways. */
		min-width: 0;
	}
	.info h2 {
		font-size: 1.1rem;
	}
	.info p {
		margin: 0 0 0.5rem;
	}
	.example {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.75rem;
	}
	.word {
		font-size: 1.7rem;
		line-height: 1.6;
	}
	.first {
		color: var(--accent-ink);
	}
	.gloss {
		font-size: 0.9rem;
	}
	.forms {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.75rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.forms li {
		display: grid;
		justify-items: center;
		min-width: 3rem;
	}
	.shape {
		font-size: 2rem;
		line-height: 2;
	}
	.label {
		font-size: 0.75rem;
		color: var(--ink-soft);
		margin-top: 0.15rem;
	}
	.note {
		margin: 0.5rem 0 0;
		font-size: 0.9rem;
		color: var(--accent-ink);
	}
</style>
