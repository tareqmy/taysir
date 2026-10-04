/**
 * Tells the learner when a new version of the app is ready, and switches to it when asked.
 *
 * The service worker (`src/service-worker.ts`) downloads a new version in the background and then
 * waits. Nothing changes under a page that is open until `apply()` is called, which tells the
 * waiting worker to take over and reloads the page once it has.
 */

/** How often a page that stays open looks for a new version. */
const CHECK_EVERY_MS = 60 * 60 * 1000;

export class AppUpdate {
	/** A newer version than the one on screen is ready. */
	available = $state(false);
	/** The learner chose to carry on for now. The prompt returns on the next page load. */
	dismissed = $state(false);

	private container: ServiceWorkerContainer | undefined;
	private reload: () => void;
	private registration: ServiceWorkerRegistration | undefined;
	private started = false;
	/** The page runs under a service worker, so a change of worker means its code is out of date. */
	private controlled = false;
	private applying = false;

	constructor(container: ServiceWorkerContainer | undefined, reload: () => void) {
		this.container = container;
		this.reload = reload;
	}

	/** Starts watching. Does nothing where service workers are unsupported or none is registered. */
	async start() {
		const container = this.container;
		if (!container || this.started) return;
		this.started = true;
		this.controlled = container.controller !== null;
		container.addEventListener('controllerchange', () => this.controllerChanged());

		const registration = await container.ready;
		this.registration = registration;
		this.noteWaiting();
		registration.addEventListener('updatefound', () => {
			const worker = registration.installing;
			worker?.addEventListener('statechange', () => {
				if (worker.state === 'installed') this.noteWaiting();
			});
		});

		// Browsers look for a new worker when a page loads. A page left open needs to ask.
		if (typeof document !== 'undefined') {
			document.addEventListener('visibilitychange', () => {
				if (document.visibilityState === 'visible') void this.check();
			});
			setInterval(() => void this.check(), CHECK_EVERY_MS);
		}
	}

	/** Asks the server whether there is a new version. Being offline is not an error. */
	async check() {
		try {
			await this.registration?.update();
		} catch {
			// No connection: the next check will find out.
		}
	}

	/** Switches to the new version and reloads the page. */
	apply() {
		const waiting = this.registration?.waiting;
		if (!waiting) {
			// Another tab already switched, so only this page is behind.
			this.reload();
			return;
		}
		this.applying = true;
		waiting.postMessage({ type: 'SKIP_WAITING' });
	}

	dismiss() {
		this.dismissed = true;
	}

	/** A downloaded version is only an update if there is an older one on screen to replace. */
	private noteWaiting() {
		if (this.registration?.waiting && this.container?.controller) this.available = true;
	}

	private controllerChanged() {
		if (this.applying) {
			this.applying = false;
			this.reload();
		} else if (this.controlled) {
			// Another tab switched versions: this page now runs old code under the new worker.
			this.available = true;
		} else {
			// The first worker has taken control of a page that had none. Nothing is out of date.
			this.controlled = true;
		}
	}
}

/** The one update watcher for the running page. Watching starts with `start()`. */
export const appUpdate = new AppUpdate(
	typeof navigator === 'undefined' ? undefined : navigator.serviceWorker,
	() => location.reload()
);
