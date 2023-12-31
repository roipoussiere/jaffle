/* eslint-disable no-console */

import { Editor, NodeEditor, yamlToEntry, YamlEditor, JsEditor, Button, buttonUtils }
	from './jaffle';
import tunes from './tunes/_tuneIndex';
import StrudelRepl from './strudelRepl';
import Hydra from 'hydra-synth';


const PRELOADED_TUNE = 'amen_sister';

const editorConfig = {
	width: 800,
	height: 400,
	fontSize: 16,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onUpdate: () => {},
};

const PlayBtn: Button = {
	id: 'play',
	label: 'Play',
	tooltip: 'Play/update tune (Ctrl-Enter)',
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onClick: () => {},
};

const StopBtn: Button = {
	id: 'stop',
	label: 'Stop',
	tooltip: 'Stop tune (Ctrl-.)',
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onClick: () => {},
};

const ExamplesBtn: Button = {
	id: 'examples',
	label: 'Examples',
	tooltip: 'Load an example',
	onClick: () => {
		document.getElementById('jaffle-examples').style.display = 'block';
	},
};

const WebsiteBtn: Button = {
	id: 'website',
	label: 'Website',
	tooltip: 'Visit Jaffle website',
	onClick: () => { window.location.href = '/jaffle'; },
};

const AboutBtn: Button = {
	id: 'about',
	label: 'About',
	tooltip: 'Display project credits and license information',
	// eslint-disable-next-line no-alert
	onClick: () => alert(`Jaffle (editors, transpilers, website):
	- credits: Nathanaël Jourdane and contributors
	- license: AGPL-3.0 (https://www.gnu.org/licenses/agpl-3.0.txt)
	- source: https://github.com/roipoussiere/jaffle

Strudel (music code interpreter):
	- credits: Strudel contributors
	- license: AGPL-3.0 (https://www.gnu.org/licenses/agpl-3.0.txt)
	- source: https://github.com/tidalcycles/strudel

Pre-loaded sounds
	- piano:
	  - credits: Alexander Holm
	  - license: CC-by (http://creativecommons.org/licenses/by/3.0)
	  - source: https://archive.org/details/SalamanderGrandPianoV3
	- VCSL:
	  - credits: Versilian Studios LLC
	  - license: CC0 (https://creativecommons.org/publicdomain/zero/1.0/)
	  - source: https://github.com/sgossner/VCSL
	- Tidal drum machines:
	  - source: https://github.com/ritchse/tidal-drum-machines
	- EmuSP12:
	  - source: https://github.com/tidalcycles/Dirt-Samples
`),
};

const editors = [
	new NodeEditor({ hBoxGap: 3, vBoxGap: 0.5 }),
	new YamlEditor(),
	new JsEditor(),
];

const editor = new Editor(
	editorConfig,
	editors,
	[PlayBtn, StopBtn],
	[ExamplesBtn, WebsiteBtn, buttonUtils.ShortcutsBtn, AboutBtn],
);

const strudel = new StrudelRepl(
	(error) => {
		console.error(error);
		editor.errorBar.setError(error.message);
	},
	() => editor.errorBar.setError(),
);

const play = () => strudel.play(editor.getJs());
const stop = () => strudel.stop();

editor.buttons[0].onClick = play;
editor.buttons[1].onClick = stop;

strudel.init();

document.addEventListener('keydown', (event) => {
	if (event.ctrlKey && event.key === 'Enter') {
		play();
	}
	if (event.ctrlKey && event.key === '.') {
		stop();
	}
}, false);

function loadExample() {
	const tuneName = window.location.hash.substring(1);
	editor.setContent(yamlToEntry(tunes[tuneName] || tunes[PRELOADED_TUNE]));
	document.getElementById('jaffle-examples').style.display = 'none';
}

function addCanvas(domEditor: HTMLDivElement) {
	const domCanvas = document.createElement('canvas');
	domCanvas.id = 'test-canvas';
	domCanvas.width = domEditor.offsetWidth;
	domCanvas.height = domEditor.offsetHeight;
	domEditor.appendChild(domCanvas);
	return domCanvas;
}

window.addEventListener('hashchange', () => loadExample());
window.addEventListener('DOMContentLoaded', () => {
	const domEditor = document.getElementById('jaffle-editor') as HTMLDivElement;
	const domCanvas = addCanvas(domEditor);
	editor.build(domEditor, domEditor.classList.contains('jaffle-fs'));
	const exampleLinks = Object.keys(tunes).map((tune) => ({
		label: tune.replace(/_/g, ' '),
		url: `#${tune}`,
	}));
	domEditor.appendChild(buttonUtils.buildLinksCloud('jaffle-examples', exampleLinks));
	loadExample();

	new Hydra({
		canvas: domCanvas,
		detectAudio: false,
	});
});
