/* eslint-disable no-console */

import { entryToJs, entryToBox, yamlToEntry, Editor, NodeEditor } from './jaffle';
import StrudelRepl from './strudelRepl';

const TUNES = ['amen_sister', 'arpoon', 'barry_harris', 'bass_fuge', 'bell_dub', 'blippy_rhodes',
	'bridge_is_over', 'caverave', 'chop', 'csound_demo', 'delay', 'dino_funk', 'echo_piano',
	'festival_of_fingers', 'festival_of_fingers_3', 'flat_rave', 'giant_steps', 'good_times',
	'holy_flute', 'hyperpop', 'jux_und_tollerei', 'lounge_sponge', 'melting_submarine',
	'orbit', 'outro_music', 'random_bells', 'sample_demo', 'sample_drums', 'sml1', 'swimming',
	'underground_plumber', 'waa2', 'wavy_kalimba', 'zelda_rescue',
	'ws2_stack', 'ws3_stack_in_stack', 'ws3_dub_tune', 'ws4_add_stack'];

const DEFAULT_TUNE = 'ws2_stack';
const domSelectTune = <HTMLSelectElement> document.getElementById('select_tune');
const editor = new Editor();
const graph = new NodeEditor();
const strudel = new StrudelRepl(
	(error) => editor.errorBar.setError(error.message),
	() => editor.errorBar.setError(),
);
let tunesPath = '../tunes/';

const getContainer = () => <HTMLDivElement> document.getElementById('jaffle_editor');

function loadTune(tuneName: string): void {
	console.log(`Loading tune ${tuneName}...`);
	fetch(`${tunesPath}${tuneName}.yml`)
		.then((response) => response.text())
		.then((data) => {
			editor.yamlEditor.setContent(data);
			console.log(`Tune loaded (${Math.round((data.length / 1024) * 100) / 100}kB)`);
		});
	if (domSelectTune !== null) {
		domSelectTune.value = tuneName;
		window.location.hash = `#${tuneName}`;
	}
}

// function getRandomTune(): string {
// 	return TUNES[Math.floor(Math.random() * TUNES.length)];
// }

function fillTunesList(): void {
	TUNES.forEach((tune) => {
		const domTuneItem = document.createElement('option');
		domTuneItem.value = tune;
		domTuneItem.innerHTML = tune.replace(/_/g, ' ');
		domSelectTune.append(domTuneItem);
	});
}

strudel.transpiler = (tuneYaml) => {
	const tuneEntry = yamlToEntry(tuneYaml);
	return entryToJs(tuneEntry);
};

strudel.init();
editor.onPlay(() => {
	const tuneYaml = editor.yamlEditor.getContent();

	// const tuneEntry = yamlToEntry(tuneYaml);
	// console.log('entry:', entryToString(tuneEntry));

	// const tuneJs = entryToJs(tuneEntry);
	// console.log('js:', tuneJs);

	strudel.play(tuneYaml);
});
editor.onStop(() => strudel.stop());
editor.onUpdate((tuneYml) => graph.load(entryToBox(yamlToEntry(tuneYml))).draw());

window.addEventListener('DOMContentLoaded', () => {
	editor.build(getContainer());
	graph.init(getContainer());
	if (domSelectTune !== null) {
		fillTunesList();
		tunesPath = 'tunes/';
	}
	loadTune(window.location.hash.substring(1) || DEFAULT_TUNE);
});

domSelectTune?.addEventListener('change', (event) => {
	loadTune((<HTMLSelectElement> event.target).value);
});
