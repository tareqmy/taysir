import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkHosting, freshFor, type Fetcher, type Reply } from '../../scripts/hosting-check.ts';

/**
 * The hosting contract (`hosting/README.md`). The checks that `npm run hosting:check` makes on a live
 * site are run here against a stand-in for a host, set up the way the deploy workflow sets one up
 * from `hosting/_headers`, so a change to that file or to the workflow cannot quietly break what the
 * app needs. Each check is also shown to fail when its condition is not met.
 */

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

// --- The headers file ---------------------------------------------------------------------------

interface Rule {
	pattern: string;
	headers: [name: string, value: string][];
}

/** Read the file's format: an unindented path, then the indented `Name: value` lines it applies to. */
function parseHeaders(text: string): Rule[] {
	const rules: Rule[] = [];
	for (const [index, line] of text.split('\n').entries()) {
		if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
		if (!/^\s/.test(line)) {
			if (!line.startsWith('/')) throw new Error(`line ${index + 1}: a path must start with /`);
			rules.push({ pattern: line.trim(), headers: [] });
			continue;
		}
		const rule = rules.at(-1);
		const match = /^\s+([A-Za-z][A-Za-z0-9-]*):\s*(.+)$/.exec(line);
		if (!rule || !match) throw new Error(`line ${index + 1}: not a header under a path`);
		rule.headers.push([match[1], match[2].trim()]);
	}
	return rules;
}

/** Whether a rule's path covers this one: exactly, or by a `*` standing for any run of characters. */
function covers(pattern: string, path: string): boolean {
	const source = pattern.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'));
	return new RegExp(`^${source.join('.*')}$`).test(path);
}

/** The headers a path gets from the file. A name set by several rules has the values joined. */
function headersFrom(rules: Rule[], path: string): Record<string, string> {
	const headers: Record<string, string> = {};
	for (const rule of rules.filter((r) => covers(r.pattern, path))) {
		for (const [name, value] of rule.headers) {
			const key = name.toLowerCase();
			headers[key] = key in headers ? `${headers[key]}, ${value}` : value;
		}
	}
	return headers;
}

const headersFile = read('hosting/_headers');
const rules = parseHeaders(headersFile);

// --- A stand-in for a host ----------------------------------------------------------------------

const BUILT = '/_app/immutable/entry/start.Dk3x9aQ2.js';

const files: Record<string, { type: string; body: string }> = {
	'/': {
		type: 'text/html; charset=utf-8',
		body: `<!doctype html><link rel="manifest" href="/manifest.webmanifest"><script type="module" src="${BUILT}"></script>`
	},
	'/service-worker.js': {
		type: 'text/javascript',
		body: 'self.addEventListener("fetch", () => {})'
	},
	'/_app/version.json': { type: 'application/json', body: '{"version":"1"}' },
	'/manifest.webmanifest': {
		type: 'application/manifest+json',
		body: JSON.stringify({ icons: [{ src: '/icon-192.png' }, { src: '/icon-512.png' }] })
	},
	'/icon-192.png': { type: 'image/png', body: '' },
	'/icon-512.png': { type: 'image/png', body: '' },
	[BUILT]: { type: 'text/javascript', body: 'export {}' },
	'/robots.txt': { type: 'text/plain', body: 'User-agent: *\nDisallow:\n' }
};

interface HostOptions {
	/** Instead of `hosting/_headers`. */
	headers?: string;
	/** Answer a path the host has no file for with a 404 rather than with the app. */
	noFallback?: boolean;
	/** Change what a path answers. */
	tweak?: (path: string, reply: { status: number; headers: Record<string, string> }) => void;
	robots?: string;
}

/**
 * A host set up from the headers file. What it does without a rule is what Cloudflare Pages does:
 * ask the browser to check a file each time. A rule's header replaces the host's own.
 */
