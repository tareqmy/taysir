/** Where a learner's "Not now" to the install card on the home screen is kept, on this device. */
export const INSTALL_HINT_KEY = 'taysir.installHint';

/** What the install offer should show on this device, right now. */
export type InstallMode =
	/** The app is already running as an installed app. */
	| 'installed'
	/** The browser has offered its own install prompt, which a button can bring up. */
	| 'button'
	/** An iPhone or iPad: no prompt exists, so the learner is told the steps. */
	| 'steps'
	/** Nothing to offer: the browser cannot install the app, or is not offering to just now. */
	| 'none';

/** The few things about a device that tell an iPhone or iPad apart. */
export interface DeviceInfo {
	userAgent: string;
	platform: string;
	maxTouchPoints: number;
}

/**
 * An iPhone, iPod or iPad. An iPad asks for desktop sites by default, so it calls itself a Mac,
 * but it has a touch screen and a real Mac does not.
 */
export function isAppleTouchDevice({ userAgent, platform, maxTouchPoints }: DeviceInfo): boolean {
	return /iPhone|iPad|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

/** Being an installed app comes first; then what this browser can do. */
export function installMode(state: {
	installed: boolean;
	canPrompt: boolean;
	apple: boolean;
}): InstallMode {
	if (state.installed) return 'installed';
	if (state.canPrompt) return 'button';
	if (state.apple) return 'steps';
	return 'none';
}
