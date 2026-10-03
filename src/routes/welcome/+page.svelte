<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { app } from '#lib/progress/instance';
	import type { Placement } from '#lib/progress/store';

	let placement = $state<Placement>();
	let goal = $state(10);
	let saving = $state(false);

	const goals = [
		{ value: 5, name: 'Relaxed', detail: '5 exercises a day, about 2 minutes' },
		{ value: 10, name: 'Steady', detail: '10 exercises a day, about 4 minutes' },
		{ value: 20, name: 'Committed', detail: '20 exercises a day, about 8 minutes' }
	];

	async function start() {
		if (!placement || saving) return;
		saving = true;
		await app.setPlacement(placement, goal);
		await goto(resolve('/'));
	}
</script>

<main class="page stack">
	<header>
		<h1>Understand the Arabic of the Quran</h1>
		<p class="lead muted">
			Taysir teaches you the words and grammar of Quranic Arabic through real verses, a few minutes
			at a time. Everything you do is saved on this device.
		</p>
	</header>

	{#if !placement}
		<section class="stack" aria-labelledby="where">
			<h2 id="where">Where would you like to start?</h2>
			<button type="button" class="choice card" onclick={() => (placement = 'beginner')}>
				<strong>I am new to Arabic letters</strong>
				<span class="muted"
					>Start with the alphabet and its sounds, then move into Al-Fatiha and the short surahs.</span
				>
			</button>
			<button type="button" class="choice card" onclick={() => (placement = 'reader')}>
				<strong>I can read the Quran, but I do not understand it</strong>
				<span class="muted">Skip the alphabet and go straight to words and meaning.</span>
			</button>
		</section>
	{:else}
		<section class="stack" aria-labelledby="pace">
			<h2 id="pace">How much would you like to do each day?</h2>
			<div class="goals" role="radiogroup" aria-labelledby="pace">
				{#each goals as option (option.value)}
					<label class="goal card" class:chosen={goal === option.value}>
						<input type="radio" name="goal" value={option.value} bind:group={goal} />
						<strong>{option.name}</strong>
						<span class="muted">{option.detail}</span>
					</label>
				{/each}
			</div>
			<p class="muted">You can change this any time in Settings.</p>
			<div class="buttons">
				<button type="button" class="btn btn-quiet" onclick={() => (placement = undefined)}
					>Back</button
				>
				<button type="button" class="btn" onclick={start} disabled={saving}>Start learning</button>
			</div>
		</section>
	{/if}
</main>

<style>
	.lead {
		font-size: 1.1rem;
	}
	.choice {
		display: grid;
		gap: 0.25rem;
		text-align: left;
		font: inherit;
		color: inherit;
		cursor: pointer;
		border: 2px solid var(--line);
	}
	.choice:hover {
		border-color: var(--primary);
	}
	.choice strong {
		font-size: 1.1rem;
	}
	.goals {
		display: grid;
		gap: 0.75rem;
	}
	.goal {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: auto auto;
		column-gap: 0.75rem;
		align-items: center;
		cursor: pointer;
		border: 2px solid var(--line);
	}
	.goal input {
		grid-row: 1 / 3;
		width: 1.25rem;
		height: 1.25rem;
		accent-color: var(--primary);
	}
	.goal.chosen {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.buttons {
		display: flex;
		gap: 0.75rem;
		justify-content: space-between;
	}
	.buttons .btn:last-child {
		flex: 1;
	}
</style>
