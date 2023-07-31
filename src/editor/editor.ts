import EditorBar from './editorBar';
import ErrorBar from './errorBar';
import TextEditor from './textEditor';

export type OnPlay = () => void;
export type OnStop = () => void;
export type OnUpdate = (text: string) => void

export default class Editor {
	onPlay: OnPlay;

	onStop: OnStop;

	onUpdate: OnUpdate;

	dom: HTMLElement;

	editorBar: EditorBar;

	errorBar: ErrorBar;

	textEditor: TextEditor;

	public build(container: HTMLElement) {
		this.dom = container;

		this.editorBar = new EditorBar(this.onPlay, this.onStop);
		this.errorBar = new ErrorBar();
		this.textEditor = new TextEditor(this.dom, this.onPlay, this.onStop, this.onUpdate);

		this.dom.classList.add('jaffle-editor');

		this.dom.appendChild(this.editorBar.dom);
		this.dom.appendChild(this.errorBar.dom);

		document.adoptedStyleSheets = [
			Editor.getStyle(),
			EditorBar.getStyle(),
			ErrorBar.getStyle(),
			TextEditor.getStyle(),
		];
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
