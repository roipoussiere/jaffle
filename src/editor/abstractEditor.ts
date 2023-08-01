import { Entry } from '../model';

export abstract class AbstractEditor {
	abstract build(domEditor: HTMLElement): void;

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
