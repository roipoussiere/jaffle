import { EditorView, keymap } from '@codemirror/view';
import { solarizedLight } from '@uiw/codemirror-theme-solarized';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport } from '@codemirror/language';

const yamlLang = new LanguageSupport(StreamLanguage.define(yamlMode));

type OnPlay = () => void
type OnStop = () => void

class JaffleEditor {
	public onPlay: OnPlay;

	public onStop: OnStop;

	private container: HTMLElement;

	private editor: EditorView;

	private style: CSSStyleSheet;

	public build(container: HTMLElement) {
		this.container = container;
		this.container.className = 'jaffle_container';
		this.buildEditor();
		this.buildButtons();
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

	private buildEditor(): void {
		this.editor = new EditorView({
			extensions: [
				solarizedLight,
				yamlLang,
				keymap.of([{
					key: 'Ctrl-Enter',
					run: () => {
						this.onPlay();
						return false;
					},
				}, {
					key: 'Ctrl-.',
					run: () => {
						this.onStop();
						return false;
					},
				},
				]),
			],
			parent: this.container,
		});
	}

	private buildButtons(): void {
		const domBtnStart = document.createElement('button');
		domBtnStart.id = 'jaffle_play';
		domBtnStart.className = 'jaffle_btn';
		domBtnStart.title = 'Play/update tune (Ctrl-Enter)';
		domBtnStart.innerText = 'Play';
		domBtnStart.addEventListener('click', this.onPlay);

		const domBtnStop = document.createElement('button');
		domBtnStop.id = 'jaffle_stop';
		domBtnStop.className = 'jaffle_btn';
		domBtnStop.title = 'Stop tune (Ctrl-.)';
		domBtnStop.innerText = 'Stop';
		domBtnStop.addEventListener('click', this.onStop);

		const domButtons = document.createElement('div');
		domButtons.id = 'jaffle_buttons';
		domButtons.appendChild(domBtnStart);
		domButtons.appendChild(domBtnStop);

		this.container.appendChild(domButtons);
	}
}

export default JaffleEditor;
