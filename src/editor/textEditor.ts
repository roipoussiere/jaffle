import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine }
	from '@codemirror/view';
import { solarizedDark } from '@uiw/codemirror-theme-solarized';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport, bracketMatching } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { Extension } from '@codemirror/state';
import { history, indentWithTab, historyKeymap } from '@codemirror/commands';

import { buildTopBar, getStyleSheet } from './editorBar';
import { OnPlay, OnStop } from './editor';

type OnUpdate = (text: string) => void

class JaffleEditor {
	public onPlay: OnPlay;

	public onStop: OnStop;

	public onUpdate: OnUpdate;

	private editorView: EditorView;

	private style: CSSStyleSheet;

	private domContainer: HTMLElement;

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
		EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				this.onUpdate(update.state.doc.toString());
			}
		}),
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
		this.domContainer = container;
		this.domContainer.classList.add('jaffle_container');
		this.buildEditor();
		this.domContainer.appendChild(buildTopBar(this.onPlay, this.onStop));
		this.buildErrorBar();
		this.buildStyleSheet();
	}

	public getText(): string {
		return this.editorView.state.doc.toString();
	}

	public setText(text: string): void {
		this.editorView.dispatch({
			changes: {
				from: 0,
				to: this.editorView.state.doc.length,
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
		this.editorView = new EditorView({
			extensions: this.extensions,
			parent: this.domContainer,
		});
	}

	private buildErrorBar(): void {
		this.domErrorBar = document.createElement('p');
		this.domErrorBar.id = 'jaffle_error';
		this.domErrorBar.style.display = 'none';

		this.domContainer.appendChild(this.domErrorBar);
	}

	private buildStyleSheet() {
		this.style = new CSSStyleSheet();
		this.style.replaceSync(`
		.jaffle_container {
			position: relative;
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
			height: 100%;
		}

		.cm-content {
			font-size: 15px;
		}

		#test-canvas {
			opacity: 0.5;
		}

		${getStyleSheet()}`);
		document.adoptedStyleSheets = [this.style];
	}
}

export default JaffleEditor;
