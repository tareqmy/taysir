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

- **Never type Quranic Arabic by hand.** Take it from the corpus data. Lesson data points at corpus locations (`surah:ayah:word:segment`) in `data/lexicon-seeds.ts` and `data/fatiha-glosses.ts`, then `npm run data:build` regenerates `src/lib/data/generated/`.
- English glosses and grammar explanations are **drafts needing review by a qualified teacher**. Keep explanations conservative; avoid claims you cannot stand behind (an earlier draft wrongly said a bare noun is always indefinite).
- Lesson content is validated by `src/lib/content/course.spec.ts`. Every new lesson or exercise must pass it (answer is among choices, no duplicate choices, ids exist).
- Inside `src/lib`, use relative imports. Routes use the `#lib/*` alias (mapped in `package.json` `imports` and `tsconfig.json` `paths`).
- Rune-based state lives in `*.svelte.ts` files. Avoid TypeScript parameter properties there.

## SvelteKit 3 differences from what you may remember

- `$service-worker` is gone. Use `immutable` / `assets` from `$app/manifest` and `version` from `$app/env`. Manifest paths are relative to the worker, so resolve them against its URL.
- `goto(..., { replace: true })`, not `replaceState`.
- Svelte config lives in `vite.config.ts`. The static adapter uses `fallback: 'index.html'`.
- `tsconfig.json` must exclude `src/service-worker.ts`.

## Environment gotchas

- In the Claude Code sandbox, npm cannot write `~/.npm`. Use `export npm_config_cache="$TMPDIR/npm-cache"` and allow `registry.npmjs.org`.
- Verify UI changes in a browser, not just tests. A useful trick in dev: from the page, `await import('/src/lib/content/course.ts')` gives the real exercise data, so a small script can answer every exercise correctly and confirm each lesson scores 100%. That caught a real bug (split words in the grammar view did not join).

## Open items

- Add the full GPL-3.0 text as `LICENSE`.
- PNG icons (192 and 512 px) so browsers offer "install".
- Audio for the alphabet letters.
- More content: Juz Amma (short surahs) is the natural next step.
- Speed-based grading (Hard/Easy) for better review scheduling.
- No git remote yet (local `main` branch only).
