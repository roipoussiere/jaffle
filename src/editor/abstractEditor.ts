import { Entry } from '../model';

export abstract class AbstractEditor {
	domContainer: HTMLElement;

	abstract build(domContainer: HTMLElement): void;

	abstract getContent(): Entry;

	abstract getRawContent(): unknown;

	abstract setContent(content: Entry): void;

	abstract setRawContent(content: unknown): void;

	reload(): void {
		this.setContent(this.getContent());
	}
}

export default AbstractEditor;
