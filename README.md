# Taysir (تيسير)

Learn to understand the Arabic of the Quran. Words and grammar are taught from real verses, and a spaced-repetition review brings each item back just before it is forgotten.

**Status:** a working vertical slice. It has a placement choice, the alphabet, vocabulary and root lessons from Al-Fatiha, six grammar lessons, vocabulary lessons for all of Juz Amma (surahs 78 to 114), a review queue, and streaks with a daily goal. The English glosses and grammar explanations are **drafts that still need review by a qualified teacher** before any public release.

## Run it

Requires Node 22.17 or newer (SvelteKit 3).

```bash
npm install
npm run dev        # http://localhost:5173
```

There is also a `Makefile` with the same commands as short targets. `make help` lists them: `make dev`, `make preview` (builds, then serves the production build with its service worker on http://localhost:4173), `make test`, `make check`, `make lint`, and `make ci`, which runs every step the CI workflow runs, in the same order. Ports can be changed, for example `make dev PORT=3000`.

| Command                 | What it does                                                    |
| ----------------------- | --------------------------------------------------------------- |
| `npm run dev`           | Dev server with hot reload                                      |
| `npm run build`         | Static single-page build into `build/`                          |
| `npm run preview`       | Serve the production build (service worker is active here)      |
| `npm test`              | Unit tests (Vitest)                                             |
| `npm run check`         | Type-check Svelte and TypeScript                                |
| `npm run lint`          | Prettier and ESLint                                             |
| `npm run data:build`    | Rebuild the Quran data from the corpus (see below)              |
| `npm run icons`         | Regenerate the PNG icons in `static/` (mirrors `icon.svg`)      |
| `npm run review:export` | Write the teacher-review spreadsheet to `review/` (see below)   |
| `npm run review:apply`  | Apply a reviewer's returned spreadsheet to the data (see below) |

## How it works

- **SvelteKit 3 / Svelte 5, TypeScript**, rendered entirely on the client as a PWA. Progress lives in the browser's IndexedDB; there is no backend.
- **Verse-level practice** ends each vocabulary lesson with up to three questions on the verses it showed: put a verse in order, say what a verse means, fill a gap, tap a word, or hear a verse and say what it says (`src/lib/content/verse-exercises.ts`). A verse's English is its word-by-word glosses joined into one line, so these questions add no new English to review. They are not graded per card.
- **Listening questions** play a word or a verse and ask for its meaning, with nothing to read (`listening: true` on an exercise). Each vocabulary lesson has one for a word (`src/lib/content/listening.ts`) and, when it shows a verse of two to nine words, one for a verse; about a quarter of the word questions in a review are listening ones. Because audio is streamed, the runner leaves them out when the device is offline, and a learner can always skip one (“I can’t listen right now”) without a penalty: a skipped question counts for nothing, right or wrong. Listening answers are not timed, so they never earn “Easy” or “Hard”.
- **Spaced repetition** uses [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs). In a review, a wrong answer is graded “Again”, and a right one by how long it took: “Easy” within 3.5 seconds, “Hard” after 9 seconds, otherwise “Good” (thresholds in `src/lib/progress/grading.ts`). Time spent away from the page is ignored.
- **Audio is streamed**, never bundled: verse recitation from EveryAyah and single-word audio from the Quran.com CDN. Each letter card plays a real recitation of a common Quran word that starts with that letter (chosen in `src/lib/content/alphabet.ts`), because no open-licensed per-letter recordings exist. Lessons work offline; audio needs a connection, so listening questions are skipped when there is none.
- **Backup and restore** (Settings) saves progress to a JSON file and brings it back on another device. A file is checked field by field before it replaces anything, and anything this version of the app does not have is left out. Restoring replaces the progress on the device.
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

The generated verse data is deliberately compact, because it ships in the app: for each word it keeps the text, the gloss and the vocabulary link, and only lists the word's pieces (prefix, stem, ending) when there are several, with just the four tags the app reads (`DET`, `PREF`, `SUFF`, `PRON`). A test caps its size. The whole app is about 158 kB gzipped.

## Layout

```
src/lib/content/    course schema, alphabet, exercise builders, the lessons themselves
src/lib/progress/   scheduler, streaks, storage (IndexedDB + in-memory), reactive app state
src/lib/components/ lesson and exercise views
src/routes/         home, welcome, lesson, review, settings, about
```

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `master` and on pull requests: it rebuilds the generated data and fails if the committed files differ, then runs the type-check, lint, unit tests and the production build. Nothing is deployed yet; hosting waits until the English has been reviewed.

## Accessibility

The app was audited with axe-core on every screen type (light and dark, 375 px phone width), by keyboard, and with text scaled to 200%. To keep it that way:

- Text colours are checked against the 4.5:1 contrast rule by `src/lib/colors.spec.ts`. Use `--accent-ink`, not `--accent`, for gold text.
- Every route sets its own page title, has one `h1`, and the layout has a skip link to `#main`.
- Interactive things are native buttons and links, at least 44 px tall on a phone, with a visible focus ring. Answer state is never colour alone: choices carry hidden text ("correct answer"), the matching screen uses `aria-pressed` and announces matches.
- After each question, keyboard focus moves to the new question heading, so the next Tab reaches its first answer.
- A listening question never depends on hearing alone: it has a skip button, and the answer shows the Arabic and its meaning in writing.
- Layouts reflow rather than scroll sideways: no fixed multi-column grids; use `repeat(auto-fit, minmax(min(100%, Nrem), 1fr))`, `flex-wrap` and `min-width: 0`. Arabic sizes stop growing at very large text, because an Arabic word cannot be broken across lines.

## Teacher review

All the English (word glosses, card meanings, lesson text) is a draft that needs a qualified teacher. The whole course is about 16 hours of review by my rough estimate, so it is offered in five parts a reviewer can take one at a time, in the order learners meet them (parts 1 and 2 matter most). The parts are listed in `scripts/review-sheets.ts`, and a test checks they cover every course unit exactly once.

1. `npm run review:export` writes everything to `review/` (not committed): one spreadsheet per part (`Taysir-review-part-N-….xlsx`), `Taysir-review.xlsx` with everything, and `Message-to-reviewer.md`, a draft message with a table of what each part holds and a rough time for it. Use `-- --part=2` to rebuild just one part. Each spreadsheet has a sheet each for verses, words, vocabulary cards, lesson text and grammar exercises, with instructions on the first sheet. Entries the authors were least sure of are marked Flagged and shaded.
2. The reviewer marks each row OK, Change or Unsure, types replacements in Correction, and adds comments.
3. `npm run review:apply -- returned.xlsx` (add `--dry` to preview) writes their corrections for words and cards into `data/`, and puts everything else (comments, Unsure rows, corrections it could not apply) in `review/feedback-<file name>.md` for a person to act on. Parts can come back one at a time. Then run `npm run data:build` and `npm test`.

## Known gaps

- Covered so far: Al-Fatiha and all of Juz Amma (78–114). Everything beyond Juz Amma is still to do.
- Glosses and notes for surahs 78–104 were drafted in bulk. `data/juz-amma/REVIEW.md` lists the entries to check first with a teacher.
- Letter audio plays a Quran word that starts with the letter, not the letter's own name (alif, bāʾ). Recordings of the names would need a licensed source or your own.

## License and credits

Taysir is released under the **GNU General Public License v3**. See [`LICENSE`](LICENSE) for the full text.

- Quran text, morphology and frequencies: [Quranic Arabic Corpus](https://corpus.quran.com) v0.4 by Kais Dukes (GNU GPL), via the corrected fork at [mustafa0x/quran-morphology](https://github.com/mustafa0x/quran-morphology). See `data/source/SOURCE.md`.
- Recitation audio: Mishary Rashid Alafasy via [EveryAyah](https://everyayah.com); word audio from the [Quran.com](https://quran.com) CDN.
- Typeface: Amiri Quran (SIL Open Font License), via `@fontsource/amiri-quran`.
