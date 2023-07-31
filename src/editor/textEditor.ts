import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine }
	from '@codemirror/view';
import { solarizedDark } from '@uiw/codemirror-theme-solarized';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport, bracketMatching } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { Extension } from '@codemirror/state';
import { history, indentWithTab, historyKeymap } from '@codemirror/commands';

import { OnPlay, OnStop, OnUpdate } from './editor';

class TextEditor {
	public onPlay: OnPlay;

	public onStop: OnStop;

	public onUpdate: OnUpdate;

	private editorView: EditorView;

	private style: string;

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

	constructor(parentDom: HTMLElement, onPlay: OnPlay, onStop: OnStop, onUpdate: OnUpdate) {
		this.onPlay = onPlay;
		this.onStop = onStop;
		this.onUpdate = onUpdate;

		this.editorView = new EditorView({
			extensions: this.extensions,
			parent: parentDom,
		});
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

	static getStyle(): CSSStyleSheet {
		const style = new CSSStyleSheet();
		style.replaceSync(`
			.cm-editor {
				padding-top: 35px;
				height: 100%;
			}

			.cm-content {
				font-size: 15px;
			}`);
		return style;
	}
}

export default TextEditor;
