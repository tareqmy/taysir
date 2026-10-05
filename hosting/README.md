# Hosting Taysir

**Status: not deployed, and not to be until a teacher has reviewed the English.** Every meaning and
grammar explanation in the app is a draft (the About page says so). A public site would teach
mistakes to strangers, and a trial copy that search engines can find is public in the same way.
Everything below is ready for the day that changes, and nothing in it publishes anything by itself.

This folder holds the files a host needs; `.github/workflows/deploy.yml` is a deploy workflow for
Cloudflare Pages that is switched off; and `npm run hosting:check` tests a live copy.

> The Cloudflare steps below are written from Cloudflare's documentation and the workflow has not
> been run: it needs an account that did not exist when this was written. Expect to adjust the
> names of dashboard pages. Everything that does not need an account is tested (`src/lib/hosting.spec.ts`).

## What a host has to do

Taysir is a folder of static files (`npm run build` makes `build/`). It needs no server code, but a
host has to do these things, and `npm run hosting:check -- <address>` checks each one.

| The host must…                                                                                                  | Because                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| serve it over **https**, from the **root** of an address (`/`, not `/taysir/`)                                  | A service worker, and so offline lessons and installing, only works over https. The manifest's `start_url` and `scope` are `/`, and every file is requested from the root.                                           |
| answer the app's own routes (`/review`, `/lesson/…`, `/words`…) with **`index.html`**, status 200               | There is no file for them: the app draws them. `adapter-static` is set to `fallback: 'index.html'` for this. Do not add a `404.html` to the build, or Cloudflare Pages stops treating the site as a single-page app. |
| never let a browser keep **`/`, `/index.html`, `/service-worker.js`, `/_app/version.json`** or the **manifest** | These say which version is current. A copy kept for a day hides an update for a day, and a kept page names files of an old version that the host has since removed.                                                  |
| let browsers keep **`/_app/immutable/*`** for a year                                                            | Those files are named for their contents, so a changed file has a new name. Fetching them again on every visit wastes the learner's data.                                                                            |
| serve the manifest as **`application/manifest+json`** and the service worker as JavaScript                      | Browsers refuse a service worker with the wrong type, and may not offer to install without a manifest they can read.                                                                                                 |
| send `X-Content-Type-Options: nosniff`, a `Referrer-Policy`, and `X-Frame-Options: DENY`                        | Cheap protection against types being guessed, against sharing the address of the page the learner was on with the audio hosts, and against the app being framed by another site.                                     |
| keep search engines out of a trial copy (`robots.txt` disallowing all, and `X-Robots-Tag: noindex`)             | See the status above. A launched site wants the opposite, so the checker expects it with `--preview` and expects it not to be there without.                                                                         |

`hosting/_headers` does all the header work for Cloudflare Pages and Netlify, which read the same
format. A host that does not read it needs the same rules written its own way. It sets
`Cache-Control` on exact paths and never on `/*`: where several rules match, a host joins their values,
and `no-cache, immutable` would mean nothing. A test checks that no path gets two.

## Before the first public deploy

None of these is automated, and some are decisions rather than tasks.

### People and content

- [ ] **The teacher review is applied** (`npm run review:export`, then `npm run review:apply`; see the
      README, “Teacher review”). This is the reason for all of the above.
- [ ] **The wording on the About page is brought up to date.** It says the meanings “are drafts that
      still need review”; after the review it should say who reviewed them, if they agree to be named.
- [ ] **There is a way to report a mistake**, such as a link to the repository's issues or an email
      address. The About page tells learners to trust their teacher over the app; it should also tell
      them where to send a correction.
- [ ] Decide whether the **letter-name recordings** are needed first (CLAUDE.md, “Open items”).
      Without them each letter card plays a Quran word that starts with the letter.

### Licence and sources

This is not legal advice. The app and the corpus data it carries are GPL, which asks that people who
receive the program can get its source.

- [ ] **Link the source from the About page.** It now says “the source link above lets you follow
      changes”, but links only to the corpus and to Tanzil, not to Taysir itself, and the repository
      is private. Either make the repository public or give another way to get the source (and say
      which on the About page). A visitor's browser receives the program, so the public site is
      distribution.
