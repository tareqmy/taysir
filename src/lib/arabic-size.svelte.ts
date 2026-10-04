import {
	ARABIC_SIZE_KEY,
	DEFAULT_ARABIC_SIZE,
	parseArabicSize,
	scaleOf,
	type ArabicSizeId
} from './arabic-size';

/** The CSS variable every Arabic size in the stylesheet is multiplied by. */
export const SCALE_PROPERTY = '--ar-scale';

/** The little of `localStorage` this needs, so a test can hand in a stand-in. */
export interface SizeStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

/** The little of the page's root element this needs. */
export interface SizeTarget {
	style: { setProperty(name: string, value: string): void };
}

/**
 * The learner's Arabic text size. Reading and saving both tolerate a browser that refuses storage
 * (a private window, blocked site data): the size then lasts until the page is closed.
 */
export class ArabicSize {
	current = $state<ArabicSizeId>(DEFAULT_ARABIC_SIZE);

	private storage: SizeStorage | undefined;
	private target: SizeTarget | undefined;

	constructor(storage: SizeStorage | undefined, target: SizeTarget | undefined) {
		this.storage = storage;
		this.target = target;
	}

	/** Reads the saved size and puts it on the page. */
	init() {
		let saved: string | null = null;
		try {
			saved = this.storage?.getItem(ARABIC_SIZE_KEY) ?? null;
		} catch {
			// Storage is blocked: use the standard size.
		}
		this.current = parseArabicSize(saved);
		this.apply();
	}

	set(size: ArabicSizeId) {
		this.current = size;
		this.apply();
		try {
			this.storage?.setItem(ARABIC_SIZE_KEY, size);
		} catch {
			// Storage is blocked: the size holds for this visit only.
		}
	}

	private apply() {
		this.target?.style.setProperty(SCALE_PROPERTY, String(scaleOf(this.current)));
	}
}

/** The browser's storage, or nothing where reaching for it is an error. */
function browserStorage(): SizeStorage | undefined {
	try {
		return typeof localStorage === 'undefined' ? undefined : localStorage;
	} catch {
		return undefined;
	}
}

/** The one Arabic size for the running page. Reading the saved choice starts with `init()`. */
export const arabicSize = new ArabicSize(
	browserStorage(),
	typeof document === 'undefined' ? undefined : document.documentElement
);
