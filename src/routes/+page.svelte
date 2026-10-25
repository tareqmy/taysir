<script lang="ts">
	import { tick } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { resolve } from '$app/paths';
	import InstallOffer from '#lib/components/InstallOffer.svelte';
	import { units } from '#lib/content/course';
	import { appInstall } from '#lib/install.svelte';
	import { app } from '#lib/progress/instance';

	const next = $derived(app.nextLesson);
	/** Not before a first lesson is done: until then the learner has not yet seen what is worth keeping. */
	const offerInstall = $derived(appInstall.offerOnHome && app.meta.completedLessons.length > 0);

	let main = $state<HTMLElement>();
	/** Said aloud when the card goes: the button that had focus is gone with it. */
	let installNote = $state('');

	/** The card has gone, taking the focused button with it: say so, and keep focus on the page. */
	async function settled(note: string) {
		installNote = note;
		await tick();
		main?.focus();
	}
	const dueCount = $derived(app.dueCards.length);
	const goal = $derived(app.meta.dailyGoal);
	const percent = $derived(Math.min(100, Math.round((app.todayCount / goal) * 100)));
	const statusLabel = { done: 'Completed', skipped: 'Skipped', next: 'Up next', locked: '' };

	let contentsOpen = $state(true);
	let openUnits = new SvelteSet(units.map((u) => u.id));

	const tocGroups = [
		{
			id: 'foundations',
			title: 'Part 1 · Foundations & Al-Fatiha',
			unitIds: ['letters', 'fatiha', 'grammar', 'short-surahs', 'grammar-sentences']
		},
		{
			id: 'juz-amma',
			title: 'Part 2 · Juz Amma (Surahs 78–111)',
			unitIds: [
				'juz-amma-1',
				'juz-amma-2',
				'grammar-juz-amma',
				'juz-amma-3',
				'juz-amma-4',
				'juz-amma-5',
				'juz-amma-6',
				'juz-amma-7'
			]
		},
		{
			id: 'juz-tabarak',
			title: 'Part 3 · 29th Juz (Surahs 67–77)',
			unitIds: ['juz-tabarak-1', 'juz-tabarak-2', 'juz-tabarak-3', 'juz-tabarak-4']
		},
		{
			id: 'later-grammar',
			title: 'Part 4 · Later Grammar & Forms',
			unitIds: ['grammar-later', 'grammar-forms', 'grammar-roots', 'grammar-review']
		}
	];

	let openGroups = new SvelteSet(tocGroups.map((g) => g.id));

	const unitInfos = $derived(
		units.map((unit) => {
			const total = unit.lessons.length;
			const done = unit.lessons.filter((l) => {
				const s = app.lessonStatus(l.id);
				return s === 'done' || s === 'skipped';
			}).length;
			const isCurrent = next ? unit.lessons.some((l) => l.id === next.id) : false;
			const pct = total > 0 ? Math.round((done / total) * 100) : 0;
			return { unit, done, total, pct, isCurrent, finished: done === total && total > 0 };
		})
	);

	const groupedToc = $derived(
		tocGroups
			.map((group) => {
				const items = unitInfos.filter((u) => group.unitIds.includes(u.unit.id));
				const done = items.reduce((s, i) => s + i.done, 0);
				const total = items.reduce((s, i) => s + i.total, 0);
				const here = items.some((i) => i.isCurrent);
				const finished = total > 0 && done === total;
				return { ...group, items, done, total, here, finished };
			})
			.filter((g) => g.items.length > 0)
	);

	const nextUnit = $derived(
		next ? units.find((u) => u.lessons.some((l) => l.id === next.id)) : undefined
	);

	function toggleGroup(groupId: string) {
		if (openGroups.has(groupId)) {
			openGroups.delete(groupId);
		} else {
			openGroups.add(groupId);
		}
	}

	function toggleUnit(unitId: string) {
		if (openUnits.has(unitId)) {
			openUnits.delete(unitId);
		} else {
			openUnits.add(unitId);
		}
	}

	function expandAllUnits() {
		for (const u of units) openUnits.add(u.id);
	}

	function collapseAllUnits() {
		openUnits.clear();
	}

	async function jumpToUnit(unitId: string) {
		if (!openUnits.has(unitId)) {
			openUnits.add(unitId);
			await tick();
		}
		const el = document.getElementById(`unit-sec-${unitId}`);
		if (!el) return;
		const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		el.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
	}
</script>

<svelte:head>
	<title>Your lessons · Taysir</title>
</svelte:head>

