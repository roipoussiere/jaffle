import { OnPlay, OnStop } from './editor';

export default class EditorBar {
	dom: HTMLElement;

	constructor(onPlay: OnPlay, onStop: OnStop) {
		this.dom = document.createElement('div');
		this.dom.id = 'jaffle-editor-bar';

		this.dom.appendChild(EditorBar.buildTitle());
		this.dom.appendChild(EditorBar.buildStopButton(onStop));
		this.dom.appendChild(EditorBar.buildPlayButton(onPlay));
	}

	private static buildTitle(): HTMLParagraphElement {
		const domTitle = document.createElement('p');

		domTitle.id = 'jaffle-title';
		domTitle.innerText = 'Jaffle - live coding in Yaml';

		return domTitle;
	}

	private static buildPlayButton(onPlay: OnPlay): HTMLButtonElement {
		const domBtnStart = document.createElement('button');

		domBtnStart.id = 'jaffle-play';
		domBtnStart.className = 'jaffle-btn';
		domBtnStart.title = 'Play/update tune (Ctrl-Enter)';
		domBtnStart.innerText = 'Play';
		domBtnStart.addEventListener('click', onPlay);

		return domBtnStart;
	}

	private static buildStopButton(onStop: OnStop): HTMLButtonElement {
		const domBtnStop = document.createElement('button');

		domBtnStop.id = 'jaffle-stop';
		domBtnStop.className = 'jaffle-btn';
		domBtnStop.title = 'Stop tune (Ctrl-.)';
		domBtnStop.innerText = 'Stop';
		domBtnStop.addEventListener('click', onStop);

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
