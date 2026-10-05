<script lang="ts">
	import { tick } from 'svelte';
	import { resolve } from '$app/paths';
	import { appInstall } from '../install.svelte';

	let {
		here,
		onsettled
	}: {
		/** Where it is shown: the backup it mentions is either a link away or further down the page. */
		here: 'home' | 'settings';
		/**
		 * Called with a sentence for the learner once the browser's prompt has been answered. Where the
		 * offer takes itself off the page when it is done, the page has to say it and keep focus.
		 */
		onsettled?: (message: string) => void;
	} = $props();

	/** The part that changes; it takes focus when the button that had it is gone. */
	let region = $state<HTMLElement>();

	async function install() {
		const outcome = await appInstall.install();
		await tick();
		onsettled?.(
			outcome === 'accepted'
				? 'Taysir is being installed.'
				: outcome === 'dismissed'
					? 'Not installed. You can install it from Settings.'
					: 'Your browser could not show its install prompt.'
		);
		// Where the offer is still on the page its new wording is read out; put focus there.
		if (region?.isConnected) region.focus();
	}
</script>

<div bind:this={region} class="offer" role="status" tabindex="-1">
	{#if appInstall.mode === 'installed'}
		<p class="muted">
			{#if appInstall.standalone}
				You are using Taysir as an installed app.
			{:else}
				Taysir is installed on this device.
			{/if}
		</p>
	{:else if appInstall.mode === 'button'}
		<p>Install Taysir to open it like any other app, in one tap.</p>
		<div>
			<button type="button" class="btn" disabled={appInstall.asking} onclick={install}>
				{appInstall.asking ? 'Waiting for your browser…' : 'Install Taysir'}
			</button>
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
	{:else if appInstall.declined}
		<p class="muted">
			You chose not to install it this time. If you change your mind, your browser’s menu or address
			bar has an install option.
		</p>
	{:else}
		<p class="muted">
			Your browser is not offering to install Taysir right now. If it can, it will have an install
			option in its menu or address bar.
		</p>
	{/if}
</div>

<style>
	.offer {
		display: grid;
		gap: 1rem;
	}
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
