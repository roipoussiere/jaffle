import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine }
	from '@codemirror/view';
import { solarizedDark } from '@uiw/codemirror-theme-solarized';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { Extension } from '@codemirror/state';
import { history, indentWithTab, historyKeymap } from '@codemirror/commands';

import { Entry } from '../../model';
import { NotImplementedError } from '../../errors';
import entryToJs from '../../transpilers/js/jsExporter';

import AbstractEditor from './abstractEditor';
import { Tab } from '../widgets/editorBar';

type OnUpdate = (content: string) => void;

type JsEditorConfig = {
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
		keymap.of([indentWithTab, ...historyKeymap]),
	])();

	constructor(config: JsEditorConfig) {
		super();
		this.config = config;
	}

	// eslint-disable-next-line class-methods-use-this
	get tab(): Tab {
		return {
			id: 'js',
			label: 'JS',
			tooltip: 'Switch to JavaScript editor',
		};
	}

	build() {
		if (this.editorView === undefined) {
			this.editorView = new EditorView({
				extensions: this.extensions,
				parent: this.domEditor,
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
