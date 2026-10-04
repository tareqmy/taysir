<script lang="ts">
	import { playAudio } from '../audio';

	let {
		url,
		label = 'Listen',
		small = false
	}: { url: string; label?: string; small?: boolean } = $props();

	let failed = $state(false);

	async function play(event: Event) {
		event.stopPropagation();
		failed = !(await playAudio(url));
	}
</script>

<button
	type="button"
	class="audio"
	class:small
	class:failed
	onclick={play}
	aria-label={failed ? 'Audio is not available right now' : label}
	title={failed ? 'Audio needs an internet connection' : label}
>
	<svg viewBox="0 0 24 24" width={small ? 18 : 22} height={small ? 18 : 22} aria-hidden="true">
		<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
		{#if failed}
			<path d="M16 9l5 6m0-6l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		{:else}
			<path
				d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			/>
		{/if}
	</svg>
</button>
<span class="visually-hidden" role="status">
	{failed ? 'Audio needs an internet connection.' : ''}
</span>

<style>
	.audio {
		display: inline-grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border: 1px solid var(--line);
		border-radius: 50%;
		background: var(--surface);
		color: var(--primary);
		cursor: pointer;
	}
	.audio:hover {
		background: var(--primary-soft);
	}
	.failed {
		color: var(--bad);
	}
</style>
