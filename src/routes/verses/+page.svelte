<script lang="ts">
	import { resolve } from '$app/paths';
	import MeterBar from '#lib/components/MeterBar.svelte';
	import SurahVerses from '#lib/components/SurahVerses.svelte';
	import { app } from '#lib/progress/instance';
	import { percent, verseCoverage } from '#lib/progress/stats';

	const verses = $derived(verseCoverage(app.cards));
</script>

<svelte:head>
	<title>Verses you know · Taysir</title>
</svelte:head>

<main id="main" class="page stack">
	<a class="back muted" href={resolve('/progress')}>← Your progress</a>
	<h1>Verses you know</h1>
	<p class="muted">
		A verse appears here once you have learned every vocabulary word in it. Words that are not
		vocabulary cards yet are shown with their English meaning, and at least half of a verse’s words
		must be vocabulary words.
	</p>

	<section class="card stack" aria-label="Summary">
		<p>
			<strong>{verses.known.toLocaleString()}</strong> of {verses.total.toLocaleString()} verses
			<span class="muted">({percent(verses.known, verses.total)}%)</span>
		</p>
		<MeterBar max={verses.total} parts={[{ value: verses.known, color: 'var(--primary)' }]} />
		{#if verses.known === 0}
			<p class="muted">Complete vocabulary lessons and the verses you can follow appear here.</p>
		{/if}
	</section>

	<ul class="surahs">
		{#each verses.surahs as surah (surah.surah)}
			<li><SurahVerses surah={surah.surah} total={surah.total} known={surah.known} /></li>
		{/each}
	</ul>
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
	.surahs {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.surahs li {
		border-bottom: 1px solid var(--line);
	}
</style>
