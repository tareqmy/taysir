import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests, run against the production build served by `vite preview`: the code a learner
 * really gets. `npm run e2e` builds first. To use the Chrome you already have instead of a
 * downloaded Chromium, set `E2E_CHANNEL=chrome`.
 */

const PORT = 4173;
const CI = !!process.env.CI;

export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	forbidOnly: CI,
	retries: CI ? 1 : 0,
	workers: CI ? 2 : undefined,
	reporter: CI ? [['list'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'retain-on-failure',
		// The offline worker would cache across the pages a test visits. It has its own checks.
		serviceWorkers: 'block'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'], channel: process.env.E2E_CHANNEL || undefined }
		}
	],
	webServer: {
		// `vite preview` lists the built files when it starts, so it must start after the build.
		command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
		url: `http://localhost:${PORT}`,
		reuseExistingServer: false,
		timeout: 180_000
	}
});
