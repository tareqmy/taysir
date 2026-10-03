<script lang="ts">
	import { DATA_ATTRIBUTION } from '#lib/data';
</script>

<main class="page stack">
	<h1>About Taysir</h1>

	<section class="card stack">
		<h2>What this is</h2>
		<p>
			Taysir (<span class="ar" lang="ar" dir="rtl">تيسير</span>, “making easy”) helps you understand
			the Arabic of the Quran. You learn words and grammar from real verses, and a spaced-repetition
			review brings each item back just before you would forget it.
		</p>
		<p class="muted">
			This is an early version. Only Al-Fatiha is included so far, and the explanations and word
			meanings are drafts that still need review by a qualified teacher. If you notice a mistake,
			please trust your teacher over this app.
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
			Taysir is free software, released under the GNU General Public License, version 3. The Quranic
			Arabic Corpus data it uses is also GPL-licensed, and the source link above lets you follow
			changes to it.
		</p>
	</section>
</main>

<style>
	ul {
		margin: 0;
		padding-left: 1.2rem;
		display: grid;
		gap: 0.75rem;
	}
</style>