function host({ headers = headersFile, noFallback, tweak, robots }: HostOptions = {}): Fetcher {
	const set = parseHeaders(headers);
	return async (path) => {
		const known = path in files;
		const file = known ? files[path] : files['/'];
		const reply = {
			status: known || !noFallback ? 200 : 404,
			headers: {
				'content-type': file.type,
				'cache-control': 'public, max-age=0, must-revalidate',
				...headersFrom(set, path)
			} as Record<string, string>
		};
		tweak?.(path, reply);
		const body = path === '/robots.txt' && robots !== undefined ? robots : file.body;
		return {
			status: reply.status,
			header: (name) => reply.headers[name.toLowerCase()] ?? null,
			text: async () => body
		} satisfies Reply;
	};
}

const SITE = 'https://taysir.example';
const failures = async (fetcher: Fetcher, preview = false, origin = SITE) =>
	(await checkHosting(origin, fetcher, { preview })).filter((f) => !f.ok).map((f) => f.check);

/** What the deploy workflow does to a trial copy: its own robots.txt, and a noindex header. */
const previewHeaders = `${headersFile}\n/*\n  X-Robots-Tag: noindex, nofollow\n`;
const previewRobots = read('hosting/robots-preview.txt');

describe('hosting/_headers', () => {
	it('is written in the format the host reads', () => {
		expect(rules.length).toBeGreaterThan(0);
		for (const rule of rules) expect(rule.headers.length, rule.pattern).toBeGreaterThan(0);
	});

	it('sets Cache-Control from one rule per path, so values are never joined', () => {
		for (const path of ['/', '/index.html', '/service-worker.js', '/_app/version.json', BUILT]) {
			const setting = rules.filter(
				(rule) =>
					covers(rule.pattern, path) &&
					rule.headers.some(([name]) => name.toLowerCase() === 'cache-control')
			);
			expect(
				setting.map((rule) => rule.pattern),
				path
			).toHaveLength(1);
		}
	});

	it('gives a launched site every check', async () => {
		expect(await failures(host())).toEqual([]);
	});

	it('gives a trial copy every check, set up as the workflow sets it up', async () => {
		const fetcher = host({ headers: previewHeaders, robots: previewRobots });
		expect(await failures(fetcher, true)).toEqual([]);
	});
});

describe('the checks', () => {
	it('keep search engines out of a trial copy and let them into the launched site', async () => {
		expect(await failures(host(), true)).toEqual([
			'robots.txt keeps search engines out',
			'a trial copy says noindex'
		]);
		expect(await failures(host({ robots: previewRobots }), false)).toEqual([
			'robots.txt lets search engines in'
		]);
	});

	it('need https, except on the machine itself', async () => {
		expect(await failures(host(), false, 'http://taysir.example')).toEqual(['served over https']);
		expect(await failures(host(), false, 'http://localhost:4173')).toEqual([]);
	});

	it('need every route to answer with the app', async () => {
		const found = await failures(host({ noFallback: true }));
		expect(found).toEqual([
			'/lesson/fatiha-1 answers with the app',
			'/review answers with the app',
			'/progress answers with the app',
			'/words answers with the app'
		]);
	});

	it('need the service worker and the version file checked on every visit', async () => {
		const keep = (kept: string) =>
			host({
				tweak: (path, reply) => {
					if (path === kept) reply.headers['cache-control'] = 'public, max-age=86400';
				}
			});
		expect(await failures(keep('/service-worker.js'))).toEqual([
			'/service-worker.js is checked on every visit'
		]);
		expect(await failures(keep('/_app/version.json'))).toEqual([
			'/_app/version.json is checked on every visit'
		]);
		expect(await failures(keep('/'))).toEqual(['the home page is checked on every visit']);
		expect(await failures(keep('/manifest.webmanifest'))).toEqual([
			'the manifest is checked on every visit'
		]);
	});

	it('treat a file with no cache instruction as kept, since a browser then guesses', async () => {
		const fetcher = host({
			tweak: (path, reply) => {
				if (path === '/service-worker.js') delete reply.headers['cache-control'];
			}
		});
		// Nothing says to check it each time, so the browser may well not.
		expect(await failures(fetcher)).toContain('/service-worker.js is checked on every visit');
	});

	it('need built files kept for good', async () => {
		const fetcher = host({
			headers: headersFile.replace(
				'Cache-Control: public, max-age=31536000, immutable',
				'Cache-Control: no-cache'
			)
		});
		expect(await failures(fetcher)).toEqual(['built files are kept for good']);
	});

	it('need the manifest to have its own type, and the icons to be there', async () => {
		const wrongType = host({
			headers: headersFile.replace(
				'Content-Type: application/manifest+json',
				'Content-Type: text/plain'
			)
		});
		expect(await failures(wrongType)).toEqual(['the manifest has its own type']);

		const noIcon = host({
			tweak: (path, reply) => {
				if (path === '/icon-512.png') reply.status = 404;
			}
		});
		expect(await failures(noIcon)).toEqual(['icon /icon-512.png']);
	});

	it('need the three plain safeguards', async () => {
		const bare = headersFile.replace(/\/\*\n(?: {2}.+\n)+/, '');
		expect(await failures(host({ headers: bare }))).toEqual([
			'the browser is told not to guess types',
			'sites are told how much to share when linked from the app',
			'other sites cannot frame the app'
		]);
	});

	it('say what went wrong when a file cannot be fetched at all', async () => {
		const down: Fetcher = async () => {
			throw new TypeError('fetch failed');
		};
		const found = await checkHosting(SITE, down, { preview: false });
		expect(found.some((f) => !f.ok && f.detail.includes('fetch failed'))).toBe(true);
	});
});

