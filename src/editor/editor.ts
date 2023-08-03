import { Box, Entry } from '../model';
import entryToJs from '../exporters/jsExporter';
import tunes from '../tunes/_tuneIndex';
import yamlToEntry from '../importers/yamlImporter';

import AbstractEditor from './abstractEditor';
import { EditorBar, Button, Tab, MenuItem } from './editorBar';
import ErrorBar from './errorBar';
import NodeEditor from './nodeEditor';
import YamlEditor from './yamlEditor';
import JsEditor from './jsEditor';

type OnPlay = () => void;
type OnStop = () => void;
type OnUpdate = (content: unknown) => void;

type EditorPartialConfig = {
	fullScreen: boolean,
};

export default class Editor {
	container: HTMLElement;

	editorBar: EditorBar;

	errorBar: ErrorBar;

	editors: { [key: string]: AbstractEditor };

	content: Entry;

	onPlay: OnPlay;

	onStop: OnStop;

	onUpdate: OnUpdate;

	constructor() {
		/* eslint-disable @typescript-eslint/no-empty-function */
		this.onPlay = () => {};
		this.onStop = () => {};
		this.onUpdate = () => {};
		/* eslint-enable @typescript-eslint/no-empty-function */

		const tabs: Array<Tab> = [{
			id: 'node',
			label: 'Node',
			tooltip: 'Switch to node editor',
		}, {
			id: 'yaml',
			label: 'Yaml',
			tooltip: 'Switch to yaml editor',
		}, {
			id: 'js',
			label: 'JS',
			tooltip: 'Switch to JavaScript editor',
		}];

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

		this.editorBar = new EditorBar(
			'Jaffle',
			tabs,
			buttons,
			menu,
			Object.keys(tunes),
			(example) => this.setContent(yamlToEntry(tunes[example])),
			'node',
		);

		this.editorBar.onTabSwitch = (oldTabId: string, newTabId: string) => {
			try {
				this.content = this.editors[oldTabId].getContent();
			} catch {
				// eslint-disable-next-line no-console
				console.warn('Importing JS code is not yet implemented, loading last content.');
			}
			this.editors[newTabId].setContent(this.content);

			this.editors[oldTabId].getDom().style.setProperty('display', 'none', 'important');
			this.editors[newTabId].getDom().style.display = 'block';
		};
		this.errorBar = new ErrorBar();

		this.editors = {
			yaml: new YamlEditor({
				onPlay: () => this.onPlay(),
				onStop: () => this.onStop(),
				onUpdate: (content: string) => this.onUpdate(content),
			}),
			node: new NodeEditor({
				onUpdate: (content: Box) => this.onUpdate(content),
			}),
			js: new JsEditor({
				onPlay: () => this.onPlay(),
				onStop: () => this.onStop(),
				onUpdate: (content: string) => this.onUpdate(content),
			}),
		};
	}

	public loadExample(tuneExample: string): void {
		this.setContent(yamlToEntry(tunes[tuneExample]));
	}

	public getActiveEditor(): AbstractEditor {
		return this.editors[this.editorBar.activeTabId];
	}

	public build(container: HTMLElement, uiConfig?: EditorPartialConfig) {
		const _uiConfig = {
			width: uiConfig?.fullScreen ? 0 : 800,
			height: uiConfig?.fullScreen ? 0 : 400,
			fontSize: 16,
			hBoxGap: 3,
			vBoxGap: 0.5,
		};

		this.container = container;
		this.container.classList.add('jaffle-editor');

		this.editorBar.build(container);
		this.errorBar.build(container);
		Object.values(this.editors).forEach((editor) => editor.load(container, _uiConfig));
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
		this.editors[this.editorBar.activeTabId].setContent(content);
		this.content = content;
	}

	getContent(): Entry {
		this.content = this.editors[this.editorBar.activeTabId].getContent();
		return this.content;
	}

	getRawContent(): unknown {
		return this.editors[this.editorBar.activeTabId].getRawContent();
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
