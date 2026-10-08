import { afterEach, describe, expect, it, vi } from 'vitest';
import { playAudio } from './audio';

/** An audio element whose play() is settled by the test, and which pause() interrupts as a browser does. */
class FakeAudio {
	static made: FakeAudio[] = [];
	url: string;
	settle!: { resolve: () => void; reject: (error: unknown) => void };
	constructor(url: string) {
		this.url = url;
		FakeAudio.made.push(this);
	}
	play() {
		return new Promise<void>((resolve, reject) => (this.settle = { resolve, reject }));
	}
	pause() {
		this.settle?.reject(
			new DOMException('The play() request was interrupted by a call to pause().', 'AbortError')
		);
	}
}

describe('playAudio', () => {
	vi.stubGlobal('Audio', FakeAudio);
	afterEach(() => {
		FakeAudio.made = [];
	});

	it('says a clip played when it did', async () => {
		const played = playAudio('a.mp3');
		FakeAudio.made[0].settle.resolve();
		expect(await played).toBe(true);
	});

	it('says a clip could not be played when it cannot be loaded', async () => {
		const played = playAudio('a.mp3');
		FakeAudio.made[0].settle.reject(
			new DOMException('The element has no supported sources.', 'NotSupportedError')
		);
		expect(await played).toBe(false);
	});

	it('does not count a clip stopped because another was started as one that cannot be played', async () => {
		const first = playAudio('a.mp3');
		const second = playAudio('b.mp3');
		FakeAudio.made[1].settle.resolve();
		expect(await first).toBe(true);
		expect(await second).toBe(true);
	});
});
