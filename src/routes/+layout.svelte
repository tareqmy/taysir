<script lang="ts">
	import '../app.css';
	import '@fontsource/amiri-quran/arabic-400.css';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { app } from '#lib/progress/instance';

	let { children } = $props();

	/** Pages a brand-new learner may open before choosing a starting point. */
	const openPaths = ['/welcome', '/about'];

	onMount(() => {
		app.init();
	});

	$effect(() => {
		if (app.needsPlacement && !openPaths.includes(page.url.pathname)) {
			goto(resolve('/welcome'), { replace: true });
		}
	});

	const dueCount = $derived(app.ready ? app.dueCards.length : 0);
</script>

<svelte:head>
	<meta
		name="description"
		content="Learn the vocabulary and grammar of Quranic Arabic through real verses, with spaced repetition."
	/>
</svelte:head>

<a class="skip" href="#main">Skip to content</a>

<header class="top">
	<a class="brand" href={resolve('/')}>
		<span class="ar" lang="ar">تيسير</span>
		<span class="name">Taysir</span>
	</a>
	<nav aria-label="Main">
		<a href={resolve('/review')}>
			Review
			{#if dueCount > 0}
				<span class="badge" aria-hidden="true">{dueCount}</span>
				<span class="visually-hidden">({dueCount} due)</span>
			{/if}
		</a>
		<a href={resolve('/about')}>About</a>
		<a href={resolve('/settings')}>Settings</a>
	</nav>
</header>

{#if app.ready}
	{@render children()}
{:else}
	<p class="page muted" role="status">Loading…</p>
{/if}

<style>
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0 1rem;
		max-width: 44rem;
		margin: 0 auto;
		padding: 0.75rem 1rem;
	}
	.brand {
		display: inline-flex;
		align-items: baseline;
		gap: 0.6rem;
		color: var(--primary);
		text-decoration: none;
	}
	.brand .ar {
		font-size: 1.9rem;
		line-height: 1.2;
	}
	.brand .name {
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: 0.02em;
	}
	/* On a narrow phone the links drop under the name instead of pushing the page sideways. */
	/* On a narrow phone the Arabic wordmark is enough; the name stays for screen readers. */
	@media (max-width: 26rem) {
		.brand .name {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0 0 0 0);
			white-space: nowrap;
		}
	}
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0 0.25rem;
		align-items: center;
		margin-left: auto;
	}
	/* Padded to a comfortable thumb-sized target. */
	nav a {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0 0.5rem;
		color: var(--ink-soft);
		text-decoration: none;
		font-size: 0.95rem;
	}
	nav a:hover {
		color: var(--primary);
	}
	.badge {
		display: inline-block;
		min-width: 1.4rem;
		padding: 0 0.4rem;
		margin-left: 0.2rem;
		border-radius: 999px;
		background: var(--accent-ink);
		color: var(--bg);
		font-size: 0.75rem;
		font-weight: 700;
		text-align: center;
	}
</style>
