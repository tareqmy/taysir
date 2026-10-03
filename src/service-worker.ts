/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
import { version } from '$app/env';
import { assets, immutable } from '$app/manifest';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = `taysir-${version}`;
/** Manifest paths are relative to the worker, so resolve them against its own URL. */
const resolveHere = (path: string) => new URL(path, sw.location.href).pathname;
const SHELL = resolveHere('./');
// Built JS/CSS and everything in `static/`: all that is needed to run offline.
const ASSETS = new Set<string>([...immutable, ...assets].map((file) => resolveHere(file.path)));

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll([...ASSETS, SHELL]))
			.then(() => sw.skipWaiting())
	);
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
			try {
				return await fetch(request);
			} catch (error) {
				if (request.mode === 'navigate') {
					const shell = await cache.match(SHELL);
					if (shell) return shell;
				}
				throw error;
			}
		})()
	);
});
