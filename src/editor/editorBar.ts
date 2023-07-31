type OnButtonClick = () => void;

type ButtonConfig = {
	id: string,
	label: string,
	tooltip: string,
}

export default class EditorBar {
	dom: HTMLElement;

	_onPlay: OnButtonClick;

	_onStop: OnButtonClick;

	build(container: HTMLElement) {
		this.dom = document.createElement('div');

		this.dom.id = 'jaffle-editor-bar';
		this.dom.appendChild(EditorBar.buildTitle());
		this.dom.appendChild(EditorBar.buildStopButton(this._onStop));
		this.dom.appendChild(EditorBar.buildPlayButton(this._onPlay));

		container.appendChild(this.dom);
	}

	onPlay(onPlayFn: OnButtonClick) {
		this._onPlay = onPlayFn;
	}

	onStop(onStopFn: OnButtonClick) {
		this._onStop = onStopFn;
	}

	private static buildTitle(): HTMLParagraphElement {
		const domTitle = document.createElement('p');

		domTitle.id = 'jaffle-title';
		domTitle.innerText = 'Jaffle - live coding in Yaml';

		return domTitle;
	}

	private static buildPlayButton(onClick: OnButtonClick): HTMLButtonElement {
		return EditorBar.buildButton(onClick, {
			id: 'jaffle-play',
			label: 'Play',
			tooltip: 'Play/update tune (Ctrl-Enter)',
		});
	}

	private static buildStopButton(onClick: OnButtonClick): HTMLButtonElement {
		return EditorBar.buildButton(onClick, {
			id: 'jaffle-stop',
			label: 'Stop',
			tooltip: 'Stop tune (Ctrl-.)',
		});
	}

	private static buildButton(onClick: OnButtonClick, config: ButtonConfig): HTMLButtonElement {
		const domBtnStop = document.createElement('button');

		domBtnStop.id = config.id;
		domBtnStop.className = 'jaffle-btn';
		domBtnStop.title = config.tooltip;
		domBtnStop.innerText = config.label;
		domBtnStop.addEventListener('click', onClick);

		return domBtnStop;
	}

	static getStyle(): CSSStyleSheet {
		const style = new CSSStyleSheet();
		style.replaceSync(`		
			#jaffle-editor-bar {
				position: absolute;
				width: 100%;
				top: 0px;
				background-color: #0A813F;
				z-index: 6;
				height: 35px;
			}
	
			#jaffle-title {
				position: absolute;
				color: darkseagreen;
				margin: 9px;
				font-weight: bold;
			}
	
			.jaffle-btn {
				margin: 0;
				margin-left: 5px;
				cursor: pointer;
				width: 4em;
				height: 35px;
				float: right;
				background-color: darkseagreen;
				border: none;
				color: white;
				text-shadow: 1px 1px 2px black;
				font-weight: bold;
			}
	
			.jaffle-btn:hover {
				background-color: cadetblue;
			}`);
		return style;
	}
}
