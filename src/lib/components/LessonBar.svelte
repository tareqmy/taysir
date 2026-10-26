<script lang="ts" module>
	/** How far through a lesson the learner is, reading and practice together. */
	export interface LessonProgress {
		done: number;
		total: number;
		/** Said by a screen reader for the bar, such as “Step 2 of 5”. */
		text: string;
	}
</script>

<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		progress,
		step
	}: {
		progress?: LessonProgress;
		/** Shown beside the bar while reading, and said aloud when it changes. */
		step?: string;
	} = $props();
</script>

<!-- A lesson's own slim header, in place of the site's: a way out, and how far there is to go. -->
<header class="lesson-bar">
	<div class="inner">
		<a class="close" href={resolve('/')}>
			<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
				<path
					d="M6 6l12 12M18 6L6 18"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linecap="round"
				/>
			</svg>
			<span class="visually-hidden">All lessons</span>
		</a>
		{#if progress}
			<div
				class="track"
				role="progressbar"
				aria-valuemin="0"
				aria-valuemax={progress.total}
				aria-valuenow={progress.done}
				aria-valuetext={progress.text}
				aria-label="Progress"
			>
				<div class="fill" style:width="{(progress.done / progress.total) * 100}%"></div>
			</div>
		{/if}
		<span class="step" aria-live="polite">{step ?? ''}</span>
	</div>
</header>

<style>
	.lesson-bar {
		position: sticky;
		top: 0;
		z-index: 30;
		background: var(--bg);
		border-bottom: 1px solid var(--line);
	}
	.inner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		max-width: 44rem;
		margin: 0 auto;
		padding: 0.3rem 1rem;
	}
	/* Thumb-sized, with the cross lined up with the page's left edge. */
	.close {
		flex: none;
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		margin-left: -0.6rem;
		border: 1px solid transparent;
		border-radius: 10px;
		color: var(--ink-soft);
		transition:
			background-color 0.15s,
			color 0.15s,
			border-color 0.15s;
	}
	.close:hover {
		background: var(--surface);
		border-color: var(--line);
		color: var(--primary);
	}
	.track {
		flex: 1;
		height: 0.6rem;
		border-radius: 999px;
		background: var(--surface-2);
		overflow: hidden;
	}
	.fill {
		height: 100%;
		background: var(--primary);
		border-radius: 999px;
		transition: width 0.25s ease;
	}
	.step {
		flex: none;
		font-size: 0.85rem;
		color: var(--ink-soft);
	}
	.step:empty {
		display: none;
	}
</style>
