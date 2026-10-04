<script lang="ts">
	import { resolve } from '$app/paths';
	import ActivityGrid from '#lib/components/ActivityGrid.svelte';
	import MeterBar from '#lib/components/MeterBar.svelte';
	import { cardIds, units } from '#lib/content/course';
	import { surahName } from '#lib/data';
	import { app } from '#lib/progress/instance';
	import {
		activityTotals,
		activityWeeks,
		courseProgress,
		coverage,
		lettersLearned,
		percent,
		unitProgress,
		verseCoverage,
		wordKnowledge,
		wordsLearned
	} from '#lib/progress/stats';

	const plural = (n: number, one: string, many: string) =>
		`${n.toLocaleString()} ${n === 1 ? one : many}`;

	// What the course has to offer, to measure the learner against.
	const totalWords = [...cardIds].filter((id) => id.startsWith('lx:')).length;
	const totalLetters = [...cardIds].filter((id) => id.startsWith('lt:')).length;

	const knowledge = $derived(wordKnowledge(app.cards));
	const learned = $derived(wordsLearned(knowledge));
	const letters = $derived(lettersLearned(app.cards));
	const quran = $derived(coverage(app.cards));
	const verses = $derived(verseCoverage(app.cards));
	const rows = $derived(unitProgress(units, app.meta));
	const course = $derived(courseProgress(rows));
	const weeks = $derived(activityWeeks(app.meta, app.today));
	const totals = $derived(activityTotals(app.meta));
	const due = $derived(app.dueCards.length);

	/** Lessons the learner is expected to do: the ones they chose to skip do not count against them. */
	const lessonsToDo = $derived(course.total - course.skipped);
	/** Readers skip the alphabet, so only show letters to those who are learning them. */
	const showLetters = $derived(letters > 0 || app.meta.placement === 'beginner');

	const legend = $derived([
		{
			label: 'Well known',
			note: 'the next review is three weeks or more away',
			count: knowledge.wellKnown,
			color: 'var(--primary)'
		},
		{
			label: 'Familiar',
			note: 'answered correctly, with the next review sooner than that',
			count: knowledge.familiar,
			color: 'var(--accent-ink)'
		},
		{
			label: 'Learning',
			note: 'just started, or missed lately',
			count: knowledge.learning,
			color: 'var(--ink-soft)'
		}
	]);
</script>

<svelte:head>
	<title>Your progress · Taysir</title>
</svelte:head>

