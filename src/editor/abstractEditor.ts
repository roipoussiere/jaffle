import { Entry } from '../model';

export type OnUpdate = (text: string) => void

export abstract class AbstractEditor {
	domContainer: HTMLElement;

	onUpdate: OnUpdate;

	constructor(onUpdate: OnUpdate) {
		this.onUpdate = onUpdate;
	}

	abstract build(domContainer: HTMLElement);

	abstract getContent(): Entry;

	abstract getRawContent(): unknown;

	abstract setContent(content: Entry): void;

	abstract setRawContent(content: unknown): void;
}

export default AbstractEditor;
