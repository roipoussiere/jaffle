/* eslint-disable no-console */

import { PlayButton, StopButton, WebsiteButton } from './jaffle/ui/ui';
import { Editor } from './jaffle';
import StrudelRepl from './strudelRepl';

const editor = new Editor([PlayButton, StopButton], [WebsiteButton]);
const strudel = new StrudelRepl(
	(error) => {
		console.error(error);
		editor.errorBar.setError(error.message);
	},
	() => editor.errorBar.setError(),
);
editor.play = () => strudel.play(editor.getJs());
editor.stop = () => strudel.stop();
strudel.init();

window.addEventListener('DOMContentLoaded', () => {
	const domEditor = document.getElementById('jaffle-editor') as HTMLDivElement;
	editor.build(domEditor, {
		fullScreen: domEditor.classList.contains('jaffle-fs'),
	});
	editor.loadExample('amen_sister');
});
