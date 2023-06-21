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
	public onPlay: OnPlay;

	public onStop: OnStop;

	private editor: EditorView;

	constructor() {
		this.editor = this.buildEditor();
	}

	private buildEditor(): EditorView {
		return new EditorView({
			extensions: [
				solarizedLight,
				yamlLang,
				keymap.of([{
					key: 'Ctrl-Enter',
					run: () => {
						this.onPlay(this);
						return false;
					},
				}, {
					key: 'Ctrl-.',
					run: () => {
						this.onStop(this);
						return false;
					},
				},
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
