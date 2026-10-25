<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { lessonById } from '#lib/content/course';
	import LessonPlayer from '#lib/components/LessonPlayer.svelte';

	const lesson = $derived(lessonById(page.params.id ?? ''));
</script>

<svelte:head>
	<title>{lesson ? `${lesson.title} · Taysir` : 'Lesson not found · Taysir'}</title>
</svelte:head>

<main id="main" class="page">
	{#if !lesson}
		<section class="card stack">
			<h1>Lesson not found</h1>
			<a class="btn" href={resolve('/')}>Back to lessons</a>
		</section>
	{:else}
		{#key lesson.id}
			<LessonPlayer {lesson} />
		{/key}
	{/if}
</main>
