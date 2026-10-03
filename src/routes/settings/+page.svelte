<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { app } from '#lib/progress/instance';

	const goals = [5, 10, 20];

	async function reset() {
		if (!confirm('Erase all progress on this device? This cannot be undone.')) return;
		await app.reset();
		await goto(resolve('/welcome'));
	}
</script>

<main class="page stack">
	<h1>Settings</h1>

	<section class="card stack" aria-labelledby="goal">
		<h2 id="goal">Daily goal</h2>
		<div class="options" role="radiogroup" aria-labelledby="goal">
			{#each goals as value (value)}
				<label class:chosen={app.meta.dailyGoal === value}>
					<input
						type="radio"
						name="goal"
						{value}
						checked={app.meta.dailyGoal === value}
						onchange={() => app.setDailyGoal(value)}
					/>
					{value} exercises
				</label>
			{/each}
		</div>
		<p class="muted">Meeting your goal each day builds your streak.</p>
	</section>

	<section class="card stack" aria-labelledby="data">
		<h2 id="data">Your data</h2>
		<p class="muted">
			Your progress is stored only in this browser, on this device. Nothing is sent to a server.
			Clearing your browser data will erase it.
		</p>
		<button type="button" class="btn btn-quiet danger" onclick={reset}>Erase all progress</button>
	</section>
</main>

<style>
	.options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	label {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1rem;
		border: 2px solid var(--line);
		border-radius: 999px;
		cursor: pointer;
	}
	label.chosen {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	input {
		accent-color: var(--primary);
	}
	.danger {
		color: var(--bad);
		border-color: var(--bad);
		align-self: flex-start;
	}
</style>