<main id="main" class="page stack">
	<h1>Your progress</h1>

	<dl class="headline">
		<div class="card">
			<dt>Day streak</dt>
			<dd>{app.streak.current}</dd>
		</div>
		<div class="card">
			<dt>Longest streak</dt>
			<dd>{app.streak.longest}</dd>
		</div>
		<div class="card">
			<dt>Words learned</dt>
			<dd>{learned}</dd>
		</div>
		<div class="card">
			<dt>Lessons done</dt>
			<dd>{course.done}</dd>
		</div>
	</dl>

	<section class="card stack" aria-labelledby="words">
		<h2 id="words">Words</h2>
		{#if learned === 0}
			<p class="muted">Words appear here as you complete vocabulary lessons.</p>
		{/if}
		<p>
			<strong>{learned.toLocaleString()}</strong> of {totalWords.toLocaleString()} words learned
			<span class="muted">({percent(learned, totalWords)}%)</span>
		</p>
		<MeterBar
			max={totalWords}
			parts={legend.map((part) => ({ value: part.count, color: part.color }))}
		/>
		<ul class="legend">
			{#each legend as part (part.label)}
				<li>
					<span class="swatch" style:background={part.color} aria-hidden="true"></span>
					<span>
						<strong>{part.count.toLocaleString()}</strong>
						{part.label.toLowerCase()}
						<span class="muted">· {part.note}</span>
					</span>
				</li>
			{/each}
		</ul>
		{#if showLetters}
			<p class="muted">Letters: {letters} of {totalLetters} learned.</p>
		{/if}
		<div class="buttons">
			{#if due > 0}
				<a class="btn btn-quiet" href={resolve('/review')}>
					Review {plural(due, 'item', 'items')} due now
				</a>
			{/if}
			{#if app.cards.length > 0}
				<a class="btn btn-quiet" href={resolve('/practice')}>Practise your weakest words</a>
			{/if}
		</div>
	</section>

	<section class="card stack" aria-labelledby="quran">
		<h2 id="quran">In the Quran</h2>
		<p>
			Words from the lessons you have completed make up <strong
				>{quran.known.toLocaleString()}</strong
			>
			of the {quran.words.toLocaleString()} words in the surahs the course covers
			<span class="muted">({percent(quran.known, quran.words)}%)</span>.
		</p>
		<MeterBar max={quran.words} parts={[{ value: quran.known, color: 'var(--primary)' }]} />
		<p class="muted">
			{quran.withCard.toLocaleString()} of these words are vocabulary cards. The other
			{(quran.words - quran.withCard).toLocaleString()}, such as a noun with a pronoun ending, are
			not cards yet, so this cannot reach 100%.
		</p>
		<a class="btn btn-quiet" href={resolve('/verses')}>
			Verses you know: {verses.known.toLocaleString()} of {verses.total.toLocaleString()}
		</a>
		<details>
			<summary>Surah by surah</summary>
			<ul class="rows">
				{#each quran.surahs as surah (surah.surah)}
					<li>
						<div class="row-text">
							<span>{surahName(surah.surah)}</span>
							<span class="muted">{surah.known} of {surah.words}</span>
						</div>
						<MeterBar max={surah.words} parts={[{ value: surah.known, color: 'var(--primary)' }]} />
					</li>
				{/each}
			</ul>
		</details>
	</section>

	<section class="card stack" aria-labelledby="practice">
		<h2 id="practice">Practice</h2>
		<p>
			You have practised on <strong>{plural(totals.daysPracticed, 'day', 'days')}</strong>,
			answering
			{plural(totals.exercises, 'exercise', 'exercises')}, and met your daily goal on
			{plural(totals.goalDays, 'day', 'days')}.
		</p>
		<ActivityGrid {weeks} />
	</section>

	<section class="card stack" aria-labelledby="lessons">
		<h2 id="lessons">Lessons</h2>
		<p>
			<strong>{course.done}</strong> of {lessonsToDo} lessons complete
			<span class="muted">({percent(course.done, lessonsToDo)}%)</span>
			{#if course.skipped > 0}
				<span class="muted">· {plural(course.skipped, 'lesson', 'lessons')} skipped</span>
			{/if}
		</p>
		<ul class="rows">
			{#each rows as row (row.unit.id)}
				{@const toDo = row.total - row.skipped}
				<li>
					<div class="row-text">
						<span>{row.unit.title}</span>
						<span class="muted">
							{#if toDo === 0}
								Skipped
							{:else}
								{row.done} of {toDo}
							{/if}
						</span>
					</div>
					<MeterBar max={toDo} parts={[{ value: row.done, color: 'var(--primary)' }]} />
				</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	.headline {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr));
		gap: 0.75rem;
		margin: 0;
	}
	.headline .card {
		display: flex;
		flex-direction: column-reverse;
		justify-content: flex-end;
		gap: 0.25rem;
		padding: 0.9rem 1rem;
		text-align: center;
	}
	.headline dt {
		font-size: 0.85rem;
		color: var(--ink-soft);
	}
	.headline dd {
		margin: 0;
		font-family: var(--font-display);
		font-size: 2.1rem;
		line-height: 1.1;
		color: var(--primary);
	}
	h2 {
		margin: 0;
	}
	p {
		margin: 0;
	}
	.legend,
	.rows {
		display: grid;
		gap: 0.6rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.legend li {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}
	.swatch {
		flex: none;
		width: 0.9rem;
		height: 0.9rem;
		border-radius: 4px;
		/* Lines the square up with the first line of text beside it. */
		transform: translateY(0.1rem);
	}
	.rows li {
		display: grid;
		gap: 0.3rem;
	}
	.row-text {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0 1rem;
	}
	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	summary {
		display: flex;
		align-items: center;
		min-height: 2.75rem;
		color: var(--primary);
		cursor: pointer;
	}
	details[open] summary {
		margin-bottom: 0.5rem;
	}
</style>
