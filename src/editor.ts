import { EditorView, keymap } from '@codemirror/view';
import { solarizedLight } from '@uiw/codemirror-theme-solarized';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport } from '@codemirror/language';

const yamlLang = new LanguageSupport(StreamLanguage.define(yamlMode));

// eslint-disable-next-line no-use-before-define
type OnPlay = (editor: JaffleEditor) => void
// eslint-disable-next-line no-use-before-define
type OnStop = (editor: JaffleEditor) => void

class JaffleEditor {
	private onPlay: OnPlay;

	private onStop: OnStop;

	private editor: EditorView;

	constructor(onPlay: OnPlay, onStop: OnStop) {
		this.onPlay = onPlay;
		this.onStop = onStop;
		this.editor = this.buildEditor();
	}

	private _onPlay(): boolean {
		this.onPlay(this);
		return false;
	}

	private _onStop(): boolean {
		this.onStop(this);
		return false;
	}

	private buildEditor(): EditorView {
		return new EditorView({
			extensions: [
				solarizedLight,
				yamlLang,
				keymap.of([
					{ key: 'Ctrl-Enter', run: this._onPlay },
					{ key: 'Ctrl-.', run: this._onStop },
				]),
			],
			parent: <HTMLElement> document.getElementById('input'),
		});
	}

	public getText(): string {
		return this.editor.contentDOM.innerText;
	}

	public setText(text: string): void {
		this.editor.dispatch({
			changes: {
				from: 0,
				to: this.editor.state.doc.length,
				insert: text,
			},
		});
	}
}

export default JaffleEditor;
