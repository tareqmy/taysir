/**
 * What Taysir needs from wherever it is hosted, as checks that can be run against a live address
 * (`npm run hosting:check -- https://example.com`) or against a stand-in in a test. Nothing here
 * touches the network itself: it is handed a `fetcher`.
 *
 * The reasons are in `hosting/README.md`. In short: a service worker needs https; the app's own
 * routes must answer with the app, not a 404; and the files that say which version is current must
 * never be served from a cache, or an update would not be found.
 */

export interface Reply {
	status: number;
	/** Header names are looked up in lower case. */
	header(name: string): string | null;
	text(): Promise<string>;
}

/** Fetch one path from the site, without following redirects. */
export type Fetcher = (path: string) => Promise<Reply>;

export interface Finding {
	check: string;
	ok: boolean;
	/** What was found, and what it should be. */
	detail: string;
}

export interface Options {
	/** A copy for trying out before launch: search engines must be told to keep away from it. */
	preview: boolean;
}

/** A year, in seconds: how long a file whose name changes with its contents may be kept. */
const A_YEAR = 31_536_000;

/**
 * Routes that exist only inside the app, one of each kind: the host has no file for them and must
 * answer with the app's page so that it can show them. (A path that is no route at all may be a
 * plain 404; the app has its own page for those.)
 */
const ROUTES = ['/lesson/fatiha-1', '/review', '/progress', '/words'];

const isHtml = (reply: Reply) => /text\/html/i.test(reply.header('content-type') ?? '');
const isJavaScript = (reply: Reply) =>
	/(text|application)\/(x-)?javascript/i.test(reply.header('content-type') ?? '');

/** The seconds a browser may reuse a reply without asking, or 0 when it has to ask each time. */
export function freshFor(reply: Reply): number {
	const control = (reply.header('cache-control') ?? '').toLowerCase();
	if (/\bno-cache\b|\bno-store\b/.test(control)) return 0;
	const age = /(?:^|[\s,])max-age=(\d+)/.exec(control);
	if (age) return Number(age[1]);
	// With no instruction at all, a browser decides for itself: more than the app can allow.
	return Number.POSITIVE_INFINITY;
}

/** Whether a reply says it may be served without asking again, for long. */
const keptForAYear = (reply: Reply) =>
	/\bimmutable\b/i.test(reply.header('cache-control') ?? '') || freshFor(reply) >= A_YEAR;

