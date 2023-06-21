import * as core from '@strudel.cycles/core';
import * as mini from '@strudel.cycles/mini';
import * as webaudio from '@strudel.cycles/webaudio';
import * as tonal from '@strudel.cycles/tonal';
import { registerSoundfonts } from '@strudel.cycles/soundfonts';

type Transpiler = (input: string) => string;

class Strudel {
	public transpiler: Transpiler;

	private ctx: webaudio.Audiocontext;

	private repl: core.Repl;

	constructor() {
		this.transpiler = (input) => input;
	}

	public init(): void {
		this.ctx = webaudio.getAudioContext();
		this.repl = core.repl({
			defaultOutput: webaudio.webaudioOutput,
			getTime: () => this.ctx.currentTime,
			transpiler: this.transpiler,
		});
		Strudel.loadDefaultSamples();
	}

	public play(tune: string): void {
		Strudel.showPianoRoll(true);
		this.ctx.resume();
		this.repl.evaluate(tune);
	}

	public stop(): void {
		Strudel.showPianoRoll(false);
		this.repl.stop();
	}

	static showPianoRoll(shouldShow: boolean): void {
		const domPianoRoll = document.getElementById('test-canvas');
		if (domPianoRoll !== null) {
			domPianoRoll.style.display = shouldShow ? 'block' : 'none';
		}
	}

	static loadDefaultSamples(): void {
		webaudio.samples(
			'https://strudel.tidalcycles.org/vcsl.json',
			'github:sgossner/VCSL/master/',
			{ prebake: true },
		);
		webaudio.samples(
			'https://strudel.tidalcycles.org/piano.json',
			'https://strudel.tidalcycles.org/piano/',
			{ prebake: true },
		);
		webaudio.samples(
			'https://strudel.tidalcycles.org/tidal-drum-machines.json',
			'github:ritchse/tidal-drum-machines/main/machines/',
			{ prebake: true, tag: 'drum-machines' },
		);
		webaudio.samples(
			'https://strudel.tidalcycles.org/EmuSP12.json',
			'https://strudel.tidalcycles.org/EmuSP12/',
			{ prebake: true, tag: 'drum-machines' },
		);

		webaudio.initAudioOnFirstClick();
		webaudio.registerSynthSounds();
		registerSoundfonts();
		core.evalScope(core.controls, core, mini, webaudio, tonal);
	}
}

export default Strudel;
