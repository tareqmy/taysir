import { describe, expect, it } from 'vitest';
import {
	ARABIC_SIZES,
	ARABIC_SIZE_KEY,
	DEFAULT_ARABIC_SIZE,
	isArabicSize,
	parseArabicSize,
	scaleOf
} from './arabic-size';
import {
	ArabicSize,
	SCALE_PROPERTY,
	type SizeStorage,
	type SizeTarget
} from './arabic-size.svelte';

class FakeStorage implements SizeStorage {
	items = new Map<string, string>();
	getItem(key: string) {
		return this.items.get(key) ?? null;
	}
	setItem(key: string, value: string) {
		this.items.set(key, value);
	}
}

class FakeRoot implements SizeTarget {
	properties: Record<string, string> = {};
	style = {
		setProperty: (name: string, value: string) => {
			this.properties[name] = value;
		}
	};
}

const blocked: SizeStorage = {
	getItem() {
		throw new Error('blocked');
	},
	setItem() {
		throw new Error('blocked');
	}
};

describe('the Arabic sizes', () => {
	it('are four, from smaller to largest, with unique ids', () => {
		expect(ARABIC_SIZES.map((s) => s.label)).toEqual(['Smaller', 'Standard', 'Large', 'Largest']);
		expect(new Set(ARABIC_SIZES.map((s) => s.id)).size).toBe(4);
		const scales = ARABIC_SIZES.map((s) => s.scale);
		expect([...scales].sort((a, b) => a - b)).toEqual(scales);
	});

	it('have the standard size as today’s size, 1, and as the default', () => {
		expect(DEFAULT_ARABIC_SIZE).toBe('standard');
		expect(scaleOf('standard')).toBe(1);
	});

	it('top out at 150%, as offered', () => {
		expect(scaleOf('smaller')).toBe(0.9);
		expect(scaleOf('large')).toBe(1.25);
		expect(scaleOf('largest')).toBe(1.5);
	});
});

describe('parseArabicSize', () => {
	it('keeps a size this version has', () => {
		for (const { id } of ARABIC_SIZES) expect(parseArabicSize(id)).toBe(id);
	});

	it('falls back to the standard size for anything else', () => {
		for (const value of [null, undefined, '', 'huge', 'LARGE', 2, {}, '1.5']) {
			expect(parseArabicSize(value), String(value)).toBe('standard');
			expect(isArabicSize(value)).toBe(false);
		}
	});
});

describe('ArabicSize', () => {
	it('starts at the standard size, and puts it on the page', () => {
		const root = new FakeRoot();
		const size = new ArabicSize(new FakeStorage(), root);
		size.init();
		expect(size.current).toBe('standard');
		expect(root.properties[SCALE_PROPERTY]).toBe('1');
	});

	it('brings back the size that was saved', () => {
		const storage = new FakeStorage();
		storage.setItem(ARABIC_SIZE_KEY, 'large');
		const root = new FakeRoot();
		const size = new ArabicSize(storage, root);
		size.init();
		expect(size.current).toBe('large');
		expect(root.properties[SCALE_PROPERTY]).toBe('1.25');
	});

	it('ignores a saved value it does not understand', () => {
		const storage = new FakeStorage();
		storage.setItem(ARABIC_SIZE_KEY, 'enormous');
		const size = new ArabicSize(storage, new FakeRoot());
		size.init();
		expect(size.current).toBe('standard');
	});

	it('changes the page at once and saves the choice', () => {
		const storage = new FakeStorage();
		const root = new FakeRoot();
		const size = new ArabicSize(storage, root);
		size.init();
		size.set('largest');
		expect(size.current).toBe('largest');
		expect(root.properties[SCALE_PROPERTY]).toBe('1.5');
		expect(storage.getItem(ARABIC_SIZE_KEY)).toBe('largest');
	});

	it('survives a reload: a new page reads what the last one saved', () => {
		const storage = new FakeStorage();
		new ArabicSize(storage, new FakeRoot()).set('smaller');
		const next = new ArabicSize(storage, new FakeRoot());
		next.init();
		expect(next.current).toBe('smaller');
	});

	it('still works, for this visit, when the browser refuses storage', () => {
		const root = new FakeRoot();
		const size = new ArabicSize(blocked, root);
		expect(() => size.init()).not.toThrow();
		expect(size.current).toBe('standard');
		expect(() => size.set('large')).not.toThrow();
		expect(size.current).toBe('large');
		expect(root.properties[SCALE_PROPERTY]).toBe('1.25');
	});

	it('still works with no storage or no page at all', () => {
		const size = new ArabicSize(undefined, undefined);
		expect(() => {
			size.init();
			size.set('largest');
		}).not.toThrow();
		expect(size.current).toBe('largest');
	});
});
