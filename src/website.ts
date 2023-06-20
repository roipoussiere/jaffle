import * as core from '@strudel.cycles/core';
import * as mini from '@strudel.cycles/mini';
import * as webaudio from '@strudel.cycles/webaudio';
import * as tonal from '@strudel.cycles/tonal';
import { registerSoundfonts } from '@strudel.cycles/soundfonts';

import transpiler from './transpiler';
import JaffleEditor from './editor';

const TUNES_PATH = './tunes/';
const TUNES = ['ws2_stack', 'ws3_delay', 'ws3_dub_tune', 'ws3_stack_in_stack', 'ws4_add_stack',
	'barry_harris', 'giant_steps', 'sample_drums', 'zelda_rescue'];
	// 'blippy_rhodes', 'caverave', 'festival_of_fingers', 'swimming', 'wavy_kalimba' ];

const domSelectTune = <HTMLSelectElement> document.getElementById('select_tune');
const domBtnStart = <HTMLInputElement> document.getElementById('start');
const domBtnStop = <HTMLInputElement> document.getElementById('stop');

const ctx = webaudio.getAudioContext();

const { evaluate, stop } = core.repl({
	defaultOutput: webaudio.webaudioOutput,
	getTime: () => ctx.currentTime,
	transpiler,
});

function onPlay(editor: JaffleEditor): void {
	ctx.resume();
	evaluate(editor.getText());
}

function onStop(): void {
	stop();
}

const editor = new JaffleEditor(onPlay, onStop);

function loadTune(tuneName: string): void {
	// eslint-disable-next-line no-console
	console.log(`Loading tune ${tuneName}...`);
	fetch(`${TUNES_PATH}${tuneName}.yml`)
		.then((response) => response.text())
		.then((data) => editor.setText(data));
	domSelectTune.value = tuneName;
	window.location.hash = `#${tuneName}`;
}

function onDomLoaded(): void {
	TUNES.forEach((tune) => {
		const domTuneItem = document.createElement('option');
		domTuneItem.value = tune;
		domTuneItem.innerHTML = tune.replace(/_/g, ' ');
		domSelectTune.append(domTuneItem);
	});

	loadTune(window.location.hash.substring(1)
		|| TUNES[Math.floor(Math.random() * TUNES.length)]);
}

function initAudio(): void {
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

initAudio();

window.addEventListener('DOMContentLoaded', onDomLoaded);
domBtnStart.addEventListener('click', () => onPlay(editor));
domBtnStop.addEventListener('click', onStop);
domSelectTune.addEventListener('change', (event) => {
	loadTune((<HTMLSelectElement> event.target).value);
});
