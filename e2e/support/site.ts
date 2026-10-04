import { createServer } from 'node:http';
import { cp, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * A copy of the built app served from its own address, which can be "deployed" again: the same
 * address then serves a new version, as a real redeploy does, so a browser's service worker can be
 * taken through an update. It never touches `build/`, which the other tests are being served from.
 *
 * A version differs from the last in its id, which is in three files: the page, the service worker
 * (its bytes changing is what makes a browser fetch the new worker) and `_app/version.json`.
 */

const BUILD = path.resolve(import.meta.dirname, '../../build');
const VERSIONED_FILES = ['index.html', 'service-worker.js', '_app/version.json'];

const TYPES: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json',
	'.webmanifest': 'application/manifest+json',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.woff2': 'font/woff2',
	'.txt': 'text/plain; charset=utf-8'
};

export interface Site {
	/** `http://localhost:<port>`. */
	origin: string;
	/** The version being served now. */
	version: string;
	/** Publish a new version at the same address, and say what it is. */
	deploy(): Promise<string>;
	close(): Promise<void>;
}

export async function startSite(): Promise<Site> {
	const built = JSON.parse(await readFile(path.join(BUILD, '_app/version.json'), 'utf8')).version;
	const scratch = await mkdtemp(path.join(tmpdir(), 'taysir-site-'));

	/** Copies the build, giving the copy a new id for the version. */
	async function publish(version: string): Promise<string> {
		const dir = path.join(scratch, version);
		await cp(BUILD, dir, { recursive: true });
		if (version !== built) {
			for (const file of VERSIONED_FILES) {
				const text = await readFile(path.join(dir, file), 'utf8');
				if (!text.includes(built)) throw new Error(`${file} does not hold the version id`);
				await writeFile(path.join(dir, file), text.replaceAll(built, version));
			}
		}
		return dir;
	}

	let version = built;
	let root = await publish(version);

	const server = createServer(async (request, response) => {
		const { pathname } = new URL(request.url ?? '/', 'http://localhost');
		let file = path.join(root, decodeURIComponent(pathname));
		if (!file.startsWith(root)) {
			response.writeHead(403).end();
			return;
		}
		try {
			if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
		} catch {
			file = path.join(root, 'index.html'); // the app's own routes, as the build's fallback page
		}
		try {
			const body = await readFile(file);
			response.writeHead(200, {
				'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
				// Only the files that carry the version change between deploys.
				'cache-control': pathname.startsWith('/_app/immutable/')
					? 'public, max-age=31536000, immutable'
					: 'no-cache'
			});
			response.end(body);
		} catch {
			response.writeHead(404).end();
		}
	});
	await new Promise<void>((resolve) => server.listen(0, resolve));
	const { port } = server.address() as { port: number };

	return {
		origin: `http://localhost:${port}`,
		get version() {
			return version;
		},
		async deploy() {
			version = String(Number(version) + 1);
			root = await publish(version);
			return version;
		},
		async close() {
			server.closeAllConnections();
			await new Promise((resolve) => server.close(resolve));
			await rm(scratch, { recursive: true, force: true });
		}
	};
}
