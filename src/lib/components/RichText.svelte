<script lang="ts">
	import { splitArabic } from '../text';

	let { text }: { text: string } = $props();
</script>

{#each splitArabic(text) as part, i (i)}{#if part.ar}<span class="inline-ar ar" lang="ar" dir="rtl"
			>{part.text}</span
		>{:else}{part.text}{/if}{/each}

<style>
	.inline-ar {
		font-size: 1.3em;
		line-height: 1;
		color: var(--primary);
	}
</style>