<main id="main" class="page home-page stack" tabindex="-1" bind:this={main}>
	<h1 class="visually-hidden">Your lessons</h1>
	<span class="visually-hidden" role="status">{installNote}</span>

	<aside class="home-sidebar" aria-label="Overview and contents">
		{#if next}
			<section class="continue-hero" aria-label="Current lesson">
				<svg class="hero-arch" viewBox="0 0 120 120" aria-hidden="true">
					<path d="M20 116V58C20 34 38 18 60 6C82 18 100 34 100 58V116Z" class="arch-niche" />
					<path
						d="M36 104V62a24 24 0 0 1 48 0v42"
						fill="none"
						stroke="currentColor"
						stroke-width="7"
						stroke-linecap="round"
						opacity="0.35"
					/>
				</svg>
				<div class="hero-eyebrow">
					Up next{#if nextUnit}
						· {nextUnit.title}{/if}
				</div>
				<div class="hero-title">
					<strong>{next.title}</strong>
					<span>{next.subtitle}</span>
				</div>
				<a class="btn btn-gold" href={resolve('/lesson/[id]', { id: next.id })}>
					Continue: {next.title}
				</a>
			</section>
		{:else}
			<p class="card">You have finished every lesson so far. More are on the way.</p>
		{/if}

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
			{#if dueCount > 0}
				<a class="btn btn-quiet" href={resolve('/review')}>
					Review {dueCount}
					{dueCount === 1 ? 'item' : 'items'}
				</a>
			{:else if app.cards.length > 0}
				<a class="btn btn-quiet" href={resolve('/practice')}
					>Nothing due: practise your weakest words</a
				>
			{:else}
				<a class="btn btn-quiet" href={resolve('/review')}>Nothing to review</a>
			{/if}
		</div>

		{#if offerInstall}
			<section class="card stack" aria-labelledby="install">
				<h2 id="install">Keep Taysir at hand</h2>
				<InstallOffer here="home" onsettled={settled} />
				<div>
					<button
						type="button"
						class="btn btn-quiet"
						onclick={() => {
							appInstall.dismissHint();
							void settled('Put away. You can still install Taysir from Settings.');
						}}
					>
						Not now
					</button>
				</div>
			</section>
		{/if}

		<nav class="contents-inline" class:folded={!contentsOpen} aria-label="Contents">
			<div class="contents-head">
				<button
					type="button"
					class="contents-collapse-btn"
					aria-expanded={contentsOpen}
					aria-controls="contents-inline-body"
					onclick={() => (contentsOpen = !contentsOpen)}
				>
					<span class="contents-title">Contents</span>
					<svg class="chevron" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
						<path
							d="M6 9l6 6 6-6"
							fill="none"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
				{#if contentsOpen}
					<div class="fold-actions" role="group" aria-label="Expand or collapse parts">
						<button
							type="button"
							class="icon-fold-btn"
							aria-label="Expand all parts"
							title="Expand all parts"
							disabled={openGroups.size === groupedToc.length}
							onclick={() => {
								for (const g of groupedToc) openGroups.add(g.id);
							}}
						>
							<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
								<path
									d="M7 9l5-5 5 5M7 15l5 5 5-5"
									fill="none"
									stroke="currentColor"
									stroke-width="2.2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
						<button
							type="button"
							class="icon-fold-btn"
							aria-label="Collapse all parts"
							title="Collapse all parts"
							disabled={openGroups.size === 0}
							onclick={() => openGroups.clear()}
						>
							<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
								<path
									d="M7 4l5 5 5-5M7 20l5-5 5 5"
									fill="none"
									stroke="currentColor"
									stroke-width="2.2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
					</div>
				{/if}
			</div>
			<div id="contents-inline-body" class="contents-body" hidden={!contentsOpen}>
				{#each groupedToc as group (group.id)}
					{@const isGroupOpen = openGroups.has(group.id)}
					<div
						class="contents-group"
						class:folded={!isGroupOpen}
						class:here={!isGroupOpen && group.here}
					>
						<button
							type="button"
							class="contents-group-head"
							aria-expanded={isGroupOpen}
							aria-controls="toc-group-{group.id}"
							onclick={() => toggleGroup(group.id)}
						>
							<span class="contents-group-name">
								{group.title}
								{#if !isGroupOpen && group.here}
									<b> · Here</b>
								{/if}
							</span>
							<span class="toc-count" class:finished={group.finished}>
								{group.done}/{group.total}
							</span>
							<svg class="chevron" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
								<path
									d="M6 9l6 6 6-6"
									fill="none"
									stroke="currentColor"
									stroke-width="2.2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
						<ol id="toc-group-{group.id}" class="toc-list" hidden={!isGroupOpen}>
							{#each group.items as { unit, done, total, pct, isCurrent, finished } (unit.id)}
								<li>
									<a
										class="toc-row"
										class:here={isCurrent}
										href="#unit-sec-{unit.id}"
										onclick={(e) => {
											e.preventDefault();
											void jumpToUnit(unit.id);
										}}
									>
										<span class="toc-name">
											{unit.title}
											{#if isCurrent}
												<b> · You are here</b>
											{/if}
										</span>
										<span class="toc-count" class:finished>
											{done}/{total}
										</span>
										<span class="toc-bar" aria-hidden="true">
											<i style:width="{pct}%"></i>
										</span>
									</a>
								</li>
							{/each}
						</ol>
					</div>
				{/each}
			</div>
		</nav>
	</aside>

	<div class="home-main">
		<div class="units-bar">
			<span class="units-bar-title">Lesson units</span>
			<div class="fold-actions" role="group" aria-label="Unit actions">
				<button
					type="button"
					class="icon-fold-btn"
					aria-label="Expand all units"
					title="Expand all units"
					disabled={openUnits.size === units.length}
					onclick={expandAllUnits}
				>
					<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
						<path
							d="M7 9l5-5 5 5M7 15l5 5 5-5"
							fill="none"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
				<button
					type="button"
					class="icon-fold-btn"
					aria-label="Collapse all units"
					title="Collapse all units"
					disabled={openUnits.size === 0}
					onclick={collapseAllUnits}
				>
					<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
						<path
							d="M7 4l5 5 5-5M7 20l5-5 5 5"
							fill="none"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			</div>
		</div>

		{#each unitInfos as { unit, done, total, finished } (unit.id)}
			{@const isOpen = openUnits.has(unit.id)}
			<section
				id="unit-sec-{unit.id}"
				class="unit-sec"
				class:folded={!isOpen}
				aria-labelledby="unit-{unit.id}"
			>
				<h2 id="unit-{unit.id}" class="unit-head">
					<button
						type="button"
						class="unit-toggle"
						aria-expanded={isOpen}
						aria-controls="unit-body-{unit.id}"
						onclick={() => toggleUnit(unit.id)}
					>
						<span class="unit-name">{unit.title}</span>
						<span class="unit-count" class:finished>{done} / {total} done</span>
						<svg class="chevron" viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
							<path
								d="M6 9l6 6 6-6"
								fill="none"
								stroke="currentColor"
								stroke-width="2.2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				</h2>
				<div id="unit-body-{unit.id}" class="unit-body" hidden={!isOpen}>
					<p class="unit-note muted">{unit.description}</p>
					<ol class="lessons">
						{#each unit.lessons as lesson, idx (lesson.id)}
							{@const status = app.lessonStatus(lesson.id)}
							<li class={status}>
								<a class="row" href={resolve('/lesson/[id]', { id: lesson.id })}>
									<span class="dot" aria-hidden="true">
										{#if status === 'done'}
											✓
										{:else if status === 'skipped'}
											–
										{:else if status === 'next'}
											→
										{:else}
											{idx + 1}
										{/if}
									</span>
									<span class="titles">
										<strong>{lesson.title}</strong>
										<span class="muted">{lesson.subtitle}</span>
									</span>
									{#if statusLabel[status]}
										<span class="tag">{statusLabel[status]}</span>
									{/if}
								</a>
							</li>
						{/each}
					</ol>
				</div>
			</section>
		{/each}
	</div>
</main>

<style>
	.continue-hero {
		position: relative;
		overflow: hidden;
		display: grid;
		gap: 0.7rem;
		padding: 1.15rem 1.2rem;
		border-radius: 20px;
		background: linear-gradient(145deg, #1d5a48, #123e31);
		color: #f4f1ea;
		box-shadow: var(--shadow);
	}
	.continue-hero > :not(.hero-arch) {
		position: relative;
	}
	.hero-arch {
		position: absolute;
		right: -18px;
		top: -14px;
		width: 124px;
		height: 124px;
		color: #e7a72a;
		pointer-events: none;
	}
	.arch-niche {
		fill: rgba(10, 32, 25, 0.45);
	}
	.hero-eyebrow {
		font-size: 0.82rem;
		font-weight: 600;
		color: #cfe0d8;
		padding-right: 4.5rem;
	}
	.hero-title {
		display: grid;
		gap: 0.15rem;
		padding-right: 4.5rem;
	}
	.hero-title strong {
		font-family: var(--font-display);
		font-size: 1.25rem;
		line-height: 1.25;
		color: #ffffff;
	}
	.hero-title span {
		font-size: 0.88rem;
		color: #cfe0d8;
	}
	.btn-gold {
		background: #e7a72a;
		color: #15241f;
		border-color: transparent;
		font-weight: 700;
	}
	.btn-gold:hover {
		background: #f0b53e;
	}
	.today {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 1.25rem;
		align-items: center;
		padding: 1rem 1.15rem;
	}
	.streak {
		display: grid;
		justify-items: center;
		min-width: min(5.5rem, 100%);
	}
	.num {
		font-family: var(--font-display);
		font-size: 2.35rem;
		line-height: 1;
		color: var(--primary);
	}
	.label {
		font-size: 0.82rem;
		color: var(--ink-soft);
		text-align: center;
	}
	.bar {
		height: 0.6rem;
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
		margin: 0.35rem 0 0;
		font-size: 0.88rem;
	}
	.more {
		display: inline-flex;
		align-items: center;
		min-height: 2.25rem;
		font-size: 0.88rem;
		font-weight: 600;
	}
	.actions {
		display: grid;
		gap: 0.65rem;
	}
	.lessons {
		position: relative;
		list-style: none;
		margin: 0.5rem 0 0;
		padding: 0;
		display: grid;
		gap: 0.35rem;
	}
	.lessons::before {
		content: '';
		position: absolute;
		left: 1.95rem;
		top: 1.5rem;
		bottom: 1.5rem;
		width: 2px;
		background: var(--line);
	}
	.lessons li {
		position: relative;
	}
	.row {
		display: grid;
		grid-template-columns: 2.4rem minmax(0, 1fr) auto;
		gap: 0.8rem;
		align-items: center;
		padding: 0.65rem 0.75rem;
		border: 1px solid transparent;
		border-radius: 14px;
		background: transparent;
		color: inherit;
		text-decoration: none;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}
	a.row:hover {
		background: var(--primary-soft);
	}
	.titles {
		display: grid;
		gap: 0.1rem;
		/* With large text a long word may not fit the row: break it rather than run off the screen. */
		overflow-wrap: anywhere;
	}
	.titles strong {
		font-size: 1rem;
		line-height: 1.3;
	}
	.titles .muted {
		font-size: 0.86rem;
		line-height: 1.35;
	}
	.dot {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 50%;
		background: var(--surface-2);
		border: 2px solid var(--bg);
		color: var(--ink-soft);
		font-size: 0.88rem;
		font-weight: 700;
	}
	.done .dot {
		background: var(--good);
		color: var(--primary-ink);
	}
	.next .row {
		background: var(--accent-soft);
		border-color: var(--accent);
	}
	.next .dot {
		background: var(--surface);
		color: var(--accent-ink);
		box-shadow: inset 0 0 0 3px var(--accent);
	}
	.tag {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--ink-soft);
	}
	.home-sidebar,
	.home-main {
		display: contents;
	}
	.contents-inline {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 18px;
		padding: 0.85rem 1rem;
		box-shadow: var(--shadow);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.contents-inline.folded {
		padding: 0.65rem 1rem;
	}
	.contents-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.contents-collapse-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.2rem 0.35rem;
		margin-left: -0.35rem;
		border: 0;
		border-radius: 8px;
		background: transparent;
		color: var(--ink);
		font-family: var(--font-display);
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		max-width: 100%;
		overflow-wrap: anywhere;
	}
	.contents-collapse-btn:hover {
		color: var(--primary);
	}
	.chevron {
		flex: none;
		color: var(--ink-soft);
		transition: transform 0.2s ease;
	}
	.contents-collapse-btn[aria-expanded='true'] .chevron,
	.contents-group-head[aria-expanded='true'] .chevron,
	.unit-toggle[aria-expanded='true'] .chevron {
		transform: rotate(180deg);
	}
	.contents-body {
		display: grid;
		gap: 0.65rem;
	}
	.contents-body[hidden] {
		display: none;
	}
	.contents-group {
		display: grid;
		gap: 0.4rem;
	}
	.contents-group.folded {
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--bg);
	}
	.contents-group.folded.here {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.contents-group-head {
		width: 100%;
		min-height: 2.25rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.55rem;
		border: 0;
		border-radius: 10px;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		max-width: 100%;
		overflow-wrap: anywhere;
	}
	.contents-group-head:hover {
		background: var(--primary-soft);
	}
	.contents-group-name {
		flex: 1;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--ink-soft);
	}
	.contents-group.folded .contents-group-name {
		color: var(--ink);
	}
	.contents-group-name b {
		color: var(--accent-ink);
		font-weight: 700;
	}
	.toc-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.4rem;
	}
	.toc-list[hidden] {
		display: none;
	}
	.toc-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.35rem 0.7rem;
		padding: 0.55rem 0.75rem;
		border: 1px solid var(--line);
		border-radius: 12px;
		background: var(--bg);
		color: inherit;
		text-decoration: none;
		transition:
			border-color 0.15s ease,
			background 0.15s ease;
	}
	.toc-row:hover {
		border-color: var(--primary);
	}
	.toc-row.here {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.toc-name {
		font-size: 0.88rem;
		font-weight: 500;
		overflow-wrap: anywhere;
	}
	.toc-name b {
		color: var(--accent-ink);
		font-weight: 600;
	}
	.toc-count {
		font-size: 0.78rem;
		color: var(--ink-soft);
		white-space: nowrap;
	}
	.toc-count.finished,
	.unit-count.finished {
		color: var(--good);
		font-weight: 600;
	}
	.toc-bar {
		grid-column: 1 / -1;
		height: 5px;
		border-radius: 999px;
		background: var(--surface-2);
		overflow: hidden;
	}
	.toc-bar i {
		display: block;
		height: 100%;
		border-radius: 999px;
		background: var(--primary);
	}
	.unit-sec {
		scroll-margin-top: calc(var(--top-h, 4rem) + 3.5rem);
		display: grid;
		gap: 0.35rem;
	}
	.unit-sec.folded {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: 16px;
		padding: 0.15rem 0.75rem;
	}
	.units-bar {
		position: sticky;
		top: calc(var(--top-h, 4rem) - 1px);
		z-index: 20;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.6rem 0.25rem;
		background: var(--bg);
		border-bottom: 1px solid var(--line);
	}
	.units-bar-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--ink-soft);
	}
	.fold-actions {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.icon-fold-btn {
		width: 34px;
		height: 34px;
		padding: 0;
		display: grid;
		place-items: center;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: var(--surface);
		color: var(--primary);
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			background-color 0.15s ease;
	}
	.contents-inline .icon-fold-btn {
		background: var(--bg);
	}
	.icon-fold-btn:hover:not(:disabled) {
		background: var(--primary-soft);
		border-color: var(--primary);
	}
	.icon-fold-btn:disabled {
		opacity: 0.42;
		color: var(--ink-soft);
		cursor: default;
	}
	.unit-head {
		margin: 0;
	}
	.unit-toggle {
		width: 100%;
		min-height: 2.75rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.35rem 0.65rem;
		padding: 0.35rem 0.25rem;
		border: 0;
		border-radius: 12px;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		max-width: 100%;
		overflow-wrap: anywhere;
	}
	.unit-toggle:hover .unit-name {
		color: var(--primary);
	}
	.unit-name {
		flex: 1 1 12rem;
		min-width: 0;
		font-size: 1.1rem;
		font-weight: 600;
	}
	.unit-count {
		font-family: var(--font-ui);
		font-size: 0.84rem;
		font-weight: 400;
		color: var(--ink-soft);
	}
	.unit-note {
		margin: 0 0 0.25rem;
		padding: 0 0.25rem;
		font-size: 0.92rem;
	}
	.unit-body[hidden] {
		display: none;
	}
	@media (min-width: 56rem) {
		.home-page {
			max-width: 70rem;
			padding: 1.25rem 2rem 4rem;
			display: grid;
			grid-template-columns: 21.5rem minmax(0, 1fr);
			align-items: start;
			gap: 2rem;
		}
		.home-sidebar {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			position: sticky;
			top: calc(var(--top-h, 4rem) + 1rem);
			max-height: calc(100dvh - var(--top-h, 4rem) - 2rem);
			padding-bottom: 1.5rem;
			overflow-y: auto;
			scrollbar-width: thin;
		}
		.home-sidebar > :not(.contents-inline) {
			flex-shrink: 0;
		}
		.contents-inline {
			flex-shrink: 0;
		}
		.home-main {
			display: flex;
			flex-direction: column;
			gap: 1.25rem;
			min-width: 0;
		}
	}
	@media (max-width: 30rem) {
		.today {
			grid-template-columns: 1fr;
		}
		/* No room to show it, but a screen reader still says whether a lesson is done or next, as the
		   ✓ and → beside it are only a picture. The same as .visually-hidden in app.css. */
		.tag {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0 0 0 0);
			white-space: nowrap;
		}
	}
</style>
