type OnUpdate = (text: string) => void

export default abstract class AbstractEditor {
	_onUpdate: OnUpdate;

	onUpdate(onUpdateFn: OnUpdate) {
		this._onUpdate = onUpdateFn;
	}

	abstract build(container: HTMLElement): void;

	abstract getContent(): unknown;

	abstract setContent(content: unknown): void;
}