describe('freshFor', () => {
	const reply = (control: string | null): Reply => ({
		status: 200,
		header: () => control,
		text: async () => ''
	});

	it('reads how long a browser may reuse a reply without asking', () => {
		expect(freshFor(reply('no-cache'))).toBe(0);
		expect(freshFor(reply('no-store'))).toBe(0);
		expect(freshFor(reply('public, max-age=0, must-revalidate'))).toBe(0);
		expect(freshFor(reply('public, max-age=600'))).toBe(600);
		expect(freshFor(reply('max-age=31536000, immutable'))).toBe(31_536_000);
		expect(freshFor(reply(null))).toBe(Number.POSITIVE_INFINITY);
	});
});

describe('the deploy workflow', () => {
	const workflow = read('.github/workflows/deploy.yml');

	/** The names directly under the top-level `on:` key. */
	const triggers = (() => {
		const lines = workflow.split('\n');
		const start = lines.findIndex((line) => /^on:\s*$/.test(line));
		const names: string[] = [];
		for (const line of lines.slice(start + 1)) {
			if (/^\S/.test(line)) break;
			const name = /^ {2}([a-z_]+):/.exec(line);
			if (name) names.push(name[1]);
		}
		return names;
	})();

	it('is run by a person and by nothing else', () => {
		expect(triggers).toEqual(['workflow_dispatch']);
	});

	it('does nothing until the repository says deploying is allowed', () => {
		expect(workflow).toMatch(/if: vars\.DEPLOY_ENABLED == 'true'/);
	});

	it('needs the review confirmed before it publishes to production', () => {
		expect(workflow).toMatch(/inputs\.target == 'preview' \|\| inputs\.confirm == 'reviewed'/);
	});

	it('puts the headers file and, for a trial copy, the keep-out files into the build', () => {
		expect(workflow).toContain('cp hosting/_headers build/_headers');
		expect(workflow).toContain('cp hosting/robots-preview.txt build/robots.txt');
		expect(workflow).toContain('X-Robots-Tag: noindex, nofollow');
	});

	it('keeps its secrets out of the commands it runs', () => {
		// The target is handed over as an environment variable and not written into a script.
		expect(workflow).toContain('TARGET: ${{ inputs.target }}');
		expect(workflow).not.toMatch(/run:[^\n]*\$\{\{\s*inputs\./);
	});
});

describe('the trial copy’s robots.txt', () => {
	it('turns every search engine away', () => {
		expect(previewRobots).toMatch(/^User-agent: \*$/m);
		expect(previewRobots).toMatch(/^Disallow: \/$/m);
	});
});
