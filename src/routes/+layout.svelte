<script lang="ts">
	import '../app.css';
	import '@fontsource/amiri-quran/arabic-400.css';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { arabicSize } from '#lib/arabic-size.svelte';
	import StorageNotice from '#lib/components/StorageNotice.svelte';
	import UpdateBanner from '#lib/components/UpdateBanner.svelte';
	import { lessonById } from '#lib/content/course';
	import { appInstall } from '#lib/install.svelte';
	import { app } from '#lib/progress/instance';
	import { appUpdate } from '#lib/update.svelte';

	let { children } = $props();

	// Before anything is drawn, so the Arabic never shows at one size and then jumps to another.
	arabicSize.init();
	// Before the page has finished loading, which is when the browser may offer to install the app.
	appInstall.start();

	/** Pages a brand-new learner may open before choosing a starting point. */
	const openPaths = ['/welcome', '/about'];

	onMount(() => {
		app.init();
		void appUpdate.start();
	});

	/** How often a page left open looks at the clock again. */
	const CLOCK_EVERY_MS = 60_000;

	// A page left open moves on with the clock: cards fall due, and a new day starts at midnight.
	onMount(() => {
		const timer = setInterval(() => app.refreshTime(), CLOCK_EVERY_MS);
		const shown = () => {
			if (document.visibilityState === 'visible') app.refreshTime();
		};
		document.addEventListener('visibilitychange', shown);
		return () => {
			clearInterval(timer);
			document.removeEventListener('visibilitychange', shown);
		};
	});

	$effect(() => {
		if (app.needsPlacement && !openPaths.includes(page.route.id ?? '')) {
			goto(resolve('/welcome'), { replace: true });
		}
	});

	const dueCount = $derived(app.ready ? app.dueCards.length : 0);
	/** Updating reloads the page, which would start a lesson, a review or a practice session again. */
	const busy = $derived(['/lesson/[id]', '/review', '/practice'].includes(page.route.id ?? ''));
	const isHome = $derived(page.route.id === '/');
	/** A lesson has its own slim bar (a way out and its progress) in place of the site's header. */
	const inLesson = $derived(page.route.id === '/lesson/[id]');

	let topEl = $state<HTMLElement>();
	let isDesktop = $state(false);

	onMount(() => {
		const mql = window.matchMedia('(min-width: 56rem)');
		isDesktop = mql.matches;
		const onMedia = (e: MediaQueryListEvent) => {
			isDesktop = e.matches;
		};
		mql.addEventListener('change', onMedia);
		return () => mql.removeEventListener('change', onMedia);
	});

	// The header comes and goes with a lesson, so its height is measured whenever it is drawn.
	$effect(() => {
		const top = topEl;
		if (!top) return;
		const sync = () =>
			document.documentElement.style.setProperty('--top-h', `${top.offsetHeight}px`);
		sync();
		const ro = new ResizeObserver(sync);
		ro.observe(top);
		return () => ro.disconnect();
	});

	function openMobileContents() {
		document.querySelector<HTMLDialogElement>('dialog.contents')?.showModal();
	}

	const DEFAULT_DESCRIPTION =
		'Learn Quranic Arabic vocabulary, grammar, and morphology step by step through real verses from Al-Fatiha, Juz Amma, and Juz Tabarak with spaced repetition.';

	const routeSeo = $derived.by(() => {
		const routeId = page.route.id;
		if (routeId === '/lesson/[id]') {
			const lesson = lessonById(page.params.id ?? '');
			if (lesson) {
				return {
					title: `${lesson.title} · Taysir`,
					description: `${lesson.title}: ${lesson.subtitle}. Learn Quranic Arabic vocabulary, grammar, and morphology through real Quran verses in Taysir.`
				};
			}
		}
		if (routeId === '/about') {
			return {
				title: 'About · Taysir',
				description:
					'About Taysir (تيسير): a free, offline-capable Quranic Arabic learning app teaching vocabulary, grammar, and 3-letter roots from Surahs 1 and 67–114.'
			};
		}
		if (routeId === '/welcome') {
			return {
				title: 'Welcome · Taysir',
				description:
					'Start learning Quranic Arabic with Taysir. Choose your starting point—from the Arabic alphabet or straight into Al-Fatiha—and set your daily goal.'
			};
		}
		if (routeId === '/words') {
			return {
				title: 'Your words · Taysir',
				description:
					'Browse and search your learned Quranic Arabic vocabulary words, roots, meanings, and memory strength in Taysir.'
			};
		}
		if (routeId === '/verses') {
			return {
				title: 'Verses you know · Taysir',
				description:
					'Track every Quran verse you understand word for word across Al-Fatiha, Juz Amma, and Juz Tabarak in Taysir.'
			};
		}
		if (routeId === '/progress') {
			return {
				title: 'Your progress · Taysir',
				description:
					'View your Quranic Arabic learning progress, daily streak, vocabulary mastery, and surah-by-surah coverage in Taysir.'
			};
		}
		if (routeId === '/review') {
			return {
				title: 'Review · Taysir',
				description:
					'Review due Quranic Arabic vocabulary and grammar cards with FSRS spaced repetition in Taysir.'
			};
		}
		if (routeId === '/practice') {
			return {
				title: 'Extra practice · Taysir',
				description:
					'Practise your weakest Quranic Arabic vocabulary words and listening exercises in Taysir.'
			};
		}
		if (routeId === '/settings') {
			return {
				title: 'Settings · Taysir',
				description:
					'Adjust your daily goal, Arabic font size, offline installation, and progress backup settings in Taysir.'
			};
		}
		return {
			title: 'Your lessons · Taysir',
			description: DEFAULT_DESCRIPTION
		};
	});

	$effect(() => {
		const { title, description } = routeSeo;
		const setMeta = (selector: string, content: string) => {
			const el = document.querySelector<HTMLMetaElement>(selector);
			if (el) el.content = content;
		};
		setMeta('meta[name="description"]', description);
		setMeta('meta[property="og:title"]', title);
		setMeta('meta[property="og:description"]', description);
		setMeta('meta[name="twitter:title"]', title);
		setMeta('meta[name="twitter:description"]', description);
	});
