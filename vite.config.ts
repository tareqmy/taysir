import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// A single-page app: progress lives in the browser, so every route is rendered client-side.
			adapter: adapter({ fallback: 'index.html' })
		})
	],
	preview: {
		// The preview server refuses host names it does not know. These let the app be opened through
		// a tunnel (`make tunnel`), to try it on a phone: Cloudflare's quick tunnels and ngrok's.
		allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok-free.dev']
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
