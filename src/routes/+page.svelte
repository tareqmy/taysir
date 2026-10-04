<script lang="ts">
	import { resolve } from '$app/paths';
	import { units } from '#lib/content/course';
	import { app } from '#lib/progress/instance';

	const next = $derived(app.nextLesson);
	const dueCount = $derived(app.dueCards.length);
	const goal = $derived(app.meta.dailyGoal);
	const percent = $derived(Math.min(100, Math.round((app.todayCount / goal) * 100)));
	const statusLabel = { done: 'Completed', skipped: 'Skipped', next: 'Up next', locked: 'Locked' };
</script>

<svelte:head>
	<title>Your lessons · Taysir</title>
</svelte:head>

<main id="main" class="page stack">
	<h1 class="visually-hidden">Your lessons</h1>

	<section class="card today" aria-label="Today">
		<div class="streak">
			<span class="num">{app.streak.current}</span>
			<span class="label">
				day streak
				{#if app.streak.freezes > 0}
					<span class="muted"
						>· {app.streak.freezes} freeze{app.streak.freezes === 1 ? '' : 's'}</span
					>
				{/if}
			</span>
		</div>
		<div class="goal">
			<div
				class="bar"
				role="progressbar"
				aria-valuemin="0"
				aria-valuemax={goal}
				aria-valuenow={Math.min(app.todayCount, goal)}
				aria-label="Daily goal"
			>
				<div class="fill" style:width="{percent}%"></div>
			</div>
			<p class="muted">
				{#if app.goalMet}
					Goal met for today. Well done.
				{:else}
					{app.todayCount} of {goal} exercises today
				{/if}
			</p>
			<a class="more" href={resolve('/progress')}>Your progress</a>
		</div>
	</section>

	<div class="actions">
		{#if next}
			<a class="btn" href={resolve('/lesson/[id]', { id: next.id })}>Continue: {next.title}</a>
		{:else}
			<p class="card">You have finished every lesson so far. More are on the way.</p>
		{/if}
		<a class="btn btn-quiet" href={resolve('/review')}>
			{dueCount === 0
				? 'Nothing to review'
				: `Review ${dueCount} ${dueCount === 1 ? 'item' : 'items'}`}
		</a>
	</div>

	{#each units as unit (unit.id)}
		<section aria-labelledby="unit-{unit.id}">
			<h2 id="unit-{unit.id}">{unit.title}</h2>
			<p class="muted">{unit.description}</p>
			<ol class="lessons">
				{#each unit.lessons as lesson (lesson.id)}
					{@const status = app.lessonStatus(lesson.id)}
					<li class={status}>
						{#if status === 'locked'}
							<div class="row" aria-disabled="true">
								<span class="dot" aria-hidden="true">·</span>
								<span class="titles">
									<strong>{lesson.title}</strong>
									<span class="muted">{lesson.subtitle}</span>
								</span>
								<span class="visually-hidden">{statusLabel[status]}</span>
							</div>
						{:else}
							<a class="row" href={resolve('/lesson/[id]', { id: lesson.id })}>
								<span class="dot" aria-hidden="true">
									{status === 'done' ? '✓' : status === 'skipped' ? '–' : '→'}
								</span>
								<span class="titles">
									<strong>{lesson.title}</strong>
									<span class="muted">{lesson.subtitle}</span>
								</span>
								<span class="tag">{statusLabel[status]}</span>
							</a>
						{/if}
					</li>
				{/each}
			</ol>
		</section>
	{/each}
</main>

<style>
	.today {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 1.5rem;
		align-items: center;
	}
	.streak {
		display: grid;
		justify-items: center;
		min-width: min(6rem, 100%);
	}
	.num {
		font-family: var(--font-display);
		font-size: 2.6rem;
		line-height: 1;
		color: var(--primary);
	}
	.label {
		font-size: 0.85rem;
		color: var(--ink-soft);
		text-align: center;
	}
	.bar {
		height: 0.7rem;
		border-radius: 999px;
		background: var(--surface-2);
		overflow: hidden;
	}
	.fill {
		height: 100%;
		background: var(--accent);
		border-radius: 999px;
		transition: width 0.3s ease;
	}
	.goal p {
		margin: 0.4rem 0 0;
		font-size: 0.9rem;
	}
	.more {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		font-size: 0.9rem;
	}
	.actions {
		display: grid;
		gap: 0.75rem;
	}
	.lessons {
		list-style: none;
		margin: 0.75rem 0 0;
		padding: 0;
		display: grid;
		gap: 0.5rem;
	}
	.row {
		display: grid;
		grid-template-columns: 2.25rem minmax(0, 1fr) auto;
		gap: 0.75rem;
		align-items: center;
		padding: 0.75rem 1rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		color: inherit;
		text-decoration: none;
	}
	a.row:hover {
		border-color: var(--primary);
	}
	.titles {
		display: grid;
		/* With large text a long word may not fit the row: break it rather than run off the screen. */
		overflow-wrap: anywhere;
	}
	.dot {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: var(--surface-2);
		color: var(--ink-soft);
		font-weight: 700;
	}
	.done .dot {
		background: var(--good-soft);
		color: var(--good);
	}
	.next .row {
		border-color: var(--primary);
		box-shadow: var(--shadow);
	}
	.next .dot {
		background: var(--primary);
		color: var(--primary-ink);
	}
	.locked .row {
		opacity: 0.55;
	}
	.tag {
		font-size: 0.8rem;
		color: var(--ink-soft);
	}
	@media (max-width: 30rem) {
		.today {
			grid-template-columns: 1fr;
		}
		.tag {
			display: none;
		}
	}
</style>
