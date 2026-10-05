/**
 * Checks that a live copy of Taysir is hosted the way it needs to be.
 *
 *   npm run hosting:check -- https://taysir.pages.dev
 *   npm run hosting:check -- https://preview.taysir.pages.dev --preview
 *
 * Only the address's origin is used: a path on the end is dropped.
 *
 * Add `--preview` for a copy that is only for trying out: it then expects search engines to be kept
 * out, where a launched site expects them to be let in. A copy behind Cloudflare Access turns away
 * a visitor with no pass, so give the script a service token: set CF_ACCESS_CLIENT_ID and
 * CF_ACCESS_CLIENT_SECRET. Exits with 1 if anything is wrong. Runs directly on Node (type
 * stripping). What each check is for is in `hosting/README.md`.
 */
import { checkHosting, type Reply } from './hosting-check.ts';

const [address, ...flags] = process.argv.slice(2);
if (!address || flags.some((flag) => flag !== '--preview')) {
	console.error('Usage: npm run hosting:check -- <https://address> [--preview]');
	process.exit(2);
}

const origin = new URL(address).origin;

const pass: Record<string, string> = {};
if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
	pass['CF-Access-Client-Id'] = process.env.CF_ACCESS_CLIENT_ID;
	pass['CF-Access-Client-Secret'] = process.env.CF_ACCESS_CLIENT_SECRET;
}

async function fetchPath(path: string): Promise<Reply> {
	const response = await fetch(new URL(path, origin), {
		// Redirects are findings, not something to follow past.
		redirect: 'manual',
		headers: pass,
		signal: AbortSignal.timeout(20_000)
	});
	return {
		status: response.status,
		header: (name) => response.headers.get(name),
		text: () => response.text()
	};
}

const findings = await checkHosting(origin, fetchPath, { preview: flags.includes('--preview') });
for (const finding of findings) {
	console.log(
		`${finding.ok ? '✔' : '✘'} ${finding.check}${finding.ok ? '' : `: ${finding.detail}`}`
	);
}
const failed = findings.filter((finding) => !finding.ok);
console.log(
	failed.length === 0
		? `\nAll ${findings.length} checks passed for ${origin}.`
		: `\n${failed.length} of ${findings.length} checks failed for ${origin}.`
);
process.exit(failed.length === 0 ? 0 : 1);
