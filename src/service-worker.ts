/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
import { version } from '$app/env';
import { assets, immutable } from '$app/manifest';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = `taysir-${version}`;
/** Manifest paths are relative to the worker, so resolve them against its own URL. */
const resolveHere = (path: string) => new URL(path, sw.location.href).pathname;
const SHELL = resolveHere('./');
/**
 * How long opening a page waits for the network before showing the copy kept for offline use. A
 * connection that fails is noticed at once, but one that hangs (a weak signal, a wifi login page)
 * would otherwise leave the app blank until the browser itself gives up, which takes far longer.
 */
const NAVIGATION_WAIT_MS = 4000;
// Built JS/CSS and everything in `static/`: all that is needed to run offline.
const ASSETS = new Set<string>([...immutable, ...assets].map((file) => resolveHere(file.path)));

sw.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...ASSETS, SHELL])));
	// No skipWaiting() here. A new version waits until the learner chooses to switch to it (see
	// `src/lib/update.svelte.ts`), so a page that is open is never left running its old code
	// against a cache that has been replaced. The first install has nothing to wait for.
});

sw.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') void sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
			)
			.then(() => sw.clients.claim())
	);
});

// App files are served from the cache so lessons work offline. Anything else, including
// the recitation audio on other origins, goes to the network as usual.
sw.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;
	const url = new URL(request.url);
	if (url.origin !== sw.location.origin) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(CACHE);
			if (ASSETS.has(url.pathname)) {
				const hit = await cache.match(url.pathname);
				if (hit) return hit;
			}
			if (request.mode === 'navigate') return open(request, cache);
			return fetch(request);
		})()
	);
});

/** A page from the network when it comes in time, otherwise the app's own copy. */
async function open(request: Request, cache: Cache): Promise<Response> {
	const network = fetch(request);
	// If the wait runs out, the network may still fail later, with no one to hear it.
	network.catch(() => {});
	const late = new Promise<undefined>((resolve) => setTimeout(resolve, NAVIGATION_WAIT_MS));
	try {
		const response = await Promise.race([network, late]);
		if (response) return response;
	} catch {
		// No connection: the copy below.
	}
	// Before the first install there is no copy, so all there is to do is wait for the network.
	return (await cache.match(SHELL)) ?? network;
}
