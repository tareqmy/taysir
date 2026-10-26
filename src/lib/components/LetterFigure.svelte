<script lang="ts">
	import { letterById } from '../content/alphabet';
	import type { Figure } from '../content/types';

	let { figure }: { figure: Figure } = $props();

	const shown = $derived(figure.ids.map(letterById));
</script>

{#if figure.type === 'letters'}
	<!-- In the order the English names them, so “one dot below, two above…” can be followed along. -->
	<ul class="letters" dir="ltr">
		{#each shown as letter (letter.id)}
			<li>
				<span class="glyph ar" lang="ar" aria-hidden="true">{letter.glyph}</span>
				<span class="name">{letter.name}</span>
			</li>
		{/each}
	</ul>
{:else}
	<figure class="direction">
		<span class="word ar ar-xl" lang="ar" dir="rtl">{figure.word}</span>
		<!-- From a dot where reading starts, on the right, to an arrowhead on the left. -->
		<svg class="arrow" viewBox="0 0 160 16" aria-hidden="true">
			<circle cx="152" cy="8" r="4.5" fill="currentColor" />
			<path
				d="M148 8H10M17 2L9 8l8 6"
				fill="none"
				stroke="currentColor"
				stroke-width="2.4"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<!-- Its letters on their own, first on the right as in the word, each with its place. -->
		<ol class="spelled" dir="rtl">
			{#each shown as letter, i (i)}
				<li>
					<span class="glyph ar" lang="ar" aria-hidden="true">{letter.glyph}</span>
					<span class="place" aria-hidden="true">{i + 1}</span>
					<span class="visually-hidden">{letter.name}</span>
				</li>
			{/each}
		</ol>
	</figure>
{/if}

<style>
	/* Each tile at least as wide as its letter at the learner's Arabic size, so the row wraps
	   rather than squeezing a letter out of its tile. */
	.letters {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		list-style: none;
		margin: 1rem 0 0;
		padding: 0;
	}
	.letters li {
		display: grid;
		justify-items: center;
		min-width: calc(3.1rem * var(--ar-scale, 1));
		padding: 0.15rem 0.35rem 0.4rem;
		border-radius: 10px;
		background: var(--primary-soft);
	}
	/* Amiri Quran keeps a lot of room above a letter for marks, and little below it for a tail such
	   as yāʾ's, so the line is short and the room below is padding: the name never meets a tail. */
	.glyph {
		font-size: calc(2.5rem * var(--ar-scale, 1));
		line-height: 1.2;
		padding-bottom: 0.55em;
		color: var(--ink);
	}
	.name {
		font-size: 0.8rem;
		line-height: 1.2;
		color: var(--ink-soft);
	}
	.direction {
		display: grid;
		justify-items: center;
		gap: 0.25rem;
		margin: 1rem 0 0;
	}
	/* Room below for the marks under the word, clear of the arrow. */
	.word {
		line-height: 1.8;
		padding-bottom: 0.4em;
		color: var(--primary);
	}
	.arrow {
		width: min(10rem, 100%);
		height: auto;
		color: var(--accent);
	}
	.spelled {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem 1.25rem;
		list-style: none;
		margin: 0.25rem 0 0;
		padding: 0;
	}
	.spelled li {
		display: grid;
		justify-items: center;
	}
	.place {
		font-size: 0.8rem;
		font-weight: 600;
		line-height: 1.2;
		color: var(--ink-soft);
	}
</style>
