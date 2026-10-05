<script lang="ts">
	import { wordAudioFromLoc } from '../audio';
	import { formatRoot } from '../data';
	import { STRENGTH_LABEL, wordExample, type LearnedWord } from '../progress/words';
	import AudioButton from './AudioButton.svelte';
	import VerseView from './VerseView.svelte';

	let { word }: { word: LearnedWord } = $props();

	const lexeme = $derived(word.lexeme);
	const example = $derived(wordExample(lexeme));
	const panel = $derived(`word-${lexeme.id}`);
	const times = $derived(lexeme.count === 1 ? 'once' : `${lexeme.count.toLocaleString()} times`);
	/** The row's own details open on tap, and are only built then: a long list has hundreds of rows. */
	let open = $state(false);
</script>

<li class="word">
	<div class="row">
		<button
			type="button"
			class="toggle"
			aria-expanded={open}
			aria-controls={panel}
			onclick={() => (open = !open)}
		>
			<span class="ar ar-md" lang="ar" dir="rtl">{lexeme.arabic}</span>
			<span class="text">
				<span class="gloss">{lexeme.gloss}</span>
				<span class="strength">
					<span class="swatch {word.strength}" aria-hidden="true"></span>
					{STRENGTH_LABEL[word.strength]}
				</span>
			</span>
		</button>
		<AudioButton url={wordAudioFromLoc(lexeme.sample.loc)} label="Hear {lexeme.arabic}" />
	</div>

	<div id={panel} class="panel" hidden={!open}>
		{#if open}
			<div class="meta">
				{#if lexeme.root}
					<span class="pill"
						>root <span class="ar" lang="ar" dir="rtl">{formatRoot(lexeme.root)}</span></span
					>
				{/if}
				<span class="muted">{lexeme.pos}, appears {times} in the Quran.</span>
			</div>
			<p class="seen muted">
				Seen as <span class="ar ar-md" lang="ar" dir="rtl">{example.form}</span> in {example.place}
			</p>
			{#if example.inApp}
				<VerseView surah={example.surah} ayah={example.ayah} />
			{/if}
		{/if}
	</div>
</li>

<style>
	.word {
		border-bottom: 1px solid var(--line);
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.toggle {
		flex: 1 1 0;
		min-width: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 1rem;
		min-height: 3.25rem;
		padding: 0.5rem 0.25rem;
		border: 0;
		border-radius: 8px;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	.toggle:hover {
		background: var(--surface-2);
	}
	.toggle .ar {
		flex: 0 0 auto;
		line-height: 1.5;
	}
	.text {
		display: grid;
		flex: 1 1 8rem;
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.strength {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--ink-soft);
	}
	.swatch {
		flex: none;
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		background: var(--ink-soft);
	}
	.swatch.familiar {
		background: var(--accent-ink);
	}
	.swatch.wellKnown {
		background: var(--primary);
	}
	.panel {
		display: grid;
		gap: 0.5rem;
		padding: 0.25rem 0.25rem 1rem;
	}
	/* The `hidden` attribute is only the browser's own rule, which the display above would beat. */
	.panel[hidden] {
		display: none;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.75rem;
	}
	.pill .ar {
		font-size: calc(1.35em * var(--ar-scale, 1));
		line-height: 1;
		vertical-align: middle;
		/* The letters of a root are one group, so a wrapped pill breaks before them, not inside. */
		white-space: nowrap;
	}
	.seen {
		margin: 0;
		font-size: 0.9rem;
	}
	.seen .ar {
		line-height: 1;
		vertical-align: middle;
		color: var(--ink);
	}
</style>
