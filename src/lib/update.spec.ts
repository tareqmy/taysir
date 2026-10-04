import { describe, expect, it, vi } from 'vitest';
import { AppUpdate } from './update.svelte';

/** Just enough of a service worker for the update logic to talk to. */
class FakeWorker extends EventTarget {
	state = 'installing';
	messages: unknown[] = [];
	postMessage(message: unknown) {
		this.messages.push(message);
	}
	become(state: string) {
		this.state = state;
		this.dispatchEvent(new Event('statechange'));
	}
}

class FakeRegistration extends EventTarget {
	waiting: FakeWorker | null = null;
	installing: FakeWorker | null = null;
	updates = 0;
	offline = false;

	async update() {
		this.updates++;
		if (this.offline) throw new TypeError('Failed to fetch');
	}

	/** A new version starts downloading. */
	beginInstall() {
		this.installing = new FakeWorker();
		this.dispatchEvent(new Event('updatefound'));
		return this.installing;
	}

	/** It has downloaded and is waiting its turn, as a real worker is when the event fires. */
	finishInstall(worker: FakeWorker) {
		this.installing = null;
		this.waiting = worker;
		worker.become('installed');
	}
}

class FakeContainer extends EventTarget {
	controller: object | null;
	ready: Promise<FakeRegistration>;
	constructor(registration: FakeRegistration, controlled: boolean) {
		super();
		this.controller = controlled ? {} : null;
		this.ready = Promise.resolve(registration);
	}
	/** A worker takes control of the page, whether it is the first one or a replacement. */
	takeControl() {
		this.controller = {};
		this.dispatchEvent(new Event('controllerchange'));
	}
}

async function setup({ controlled = true, waiting = false } = {}) {
	const registration = new FakeRegistration();
	if (waiting) registration.waiting = new FakeWorker();
	const container = new FakeContainer(registration, controlled);
	const reload = vi.fn();
	const update = new AppUpdate(container as unknown as ServiceWorkerContainer, reload);
	await update.start();
	return { registration, container, reload, update };
}

describe('AppUpdate', () => {
	it('does nothing where service workers are not supported', async () => {
		const reload = vi.fn();
		const update = new AppUpdate(undefined, reload);
		await update.start();
		await update.check();
		expect(update.available).toBe(false);
	});

	it('has nothing to offer when the page opens on the current version', async () => {
		const { update } = await setup();
		expect(update.available).toBe(false);
		expect(update.dismissed).toBe(false);
	});

	it('offers a version that was already waiting when the page opened', async () => {
		const { update } = await setup({ waiting: true });
		expect(update.available).toBe(true);
	});

	it('offers a version that finishes downloading while the page is open', async () => {
		const { update, registration } = await setup();
		const worker = registration.beginInstall();
		expect(update.available).toBe(false); // still downloading
		registration.finishInstall(worker);
		expect(update.available).toBe(true);
	});

	it('stays quiet on a first visit, when the first worker takes over a page that had none', async () => {
		const { update, container, reload } = await setup({ controlled: false });
		container.takeControl();
		expect(update.available).toBe(false);
		expect(reload).not.toHaveBeenCalled();
	});

	it('offers the next version after a first visit, without a reload in between', async () => {
		// The page was not controlled when it opened, but is from the moment the first worker claims it.
		const { update, registration, container } = await setup({ controlled: false });
		container.takeControl();
		registration.finishInstall(registration.beginInstall());
		expect(update.available).toBe(true);
	});

	it('asks the waiting worker to take over, then reloads once it has', async () => {
		const { update, registration, container, reload } = await setup({ waiting: true });
		const waiting = registration.waiting!;
		update.apply();
		expect(waiting.messages).toEqual([{ type: 'SKIP_WAITING' }]);
		expect(reload).not.toHaveBeenCalled();

		container.takeControl();
		expect(reload).toHaveBeenCalledTimes(1);
		container.takeControl();
		expect(reload).toHaveBeenCalledTimes(1);
	});

	it('does not watch twice when started again', async () => {
		const { update, registration, container, reload } = await setup({ waiting: true });
		await update.start();
		update.apply();
		container.takeControl();
		expect(registration.waiting!.messages).toHaveLength(1);
		expect(reload).toHaveBeenCalledTimes(1);
	});

	it('marks a page out of date when another tab switched versions, and reloads it only when asked', async () => {
		const { update, container, reload } = await setup();
		container.takeControl();
		expect(update.available).toBe(true);
		expect(reload).not.toHaveBeenCalled();

		update.apply();
		expect(reload).toHaveBeenCalledTimes(1);
	});

	it('can be put off, and the update stays available', async () => {
		const { update } = await setup({ waiting: true });
		update.dismiss();
		expect(update.dismissed).toBe(true);
		expect(update.available).toBe(true);
	});

	it('asks the server for a new version, and carries on when it is offline', async () => {
		const { update, registration } = await setup();
		await update.check();
		expect(registration.updates).toBe(1);

		registration.offline = true;
		await expect(update.check()).resolves.toBeUndefined();
		expect(registration.updates).toBe(2);
	});
});
