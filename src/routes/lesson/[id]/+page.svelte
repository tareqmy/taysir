<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { lessonById } from '#lib/content/course';
	import LessonPlayer from '#lib/components/LessonPlayer.svelte';
	import { app } from '#lib/progress/instance';

	const lesson = $derived(lessonById(page.params.id ?? ''));
	const locked = $derived(lesson ? app.lessonStatus(lesson.id) === 'locked' : false);
</script>

<main class="page">
	{#if !lesson}
		<section class="card stack">
			<h1>Lesson not found</h1>
			<a class="btn" href={resolve('/')}>Back to lessons</a>
		</section>
	{:else if locked}
		<section class="card stack">
			<h1>Not yet</h1>
			<p>Finish the earlier lessons first. Each one builds on the last.</p>
			<a class="btn" href={resolve('/')}>Back to lessons</a>
		</section>
	{:else}
		{#key lesson.id}
			<LessonPlayer {lesson} />
		{/key}
	{/if}
</main>
