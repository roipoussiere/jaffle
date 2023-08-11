import { Entry, EMPTY_ENTRY } from '../model';
import { UndefError } from '../errors';
import entryToJs from '../transpilers/js/jsExporter';
import tunes from '../tunes/_tuneIndex';
import yamlToEntry from '../transpilers/yaml/yamlImporter';

import { AbstractEditor, EditorConfig, DEFAULT_EDITOR_CONFIG } from './editors/abstractEditor';
import { EditorBar, Button } from './widgets/editorBar';
import ErrorBar from './widgets/errorBar';
import YamlEditor from './editors/yamlEditor';

type OnPlay = () => void;
type OnStop = () => void;

export const PlayButton: Button = {
	id: 'play',
	label: 'Play',
	tooltip: 'Play/update tune (Ctrl-Enter)',
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onClick: () => {},
};

export const StopButton: Button = {
	id: 'stop',
	label: 'Stop',
	tooltip: 'Stop tune (Ctrl-.)',
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onClick: () => {},
};

export const WebsiteButton: Button = {
	id: 'website',
	label: 'Website',
	tooltip: 'Visit Jaffle website',
	onClick: () => { window.location.href = '/jaffle'; },
};

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

		// todo: move to EditorBar?
		this.buttons.forEach((button, id) => {
			if (button.id === 'play') {
				this.buttons[id].onClick = () => this.play();
			} else if (button.id === 'stop') {
				this.buttons[id].onClick = () => this.stop();
			}
		});

		// todo: move to dedicated method
		document.addEventListener('keydown', (event) => {
			if (event.ctrlKey && event.key === 'Enter') {
				this.play();
			}
			if (event.ctrlKey && event.key === '.') {
				this.stop();
			}
		}, false);

		this.content = EMPTY_ENTRY;

		/* eslint-disable @typescript-eslint/no-empty-function */
		this.play = () => {};
		this.stop = () => {};
		/* eslint-enable @typescript-eslint/no-empty-function */

		// todo: move to dedicated method
		this.editorBar = new EditorBar(
			'Jaffle',
			this.editors.map((editor) => editor.tab),
			buttons,
			menu,
			Object.keys(tunes),
			(example) => this.loadExample(example),
			'node',
		);
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
		this.errorBar = new ErrorBar();
	}

	public loadExample(tuneExample: string): void {
		this.setContent(yamlToEntry(tunes[tuneExample]));
	}

	public getEditor(tabId: string): AbstractEditor {
		const editor = this.editors.find((_editor) => _editor.tab.id === tabId);
		if (editor === undefined) {
			throw new UndefError('editor');
		}
		return editor;
	}

	public getActiveEditor(): AbstractEditor {
		return this.getEditor(this.editorBar.activeTabId);
	}

	public build(container: HTMLElement, fullScreen = false) {
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
