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
	<div class="top">
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
		</div>
	</div>
	<!-- The shapes as one set, side by side across the card. -->
	<ul class="forms" aria-label="Shapes of {letter.name}" style:--shapes={shapes.length}>
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
</article>

<style>
	.letter {
		display: grid;
		gap: 1rem;
	}
	/* The letter beside its name and sound when there is room; above them when large text leaves none. */
	.top {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
	}
	/* Amiri Quran's line puts most of its room above the letter, for marks; the padding below brings
	   the letter itself to the middle of the tile, and leaves room for a tail such as yāʾ's. */
	.glyph {
		flex: none;
		display: grid;
		place-items: center;
		width: calc(5rem * var(--ar-scale, 1));
		height: calc(5rem * var(--ar-scale, 1));
		max-width: 100%;
		padding-bottom: 0.6em;
		font-size: calc(3.2rem * var(--ar-scale, 1));
		line-height: 1;
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
	}
	.word {
		font-size: calc(1.7rem * var(--ar-scale, 1));
		line-height: 1.6;
	}
	.first {
		color: var(--accent-ink);
	}
	.gloss {
		font-size: 0.9rem;
	}
	/* Always one row, however large the Arabic or the text: the shapes stop growing once the widest,
	   ṣād's, would no longer fit its column (cqi is a hundredth of the row's width). */
	.forms {
		container-type: inline-size;
		display: grid;
		/* Close together on a wide card too, so they still read as one set. */
		grid-template-columns: repeat(var(--shapes), minmax(0, calc(6rem * var(--ar-scale, 1))));
		justify-content: center;
		gap: 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0.25rem 0.5rem 0.6rem;
		border-radius: var(--radius);
		background: var(--surface-2);
	}
	.forms li {
		display: grid;
		justify-items: center;
		min-width: 0;
	}
	.shape {
		font-size: min(calc(2.8rem * var(--ar-scale, 1)), 16cqi);
		line-height: 1.2;
		/* Room for a tail below the letter, clear of the label. */
		padding-bottom: 0.55em;
	}
	.label {
		font-size: 0.8rem;
		line-height: 1.2;
		color: var(--ink-soft);
	}
	.note {
		margin: 0;
		font-size: 0.9rem;
		color: var(--accent-ink);
	}
</style>
