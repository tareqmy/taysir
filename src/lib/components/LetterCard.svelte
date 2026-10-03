<script lang="ts">
	import { letterById, letterForms } from '../content/alphabet';

	let { id }: { id: string } = $props();

	const letter = $derived(letterById(id));
	const forms = $derived(letterForms(letter));
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
		<h3>{letter.name}</h3>
		<p class="muted">{letter.sound}</p>
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
	.letter {
		display: grid;
		grid-template-columns: 6rem 1fr;
		gap: 1rem;
		align-items: center;
	}
	.glyph {
		display: grid;
		place-items: center;
		min-height: 7rem;
		font-size: 4.5rem;
		line-height: 1.7;
		background: var(--primary-soft);
		border-radius: var(--radius);
	}
	.info p {
		margin: 0 0 0.5rem;
	}
	.forms {
		display: flex;
		gap: 0.75rem;
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
		color: var(--accent);
	}
</style>
