<script lang="ts">
	import { onMount } from 'svelte';
	import { playAudio } from '../audio';
	import AudioButton from './AudioButton.svelte';

	let { url, onskip }: { url: string; onskip: () => void } = $props();

	let autoplayed = $state<boolean>();

	// Try to start the audio as the question appears. Some browsers insist on a tap first.
	onMount(async () => {
		autoplayed = await playAudio(url);
	});
</script>

<section class="listen card" aria-label="Listening question">
	<AudioButton {url} label="Play the audio" large />
	<p class="muted" role="status">
		{autoplayed === false
			? 'Tap the speaker to listen. If nothing plays, the audio needs an internet connection.'
			: 'Tap the speaker to hear it again.'}
	</p>
	<button type="button" class="btn btn-quiet" onclick={onskip}>I can’t listen right now</button>
</section>

<style>
	.listen {
		display: grid;
		justify-items: center;
		gap: 0.75rem;
		text-align: center;
	}
	.listen p {
		margin: 0;
	}
</style>
