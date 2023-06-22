/* eslint-disable no-console */

import { transpiler as _transpiler, JaffleEditor, Strudel } from './jaffle';

const TUNES_PATH = './tunes/';
const TUNES = ['ws2_stack', 'ws3_delay', 'ws3_dub_tune', 'ws3_stack_in_stack', 'ws4_add_stack',
	'barry_harris', 'giant_steps', 'sample_drums', 'zelda_rescue'];
	// 'blippy_rhodes', 'caverave', 'festival_of_fingers', 'swimming', 'wavy_kalimba' ];
const DEFAULT_TUNE = 'ws2_stack';
const domSelectTune = <HTMLSelectElement> document.getElementById('select_tune');
const editor = new JaffleEditor();
const strudel = new Strudel();

function loadTune(tuneName: string): void {
	console.log(`Loading tune ${tuneName}...`);
	fetch(`${TUNES_PATH}${tuneName}.yml`)
		.then((response) => response.text())
		.then((data) => {
			editor.setText(data);
			console.log('Tune loaded.');
		});
	domSelectTune.value = tuneName;
	window.location.hash = `#${tuneName}`;
}

function getRandomTune(): string {
	return TUNES[Math.floor(Math.random() * TUNES.length)];
}

function fillTunesList(): void {
	TUNES.forEach((tune) => {
		const domTuneItem = document.createElement('option');
		domTuneItem.value = tune;
		domTuneItem.innerHTML = tune.replace(/_/g, ' ');
		domSelectTune.append(domTuneItem);
	});
}

function transpiler(input: string) {
	const output = _transpiler(input);
	console.log(output);
	return output;
}

strudel.transpiler = (tune) => transpiler(tune);
strudel.init();
editor.onPlay = () => strudel.play(editor.getText());
editor.onStop = () => strudel.stop();

window.addEventListener('DOMContentLoaded', () => {
	editor.build(<HTMLInputElement> document.getElementById('jaffle'));
	fillTunesList();
	loadTune(window.location.hash.substring(1) || DEFAULT_TUNE);
});

domSelectTune.addEventListener('change', (event) => {
	loadTune((<HTMLSelectElement> event.target).value);
});
