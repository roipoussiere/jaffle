import {
	EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine,
} from '@codemirror/view';
import { solarizedDark } from '@uiw/codemirror-theme-solarized';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport, bracketMatching } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { Extension } from '@codemirror/state';
import { history, indentWithTab, historyKeymap } from '@codemirror/commands';

type OnPlay = () => void
type OnStop = () => void

class JaffleEditor {
	public onPlay: OnPlay;

	public onStop: OnStop;

	private container: HTMLElement;

	private editor: EditorView;

	private style: CSSStyleSheet;

	private domErrorBar: HTMLParagraphElement;

	private extensions: Extension = (() => [
		solarizedDark,
		new LanguageSupport(StreamLanguage.define(yamlMode)),
		history(),
		lineNumbers(),
		drawSelection(),
		// indentOnInput(), // not working with yamlLang
		bracketMatching(),
		closeBrackets(),
		highlightActiveLine(),
		keymap.of([
			indentWithTab,
			...historyKeymap,
			{
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
	])();

	public build(container: HTMLElement) {
		this.container = container;
		this.container.classList.add('jaffle_container');
		this.buildEditor();
		this.buildTopBar();
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
			extensions: this.extensions,
			parent: this.container,
		});
	}

	private buildErrorBar(): void {
		this.domErrorBar = document.createElement('p');
		this.domErrorBar.id = 'jaffle_error';
		this.domErrorBar.style.display = 'none';

		this.container.appendChild(this.domErrorBar);
	}

	private buildTopBar(): void {
		const domTitle = document.createElement('p');
		domTitle.id = 'jaffle_title';
		domTitle.innerText = 'Jaffle - live coding in Yaml';

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

		const domTopBar = document.createElement('div');
		domTopBar.id = 'jaffle_topbar';
		domTopBar.appendChild(domTitle);
		domTopBar.appendChild(domBtnStop);
		domTopBar.appendChild(domBtnStart);

		this.container.appendChild(domTopBar);
	}

	private buildStyleSheet() {
		this.style = new CSSStyleSheet();
		this.style.replaceSync(`
		.jaffle_container {
			position: relative;
		}

		#jaffle_topbar {
			position: absolute;
			width: 100%;
			top: 0px;
			background-color: #0A813F;
			z-index: 6;
			height: 35px;
		}

		#jaffle_title {
			position: absolute;
			color: darkseagreen;
			margin: 9px;
			font-weight: bold;
		}

		.jaffle_btn {
			margin: 0;
			margin-left: 5px;
			cursor: pointer;
			width: 4em;
			height: 35px;
			float: right;
			background-color: darkseagreen;
			border: none;
			color: white;
			text-shadow: 1px 1px 2px black;
			font-weight: bold;
		}

		.jaffle_btn:hover {
			background-color: cadetblue;
		}

		#jaffle_error {
			display: block;
			position: absolute;
			bottom: 0;
			width: 92%;
			margin: 2%;
			padding: 2%;
			overflow: auto;
			max-height: 33%;
			background-color: darksalmon;
			border-radius: 3px;
			box-shadow: 0 0 7px black;
		}

		.cm-editor {
			padding-top: 35px;
			height: 100%
		}

		.cm-content {
			font-size: 15px;
		}

		#test-canvas {
			opacity: 0.5;
		}
		`);
		document.adoptedStyleSheets = [this.style];
	}
}

export default JaffleEditor;
