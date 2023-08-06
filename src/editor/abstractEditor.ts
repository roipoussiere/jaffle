import { Entry } from '../model';

export type EditorUiConfig = {
	width: number,
	height: number,
	fontSize: number,
	hBoxGap: number,
	vBoxGap: number,
};

const DEFAULT_UI_CONFIG: EditorUiConfig = {
	width: 800,
	height: 600,
	fontSize: 16,
	hBoxGap: 3,
	vBoxGap: 1,
};

export abstract class AbstractEditor {
	domEditor: HTMLElement;

	uiConfig: EditorUiConfig;

	constructor() {
		this.domEditor = new HTMLElement();
		this.uiConfig = DEFAULT_UI_CONFIG;
	}

	load(domEditor: HTMLElement, uiConfig: EditorUiConfig): void {
		this.domEditor = domEditor;
		this.uiConfig = uiConfig;
		this.build();
	}

	abstract build(): void;

	abstract getDom(): HTMLElement;

	abstract getContent(): Entry;

	abstract getRawContent(): unknown;

	abstract setContent(content: Entry): void;

	abstract setRawContent(content: unknown): void;

	reload(): void {
		this.setContent(this.getContent());
	}
}

export default AbstractEditor;
