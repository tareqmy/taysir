import { describe, expect, it, vi } from 'vitest';
import { INSTALL_HINT_KEY, installMode, isAppleTouchDevice } from './install';
import { AppInstall, type InstallEnvironment, type InstallStorage } from './install.svelte';

const IPHONE =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const IPAD_AS_MAC =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
const ANDROID =
	'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';
const MAC =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

describe('isAppleTouchDevice', () => {
	it('knows an iPhone and an iPad that says so', () => {
		expect(isAppleTouchDevice({ userAgent: IPHONE, platform: 'iPhone', maxTouchPoints: 5 })).toBe(
			true
		);
		expect(
			isAppleTouchDevice({ userAgent: 'iPad; CPU OS 17', platform: 'iPad', maxTouchPoints: 5 })
		).toBe(true);
	});

	it('knows an iPad that asks for desktop sites, but not a Mac', () => {
		expect(
			isAppleTouchDevice({ userAgent: IPAD_AS_MAC, platform: 'MacIntel', maxTouchPoints: 5 })
		).toBe(true);
		expect(isAppleTouchDevice({ userAgent: MAC, platform: 'MacIntel', maxTouchPoints: 0 })).toBe(
			false
		);
	});

	it('is not fooled by Android or a computer', () => {
		expect(
			isAppleTouchDevice({ userAgent: ANDROID, platform: 'Linux armv81', maxTouchPoints: 5 })
		).toBe(false);
	});
});

describe('installMode', () => {
	const base = { installed: false, canPrompt: false, apple: false };

	it('says there is nothing to offer when the browser cannot install the app', () => {
		expect(installMode(base)).toBe('none');
	});

	it('offers a button when the browser has handed over its prompt', () => {
		expect(installMode({ ...base, canPrompt: true })).toBe('button');
	});

	it('gives an iPhone the steps, since it has no prompt', () => {
		expect(installMode({ ...base, apple: true })).toBe('steps');
	});

	it('puts being installed first, whatever else is true', () => {
		expect(installMode({ installed: true, canPrompt: true, apple: true })).toBe('installed');
	});
});

/** A page, as far as the install offer can tell: events it can be sent, and what it is running as. */
class FakePage extends EventTarget {
	standaloneMedia = false;
	navigator: InstallEnvironment['navigator'];
	/** Set by the script in the page's head when the browser sends the prompt before the app starts. */
	__taysirInstallPrompt?: Event;

	constructor(userAgent = ANDROID, platform = 'Linux armv81', maxTouchPoints = 5) {
		super();
		this.navigator = { userAgent, platform, maxTouchPoints };
	}

	matchMedia(query: string) {
		return { matches: query === '(display-mode: standalone)' && this.standaloneMedia };
	}

	/** The browser offers its install prompt. Returns the event, which a test can look at. */
	offer(outcome: 'accepted' | 'dismissed' = 'accepted') {
		const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
			prompt: vi.fn(async () => {}),
			userChoice: Promise.resolve({ outcome })
		});
		this.dispatchEvent(event);
		return event;
	}
}

class FakeStorage implements InstallStorage {
	items = new Map<string, string>();
	getItem(key: string) {
		return this.items.get(key) ?? null;
	}
	setItem(key: string, value: string) {
		this.items.set(key, value);
	}
}

function setup(page = new FakePage(), storage: InstallStorage | undefined = new FakeStorage()) {
	const install = new AppInstall(page as unknown as InstallEnvironment, storage);
	install.start();
	return { page, storage, install };
}

