import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine }
	from '@codemirror/view';
import { solarizedDark } from '@uiw/codemirror-theme-solarized';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport, bracketMatching } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { Extension } from '@codemirror/state';
import { history, indentWithTab, historyKeymap } from '@codemirror/commands';

import AbstractEditor from './abstractEditor';

type OnPlay = () => void;
type OnStop = () => void;

class YamlEditor extends AbstractEditor {
	public _onPlay: OnPlay;

	public _onStop: OnStop;

	private editorView: EditorView;

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
				this._onUpdate(update.state.doc.toString());
			}
		}),
		keymap.of([
			indentWithTab,
			...historyKeymap,
			{
				key: 'Ctrl-Enter',
				run: () => {
					this._onPlay();
					return false;
				},
			}, {
				key: 'Ctrl-.',
				run: () => {
					this._onStop();
					return false;
				},
			},
		]),
	])();

	onPlay(onPlayFn: OnPlay) {
		this._onPlay = onPlayFn;
	}

	onStop(onStopFn: OnStop) {
		this._onStop = onStopFn;
	}

	build(parentDom: HTMLElement) {
		this.editorView = new EditorView({
			extensions: this.extensions,
			parent: parentDom,
		});
	}

	public getContent(): string {
		return this.editorView.state.doc.toString();
	}

	public setContent(text: string): void {
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

export default YamlEditor;