</script>

<a class="skip" href="#main">Skip to content</a>

{#if !inLesson}
	<header class="top" bind:this={topEl}>
		<div class="top-inner" class:wide={isHome}>
			<a class="brand" href={resolve('/')}>
				<svg class="logo" viewBox="0 0 120 120" width="42" height="42" aria-hidden="true">
					<defs>
						<radialGradient id="taysir-glow" cx="50%" cy="48%" r="42%">
							<stop offset="0%" stop-color="#e7a72a" stop-opacity="0.42" />
							<stop offset="100%" stop-color="#e7a72a" stop-opacity="0" />
						</radialGradient>
					</defs>
					<rect width="120" height="120" rx="27" fill="#1d5a48" />
					<path d="M24 106V60C24 38 40 24 60 12C80 24 96 38 96 60V106Z" fill="#123f33" />
					<circle cx="60" cy="58" r="34" fill="url(#taysir-glow)" />
					<path
						d="M36 92V60a24 24 0 0 1 48 0v32"
						fill="none"
						stroke="#e7a72a"
						stroke-width="7.5"
						stroke-linecap="round"
					/>
					<path
						d="M48 92V62a12 12 0 0 1 24 0v30"
						fill="none"
						stroke="#f7ebcf"
						stroke-width="5.5"
						stroke-linecap="round"
						opacity="0.85"
					/>
				</svg>
				<span class="brand-text">
					<span class="brand-title">
						<span class="name">Taysir</span>
						<span class="ar" lang="ar">تيسير</span>
					</span>
					<span class="brand-sub">Quranic Arabic step by step</span>
				</span>
			</a>
			<!-- On a phone the links are icons, so the header is one row; their names are still read. -->
			<nav aria-label="Main">
				<a href={resolve('/review')} class:active={page.route.id === '/review'}>
					<svg class="icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
						<path
							d="M19.5 9.5A8 8 0 0 0 5.3 7.2M4.5 3.5v4h4M4.5 14.5a8 8 0 0 0 14.2 2.3M19.5 20.5v-4h-4"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<span class="label">Review</span>
					{#if dueCount > 0}
						<span class="badge" aria-hidden="true">{dueCount}</span>
						<span class="visually-hidden">({dueCount} due)</span>
					{/if}
				</a>
				<a href={resolve('/about')} class:active={page.route.id === '/about'}>
					<svg class="icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
						<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
						<path
							d="M12 11v5.5M12 7.5v.01"
							fill="none"
							stroke="currentColor"
							stroke-width="2.4"
							stroke-linecap="round"
						/>
					</svg>
					<span class="label">About</span>
				</a>
				<a href={resolve('/settings')} class:active={page.route.id === '/settings'}>
					<svg class="icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
						<circle
							cx="12"
							cy="12"
							r="8.6"
							fill="none"
							stroke="currentColor"
							stroke-width="2.6"
							stroke-dasharray="3.38 3.37"
						/>
						<circle cx="12" cy="12" r="6.3" fill="none" stroke="currentColor" stroke-width="2" />
						<circle cx="12" cy="12" r="2.3" fill="none" stroke="currentColor" stroke-width="2" />
					</svg>
					<span class="label">Settings</span>
				</a>
				{#if isHome && !isDesktop}
					<button
						type="button"
						class="contents-btn"
						aria-label="Contents"
						title="Contents"
						onclick={openMobileContents}
					>
						<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
							<path
								d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"
								fill="none"
								stroke="currentColor"
								stroke-width="2.2"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				{/if}
			</nav>
		</div>
	</header>
{/if}

<StorageNotice />

{#if app.ready}
	{@render children()}
{:else}
	<p class="page muted" role="status">Loading…</p>
{/if}

<UpdateBanner {busy} />

<style>
	.top {
		position: sticky;
		top: 0;
		z-index: 30;
		background: var(--bg);
		border-bottom: 1px solid var(--line);
	}
	.top-inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 1rem;
		max-width: 44rem;
		margin: 0 auto;
		padding: 0.65rem 1rem;
	}
	@media (min-width: 56rem) {
		.top-inner.wide {
			max-width: 70rem;
			padding: 0.75rem 2rem;
		}
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		color: var(--ink);
		text-decoration: none;
	}
	.logo {
		flex: none;
		width: 2.65rem;
		height: 2.65rem;
		border-radius: 0.65rem;
	}
	.brand-text {
		display: grid;
		gap: 0.05rem;
	}
	.brand-title {
		display: inline-flex;
		align-items: baseline;
		gap: 0.45rem;
	}
	.brand .name {
		font-family: var(--font-display);
		font-size: 1.3rem;
		font-weight: 700;
		line-height: 1.15;
		color: var(--ink);
	}
	.brand .ar {
		font-size: 1.25rem;
		line-height: 1;
		color: var(--primary);
	}
	.brand-sub {
		font-size: 0.76rem;
		line-height: 1.2;
		color: var(--ink-soft);
	}
	/* On a narrow phone keep the header compact. */
	@media (max-width: 28rem) {
		.brand-sub {
			display: none;
		}
	}
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		align-items: center;
		margin-left: auto;
	}
	/* Padded to a comfortable thumb-sized target. */
	nav a {
		display: inline-flex;
		align-items: center;
		min-height: 2.35rem;
		padding: 0 0.7rem;
		border-radius: 10px;
		border: 1px solid transparent;
		color: var(--ink-soft);
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 600;
		transition:
			background-color 0.15s,
			color 0.15s,
			border-color 0.15s;
	}
	nav a:hover {
		background: var(--surface);
		border-color: var(--line);
		color: var(--primary);
	}
	nav a.active {
		background: var(--primary-soft);
		color: var(--primary);
	}
	nav .icon {
		display: none;
		flex: none;
	}
	.contents-btn {
		width: 2.35rem;
		height: 2.35rem;
		padding: 0;
		margin-left: 0.15rem;
		display: grid;
		place-items: center;
		border-radius: 10px;
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink);
		cursor: pointer;
		transition:
			background-color 0.15s,
			border-color 0.15s,
			color 0.15s;
	}
	.contents-btn:hover {
		border-color: var(--primary);
		color: var(--primary);
		background: var(--primary-soft);
	}
	.badge {
		display: inline-block;
		min-width: 1.35rem;
		padding: 0.05rem 0.4rem;
		margin-left: 0.3rem;
		border-radius: 999px;
		background: var(--accent-ink);
		color: var(--bg);
		font-size: 0.74rem;
		font-weight: 700;
		text-align: center;
	}
	/* On a phone the words would push the links onto a second row under the logo, so each link is
	   an icon, a thumb-sized square, with its word kept for screen readers. */
	@media (max-width: 34rem) {
		.top-inner {
			gap: 0.5rem;
			padding: 0.4rem 1rem;
		}
		/* Takes the room the links leave, so it is the brand that gives way, not the links. */
		.brand {
			flex: 1 1 0;
			min-width: 0;
			gap: 0.5rem;
		}
		.brand-text {
			min-width: 0;
		}
		/* When the row has no room for the Arabic name, it wraps onto a second line that is cut off,
		   so it goes as a whole, whatever the fonts, instead of overlapping the links. */
		.brand-title {
			flex-wrap: wrap;
			row-gap: 3rem;
			max-height: 2.1rem;
			overflow: hidden;
		}
		.logo {
			width: 2.4rem;
			height: 2.4rem;
		}
		nav {
			gap: 0;
		}
		nav a {
			position: relative;
			justify-content: center;
			width: 2.75rem;
			min-height: 2.75rem;
			padding: 0;
		}
		nav .icon {
			display: block;
		}
		nav .label {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0 0 0 0);
			white-space: nowrap;
		}
		/* On the corner of the icon, as on a phone's own apps. */
		nav .badge {
			position: absolute;
			top: 0.1rem;
			right: 0;
			min-width: 1.2rem;
			margin: 0;
			padding: 0 0.3rem;
			font-size: 0.7rem;
			line-height: 1.2rem;
		}
		.contents-btn {
			width: 2.75rem;
			height: 2.75rem;
		}
	}
	/* On the narrowest phones the English name goes too, and is still read aloud. */
	@media (max-width: 21rem) {
		.brand .name {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0 0 0 0);
			white-space: nowrap;
		}
	}
</style>