describe('AppInstall', () => {
	it('does nothing where there is no page to listen to', async () => {
		const install = new AppInstall(undefined, undefined);
		install.start();
		expect(install.mode).toBe('none');
		expect(install.offerOnHome).toBe(false);
		expect(await install.install()).toBe('unavailable');
	});

	it('offers nothing until the browser offers, then holds its prompt back for a button', async () => {
		const { page, install } = setup();
		expect(install.mode).toBe('none');
		expect(install.offerOnHome).toBe(false);

		const event = page.offer();
		// Held back, so the browser's own banner does not show over whatever the learner is doing.
		expect(event.defaultPrevented).toBe(true);
		expect(install.mode).toBe('button');
		expect(install.offerOnHome).toBe(true);

		expect(await install.install()).toBe('accepted');
		expect(event.prompt).toHaveBeenCalledOnce();
	});

	it('uses a prompt once, and reports a "no"', async () => {
		const { page, install } = setup();
		page.offer('dismissed');
		expect(await install.install()).toBe('dismissed');
		// It is spent: no button until the browser sends another.
		expect(install.mode).toBe('none');
		expect(await install.install()).toBe('unavailable');

		page.offer();
		expect(install.mode).toBe('button');
	});

	it('keeps the offer as it is while the browser’s prompt is open, and notes a "no"', async () => {
		const { page, install } = setup();
		let choose!: (outcome: 'accepted' | 'dismissed') => void;
		const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
			prompt: vi.fn(async () => {}),
			userChoice: new Promise<{ outcome: 'accepted' | 'dismissed' }>((resolve) => {
				choose = (outcome) => resolve({ outcome });
			})
		});
		page.dispatchEvent(event);

		const asking = install.install();
		// Waiting for the learner: still the button, shown as waiting, and not offered a second time.
		expect(install.asking).toBe(true);
		expect(install.mode).toBe('button');
		expect(install.offerOnHome).toBe(true);
		expect(await install.install()).toBe('unavailable');
		expect(event.prompt).toHaveBeenCalledOnce();

		choose('dismissed');
		expect(await asking).toBe('dismissed');
		expect(install.asking).toBe(false);
		expect(install.declined).toBe(true);
		expect(install.mode).toBe('none');
		expect(install.offerOnHome).toBe(false);
	});

	it('is installed once the learner accepts, without waiting for the browser to say so', async () => {
		const { page, install } = setup();
		page.offer('accepted');
		expect(await install.install()).toBe('accepted');
		expect(install.mode).toBe('installed');
		expect(install.declined).toBe(false);
		// Installed during a visit is not the same as running as the installed app.
		expect(install.standalone).toBe(false);
		expect(install.installedHere).toBe(true);
	});

	it('picks up a prompt the browser sent before the app started', () => {
		const page = new FakePage();
		const early = new Event('beforeinstallprompt', { cancelable: true });
		page.__taysirInstallPrompt = early;
		const { install } = setup(page);
		expect(install.mode).toBe('button');
		expect(early.defaultPrevented).toBe(true);
		// Taken, so it cannot be taken twice.
		expect(page.__taysirInstallPrompt).toBeUndefined();
	});

	it('stops asking when the prompt fails, so the offer is not left waiting', async () => {
		const { page, install } = setup();
		page.offer().prompt.mockRejectedValueOnce(new DOMException('Not allowed', 'NotAllowedError'));
		expect(await install.install()).toBe('unavailable');
		expect(install.asking).toBe(false);
	});

	it('copes with a prompt that fails to show', async () => {
		const { page, install } = setup();
		const event = page.offer();
		event.prompt.mockRejectedValueOnce(new DOMException('Not allowed', 'NotAllowedError'));
		expect(await install.install()).toBe('unavailable');
	});

	it('tells an iPhone the steps, with no prompt to wait for', () => {
		const { install } = setup(new FakePage(IPHONE, 'iPhone', 5));
		expect(install.mode).toBe('steps');
		expect(install.offerOnHome).toBe(true);
	});

	it('has nothing to offer in an app that is already installed', () => {
		const page = new FakePage();
		page.standaloneMedia = true;
		const { install } = setup(page);
		expect(install.mode).toBe('installed');
		expect(install.offerOnHome).toBe(false);
	});

	it('knows an iPhone home-screen app by its own flag', () => {
		const page = new FakePage(IPHONE, 'iPhone', 5);
		page.navigator.standalone = true;
		const { install } = setup(page);
		expect(install.mode).toBe('installed');
	});

	it('stops offering once the app has been installed', () => {
		const { page, install } = setup();
		page.offer();
		page.dispatchEvent(new Event('appinstalled'));
		expect(install.mode).toBe('installed');
		expect(install.offerOnHome).toBe(false);
	});

	it('puts the home card away for good, but still has the offer for Settings', () => {
		const { page, storage, install } = setup();
		page.offer();
		install.dismissHint();
		expect(install.offerOnHome).toBe(false);
		expect(install.mode).toBe('button');
		expect((storage as FakeStorage).items.get(INSTALL_HINT_KEY)).toBe('dismissed');

		// A later visit remembers.
		const later = setup(new FakePage(), storage);
		later.page.offer();
		expect(later.install.offerOnHome).toBe(false);
		expect(later.install.mode).toBe('button');
	});

	it('copes with a browser that refuses storage', () => {
		const refusing: InstallStorage = {
			getItem() {
				throw new DOMException('The operation is insecure.', 'SecurityError');
			},
			setItem() {
				throw new DOMException('The operation is insecure.', 'SecurityError');
			}
		};
		const { page, install } = setup(new FakePage(), refusing);
		page.offer();
		expect(install.offerOnHome).toBe(true);
		install.dismissHint();
		// Put away for this visit, though it could not be remembered.
		expect(install.offerOnHome).toBe(false);
	});

	it('listens only once however often it is started', () => {
		const { page, install } = setup();
		install.start();
		install.start();
		page.offer();
		expect(install.mode).toBe('button');
	});
});
