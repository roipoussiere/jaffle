import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine }
	from '@codemirror/view';
import { solarizedDark } from '@uiw/codemirror-theme-solarized';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport, bracketMatching } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { Extension } from '@codemirror/state';
import { history, indentWithTab, historyKeymap } from '@codemirror/commands';

import { Entry } from '../model';
import entryToYaml from '../exporters/yamlExporter';
import yamlToEntry from '../importers/yamlImporter';

import { AbstractEditor, OnUpdate } from './abstractEditor';

type OnPlay = () => void;
type OnStop = () => void;

type YamlEditorConfig = {
	onPlay: OnPlay,
	onStop: OnStop,
	onUpdate: OnUpdate,
}

class YamlEditor extends AbstractEditor {
	config: YamlEditorConfig;

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
		super(config.onUpdate);
		this.config = config;
	}

	build(parentDom: HTMLElement) {
		this.editorView = new EditorView({
			extensions: this.extensions,
			parent: parentDom,
		});
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
