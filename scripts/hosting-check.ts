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

/** A script this long, in characters once decoded, is worth sending compressed. */
const LARGE_FILE = 20_000;

/** The encodings a browser asks for, and a host answers with. */
const COMPRESSED = /^(br|gzip|zstd|deflate)$/i;

/** A year, in seconds: how long a file whose name changes with its contents may be kept. */
const A_YEAR = 31_536_000;

/**
 * Routes that exist only inside the app, one of each kind: the host has no file for them and must
 * answer with the app's page so that it can show them. (A path that is no route at all may be a
 * plain 404; the app has its own page for those.)
 */
const ROUTES = ['/lesson/fatiha-1', '/review', '/progress', '/words'];

const isHtml = (reply: Reply) => /text\/html/i.test(reply.header('content-type') ?? '');
const isJson = (reply: Reply) => /json/i.test(reply.header('content-type') ?? '');
const isImage = (reply: Reply) => /^image\//i.test(reply.header('content-type') ?? '');
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

/**
 * Whether a reply says in so many words that it may be kept for a year. A reply with no instruction
 * (which `freshFor` reads as unlimited) or only `immutable` does not: the host's own default decides.
 */
function keptForAYear(reply: Reply): boolean {
	const control = (reply.header('cache-control') ?? '').toLowerCase();
	const age = /(?:^|[\s,])max-age=(\d+)/.exec(control);
	return !/\bno-cache\b|\bno-store\b/.test(control) && age !== null && Number(age[1]) >= A_YEAR;
}

/**
 * The About page links Taysir's source code, which the GPL asks that anyone who receives the app
 * can get. A public site whose link does not open (the repository is private, or has moved) has
 * not met that, so the launch check opens it. `status` is what the address answered, or 0 if it
 * could not be reached.
 */
export function sourceFinding(url: string, status: number): Finding {
	return {
		check: 'the link to the source code opens',
		ok: status === 200,
		detail: `${url} answered ${status === 0 ? 'nothing' : status}; make the repository public, or change SOURCE_URL in src/lib/links.ts`
	};
}

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
	const sentToLogin =
		shell &&
		/^30\d$/.test(String(shell.status)) &&
		/cloudflareaccess\.com/i.test(shell.header('location') ?? '');
	if (shell && sentToLogin) {
		add(
			'the site can be reached',
			false,
			'it sent the checker to a Cloudflare Access login page. Give the checker a service token (CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET): hosting/README.md says how'
		);
		return findings;
	}
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
		// A host that answers every unknown path with the app answers 200 for a missing file too, so
		// "exists" means the right kind of file.
		const kind = path.endsWith('.json') ? isJson(reply) : isJavaScript(reply);
		add(
			`${path} exists`,
			reply.status === 200 && kind,
			`status ${reply.status}, content-type ${reply.header('content-type') ?? '(none)'}`
		);
		add(
			`${path} is checked on every visit`,
			freshFor(reply) === 0,
			`cache-control: ${reply.header('cache-control') ?? '(none)'}; if it is kept, a new version is not found`
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
					add(
						`icon ${icon.src}`,
						reply.status === 200 && isImage(reply),
						`status ${reply.status}, content-type ${reply.header('content-type') ?? '(none)'}`
					);
				}
			}
		} catch {
			add('the manifest can be read', false, 'it is not JSON');
		}
	}

	// A built file: its name changes whenever its contents do, so it may be kept for good.
	if (shell) {
		const html = await shell.text();
		const builtFiles = [...new Set(html.match(/\/_app\/immutable\/[^"'\s)]+\.js/g) ?? [])];
		const built = builtFiles[0];
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
			// The first visit downloads every script the page names, and the verse data alone is over half
			// a megabyte before it is compressed, so a host that sends them as they are costs a slow phone
			// seconds. Only the large ones matter; a small file may be sent as it is.
			const uncompressed: string[] = [];
			let large = 0;
			for (const path of builtFiles) {
				const file = path === built && reply ? reply : await get(path);
				if (!file || file.status !== 200) continue;
				if ((await file.text()).length < LARGE_FILE) continue;
				large++;
				if (!COMPRESSED.test(file.header('content-encoding') ?? '')) uncompressed.push(path);
			}
			add(
				'large built files are sent compressed',
				uncompressed.length === 0,
				uncompressed.length === 0
					? `${large} large files, all compressed`
					: `${uncompressed.slice(0, 3).join(', ')}${uncompressed.length > 3 ? ' and more' : ''} had no content-encoding: the first visit would download them in full`
			);
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
