# Taysir

Web app that teaches the Arabic of the Quran (vocabulary + grammar, from real verses). See `README.md` for commands and layout. This file records the decisions behind it and the rules to keep following.

## Decisions already made (do not re-ask)

- **Goal:** understand Quranic Arabic. Hybrid vocabulary + grammar, taught through real verses. A guided curriculum (not a free verse reader).
- **Learners:** a placement choice at the start: "new to the letters" or "can read the script". English only for now.
- **Stack:** SvelteKit 3 / Svelte 5 (runes) + TypeScript, client-only PWA (`ssr = false`). Progress is local-first in IndexedDB. No backend, no accounts yet.
- **Data:** Quranic Arabic Corpus (via the `mustafa0x/quran-morphology` fork), kept unchanged in `data/source/`. It is GPL, so **Taysir is GPL-3.0**.
- **Audio:** streamed from public CDNs (EveryAyah verses, Quran.com word audio). Never synthetic voice for Quran text.
- **v1 features:** spaced repetition (FSRS) and streaks with a daily goal. Not XP or badges.
- **Look:** calm and respectful (warm neutrals, green and gold accents, Amiri Quran font, automatic dark mode).
- **Working style:** the user wants to pick from options for product decisions. Offer options rather than assuming.

## Rules

- **Never type Quranic Arabic by hand.** Take it from the corpus data. Lesson data points at corpus locations (`surah:ayah:word:segment`) in `data/lexicon-seeds.ts`, `data/fatiha-glosses.ts`, `data/juz-amma-glosses.ts` and `data/juz-amma/N.ts`, then `npm run data:build` regenerates `src/lib/data/generated/`. Arabic inside lesson prose comes from `wordText(surah, ayah, n)`.
- English glosses and grammar explanations are **drafts needing review by a qualified teacher**. Keep explanations conservative; avoid claims you cannot stand behind (an earlier draft wrongly said a bare noun is always indefinite).
- Lesson content is validated by `src/lib/content/course.spec.ts`. Every new lesson or exercise must pass it (answer is among choices, no duplicate choices, ids exist).
- Generated verse data ships in the app, so keep it small: words keep only text, gloss and `lexemeId`, plus `segments` (text and the tags `DET`, `PREF`, `SUFF`, `PRON`) only for words of several pieces. Read pieces through `segmentsOf(word)`. `course.spec.ts` caps its size; raise a field's cost only if the app reads it.
- Accessibility conventions are in the README (“Accessibility”). When checking layout in the browser, compare against a fixed width, not `innerWidth`: in phone emulation the viewport grows with overflowing content and hides the overflow.
- Inside `src/lib`, use relative imports. Routes use the `#lib/*` alias (mapped in `package.json` `imports` and `tsconfig.json` `paths`).
- Rune-based state lives in `*.svelte.ts` files. Avoid TypeScript parameter properties there.

## SvelteKit 3 differences from what you may remember

- `$service-worker` is gone. Use `immutable` / `assets` from `$app/manifest` and `version` from `$app/env`. Manifest paths are relative to the worker, so resolve them against its URL.
- `goto(..., { replace: true })`, not `replaceState`.
- Svelte config lives in `vite.config.ts`. The static adapter uses `fallback: 'index.html'`.
- `tsconfig.json` must exclude `src/service-worker.ts`.

## Environment gotchas

- In the Claude Code sandbox, npm cannot write `~/.npm`. Use `export npm_config_cache="$TMPDIR/npm-cache"` and allow `registry.npmjs.org`.
- `$state.snapshot` does nothing in the unit tests (Svelte compiles it for the server there), so a reactive proxy handed to IndexedDB or `structuredClone` only fails in a real browser (`DataCloneError`). Keep component data that is stored or cloned in `$state.raw`, and strip proxies in `AppState` before it reaches a store.
- Verify UI changes in a browser, not just tests. A useful trick in dev: from the page, `await import('/src/lib/content/course.ts')` gives the real exercise data, so a small script can answer every exercise correctly and confirm each lesson scores 100%. That caught a real bug (split words in the grammar view did not join).

## Open items

- Get the English reviewed by a qualified teacher. `npm run review:export` builds the spreadsheet to send; `npm run review:apply` takes it back (README, “Teacher review”).
- Recordings of the letter names themselves. Letter cards play a Quran word that starts with the letter (`example` in `alphabet.ts`), since no open-licensed per-letter recordings were found (the GitHub set `bubblesinarabic/alphabets-audio` has no license; Wikimedia Commons has only one public-domain run-through of the alphabet, which could not be verified by ear).
- More content: all of Juz Amma (78–114) is done. Surahs 105–114 are the `short-surahs` unit; 78–104 are `juz-amma-1` to `juz-amma-7` (data in `data/juz-amma/N.ts`, lesson specs in `src/lib/content/juz-amma/unit-N.ts`). The next step would be a later juz; add each surah to `SURAHS` in the build script.
- Hosting. The code is in a private GitHub repo (`origin`, `tareqmy/taysir`) with CI in `.github/workflows/ci.yml`, but nothing is deployed: wait until the teacher review is applied before serving the content publicly.
