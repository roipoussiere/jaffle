import { Entry, EMPTY_ENTRY } from '../model';
import { UndefError } from '../errors';
import { Box } from '../transpilers/graph/graphModel';
import entryToJs from '../transpilers/js/jsExporter';
import tunes from '../tunes/_tuneIndex';
import yamlToEntry from '../transpilers/yaml/yamlImporter';

import AbstractEditor from './editors/abstractEditor';
import { EditorBar, Button, MenuItem } from './widgets/editorBar';
import ErrorBar from './widgets/errorBar';
import NodeEditor from './editors/nodeEditor';
import YamlEditor from './editors/yamlEditor';
import JsEditor from './editors/jsEditor';

type OnPlay = () => void;
type OnStop = () => void;
type OnUpdate = (content: unknown) => void;

type EditorPartialConfig = {
	fullScreen: boolean,
};

export default class Editor {
	domContainer?: HTMLElement;

	editorBar: EditorBar;

	errorBar: ErrorBar;

	editors: Array<AbstractEditor>;

	content: Entry;

	onPlay: OnPlay;

	onStop: OnStop;

	onUpdate: OnUpdate;

	constructor() {
		this.content = EMPTY_ENTRY;

		/* eslint-disable @typescript-eslint/no-empty-function */
		this.onPlay = () => {};
		this.onStop = () => {};
		this.onUpdate = () => {};
		/* eslint-enable @typescript-eslint/no-empty-function */

		const buttons: Array<Button> = [{
			id: 'play',
			label: 'Play',
			tooltip: 'Play/update tune (Ctrl-Enter)',
			onClick: () => this.onPlay(),
		}, {
			id: 'stop',
			label: 'Stop',
			tooltip: 'Stop tune (Ctrl-.)',
			onClick: () => this.onStop(),
		}];

		const menu: Array<MenuItem> = [{
			id: 'website',
			label: 'Visit website',
			onClick: () => { window.location.href = '/jaffle'; },
		}];

		this.editors = [
			new NodeEditor({
				onUpdate: (content: Box) => this.onUpdate(content),
			}),
			new YamlEditor({
				onPlay: () => this.onPlay(),
				onStop: () => this.onStop(),
				onUpdate: (content: string) => this.onUpdate(content),
			}),
			new JsEditor({
				onPlay: () => this.onPlay(),
				onStop: () => this.onStop(),
				onUpdate: (content: string) => this.onUpdate(content),
			}),
		];

		this.editorBar = new EditorBar(
			'Jaffle',
			this.editors.map((editor) => editor.tab),
			buttons,
			menu,
			Object.keys(tunes),
			(example) => this.loadExample(example),
			'node',
		);

		this.editorBar.onTabSwitch = (oldTabId: string, newTabId: string) => {
			const oldEditor = this.getEditor(oldTabId);
			const newEditor = this.getEditor(newTabId);

			try {
				this.content = oldEditor.getContent();
			} catch {
				// eslint-disable-next-line no-console
				console.warn('Importing JS code is not yet implemented, loading last content.');
			}
			newEditor.setContent(this.content);

			oldEditor.getDom().style.setProperty('display', 'none', 'important');
			newEditor.getDom().style.display = 'block';
		};
		this.errorBar = new ErrorBar();
	}

	public loadExample(tuneExample: string): void {
		this.setContent(yamlToEntry(tunes[tuneExample]));
	}

	public getEditor(tabId: string): AbstractEditor {
		const editor = this.editors.find((_editor) => _editor.tab.id === tabId);
		if (editor === undefined) {
			throw new UndefError('editor');
		}
		return editor;
	}

	public getActiveEditor(): AbstractEditor {
		return this.getEditor(this.editorBar.activeTabId);
	}

	public build(container: HTMLElement, uiConfig?: EditorPartialConfig) {
		const _uiConfig = {
			width: uiConfig?.fullScreen ? 0 : 800,
			height: uiConfig?.fullScreen ? 0 : 400,
			fontSize: 16,
			hBoxGap: 3,
			vBoxGap: 0.5,
		};

		this.domContainer = container;
		this.domContainer.classList.add('jaffle-editor');

		this.editorBar.build(container);
		this.errorBar.build(container);
		this.editors.forEach((editor) => editor.load(container, _uiConfig));
		this.getActiveEditor().getDom().style.display = 'block';
		// this.getActiveEditor().setContent();

		document.adoptedStyleSheets = [
			Editor.getStyle(),
			EditorBar.getStyle(),
			ErrorBar.getStyle(),
			YamlEditor.getStyle(),
		];
	}

	setContent(content: Entry): void {
		this.getActiveEditor().setContent(content);
		this.content = content;
	}

	getContent(): Entry {
		this.content = this.getActiveEditor().getContent();
		return this.content;
	}

	getRawContent(): unknown {
		return this.getActiveEditor().getRawContent();
	}

	getJs(): string {
		if (this.editorBar.activeTabId === 'js') {
			return this.getRawContent() as string;
		}
		return entryToJs(this.getContent());
	}

	static getStyle() {
		const style = new CSSStyleSheet();
		style.replaceSync(`
		.jaffle-editor {
			position: relative;
			background-color: #002b36;
		}

		#test-canvas {
			opacity: 0.5;
		}`);
		return style;
	}
}
