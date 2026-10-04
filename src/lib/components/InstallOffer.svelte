<script lang="ts">
	import { resolve } from '$app/paths';
	import { appInstall } from '../install.svelte';

	/** Where it is shown: the backup it mentions is either a link away or further down the page. */
	let { here }: { here: 'home' | 'settings' } = $props();
</script>

{#if appInstall.mode === 'installed'}
	<p class="muted">You are using Taysir as an installed app.</p>
{:else if appInstall.mode === 'button'}
	<p>Install Taysir to open it like any other app, in one tap.</p>
	<div>
		<button type="button" class="btn" onclick={() => appInstall.install()}>Install Taysir</button>
	</div>
{:else if appInstall.mode === 'steps'}
	<p>Add Taysir to your home screen to open it like any other app, in one tap.</p>
	<ol>
		<li>In Safari, tap the Share button, the square with an arrow.</li>
		<li>Choose “Add to Home Screen”.</li>
		<li>Tap “Add”.</li>
	</ol>
	<p class="muted">
		The app on your home screen keeps its own saved data, apart from Safari’s, so it starts empty.
		{#if here === 'home'}
			<a href={resolve('/settings')}>Download a backup in Settings</a> first,
		{:else}
			Download a backup below first,
		{/if}
		and restore it in the app.
	</p>
{:else}
	<p class="muted">
		Your browser is not offering to install Taysir right now. If it can, it will have an install
		option in its menu or address bar.
	</p>
{/if}

<style>
	p,
	ol {
		margin: 0;
	}
	ol {
		padding-left: 1.4rem;
	}
	li {
		padding: 0.15rem 0;
	}
</style>
