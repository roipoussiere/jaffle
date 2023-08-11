import { UndefError } from '../../errors';
import { Entry } from '../../model';
import { Tab } from '../widgets/editorBar';

export type EditorConfig = {
	width: number,
	height: number,
	fontSize: number,
	onUpdate: (content: unknown) => void,
};

export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
	width: 800,
	height: 600,
	fontSize: 16,
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onUpdate: () => {},
};

export abstract class AbstractEditor {
	config: EditorConfig;

	private _domEditor?: HTMLElement;

	constructor() {
		this.config = DEFAULT_EDITOR_CONFIG;
	}

	abstract get tab(): Tab;

	get domEditor() { return this._domEditor || (function t() { throw new UndefError(); }()); }

	load(domEditor: HTMLElement, config: EditorConfig): void {
		this._domEditor = domEditor;
		this.config = config;
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
