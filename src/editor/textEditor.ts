import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine }
	from '@codemirror/view';
import { solarizedDark } from '@uiw/codemirror-theme-solarized';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport, bracketMatching } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { Extension } from '@codemirror/state';
import { history, indentWithTab, historyKeymap } from '@codemirror/commands';

import { buildTopBar, getEditorBarCSS } from './editorBar';
import { buildErrorBar, getErrorBarCSS } from './errorBar';
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
		this.domErrorBar = buildErrorBar();
		this.domContainer.appendChild(this.domErrorBar);
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

	private buildStyleSheet() {
		this.style = new CSSStyleSheet();
		this.style.replaceSync(`
			.jaffle_container {
				position: relative;
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

			${getEditorBarCSS()}
			${getErrorBarCSS()}
			`);
		document.adoptedStyleSheets = [this.style];
	}
}

export default JaffleEditor;
