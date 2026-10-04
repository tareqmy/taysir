import { expect, test } from './support/test';

/**
 * `make tunnel` shows the preview server to a phone through a tunnel, which reaches it under the
 * tunnel's own host name. The server refuses host names it does not know, so the ones a tunnel uses
 * are listed in `vite.config.ts`; this notices if an upgrade of the server stops honouring that.
 */

test('the preview server answers under a tunnel’s host name, and still refuses a stranger’s', async ({
	request
}) => {
	for (const host of ['demo.trycloudflare.com', 'demo.ngrok-free.app']) {
		const response = await request.get('/', { headers: { host } });
		expect(response.status(), host).toBe(200);
		expect(await response.text()).toContain('manifest.webmanifest');
	}
	const stranger = await request.get('/', { headers: { host: 'evil.example.com' } });
	expect(stranger.status()).toBe(403);
});
