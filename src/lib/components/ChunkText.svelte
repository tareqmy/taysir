<script lang="ts">
	import type { Chunk } from '../content/types';
	import RichText from './RichText.svelte';

	let { chunk, size = 'md' }: { chunk: Chunk; size?: 'md' | 'lg' | 'xl' } = $props();
</script>

{#if chunk.lang === 'ar'}
	<span class="ar ar-{size}" lang="ar" dir="rtl">{chunk.text}</span>
{:else}
	<span lang="en" dir="auto"><RichText text={chunk.text} /></span>
{/if}
