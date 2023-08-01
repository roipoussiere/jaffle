import { Entry } from '../model';
import AbstractEditor from './abstractEditor';
import { EditorBar, Button, Tab } from './editorBar';
import ErrorBar from './errorBar';
import YamlEditor from './yamlEditor';

type OnPlay = () => void;
type OnStop = () => void;
type OnUpdate = (text: string) => void

export default class Editor {
	dom: HTMLElement;

	editorBar: EditorBar;

	errorBar: ErrorBar;

	editors: { [key: string]: AbstractEditor };

	_onPlay: OnPlay;

	_onStop: OnStop;

	_onUpdate: OnUpdate;

	constructor() {
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
			onClick: () => this._onPlay(),
		}, {
			id: 'stop',
			label: 'Stop',
			tooltip: 'Stop tune (Ctrl-.)',
			onClick: () => this._onStop(),
		}];

		this.editorBar = new EditorBar('Jaffle', tabs, buttons);
		this.errorBar = new ErrorBar();

		this.editors = {
			yaml: new YamlEditor({
				onPlay: () => this._onPlay(),
				onStop: () => this._onStop(),
				onUpdate: (content: string) => this._onUpdate(content),
			}),
		};
	}

	public build(container: HTMLElement) {
		this.dom = container;
		this.dom.classList.add('jaffle-editor');

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
		// return this.editors[this.editorBar.activeTabId].getContent();
		return this.editors.yaml.getContent();
	}

	onPlay(onPlayFn: OnPlay) {
		this._onPlay = onPlayFn;
	}

	onStop(onStopFn: OnStop) {
		this._onStop = onStopFn;
	}

	onUpdate(onUpdateFn: OnUpdate) {
		this._onUpdate = onUpdateFn;
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
