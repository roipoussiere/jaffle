import { EditorView, keymap } from '@codemirror/view';
import { solarizedDark } from '@uiw/codemirror-theme-solarized';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport } from '@codemirror/language';

const yamlLang = new LanguageSupport(StreamLanguage.define(yamlMode));

type OnPlay = () => void
type OnStop = () => void

class JaffleEditor {
	public onPlay: OnPlay;

	public onStop: OnStop;

	private container: HTMLElement;

	private editor: EditorView;

	private style: CSSStyleSheet;

	private domErrorBar: HTMLParagraphElement;

	public build(container: HTMLElement) {
		this.container = container;
		this.container.className = 'jaffle_container';
		this.buildEditor();
		this.buildButtons();
		this.buildErrorBar();
		this.buildStyleSheet();
	}

	public getText(): string {
		return this.editor.state.doc.toString();
	}

	public setText(text: string): void {
		this.editor.dispatch({
			changes: {
				from: 0,
				to: this.editor.state.doc.length,
				insert: text,
			},
		});
	}

	public setError(text?: string): void {
		if (text === undefined) {
			this.domErrorBar.innerText = '';
			this.domErrorBar.style.display = 'none';
		} else {
			this.domErrorBar.innerText = text;
			this.domErrorBar.style.display = 'block';
		}
	}

	private buildEditor(): void {
		this.editor = new EditorView({
			extensions: [
				solarizedDark,
				yamlLang,
				keymap.of([{
					key: 'Ctrl-Enter',
					run: () => {
						this.onPlay();
						return false;
					},
				}, {
					key: 'Ctrl-.',
					run: () => {
						this.onStop();
						return false;
					},
				},
				]),
			],
			parent: this.container,
		});
	}

	private buildErrorBar(): void {
		this.domErrorBar = document.createElement('p');
		this.domErrorBar.id = 'jaffle_error';
		this.domErrorBar.style.display = 'none';

		this.container.appendChild(this.domErrorBar);
	}

	private buildButtons(): void {
		const domBtnStart = document.createElement('button');
		domBtnStart.id = 'jaffle_play';
		domBtnStart.className = 'jaffle_btn';
		domBtnStart.title = 'Play/update tune (Ctrl-Enter)';
		domBtnStart.innerText = 'Play';
		domBtnStart.addEventListener('click', this.onPlay);

		const domBtnStop = document.createElement('button');
		domBtnStop.id = 'jaffle_stop';
		domBtnStop.className = 'jaffle_btn';
		domBtnStop.title = 'Stop tune (Ctrl-.)';
		domBtnStop.innerText = 'Stop';
		domBtnStop.addEventListener('click', this.onStop);

		const domButtons = document.createElement('div');
		domButtons.id = 'jaffle_buttons';
		domButtons.appendChild(domBtnStop);
		domButtons.appendChild(domBtnStart);

		this.container.appendChild(domButtons);
	}

	private buildStyleSheet() {
		this.style = new CSSStyleSheet();
		this.style.replaceSync(`
		.jaffle_container {
			position: relative;
		}

		#jaffle_buttons {
			position: absolute;
			top: 10px;
			right: 10px;
			z-index: 6;
		}

		#jaffle_error {
			display: block;
			position: absolute;
			bottom: 0;
			left: 0;
			width: 92%;
			margin: 2%;
			padding: 2%;
			overflow: auto;
			max-height: 33%;
			background-color: darksalmon;
			border-radius: 3px;
			box-shadow: 0 0 7px black;
		}

		.jaffle_btn {
			margin: 5px;
			cursor: pointer;
			width: 4em;
			height: 3em;
			float: right;
			border-radius: 5px;
			background-color: darkolivegreen;
			border: none;
			color: white;
		}

		.jaffle_btn:hover {
			background-color: darkcyan;
		}

		.cm-editor {
			height: 100%
		}

		.cm-content {
			font-size: 15.5px;
		}

		#test-canvas {
			opacity: 0.5;
		}
		`);
		document.adoptedStyleSheets = [this.style];
	}
}

export default JaffleEditor;
