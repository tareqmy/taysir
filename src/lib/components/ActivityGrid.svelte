<script lang="ts">
	import type { ActivityDay, ActivityWeek } from '../progress/stats';
	import { formatDayKey } from '../time';

	let { weeks }: { weeks: ActivityWeek[] } = $props();

	const weekdays = $derived(weeks[0]?.days ?? []);

	function label(day: ActivityDay): string {
		const date = formatDayKey(day.key, { weekday: 'long', day: 'numeric', month: 'long' });
		const exercises =
			day.count === 0
				? 'no exercises'
				: `${day.count} ${day.count === 1 ? 'exercise' : 'exercises'}`;
		return `${date}: ${exercises}${day.met ? ', goal met' : ''}${day.today ? ' (today)' : ''}`;
	}
</script>

<table>
	<caption class="visually-hidden">
		Exercises answered each day over the last {weeks.length} weeks, one row per week from Monday to Sunday
	</caption>
	<thead>
		<tr>
			<th scope="col"><span class="visually-hidden">Week starting</span></th>
			{#each weekdays as day (day.key)}
				<th scope="col">
					<span aria-hidden="true">{formatDayKey(day.key, { weekday: 'narrow' })}</span>
					<span class="visually-hidden">{formatDayKey(day.key, { weekday: 'long' })}</span>
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each weeks as week (week.start)}
			<tr>
				<th scope="row">{formatDayKey(week.start, { day: 'numeric', month: 'short' })}</th>
				{#each week.days as day (day.key)}
					<td>
						{#if !day.future}
							<span
								class="cell"
								class:practised={day.count > 0 && !day.met}
								class:met={day.met}
								class:today={day.today}
							>
								<span class="visually-hidden">{label(day)}</span>
							</span>
						{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<ul class="legend" aria-label="Key">
	<li><span class="cell" aria-hidden="true"></span> No practice</li>
	<li><span class="cell practised" aria-hidden="true"></span> Practised</li>
	<li><span class="cell met" aria-hidden="true"></span> Goal met</li>
	<li><span class="cell today" aria-hidden="true"></span> Today</li>
</ul>

<style>
	table {
		width: 100%;
		table-layout: fixed;
		border-collapse: separate;
		border-spacing: 0.25rem;
	}
	th {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--ink-soft);
	}
	thead th:first-child,
	tbody th {
		width: 22%;
		text-align: left;
		overflow-wrap: anywhere;
	}
	td {
		padding: 0;
		text-align: center;
	}
	.cell {
		display: block;
		box-sizing: border-box;
		width: 100%;
		max-width: 2.25rem;
		aspect-ratio: 1;
		margin: 0 auto;
		border: 1px solid var(--line);
		border-radius: 6px;
		background: var(--surface-2);
	}
	/* Some practice: outlined. The goal met: filled. Never colour alone. */
	.cell.practised {
		border: 2px solid var(--primary);
		background: var(--primary-soft);
	}
	.cell.met {
		border: 2px solid var(--primary);
		background: var(--primary);
	}
	.cell.today {
		outline: 2px solid var(--accent-ink);
		outline-offset: 2px;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.25rem;
		margin: 0.75rem 0 0;
		padding: 0;
		list-style: none;
		font-size: 0.85rem;
		color: var(--ink-soft);
	}
	.legend li {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.legend .cell {
		width: 1.1rem;
		margin: 0;
	}
</style>
