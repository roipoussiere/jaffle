/* eslint-disable no-console */

import { Editor } from './jaffle';
import StrudelRepl from './strudelRepl';

const editor = new Editor();
const strudel = new StrudelRepl(
	(error) => {
		console.error(error);
		editor.errorBar.setError(error.message);
	},
	() => editor.errorBar.setError(),
);
editor.onPlay = () => strudel.play(editor.getJs());
editor.onStop = () => strudel.stop();
strudel.init();

window.addEventListener('DOMContentLoaded', () => {
	const domEditor = document.getElementById('jaffle-editor') as HTMLDivElement;
	editor.build(domEditor, {
		fullScreen: domEditor.classList.contains('jaffle-fs'),
	});
	editor.loadExample('amen_sister');
});
