# Taysir (تيسير)

Learn to understand the Arabic of the Quran. Words and grammar are taught from real verses, and a spaced-repetition review brings each item back just before it is forgotten.

**Status:** a working vertical slice. It has a placement choice, the alphabet, vocabulary and root lessons from Al-Fatiha, two grammar lessons, vocabulary lessons for all of Juz Amma (surahs 78 to 114), a review queue, and streaks with a daily goal. The English glosses and grammar explanations are **drafts that still need review by a qualified teacher** before any public release.

## Run it

Requires Node 22.17 or newer (SvelteKit 3).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command              | What it does                                               |
| -------------------- | ---------------------------------------------------------- |
| `npm run dev`        | Dev server with hot reload                                 |
| `npm run build`      | Static single-page build into `build/`                     |
| `npm run preview`    | Serve the production build (service worker is active here) |
| `npm test`           | Unit tests (Vitest)                                        |
| `npm run check`      | Type-check Svelte and TypeScript                           |
| `npm run lint`       | Prettier and ESLint                                        |
| `npm run data:build` | Rebuild the Quran data from the corpus (see below)         |
| `npm run icons`      | Regenerate the PNG icons in `static/` (mirrors `icon.svg`) |

## How it works

- **SvelteKit 3 / Svelte 5, TypeScript**, rendered entirely on the client as a PWA. Progress lives in the browser's IndexedDB; there is no backend.
- **Spaced repetition** uses [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs). A correct answer is graded “Good”, a wrong one “Again”.
- **Audio is streamed**, never bundled: verse recitation from EveryAyah and single-word audio from the Quran.com CDN. Lessons work offline; audio needs a connection.
- **Streaks** count days the daily goal was met. Every seventh day earns a freeze (up to two) that covers one missed day.

## Data pipeline

The Arabic text, roots, lemmas, grammar tags and frequencies come from the Quranic Arabic Corpus. Nothing Arabic is typed by hand in the lesson data.

```
data/source/quran-morphology.txt   corpus, unchanged (GPL)
data/lexicon-seeds.ts              English meanings, keyed by corpus location
data/fatiha-glosses.ts             word-by-word glosses for Al-Fatiha
data/juz-amma-glosses.ts           word-by-word glosses for surahs 105–114
data/juz-amma/N.ts                 glosses and meanings for surahs 104 down to 78, one file per unit
        │  npm run data:build  (scripts/build-corpus.ts)
        ▼
src/lib/data/generated/*.json      what the app loads (verses.json, lexicon.json)
```

To add a vocabulary word, add a seed with the `surah:ayah:word:segment` location of one occurrence and a short meaning, then run `npm run data:build`. The build fails loudly if a location is wrong.

To add a surah, add it to `SURAHS` in `scripts/build-corpus.ts`, gloss every word in a glosses file (the build fails on a missing or stale gloss), and add its name to `src/lib/data/surahs.ts`. Lessons for surahs 78–104 are plain data in `src/lib/content/juz-amma/unit-N.ts`, built by `surah-lessons.ts`; prose there never contains hand-typed Arabic, only `{surah:ayah:word}` placeholders. Only words that recur in the Quran (plus a few that carry a famous surah) get vocabulary cards; rarer words are glossed under the verse.

## Layout

```
src/lib/content/    course schema, alphabet, exercise builders, the lessons themselves
src/lib/progress/   scheduler, streaks, storage (IndexedDB + in-memory), reactive app state
src/lib/components/ lesson and exercise views
src/routes/         home, welcome, lesson, review, settings, about
```

## Known gaps

- Covered so far: Al-Fatiha and all of Juz Amma (78–114). Everything beyond Juz Amma is still to do.
- Glosses and notes for surahs 78–104 were drafted in bulk. `data/juz-amma/REVIEW.md` lists the entries to check first with a teacher.
- No audio for the alphabet letters yet.
- Review grading is binary (right or wrong); speed-based Hard/Easy grading would improve scheduling.

## License and credits

Taysir is released under the **GNU General Public License v3**. See [`LICENSE`](LICENSE) for the full text.

- Quran text, morphology and frequencies: [Quranic Arabic Corpus](https://corpus.quran.com) v0.4 by Kais Dukes (GNU GPL), via the corrected fork at [mustafa0x/quran-morphology](https://github.com/mustafa0x/quran-morphology). See `data/source/SOURCE.md`.
- Recitation audio: Mishary Rashid Alafasy via [EveryAyah](https://everyayah.com); word audio from the [Quran.com](https://quran.com) CDN.
- Typeface: Amiri Quran (SIL Open Font License), via `@fontsource/amiri-quran`.