export async function checkHosting(
	origin: string,
	fetcher: Fetcher,
	{ preview }: Options
): Promise<Finding[]> {
	const findings: Finding[] = [];
	const add = (check: string, ok: boolean, detail: string) => findings.push({ check, ok, detail });
	/** Fetch, turning a network failure into a finding instead of ending the run. */
	const get = async (path: string): Promise<Reply | undefined> => {
		try {
			return await fetcher(path);
		} catch (error) {
			add(`GET ${path}`, false, `could not be fetched: ${(error as Error).message}`);
			return undefined;
		}
	};

	const local = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(origin);
	add(
		'served over https',
		origin.startsWith('https://') || local,
		origin.startsWith('https://')
			? 'https'
			: 'a service worker will not run over plain http, so nothing would work offline'
	);

	// The page, and the app's own routes answering with it.
	const shell = await get('/');
	if (shell) {
		add(
			'the home page is the app',
			shell.status === 200 && isHtml(shell),
			`status ${shell.status}`
		);
		add(
			'the home page is checked on every visit',
			freshFor(shell) === 0,
			`cache-control: ${shell.header('cache-control') ?? '(none)'}; it names the files of one version, so a stale copy asks for files that are gone`
		);
	}
	for (const path of ROUTES) {
		const reply = await get(path);
		if (!reply) continue;
		add(
			`${path} answers with the app`,
			reply.status === 200 && isHtml(reply),
			`status ${reply.status}; the app's own routes must answer 200 with the app, or a link or an installed app that opens there breaks`
		);
	}

	// The files that say what version is current.
	for (const path of ['/service-worker.js', '/_app/version.json']) {
		const reply = await get(path);
		if (!reply) continue;
		add(`${path} exists`, reply.status === 200, `status ${reply.status}`);
		add(
			`${path} is checked on every visit`,
			freshFor(reply) === 0,
			`cache-control: ${reply.header('cache-control') ?? '(none)'}; if it is kept, a new version is not found`
		);
	}
	const worker = await get('/service-worker.js');
	if (worker) {
		add(
			'the service worker is JavaScript',
			isJavaScript(worker),
			worker.header('content-type') ?? '(none)'
		);
	}

	// The manifest, and the icons it names.
	const manifestReply = await get('/manifest.webmanifest');
	if (manifestReply) {
		const type = manifestReply.header('content-type') ?? '';
		add('the manifest exists', manifestReply.status === 200, `status ${manifestReply.status}`);
		add(
			'the manifest has its own type',
			/manifest\+json|application\/json/i.test(type),
			`content-type: ${type || '(none)'}`
		);
		add(
			'the manifest is checked on every visit',
			freshFor(manifestReply) === 0,
			`cache-control: ${manifestReply.header('cache-control') ?? '(none)'}`
		);
		try {
			const manifest = JSON.parse(await manifestReply.text()) as { icons?: { src: string }[] };
			for (const icon of manifest.icons ?? []) {
				const reply = await get(icon.src);
				if (reply) {
					add(`icon ${icon.src}`, reply.status === 200, `status ${reply.status}`);
				}
			}
		} catch {
			add('the manifest can be read', false, 'it is not JSON');
		}
	}

	// A built file: its name changes whenever its contents do, so it may be kept for good.
	if (shell) {
		const html = await shell.text();
		const built = /\/_app\/immutable\/[^"'\s)]+\.js/.exec(html)?.[0];
		if (!built) {
			add('a built file can be found in the page', false, 'the page names no /_app/immutable file');
		} else {
			const reply = await get(built);
			if (reply) {
				add(
					`${built} exists`,
					reply.status === 200 && isJavaScript(reply),
					`status ${reply.status}`
				);
				add(
					'built files are kept for good',
					keptForAYear(reply),
					`cache-control: ${reply.header('cache-control') ?? '(none)'}; every visit would fetch them again`
				);
			}
		}
	}

	// Headers that cost nothing and close off easy mistakes.
	if (shell) {
		add(
			'the browser is told not to guess types',
			(shell.header('x-content-type-options') ?? '').toLowerCase() === 'nosniff',
			`x-content-type-options: ${shell.header('x-content-type-options') ?? '(none)'}`
		);
		add(
			'sites are told how much to share when linked from the app',
			Boolean(shell.header('referrer-policy')),
			`referrer-policy: ${shell.header('referrer-policy') ?? '(none)'}`
		);
		const frames = shell.header('x-frame-options') ?? '';
		const ancestors = /frame-ancestors/i.test(shell.header('content-security-policy') ?? '');
		add(
			'other sites cannot frame the app',
			/^(deny|sameorigin)$/i.test(frames) || ancestors,
			`x-frame-options: ${frames || '(none)'}`
		);
	}

	// Search engines: kept away from a copy for trying out, welcome once it is launched.
	const robots = await get('/robots.txt');
	if (robots) {
		const body = await robots.text();
		const blocksAll = /^\s*Disallow:\s*\/\s*$/im.test(body);
		add(
			preview ? 'robots.txt keeps search engines out' : 'robots.txt lets search engines in',
			robots.status === 200 && (preview ? blocksAll : !blocksAll),
			`status ${robots.status}${blocksAll ? ', disallows everything' : ', allows crawling'}`
		);
	}
	if (shell && preview) {
		add(
			'a trial copy says noindex',
			/noindex/i.test(shell.header('x-robots-tag') ?? ''),
			`x-robots-tag: ${shell.header('x-robots-tag') ?? '(none)'}`
		);
	}

	return findings;
}
