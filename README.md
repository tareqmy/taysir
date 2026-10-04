# Taysir (تيسير)

Learn to understand the Arabic of the Quran. Words and grammar are taught from real verses, and a spaced-repetition review brings each item back just before it is forgotten.

**Status:** a working vertical slice. It has a placement choice, the alphabet, vocabulary and root lessons from Al-Fatiha, ten grammar lessons, vocabulary lessons for all of Juz Amma (surahs 78 to 114), a review queue, streaks with a daily goal, and a progress page. The English glosses and grammar explanations are **drafts that still need review by a qualified teacher** before any public release.

## Run it

Requires Node 22.17 or newer (SvelteKit 3).

```bash
npm install
npm run dev        # http://localhost:5173
```

There is also a `Makefile` with the same commands as short targets. `make help` lists them: `make dev`, `make preview` (builds, then serves the production build with its service worker on http://localhost:4173), `make tunnel` (the same build at a temporary https address, to try on a phone: see “Trying it on a phone”), `make test`, `make e2e`, `make check`, `make lint`, and `make ci`, which runs every step the CI workflow runs, in the same order. Ports can be changed, for example `make dev PORT=3000`.

| Command                 | What it does                                                    |
| ----------------------- | --------------------------------------------------------------- |
| `npm run dev`           | Dev server with hot reload                                      |
| `npm run build`         | Static single-page build into `build/`                          |
| `npm run preview`       | Serve the production build (service worker is active here)      |
| `npm test`              | Unit tests (Vitest)                                             |
| `npm run e2e`           | Browser tests: builds, serves the build, runs it in Chromium    |
| `npm run e2e:install`   | Download the Chromium the browser tests use (needed once)       |
| `npm run check`         | Type-check Svelte and TypeScript                                |
| `npm run lint`          | Prettier and ESLint                                             |
| `npm run data:build`    | Rebuild the Quran data from the corpus (see below)              |
| `npm run icons`         | Regenerate the PNG icons in `static/` (mirrors `icon.svg`)      |
| `npm run review:export` | Write the teacher-review spreadsheet to `review/` (see below)   |
| `npm run review:apply`  | Apply a reviewer's returned spreadsheet to the data (see below) |

## Trying it on a phone

A phone cannot use the offline worker (so it cannot try offline lessons or the update prompt) over plain `http` on your network: a service worker needs `https`. `make tunnel` builds the app, serves it, and opens a temporary `https` address to it, which you open on the phone.

```bash
brew install cloudflared   # once; Cloudflare's quick tunnel needs no account
make tunnel                # prints an https://….trycloudflare.com address; Ctrl-C stops it
```

To use another tool, set `TUNNEL` to its command, for example one that gives a fixed address. What to know:

- **The address changes each run,** and a phone's saved progress, and an app added to its home screen, belong to one address. A quick tunnel is good for checking layout, touch, audio, text sizes and a one-session try of offline use. It cannot try the update prompt, which needs the same address before and after a new version, or an app left installed for days. For those, use a tool that gives a fixed address.
- **Anyone with the address can open the app while the tunnel runs.** It serves only the app, not your progress, which stays on the phone, but the English in it is still an unreviewed draft. Keep the address to yourself and stop the tunnel when you are done.
- **The preview server lists the tunnel domains it will answer to** (`preview.allowedHosts` in `vite.config.ts`); it refuses any other host name. A test (`e2e/tunnel-host.spec.ts`) checks that.

## How it works

- **SvelteKit 3 / Svelte 5, TypeScript**, rendered entirely on the client as a PWA. Progress lives in the browser's IndexedDB; there is no backend.
- **Verse-level practice** ends each vocabulary lesson with up to three questions on the verses it showed: put a verse in order, say what a verse means, fill a gap, tap a word, or hear a verse and say what it says (`src/lib/content/verse-exercises.ts`). A verse's English is its word-by-word glosses joined into one line, so these questions add no new English to review. They are not graded per card.
- **Listening questions** play a word or a verse and ask for its meaning, with nothing to read (`listening: true` on an exercise). Each vocabulary lesson has one for a word (`src/lib/content/listening.ts`) and, when it shows a verse of two to nine words, one for a verse; about a quarter of the word questions in a review are listening ones. Because audio is streamed, the runner leaves them out when the device is offline, and a learner can always skip one (“I can’t listen right now”) without a penalty: a skipped question counts for nothing, right or wrong. Listening answers are not timed, so they never earn “Easy” or “Hard”.
- **Spaced repetition** uses [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs). In a review, a wrong answer is graded “Again”, and a right one by how long it took: “Easy” within 3.5 seconds, “Hard” after 9 seconds, otherwise “Good” (thresholds in `src/lib/progress/grading.ts`). Time spent away from the page is ignored.
- **Audio is streamed**, never bundled: verse recitation from EveryAyah and single-word audio from the Quran.com CDN. Each letter card plays a real recitation of a common Quran word that starts with that letter (chosen in `src/lib/content/alphabet.ts`), because no open-licensed per-letter recordings exist. Lessons work offline; audio needs a connection, so listening questions are skipped when there is none.
- **Extra practice** (`/practice`) is there for when nothing is due: the review page, the home page and the progress page all offer it. It drills the words still being learned first, then the familiar ones, then the well known, drawing at random within each group with the most-missed first (`src/lib/progress/practice.ts`). Answers count toward today's goal and streak but do not touch the review schedule, so practising early cannot upset the spacing.
- **The progress page** (`/progress`, linked from the streak card on the home page) shows the streak and its record, how well the words are known, how much of the Quran's text the completed lessons cover, a 12-week practice calendar, and lessons done per unit. It is worked out from what is already saved (`src/lib/progress/stats.ts`), so nothing extra is stored or backed up. A word is _well known_ when its last review set the next one three weeks or more away, _familiar_ when it was answered correctly with a sooner next review, and _learning_ otherwise. Coverage counts every occurrence of a word from a completed lesson. Some words, such as a noun with a pronoun ending, are not vocabulary cards yet, so it cannot reach 100%, and the page says so.
- **Verses you know** (`/verses`, linked from the progress page) lists, surah by surah, the verses whose vocabulary words are all learned, drawn with the usual verse view so the recitation and word meanings are there. Words that are not vocabulary cards yet do not stand in the way, but at least half of a verse's words must be vocabulary words, so one learned word cannot unlock a verse that is mostly words that are not cards yet (`isKnownVerse` in `src/lib/progress/stats.ts`). A surah's verses are only drawn while it is open.
- **Arabic text size** (Settings) has four steps: Smaller, Standard, Large and Largest (90%, 100%, 125% and 150% of the usual Arabic size), with a real verse as a preview. It is kept on the device in `localStorage`, not in the progress file, so a phone and a laptop can differ and restoring a backup never changes it. Every Arabic size in the stylesheet is multiplied by one variable, `--ar-scale` (`src/lib/arabic-size.ts`, `arabic-size.svelte.ts`), and the places that hold Arabic in tiles widen their columns from the same variable, so a tile stacks into one column before a word could break. On a narrow screen the biggest sizes stop growing where the longest words would no longer fit.
- **App updates** are offered, never forced. The service worker downloads a new version in the background and waits (`src/service-worker.ts`). A banner then says it is ready (`src/lib/update.svelte.ts`, `UpdateBanner.svelte`), and “Update now” switches over and reloads. A page that is open keeps running its own version until then, so nothing changes under a lesson in progress. “Later” hides the banner until the next page load. A page left open asks for new versions when it becomes visible and once an hour.
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
src/routes/         home, welcome, lesson, review, practice, progress, verses, settings, about
e2e/                browser tests (Playwright), with their helpers in e2e/support/
```

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `master` and on pull requests: it rebuilds the generated data and fails if the committed files differ, then runs the type-check, lint, unit tests and the production build. A second job, alongside it, runs the browser tests in Chromium and keeps the report if one fails. Nothing is deployed yet; hosting waits until the English has been reviewed.

## Browser tests

`e2e/` holds Playwright tests that drive the production build in Chromium, the way a learner would. Run them with `make e2e` (or `npm run e2e`), once `make e2e-install` has downloaded Chromium. To use the Chrome you already have, add `E2E_CHANNEL=chrome`. A failed run leaves a report: `npx playwright show-report`.

- **`learner-journey.spec.ts`:** a new learner chooses a starting point, reads and finishes a lesson, and sees it on the lesson list, the progress page and the verses page, and after a reload.
- **`practice-and-review.spec.ts`:** a review reschedules what was due and leaves the rest alone, and extra practice counts toward the day without touching the schedule.
- **`restore.spec.ts`:** saved progress restores through Settings and shows up everywhere, a file that is not a backup is refused, and a downloaded backup holds the progress.
- **`tunnel-host.spec.ts`:** the preview server answers under a tunnel's host name (for `make tunnel`) and still refuses a stranger's.
- **`update-banner.spec.ts`:** the offer to update, with the real service worker. The app is served from a copy of the build (`e2e/support/site.ts`) that can be redeployed at the same address as a new version. A first visit is quiet; a redeploy is found and offered without disturbing the open page, whose offline files stay until the switch; “Update now” reloads onto the new version and clears the old files; “Later” puts the offer away until the next visit; and updating in one tab leaves another tab alone, which can still switch. It is checked in both colour schemes.
- **`arabic-size.spec.ts`:** the Arabic text size changes Arabic and not English, is kept on the device and untouched by a backup, and at the Largest size on a phone nothing overflows or breaks a word, at normal and 200% text, across the lessons that show the course's widest words.
- **`accessibility.spec.ts`:** axe-core on every screen, in a phone and a desktop window, in light and dark mode. Nothing is allowed to fail.

The tests need no hooks in the app. To start a learner part-way through the course they build one with the app's own scheduler (`e2e/support/seed.ts`) and load it through Settings, the way a learner restores a backup. They know the right answer to a lesson question from the course data, which they import directly. A question made on the spot, as in a review, is answered by picking the first choice, so those tests check what the app does with the answers, not whether they were right.

Not covered yet: phone-width and large-text layout outside the Arabic screens, and offline behaviour.

## Accessibility

The app was audited with axe-core on every screen (light and dark, a phone and a desktop window), by keyboard, and with text scaled to 200%. The axe part is now automated by `e2e/accessibility.spec.ts`, and a new screen belongs in it. To keep it that way:

- Text colours are checked against the 4.5:1 contrast rule by `src/lib/colors.spec.ts`. Use `--accent-ink`, not `--accent`, for gold text.
- Every route sets its own page title, has one `h1`, and the layout has a skip link to `#main`.
- Interactive things are native buttons and links, at least 44 px tall on a phone, with a visible focus ring. Answer state is never colour alone: choices carry hidden text ("correct answer"), the matching screen uses `aria-pressed` and announces matches.
- Things that are drawn rather than written (the progress bars and calendar cells) must reach 3:1 against their background, which `colors.spec.ts` checks. Bars are decoration with the numbers written beside them, and the calendar is a table that describes each day in text: outlined means practised, filled means goal met.
- After each question, keyboard focus moves to the new question heading, so the next Tab reaches its first answer.
- A listening question never depends on hearing alone: it has a skip button, and the answer shows the Arabic and its meaning in writing.
- Layouts reflow rather than scroll sideways: no fixed multi-column grids; use `repeat(auto-fit, minmax(min(100%, Nrem), 1fr))`, `flex-wrap` and `min-width: 0`. Arabic sizes stop growing at very large text, because an Arabic word cannot be broken across lines. Use `.ar-md`, `.ar-lg` or `.ar-xl` for Arabic so the learner's Arabic size applies, and give any grid that holds Arabic tiles a column width derived from `--ar-scale`, as the choice and match views do.

## Teacher review

All the English (word glosses, card meanings, lesson text) is a draft that needs a qualified teacher. The whole course is about 17 hours of review by my rough estimate, so it is offered in five parts a reviewer can take one at a time, in the order learners meet them (parts 1 and 2 matter most). The parts are listed in `scripts/review-sheets.ts`, and a test checks they cover every course unit exactly once.

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
