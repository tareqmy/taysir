<script lang="ts">
	import { resolve } from '$app/paths';
	import { app } from '../progress/instance';
</script>

{#if app.storageProblem}
	<section class="notice" aria-label="Progress is not being saved">
		<p role="alert">
			<strong>This browser is not letting Taysir save your progress.</strong>
			What you do will be lost when you close the page. You can still download a backup from
			<a href={resolve('/settings')}>Settings</a> to keep it.
		</p>
	</section>
{/if}

<style>
	.notice {
		width: min(100% - 2rem, 42rem);
		margin: 0 auto 1rem;
		padding: 0.75rem 1rem;
		border: 2px solid var(--bad);
		border-radius: var(--radius);
		background: var(--bad-soft);
		color: var(--ink);
	}
	p {
		margin: 0;
	}
</style>
