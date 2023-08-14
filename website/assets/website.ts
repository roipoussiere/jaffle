/* eslint-disable no-console */

import { Editor, NodeEditor, YamlEditor, JsEditor, PlayBtn, StopBtn, WebsiteBtn, ShortcutsBtn }
	from './jaffle';

import StrudelRepl from './strudelRepl';

const editorConfig = {
	width: 800,
	height: 400,
	fontSize: 16,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onUpdate: () => {},
};

const editors = [
	new NodeEditor({ hBoxGap: 3, vBoxGap: 0.5 }),
	new YamlEditor(),
	new JsEditor(),
];

const editor = new Editor(editorConfig, editors, [PlayBtn, StopBtn], [WebsiteBtn, ShortcutsBtn]);

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
	editor.build(domEditor, domEditor.classList.contains('jaffle-fs'));
	editor.loadExample('amen_sister');
});
