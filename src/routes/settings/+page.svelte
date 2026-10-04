<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ARABIC_SIZES } from '#lib/arabic-size';
	import { arabicSize } from '#lib/arabic-size.svelte';
	import InstallOffer from '#lib/components/InstallOffer.svelte';
	import VerseView from '#lib/components/VerseView.svelte';
	import { downloadText } from '#lib/download';
	import { backupFileName, parseBackup, summarize, type ParsedBackup } from '#lib/progress/backup';
	import { app } from '#lib/progress/instance';

	const goals = [5, 10, 20];

	/** A real backup is around a hundred kilobytes; anything far bigger is not one. */
	const MAX_BACKUP_BYTES = 5_000_000;

	type Accepted = Extract<ParsedBackup, { ok: true }>;
	let message = $state<{ kind: 'good' | 'bad'; text: string }>();
	// Raw state: the parsed backup is read-only, so it needs no reactive proxy.
	let pending = $state.raw<Accepted>();
	let restored = $state(false);

	function backUp() {
		const now = new Date();
		const name = backupFileName(now);
		downloadText(name, JSON.stringify(app.exportBackup(), null, '\t'));
		pending = undefined;
		restored = false;
		message = { kind: 'good', text: `Saved as ${name}. Keep it somewhere safe.` };
	}

	async function chooseFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = ''; // so choosing the same file again still counts as a change
		pending = undefined;
		restored = false;
		if (!file) return;
		if (file.size > MAX_BACKUP_BYTES) {
			message = { kind: 'bad', text: 'That file is too large to be a Taysir backup.' };
			return;
		}
		let text: string;
		try {
			text = await file.text();
		} catch {
			message = { kind: 'bad', text: 'That file could not be read.' };
			return;
		}
		const parsed = parseBackup(text, app.knownIds);
		if (parsed.ok) {
			pending = parsed;
			message = undefined;
		} else {
			message = { kind: 'bad', text: parsed.error };
		}
	}

	async function restore() {
		if (!pending) return;
		try {
			await app.restore(pending.backup);
		} catch {
			pending = undefined;
			message = { kind: 'bad', text: 'Your progress could not be restored. Nothing was changed.' };
			return;
		}
		pending = undefined;
		restored = true;
		message = { kind: 'good', text: 'Your progress has been restored.' };
	}

	const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' });
	const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

	async function reset() {
		if (!confirm('Erase all progress on this device? This cannot be undone.')) return;
		await app.reset();
		await goto(resolve('/welcome'));
	}
</script>

<svelte:head>
	<title>Settings · Taysir</title>
</svelte:head>

<main id="main" class="page stack">
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

	<section class="card stack" aria-labelledby="arabic-size">
		<h2 id="arabic-size">Arabic text size</h2>
		<div class="options" role="radiogroup" aria-labelledby="arabic-size">
			{#each ARABIC_SIZES as size (size.id)}
				<label class:chosen={arabicSize.current === size.id}>
					<input
						type="radio"
						name="arabic-size"
						value={size.id}
						checked={arabicSize.current === size.id}
						onchange={() => arabicSize.set(size.id)}
					/>
					{size.label}
					<span class="muted">{Math.round(size.scale * 100)}%</span>
				</label>
			{/each}
		</div>
		<VerseView surah={1} ayah={1} note="This is how the Arabic will look." />
		<p class="muted">
			This is kept on this device only, so a phone and a laptop can differ, and restoring a backup
			does not change it. On a narrow screen the biggest sizes stop growing where the longest words
			would no longer fit.
		</p>
	</section>

	<section class="card stack" aria-labelledby="install">
		<h2 id="install">Install Taysir</h2>
		<InstallOffer here="settings" />
	</section>

	<section class="card stack" aria-labelledby="backup">
		<h2 id="backup">Back up your progress</h2>
		<p class="muted">
			Save your progress to a file to keep, so you can move to another device or recover it if your
			browser data is cleared. The file stays with you; nothing is uploaded.
		</p>
		<div class="actions">
			<button type="button" class="btn" onclick={backUp}>Download backup</button>
			<label class="btn btn-quiet file">
				Restore from a backup
				<input type="file" accept="application/json,.json" onchange={chooseFile} />
			</label>
		</div>

		{#if message}
			<p class="message {message.kind}" role={message.kind === 'bad' ? 'alert' : 'status'}>
				{message.text}
				{#if restored}<a href={resolve('/')}>Back to lessons</a>{/if}
			</p>
		{/if}

		{#if pending}
			{@const found = summarize(pending.backup)}
			{@const left = pending.skipped.lessons + pending.skipped.cards}
			<div class="confirm stack" role="group" aria-label="Confirm restore">
				<p>
					<strong>Backup from {dateFormat.format(found.exportedAt)}:</strong>
					{plural(found.lessonsCompleted, 'lesson', 'lessons')} completed,
					{plural(found.cards, 'item', 'items')} in review,
					{plural(found.daysPracticed, 'day', 'days')} of practice.
				</p>
				{#if left > 0}
					<p class="muted">
						{plural(left, 'entry', 'entries')} for lessons this version of Taysir does not have
						{left === 1 ? 'was' : 'were'} left out.
					</p>
				{/if}
				<p>
					Restoring <strong>replaces</strong> the progress on this device, which is now
					{plural(app.meta.completedLessons.length, 'lesson', 'lessons')} completed and
					{plural(app.cards.length, 'item', 'items')} in review.
				</p>
				<div class="actions">
					<button type="button" class="btn" onclick={restore}>
						Replace my progress with this backup
					</button>
					<button type="button" class="btn btn-quiet" onclick={() => (pending = undefined)}>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	</section>

	<section class="card stack" aria-labelledby="data">
		<h2 id="data">Your data</h2>
		<p class="muted">
			Your progress is stored only in this browser, on this device. Nothing is sent to a server.
			Clearing your browser data will erase it, so back it up first if it matters to you.
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
		max-width: 100%;
		padding: 0.6rem 1rem;
		border: 2px solid var(--line);
		border-radius: 999px;
		overflow-wrap: anywhere;
		cursor: pointer;
	}
	label.chosen {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	input {
		accent-color: var(--primary);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	/* The real input is hidden, but still reachable by keyboard; the label shows its focus. */
	.file {
		position: relative;
	}
	.file input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}
	.file:focus-within {
		outline: 3px solid var(--accent);
		outline-offset: 2px;
	}
	.message {
		margin: 0;
	}
	.message.good {
		color: var(--good);
	}
	.message.bad {
		color: var(--bad);
	}
	.confirm {
		padding: 1rem;
		border: 2px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface-2);
	}
	.confirm p {
		margin: 0;
	}
	.danger {
		color: var(--bad);
		border-color: var(--bad);
		align-self: flex-start;
	}
</style>
