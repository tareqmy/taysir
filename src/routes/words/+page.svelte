<script lang="ts">
	import { resolve } from '$app/paths';
	import WordRow from '#lib/components/WordRow.svelte';
	import { app } from '#lib/progress/instance';
	import {
		findWords,
		learnedWords,
		SORTS,
		STRENGTH_LABEL,
		strengthCounts,
		type StrengthFilter,
		type WordSort
	} from '#lib/progress/words';

	let query = $state('');
	let strength = $state<StrengthFilter>('all');
	let sort = $state<WordSort>('newest');

	const words = $derived(learnedWords(app.cards));
	const counts = $derived(strengthCounts(words));
	const shown = $derived(findWords(words, { query, strength, sort }));
	const filtered = $derived(query.trim() !== '' || strength !== 'all');

	const filters = $derived<{ id: StrengthFilter; label: string; count: number }[]>([
		{ id: 'all', label: 'All', count: words.length },
		{ id: 'learning', label: STRENGTH_LABEL.learning, count: counts.learning },
		{ id: 'familiar', label: STRENGTH_LABEL.familiar, count: counts.familiar },
		{ id: 'wellKnown', label: STRENGTH_LABEL.wellKnown, count: counts.wellKnown }
	]);

	let searchBox = $state<HTMLInputElement>();

	/** The button that does this goes away with the "no words match" message, so focus is put back in the controls rather than lost to the top of a long list. */
	function clear() {
		query = '';
		strength = 'all';
		searchBox?.focus();
	}
</script>

<svelte:head>
	<title>Your words · Taysir</title>
</svelte:head>

<main id="main" class="page stack">
	<a class="back muted" href={resolve('/progress')}>← Your progress</a>
	<h1>Your words</h1>

	{#if words.length === 0}
		<section class="card stack" aria-label="No words yet">
			<p>Finish a vocabulary lesson and the words you learn will appear here.</p>
			<div>
				<a class="btn" href={resolve('/')}>Back to lessons</a>
			</div>
		</section>
	{:else}
		<p class="muted">
			Every word you have been given, with how well you know it. Tap a word for its root and a verse
			it comes from.
		</p>

		<section class="card stack controls" aria-label="Find a word">
			<div class="field">
				<label for="search">Search your words</label>
				<input
					id="search"
					type="search"
					bind:value={query}
					bind:this={searchBox}
					dir="auto"
					autocomplete="off"
					autocapitalize="off"
					spellcheck="false"
					aria-describedby="search-hint"
				/>
				<span id="search-hint" class="muted hint">
					By Arabic (vowel marks do not matter), English or root.
				</span>
			</div>

			<div class="field">
				<span id="show">Show</span>
				<div class="options" role="radiogroup" aria-labelledby="show">
					{#each filters as option (option.id)}
						<label class:chosen={strength === option.id}>
							<input type="radio" name="strength" value={option.id} bind:group={strength} />
							{option.label}
							<span class="muted">{option.count.toLocaleString()}</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="field">
				<label for="sort">Sort by</label>
				<select id="sort" bind:value={sort}>
					{#each SORTS as option (option.id)}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
			</div>
		</section>

		<p class="muted count" role="status">
			{#if shown.length === 0}
				No words match.
			{:else if filtered}
				{shown.length.toLocaleString()} of {words.length.toLocaleString()} words
			{:else}
				{words.length.toLocaleString()}
				{words.length === 1 ? 'word' : 'words'}
			{/if}
		</p>

		{#if shown.length === 0}
			<div>
				<button type="button" class="btn btn-quiet" onclick={clear}>Show all my words</button>
			</div>
		{:else}
			<ul class="words">
				{#each shown as word (word.lexeme.id)}
					<WordRow {word} />
				{/each}
			</ul>
		{/if}
	{/if}
</main>

<style>
	.back {
		display: inline-flex;
		align-items: center;
		align-self: flex-start;
		min-height: 2.75rem;
		font-size: 0.9rem;
		text-decoration: none;
	}
	p {
		margin: 0;
	}
	.field {
		display: grid;
		gap: 0.4rem;
	}
	.field > label,
	.field > #show {
		font-weight: 600;
	}
	input[type='search'],
	select {
		width: 100%;
		min-height: 3rem;
		padding: 0.5rem 0.9rem;
		border: 2px solid var(--line);
		border-radius: 12px;
		background: var(--surface);
		color: inherit;
		font: inherit;
	}
	.hint {
		font-size: 0.85rem;
	}
	.options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.75rem;
	}
	.options label {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		max-width: 100%;
		padding: 0.5rem 1rem;
		border: 2px solid var(--line);
		border-radius: 999px;
		overflow-wrap: anywhere;
		cursor: pointer;
	}
	.options label.chosen {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.options input {
		accent-color: var(--primary);
	}
	.count {
		font-size: 0.9rem;
	}
	.words {
		margin: 0;
		padding: 0;
		list-style: none;
		border-top: 1px solid var(--line);
	}
</style>