- [ ] **Confirm the audio may be used this way.** Verses stream from EveryAyah and words from
      audio.qurancdn.com, from learners' browsers. Read their terms for use in a public app, and
      decide what to do if either stops working (the app already carries on without audio).
- [ ] The corpus, Tanzil and Amiri Quran notices on the About page are complete, and `LICENSE` is in
      the repository.

### Privacy

- [ ] Settings (“Your data”) already says progress is kept only on the learner's device and that
      nothing is sent to a server. That stays true only while the app has **no analytics**; if you
      add any, change that text first.
- [ ] Say on the About page that when a learner plays audio, the audio host sees their address. (Page
      views are seen by the host you pick, as with any site.)

### Technical

- [ ] `make ci` passes, and CI is green on the commit you deploy.
- [ ] A **trial copy has been through the real-phone checks** (below) before the public deploy.

## Setting up Cloudflare Pages (once)

1. **Create the project.** In the Cloudflare dashboard, Workers & Pages → Create → Pages → upload
   assets (a “direct upload” project), named `taysir`. Make sure its production branch is `main`: the
   workflow deploys `--branch=main` to production and `--branch=preview` to a trial copy. A different
   project name goes in the repository variable `CLOUDFLARE_PAGES_PROJECT`.
2. **Make an API token** (My profile → API Tokens → Create Token → custom) allowed to edit Cloudflare
   Pages for your account, and find your **account id** (shown in the dashboard sidebar).
3. **Give the repository its secrets and variables** (Settings → Secrets and variables → Actions):
   secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Do **not** set the variable
   `DEPLOY_ENABLED` yet: while it is unset the deploy workflow does nothing even if started.
4. **Put the trial copy behind Cloudflare Access** before the first deploy, or anyone with the
   address can open it. Zero Trust → Access → Applications → Add → self-hosted, covering
   `*.taysir.pages.dev` (a trial copy gets `preview.taysir.pages.dev`, and each deploy its own
   address), with a policy that allows your email and the reviewer's. This leaves the production
   address, `taysir.pages.dev`, open, which is the point of launching.
5. **Optional: a pass for the checker.** Access turns away a script that is not logged in. Create an
   Access service token, add a “Service Auth” rule to the policy, and give the token to the checker as
   `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` when you run it.

## Deploying

A **trial copy** for the reviewer and for phones, any time after the setup above:

1. Set the repository variable `DEPLOY_ENABLED` to `true`.
2. Actions → Deploy → Run workflow → target `preview`.
3. Open `https://preview.taysir.pages.dev` (through the Access login) and run

   ```sh
   make hosting-check URL=https://preview.taysir.pages.dev PREVIEW=1
   ```

   It must report every check passed. A copy at a fixed address is also the first way to try the
   things a quick tunnel cannot: installing the app and keeping it for days, and the update prompt
   (deploy twice, then open the app).

The **public site**, only once the review is applied and the list above is done: Actions → Deploy →
target `production`, and type `reviewed` in the box. Then `make hosting-check URL=https://taysir.pages.dev`.
Add a domain of your own in the Pages project when you have one.

To **go back** to an earlier version, redeploy the earlier commit (Run workflow from that commit's
tag or branch), or promote the earlier deployment in the dashboard. A learner's installed app then
sees it as an update, like any other. To **switch deploys off** again, delete the `DEPLOY_ENABLED`
variable.

## On a real phone, from the deployed address

These are the checks only a real device at a fixed address can make, and the trial copy is where to
make them:

- [ ] Add it to the home screen (Android: the Install button; iPhone: Share → Add to Home Screen).
- [ ] **iPhone:** open the installed app. The copy says it starts with no progress, apart from
      Safari's. Check that this is true, and that a backup restores into it.
- [ ] Switch to airplane mode and do a lesson, then a review.
- [ ] Use it for a few days, then deploy a second time and open the app: the update banner should
      offer the new version, and “Update now” should switch to it.
- [ ] Largest Arabic size, dark mode, and the Download backup button on the phone.

## Later hardening

Not needed to launch, and each needs care so as not to break the app:

- A **Content-Security-Policy.** SvelteKit can generate hashes for its own inline script
  (`kit.csp`), and audio needs `media-src` for the two audio hosts. Try it on a trial copy first.
- Run **Lighthouse** on the trial copy for installability and performance.
