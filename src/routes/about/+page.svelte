<script lang="ts">
	import { DATA_ATTRIBUTION } from '#lib/data';
	import { REPORT_URL, SOURCE_URL } from '#lib/links';
</script>

<svelte:head>
	<title>About · Taysir</title>
</svelte:head>

<main id="main" class="page stack">
	<h1>About Taysir</h1>

	<section class="card stack">
		<h2>What this is</h2>
		<p>
			Taysir (<span class="ar" lang="ar" dir="rtl">تيسير</span>, “making easy”) helps you understand
			the Arabic of the Quran. You learn words and grammar from real verses, and a spaced-repetition
			review brings each item back just before you would forget it.
		</p>
		<p class="muted">
			This is an early version. So far it covers Al-Fatiha and all of Juz Amma (surahs 78 to 114),
			and the explanations and word meanings are drafts that still need review by a qualified
			teacher. If you notice a mistake, please trust your teacher over this app.
		</p>
	</section>

	<section class="card stack" aria-labelledby="mistakes">
		<h2 id="mistakes">Found a mistake?</h2>
		<p>
			Corrections are welcome. <a href={REPORT_URL}>Report a mistake on GitHub</a> (it needs a free GitHub
			account), and say which lesson or word it is in.
		</p>
	</section>

	<section class="card stack" aria-labelledby="privacy">
		<h2 id="privacy">Your privacy</h2>
		<p>
			Your progress is kept only in this browser, on this device. Taysir has no accounts and no
			analytics, and sends your progress nowhere.
		</p>
		<p>
			Two things do reach other computers. When you play a recording, your browser asks the audio
			host (EveryAyah or Quran.com) for it, and that host can see your internet address. And, as
			with any website, whoever hosts Taysir sees the ordinary visits to it.
		</p>
	</section>

	<section class="card stack">
		<h2>Sources and credits</h2>
		<ul>
			<li>
				<strong>Quran text, roots, lemmas and grammar tags:</strong>
				{DATA_ATTRIBUTION.corpus}. The corpus builds on the verified text of the
				<a href="https://tanzil.net">Tanzil project</a>. {DATA_ATTRIBUTION.fork}.
			</li>
			<li>
				<strong>Recitation audio:</strong> verses by Mishary Rashid Alafasy from
				<a href="https://everyayah.com">EveryAyah</a>; single-word audio from the
				<a href="https://quran.com">Quran.com</a> audio CDN. Audio is streamed, so it needs an internet
				connection.
			</li>
			<li>
				<strong>Arabic typeface:</strong> Amiri Quran by Khaled Hosny, under the SIL Open Font License.
			</li>
			<li>
				<strong>Spaced repetition:</strong> the open-source
				<a href="https://github.com/open-spaced-repetition/ts-fsrs">FSRS</a> scheduler.
			</li>
		</ul>
	</section>

	<section class="card stack">
		<h2>License</h2>
		<p>
			Taysir is free software, released under the GNU General Public License, version 3: you may
			use, study, share and change it. Its source code is in
			<a href={SOURCE_URL}>the Taysir repository on GitHub</a>. The Quranic Arabic Corpus data it
			uses is also GPL-licensed; the links in “Sources and credits” lead to it.
		</p>
	</section>
</main>

<style>
	ul {
		margin: 0;
		padding-left: 1.2rem;
		display: grid;
		/* Without this the column grows to fit the longest unbreakable word, and the page with it. */
		grid-template-columns: minmax(0, 1fr);
		gap: 0.75rem;
	}
	/* A long web address breaks rather than running off a narrow screen. */
	li {
		overflow-wrap: anywhere;
	}
</style>
