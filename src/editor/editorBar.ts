type OnButtonClick = () => void;

type Button = {
	id: string,
	label: string,
	tooltip: string,
	onClick: OnButtonClick,
}

export default class EditorBar {
	dom: HTMLElement;

	domTitle: HTMLParagraphElement;

	buttons: Array<Button>;

	constructor() {
		this.buttons = [];
	}

	addButton(button: Button) {
		this.buttons.unshift(button);
	}

	build(container: HTMLElement) {
		this.dom = document.createElement('div');
		this.dom.id = 'jaffle-editor-bar';

		this.buildTitle();
		this.buttons.forEach((button) => this.buildButton(button));

		container.appendChild(this.dom);
	}

	setTitle(title: string): void {
		this.domTitle.innerText = title;
	}

	private buildTitle(): void {
		this.domTitle = document.createElement('p');
		this.domTitle.id = 'jaffle-title';

		this.dom.appendChild(this.domTitle);
	}

	private buildButton(button: Button): void {
		const domButton = document.createElement('button');

		domButton.id = button.id;
		domButton.className = 'jaffle-btn';
		domButton.title = button.tooltip;
		domButton.innerText = button.label;
		domButton.addEventListener('click', button.onClick);

		this.dom.appendChild(domButton);
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
