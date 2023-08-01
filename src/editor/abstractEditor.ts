import { Entry } from '../model';

export type OnUpdate = (text: string) => void

export abstract class AbstractEditor {
	_onUpdate: OnUpdate;

	constructor(onUpdateFn: OnUpdate) {
		this._onUpdate = onUpdateFn;
	}

	abstract build(container: HTMLElement): void;

	abstract getContent(): Entry;

	abstract getRawContent(): unknown;

	abstract setContent(content: Entry): void;

	abstract setRawContent(content: unknown): void;
}

export default AbstractEditor;
