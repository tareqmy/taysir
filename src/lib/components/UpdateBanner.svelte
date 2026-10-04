<script lang="ts">
	import { appUpdate } from '../update.svelte';

	/** The learner is partway through a lesson or review, which updating would start again. */
	let { busy = false }: { busy?: boolean } = $props();

	const shown = $derived(appUpdate.available && !appUpdate.dismissed);
</script>

<!-- Always on the page, so that a screen reader announces the text when it appears. -->
<span class="visually-hidden" role="status">
	{shown ? 'A new version of Taysir is ready.' : ''}
</span>

{#if shown}
	<aside class="update card" aria-label="Update available">
		<p>
			<strong>A new version of Taysir is ready.</strong>
			{#if busy}
				Updating restarts what you are doing now.
			{/if}
		</p>
		<div class="actions">
			<button type="button" class="btn" onclick={() => appUpdate.apply()}>Update now</button>
			<button type="button" class="btn btn-quiet" onclick={() => appUpdate.dismiss()}>
				Later
			</button>
		</div>
	</aside>
{/if}

<style>
	/* After the page, so it never moves what is above it. */
	.update {
		width: min(100% - 2rem, 42rem);
		margin: 0 auto 0.75rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem 1rem;
		padding: 0.9rem 1rem;
		border: 2px solid var(--primary);
	}
	/* It sticks to the bottom of the screen while the page is longer than the screen. With large
	   text or a short screen it would cover most of the page, so there it stays under the content. */
	@media (min-height: 36rem) {
		.update {
			position: sticky;
			bottom: 0.75rem;
		}
	}
	/* The answer feedback bar takes the bottom of the screen and hides the lower half of this card,
	   so leave it out until the learner continues. It keeps its space, so nothing moves. */
	:global(body:has(.feedback)) .update {
		visibility: hidden;
	}
	p {
		flex: 1 1 14rem;
		margin: 0;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>
