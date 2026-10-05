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
	/** The install prompt, if the browser sent it before the app started (see `src/app.html`). */
	__taysirInstallPrompt?: Event;
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
	standalone = $state(false);
	/** The browser said the app was installed during this visit, which may still be a browser tab. */
	installedHere = $state(false);
	/** The browser has offered its install prompt and it has not been used yet. */
	canPrompt = $state(false);
	/** The browser's install prompt is open, waiting for the learner. */
	asking = $state(false);
	/** The learner closed the browser's install prompt without installing. */
	declined = $state(false);
	/** An iPhone or iPad. */
	apple = $state(false);
	/** The learner put the card on the home screen away. The offer in Settings stays. */
	hintDismissed = $state(false);

	/** What to show here right now. */
	mode: InstallMode = $derived(
		installMode({
			installed: this.standalone || this.installedHere,
			canPrompt: this.canPrompt,
			apple: this.apple
		})
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
		this.standalone =
			env.matchMedia('(display-mode: standalone)').matches || env.navigator.standalone === true;
		try {
			this.hintDismissed = this.storage?.getItem(INSTALL_HINT_KEY) === 'dismissed';
		} catch {
			// Storage is blocked: the card shows until it is put away this visit.
		}

		const keep = (event: Event) => {
			// Hold the browser's own offer back, so it comes where the learner is not mid-lesson.
			event.preventDefault();
			this.prompt = event as InstallPromptEvent;
			this.canPrompt = true;
		};
		env.addEventListener('beforeinstallprompt', keep);
		// The browser may have sent it already: a small script in the page's head keeps it until now.
		const early = env.__taysirInstallPrompt;
		if (early) {
			delete env.__taysirInstallPrompt;
			keep(early);
		}
		env.addEventListener('appinstalled', () => {
			this.prompt = undefined;
			this.canPrompt = false;
			this.installedHere = true;
		});
	}

	/**
	 * Brings up the browser's own install prompt, and says what the learner chose. While it is open
	 * the offer stays as it is; nothing changes until the learner has answered.
	 */
	async install(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
		const prompt = this.prompt;
		if (!prompt || this.asking) return 'unavailable';
		// A prompt can be shown once. If the browser will offer again, it sends a new one.
		this.prompt = undefined;
		this.asking = true;
		try {
			await prompt.prompt();
			const { outcome } = await prompt.userChoice;
			if (outcome === 'accepted') this.installedHere = true;
			else this.declined = true;
			return outcome;
		} catch {
			return 'unavailable';
		} finally {
			this.asking = false;
			this.canPrompt = false;
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
