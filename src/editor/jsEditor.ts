import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine }
	from '@codemirror/view';
import { solarizedDark } from '@uiw/codemirror-theme-solarized';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { Extension } from '@codemirror/state';
import { history, indentWithTab, historyKeymap } from '@codemirror/commands';

import { Entry } from '../model';
import entryToJs from '../exporters/jsExporter';

import AbstractEditor from './abstractEditor';
import { NotImplementedError } from '../errors';

type OnPlay = () => void;
type OnStop = () => void;
type OnUpdate = (content: string) => void;

type JsEditorConfig = {
	onPlay: OnPlay,
	onStop: OnStop,
	onUpdate: OnUpdate,
}

class JsEditor extends AbstractEditor {
	config: JsEditorConfig;

	private editorView: EditorView;

	private extensions: Extension = (() => [
		solarizedDark,
		javascriptLanguage,
		history(),
		lineNumbers(),
		drawSelection(),
		indentOnInput(),
		bracketMatching(),
		closeBrackets(),
		highlightActiveLine(),
		EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				this.config.onUpdate(update.state.doc.toString());
			}
		}),
		keymap.of([
			indentWithTab,
			...historyKeymap,
			{
				key: 'Ctrl-Enter',
				run: () => {
					this.config.onPlay();
					return false;
				},
			}, {
				key: 'Ctrl-.',
				run: () => {
					this.config.onStop();
					return false;
				},
			},
		]),
	])();

	constructor(config: JsEditorConfig) {
		super();
		this.config = config;
	}

	load(domEditor: HTMLElement) {
		if (this.editorView === undefined) {
			this.editorView = new EditorView({
				extensions: this.extensions,
				parent: domEditor,
			});
			this.getDom().style.setProperty('display', 'none', 'important');
		}
	}

	getDom(): HTMLElement {
		return this.editorView.contentDOM.parentElement?.parentElement as HTMLElement;
	}

	// eslint-disable-next-line class-methods-use-this
	public getContent(): Entry {
		throw new NotImplementedError('JsEditor.getContent()');
	}

	public getRawContent(): string {
		return this.editorView.state.doc.toString();
	}

	public setRawContent(yaml: string): void {
		this.editorView.dispatch({
			changes: {
				from: 0,
				to: this.editorView.state.doc.length,
				insert: yaml,
			},
		});
	}

	public setContent(entry: Entry): void {
		this.setRawContent(entryToJs(entry));
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

export default JsEditor;
