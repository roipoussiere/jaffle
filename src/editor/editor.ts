import { Box, Entry } from '../model';

import AbstractEditor from './abstractEditor';
import { EditorBar, Button, Tab } from './editorBar';
import ErrorBar from './errorBar';
import NodeEditor from './nodeEditor';
import YamlEditor from './yamlEditor';

type OnPlay = () => void;
type OnStop = () => void;
type OnUpdate = (content: unknown) => void

export default class Editor {
	container: HTMLElement;

	editorBar: EditorBar;

	errorBar: ErrorBar;

	editors: { [key: string]: AbstractEditor };

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

		this.editorBar = new EditorBar('Jaffle', tabs, buttons, 'yaml');
		this.editorBar.onTabSwitch = (tabId: string) => this.editors[tabId].build(this.container);
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
		};
	}

	public build(container: HTMLElement) {
		this.container = container;
		this.container.classList.add('jaffle-editor');

		this.editorBar.build(container);
		this.errorBar.build(container);
		Object.values(this.editors).forEach((editor) => editor.build(container));

		document.adoptedStyleSheets = [
			Editor.getStyle(),
			EditorBar.getStyle(),
			ErrorBar.getStyle(),
			YamlEditor.getStyle(),
		];
	}

	getContent(): Entry {
		return this.editors[this.editorBar.activeTabId].getContent();
	}

	static getStyle() {
		const style = new CSSStyleSheet();
		style.replaceSync(`
		.jaffle-editor {
			position: relative;
		}

		#test-canvas {
			opacity: 0.5;
		}`);
		return style;
	}
}
