<script lang="ts">
	import { splitArabic } from '../text';

	let { text }: { text: string } = $props();
</script>

{#each splitArabic(text) as part, i (i)}{#if part.ar}<span class="inline-ar ar" lang="ar" dir="rtl"
			>{part.text}</span
		>{:else}{part.text}{/if}{/each}

<style>
	/* A little larger than the English around it, and as large again as the learner's Arabic size. */
	.inline-ar {
		font-size: calc(1.3em * var(--ar-scale, 1));
		line-height: 1;
		color: var(--primary);
	}
</style>
