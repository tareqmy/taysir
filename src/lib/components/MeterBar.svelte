<script lang="ts">
	interface Part {
		value: number;
		/** A CSS colour, normally one of the theme variables. */
		color: string;
	}

	/** One or more shares of `max`, drawn side by side. */
	let { parts, max }: { parts: Part[]; max: number } = $props();
</script>

<!-- Decoration only: the same numbers are always written out next to it. -->
<div class="meter" aria-hidden="true">
	{#each parts as part, i (i)}
		{#if part.value > 0 && max > 0}
			<div
				class="part"
				style:width="{Math.min(100, (part.value / max) * 100)}%"
				style:background={part.color}
			></div>
		{/if}
	{/each}
</div>

<style>
	.meter {
		display: flex;
		gap: 2px;
		height: 0.7rem;
		border-radius: 999px;
		background: var(--surface-2);
		overflow: hidden;
	}
	.part {
		flex: 0 1 auto;
		min-width: 4px;
		border-radius: 999px;
	}
</style>
