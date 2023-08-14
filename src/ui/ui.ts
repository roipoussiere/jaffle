import { Entry, EMPTY_ENTRY } from '../model';
import { UndefError } from '../errors';
import entryToJs from '../transpilers/js/jsExporter';
import tunes from '../tunes/_tuneIndex';
import yamlToEntry from '../transpilers/yaml/yamlImporter';

import { AbstractEditor, EditorConfig, DEFAULT_EDITOR_CONFIG } from './editors/abstractEditor';
import { EditorBar } from './widgets/editorBar';
import ErrorBar from './widgets/errorBar';
import YamlEditor from './editors/yamlEditor';
import { Button } from './widgets/buttons';

type OnPlay = () => void;
type OnStop = () => void;

export class Editor {
	editorConfig: EditorConfig;

	buttons: Array<Button>;

	menu: Array<Button>;

	domContainer?: HTMLElement;

	editorBar: EditorBar;

	errorBar: ErrorBar;

	editors: Array<AbstractEditor>;

	content: Entry;

	play: OnPlay;

	stop: OnStop;

	constructor(
		editorConfig: Partial<EditorConfig>,
		editors: Array<AbstractEditor>,
		buttons: Array<Button>, // todo: one array of buttons, with ButtonLocation enum
		menu: Array<Button>,
	) {
		this.editorConfig = { ...DEFAULT_EDITOR_CONFIG, ...editorConfig };
		this.editors = editors;
		this.buttons = buttons;
		this.menu = menu;
		this.content = EMPTY_ENTRY;
		this.play = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
		this.stop = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
		this.errorBar = new ErrorBar();
		this.editorBar = new EditorBar(
			'Jaffle',
			this.editors.map((editor) => editor.tab),
			buttons,
			menu,
			Object.keys(tunes),
			(example) => this.loadExample(example),
			'node',
		);

		this.addButtonsEvents();
		this.addKeyboardEvents();
	}

	loadExample(tuneExample: string): void {
		this.setContent(yamlToEntry(tunes[tuneExample]));
	}

	getEditor(tabId: string): AbstractEditor {
		const editor = this.editors.find((_editor) => _editor.tab.id === tabId);
		if (editor === undefined) {
			throw new UndefError('editor');
		}
		return editor;
	}

	getActiveEditor(): AbstractEditor {
		return this.getEditor(this.editorBar.activeTabId);
	}

	build(container: HTMLElement, fullScreen = false) {
		this.domContainer = container;
		this.domContainer.classList.add('jaffle-editor');

		this.editorBar.build(container);
		this.errorBar.build(container);

		if (fullScreen) {
			this.editorConfig.width = window.innerWidth;
			this.editorConfig.height = window.innerHeight;
		}

		this.editors.forEach((editor) => editor.load(container, this.editorConfig));
		this.getActiveEditor().getDom().style.display = 'block';
		// this.getActiveEditor().setContent();

		document.adoptedStyleSheets = [
			Editor.getStyle(),
			EditorBar.getStyle(),
			ErrorBar.getStyle(),
			YamlEditor.getStyle(),
		];
	}

	setContent(content: Entry): void {
		this.getActiveEditor().setContent(content);
		this.content = content;
	}

	getContent(): Entry {
		this.content = this.getActiveEditor().getContent();
		return this.content;
	}

	getRawContent(): unknown {
		return this.getActiveEditor().getRawContent();
	}

	getJs(): string {
		if (this.editorBar.activeTabId === 'js') {
			return this.getRawContent() as string;
		}
		return entryToJs(this.getContent());
	}

	private addButtonsEvents() {
		this.buttons.forEach((button, id) => {
			if (button.id === 'play') {
				this.buttons[id].onClick = () => this.play();
			} else if (button.id === 'stop') {
				this.buttons[id].onClick = () => this.stop();
			}
		});

		this.editorBar.onTabSwitch = (oldTabId: string, newTabId: string) => {
			const oldEditor = this.getEditor(oldTabId);
			const newEditor = this.getEditor(newTabId);

			try {
				this.content = oldEditor.getContent();
			} catch {
				// eslint-disable-next-line no-console
				console.warn('Importing JS code is not yet implemented, loading last content.');
			}
			newEditor.setContent(this.content);

			oldEditor.getDom().style.setProperty('display', 'none', 'important');
			newEditor.getDom().style.display = 'block';
		};
	}

	private addKeyboardEvents() {
		document.addEventListener('keydown', (event) => {
			if (event.ctrlKey && event.key === 'Enter') {
				this.play();
			}
			if (event.ctrlKey && event.key === '.') {
				this.stop();
			}
		}, false);
	}

	static getStyle() {
		const style = new CSSStyleSheet();
		style.replaceSync(`
		.jaffle-editor {
			position: relative;
			background-color: #002b36;
		}

		#test-canvas {
			opacity: 0.5;
		}`);
		return style;
	}
}

export default Editor;
