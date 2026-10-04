import {
	INSTALL_HINT_KEY,
	installMode,
	isAppleTouchDevice,
	type DeviceInfo,
	type InstallMode
} from './install';

/** The browser's install prompt, which Chromium browsers hand to the page instead of showing. */
interface InstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** The little of the page this needs, so a test can hand in a stand-in. `window` fits. */
export interface InstallEnvironment {
	addEventListener(type: string, listener: (event: Event) => void): void;
	matchMedia(query: string): { matches: boolean };
	navigator: DeviceInfo & { standalone?: boolean };
}

/** The little of `localStorage` this needs. */
export interface InstallStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

/**
 * Whether Taysir can be put on a home screen from here, and how. Chromium browsers (Android, and
 * Chrome or Edge on a computer) send the page their install prompt, which is kept until the learner
 * asks for it. Safari on an iPhone or iPad has none, so there the learner is told the steps.
 *
 * Nothing here needs a connection or saves anything but the learner's "Not now", and a browser that
 * refuses storage just forgets it at the end of the visit.
 */
export class AppInstall {
	/** Running as an installed app (a home-screen icon or its own window), so nothing to offer. */
	installed = $state(false);
	/** The browser has offered its install prompt and it has not been used yet. */
	canPrompt = $state(false);
	/** An iPhone or iPad. */
	apple = $state(false);
	/** The learner put the card on the home screen away. The offer in Settings stays. */
	hintDismissed = $state(false);

	/** What to show here right now. */
	mode: InstallMode = $derived(
		installMode({ installed: this.installed, canPrompt: this.canPrompt, apple: this.apple })
	);
	/** The home-screen card: only where there is something to do about it, and not put away. */
	offerOnHome = $derived((this.mode === 'button' || this.mode === 'steps') && !this.hintDismissed);

	private env: InstallEnvironment | undefined;
	private storage: InstallStorage | undefined;
	private prompt: InstallPromptEvent | undefined;
	private started = false;

	constructor(env: InstallEnvironment | undefined, storage: InstallStorage | undefined) {
		this.env = env;
		this.storage = storage;
	}

	/**
	 * Starts listening. The prompt arrives once the page has loaded, so this runs as the app starts
	 * rather than when it is first needed.
	 */
	start() {
		const env = this.env;
		if (!env || this.started) return;
		this.started = true;

		this.apple = isAppleTouchDevice(env.navigator);
		this.installed =
			env.matchMedia('(display-mode: standalone)').matches || env.navigator.standalone === true;
		try {
			this.hintDismissed = this.storage?.getItem(INSTALL_HINT_KEY) === 'dismissed';
		} catch {
			// Storage is blocked: the card shows until it is put away this visit.
		}

		env.addEventListener('beforeinstallprompt', (event) => {
			// Hold the browser's own offer back, so it comes where the learner is not mid-lesson.
			event.preventDefault();
			this.prompt = event as InstallPromptEvent;
			this.canPrompt = true;
		});
		env.addEventListener('appinstalled', () => {
			this.prompt = undefined;
			this.canPrompt = false;
			this.installed = true;
		});
	}

	/** Brings up the browser's own install prompt. Says what the learner chose. */
	async install(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
		const prompt = this.prompt;
		if (!prompt) return 'unavailable';
		// A prompt can be shown once. If the browser will offer again, it sends a new one.
		this.prompt = undefined;
		this.canPrompt = false;
		try {
			await prompt.prompt();
			return (await prompt.userChoice).outcome;
		} catch {
			return 'unavailable';
		}
	}

	/** Puts the home-screen card away for good on this device. */
	dismissHint() {
		this.hintDismissed = true;
		try {
			this.storage?.setItem(INSTALL_HINT_KEY, 'dismissed');
		} catch {
			// Storage is blocked: it comes back next visit.
		}
	}
}

/** The browser's storage, or nothing where reaching for it is an error. */
function browserStorage(): InstallStorage | undefined {
	try {
		return typeof localStorage === 'undefined' ? undefined : localStorage;
	} catch {
		return undefined;
	}
}

/** The one install offer for the running page. It starts listening with `start()`. */
export const appInstall = new AppInstall(
	typeof window === 'undefined' ? undefined : window,
	browserStorage()
);
