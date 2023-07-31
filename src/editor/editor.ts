import EditorBar from './editorBar';
import ErrorBar from './errorBar';
import YamlEditor from './yamlEditor';

type OnPlay = () => void;
type OnStop = () => void;
type OnUpdate = (text: string) => void

export default class Editor {
	dom: HTMLElement;

	editorBar: EditorBar;

	errorBar: ErrorBar;

	yamlEditor: YamlEditor;

	_onPlay: OnPlay;

	_onStop: OnStop;

	_onUpdate: OnUpdate;

	constructor() {
		this.editorBar = new EditorBar();
		this.errorBar = new ErrorBar();

		this.yamlEditor = new YamlEditor();
	}

	public build(container: HTMLElement) {
		this.dom = container;
		this.dom.classList.add('jaffle-editor');

		this.editorBar.onPlay(this._onPlay);
		this.editorBar.onStop(this._onStop);
		this.editorBar.build(container);

		this.errorBar.build(container);

		this.yamlEditor.onPlay(this._onPlay);
		this.yamlEditor.onStop(this._onStop);
		this.yamlEditor.onUpdate(this._onUpdate);
		this.yamlEditor.build(container);

		document.adoptedStyleSheets = [
			Editor.getStyle(),
			EditorBar.getStyle(),
			ErrorBar.getStyle(),
			YamlEditor.getStyle(),
		];
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
