import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine, ViewUpdate }
	from '@codemirror/view';
import { solarizedDark } from '@uiw/codemirror-theme-solarized';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport, bracketMatching } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { Extension } from '@codemirror/state';
import { history, indentWithTab, historyKeymap } from '@codemirror/commands';

import { Entry } from '../../model';
import { UndefError } from '../../errors';
import entryToYaml from '../../transpilers/yaml/yamlExporter';
import yamlToEntry from '../../transpilers/yaml/yamlImporter';

import AbstractEditor from './abstractEditor';
import { Tab } from '../widgets/editorBar';

type OnPlay = () => void;
type OnStop = () => void;
type OnUpdate = (content: string) => void;

type YamlEditorConfig = {
	onPlay: OnPlay,
	onStop: OnStop,
	onUpdate: OnUpdate,
}

class YamlEditor extends AbstractEditor {
	config: YamlEditorConfig;

	private _editorView?: EditorView;

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
		EditorView.updateListener.of((update: ViewUpdate) => {
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

	constructor(config: YamlEditorConfig) {
		super();
		this.config = config;
	}

	// eslint-disable-next-line class-methods-use-this
	get tab(): Tab {
		return {
			id: 'yaml',
			label: 'Yaml',
			tooltip: 'Switch to yaml editor',
		};
	}

	get editorView() { return this._editorView || (function t() { throw new UndefError(); }()); }

	build() {
		if (this._editorView === undefined) {
			this._editorView = new EditorView({
				extensions: this.extensions,
				parent: this.domEditor,
			});
			this.getDom().style.setProperty('display', 'none', 'important');
		}
	}

	getDom(): HTMLElement {
		return this.editorView.contentDOM.parentElement?.parentElement as HTMLElement;
	}

	public getContent(): Entry {
		return yamlToEntry(this.getRawContent());
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
		this.setRawContent(entryToYaml(entry));
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
