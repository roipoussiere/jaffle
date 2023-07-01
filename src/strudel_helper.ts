import * as core from '@strudel.cycles/core';
import * as mini from '@strudel.cycles/mini';
import * as webaudio from '@strudel.cycles/webaudio';
import * as tonal from '@strudel.cycles/tonal';
import * as csound from '@strudel.cycles/csound';
import { registerSoundfonts } from '@strudel.cycles/soundfonts';

type Transpiler = (input: string) => string;

const maxPan = core.noteToMidi('C8');
const panwidth = (pan, width) => pan * width + (1 - width) / 2;

core.Pattern.prototype.piano = function () {
	this.clip(1)
		.s('piano')
		.release(0.1)
		.fmap((value) => {
			const midi = core.valueToMidi(value);
			// pan by pitch
			const pan = panwidth(Math.min(Math.round(midi) / maxPan, 1), 0.5);
			return { ...value, pan: (value.pan || 1) * pan };
		});
};

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
		webaudio.registerSynthSounds();
		registerSoundfonts();

		webaudio.samples(
			'https://strudel.tidalcycles.org/piano.json',
			'https://strudel.tidalcycles.org/piano/',
			{ prebake: true },
		);
		webaudio.samples(
			'https://strudel.tidalcycles.org/vcsl.json',
			'github:sgossner/VCSL/master/',
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
		webaudio.samples(
			{
				casio: [
					'casio/high.wav',
					'casio/low.wav',
					'casio/noise.wav',
				],
				crow: [
					'crow/000_crow.wav',
					'crow/001_crow2.wav',
					'crow/002_crow3.wav',
					'crow/003_crow4.wav',
				],
				insect: [
					'insect/000_everglades_conehead.wav',
					'insect/001_robust_shieldback.wav',
					'insect/002_seashore_meadow_katydid.wav',
				],
				wind: [
					'wind/000_wind1.wav',
					'wind/001_wind10.wav',
					'wind/002_wind2.wav',
					'wind/003_wind3.wav',
					'wind/004_wind4.wav',
					'wind/005_wind5.wav',
					'wind/006_wind6.wav',
					'wind/007_wind7.wav',
					'wind/008_wind8.wav',
					'wind/009_wind9.wav',
				],
				jazz: [
					'jazz/000_BD.wav',
					'jazz/001_CB.wav',
					'jazz/002_FX.wav',
					'jazz/003_HH.wav',
					'jazz/004_OH.wav',
					'jazz/005_P1.wav',
					'jazz/006_P2.wav',
					'jazz/007_SN.wav',
				],
				metal: [
					'metal/000_0.wav',
					'metal/001_1.wav',
					'metal/002_2.wav',
					'metal/003_3.wav',
					'metal/004_4.wav',
					'metal/005_5.wav',
					'metal/006_6.wav',
					'metal/007_7.wav',
					'metal/008_8.wav',
					'metal/009_9.wav',
				],
				east: [
					'east/000_nipon_wood_block.wav',
					'east/001_ohkawa_mute.wav',
					'east/002_ohkawa_open.wav',
					'east/003_shime_hi.wav',
					'east/004_shime_hi_2.wav',
					'east/005_shime_mute.wav',
					'east/006_taiko_1.wav',
					'east/007_taiko_2.wav',
					'east/008_taiko_3.wav',
				],
				space: [
					'space/000_0.wav',
					'space/001_1.wav',
					'space/002_11.wav',
					'space/003_12.wav',
					'space/004_13.wav',
					'space/005_14.wav',
					'space/006_15.wav',
					'space/007_16.wav',
					'space/008_17.wav',
					'space/009_18.wav',
					'space/010_2.wav',
					'space/011_3.wav',
					'space/012_4.wav',
					'space/013_5.wav',
					'space/014_6.wav',
					'space/015_7.wav',
					'space/016_8.wav',
					'space/017_9.wav',
				],
				numbers: [
					'numbers/0.wav',
					'numbers/1.wav',
					'numbers/2.wav',
					'numbers/3.wav',
					'numbers/4.wav',
					'numbers/5.wav',
					'numbers/6.wav',
					'numbers/7.wav',
					'numbers/8.wav',
				],
			},
			'github:tidalcycles/Dirt-Samples/master/',
		);

		webaudio.initAudioOnFirstClick();
		core.evalScope(core.controls, core, mini, webaudio, tonal, csound);
	}
}

export default Strudel;
